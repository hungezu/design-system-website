import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccess } from '../app/access-context'
import { CreateProjectForm } from '../components/CreateProjectForm'
import { PageHeader } from '../components/PageHeader'
import { DSButton } from '../design-system/primitives/Button/DSButton'
import { getProject } from '../data/projects'
import type { ProjectConfig } from '../types/design-system'

export function NewProject() {
  const { user, refresh } = useAccess()
  const navigate = useNavigate()
  const [created, setCreated] = useState<ProjectConfig | null>(null), [connecting, setConnecting] = useState(false)
  const enter = async (project: ProjectConfig) => {
    setConnecting(true)
    try {
      await refresh()
      if (getProject(project.id)) navigate(`/projects/${encodeURIComponent(project.id)}`, { replace: true })
    } catch { /* The saved project remains visible and can be entered after reconnecting. */ } finally { setConnecting(false) }
  }
  if (user.platformRole !== 'admin') return <div className="page route-state"><h1>需要平台管理权限</h1><p>请联系平台管理员新增项目并邀请你加入。</p><Link className="secondary-action" to="/projects">返回项目</Link></div>
  return <div className="page access-page"><PageHeader title="新增项目" description="填写项目基本信息。创建后你将担任项目管理员，可继续配置主题和邀请成员。" actions={<Link className="secondary-action" to="/projects">返回项目</Link>} />
    <section>{created ? <><h2>{created.name} 已创建</h2><p role="status">{connecting ? '正在进入新项目…' : '项目已保存，但项目列表尚未更新。请重新连接后进入，无需重复创建。'}</p><DSButton variant="primary" loading={connecting} onClick={() => void enter(created)}>进入项目</DSButton></> : <CreateProjectForm onCancel={() => navigate('/projects')} onCreated={project => { setCreated(project); void enter(project) }} />}</section>
  </div>
}
