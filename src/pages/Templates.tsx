import { TemplateExample } from '../examples'
import { exampleUsage } from '../services/usage-code'
import { useFrozenTheme } from '../services/use-frozen-theme';
import { PreviewScope } from '../design-system/theme/PreviewScope';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useProject } from "../app/project-context";
import { PageHeader } from "../components/PageHeader";
import { SegmentedControl } from "../components/NavigationControls";
import { templateAssets } from "../data/assets/templates";
import {
  DSButton,
} from "../runtime";
import {
  baselineThemeSettings,
  projectPreviewVariables,
  previewVariablesFromTheme,
} from "../services/project-theme";
import { isDraftVersion } from "../services/release-catalog";

const templateNames: Record<string, string> = {
  "template-list": "查询列表",
  "template-detail": "详情页",
  "template-form": "表单页",
  "template-dashboard": "业务总览",
};
const listVariants = [
  { value: "basic", label: "基础列表" },
  { value: "advanced", label: "多条件查询" },
  { value: "bulk", label: "批量管理" },
  { value: "grouped-header", label: "多级表头" },
  ...["empty","no-results","loading","error","readonly","long","permission"].map(value=>({value,label:({empty:"空数据","no-results":"无结果",loading:"加载",error:"错误",readonly:"只读",long:"长内容",permission:"权限不足"} as Record<string,string>)[value]})),
] as const;
const detailVariants = [
  { value: "basic", label: "信息概览" },
  { value: "related", label: "关联信息" },
  ...["empty","loading","error","readonly","long","permission"].map(value=>({value,label:({empty:"空数据","no-results":"无结果",loading:"加载",error:"错误",readonly:"只读",long:"长内容",permission:"权限不足"} as Record<string,string>)[value]})),
] as const;
const formVariants = [
  { value: "basic", label: "单页表单" },
  { value: "grouped", label: "分组表单" },
  ...["loading","error","readonly","long","permission","invalid"].map(value=>({value,label:({empty:"空数据","no-results":"无结果",loading:"加载",error:"错误",readonly:"只读",long:"长内容",permission:"权限不足",invalid:"校验错误"} as Record<string,string>)[value]})),
] as const;

