import { FrontendDelivery } from '../components/FrontendDelivery'
import { DeliveryAcceptance } from '../components/DeliveryAcceptance'
import { WorkspaceTransfer, LegacyWorkspaceExport } from '../components/WorkspaceTransfer'
import { compareReleaseAssets, type ReleaseDifference } from '../services/release-diff'
import { loadReleaseAsset } from '../services/release-catalog'
import { AlertTriangle, ArrowRight, Check, History } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { canManage, useAccess } from '../app/access-context'
import { useProject } from '../app/project-context'
import { PageHeader } from '../components/PageHeader'
import { DesignMarkdownImportDialog } from '../components/DesignMarkdownImportDialog'
import { DSButton, DSDialog, DSInput } from '../runtime'
import { compareReleaseEntries, DRAFT_VERSION, isDraftVersion, nextPatchVersion } from '../services/release-catalog'
import { api } from '../services/workspace-api'
import type { ProjectDeliveryPreflight } from '../services/project-delivery'
import systemManifest from '../../system.manifest.json'

export function Releases() {
  const { project, projectTheme, releases, release, releaseLoading, releaseError, setReleaseVersion, publishDraft, reloadProjectTheme } = useProject()
  const { user } = useAccess()
  const [params, setParams] = useSearchParams()
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishVersion, setPublishVersion] = useState('')
  const [publishNote, setPublishNote] = useState('')
  const [publishError, setPublishError] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [preflight, setPreflight] = useState<ProjectDeliveryPreflight | null>(null)
  const [preflightLoading, setPreflightLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const requestedVersion = params.get('version')
  const viewingDraft = !requestedVersion || isDraftVersion(requestedVersion)
  const chooseVersion = (version: string) => {
    if (version !== DRAFT_VERSION) setReleaseVersion(version)
    const next = new URLSearchParams(params)
    next.set('version', version)
    next.delete('compare')
    setParams(next)
  }
  const compareVersion = params.get('compare') ?? ''
  const previous = useMemo(() => releases.find((item) => item.version === compareVersion), [compareVersion, releases])
  const comparing=!viewingDraft&&previous&&release&&release.version===requestedVersion&&previous.version!==release.version
  const differences = comparing ? compareReleaseEntries(previous, release) : null
  const compareKey=comparing?`${previous.projectId}/${previous.version}/${release.version}`:''
  const [diffResult,setDiffResult]=useState<{key:string;data?:ReleaseDifference;error?:string}|null>(null)
  const assetDiff=diffResult?.key===compareKey?diffResult.data??null:null
  const assetDiffError=diffResult?.key===compareKey?diffResult.error??'':''
  useEffect(()=>{if(!comparing)return;let active=true;compareReleaseAssets(previous,release).then(data=>{if(active)setDiffResult({key:compareKey,data})}).catch(error=>{if(active)setDiffResult({key:compareKey,error:String(error)})});return()=>{active=false}},[previous,release,comparing,compareKey])
  const snapshotKey=release&&!viewingDraft&&release.version===requestedVersion?`${release.projectId}/${release.version}`:''
  const [snapshotResult,setSnapshotResult]=useState<{key:string;data?:Record<string,unknown>;error?:string}|null>(null)
  const snapshotInfo=snapshotResult?.key===snapshotKey?snapshotResult.data:null
  const snapshotError=snapshotResult?.key===snapshotKey?snapshotResult.error:null
  useEffect(()=>{if(!release||viewingDraft||release.version!==requestedVersion)return;let active=true;loadReleaseAsset<Record<string,unknown>>(release,'manifest.json').then(data=>{if(active)setSnapshotResult({key:snapshotKey,data})}).catch(error=>{if(active)setSnapshotResult({key:snapshotKey,error:String(error)})});return()=>{active=false}},[release,viewingDraft,snapshotKey,requestedVersion])
  const sourceAheadOfRelease = project.id === 'guokexin' && releases[0]?.version === systemManifest.releasePolicy.guokexinLegacyCutoff
  const differenceRows = differences ? [
    { label: '修改', active: differences.versionChanged, detail: `版本从 v${previous?.version} 切换到 v${release?.version}` },
    { label: '迁移影响', active: differences.migrationChanged, detail: '版本治理状态发生变化，消费前需要核对迁移说明。' },
    { label: '处理建议', active: differences.checksumChanged, detail: '发布内容校验值不同，建议重新执行消费侧回归。' },
    { label: '新增', active: false, detail: '发布索引未提供逐资产新增清单。' },
    { label: '废弃', active: false, detail: '发布索引未提供逐资产废弃清单。' },
  ] : []

  const openPublish = () => {
    setPublishVersion(nextPatchVersion(releases))
    setPublishNote('')
    setPublishError('')
    setPublishOpen(true)
    setPreflight(null)
    setPreflightLoading(true)
    api<ProjectDeliveryPreflight>(`/projects/${project.id}/deliveries/preflight`).then(setPreflight).catch(error => setPreflight({ status: 'unavailable', snapshotReady: false, runtimeBuildId: '', message: error instanceof Error ? error.message : '交付预检失败。' })).finally(() => setPreflightLoading(false))
  }
  const confirmPublish = async () => {
    setPublishing(true)
    setPublishError('')
    try {
      const entry = await publishDraft({ version: publishVersion, note: publishNote, requireDeliverable: preflight?.status === 'ready' })
      const next = new URLSearchParams(params)
      next.set('version', entry.version)
      next.delete('compare')
      setParams(next)
      setFeedback(`v${entry.version} 已发布为${entry.deliveryKind === 'executable-ready' ? '可交付版本' : '规范数据快照'}并切换为当前版本。`)
      setPublishOpen(false)
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : '发布失败，请稍后重试。')
    } finally {
      setPublishing(false)
    }
  }

  return <div className="page releases-page">
    <PageHeader title="版本记录" description="查看当前项目的历史版本并进行结构化比较。发布文件和内部校验字段仅向管理员展开。" />
    <ol className="release-flow" aria-label="版本交付流程"><li><strong>1</strong><span>设计检查</span></li><li><strong>2</strong><span>发布预检</span></li><li><strong>3</strong><span>冻结版本</span></li><li><strong>4</strong><span>规范/组件交付</span></li><li><strong>5</strong><span>业务验收</span></li></ol>
    {sourceAheadOfRelease && <div className="readonly-notice" role="status"><AlertTriangle size={16} />当前源码已以 {systemManifest.brand.primary} 为品牌基准；最新冻结版 v{releases[0]?.version} 仍是历史色板，下一版需通过新发布收口。</div>}
    {releaseLoading && <p role="status">正在读取版本记录…</p>}
    {releaseError && <p role="alert">版本记录读取失败：{releaseError}</p>}
    <FrontendDelivery key={`${project.id}:${requestedVersion}`} projectId={project.id} version={requestedVersion} release={!viewingDraft && release?.version === requestedVersion ? release : null} canGenerate={canManage(user.role)} />
    <section className="release-list" aria-label="当前草稿与历史版本">
      <article className={viewingDraft ? 'release-item release-item--current' : 'release-item'}><div><strong>当前草稿</strong><span>{viewingDraft ? '当前上下文' : '未发布'}</span></div><p>使用 system.manifest.json、当前项目 Token 和主工程 Runtime Registry。</p><div className="release-actions"><DesignMarkdownImportDialog project={project} theme={projectTheme} canEdit={user.role !== 'viewer'} onApplied={async count => { chooseVersion(DRAFT_VERSION); setFeedback(`已将 AI 修改稿的 ${count} 项参数写入当前草稿。请在“主题与风格”中确认后发布新版本。`); try { await reloadProjectTheme?.() } catch { setFeedback(`已写入 ${count} 项参数，但页面未能重新读取草稿；请刷新后确认。`) } }} />{canManage(user.role) && <DSButton variant="primary" onClick={openPublish}>发布正式版本</DSButton>}<DSButton variant="secondary" disabled={viewingDraft} onClick={() => chooseVersion(DRAFT_VERSION)}>{viewingDraft ? '正在使用' : '切换草稿'}</DSButton></div></article>
      {releases.map((item) => {
      const current = !viewingDraft && item.version === requestedVersion
      const legacy = item.migrationStatus === 'legacy-unfrozen'
      return <article key={item.dir} className={current ? 'release-item release-item--current' : 'release-item'}><div><strong>v{item.version}</strong><span>{current ? '当前版本' : '历史版本'}</span></div><p>{item.label}</p>{legacy ? <span className="release-risk"><AlertTriangle size={14} />旧版未冻结</span> : <span className="release-kind">{item.deliveryKind === 'executable-ready' ? '发布时可交付' : item.deliveryKind === 'specification' ? '规范数据快照' : '交付状态待检查'}</span>}<div className="release-actions"><DSButton size="sm" variant="secondary" disabled={current} onClick={() => chooseVersion(item.version)}>{current ? '正在使用' : '切换版本'}</DSButton><DSButton size="sm" variant="tertiary" disabled={current||viewingDraft} onClick={() => { const next = new URLSearchParams(params); next.set('compare', item.version); setParams(next) }}>选择对比</DSButton></div>{canManage(user.role) && <details><summary>管理信息</summary><code>{item.releaseId ?? item.dir}</code><span>{item.source === 'server' ? '工作区正式版' : item.source === 'local' ? '本地正式版' : item.migrationStatus === 'frozen' ? '已冻结' : item.migrationStatus === 'migrated' ? '已迁移' : '旧版未冻结'}</span></details>}</article>
    })}</section>
    {feedback && <p className="release-feedback" role="status">{feedback}{feedback.startsWith('已将 AI 修改稿') && <> <Link to={`/projects/${project.id}/foundations/theme?version=draft`}>打开主题与风格</Link></>}</p>}
    {comparing && <section className="release-compare"><header><History size={18} /><div><h2>版本对比</h2><p>v{previous.version}<ArrowRight size={14} />v{release.version}</p></div></header><div>{differenceRows.filter((row) => row.active).length ? differenceRows.filter((row) => row.active).map((row) => <article key={row.label}><strong>{row.label}</strong><span>{row.detail}</span></article>) : <div className="release-no-change"><Check size={16} />未发现索引级差异</div>}</div>{assetDiffError&&<p role="alert">{assetDiffError}</p>}{!assetDiff&&!assetDiffError&&<p role="status">正在读取实际资产差异…</p>}{assetDiff&&<><h3>实际资产差异（{assetDiff.changes.length}）</h3>{assetDiff.changes.length>0&&<div className="release-diff-summary" aria-label="差异摘要"><span>新增 {assetDiff.changes.filter(row=>row.kind==='added').length}</span><span>修改 {assetDiff.changes.filter(row=>row.kind==='changed').length}</span><span>移除 {assetDiff.changes.filter(row=>row.kind==='removed').length}</span>{assetDiff.changes.some(row=>row.asset==='components.json'&&row.kind!=='added')&&<strong>包含组件契约变化，升级前需回归</strong>}</div>}{assetDiff.changes.length?<div className="release-diff-table"><table><thead><tr><th>资产</th><th>条目</th><th>变化</th><th>之前</th><th>之后</th></tr></thead><tbody>{assetDiff.changes.map(row=><tr key={row.asset+row.id}><td>{row.asset}</td><td>{row.id}</td><td>{row.kind === 'added' ? '新增' : row.kind === 'removed' ? '移除' : '修改'}</td><td><code>{JSON.stringify(row.before)??'—'}</code></td><td><code>{JSON.stringify(row.after)??'—'}</code></td></tr>)}</tbody></table></div>:<p>已读取的资产未发现差异。</p>}{assetDiff.unavailable.map(item=><p key={item.asset} role="status">未能比较 {item.asset}：{item.reason}</p>)}</>}</section>}
    {compareVersion&&viewingDraft&&<p role="status">草稿不参与冻结版本对比，请先选择一个冻结版本。</p>}
    {compareVersion&&!previous&&<p role="alert">对比版本不可用：{compareVersion}</p>}
    {snapshotError&&<p role="alert">快照说明读取失败：{snapshotError}</p>}
    {snapshotInfo&&<details className="developer-details"><summary>当前快照内容与兼容范围</summary><pre>{JSON.stringify(snapshotInfo.snapshotCoverage??{schema:snapshotInfo.schemaVersion,notice:'历史快照缺少完整覆盖说明；以实际文件读取结果为准。'},null,2)}</pre></details>}
    {!viewingDraft && release?.version === requestedVersion && <DeliveryAcceptance projectId={project.id} version={release.version} canEdit={user.role !== 'viewer'} />}
    <WorkspaceTransfer/>{user.platformRole === 'admin' && <details className="developer-details"><summary>旧版浏览器数据备份</summary><LegacyWorkspaceExport/></details>}
    <DSDialog
      open={publishOpen}
      onOpenChange={setPublishOpen}
      title="发布正式版本"
      description="先检查当前 Runtime 是否可生成组件包，再明确发布为可交付版本或仅规范快照。"
      dismissible={!publishing}
      closeOnEscape={!publishing}
      footer={<><DSButton variant="secondary" disabled={publishing} onClick={() => setPublishOpen(false)}>取消</DSButton><DSButton variant="primary" loading={publishing || preflightLoading} disabled={preflightLoading || !preflight} onClick={confirmPublish}>{preflight?.status === 'ready' ? '发布可交付版本' : '仅发布规范快照'}</DSButton></>}
    >
      <div className="release-publish-form">
        <DSInput label="版本号" value={publishVersion} onChange={setPublishVersion} placeholder="例如 1.5.6" invalid={Boolean(publishError)} errorMessage={publishError} />
        <DSInput label="版本说明" value={publishNote} onChange={setPublishNote} placeholder="例如更新项目主题" />
        <div className={`release-preflight release-preflight--${preflight?.status ?? 'loading'}`} role="status"><strong>交付预检</strong><p>{preflightLoading ? '正在检查快照和组件运行时…' : preflight?.message ?? '尚未完成预检。'}</p></div>
        <p className="muted-copy">{preflight?.status === 'ready' ? '发布后可生成匹配的组件包和 AI 规范数据。' : '仅规范快照仍会冻结 Token、组件契约和模板数据，但不声称可执行交付。'}</p>
      </div>
    </DSDialog>
  </div>
}
