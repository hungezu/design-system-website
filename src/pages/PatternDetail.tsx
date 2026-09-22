import { PatternExample } from '../examples'
import { exampleUsage } from '../services/usage-code'
import { getDesktopComponentBinding } from '../design-system/component-bindings'
import { DSButton } from '../runtime'
import { PreviewScope } from '../design-system/theme/PreviewScope'
import { useFrozenTheme } from '../services/use-frozen-theme'
import { isDraftVersion } from '../services/release-catalog'
import { AlertTriangle, ArrowLeft, Check, ChevronDown, CircleDot, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Badge } from '../components/Badge'
import { patternAssets } from '../data/assets/patterns'
import { useProject } from '../app/project-context'
import { baselineThemeSettings, projectPreviewVariables, previewVariablesFromTheme } from '../services/project-theme'

const deleteIcons = [Trash2, AlertTriangle, AlertTriangle, Check, LoaderCircle, Check, RefreshCw]

function PatternDemo({ steps, style }: { steps: Array<{ title: string; description: string }>; style: CSSProperties }) {
  const [stage, setStage] = useState(0)
  const [message, setMessage] = useState('')
  const advance = () => {
    const next = Math.min(stage + 1, steps.length - 1)
    setStage(next)
    setMessage(next === steps.length - 1 ? '说明步骤已浏览完成，可重新查看。' : '')
  }
  const reset = () => { setStage(0); setMessage('') }
  return <PreviewScope vars={style}><section className="pattern-live-demo" style={style} aria-labelledby="pattern-demo-title"><div className="preview-stage__bar"><h2 id="pattern-demo-title">流程说明演示</h2><span>说明步骤，不执行数据操作</span></div><div className="pattern-live-demo__body"><div><strong>{steps[stage]?.title}</strong><p>{steps[stage]?.description}</p><div className="pattern-demo-actions">{stage > 0 && <DSButton variant="secondary" onClick={() => setStage((value) => Math.max(0, value - 1))}>上一步</DSButton>}{stage < steps.length - 1 ? <DSButton variant="primary" onClick={advance}>继续</DSButton> : <><DSButton variant="secondary" onClick={reset}>重新查看</DSButton></>}</div><p role="status" aria-live="polite">{message}</p></div><ol>{steps.map((step, index) => <li key={step.title} aria-current={index === stage ? 'step' : undefined}><span>{index + 1}</span>{step.title}</li>)}</ol></div></section></PreviewScope>
}

export function PatternDetail() {
  const { patternId = 'pattern-delete-confirmation', projectId } = useParams()
  const { project, projectTheme, theme } = useProject()
  const pattern = patternAssets.find((item) => item.id === patternId)
  const [params,setParams] = useSearchParams()
  const version = params.get('version')
  const historical = Boolean(projectId && version && !isDraftVersion(version))
  const frozen = useFrozenTheme(historical)
  const previewStyle = historical ? frozen.style ?? {} : projectId ? previewVariablesFromTheme(theme, projectTheme) : projectPreviewVariables(baselineThemeSettings)
  const versionQuery = projectId && version ? `?version=${encodeURIComponent(version)}` : ''
  const base = projectId ? `/projects/${project.id}/patterns` : '/patterns'
  const componentBase = projectId ? `/projects/${project.id}/components` : '/components'
  const componentId = (name: string) => ({'Description List':'descriptions','Permission Tag':'tag'} as Record<string,string>)[name] ?? name.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()

  if (!pattern) return <div className="page route-state"><h1>交互模式不可用</h1><p>该链接无效或模式已被移除。</p><Link className="primary-action" to={base + versionQuery}>返回交互模式</Link></div>

  return <div className="page pattern-detail-page">
    <Link className="back-link" to={base + versionQuery}><ArrowLeft size={16} />返回交互模式</Link>
    <header className="pattern-detail-header"><div><Badge>复杂任务模式</Badge><h1>{pattern.name}</h1><p>{pattern.description}</p></div><div className="pattern-composition"><span>组成组件</span><strong>{pattern.components.join(' · ')}</strong></div></header>
    <>{historical && !frozen.style ? <p role={frozen.error ? "alert" : "status"}>{frozen.error ? `冻结主题读取失败：${frozen.error}` : "正在读取冻结主题…"}</p> : <PatternDemo key={`${pattern.id}/${version}`} steps={pattern.steps} style={previewStyle} />}</>
    {(!historical || frozen.style) && <section><h2>可执行业务组合</h2><PreviewScope vars={previewStyle}><PatternExample key={`${pattern.id}/${params.get('scenario')??'default'}`} patternId={pattern.id} initialScenario={params.get('scenario')??undefined} onScenarioChange={value=>{const next=new URLSearchParams(params);next.set('scenario',value);setParams(next,{replace:true})}}/></PreviewScope><details className="developer-details"><summary>取用代码</summary><pre><code>{exampleUsage('PatternExample',{patternId:pattern.id,initialScenario:params.get('scenario')??undefined},previewStyle,{project:projectId?project.id:'global',version:projectId?version??'draft':'baseline'})}</code></pre></details></section>}
    <section className="pattern-flow" aria-labelledby="flow-title"><div className="preview-stage__bar"><h2 id="flow-title">交互流程</h2><span>{pattern.steps.length} 个必要步骤</span></div><div className={`pattern-flow__steps ${pattern.steps.length > 4 ? '' : 'pattern-flow__steps--compact'}`}>{pattern.steps.map((step, index) => { const Icon = pattern.id === 'pattern-delete-confirmation' ? deleteIcons[index] : CircleDot; return <div key={step.title}><span className="flow-node"><Icon size={17} /></span><span><strong>{step.title}</strong><small>{step.description}</small></span>{index < pattern.steps.length - 1 && <ChevronDown size={15} className="flow-arrow" />}</div> })}</div></section>
    <div className="pattern-detail-grid">
      <section><h2>使用场景</h2><ul>{pattern.usage.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h2>组成组件</h2><div className="component-sequence">{pattern.components.map((item) => <span key={item}>{getDesktopComponentBinding(componentId(item)) && (!projectId || (historical?frozen.componentIds??[]:project.componentIds).includes(componentId(item))) ? <Link to={`${componentBase}/${componentId(item)}${versionQuery}`} reloadDocument={Boolean(projectId)}>{item}</Link> : <span>{item}（组合说明，当前范围未提供）</span>}</span>)}</div></section>
      <section><h2>必要状态</h2><ul>{pattern.necessaryStates.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h2>注意事项</h2><ul>{pattern.notes.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section className="wide"><h2>组合规则</h2><ul className="rule-list">{pattern.rules.map((rule) => <li key={rule}><Check size={16} />{rule}</li>)}</ul></section>
    </div>
  </div>
}