export function Templates() {
  const { assetId, projectId } = useParams();
  const { project, projectTheme, theme, release } =
    useProject();
  const [params, setParams] = useSearchParams();
  const template = assetId
    ? templateAssets.find((item) => item.id === assetId)
    : null;
  const isProjectScope = Boolean(projectId);
  const requestedVariant = params.get("variant");
  const [feedback, setFeedback] = useState("");
  const base = isProjectScope
    ? `/projects/${project.id}/templates`
    : "/templates";
  const requestedVersion = params.get("version");
  const isHistorical = Boolean(
    isProjectScope &&
      requestedVersion &&
      !isDraftVersion(requestedVersion),
  );
  const frozen = useFrozenTheme(isHistorical);
  const variantOptions =
    template?.id === "template-list"
      ? listVariants.filter(item=>item.value!=="grouped-header"||!isHistorical||frozen.supportsTableComposition)
      : template?.id === "template-form"
        ? formVariants
        : detailVariants;
  const variant = variantOptions.some((item) => item.value === requestedVariant)
    ? requestedVariant!
    : "basic";

  const previewStyle = isHistorical ? frozen.style ?? {} : isProjectScope ? previewVariablesFromTheme(theme, projectTheme) : projectPreviewVariables(baselineThemeSettings);
  const setVariant = (value: string) => {
    if(document.querySelector('.resource-workflow[data-unsaved="true"]')&&!window.confirm('当前编辑尚未保存，确定切换方案并放弃修改吗？'))return;
    const next = new URLSearchParams(params);
    if (value === "basic") next.delete("variant");
    else next.set("variant", value);
    setParams(next, { replace: true });
  };
  const copy = async () => {
    const snippet = exampleUsage('TemplateExample', {templateId:template?.id,variant}, previewStyle, {project:isProjectScope?project.id:'global',version:isProjectScope?params.get('version')??'draft':'baseline'});
    try {
      await navigator.clipboard.writeText(snippet);
      setFeedback("代码已复制。");
    } catch {
      setFeedback("剪贴板不可用，请手动选择代码。");
    }
  };

  if (assetId && !template)
    return (
      <div className="page">
        <h1>页面模板不可用</h1>
        <p>该链接无效或模板已被移除。</p>
        <Link to={`${base}${params.get("version")?`?version=${encodeURIComponent(params.get("version")!)}`:""}`}>返回页面模板</Link>
      </div>
    );
  if (!template)
    return (
      <div className="page">
        <PageHeader
          title={isProjectScope ? "项目页面模板" : "页面模板"}
          description={
            isProjectScope
              ? "这些模板复用公共结构，并应用当前项目已保存的主题。"
              : "直接浏览和体验团队内跨项目复用的页面结构；默认使用通用基线。"
          }
        />
        <div className="template-list">
          {templateAssets.slice(0, 3).map((item, index) => (
            <Link
              key={item.id}
              to={`${base}/${item.id}${params.toString() ? `?${params}` : ""}`}
            >
              <span className="template-list__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="template-list__copy">
                <strong>{templateNames[item.id] ?? item.name}</strong>
                <small>{item.description}</small>
              </span>
              <span className="template-list__meta">
                <span>{item.tags?.[1] ?? "页面"}</span>
                <span>
                  {item.id === "template-list" ? listVariants.length : item.id === "template-form" ? formVariants.length : detailVariants.length} 个方案
                </span>
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    );

  return (
    <div className="page template-detail-page">
      <Link className="back-link" to={`${base}${params.get("version")?`?version=${encodeURIComponent(params.get("version")!)}`:""}`}>
        <ArrowLeft size={15} />
        返回页面模板
      </Link>
      <PageHeader
        title={templateNames[template.id] ?? template.name}
        description={template.description}
        actions={!isProjectScope ?
          <Link
            className="secondary-action"
            to={
              isProjectScope
                ? `/templates/${template.id}${params.toString() ? `?${params}` : ""}`
                : `/projects/${project.id}/templates/${template.id}${params.toString() ? `?${params}` : ""}`
            }
          >
            {isProjectScope ? "查看通用基线" : `使用${project.shortName}效果`}
          </Link> : undefined
        }
      />
      {isHistorical && (
        <div className="readonly-notice">
          当前为历史版本 v{release?.version}，预览使用该版本的原始主题。
        </div>
      )}
      <SegmentedControl
        label="页面方案"
        value={variant}
        onChange={setVariant}
        options={[...variantOptions]}
      />
      {isHistorical && !frozen.style ? <p role={frozen.error ? "alert" : "status"}>{frozen.error ? `冻结主题读取失败：${frozen.error}` : "正在读取冻结主题…"}</p> : <PreviewScope vars={previewStyle}><div className="template-preview-shell" style={previewStyle}>
        <TemplateExample key={`${template.id}/${variant}/${params.get('version')}`} templateId={template.id} variant={variant}/>
      </div></PreviewScope>}
      <details className="developer-details">
        <summary>使用说明与代码</summary>
        {isProjectScope && <p><Link className="text-action" to={`/templates/${template.id}${variant !== 'basic' ? `?variant=${encodeURIComponent(variant)}` : ''}`}>对照通用基线</Link></p>}
        <section>
          <h2>适用场景</h2>
          <p>{template.semantic}</p>
          <ul className="rule-list">
            {template.rules.map((rule) => (
              <li key={rule}>
                <Check size={15} />
                {rule}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2>AI 模板契约</h2>
          <p><strong>{template.status === 'stable' ? '稳定' : template.status === 'review' ? '审核中' : '草稿'}</strong> · {template.schemaVersion} · v{template.templateVersion}</p>
          <dl className="definition-list"><div><dt>任务意图</dt><dd>{template.intent}</dd></div><div><dt>必需组件</dt><dd>{template.requiredComponents.join('、') || '待确认'}</dd></div><div><dt>必要状态</dt><dd>{template.necessaryStates.join('、')}</dd></div><div><dt>参考实现</dt><dd><code>{template.example}</code></dd></div></dl>
          <h3>页面槽位</h3><ul className="rule-list">{template.slots.map(slot => <li key={slot.id}><Check size={15}/><span><strong>{slot.label}</strong>{slot.required ? '（必需）' : '（可选）'}：{slot.accepts.join('、')}</span></li>)}</ul>
        </section>
        <section>
          <h2>已有代码</h2>
          <pre tabIndex={0} aria-label="模板引用代码">
            <code>{exampleUsage('TemplateExample',{templateId:template.id,variant},previewStyle,{project:isProjectScope?project.id:'global',version:isProjectScope?params.get('version')??'draft':'baseline'})}</code>
          </pre>
          <DSButton
            className="secondary-action"
            variant="secondary"
            icon={<Copy size={14} />}
            onClick={copy}
          >
            复制代码
          </DSButton>
          <p role="status">{feedback}</p>
        </section>
      </details>
    </div>
  );
}
