import { useEffect, useRef, useState } from 'react'
import { DSButton } from '../runtime'
import { api } from '../services/workspace-api'
import type { ProjectDeliveryStatus } from '../services/project-delivery'
import type { ReleaseCatalogEntry } from '../services/release-catalog'
import { loadAiDataBundle, type AiDataBundle } from '../services/ai-bundle'

function saveFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = filename; link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function FrontendDelivery({ projectId, version, canGenerate, release }: { projectId: string; version: string | null; canGenerate: boolean; release?: ReleaseCatalogEntry | null }) {
  const [result, setResult] = useState<ProjectDeliveryStatus | null>(null)
  const [aiBundle, setAiBundle] = useState<AiDataBundle | null>(null)
  const [aiBundleError, setAiBundleError] = useState('')
  const [error, setError] = useState(''), [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false), [attempt, setAttempt] = useState(0)
  const active = useRef(true), locked = useRef(false)
  const endpoint = `/projects/${encodeURIComponent(projectId)}/deliveries/${encodeURIComponent(version ?? '')}`
  const draft = !version || version === 'draft'
  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])
  useEffect(() => {
    if (draft) return
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const refresh = async () => {
      try {
        const next = await api<ProjectDeliveryStatus>(endpoint, { signal: controller.signal })
        if (controller.signal.aborted) return
        setResult(next); setError('')
        if (next.status === 'building') timer = setTimeout(() => void refresh(), 1500)
      } catch (err) { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : '交付信息读取失败。') }
    }
    void refresh()
    return () => { controller.abort(); clearTimeout(timer) }
  }, [draft, endpoint, attempt])
  useEffect(() => {
    if (draft || !release || release.version !== version) { setAiBundle(null); setAiBundleError(''); return }
    let current = true
    loadAiDataBundle(release).then(bundle => { if (current) { setAiBundle(bundle); setAiBundleError('') } }).catch(err => { if (current) setAiBundleError(err instanceof Error ? err.message : 'AI 规范数据读取失败。') })
    return () => { current = false }
  }, [draft, release, version])
  const generate = async () => {
    if (locked.current) return
    locked.current = true; setBusy(true); setError('')
    try {
      const next = await api<ProjectDeliveryStatus>(endpoint, { method: 'POST', body: {} })
      if (active.current) { setResult(next); setAttempt(value => value + 1) }
    } catch (err) { if (active.current) setError(err instanceof Error ? err.message : '生成失败，请重试。') }
    finally { locked.current = false; if (active.current) setBusy(false) }
  }
  const download = async () => {
    if (!result?.artifact || locked.current) return
    locked.current = true; setBusy(true); setError('')
    try {
      const response = await fetch(`/api${endpoint}/package`, { credentials: 'same-origin' })
      if (!response.ok) { const value = await response.json(); throw new Error(value.error ?? '下载失败，请重试。') }
      const data = await response.arrayBuffer()
      const checksum = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', data))).map(value => value.toString(16).padStart(2, '0')).join('')
      if (checksum !== result.artifact.sha256) throw new Error('下载内容与交付记录不一致，请重新读取后重试。')
      if (active.current) { saveFile(new Blob([data], { type: 'application/gzip' }), result.artifact.archiveName); setFeedback('组件包已下载。请同时保存 AI 设计规范、接入说明和依赖锁文件。') }
    } catch (err) { if (active.current) setError(err instanceof Error ? err.message : '下载失败，请重试。') }
    finally { locked.current = false; if (active.current) setBusy(false) }
  }
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); if (active.current) setFeedback('安装命令已复制。') }
    catch { if (active.current) setError('未能复制，请选择安装命令手动复制。') }
  }
  const artifact = result?.artifact
  const install = artifact ? `npm install ./${artifact.archiveName} --save-exact` : ''
  return <section className="frontend-delivery" aria-label="前端接入">
    <header><h2>前端接入</h2><p>{draft ? '发布并选择项目版本后，可生成对应的组件包。' : `项目 ${projectId} · v${version}。将这一版本的组件与主题安装到业务工程。`}</p></header>
    {draft ? <p>交付包包含冻结主题、正式控件、类型声明和接入说明。当前支持 React 19；业务数据和接口由接入工程负责。</p> : <>
      <section className="delivery-stage" aria-label="AI 规范数据">
        <h3>1. 规范数据</h3>
        <p>{aiBundle ? '冻结的规则、Token、组件、图标、Pattern 和页面模板已就绪，可交给 AI 或开发者读取。' : '正在准备冻结规范数据…'}</p>
        <div className="example-actions">{aiBundle && <DSButton variant="secondary" onClick={() => saveFile(new Blob([JSON.stringify(aiBundle, null, 2)], { type: 'application/json;charset=utf-8' }), `${projectId}-${version}-AI-数据包.json`)}>下载 AI 数据包</DSButton>}{result?.designSpec && <DSButton variant="secondary" onClick={() => saveFile(new Blob([result.designSpec!], { type: 'text/markdown;charset=utf-8' }), `${projectId}-${version}-DESIGN.md`)}>下载 AI 设计规范</DSButton>}</div>
        {aiBundle?.missingFiles.length ? <p role="status">未包含的兼容资产：{aiBundle.missingFiles.join('、')}</p> : null}
        {aiBundleError && <p role="alert">{aiBundleError}</p>}
      </section>
      <section className="delivery-stage" aria-label="可执行组件包">
      <h3>2. 可执行组件包</h3>
      {!result && !error && <p role="status">正在读取交付信息…</p>}
      {result?.status !== 'ready' && result?.message && <p role="status">{result.message}</p>}
      {(result?.status === 'not-generated' || result?.status === 'failed') && (canGenerate ? <DSButton variant="primary" loading={busy} onClick={() => void generate()}>{result.status === 'failed' ? '重新生成组件包' : '生成前端组件包'}</DSButton> : <p>请项目管理员生成组件包；生成后你可以在这里下载。</p>)}
      {result?.status === 'building' && <p>生成完成后会自动显示下载入口，离开页面不会取消生成。</p>}
      {result?.status === 'ready' && artifact && <>
        <dl className="delivery-facts"><div><dt>组件包</dt><dd>{artifact.packageName} · {artifact.packageVersion}</dd></div><div><dt>支持环境</dt><dd>React 19 · 客户端 Web</dd></div><div><dt>项目组件</dt><dd>{artifact.componentIds.length} 项 · {(artifact.bytes / 1024 / 1024).toFixed(1)} MB</dd></div></dl>
        <div className="example-actions"><DSButton variant="primary" loading={busy} onClick={() => void download()}>下载组件包</DSButton><DSButton variant="secondary" onClick={() => saveFile(new Blob([result.guide ?? ''], { type: 'text/markdown;charset=utf-8' }), `${projectId}-${version}-接入说明.md`)}>下载接入说明</DSButton></div>
        <p>交给 AI 时，同时提供本版本的设计规范和组件包。规范中的 Token、组件清单与版本关联均来自此冻结快照。</p>
        <h3>安装到你的工程</h3><p>将下载的包放入业务工程，运行以下命令并提交依赖锁文件。</p><pre><code>{install}</code></pre><DSButton variant="secondary" size="sm" onClick={() => void copy(install)}>复制安装命令</DSButton>
        <h3>应用项目主题</h3><pre><code>{`import { ProjectTheme, DSButton } from '${artifact.packageName}'\nimport '${artifact.packageName}/style.css'\n\n<ProjectTheme>\n  <DSButton variant="primary" onClick={onSave}>保存</DSButton>\n</ProjectTheme>`}</code></pre>
        <p>将字段值、表格数据、校验和提交回调接到业务接口。包内 examples/ControlledForm.tsx 提供受控表单用法，运行时无需连接设计管理平台。</p>
        <details><summary>升级、回退与版本关联</summary><p>先比较新旧版本并验证业务页面，再显式安装新版。回退时恢复原包与锁文件；业务数据结构变更另行处理。草稿修改不会改变已安装的包。</p><p>项目批准使用的组件：{artifact.componentIds.join('、')}</p><dl><dt>组件运行时</dt><dd><code>{artifact.runtimeBuildId}</code></dd><dt>包 SHA-256</dt><dd><code>{artifact.sha256}</code></dd><dt>生成时间</dt><dd>{new Date(artifact.createdAt).toLocaleString('zh-CN')}</dd></dl></details>
      </>}
      {error && <p role="alert">{error}</p>}{feedback && <p role="status">{feedback}</p>}
      {(error || result?.status === 'unavailable') && <DSButton variant="secondary" disabled={busy} onClick={() => { setError(''); setResult(null); setAttempt(value => value + 1) }}>重新读取交付信息</DSButton>}
      </section>
    </>}
  </section>
}
