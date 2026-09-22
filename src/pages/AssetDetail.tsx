import { useFoundationSnapshot } from '../services/use-foundation-snapshot'
import { isDraftVersion } from '../services/release-catalog'
import { ArrowLeft, Check, ChevronRight } from 'lucide-react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { useProject } from '../app/project-context'
import { Badge } from '../components/Badge'
import { getAsset } from '../data/assets'
import { assetDestination } from '../services/asset-navigation'
import { projectCanAccessIcon } from '../services/icon-pack'
import { DSIcon } from '../runtime'


function IconDetail({ name, semantic, id, iconName, scope }: { name: string; semantic: string; id: string; iconName: string; scope: 'public' | 'project' }) {
  const { project } = useProject()
  return <>
    <section className="icon-detail-preview"><div className="icon-detail-preview__variants"><span><DSIcon name={iconName} size={36} weight="outline" decorative /><small>线性</small></span><span><DSIcon name={iconName} size={36} weight="filled" decorative /><small>面性</small></span></div><div><strong>{name}</strong><span>{semantic}</span></div></section>
    <section className="detail-section"><h2>使用方法</h2><p>{scope === 'project' ? '从当前项目 Icon Pack 引用该图标' : '从全局图标基线引用该图标'}，并为纯图标按钮提供可访问名称。</p></section>
    <details className="developer-details"><summary>开发详情</summary><div className="token-source-grid"><div><span>资源 ID</span><code>{id}</code></div><div><span>全局来源</span><strong>Icon Registry</strong></div>{scope === 'project' && <><div><span>项目图标包</span><strong>{project.name}</strong></div><div><span>继承关系</span><strong>全局注册表 → 当前项目 Icon Pack</strong></div></>}</div></details>
  </>
}

export function AssetDetail({ scope = 'public' }: { scope?: 'public' | 'project' }) {
  const { assetId = '' } = useParams()
  const location = useLocation()
  const asset = getAsset(assetId)
  const { project } = useProject()
  const params = new URLSearchParams(location.search)
  const historicalIcon = scope === 'project' && asset?.type === 'icon' && Boolean(params.get('version') && !isDraftVersion(params.get('version')))
  const snapshot = useFoundationSnapshot(historicalIcon)
  if (historicalIcon && snapshot.loading) return <div className="page"><p role="status">正在读取版本图标清单…</p></div>
  if (historicalIcon && snapshot.error) return <div className="page"><p role="alert">{snapshot.error}</p></div>
  const inaccessible = asset && ((asset.scope === 'project' && (scope !== 'project' || asset.ownerProjectId !== project.id)) || (scope === 'project' && asset.type === 'icon' && (historicalIcon ? !snapshot.iconIds.includes(asset.tags?.[1] ?? asset.id.replace(/^icon-/,'')) : !projectCanAccessIcon(project.id, asset.id))))
  if (!asset || inaccessible) return <div className="page"><h1>资源不可用</h1><p>该资源不存在，或不属于当前项目的可访问范围。</p><Link to={scope === 'project' ? `/projects/${project.id}/foundations` : '/assets'}>返回{scope === 'project' ? '项目设计规范' : '设计基础'}</Link></div>
  if (asset.type === 'token') {
    params.set('category','token');params.delete('q');params.delete('sort');params.delete('page')
    return <Navigate replace to={`${scope === 'project' ? `/projects/${project.id}/foundations` : '/assets'}?${params}#token-${asset.id}`} />
  }
  if (asset.type === 'component') return <Navigate replace to={scope === 'project' ? `/projects/${project.id}/components/${asset.id.replace(/^component-/, '')}` : `/components/${asset.id.replace(/^component-/, '')}`} />
  const destination = scope === 'project' ? `/projects/${project.id}/foundations/${asset.id}` : assetDestination(asset)
  if (location.pathname !== destination) return <Navigate replace to={destination + location.search + location.hash} />
  const parentPath = asset.type === 'template' ? '/templates' : scope === 'project' ? `/projects/${project.id}/foundations` : '/assets'
  const parentLabel = asset.type === 'template' ? '页面模板' : scope === 'project' ? '项目设计规范' : '设计基础'
  if (asset.type === 'icon') params.set('category','icon')
  return <div className="page asset-detail-page">
    <Link className="back-link" to={`${parentPath}${params.toString() ? `?${params}` : ''}`}><ArrowLeft size={16} />返回{parentLabel}</Link>
    <header className="asset-detail-header"><div><div className="asset-breadcrumb">{parentLabel}<ChevronRight size={13} />{asset.type === 'icon' ? '图标' : '页面模板'}</div><h1>{asset.name}</h1><p>{asset.description}</p></div></header>
    {asset.type === 'icon' ? <IconDetail name={asset.name} semantic={asset.semantic} id={asset.id} iconName={asset.tags?.[1] ?? 'help'} scope={scope} /> : <div className="generic-asset-detail"><section><h2>使用说明</h2><p>{asset.semantic}</p></section><section><h2>使用规则</h2><ul className="rule-list">{asset.rules.map((rule) => <li key={rule}><Check size={16} />{rule}</li>)}</ul></section>{asset.status !== 'stable' && <section><h2>需要注意</h2><Badge tone="warning">{asset.status === 'draft' ? '草稿' : '审核中'}</Badge></section>}</div>}
  </div>
}
