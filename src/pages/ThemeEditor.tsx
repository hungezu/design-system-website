import { ThemeSizingEditor } from '../components/ThemeSizingEditor';
import { captureModePalette, changedThemeFields, densitySettings, effectivePreset, themeEditorError, themeFieldLabels, formatThemeValue, themePresets as presets, type ModePalette } from '../services/theme-editor-model';
import { useUnsavedChanges } from '../examples/useUnsavedChanges';
import { ApiError } from '../services/workspace-api';
import { resolveProjectTheme } from '../services/theme-resolver';
import { useFrozenTheme } from '../services/use-frozen-theme';
import { brandWhiteContrastRatio } from '../services/project-theme';
import { Clipboard, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useProject } from "../app/project-context";
import { PageHeader } from "../components/PageHeader";
import { SegmentedControl } from "../components/NavigationControls";
import { ThemePreview } from "../components/ThemePreview";
import { AppSelect } from "../components/AppSelect";
import { DSButton, DSCheckbox } from "../runtime";
import {
  baselineThemeSettings,
  deriveBrandPalette,
  loadProjectTheme,
  projectThemeStorageKey,
  projectPreviewVariables,
  PROJECT_THEME_MODE_VALUES,
  PROJECT_THEME_SHADOWS,
  type ProjectThemeSettings,
} from "../services/project-theme";
import { isDraftVersion } from "../services/release-catalog";

