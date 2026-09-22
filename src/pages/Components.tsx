import { TableSelectionBar } from '../components/TableSelectionBar'
import { assertReleaseContext } from '../services/release-context';
import { LiveStyleInspector } from '../components/LiveStyleInspector';
import { componentMaturity } from '../data/core-quality';
import { exampleUsage } from '../services/usage-code';
import { getComponentStateSupport } from '../design-system/component-bindings';
import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  List,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import * as runtime from "../runtime";
import type { ReleaseManifest } from "../runtime";
import { canManage, useAccess } from "../app/access-context";
import { useProject } from "../app/project-context";
import { LocalTabs } from "../components/NavigationControls";
import { RuntimeExample } from "../components/RuntimeExample";
import { AppSelect } from "../components/AppSelect";
import { buttonRecipeTokens } from "../data/components/button-recipe-tokens";
import { componentAssets } from "../data/assets/components";
import { tableDemoRows } from "../data/assets/table-demo";
import {
  COMPONENT_CATALOG,
  componentDisplayName,
  COMPONENT_GROUPS,
} from "../design-system/component-catalog";
import { componentDemoVariants } from "../design-system/component-demo-variants";
import { resolveComponentStateTokens, resolveComponentTokens, type ComponentStateTokenResolution } from "../design-system/component-bindings";
import { resolveBaselineTheme, resolveReleaseThemeFromCss } from "../services/theme-resolver";
import {
  baselineThemeSettings,
  previewVariablesFromTheme,
  resolvePreviewTheme,
  releasePreviewVariables,
} from "../services/project-theme";
import { componentDestination } from "../services/asset-navigation";
import { DRAFT_VERSION, isDraftVersion } from "../services/release-catalog";
import { componentsForProjectContext } from "../services/component-availability";
import { PreviewScope } from "../design-system/theme/PreviewScope";
import { DSSwitch as PreviewSwitch } from "../design-system/primitives/Forms";
import apiData from "../data/generated/runtime-api.json";
import "./Components.css";

const implementationLabels = {
  implemented: "已实现",
  migrating: "迁移中",
  planned: "规划中",
};
type ReleaseComponentEntry = {
  id: string;
  runtimeExport: string;
  props?: Array<{ name: string; type: string; required?: boolean; description?: string }>;
};
const stateLabels: Record<string, string> = {
  default: "默认",
  hover: "悬停",
  focus: "聚焦",
  active: "激活",
  pressed: "按下",
  selected: "选中",
  checked: "选中",
  indeterminate: "部分选中",
  disabled: "禁用",
  loading: "加载",
  error: "错误",
  open: "展开",
  empty: "空状态",
  success: "成功",
  warning: "警告",
  info: "信息",
};
const stateDescriptions: Record<string, string> = {
  default: "组件等待用户操作时的基础表现。",
  hover: "指针进入可操作区域后的反馈。",
  focus: "键盘或辅助输入聚焦时的可见焦点。",
  active: "用户正在按下或激活控件时的反馈。",
  pressed: "用户正在按下控件时的反馈。",
  selected: "组件或选项已经被选中的持续状态。",
  checked: "选择类控件已经确认选择的状态。",
  indeterminate: "部分项目被选中时的混合状态。",
  disabled: "组件不可操作时的弱化状态。",
  loading: "操作处理中且需要阻止重复提交的状态。",
  error: "输入、提交或业务结果错误时的状态。",
  open: "浮层或选项面板展开后的状态。",
  empty: "没有可展示数据时的状态。",
  success: "操作成功时的反馈状态。",
  warning: "需要关注但允许继续时的反馈状态。",
  info: "提供中性说明信息的状态。",
};
const sourceLabels = { project: "项目覆盖", designer: "设计确认", platform: "平台基线", release: "冻结版本", compatibility: "历史兼容基线" } as const;

