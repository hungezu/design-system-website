// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { AccessProvider, useAccess } from './access-context'
import { api, ApiError } from '../services/workspace-api'
import { guokexinProject } from '../data/projects'
import type { SessionData } from '../services/access-types'
vi.mock('../services/workspace-api', async original => ({ ...await original<typeof import('../services/workspace-api')>(), api: vi.fn() }))
vi.mock('../pages/LoginPage', () => ({ LoginPage: ({ onAuthenticated }: { onAuthenticated: (session: SessionData) => void }) => <><p>请登录</p><button onClick={() => onAuthenticated(viewer)}>测试登录</button></> }))
const admin: SessionData = { user: { id: 'admin', name: '管理员', email: 'admin@example.test', platformRole: 'admin', profession: 'other', status: 'active' }, memberships: [], projects: [guokexinProject] }
const viewer: SessionData = { user: { id: 'viewer', name: '查看者', email: 'viewer@example.test', platformRole: 'member', profession: 'product', status: 'active' }, memberships: [{ projectId: guokexinProject.id, userId: 'viewer', role: 'viewer' }], projects: [guokexinProject] }
const request = vi.mocked(api)
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (error: Error) => void; const promise = new Promise<T>((a,b) => { resolve=a; reject=b }); return { promise, resolve, reject } }
function Content() { const { user, logout, refresh }=useAccess(); const navigate=useNavigate(); return <><p>{user.name}:{user.role}</p><button onClick={() => void logout()}>退出</button><button onClick={() => void refresh()}>刷新会话</button><button onClick={() => navigate('/projects/test-customer-b')}>切换项目</button></> }
function show() { render(<MemoryRouter initialEntries={['/projects/guokexin/members']}><AccessProvider><Content/></AccessProvider></MemoryRouter>) }
beforeEach(() => request.mockReset())
afterEach(cleanup)
it('退出后迟到的会话响应不能重新显示旧账号', async () => {
 const stale=deferred<SessionData>(); request.mockResolvedValueOnce(admin).mockReturnValueOnce(stale.promise).mockResolvedValueOnce({ok:true})
 show(); await screen.findByText('管理员:super-admin'); fireEvent.click(screen.getByText('刷新会话')); fireEvent.click(screen.getByText('退出'))
 await screen.findByText('请登录'); await act(async()=>stale.resolve(admin))
 expect(screen.queryByText('管理员:super-admin')).toBeNull(); expect(screen.getByText('请登录')).toBeTruthy()
})
it('新登录不会被之前迟到的 401 撤销', async () => {
 const stale=deferred<SessionData>(); request.mockRejectedValueOnce(new ApiError('未登录',401)).mockReturnValueOnce(stale.promise)
 show(); await screen.findByText('请登录'); act(()=>window.dispatchEvent(new Event('focus'))); fireEvent.click(screen.getByText('测试登录'))
 expect(await screen.findByText('查看者:viewer')).toBeTruthy(); await act(async()=>stale.reject(new ApiError('旧会话失效',401)))
 expect(screen.getByText('查看者:viewer')).toBeTruthy()
})
it('项目权限变化通知立即刷新，网络暂时失败不会卸载当前内容', async () => {
 const editor={...viewer,memberships:[{...viewer.memberships[0],role:'editor' as const}]}
 request.mockResolvedValueOnce(editor).mockResolvedValueOnce(viewer).mockRejectedValueOnce(new Error('连接失败'))
 show(); await screen.findByText('查看者:designer'); act(()=>window.dispatchEvent(new Event('workspace-access-changed')))
 await screen.findByText('查看者:viewer'); fireEvent.click(screen.getByText('刷新会话')); await screen.findByRole('status')
 expect(screen.getByText('查看者:viewer')).toBeTruthy()
 await waitFor(()=>expect(request).toHaveBeenCalledTimes(3))
})
it('同一账号在不同项目中不沿用前一个项目的管理权限', async () => {
 request.mockResolvedValueOnce({...viewer,memberships:[{...viewer.memberships[0],role:'project-admin'}]})
 show(); await screen.findByText('查看者:project-admin'); fireEvent.click(screen.getByText('切换项目')); expect(screen.getByText('查看者:viewer')).toBeTruthy()
})
