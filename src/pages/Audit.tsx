import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProject } from '../app/project-context'
import { PageHeader } from '../components/PageHeader'
import { DSButton, DSTextArea } from '../runtime'
import { previewVariablesFromTheme } from '../services/project-theme'
import { useFrozenTheme } from '../services/use-frozen-theme'
import { runSystemChecks, type SystemFinding } from '../services/system-check'

const severityLabels = { pass: '通过', warning: '提醒', error: '错误', unverified: '未能验证' }
export function Audit() {
  const { project, theme, projectTheme } = useProject()
  const [params] = useSearchParams()
  const version = params.get('version') ?? 'draft'
  const historical = version !== 'draft'
  const frozen = useFrozenTheme(historical)
  const [source, setSource] = useState('')
  const [result, setResult] = useState<{ key: string; findings: SystemFinding[] } | null>(null)
  const variables = historical ? frozen.style : previewVariablesFromTheme(theme, projectTheme)
  const componentIds = historical ? frozen.componentIds : project.componentIds
  const key = JSON.stringify([project.id, version, variables, componentIds, source])
  const findings = result?.key === key ? result.findings : null
  return <div className="page audit-page">
    <PageHeader title="设计检查" description="发布或交付前，检查当前项目的配色可读性，以及代码是否引用了有效的组件和变量。" />
    <p>范围：{project.name} / {version}</p>
    <ul>
      <li>不填代码也可检查：占位文字、主要按钮文字与背景的对比度是否达到 4.5:1。</li>
      <li>粘贴 JSX / CSS 后，还会定位不存在的组件、未定义变量，以及未纳入当前版本的组件。</li>
    </ul>
    <DSTextArea label="待检查的 JSX / CSS（可选）" value={source} onChange={setSource} rows={8} placeholder="粘贴需要检查的组件或样式片段；留空仅检查项目配色" />
    <DSButton variant="primary" disabled={!variables || !componentIds} onClick={() => variables && componentIds && setResult({ key, findings: runSystemChecks({ variables, componentIds, source }) })}>执行本地规则检查</DSButton>
    {frozen.error && <p role="alert">{frozen.error}</p>}
    {findings && <section aria-label="规则检查结果"><h2>检查结果</h2>
      <p>{findings.filter(row => row.severity === 'pass').length} 项通过，{findings.filter(row => row.severity === 'error').length} 项错误，{findings.filter(row => row.severity === 'warning').length} 项提醒，{findings.filter(row => row.severity === 'unverified').length} 项未能验证。</p>
      <ul>{findings.map((row, index) => <li key={row.rule + index}><strong>{severityLabels[row.severity]}</strong><p>{row.line ? `第 ${row.line} 行：` : ''}{row.evidence}</p></li>)}</ul>
    </section>}
    <p>检查在本机运行，不执行输入代码，也不调用 AI。结果不代表页面布局、交互流程、权限或完整可访问性已通过验收。</p>
  </div>
}
