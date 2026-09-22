import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ProjectConfig } from '../types/design-system'
import { PreviewScope } from '../design-system/theme/PreviewScope'
import { DSAlert, DSBadge, DSButton, DSCheckbox, DSDialog, DSFileList, DSInput, DSTabs, DSTextArea, DSUpload } from '../runtime'
import { projectPreviewVariables, type ProjectThemeSettings } from '../services/project-theme'
import { themeEditorError } from '../services/theme-editor-model'
import { api, ApiError } from '../services/workspace-api'
import {
  applyDesignMarkdownChanges,
  DESIGN_MARKDOWN_IMPORT_LIMIT,
  type DesignMarkdownApplyResponse,
  type DesignMarkdownPreviewResponse,
  type DesignMarkdownThemeChange,
} from '../services/design-markdown-import'
import './DesignMarkdownImport.css'

interface Props {
  project: ProjectConfig
  theme: ProjectThemeSettings
  canEdit: boolean
  onApplied: (count: number) => void | Promise<void>
}

type Stage = 'source' | 'review'
type SourceMode = 'upload' | 'paste'

function valueText(value: string | number) {
  return typeof value === 'number' ? `${value}px` : value
}

function ChangeRow({ change, selected, onChange }: { change: DesignMarkdownThemeChange; selected: boolean; onChange: (selected: boolean) => void }) {
  return <li className="design-md-change">
    <div className="design-md-change__name"><DSCheckbox label={`${change.label}（--${change.token}）`} checked={selected} onChange={onChange} /><DSBadge tone={change.classification === 'confirmation' ? 'warning' : 'success'}>{change.classification === 'confirmation' ? '需要确认' : '可直接应用'}</DSBadge></div>
    <div className="design-md-change__values"><code>{valueText(change.before)}</code><span aria-hidden="true">→</span><code>{valueText(change.after)}</code></div>
    <p>{change.reason}</p>
  </li>
}

function CandidatePreview({ theme }: { theme: ProjectThemeSettings }) {
  const style = projectPreviewVariables(theme) as CSSProperties
  return <PreviewScope vars={style}><div className="design-md-candidate" style={style} inert aria-hidden="true">
    <header><div><strong>资源管理</strong><span>选中变更的草稿预览</span></div><DSBadge tone="info">未发布</DSBadge></header>
    <div className="design-md-candidate__controls"><DSInput label="资源名称" placeholder="输入关键词" /><DSButton variant="primary">查询</DSButton><DSButton variant="secondary">新增资源</DSButton></div>
    <div className="design-md-candidate__surface"><strong>内容区域</strong><span>文字、边框、圆角、间距与阴影均来自候选主题。</span></div>
  </div></PreviewScope>
}

