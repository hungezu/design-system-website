import { ArrowRight, Box, Globe2, Smartphone, View } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccess } from '../app/access-context'
import { PageHeader } from '../components/PageHeader'
import { projects } from '../data/projects'
import { loadProjectTheme } from '../services/project-theme'

const platformIcons = { web: Globe2, mobile: Smartphone, embedded: Box, spatial: View }

export function Projects() {
  const { visibleProjectIds, user } = useAccess()
  const visibleProjects = projects.filter((project) => visibleProjectIds.includes(project.id))
  return <div className="page projects-page"><PageHeader title="项目" description="进入项目空间配置主题与风格，并查看项目实际使用的组件、页面模板和版本记录。" actions={user.platformRole === 'admin' ? <Link className="primary-action" to="/new-project">新增项目</Link> : undefined} /><section className="project-list">{visibleProjects.map((project) => {
    const Icon = platformIcons[project.platform]
    const saved = loadProjectTheme(project)
    return <Link className="project-row project-row--link" key={project.id} to={`/projects/${project.id}`}><div className="project-row__identity"><div className="project-color" style={{ background: saved.brandPrimary }}><Icon size={21} /></div><div><h2>{project.name}</h2><p>{project.description}</p></div></div><div className="project-row__preview"><span style={{ background: saved.brandPrimary }} /><span style={{ borderRadius: `${saved.radius}px` }} /><small>{saved.density === 'compact' ? '紧凑' : saved.density === 'comfortable' ? '舒适' : '宽松'}密度</small></div><ArrowRight size={18} /></Link>
  })}</section>{!visibleProjects.length && <div className="empty-state"><h2>暂无可访问项目</h2><p>{user.platformRole === 'admin' ? '点击“新增项目”创建第一个项目。' : '请联系平台管理员创建项目并邀请你加入。'}</p></div>}</div>
}