function ComponentStateInspector({
  componentName,
  states,
  activeState,
  onStateChange,
  rows,
}: {
  componentName: string;
  states: string[];
  activeState: string;
  onStateChange: (state: string) => void;
  rows: ComponentStateTokenResolution[];
}) {
  const roleValue = (role: string) => rows.find((row) => row.slot === role)?.resolvedValue || "transparent";
  const focus = activeState === "focus" ? roleValue("焦点环") : "transparent";
  return (
    <div className="component-state-inspector">
      <div className="component-state-tabs" role="group" aria-label={`${componentName}状态`}>
        {states.map((state) => (
          <button key={state} type="button" aria-pressed={activeState === state} onClick={() => onStateChange(state)}>
            {stateLabels[state] ?? state}
          </button>
        ))}
      </div>
      <p className="component-state-description">{stateDescriptions[activeState] ?? "查看该状态使用的颜色与来源。"}</p>
      <div className="component-state-content">
        <div className="component-state-sample" style={{ background: roleValue("背景"), color: roleValue("文字"), borderColor: roleValue("边框"), boxShadow: `0 0 0 3px ${focus}` }}>
          <span>{componentName}</span>
          <strong>{stateLabels[activeState] ?? activeState}</strong>
        </div>
        <div className="component-state-token-table" role="table" aria-label={`${componentName}${stateLabels[activeState] ?? activeState}状态颜色变量`}>
          {rows.map((row) => (
            <div role="row" key={`${row.slot}-${row.tokenId}`}>
              <span role="cell" className="component-state-token-role"><i style={{ background: row.resolvedValue }} aria-hidden="true" />{row.slot}</span>
              <code role="cell">--{row.tokenId}</code>
              <code role="cell">{row.resolvedValue || "未定义"}</code>
              <span role="cell" className={`component-state-source component-state-source--${row.source}`}>{sourceLabels[row.source]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const componentAliases: Record<string, string[]> = {
  input: ["输入框", "文本输入"],
  select: ["选择器", "下拉选择"],
  dialog: ["弹窗", "对话框"],
  drawer: ["抽屉", "侧边面板"],
  table: ["表格", "数据列表"],
  button: ["按钮", "操作"],
};

function ButtonExampleSection({
  id,
  title,
  description,
  code,
  children,
  onCopy,
}: {
  id: string;
  title: string;
  description: string;
  code: string;
  children: ReactNode;
  onCopy: (message: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section id={id} className="button-example-section">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="button-example-frame">
        <div className="button-example-canvas">{children}</div>
        <div className="button-example-tools">
          <button
            type="button"
            aria-label={`复制${title}代码`}
            title={`复制${title}代码`}
            onClick={async () =>
              onCopy(
                (await copyText(code))
                  ? `${title}代码已复制`
                  : "无法访问剪贴板，请展开代码手动复制",
              )
            }
          >
            <Copy size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`${expanded ? "收起" : "查看"}${title}代码`}
            title={`${expanded ? "收起" : "查看"}${title}代码`}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <Code2 size={17} aria-hidden="true" />
          </button>
        </div>
        {expanded && (
          <pre className="button-example-code" tabIndex={0}>
            <code>{code}</code>
          </pre>
        )}
      </div>
    </section>
  );
}

function ButtonExamples() {
  const [feedback, setFeedback] = useState("");
  const trigger = (label: string) => setFeedback(`已触发：${label}`);

  return (
    <div className="button-example-list">
      <ButtonExampleSection
        id="button-variants"
        title="样式变体"
        description="根据操作优先级和风险选择，同一区域只保留一个主要操作。"
        code={`<DSButton variant="primary">主要按钮</DSButton>\n<DSButton variant="secondary">次要按钮</DSButton>\n<DSButton variant="tertiary">文字按钮</DSButton>\n<DSButton variant="primary" semantic="danger">危险操作</DSButton>`}
        onCopy={setFeedback}
      >
        <div className="button-example-row">
          <runtime.DSButton
            variant="primary"
            onClick={() => trigger("主要按钮")}
          >
            主要按钮
          </runtime.DSButton>
          <runtime.DSButton
            variant="secondary"
            onClick={() => trigger("次要按钮")}
          >
            次要按钮
          </runtime.DSButton>
          <runtime.DSButton
            variant="tertiary"
            onClick={() => trigger("文字按钮")}
          >
            文字按钮
          </runtime.DSButton>
          <runtime.DSButton
            variant="primary"
            semantic="danger"
            onClick={() => trigger("危险操作")}
          >
            危险操作
          </runtime.DSButton>
        </div>
      </ButtonExampleSection>

      <ButtonExampleSection
        id="button-sizes"
        title="按钮尺寸"
        description="小尺寸用于紧凑区域，中尺寸用于常规表单，大尺寸用于强调操作。"
        code={`<DSButton size="sm">小按钮</DSButton>\n<DSButton size="md">中按钮</DSButton>\n<DSButton size="lg">大按钮</DSButton>`}
        onCopy={setFeedback}
      >
        <div className="button-example-row button-example-row--sizes">
          <runtime.DSButton size="sm">
            小按钮
          </runtime.DSButton>
          <runtime.DSButton size="md">
            中按钮
          </runtime.DSButton>
          <runtime.DSButton size="lg">
            大按钮
          </runtime.DSButton>
        </div>
      </ButtonExampleSection>

      <ButtonExampleSection
        id="button-icons"
        title="图标按钮"
        description="图标用于增强识别；纯图标按钮必须提供可访问名称。"
        code={`<DSButton icon={<Plus />}>新增</DSButton>\n<DSButton variant="secondary" icon={<Search />}>搜索</DSButton>\n<DSButton icon={<Plus />} aria-label="新增" />`}
        onCopy={setFeedback}
      >
        <div className="button-example-row">
          <runtime.DSButton
            icon={<Plus size={15} />}
            onClick={() => trigger("新增资源")}
          >
            新增资源
          </runtime.DSButton>
          <runtime.DSButton
            variant="secondary"
            icon={<Search size={15} />}
            onClick={() => trigger("搜索")}
          >
            搜索
          </runtime.DSButton>
          <runtime.DSButton
            icon={<Plus size={15} />}
            aria-label="新增"
            onClick={() => trigger("纯图标新增")}
          />
        </div>
      </ButtonExampleSection>

      <ButtonExampleSection
        id="button-states"
        title="状态与危险操作"
        description="加载时防止重复提交，禁用时明确不可操作，危险操作使用完整警示语义。"
        code={`<DSButton aria-busy="true" disabled>处理中…</DSButton>\n<DSButton disabled>不可用</DSButton>\n<DSButton variant="primary" semantic="danger" icon={<Trash2 />}>删除</DSButton>`}
        onCopy={setFeedback}
      >
        <div className="button-example-row">
          <runtime.DSButton aria-busy="true" disabled>
            处理中…
          </runtime.DSButton>
          <runtime.DSButton disabled>
            不可用
          </runtime.DSButton>
          <runtime.DSButton
            variant="primary"
            semantic="danger"
            icon={<Trash2 size={15} />}
            onClick={() => trigger("删除")}
          >
            删除
          </runtime.DSButton>
        </div>
      </ButtonExampleSection>
      <p className="button-example-feedback" role="status" aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}

type ManagedResource = {
  id: string;
  name: string;
  type: string;
  owner: string;
  updatedAt: string;
  status: "草稿" | "审核中" | "稳定" | "已废弃";
  version: string;
  usage: number;
  project: string;
  inheritance: string;
  dependency: string;
  deleted?: boolean;
};

const initialResources: ManagedResource[] = tableDemoRows.map((row, index) => ({
  id: row.id,
  name: row.name,
  type: row.category,
  owner: row.owner,
  updatedAt: row.updatedAt,
  status:
    row.status === "待审核"
      ? "审核中"
      : row.status === "已停用"
        ? "已废弃"
        : "稳定",
  version: "v1.5.5",
  usage: 12 + index * 7,
  project: "国科信设计系统",
  inheritance: "Web 平台",
  dependency: index % 2 ? "Table, Pagination" : "Input, Table",
}));

export function ResourceManagerDemo({
  projectName = "通用示例",
}: {
  projectName?: string;
}) {
  const [rows, setRows] = useState(() =>
    initialResources.map((row) => ({ ...row, project: projectName })),
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editing, setEditing] = useState<ManagedResource | null>(null);
  const [viewing, setViewing] = useState<ManagedResource | null>(null);
  const [feedback, setFeedback] = useState("");
  const [editorError, setEditorError] = useState("");
  const dialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (row) =>
            Boolean(row.deleted) === showDeleted &&
            (filter === "全部" || row.status === filter) &&
            `${row.name}${row.type}${row.owner}`.includes(query),
        )
        .sort((a, b) =>
          sortAsc
            ? a.name.localeCompare(b.name, "zh-CN")
            : b.name.localeCompare(a.name, "zh-CN"),
        ),
    [filter, query, rows, showDeleted, sortAsc],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleRows = filtered.slice(
    (Math.min(page, pageCount) - 1) * pageSize,
    Math.min(page, pageCount) * pageSize,
  );
  const updateSelected = (status: ManagedResource["status"]) => {
    setRows((items) =>
      items.map((row) =>
        selected.includes(row.id) ? { ...row, status, updatedAt: "刚刚" } : row,
      ),
    );
    setFeedback(`已更新 ${selected.length} 项资源`);
    setSelected([]);
  };
  const save = () => {
    if (!editing?.name.trim()) {
      setEditorError("请输入资源名称");
      return;
    }
    if (
      rows.some((row) => row.id !== editing.id && row.name === editing.name)
    ) {
      setEditorError("资源名称不能重复");
      return;
    }
    setEditorError("");
    setRows((items) =>
      items.some((row) => row.id === editing.id)
        ? items.map((row) =>
            row.id === editing.id ? { ...editing, updatedAt: "刚刚" } : row,
          )
        : [{ ...editing, updatedAt: "刚刚" }, ...items],
    );
    setSelected([]);
    closeEditor();
    setFeedback("资源已保存");
  };
  const create = (trigger: HTMLButtonElement) => {
    dialogTriggerRef.current = trigger;
    setEditorError("");
    setEditing({
      id: globalThis.crypto?.randomUUID?.() ?? `resource-${Date.now()}`,
      name: "",
      type: "数据资源",
      owner: "当前用户",
      updatedAt: "刚刚",
      status: "草稿",
      version: "v1.5.5",
      usage: 0,
      project: "当前项目",
      inheritance: "Web 平台",
      dependency: "无",
    });
  };
  const closeEditor = () => {
    setEditorError("");
    setEditing(null);
    requestAnimationFrame(() => dialogTriggerRef.current?.focus());
  };
  const closeViewer = () => {
    setViewing(null);
    requestAnimationFrame(() => dialogTriggerRef.current?.focus());
  };
  return (
    <section
      className="resource-manager-demo"
      aria-labelledby="resource-manager-title"
    >
      <header><h2 id="resource-manager-title">资源管理示例</h2><p>新增、编辑、批量操作、分页、删除与恢复均可用</p></header>
      <div className="resource-manager-toolbar">
        <runtime.DSInput label="搜索资源" value={query} placeholder="搜索名称、类型或负责人" onChange={value => { setQuery(value); setPage(1); setSelected([]) }} />
        <runtime.DSSelect label="生命周期筛选" value={filter} options={['全部','草稿','审核中','稳定','已废弃'].map(value => ({value,label:value}))} onChange={value => { setFilter(value); setPage(1); setSelected([]) }} />
        <runtime.DSButton onClick={() => setSortAsc(value => !value)}>按名称{sortAsc ? '降序' : '升序'}</runtime.DSButton>
        <runtime.DSButton aria-pressed={showDeleted} onClick={() => { setShowDeleted(value => !value); setSelected([]); setPage(1) }}>{showDeleted ? '返回资源列表' : '回收站'}</runtime.DSButton>
      </div>
      <div className="resource-manager-primary ds-table-toolbar"><runtime.DSButton variant="primary" onClick={event => create(event.currentTarget)}>新增资源</runtime.DSButton></div>
      <TableSelectionBar count={selected.length} otherPageCount={selected.filter(id=>!visibleRows.some(row=>row.id===id)).length} onClear={()=>setSelected([])} className="resource-manager-bulk">
        <runtime.DSButton size="sm" variant="tertiary" onClick={() => updateSelected("稳定")}>批量启用</runtime.DSButton>
        <runtime.DSButton size="sm" variant="tertiary" onClick={() => updateSelected("已废弃")}>批量停用</runtime.DSButton>
        {filtered.length > visibleRows.length && selected.length < filtered.length && <runtime.DSButton size="sm" variant="tertiary" onClick={() => setSelected(filtered.map(row => row.id))}>选择全部 {filtered.length} 项</runtime.DSButton>}
      </TableSelectionBar>
      <div className="resource-manager-table">
        <runtime.DSTable
          columns={[
            { key: 'name', title: '名称', width: 200 },
            { key: 'type', title: '类型', width: 110 },
            { key: 'owner', title: '负责人', width: 110 },
            { key: 'updatedAt', title: '更新时间', width: 130 },
            { key: 'status', title: '状态', width: 90, render: row => <span>{row.status}</span> },
            { key: 'actions', title: '操作', width: showDeleted ? 140 : 260, ellipsis: false, render: row => (
                  <span className="ds-table-actions" onClick={event => event.stopPropagation()}>
                    <runtime.DSButton className="table-action" variant="tertiary" size="sm" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setViewing(row) }}>查看</runtime.DSButton>
                    {showDeleted ? (
                      <runtime.DSButton
                        className="table-action"
                        variant="tertiary"
                        size="sm"
                        onClick={() => {
                          setRows((items) =>
                            items.map((item) =>
                              item.id === row.id
                                ? { ...item, deleted: false }
                                : item,
                            ),
                          );
                          setSelected(items => items.filter(id => id !== row.id));
                          setFeedback("资源已恢复");
                        }}
                      >
                        恢复
                      </runtime.DSButton>
                    ) : (
                      <>
                        <runtime.DSButton className="table-action" variant="tertiary" size="sm" onClick={(event) => { dialogTriggerRef.current = event.currentTarget; setEditing(row) }}>编辑</runtime.DSButton>
                        <runtime.DSButton className="table-action" variant="tertiary" size="sm" onClick={() => { setRows((items) => items.map((item) => item.id === row.id ? { ...item, status: row.status === "已废弃" ? "稳定" : "已废弃", updatedAt: "刚刚" } : item)); setFeedback(row.status === "已废弃" ? "资源已启用" : "资源已停用") }}>{row.status === "已废弃" ? "启用" : "停用"}</runtime.DSButton>
                        <runtime.DSButton
                          className="table-action table-action--danger"
                          variant="tertiary"
                          semantic="danger"
                          size="sm"
                          aria-label={`删除 ${row.name}`}
                          onClick={() => {
                            if (window.confirm(`确定删除“${row.name}”吗？`)) {
                              setRows((items) =>
                                items.map((item) =>
                                  item.id === row.id
                                    ? { ...item, deleted: true }
                                    : item,
                                ),
                              );
                              setSelected(items => items.filter(id => id !== row.id));
                              setFeedback("资源已移入回收站");
                            }
                          }}
                        >
                          删除
                        </runtime.DSButton>
                      </>
                    )}
                  </span>
            ) },
          ]}
          footer={filtered.length > 0 ? <runtime.DSPagination
        total={filtered.length} page={Math.min(page, pageCount)} pageSize={pageSize} pageSizeOptions={[4, 10, 20, 50]}
        onPageChange={setPage} onPageSizeChange={size => { setPageSize(size); setPage(1) }}
      />:undefined}
          data={visibleRows} rowKey={row => row.id}
          selectable selectedRowKeys={selected} onSelectionChange={setSelected}
          emptyState={<runtime.DSEmpty title={showDeleted ? '回收站为空' : '没有匹配资源'} description="调整筛选条件或新增资源后重试。" />}
        />
      </div>

      <p role="status" aria-live="polite">
        {feedback}
      </p>
      {editing && (
        <runtime.DSDialog
          open
          onOpenChange={(open) => { if (!open) closeEditor() }}
          title={rows.some((row) => row.id === editing.id) ? "编辑资源" : "新增资源"}
          description="填写资源信息后保存。"
          footer={<><runtime.DSButton onClick={closeEditor}>取消</runtime.DSButton><runtime.DSButton variant="primary" onClick={save}>保存资源</runtime.DSButton></>}
        >
          <div className="resource-editor-form">
            <runtime.DSInput
              label="名称"
              required
              value={editing.name}
              invalid={Boolean(editorError)}
              errorMessage={editorError}
              onChange={(value) => {
                setEditorError("");
                setEditing({ ...editing, name: value });
              }}
            />
            <runtime.DSInput
              label="类型"
              value={editing.type}
              onChange={(value) => setEditing({ ...editing, type: value })}
            />
            <runtime.DSSelect
              label="生命周期"
              value={editing.status}
              onChange={(value) =>
                setEditing({
                  ...editing,
                  status: value as ManagedResource["status"],
                })
              }
              options={[
                { value: "草稿", label: "草稿" },
                { value: "审核中", label: "审核中" },
                { value: "稳定", label: "稳定" },
                { value: "已废弃", label: "已废弃" },
              ]}
            />
          </div>
        </runtime.DSDialog>
      )}
      {viewing && (
        <runtime.DSDialog
          open
          onOpenChange={(open) => { if (!open) closeViewer() }}
          title={viewing.name}
        >
          <div className="resource-viewer">
            <dl>
              <dt>版本</dt>
              <dd>{viewing.version}</dd>
              <dt>使用量</dt>
              <dd>{viewing.usage}</dd>
              <dt>所属项目</dt>
              <dd>{viewing.project}</dd>
              <dt>继承来源</dt>
              <dd>{viewing.inheritance}</dd>
              <dt>依赖关系</dt>
              <dd>{viewing.dependency}</dd>
            </dl>
          </div>
        </runtime.DSDialog>
      )}
    </section>
  );
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

export function Components() {
  const { componentId, projectId } = useParams();
  const { project, projectTheme, theme, release, loadReleaseAsset } = useProject();
  const { user } = useAccess();
  const [params, setParams] = useSearchParams();
  const requestedVersion = params.get("version");
  const legacyId = params.get("component");
  const selected = COMPONENT_CATALOG.find(
    (item) => item.componentId === componentId,
  );
  const query = params.get("q") ?? "";
  const view = params.get("view") === "code" ? "code" : "preview";
  const [disabled, setDisabled] = useState(false);
  const [buttonBlock, setButtonBlock] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonVariant, setButtonVariant] = useState<
    "primary" | "secondary" | "tertiary"
  >("primary");
  const [buttonSemantic, setButtonSemantic] = useState<"default" | "danger">(
    "default",
  );
  const [buttonSize, setButtonSize] = useState<"sm" | "md" | "lg">("md");
  const [tableDensity, setTableDensity] = useState<
    "compact" | "default" | "comfortable"
  >("default");
  const [tableSelectable, setTableSelectable] = useState(false);
  const [inspectedState, setInspectedState] = useState("default");
  const [copyMessage, setCopyMessage] = useState("");
  const [bundle, setBundle] = useState<{
    key: string;
    manifest: ReleaseManifest;
    tokens: string;
    icons: string;
    components: ReleaseComponentEntry[];
  } | null>(null);
  const [bundleError,setBundleError]=useState<{key:string;message:string}|null>(null);
  const key = `${project.releaseProjectId}/${requestedVersion??"draft"}`;
  const error=bundleError?.key===key?bundleError.message:"";

  const isProjectScope = Boolean(projectId);
  const isDraft = isProjectScope && (!requestedVersion || isDraftVersion(requestedVersion));
  const useProjectPreview = isProjectScope && !isDraft;
  const isHistorical = useProjectPreview;
  const enhancedTable = !isHistorical || Boolean(bundle?.key === key && bundle.components.some(item => item.runtimeExport === "DSTable" && item.props?.some(prop => prop.name === "footer")));
  const demoVariantOptions = selected
    ? componentDemoVariants(selected.componentId).filter(item => selected.componentId !== "table" || enhancedTable || !(item.id.startsWith("grouped-") || ["secondary","pagination"].includes(item.id)))
    : [];
  const defaultDemoVariant = demoVariantOptions[0]?.id ?? "default";
  const requestedDemoVariant = params.get("variant");
  const demoVariant =
    demoVariantOptions.find((item) => item.id === requestedDemoVariant)?.id ??
    defaultDemoVariant;

  useEffect(() => {
    if (!release || !useProjectPreview || release.version !== requestedVersion) {
      setBundle(null);
      return;
    }
    let active = true;
    Promise.all([
      loadReleaseAsset<ReleaseManifest>("manifest.json"),
      loadReleaseAsset<string>("tokens.css"),
      loadReleaseAsset<unknown>("icons.json"),
      loadReleaseAsset<{ availableComponents?: ReleaseComponentEntry[] }>("components.json"),
    ])
      .then(([manifest, tokens, icons, components]) => {
        assertReleaseContext(tokens,manifest,project.releaseProjectId,release.version);
        if (active) {
          setBundle({
            key,
            manifest,
            tokens: tokens.replace(/:root,\s*/g, ""),
            icons: JSON.stringify(icons),
            components: components.availableComponents ?? [],
          });
          setBundleError(null);
        }
      })
      .catch((caught: unknown) => {
        if (active) {
          setBundle(null);
          setBundleError({key,message:caught instanceof Error ? caught.message : String(caught)});
        }
      });
    return () => {
      active = false;
    };
  }, [release, key, loadReleaseAsset, useProjectPreview, project.releaseProjectId, requestedVersion]);

  const available = (name: string) => Object.hasOwn(runtime, name);
  const catalog = useMemo(
    () => {
      const projectCatalog = isProjectScope ? componentsForProjectContext(COMPONENT_CATALOG, project.componentIds) : COMPONENT_CATALOG;
      if (!useProjectPreview || bundle?.key !== key) return projectCatalog;
      return componentsForProjectContext(COMPONENT_CATALOG, project.componentIds, bundle.manifest.availableComponents.map((item) => item.id));
    },
    [bundle, isProjectScope, key, project.componentIds, useProjectPreview],
  );
  const filtered = useMemo(
    () =>
      catalog.filter((item) => {
        const assetMeta = componentAssets.find(
          (assetItem) =>
            assetItem.id === item.componentId ||
            assetItem.id === `component-${item.componentId}`,
        );
    return `${item.componentId} ${item.runtimeExport} ${item.group} ${assetMeta?.name ?? ""} ${assetMeta?.tags?.join(" ") ?? ""} ${(componentAliases[item.componentId] ?? []).join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      }),
    [catalog, query],
  );
  const asset = selected
    ? componentAssets.find(
        (item) =>
          item.id === selected.componentId ||
          item.id === `component-${selected.componentId}`,
      )
    : null;
  const activeTheme = isProjectScope
    ? useProjectPreview && bundle?.key === key
      ? resolveReleaseThemeFromCss(bundle.tokens, project)
      : theme
    : resolvePreviewTheme(baselineThemeSettings, resolveBaselineTheme());
  const inspectableStates = selected
    ? Array.from(new Set(["default", ...selected.states]))
    : [];
  const stateTokenRows = selected
    ? resolveComponentStateTokens(
        selected,
        inspectedState,
        activeTheme.values,
        activeTheme.sources,
        { variant: buttonVariant, semantic: buttonSemantic },
      )
    : [];
  const generatedApi = selected
    ? useProjectPreview && bundle?.key === key
      ? bundle.components.find((item) => item.id === selected.componentId)?.props ?? []
      : ((apiData as Record<string, { name: string; type: string; required: boolean; description?: string }[]>)[selected.runtimeExport] ?? [])
    : [];
  const api = generatedApi.map((prop) => {
    const schema = asset?.bindings?.react?.props[prop.name];
    return {
      ...prop,
      description: prop.description ?? schema?.description ?? "以组件类型定义为准。",
      defaultValue:
        schema?.default === undefined ? "—" : String(schema.default),
    };
  });
  const previewStyle = (isHistorical
    ? bundle?.key === key ? releasePreviewVariables(bundle.tokens) : {}
    : previewVariablesFromTheme(activeTheme, isProjectScope ? projectTheme : baselineThemeSettings)) as CSSProperties;
  const code = selected ? exampleUsage('ComponentExample', {id:selected.componentId,demoVariant,disabled,buttonVariant,buttonSemantic,buttonSize,buttonLoading,buttonBlock,tableDensity,tableSelectable}, previewStyle as Record<string,string>, {project:isProjectScope?project.id:'global',version:isProjectScope?(isHistorical?release?.version??'unknown':'draft'):'baseline'}) : '';
  const tokenRows = selected
    ? resolveComponentTokens(selected, activeTheme.values, activeTheme.sources)
    : [];
  const recipeRows =
    selected?.componentId === "button" ? buttonRecipeTokens : [];
  const related = selected
    ? catalog.filter(
        (item) =>
          item.group === selected.group &&
          item.componentId !== selected.componentId,
      ).slice(0, 5)
    : [];
  const versionSupports =
    selected &&
    bundle?.key === key &&
    bundle.manifest.availableComponents.some(
      (item) => item.runtimeExport === selected.runtimeExport,
    );
  const tocItems = useMemo(() => {
    if (!selected)
      return COMPONENT_GROUPS.map((group, index) => ({
        id: `group-${index}`,
        label: group,
      }));
    return [
      { id: "example", label: selected.componentId === "button" ? "交互配置" : "实时示例" },
      { id: "state-inspector", label: "状态与颜色" },
      ...(selected.componentId === "button"
        ? [
            { id: "button-variants", label: "样式变体" },
            { id: "button-sizes", label: "按钮尺寸" },
            { id: "button-icons", label: "图标按钮" },
            { id: "button-states", label: "状态与风险" },
          ]
        : [{ id: "states", label: "变体与状态" }]),
      { id: "usage", label: "使用方法" },
      { id: "developer", label: "开发内容" },
      ...(canManage(user.role)
        ? [{ id: "management", label: "管理信息" }]
        : []),
      { id: "related", label: "相关组件" },
    ];
  }, [selected, user.role]);
  const [activeSection, setActiveSection] = useState(tocItems[0]?.id ?? "");

  useEffect(() => {
    const updateActiveSection = () => {
      const threshold = isProjectScope ? 206 : 160;
      let current = tocItems[0]?.id ?? "";
      tocItems.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element && element.getBoundingClientRect().top <= threshold)
          current = item.id;
      });
      setActiveSection(current);
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [isProjectScope, tocItems]);

  useEffect(() => {
    setDisabled(false);
    setButtonBlock(false);
    setButtonLoading(false);
    setButtonVariant("primary");
    setButtonSemantic("default");
    setButtonSize("md");
    setCopyMessage("");
    setTableDensity("default");
    setTableSelectable(false);
    setInspectedState("default");
  }, [componentId, isDraft, isProjectScope, project.id, release?.version]);

  const componentBase = isProjectScope
    ? `/projects/${project.id}/components`
    : "/components";
  const componentHref = (id: string | null = null) =>
    componentDestination(componentBase, id, params);
  if (!componentId && legacyId)
    return <Navigate replace to={componentHref(legacyId)} />;
  if (useProjectPreview && !error && bundle?.key !== key)
    return <div className="page"><p role="status">正在读取冻结版本 {requestedVersion}…</p></div>;
  if (useProjectPreview && error)
    return <div className="page"><p role="alert">冻结版本读取失败：{error}</p></div>;
  if (
    componentId &&
    (!selected || !catalog.some((item) => item.componentId === componentId))
  )
    return (
      <div className="component-doc-layout component-doc-layout--state">
        <main className="component-doc-main">
          <h1>组件不可用</h1>
          <p>{useProjectPreview ? `该组件未包含在冻结版本 v${release?.version ?? ''} 中。可切换到当前草稿查看源码实现。` : '该组件不存在，或未被当前项目启用。'}</p>
          <Link to={componentHref()} reloadDocument={isProjectScope}>返回组件目录</Link>
        </main>
      </div>
    );

  const setUrlValue = (name: string, value: string | null) => {
    const copy = new URLSearchParams(params);
    copy.delete("component");
    if (value) copy.set(name, value);
    else copy.delete(name);
    setParams(copy, { replace: true });
  };
  const withPreviewContext = (content: ReactNode, previewKey: string, inspectionId?:string) => {
    const scoped = <PreviewScope vars={previewStyle} inspectionId={inspectionId}>{content}</PreviewScope>;
    if (!useProjectPreview) return scoped;
    if (error) return <p role="alert">预览读取失败：{error}</p>;
    if (bundle?.key !== key) return <p role="status">正在读取冻结版本预览…</p>;
    return <runtime.DesignSystemProvider key={previewKey} manifest={bundle.manifest} tokens={bundle.tokens} icons={bundle.icons}>{scoped}</runtime.DesignSystemProvider>;
  };
  const renderSelectedExample = (variant: string, inspect = false) => {
    if (!selected) return null;
    return withPreviewContext(<RuntimeExample
      key={`${isProjectScope ? key : "baseline"}/${selected.componentId}/${variant}`}
      id={selected.componentId} demoVariant={variant} disabled={disabled} buttonBlock={buttonBlock}
      buttonLoading={buttonLoading} buttonSemantic={buttonSemantic} buttonSize={buttonSize}
      buttonVariant={buttonVariant} tableDensity={tableDensity} tableSelectable={tableSelectable}
    />, `${key}/${selected.componentId}/${variant}`, inspect?"component-primary-preview":undefined);
  };
  return (
    <div className="component-doc-layout">
      <details className="component-doc-mobile-nav"><summary>组件目录 · {selected?componentDisplayName(selected.componentId):'全部组件'}</summary><nav aria-label="移动端组件目录">{catalog.map(item=><Link key={item.componentId} to={componentHref(item.componentId)} reloadDocument={isProjectScope} aria-current={item.componentId===componentId?'page':undefined}>{componentDisplayName(item.componentId)}</Link>)}</nav></details>
      <aside className="component-doc-nav" aria-label="组件目录">
        <Link to={componentHref()} reloadDocument={isProjectScope} className="component-doc-all">
          全部组件
        </Link>
        <label className="component-doc-search">
          <span>搜索组件</span>
          <span className="component-doc-search__field">
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setUrlValue("q", event.target.value || null)}
              placeholder="名称或分类"
            />
          </span>
        </label>
        {COMPONENT_GROUPS.map((group) => {
          const items = filtered.filter((item) => item.group === group);
          return items.length ? (
            <section key={group}>
              <h2>{group}</h2>
              {items.map((item) => (
                <Link
                  key={item.componentId}
                  aria-current={
                    selected?.componentId === item.componentId
                      ? "page"
                      : undefined
                  }
                  title={item.runtimeExport.replace(/^DS/, "")}
                  to={componentHref(item.componentId)}
                  reloadDocument={isProjectScope}
                >
                  <span>{componentDisplayName(item.componentId)}</span>
                  {item.implementation !== "implemented" && (
                    <small>{implementationLabels[item.implementation]}</small>
                  )}
                </Link>
              ))}
            </section>
          ) : null;
        })}
        {!filtered.length && (
          <div className="component-search-empty">
            <strong>没有匹配组件</strong>
            <span>可尝试中文名称、英文名称或组件标识。</span>
            <button type="button" onClick={() => setUrlValue("q", null)}>
              清除搜索
            </button>
          </div>
        )}
      </aside>

      <main className="component-doc-main">
        {!selected ? (
          <>
            <header className="component-doc-heading">
              <h1>{isProjectScope ? "项目组件" : "组件"}</h1>
              <p>
                {isProjectScope
                  ? "仅展示当前项目实际引用或启用的通用组件；项目配置只作用于示例区域。"
                  : "浏览跨项目复用的组件能力。选择组件后可先查看交互与用法，再按需展开 API、代码和 Token。"}
              </p>
            </header>
            {COMPONENT_GROUPS.map((group) => {
              const items = filtered.filter((item) => item.group === group);
              return items.length ? (
                <section
                  id={`group-${COMPONENT_GROUPS.indexOf(group)}`}
                  key={group}
                  className="component-doc-group"
                >
                  <h2>{group}</h2>
                  <div>
                    {items.map((item) => (
                      <article key={item.componentId}>
                        <div
                          className="component-card-preview"
                          data-component-id={item.componentId}
                          aria-hidden="true"
                        >
                          {available(item.runtimeExport) ? (
                            withPreviewContext(<RuntimeExample id={item.componentId} />, `${key}/${item.componentId}/card`)
                          ) : (
                            <span>暂未提供预览</span>
                          )}
                        </div>
                        <Link to={componentHref(item.componentId)} reloadDocument={isProjectScope}>
                          <span className="component-card-name">
                            <strong>{componentDisplayName(item.componentId)}</strong>
                            <code>{item.runtimeExport.replace(/^DS/, "")}</code>
                          </span>
                          {item.implementation !== "implemented" && (
                            <span className="component-card-status">
                              {implementationLabels[item.implementation]}
                            </span>
                          )}
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null;
            })}
          </>
        ) : (
          <>
            <header className="component-doc-heading">
              <p>
                {isProjectScope ? "项目组件" : "公共组件"} / {selected.group}
              </p>
              <div className="component-heading-row">
                <h1>
                  {componentDisplayName(selected.componentId)}
                </h1>
                <Link
                  className="secondary-action"
                  to={
                    isProjectScope
                      ? `/components/${selected.componentId}`
                      : `/projects/${project.id}/components/${selected.componentId}?version=${DRAFT_VERSION}`
                  }
                >
                  {isProjectScope ? "查看通用基线" : "在当前项目中查看"}
                </Link>
              </div>
              <p>
                {asset?.description ?? "面向桌面 Web 场景的可复用组件。"}
                {isProjectScope
                  ? isDraft ? " 当前示例应用项目草稿变量。" : ` 当前示例读取冻结版本 v${release?.version ?? ''}。`
                  : " 默认示例使用通用基线。"}
              </p>
              {selected.implementation !== "implemented" && (
                <span className="component-status-warning">
                  {implementationLabels[selected.implementation]}
                </span>
              )}
            </header>

            <section id="example">
              <h2>实时示例</h2>
              {!available(selected.runtimeExport) ? (
                <div className="component-doc-notice">
                  此组件尚未实现，不展示伪造预览或安装代码。
                </div>
              ) : (
                <LocalTabs
                  selectedKey={view}
                  onSelectionChange={(next) =>
                    setUrlValue("view", next === "preview" ? null : next)
                  }
                  items={[
                    {
                      id: "preview",
                      label: "预览",
                      content: (
                        <div
                          className="component-doc-playground"
                          data-component-id={selected.componentId}
                        >
                          <div className="component-doc-preview">
                            <div className="component-doc-preview__stage">
                              {renderSelectedExample(demoVariant, true)}
                            </div>
                          </div>
                          {selected.componentId === "button" && (
                            <aside>
                              <h3>交互配置</h3>
                              <div className="component-preview-toggle">
                                <PreviewSwitch
                                  label="块级按钮"
                                  checked={buttonBlock}
                                  onChange={setButtonBlock}
                                />
                              </div>
                              <div className="component-preview-toggle">
                                <PreviewSwitch
                                  label="禁用"
                                  checked={disabled}
                                  onChange={setDisabled}
                                />
                              </div>
                              <div className="component-preview-toggle">
                                <PreviewSwitch
                                  label="加载中"
                                  checked={buttonLoading}
                                  onChange={setButtonLoading}
                                />
                              </div>
                              <label>
                                尺寸
                                <AppSelect
                                  aria-label="按钮尺寸"
                                  value={buttonSize}
                                  onChange={(event) =>
                                    setButtonSize(
                                      event.target.value as "sm" | "md" | "lg",
                                    )
                                  }
                                >
                                  <option value="sm">小</option>
                                  <option value="md">中</option>
                                  <option value="lg">大</option>
                                </AppSelect>
                              </label>
                              <label>
                                操作层级
                                <AppSelect
                                  aria-label="按钮操作层级"
                                  value={buttonVariant}
                                  onChange={(event) =>
                                    setButtonVariant(
                                      event.target.value as
                                        | "primary"
                                        | "secondary"
                                        | "tertiary",
                                    )
                                  }
                                >
                                  <option value="primary">主要</option>
                                  <option value="secondary">次要</option>
                                  <option value="tertiary">辅助</option>
                                </AppSelect>
                              </label>
                              <label>
                                语义
                                <AppSelect
                                  aria-label="按钮语义"
                                  value={buttonSemantic}
                                  onChange={(event) =>
                                    setButtonSemantic(
                                      event.target.value as "default" | "danger",
                                    )
                                  }
                                >
                                  <option value="default">默认</option>
                                  <option value="danger">危险</option>
                                </AppSelect>
                              </label>
                            </aside>
                          )}
                          {selected.componentId !== "button" && (
                            <aside>
                              <h3>交互配置</h3>
                              {demoVariantOptions.filter((item) => item.id !== "disabled").length > 1 && (
                                <label>
                                  示例变体
                                  <AppSelect
                                    aria-label={`${componentDisplayName(selected.componentId)}示例变体`}
                                    value={demoVariant === "disabled" ? defaultDemoVariant : demoVariant}
                                    onChange={(event) =>
                                      setUrlValue(
                                        "variant",
                                        event.target.value === defaultDemoVariant
                                          ? null
                                          : event.target.value,
                                      )
                                    }
                                  >
                                    {demoVariantOptions
                                      .filter((item) => item.id !== "disabled")
                                      .map((item) => (
                                        <option value={item.id} key={item.id}>
                                          {item.label}
                                        </option>
                                      ))}
                                  </AppSelect>
                                </label>
                              )}
                              {demoVariantOptions.some((item) => item.id === "disabled") && (
                                <div className="component-preview-toggle">
                                  <PreviewSwitch
                                    label="禁用"
                                    checked={disabled}
                                    onChange={setDisabled}
                                  />
                                </div>
                              )}
                              <p className="component-preview-note">
                                配置只作用于当前示例，不修改组件或项目数据。
                              </p>
                            </aside>
                          )}
                        </div>
                      ),
                    },
                    {
                      id: "code",
                      label: "代码",
                      content: (
                        <div className="component-code">
                          <pre tabIndex={0}>
                            <code>{code}</code>
                          </pre>
                          <button
                            onClick={async () =>
                              setCopyMessage(
                                (await copyText(code))
                                  ? "代码已复制"
                                  : "无法访问剪贴板，请手动选择代码",
                              )
                            }
                          >
                            <Copy size={15} />
                            复制代码
                          </button>
                          <p role="status" aria-live="polite">
                            {copyMessage}
                          </p>
                        </div>
                      ),
                    },
                  ]}
                />
              )}
            </section>

            <section id="state-inspector" className="component-state-section">
              <p className="component-maturity">{componentMaturity(selected.componentId).label} · {componentMaturity(selected.componentId).detail}</p><h2>状态与颜色变量</h2><p>{selected.componentId === "button" ? "颜色表与按钮使用同一份状态配方。" : "以下实测值来自真实 DOM；使用示例变体和实际交互检查状态。"} 实际状态以可操作示例及组件 API 为准。</p>
              <p>
                {selected.componentId === "button" ? "按钮配方可按状态查看；" : "切换上方示例变体，或直接操作组件；"}实测表会显示真实元素当前的颜色、尺寸与交互状态。
              </p>
              <details className="developer-details"><summary>状态适用性</summary><p>按当前公开组件 API 区分；不适用的状态不生成演示或计入缺陷。</p><ul>{getComponentStateSupport(selected.componentId).map(item=><li key={item.state}>{stateLabels[item.state] ?? item.state}：{item.status === 'implemented' ? '适用，已有实现' : '不适用，当前 API 未提供独立状态'}</li>)}</ul></details>
              <LiveStyleInspector componentId={selected.componentId} ownerId="component-primary-preview" scopeLabel={`${isProjectScope?project.name:'公共基线'} / ${isHistorical?release?.version??'读取中':isProjectScope?'draft':'baseline'}`}/>
              {selected.componentId === "button" && <><h3>按钮状态配方参考</h3>
              <ComponentStateInspector
                componentName={componentDisplayName(selected.componentId)}
                states={inspectableStates}
                activeState={inspectedState}
                onStateChange={state=>{setInspectedState(state);if(selected.componentId==='button'){setDisabled(state==='disabled');setButtonLoading(state==='loading')}else{const requested=state==='error'?'invalid':state;const option=demoVariantOptions.find(item=>item.id===requested);if(option)setUrlValue('variant',option.id)}}}
                rows={stateTokenRows}
              /></>}
            </section>

            {selected.componentId === "button" &&
              (useProjectPreview ? (
                !error && bundle?.key === key ? (
                  <runtime.DesignSystemProvider
                    manifest={bundle.manifest}
                    tokens={bundle.tokens}
                    icons={bundle.icons}
                  >
                    <PreviewScope vars={previewStyle}>
                      <ButtonExamples key={`examples/${key}`} />
                    </PreviewScope>
                  </runtime.DesignSystemProvider>
                ) : null
              ) : (
                <PreviewScope vars={previewStyle}>
                  <ButtonExamples key="examples/baseline" />
                </PreviewScope>
              ))}

            {selected.componentId === "table" && (
              <>
                <p className="component-doc-notice">
                  以下管理操作仅修改当前示例数据，不写入项目或已发布版本。
                </p>
                {withPreviewContext(<ResourceManagerDemo
                  key={key} projectName={isProjectScope ? project.name : "通用示例"}
                />, `resource-manager/${key}`)}
              </>
            )}

            <section id="usage">
              <h2>使用方法</h2>
              <p>
                {asset?.semantic ??
                  "在满足任务语义时使用该组件，并保持项目主题与交互约束。"}
              </p>
              {asset?.rules?.length ? (
                <ul className="component-rule-list">
                  {asset.rules.map((rule) => (
                    <li key={rule}>
                      <Check size={16} />
                      {rule}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>具体使用规则仍在整理中。</p>
              )}
            </section>

            {selected.componentId !== "button" && (
              <section id="states" className="component-variant-docs">
                <h2>变体、尺寸与状态</h2>
                <p>
                  按真实组件能力分组展示，切换和操作只作用于当前示例。
                </p>
                <div
                  className="component-variant-gallery"
                  data-component-id={selected.componentId}
                >
                  {demoVariantOptions.map((item) => (
                    <article key={item.id} className="component-variant-example">
                      <h3>{item.label}</h3>
                      <div className="component-variant-example__canvas">
                        {renderSelectedExample(item.id)}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <details id="developer" className="developer-details">
              <summary>开发内容</summary>
              <section>
                <h2>API Reference</h2>
                <p>
                  代码名称：<code>{selected.runtimeExport}</code>
                </p>
                <div
                  className="component-doc-api"
                  tabIndex={0}
                  aria-label="API 属性表，可滚动查看"
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Props</th>
                        <th>中文说明</th>
                        <th>类型</th>
                        <th>默认值</th>
                        <th>必填</th>
                      </tr>
                    </thead>
                    <tbody>
                      {api.length ? (
                        api.map((prop) => (
                          <tr key={prop.name}>
                            <td>
                              <code>{prop.name}</code>
                            </td>
                            <td>{prop.description}</td>
                            <td>
                              <code>{prop.type}</code>
                            </td>
                            <td>{prop.defaultValue}</td>
                            <td>{prop.required ? "是" : "否"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>该组件的 API 文档仍在生成中。</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              <section>
                <h2>Recipe 与 Token</h2>
                <p>
                  Recipe：<code>{selected.recipeId}</code>
                </p>
                <div className="component-token-table">
                  {tokenRows.map((row) => (
                    <div key={row.slot}>
                      <span>{row.slot}</span>
                      <code>{row.tokenId}</code>
                      <code>{row.value || "未定义"}</code>
                    </div>
                  ))}
                  {recipeRows.map((token) => (
                    <div key={token.id}>
                      <span>Button Recipe</span>
                      <code>{token.id}</code>
                      <code>{activeTheme.values[token.id]}</code>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h2>Accessibility</h2>
                <ul>
                  {(
                    asset?.accessibility ?? [
                      "支持键盘操作与清晰的 focus-visible。",
                      "状态信息不只依赖颜色表达。",
                    ]
                  ).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section>
                <h2>设计与代码链接</h2>
                <div className="component-links">
                  {asset?.bindings?.storybook && (
                    <a
                      href={asset.bindings.storybook.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Storybook
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <code>
                    Source:{" "}
                    {asset?.bindings?.react?.sourcePath ??
                      `src/runtime/${selected.componentId}`}
                  </code>
                  <code>Styles: src/runtime/vendor/runtime.css</code>
                </div>
              </section>
              <section>
                <h2>Changelog</h2>
                {asset?.lifecycle?.changelog?.length ? (
                  asset.lifecycle.changelog.map((entry) => (
                    <div key={entry.version}>
                      <strong>v{entry.version}</strong>
                      <ul>
                        {entry.changes.map((change) => (
                          <li key={change}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>暂无独立组件变更记录。</p>
                )}
              </section>
            </details>

            {canManage(user.role) && (
              <details id="management" className="management-details">
                <summary>管理信息</summary>
                <dl>
                  <dt>实现状态</dt>
                  <dd>{implementationLabels[selected.implementation]}</dd>
                  <dt>当前版本消费状态</dt>
                  <dd>
                    {isProjectScope
                      ? isDraft
                        ? "当前草稿可用"
                        : versionSupports
                          ? "冻结版已包含"
                          : "冻结版未包含"
                      : "公共基线不绑定版本"}
                  </dd>
                  <dt>内部组件 ID</dt>
                  <dd>
                    <code>{selected.componentId}</code>
                  </dd>
                  <dt>同步状态</dt>
                  <dd>{asset?.sync?.overall ?? "未记录"}</dd>
                </dl>
              </details>
            )}
            <section id="related">
              <h2>相关组件</h2>
              <div className="related-links">
                {related.map((item) => (
                  <Link
                    key={item.componentId}
                    to={componentHref(item.componentId)}
                    reloadDocument={isProjectScope}
                  >
                    {componentDisplayName(item.componentId)}
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <aside className="component-doc-toc" aria-label="本页目录">
        <div className="component-doc-toc__title">
          <List size={15} aria-hidden="true" />
          <strong>本页内容</strong>
        </div>
        <nav>
          {tocItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
