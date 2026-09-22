import { useEffect, type ReactNode } from 'react'
import { Link, Outlet, useParams, useSearchParams } from 'react-router-dom'
import { useAccess } from './access-context'
import { useProject } from './project-context'
import { getProject } from '../data/projects'

export function ProjectSpace() {
  const { projectId = '' } = useParams()
  const target = getProject(projectId)
  const { visibleProjectIds } = useAccess()
  const [params]=useSearchParams()
  const { project, setProjectId, releases, releaseLoading, releaseError } = useProject()
  const allowed = Boolean(target && visibleProjectIds.includes(projectId))

  useEffect(() => {
    if (allowed && project.id !== projectId) setProjectId(projectId)
  }, [allowed, project.id, projectId, setProjectId])

  if (!target) return <ProjectRouteState title="项目不存在" description="该项目链接无效或项目已被移除。" />
  if (!allowed) return <ProjectRouteState title="无权访问该项目" description="当前账号没有该项目权限，请切换账号或返回项目列表。" />
  if (project.id !== projectId) return <div className="page"><p role="status">正在切换项目上下文…</p></div>
  const version=params.get('version')
  if(version&&version!=='draft'&&releaseLoading)return <p role="status">正在读取版本目录…</p>
  if(version&&version!=='draft'&&(releaseError||!releases.some(item=>item.version===version)))return <div className="page route-state"><h1>版本不可用</h1><p>{releaseError??`未找到版本 ${version}，未切换到其他版本。`}</p><Link to={`/projects/${projectId}?version=draft`}>返回当前草稿</Link></div>
  return <Outlet key={projectId} />
}

function ProjectRouteState({ title, description }: { title: string; description: string }) {
  return <div className="page route-state"><h1>{title}</h1><p>{description}</p><Link className="primary-action" to="/projects">返回项目列表</Link></div>
}

export function LegacyProjectRedirect({ children }: { children: (projectId: string, latestVersion?: string) => ReactNode }) {
  const { project, releases } = useProject()
  return children(project.id, releases[0]?.version)
}
