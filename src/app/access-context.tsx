import { createContext, Fragment, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { setRuntimeProjects } from '../data/projects'
import { api, ApiError } from '../services/workspace-api'
import type { Account, ProjectRole, SessionData } from '../services/access-types'
import { LoginPage } from '../pages/LoginPage'
import { DSButton } from '../design-system/primitives/Button/DSButton'
export type UserRole = 'super-admin' | 'project-admin' | 'designer' | 'viewer'
export interface AppUser extends Account { role: UserRole; projectIds: string[] }
export const roleLabels: Record<UserRole, string> = { 'super-admin': '平台管理员', 'project-admin': '项目管理员', designer: '编辑者', viewer: '查看者' }
interface AccessValue {
  user: AppUser
  visibleProjectIds: string[]
  session: SessionData
  refresh: () => Promise<void>
  logout: () => Promise<void>
  projectRole: (id: string) => ProjectRole | undefined
}
const AccessContext = createContext<AccessValue | null>(null)
export function AccessProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const generation = useRef(0)
  const pending = useRef<AbortController | null>(null)
  const location = useLocation()
  const invalidatePending = useCallback(() => { generation.current++; pending.current?.abort(); pending.current = null }, [])
  const accept = useCallback((next: SessionData) => {
    invalidatePending(); setRuntimeProjects(next.projects); setSession(next); setError(''); setLoading(false)
  }, [invalidatePending])
  const refresh = useCallback(async () => {
    invalidatePending()
    const ticket = generation.current; const controller = new AbortController(); pending.current = controller
    try {
      const next = await api<SessionData>('/auth/me', { signal: controller.signal })
      if (ticket !== generation.current || controller.signal.aborted) return
      setRuntimeProjects(next.projects); setSession(next); setError('')
    } catch (err) {
      if (ticket !== generation.current || controller.signal.aborted) return
      if (err instanceof ApiError && err.status === 401) { setRuntimeProjects([]); setSession(null); setError('') }
      else setError(err instanceof Error ? err.message : '无法连接工作区服务。')
    } finally { if (ticket === generation.current && !controller.signal.aborted) setLoading(false) }
  }, [invalidatePending])
  useEffect(() => { void refresh(); return invalidatePending }, [refresh, invalidatePending])
  useEffect(() => {
    const refreshVisible = () => { if (document.visibilityState === 'visible') void refresh() }
    const recheckAccess = () => { void refresh() }
    window.addEventListener('focus', refreshVisible)
    window.addEventListener('workspace-session-expired', recheckAccess)
    window.addEventListener('workspace-access-changed', recheckAccess)
    const timer = window.setInterval(refreshVisible, 60_000)
    return () => { window.removeEventListener('focus', refreshVisible); window.removeEventListener('workspace-session-expired', recheckAccess); window.removeEventListener('workspace-access-changed', recheckAccess); window.clearInterval(timer) }
  }, [refresh])
  const logout = async () => {
    invalidatePending()
    await api('/auth/logout', { method: 'POST', body: {} })
    invalidatePending(); setRuntimeProjects([]); setSession(null); setError('')
  }
  if (loading) return <div className="auth-page"><p role="status">正在连接工作区…</p></div>
  if (error && !session) return <div className="auth-page"><section className="auth-panel"><h1>暂时无法连接工作区</h1><p role="alert">{error}</p><DSButton variant="primary" onClick={() => void refresh()}>重新连接</DSButton></section></div>
  if (!session || location.pathname === '/join') return <LoginPage onAuthenticated={accept} />
  const projectRole = (id: string): ProjectRole | undefined => session.user.platformRole === 'admin' ? 'project-admin' : session.memberships.find(member => member.projectId === id)?.role
  const routeProjectId = location.pathname.match(/^\/projects\/([^/]+)/)?.[1]
  const activeRole = routeProjectId ? projectRole(routeProjectId) : undefined
  const role: UserRole = session.user.platformRole === 'admin' ? 'super-admin' : activeRole === 'project-admin' ? 'project-admin' : activeRole === 'editor' ? 'designer' : 'viewer'
  const visibleProjectIds = session.projects.map(project => project.id)
  const user = { ...session.user, role, projectIds: visibleProjectIds }
  return <AccessContext.Provider value={{ user, session, visibleProjectIds, refresh, logout, projectRole }}>{error && <p role="status" className="access-connection">连接暂时中断，当前编辑仍保留。保存时会再次检查服务器状态。</p>}<Fragment key={user.id}>{children}</Fragment></AccessContext.Provider>
}
export function useAccess() { const value = useContext(AccessContext); if (!value) throw new Error('useAccess 必须在 AccessProvider 内使用'); return value }
export function isSuperAdmin(role: UserRole) { return role === 'super-admin' }
export function canManage(role: UserRole) { return role === 'super-admin' || role === 'project-admin' }
export function resolveAccessibleProjectId(currentProjectId: string, visibleProjectIds: string[], fallbackProjectId: string) { return visibleProjectIds.includes(currentProjectId) ? currentProjectId : visibleProjectIds[0] ?? fallbackProjectId }