export function DesignMarkdownImportDialog({ project, theme, canEdit, onApplied }: Props) {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>('source')
  const [sourceMode, setSourceMode] = useState<SourceMode>('upload')
  const [markdown, setMarkdown] = useState('')
  const [file, setFile] = useState<{ id: string; name: string; size: number } | null>(null)
  const [preview, setPreview] = useState<DesignMarkdownPreviewResponse | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<'reading' | 'preview' | 'apply' | null>(null)
  const [error, setError] = useState('')
  const requestSequence = useRef(0)
  const projectId = useRef(project.id)

  useEffect(() => {
    if (projectId.current === project.id) return
    projectId.current = project.id
    requestSequence.current++
    setOpen(false); setStage('source'); setMarkdown(''); setFile(null); setPreview(null); setSelected(new Set()); setBusy(null); setError('')
  }, [project.id])

  const resetAnalysis = (next: string, nextFile: typeof file = null) => {
    requestSequence.current++
    setMarkdown(next)
    setFile(nextFile)
    setPreview(null)
    setSelected(new Set())
    setStage('source')
    setBusy(null)
    setError('')
  }

  const readFiles = async (files: File[]) => {
    const next = files[0]
    if (!next) return
    if (!next.name.toLowerCase().endsWith('.md')) {
      setError('请选择 .md 格式的 Markdown 文件。')
      return
    }
    const ticket = ++requestSequence.current
    setBusy('reading'); setError('')
    try {
      const value = await next.text()
      if (ticket !== requestSequence.current) return
      if (!value.trim()) throw new Error('文件内容为空。')
      setMarkdown(value)
      setFile({ id: `${next.name}:${next.lastModified}`, name: next.name, size: next.size })
      setPreview(null); setSelected(new Set()); setStage('source'); setError('')
    } catch (reason) {
      if (ticket === requestSequence.current) setError(reason instanceof Error ? reason.message : '无法读取该文件。')
    } finally {
      if (ticket === requestSequence.current) setBusy(null)
    }
  }

  const analyze = async () => {
    const value = markdown.trim()
    if (!value) { setError('请先上传或粘贴 DESIGN.md。'); return }
    const ticket = ++requestSequence.current
    setBusy('preview'); setError('')
    try {
      const result = await api<DesignMarkdownPreviewResponse>(`/projects/${project.id}/draft/design-md/preview`, { method: 'POST', body: { markdown: value } })
      if (ticket !== requestSequence.current) return
      setPreview(result)
      setSelected(new Set(result.analysis.conflicts.length ? [] : result.analysis.changes.filter(change => change.classification === 'applicable').map(change => change.id)))
      setStage('review')
    } catch (reason) {
      if (ticket === requestSequence.current) setError(reason instanceof Error ? reason.message : '解析失败，请检查文档。')
    } finally {
      if (ticket === requestSequence.current) setBusy(null)
    }
  }

  const analysis = preview?.analysis
  const candidate = useMemo(() => analysis ? applyDesignMarkdownChanges(theme, analysis.changes, selected) : theme, [analysis, selected, theme])
  const candidateError = analysis ? themeEditorError(candidate) : ''
  const selectedCount = selected.size
  const automaticCount = analysis?.changes.filter(change => change.classification === 'applicable').length ?? 0
  const confirmationCount = analysis?.changes.filter(change => change.classification === 'confirmation').length ?? 0
  const automaticIds = analysis?.changes.filter(change => change.classification === 'applicable').map(change => change.id) ?? []
  const selectedAutomaticCount = automaticIds.filter(id => selected.has(id)).length

  const apply = async () => {
    if (!preview || !selectedCount || candidateError || analysis?.conflicts.length) return
    setBusy('apply'); setError('')
    try {
      const result = await api<DesignMarkdownApplyResponse>(`/projects/${project.id}/draft/design-md/apply`, {
        method: 'POST',
        body: { markdown, documentChecksum: preview.documentChecksum, baseRevision: preview.baseRevision, acceptedChangeIds: [...selected] },
      })
      try { await onApplied(result.appliedCount) }
      catch {
        setStage('source'); setPreview(null); setSelected(new Set()); setMarkdown(''); setFile(null)
        setError(`已写入 ${result.appliedCount} 项参数，但页面未能重新读取草稿；请刷新后确认。`)
        return
      }
      setOpen(false)
      setStage('source')
      setPreview(null)
      setSelected(new Set())
      setMarkdown('')
      setFile(null)
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : '应用失败，修改稿未写入。'
      setError(reason instanceof ApiError && reason.status === 409 ? `${message} 已保留导入内容和选择。` : message)
    } finally { setBusy(null) }
  }

  const close = (next: boolean) => { if (busy !== 'apply') setOpen(next) }
  const sourceTabs = [
    { id: 'upload', label: '上传 Markdown', content: <div className="design-md-source-panel"><DSUpload label="DESIGN.md 文件" accept=".md,text/markdown,text/plain" maxBytes={DESIGN_MARKDOWN_IMPORT_LIMIT} loading={busy === 'reading'} error={sourceMode === 'upload' ? error : ''} onError={setError} onFiles={files => void readFiles(files)} />{file && <DSFileList files={[file]} onRemove={() => resetAnalysis('')} />}<p>上传内容只在本地工作区服务中解析，不会执行其中的 HTML 或代码。</p></div> },
    { id: 'paste', label: '粘贴内容', content: <DSTextArea label="AI 修改后的 DESIGN.md" value={markdown} onChange={value => resetAnalysis(value)} rows={12} maxLength={DESIGN_MARKDOWN_IMPORT_LIMIT} placeholder={'---\nschema: "design-workspace/design-md-1"\n...'} description="保留文档开头的项目、版本和快照身份信息。" /> },
  ]

  return <>
    <DSButton variant="secondary" disabled={!canEdit} onClick={() => { setOpen(true); setError('') }}>{canEdit ? '导入 AI 修改稿' : '仅编辑者可导入'}</DSButton>
    <DSDialog open={open} onOpenChange={close} title="AI 规范回流" description="识别 AI 在项目 DESIGN.md 中修改的可控参数，只写入当前草稿。" size="lg" loading={busy === 'apply'} dismissible={busy !== 'apply'} closeOnEscape={busy !== 'apply'} footer={stage === 'source' ? <><DSButton variant="secondary" disabled={Boolean(busy)} onClick={() => setOpen(false)}>取消</DSButton><DSButton variant="primary" loading={busy === 'preview'} disabled={!markdown.trim() || Boolean(busy)} onClick={() => void analyze()}>解析并预览</DSButton></> : <><DSButton variant="secondary" disabled={Boolean(busy)} onClick={() => { setStage('source'); setError('') }}>返回修改</DSButton><DSButton variant="primary" loading={busy === 'apply'} disabled={!preview?.analysis.canApply || !selectedCount || Boolean(candidateError)} onClick={() => void apply()}>应用 {selectedCount} 项到当前草稿</DSButton></>}>
      {stage === 'source' ? <div className="design-md-source">
        <DSAlert title="只更新当前草稿" tone="info"><p>不会修改任何冻结版本，也不会自动发布。平台根 DESIGN.md 与其他项目的文档会被阻断。</p></DSAlert>
        <DSTabs label="Markdown 导入方式" value={sourceMode} disabled={Boolean(busy)} onChange={value => { setSourceMode(value as SourceMode); setError('') }} items={sourceTabs} />
        {sourceMode === 'upload' && markdown && <p className="design-md-ready" role="status">已读取 {file?.name ?? 'Markdown 内容'}，可以开始解析。</p>}
        {error && sourceMode === 'paste' && <p role="alert" className="design-md-error">{error}</p>}
      </div> : analysis && <div className="design-md-review">
        <div className="design-md-identity"><div><span>来源文档</span><strong>{analysis.identity.title}</strong></div><dl><div><dt>项目</dt><dd>{analysis.identity.projectId ?? '未识别'}</dd></div><div><dt>来源版本</dt><dd>{analysis.identity.releaseVersion ? `v${analysis.identity.releaseVersion}` : '未识别'}</dd></div><div><dt>目标</dt><dd>当前草稿</dd></div></dl></div>
        <div className="design-md-summary" aria-label="解析结果"><DSBadge tone="success">可直接应用 {automaticCount}</DSBadge><DSBadge tone="warning">需逐项确认 {confirmationCount}</DSBadge><DSBadge tone="info">仅供参考 {analysis.review.length}</DSBadge><DSBadge tone="error">阻断冲突 {analysis.conflicts.length}</DSBadge></div>
        {analysis.conflicts.length > 0 && <section className="design-md-findings" aria-labelledby="design-md-conflicts"><h3 id="design-md-conflicts">冲突或无法识别</h3>{analysis.conflicts.map(item => <DSAlert key={item.id} title={item.title} tone="error"><p>{item.detail}</p></DSAlert>)}</section>}
        {analysis.changes.length > 0 && <section className="design-md-change-section" aria-labelledby="design-md-changes"><div className="design-md-section-heading"><div><h3 id="design-md-changes">草稿变更</h3><p>三方对比“来源冻结版本 → AI 修改稿 → 当前草稿”，不会将 AI 未改的旧值带回。</p></div>{automaticIds.length > 0 && <DSCheckbox label="全选可直接应用项" checked={selectedAutomaticCount === automaticIds.length} indeterminate={selectedAutomaticCount > 0 && selectedAutomaticCount < automaticIds.length} onChange={checked => setSelected(current => { const next = new Set(current); for (const id of automaticIds) { if (checked) next.add(id); else next.delete(id) } return next })} />}</div><ul>{analysis.changes.map(change => <ChangeRow key={change.id} change={change} selected={selected.has(change.id)} onChange={checked => setSelected(current => { const next = new Set(current); if (checked) next.add(change.id); else next.delete(change.id); return next })} />)}</ul></section>}
        {analysis.review.length > 0 && <section className="design-md-findings" aria-labelledby="design-md-review-items"><h3 id="design-md-review-items">仅供参考</h3>{analysis.review.map(item => <DSAlert key={item.id} title={item.title} tone="info"><p>{item.detail}</p></DSAlert>)}</section>}
        {analysis.sourceUnchangedCount > 0 || analysis.alreadyAppliedCount > 0 ? <p className="design-md-ignored" role="status">已排除 AI 未修改的 {analysis.sourceUnchangedCount} 项原值{analysis.alreadyAppliedCount ? `；${analysis.alreadyAppliedCount} 项已与当前草稿一致` : ''}。</p> : null}
        {analysis.changes.length === 0 && analysis.conflicts.length === 0 && <DSAlert title="没有可写入的参数变更" tone="info"><p>这份修改稿的可映射 Token 没有改变；其他文本内容保留为人工评审项。</p></DSAlert>}
        {selectedCount > 0 && <section className="design-md-preview" aria-labelledby="design-md-preview-title"><div><h3 id="design-md-preview-title">选择后预览</h3><p>这是真实组件在候选主题下的效果，应用后仍需在“主题与风格”中确认。</p></div><CandidatePreview theme={candidate} /></section>}
        {candidateError && <DSAlert title="选中组合无法应用" tone="error"><p>{candidateError}</p></DSAlert>}
        {error && <p role="alert" className="design-md-error">{error}</p>}
        <details className="design-md-source-preview"><summary>查看导入原文</summary><pre><code>{markdown}</code></pre></details>
      </div>}
    </DSDialog>
  </>
}