function ColorField({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [validColor, setValidColor] = useState(/^#[0-9a-f]{6}$/i.test(value) ? value : baselineThemeSettings.brandPrimary);
  useEffect(() => { if (/^#[0-9a-f]{6}$/i.test(value)) setValidColor(value); }, [value]);
  return (
    <label className="theme-color-field">
      <span>{label}</span>
      <span>
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : validColor}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          aria-label={`${label}色值`}
          aria-invalid={!/^#[0-9a-f]{6}$/i.test(value)}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

function PaletteGroup({ title, items }: { title: string; items: Array<{ label: string; value: string }> }) {
  return <section className="theme-palette-group">
    <h3>{title}</h3>
    <div>{items.map((item) => <div className="theme-palette-token" key={item.label}>
      <span className="theme-palette-swatch" style={{ background: item.value }} aria-hidden="true" />
      <span><strong>{item.label}</strong><code>{item.value.toUpperCase()}</code></span>
    </div>)}</div>
  </section>
}

export function ThemeEditor() {
  const [params] = useSearchParams();
  const {
    project,
    projectTheme,
    saveProjectTheme,
    restoreProjectTheme,
    reloadProjectTheme,
    release,
  } = useProject();
  const [draft, setDraft] = useState(projectTheme);
  const [savedSnapshot, setSavedSnapshot] = useState(projectTheme);
  const initialPreview: "components" | "page" = params.get("preview") === "page" ? "page" : "components";
  const initialConfig = params.get("config");
  const [preview, setPreviewState] = useState<"components" | "page">(initialPreview);
  const [configSection, setConfigSectionState] = useState<"basic" | "color" | "type" | "shape">(
    initialConfig === "color" || initialConfig === "type" || initialConfig === "shape" ? initialConfig : "basic",
  );
  const [feedback, setFeedback] = useState("");
  const [previewSaved, setPreviewSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [conflict, setConflict] = useState(false);
  const savingLock = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const palettes = useRef<Partial<Record<ProjectThemeSettings['mode'],ModePalette>>>({[projectTheme.mode]:captureModePalette(projectTheme)});
  const [validPreview, setValidPreview] = useState(projectTheme);
  const previousProjectId = useRef(project.id);
  const requestedVersion = params.get("version");
  const urlPreview: "components" | "page" = params.get("preview") === "page" ? "page" : "components";
  const requestedConfig = params.get("config");
  const urlConfig: "basic" | "color" | "type" | "shape" = requestedConfig === "color" || requestedConfig === "type" || requestedConfig === "shape" ? requestedConfig : "basic";
  const isHistorical = Boolean(requestedVersion && !isDraftVersion(requestedVersion));
  const changedFields = changedThemeFields(draft, savedSnapshot);
  const dirty = changedFields.length > 0;
  const validationError = themeEditorError(draft);
  const selectedPreset = effectivePreset(draft);
  useUnsavedChanges(dirty && !isHistorical);
  useEffect(() => { if (!validationError) setValidPreview(draft); }, [draft, validationError]);

  useEffect(() => {
    if (previousProjectId.current === project.id) return;
    previousProjectId.current = project.id;
    setDraft(projectTheme);
    setSavedSnapshot(projectTheme);
    setValidPreview(projectTheme);
    palettes.current = {[projectTheme.mode]:captureModePalette(projectTheme)};
    setFeedback(""); setConflict(false);
  }, [project.id, projectTheme]);

  useEffect(() => {
    setPreviewState(urlPreview);
    setConfigSectionState(urlConfig);
  }, [urlConfig, urlPreview]);

  const frozen = useFrozenTheme(isHistorical);

  const patch = (next: Partial<ProjectThemeSettings>) => {
    if (!isHistorical && !savingLock.current) {
      setDraft((current) => ({ ...current, ...next }));
      setFeedback(""); setPreviewSaved(false);
    }
  };
  const updateBrandPrimary = (value: string) => {
    const derived = deriveBrandPalette(value);
    patch({ brandPrimary: value, ...(derived ?? {}) });
  };
  const setPreview = (value: "components" | "page") => {
    setPreviewState(value);
  };
  const setConfigSection = (value: "basic" | "color" | "type" | "shape") => {
    setConfigSectionState(value);
  };
  const save = async () => {
    if (savingLock.current || isHistorical || !dirty || validationError || conflict) return;
    const submitted = {...draft};
    savingLock.current = true; setSaving(true);
    try {
      await saveProjectTheme(submitted);
      if (alive.current) { setSavedSnapshot(submitted); setPreviewSaved(false); setFeedback('主题已保存。项目成员可以读取；前端交付需另行发布版本。'); }
    } catch (error) {
      if (alive.current) { setConflict(error instanceof ApiError && error.status === 409); setFeedback(error instanceof Error ? `${error.message} 编辑内容已保留。` : '保存失败，编辑内容已保留，请重试。'); }
    } finally { savingLock.current = false; if (alive.current) setSaving(false); }
  };
  const restore = () => {
    setDraft(savedSnapshot); setValidPreview(savedSnapshot); setPreviewSaved(false);
    palettes.current = {[savedSnapshot.mode]:captureModePalette(savedSnapshot)};
    setFeedback('已撤销本次修改，恢复本次编辑会话中最近保存的主题。');
  };
  const reloadServer = async () => {
    if (savingLock.current) return;
    savingLock.current = true; setSaving(true);
    try {
      const saved = reloadProjectTheme ? await reloadProjectTheme() : restoreProjectTheme();
      if (alive.current) { setDraft(saved); setSavedSnapshot(saved); setValidPreview(saved); setPreviewSaved(false); setConflict(false); palettes.current = {[saved.mode]:captureModePalette(saved)}; setFeedback('已读取服务器最新主题，可以继续编辑。'); }
    } catch (error) { if (alive.current) setFeedback(error instanceof Error ? error.message : '读取失败，编辑内容已保留。'); }
    finally { savingLock.current = false; if (alive.current) setSaving(false); }
  };
  const changeMode = (mode: ProjectThemeSettings['mode']) => {
    if (validationError) return;
    palettes.current[draft.mode] = captureModePalette(draft);
    patch({mode,...(palettes.current[mode] ?? captureModePalette({...draft,...PROJECT_THEME_MODE_VALUES[mode]}))});
  };
  const copyCss = async () => {
    if ((!isHistorical && validationError) || (isHistorical && frozen.css === undefined)) return;
    const css = isHistorical ? frozen.css! : `:root {\n${Object.entries(projectPreviewVariables(draft, resolveProjectTheme(project)))
      .filter(([key]) => key.startsWith("--"))
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n")}\n}`;
    try {
      await navigator.clipboard.writeText(css);
      setFeedback("主题 CSS 已复制。");
    } catch {
      setFeedback("剪贴板不可用，请在开发详情中手动复制。");
    }
  };
  const previewStyle = useMemo(
    () =>
      isHistorical
        ? frozen.style ?? {}
        : projectPreviewVariables(previewSaved ? savedSnapshot : validPreview, resolveProjectTheme(project)),
    [validPreview, previewSaved, savedSnapshot, isHistorical, frozen.style, project],
  );
  const draftVariables = useMemo(
    () => projectPreviewVariables(draft, resolveProjectTheme(project)),
    [draft, project],
  );
  const buttonOverrideEnabled = draft.buttonPrimaryBackground !== undefined || draft.buttonPrimaryText !== undefined;
  const toggleButtonOverride = (enabled: boolean) => {
    if (!enabled) {
      patch({ buttonPrimaryBackground: undefined, buttonPrimaryText: undefined });
      return;
    }
    patch({
      buttonPrimaryBackground: draftVariables['--button-brand-filled-bg-default'],
      buttonPrimaryText: draftVariables['--button-brand-filled-text-default'],
    });
  };

  return (
    <div
      className="page project-theme-page"
      data-theme-unsaved={(!isHistorical && dirty) || undefined}
    >
      <PageHeader
        title="配置项目主题"
        description="先确定品牌、模式与密度，再核对组件和页面效果。保存更新项目草稿，发布后才形成前端可取用的版本。"
        actions={
          dirty && !isHistorical ? (
            <span className="unsaved-indicator">有未保存修改</span>
          ) : undefined
        }
      />
      {isHistorical && (
        <div className="readonly-notice" role="status">
          当前正在查看冻结版本 v{release?.version}
          ，主题为只读。切换到“当前草稿”后才能编辑。
        </div>
      )}
          <div className="theme-save-actions">
            <DSButton
              variant="secondary"
              disabled={isHistorical || !dirty || saving}
              onClick={() => void restore()}
              icon={<RotateCcw size={15} />}
            >
              撤销本次修改
            </DSButton>
            <DSButton
              variant="primary"
              disabled={isHistorical || !dirty || Boolean(validationError) || conflict}
              onClick={() => void save()}
              loading={saving}
              icon={<Save size={15} />}
            >
              保存主题
            </DSButton>

          </div>
          <p role="status" aria-live="polite">
            {feedback}
          </p>
          {!dirty && feedback.startsWith('主题已保存') && <Link className="secondary-action" to={`/projects/${project.id}/releases?version=draft`}>前往版本发布与交付</Link>}
      <div className="theme-editor-layout">
        <section className="theme-config-panel">
          <header className="theme-config-header">
            <h2>主题配置</h2>
            <p>先完成基础设置；色彩、字体和外观可按需细调。</p>
          </header>
          {isHistorical ? <div className="theme-config-content"><p>冻结包原值；缺失项使用历史兼容基线，不读取当前草稿。</p>{frozen.theme && <dl>{['brand-primary','button-brand-filled-bg-default','field-placeholder','text-primary','surface-primary','radius-control','radius-table','font-button'].map(id => <div key={id}><dt>{id}</dt><dd>{frozen.theme!.values[id]} · {frozen.theme!.sources[id] === 'release' ? '冻结版本' : '历史兼容基线'}</dd></div>)}</dl>}</div> : <><SegmentedControl
            label="配置分类"
            value={configSection}
            onChange={setConfigSection}
            options={[
              { value: "basic", label: "基础" },
              { value: "color", label: "色彩" },
              { value: "type", label: "字体" },
              { value: "shape", label: "尺寸外观" },
            ]}
          />
          <fieldset className="theme-config-content theme-config-fields" disabled={saving}>
            {configSection === "basic" && <div className="theme-section">
              <ColorField
                label="品牌主色"
                value={draft.brandPrimary}
                disabled={isHistorical}
                onChange={updateBrandPrimary}
              />
              <p className="theme-setting-help">修改主色会重新生成辅助、悬停和按下色；高级覆盖也会同步替换。</p>
              <fieldset disabled={isHistorical}>
                <legend>风格预设</legend>
                <div className="theme-presets">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      aria-pressed={selectedPreset?.id === preset.id}
                      onClick={() => patch({ ...preset.patch, preset: preset.id })}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p className="theme-setting-help">{selectedPreset ? selectedPreset.description : '已自定义外观。选择预设会更新尺寸与外观，分层尺寸中的手动覆盖仍会保留。'}</p>
              <label>
                信息密度
                <AppSelect
                  aria-label="信息密度"
                  value={draft.density}
                  disabled={isHistorical}
                  onChange={(event) => patch(densitySettings[event.target.value as ProjectThemeSettings["density"]])}
                >
                  <option value="compact">紧凑</option>
                  <option value="comfortable">舒适</option>
                  <option value="spacious">宽松</option>
                </AppSelect>
              </label>
              <p className="theme-setting-help">密度更新跟随项；已覆盖的尺寸保持不变，可在“尺寸外观”恢复跟随。</p>
              <label>
                主题模式
                <AppSelect
                  aria-label="主题模式"
                  value={draft.mode}
                  disabled={isHistorical || Boolean(validationError)}
                  onChange={(event) => {
                    const mode = event.target.value as ProjectThemeSettings["mode"];
                    changeMode(mode);
                  }}
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </AppSelect>
              </label>
              <p className="theme-setting-help">本次编辑中切换深浅色，会分别保留各自的自定义中性色。</p>
            </div>}
            {configSection === "color" && <div className="theme-palette">
              <ColorField label="品牌主色" value={draft.brandPrimary} onChange={updateBrandPrimary} />
              <p className="theme-palette-note">修改品牌主色后，弱调、悬停和按下色会自动生成。中性色和状态色使用稳定语义基线。</p>
              <PaletteGroup title="品牌色阶" items={[
                { label: '主色', value: draft.brandPrimary },
                { label: '弱调', value: draft.brandSecondary },
                { label: '悬停', value: draft.brandHover },
                { label: '按下', value: draft.brandActive },
              ]} />
              <PaletteGroup title="中性表面" items={[
                { label: '主文字', value: draft.textPrimary },
                { label: '次文字', value: draft.textSecondary },
                { label: '页面', value: draft.surfaceCanvas },
                { label: '内容', value: draft.surfacePrimary },
                { label: '边框', value: draft.borderDefault },
              ]} />
              <PaletteGroup title="状态色" items={[
                { label: '成功', value: draft.statusSuccess },
                { label: '警告', value: draft.statusWarning },
                { label: '错误', value: draft.statusError },
              ]} />
              <details className="theme-color-overrides">
                <summary>高级色值覆盖</summary>
                <div className="theme-color-grid">
                  <ColorField label="品牌辅助色" value={draft.brandSecondary} disabled={isHistorical} onChange={(value) => patch({ brandSecondary: value })} />
                  <ColorField label="悬停颜色" value={draft.brandHover} disabled={isHistorical} onChange={(value) => patch({ brandHover: value })} />
                  <ColorField label="按下颜色" value={draft.brandActive} disabled={isHistorical} onChange={(value) => patch({ brandActive: value })} />
                  <ColorField label="主要文字" value={draft.textPrimary} disabled={isHistorical} onChange={(value) => patch({ textPrimary: value })} />
                  <ColorField label="次要文字" value={draft.textSecondary} disabled={isHistorical} onChange={(value) => patch({ textSecondary: value })} />
                  <ColorField label="页面背景" value={draft.surfaceCanvas} disabled={isHistorical} onChange={(value) => patch({ surfaceCanvas: value })} />
                  <ColorField label="内容背景" value={draft.surfacePrimary} disabled={isHistorical} onChange={(value) => patch({ surfacePrimary: value })} />
                  <ColorField label="边框颜色" value={draft.borderDefault} disabled={isHistorical} onChange={(value) => patch({ borderDefault: value })} />
                  <ColorField label="成功状态" value={draft.statusSuccess} disabled={isHistorical} onChange={(value) => patch({ statusSuccess: value })} />
                  <ColorField label="警告状态" value={draft.statusWarning} disabled={isHistorical} onChange={(value) => patch({ statusWarning: value })} />
                  <ColorField label="错误状态" value={draft.statusError} disabled={isHistorical} onChange={(value) => patch({ statusError: value })} />
                </div>
                <section className="theme-button-override" aria-label="主按钮颜色覆盖">
                  <DSCheckbox label="单独设置主按钮颜色" checked={buttonOverrideEnabled} disabled={isHistorical} onChange={toggleButtonOverride} />
                  <p className="theme-setting-help">关闭时跟随品牌色和对比度规则；开启后背景、文字与图标会作为项目草稿独立保存。</p>
                  {buttonOverrideEnabled && <div className="theme-color-grid">
                    <ColorField label="主按钮背景" value={draft.buttonPrimaryBackground ?? draftVariables['--button-brand-filled-bg-default']} disabled={isHistorical} onChange={(value) => patch({ buttonPrimaryBackground: value })} />
                    <ColorField label="主按钮文字与图标" value={draft.buttonPrimaryText ?? draftVariables['--button-brand-filled-text-default']} disabled={isHistorical} onChange={(value) => patch({ buttonPrimaryText: value })} />
                  </div>}
                </section>
              </details>
            </div>}
            {configSection === "type" && <div className="theme-section">
              <label>
                字体
                <AppSelect
                  aria-label="字体"
                  value={draft.fontFamily}
                  disabled={isHistorical}
                  onChange={(event) =>
                    patch({ fontFamily: event.target.value })
                  }
                >
                  <option value={'"Noto Sans SC Variable", sans-serif'}>
                    Noto Sans SC
                  </option>
                  <option value={'"PingFang SC", sans-serif'}>
                    PingFang SC
                  </option>
                </AppSelect>
              </label>
              <label>
                正文字号
                <input
                  type="number"
                  min="12"
                  max="18"
                  disabled={isHistorical}
                  value={draft.bodySize}
                  onChange={(event) =>
                    patch({ bodySize: Number(event.target.value) })
                  }
                />
              </label>
              <label>
                标题字号
                <input
                  type="number"
                  min="18"
                  max="32"
                  disabled={isHistorical}
                  value={draft.titleSize}
                  onChange={(event) =>
                    patch({ titleSize: Number(event.target.value) })
                  }
                />
              </label>
            </div>}
            {configSection === "shape" && <div className="theme-section">
              <ThemeSizingEditor baseValues={resolveProjectTheme(project).values} theme={draft} disabled={saving} onChange={sizing=>patch({sizing})} />

              <label>
                圆角
                <input
                  type="range"
                  min="0"
                  max="16"
                  disabled={isHistorical}
                  value={draft.radius}
                  onChange={(event) =>
                    patch({ radius: Number(event.target.value) })
                  }
                />
                <output>{draft.radius}px</output>
              </label>
              <label>
                表格圆角
                <input type="range" min="0" max="24" disabled={isHistorical} value={draft.tableRadius ?? 6}
                  onChange={event => patch({ tableRadius: Number(event.target.value) })} />
                <output>{draft.tableRadius ?? 6}px</output>
              </label>
              <p className="theme-setting-help">仅调整表格；内容区圆角自动比外层小 2px，最小为 0px。</p>
              {!draft.sizing && <>
              <label>
                间距
                <input
                  type="range"
                  min="8"
                  max="24"
                  disabled={isHistorical}
                  value={draft.spacing}
                  onChange={(event) =>
                    patch({ spacing: Number(event.target.value) })
                  }
                />
                <output>{draft.spacing}px</output>
              </label>
              <label>
                控件高度
                <input
                  type="range"
                  min="28"
                  max="44"
                  disabled={isHistorical}
                  value={draft.controlHeight}
                  onChange={(event) =>
                    patch({ controlHeight: Number(event.target.value) })
                  }
                />
                <output>{draft.controlHeight}px</output>
              </label>
              </>}
              <label>
                阴影
                <AppSelect
                  aria-label="阴影"
                  value={draft.shadow}
                  disabled={isHistorical}
                  onChange={(event) => patch({ shadow: event.target.value })}
                >
                  <option value="none">无阴影</option>
                  <option value={PROJECT_THEME_SHADOWS.subtle}>轻微</option>
                  <option value={PROJECT_THEME_SHADOWS.overlay}>
                    明显
                  </option>
                </AppSelect>
              </label>
            </div>}
          </fieldset>
          </>}
          {!isHistorical && <div className="theme-edit-summary"><strong>{dirty ? `待保存 ${changedFields.length} 项修改` : '与已保存主题一致'}</strong>{dirty && <details><summary>核对修改内容</summary><ul>{changedFields.map(key => <li key={key}><strong>{themeFieldLabels[key]}</strong><span>{formatThemeValue(key, savedSnapshot[key])} → {formatThemeValue(key, draft[key])}</span></li>)}</ul></details>}{validationError && <p role="alert">{validationError} 请修正后再保存；预览保留上一次有效配置。</p>}{conflict && <><p role="alert">服务器主题已被其他成员修改。先核对并保留需要的内容，再读取最新主题重新编辑。</p><DSButton disabled={saving} onClick={() => void reloadServer()}>放弃修改并读取最新主题</DSButton></>}</div>}
          <details className="theme-developer-actions"><summary>开发取用与旧数据</summary><p>复制当前有效配置用于调试；正式前端取用请在保存后发布版本并生成组件包。</p>            <DSButton variant="secondary" disabled={isHistorical ? !frozen.style : Boolean(validationError)} onClick={copyCss} icon={<Clipboard size={15} />}>
              复制 Token/CSS
            </DSButton>
            {!isHistorical && reloadProjectTheme && localStorage.getItem(projectThemeStorageKey(project.id)) && <DSButton variant="tertiary" disabled={saving} onClick={() => { setDraft(loadProjectTheme(project)); setFeedback('已载入本机旧主题，保存后才会同步到工作区。'); }}>载入本机旧主题</DSButton>}</details>

        </section>
        <section className="theme-live-panel">
          <div className="theme-preview-header">
            <div>
              <h2>实时预览</h2>
              <p>{isHistorical ? "预览使用冻结版本原值，缺失项采用历史兼容基线。" : "按钮、输入框、选择器、表格与卡片使用同一份临时主题。"}</p>
            </div>
            <SegmentedControl
              label="预览范围"
              value={preview}
              onChange={setPreview}
              options={[
                { value: "components", label: "组件" },
                { value: "page", label: "完整页面" },
              ]}
            />
          </div>
          {!isHistorical && dirty && <DSButton size="sm" variant="secondary" aria-pressed={previewSaved} onClick={() => setPreviewSaved(value => !value)}>{previewSaved ? '返回当前编辑效果' : '对比已保存主题'}</DSButton>}
          {!isHistorical && previewSaved && <p role="status">正在预览已保存主题；本次编辑内容仍然保留。</p>}
          {!isHistorical && <p className="theme-contrast-summary">品牌原色与白字对比度 {brandWhiteContrastRatio((previewSaved ? savedSnapshot : validPreview).brandPrimary).toFixed(2)}:1。主要按钮使用白字；低于 4.5:1 时，仅加深按钮底色，保留品牌原色。正文与按钮字号、字体同步。</p>}
          {isHistorical && !frozen.style ? <p role={frozen.error ? 'alert' : 'status'}>{frozen.error ? `冻结主题读取失败：${frozen.error}` : '正在读取冻结主题…'}</p> : <ThemePreview
            style={previewStyle}
            title={project.shortName}
            variant={preview}
          />}
        </section>
      </div>
    </div>
  );
}
