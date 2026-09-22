import { ArrowLeft, Check, GitBranch, Layers3 } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAccess } from '../app/access-context'
import { useProject } from '../app/project-context'
import { getPlatform } from '../data/platforms'
import { getProject, projects } from '../data/projects'
import { getAsset } from '../data/assets'
import { projectDestination } from '../services/asset-navigation'

export function ProjectDetail() {
  const { projectId = '' } = useParams()
  const [params] = useSearchParams()
  const { projectRole } = useAccess()
  const { project: currentProject, projectTheme, theme, setProjectId } = useProject()
  const project = getProject(projectId) ?? projects[0]
  const platform = getPlatform(project.platform)
  const isCurrent = currentProject.id === project.id
  const canEditTheme = ['editor','project-admin'].includes(projectRole(project.id) ?? '')
  const sourceLabels = { global: '通用继承', platform: '平台适配', project: '项目覆盖', asset: '资产映射', release: '冻结版本', compatibility: '历史兼容基线' }

  return (
    <div className="page project-detail-page">
      <Link className="back-link" to="/projects"><ArrowLeft size={16} />返回项目</Link>
      <header className="project-detail-header">
        <div className="project-detail-header__mark" style={{ background: theme.values['brand-primary'] }}><Layers3 size={24} /></div>
        <div><h1>{project.name}</h1><p>{project.description}</p></div>
        {canEditTheme && <Link className="primary-action project-theme-entry" to={`/projects/${project.id}/foundations/theme?version=draft`}>配置项目主题</Link>}
        {!isCurrent && <button className="primary-action" onClick={() => setProjectId(project.id)}>设为当前项目</button>}
      </header>
      <div className="project-detail-grid">
        <div className="project-detail-main">
          <section className="detail-section"><h2>项目摘要</h2><dl className="definition-list"><div><dt>平台</dt><dd>{platform?.name}</dd></div><div><dt>主题</dt><dd>{projectTheme.mode === 'dark' ? '深色' : '浅色'}</dd></div><div><dt>信息密度</dt><dd>{projectTheme.density === 'compact' ? '紧凑' : projectTheme.density === 'comfortable' ? '舒适' : '宽松'}</dd></div><div><dt>字体</dt><dd>{projectTheme.fontFamily.replaceAll('"', '')}</dd></div></dl><div className="project-shortcuts"><Link to={projectDestination(project.id, 'foundations', params)}>查看设计规范</Link><Link to={projectDestination(project.id, 'components', params)}>查看项目组件</Link><Link to={projectDestination(project.id, 'templates', params)}>查看项目模板</Link></div></section>
          <details className="developer-details"><summary>查看变量来源</summary><section><h2>设计变量覆盖</h2><div className="override-table"><div className="override-table__header"><span>语义变量</span><span>解析值</span><span>来源</span></div>{Object.entries(theme.values).slice(0, 12).map(([key, value]) => <div key={key}><span><i style={{ background: key.includes('color') || key.includes('surface') || key.includes('text') || key.includes('brand') || key.includes('border') || key.includes('status') ? value : 'transparent' }} /><code>{key}</code></span><code>{value}</code><span>{sourceLabels[theme.sources[key]]}</span></div>)}</div></section></details>
          <section className="detail-section"><h2>特殊业务规则</h2><ul className="rule-list">{project.specialRules.map((rule) => <li key={rule}><Check size={16} />{rule}</li>)}</ul></section>
        </div>
        <aside className="project-detail-aside">
          <section><h2>继承链</h2><ol className="inheritance-list"><li><span>01</span><div><strong>通用层</strong><small>原则、语义变量、通用资产</small></div></li><li><span>02</span><div><strong>{platform?.name} 平台层</strong><small>{platform?.componentExtensions.join('、')}</small></div></li><li className="active"><span>03</span><div><strong>{project.name}</strong><small>{Object.keys(project.tokenOverrides).length} 项变量覆盖</small></div></li><li><span>04</span><div><strong>实际资产</strong><small>使用解析后的主题与规则</small></div></li></ol></section>
          <section><h2>项目专属资产</h2>{project.customAssetIds.map((id) => { const asset = getAsset(id); return <Link className="custom-asset" to={projectDestination(project.id, `foundations/${id}`, params)} key={id}><GitBranch size={16} /><span><strong>{asset?.name ?? id}</strong><code>{id}</code></span></Link> })}<p className="muted-copy">专属资产使用同一数据模型，只处理项目特殊业务，不替代通用组件。</p></section>
        </aside>
      </div>
    </div>
  )
}
