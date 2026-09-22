import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { defaultProjectId, getProject, guokexinProject } from '../data/projects'
import { resolveProjectTheme } from '../services/theme-resolver'
import { loadReleaseAsset as fetchReleaseAsset, loadReleaseCatalog, selectRelease, type ReleaseAssetName, type ReleaseCatalogEntry, DRAFT_VERSION, isDraftVersion } from '../services/release-catalog'
import { ProjectContext } from './project-context'
import { resolveAccessibleProjectId, useAccess } from './access-context'
import { defaultProjectTheme, projectThemeOverrides, resolvePreviewTheme, type ProjectThemeSettings } from '../services/project-theme'
import { api } from '../services/workspace-api'
import { DSButton } from '../design-system/primitives/Button/DSButton'
import { isStaticDemo } from '../services/environment'
const storageKey = 'design-intelligence-current-project'
const versionStorageKey = 'design-intelligence-project-versions'
function storedVersions(): Record<string, string> { try { return JSON.parse(localStorage.getItem(versionStorageKey) ?? '{}') } catch { return {} } }
interface ThemeState { key: string; theme: ProjectThemeSettings; revision: number }
export function ProjectProvider({ children }: { children: ReactNode }) {
  const location = useLocation(); const { visibleProjectIds, user, projectRole } = useAccess()
  const [projectId, setProjectIdState] = useState(() => localStorage.getItem(storageKey) ?? defaultProjectId)
  const routeProjectId = location.pathname.match(/^\/projects\/([^/]+)/)?.[1]
  const accessibleProjectId = resolveAccessibleProjectId(routeProjectId ?? projectId, visibleProjectIds, defaultProjectId)
  const project = getProject(accessibleProjectId) ?? guokexinProject
  const identity = `${user.id}:${project.id}`
  const [state, setState] = useState<ThemeState | null>(() => isStaticDemo ? { key: identity, theme: defaultProjectTheme(project), revision: 0 } : null)
  const [releaseCatalog, setReleaseCatalog] = useState<ReleaseCatalogEntry[]>([])
  const [releaseLoading, setReleaseLoading] = useState(true); const [releaseError, setReleaseError] = useState<string | null>(null)
  const [selectedVersions, setSelectedVersions] = useState(storedVersions)
  const [attempt, setAttempt] = useState(0)
  const projectTheme = state?.key === identity ? state.theme : defaultProjectTheme(project)
  const routeVersion = new URLSearchParams(location.search).get('version')
  const resolvedProject = useMemo(() => ({ ...project, tokenOverrides: { ...project.tokenOverrides, ...projectThemeOverrides(projectTheme) } }), [project, projectTheme])
  const theme = useMemo(() => resolvePreviewTheme(projectTheme, resolveProjectTheme(resolvedProject)), [projectTheme, resolvedProject])
  const releases = releaseCatalog.filter(entry => entry.projectId === project.releaseProjectId)
  const release = selectRelease(releases, project.releaseProjectId, routeVersion && !isDraftVersion(routeVersion) ? routeVersion : selectedVersions[project.id])
  const hasProject = visibleProjectIds.includes(project.id)
  useEffect(() => {
    if (!hasProject) { setReleaseLoading(false); return }
    if (isStaticDemo) {
      const controller = new AbortController()
      setState({ key: identity, theme: defaultProjectTheme(project), revision: 0 })
      setReleaseLoading(true); setReleaseError(null)
      loadReleaseCatalog(controller.signal)
        .then(entries => { if (!controller.signal.aborted) setReleaseCatalog(entries) })
        .catch(err => { if (!controller.signal.aborted) setReleaseError(err instanceof Error ? err.message : '版本目录读取失败。') })
        .finally(() => { if (!controller.signal.aborted) setReleaseLoading(false) })
      return () => controller.abort()
    }
    const controller = new AbortController(); setReleaseLoading(true); setReleaseError(null)
    Promise.all([
      api<{ theme: ProjectThemeSettings; revision: number }>(`/projects/${project.id}/theme`, { signal: controller.signal }),
      api<ReleaseCatalogEntry[]>(`/projects/${project.id}/releases`, { signal: controller.signal }),
    ]).then(([next, entries]) => { if (!controller.signal.aborted) { setState({ key: identity, ...next }); setReleaseCatalog(entries) } })
      .catch(err => { if (!controller.signal.aborted) setReleaseError(err instanceof Error ? err.message : '项目加载失败。') })
      .finally(() => { if (!controller.signal.aborted) setReleaseLoading(false) })
    return () => controller.abort()
  }, [project.id, identity, hasProject, attempt])
  useEffect(() => { if (hasProject) localStorage.setItem(storageKey, project.id) }, [project.id, hasProject])
  useEffect(() => { localStorage.setItem(versionStorageKey, JSON.stringify(selectedVersions)) }, [selectedVersions])
  const setProjectId = (next: string) => { if (visibleProjectIds.includes(next)) setProjectIdState(next) }
  const setReleaseVersion = (version: string) => { if (releases.some(entry => entry.version === version)) setSelectedVersions(current => ({ ...current, [project.id]: version })) }
  const publishDraft = async (input: { version: string; note: string; requireDeliverable?: boolean }) => {
    if (projectRole(project.id) !== 'project-admin') throw new Error('发布版本需要项目管理员权限。')
    const entry = await api<ReleaseCatalogEntry>(`/projects/${project.id}/releases`, { method: 'POST', body: input })
    setReleaseCatalog(current => [entry, ...current]); setSelectedVersions(current => ({ ...current, [project.id]: entry.version })); return entry
  }
  const loadReleaseAsset = useCallback(<T,>(name: ReleaseAssetName) => release ? fetchReleaseAsset<T>(release, name) : Promise.reject(new Error('当前项目没有可读取的发布版本')), [release])
  const saveProjectTheme = async (settings: ProjectThemeSettings) => {
    if (isStaticDemo) throw new Error('公开演示不保存项目数据。')
    if (!state || state.key !== identity || !projectRole(project.id) || projectRole(project.id) === 'viewer') throw new Error('没有编辑此项目的权限。')
    const next = await api<{ theme: ProjectThemeSettings; revision: number }>(`/projects/${project.id}/theme`, { method: 'PUT', body: { theme: settings, revision: state.revision } })
    setState(current => current?.key === identity ? { key: identity, ...next } : current)
  }
  const reloadProjectTheme = async () => { if (isStaticDemo) return projectTheme; const next = await api<{ theme: ProjectThemeSettings; revision: number }>(`/projects/${project.id}/theme`); setState(current => current?.key === identity ? { key: identity, ...next } : current); return next.theme }
  const projectRoute = location.pathname.startsWith('/projects/') && hasProject
  return <ProjectContext.Provider value={{ project, theme, setProjectId, releases, release, releaseLoading, releaseError, setReleaseVersion, publishDraft, loadReleaseAsset, projectTheme, saveProjectTheme, restoreProjectTheme: () => projectTheme, reloadProjectTheme }}>
    <div className="theme-root bds-scope" data-theme-mode="light" data-project-id={project.id} data-project-mode={!routeVersion || isDraftVersion(routeVersion) ? DRAFT_VERSION : 'frozen'} data-release-version={!routeVersion || isDraftVersion(routeVersion) ? DRAFT_VERSION : release?.version ?? 'loading'}>
      {projectRoute && (state?.key !== identity || releaseError) ? <div className="page route-state">{releaseError ? <><h1>项目暂时无法加载</h1><p role="alert">{releaseError}</p><DSButton onClick={() => setAttempt(value => value + 1)}>重新加载</DSButton><a href="/projects">返回项目列表</a></> : <p role="status">正在加载项目配置…</p>}</div> : children}
    </div>
  </ProjectContext.Provider>
}
