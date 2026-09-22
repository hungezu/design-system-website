import { AppTextButton } from '../components/AppTextButton'
import { AccessTableScroll } from '../components/AccessTableScroll'
import { CreateProjectForm } from '../components/CreateProjectForm'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccess } from '../app/access-context'
import { PageHeader } from '../components/PageHeader'
import { DSButton } from '../design-system/primitives/Button/DSButton'
import { DSDialog } from '../design-system/primitives/Overlays'
import { DSInput } from '../design-system/primitives/TextField'
import { api } from '../services/workspace-api'
import { professionLabels, type Account } from '../services/access-types'
import type { ProjectConfig } from '../types/design-system'
import { ShareAccessLink } from './ProjectMembers'
import './Access.css'
export function UsersPage() {
  const { user, session, refresh } = useAccess()
  const [users, setUsers] = useState<Account[]>([]); const [query, setQuery] = useState('')
  const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false); const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'users' | 'projects'>('users')
  const [link, setLink] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ProjectConfig | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const load = async () => { setLoading(true); try { setUsers(await api<Account[]>('/admin/users')); setError('') } catch (err) { setError(err instanceof Error ? err.message : '用户加载失败。') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  const changeStatus = async (target: Account) => {
    if (!window.confirm(`${target.status === 'active' ? '停用后该用户将退出登录，无法访问项目。确定停用' : '确定重新启用'}“${target.name}”吗？`)) return
    setBusy(true); setError(''); setNotice('')
    try { await api(`/admin/users/${target.id}`, { method: 'PATCH', body: { status: target.status === 'active' ? 'disabled' : 'active' } }); await load(); setNotice('账号状态已更新。') }
    catch (err) { setError(err instanceof Error ? err.message : '操作失败。') } finally { setBusy(false) }
  }
  const reset = async (target: Account) => { setBusy(true); setError(''); try { const result = await api<{ token: string }>(`/admin/users/${target.id}/reset`, { method: 'POST', body: {} }); setLink(`${window.location.origin}/join#token=${result.token}`); setNotice(`已为 ${target.email} 生成重置链接，1 小时内有效。`) } catch (err) { setError(String(err instanceof Error ? err.message : err)) } finally { setBusy(false) } }
  const requestDelete = (project: ProjectConfig) => { setDeleteTarget(project); setDeleteConfirmation(''); setDeleteError(''); setError(''); setNotice('') }
  const deleteProject = async () => {
    if (!deleteTarget || deleteConfirmation.trim() !== deleteTarget.name || busy) return
    const project = deleteTarget
    setBusy(true); setDeleteError(''); setError(''); setNotice('')
    try {
      await api(`/admin/projects/${encodeURIComponent(project.id)}`, { method: 'DELETE' })
      setDeleteTarget(null); setDeleteConfirmation(''); setDeleteError('')
      await refresh()
      setNotice(`项目“${project.name}”已删除。`)
    } catch (err) { setDeleteError(err instanceof Error ? err.message : '删除失败，请重试。') }
    finally { setBusy(false) }
  }
  const visible = users.filter(item => `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="page access-page"><PageHeader title="平台管理" description="管理平台账号与项目。项目内的编辑、发布和成员权限在各项目中分配。" />
    <div className="access-tabs" role="group" aria-label="管理内容"><DSButton variant={tab === 'users' ? 'primary' : 'secondary'} aria-pressed={tab === 'users'} onClick={() => setTab('users')}>用户</DSButton><DSButton variant={tab === 'projects' ? 'primary' : 'secondary'} aria-pressed={tab === 'projects'} onClick={() => setTab('projects')}>项目</DSButton></div>
    {error && <p role="alert" className="access-error">{error}</p>}{notice && <p role="status" className="access-notice">{notice}</p>}{link && <ShareAccessLink value={link} onDismiss={() => setLink('')} />}
    {tab === 'users' ? <section aria-label="用户管理"><div className="access-section-head"><div><h2>平台用户</h2><p>新成员通过项目邀请加入；停用账号立即终止其所有会话。</p></div><label className="access-search">搜索用户<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="姓名或邮箱" /></label></div>
      {loading ? <p role="status">正在加载用户…</p> : <AccessTableScroll><table className="access-table"><thead><tr><th scope="col">用户</th><th scope="col">职业身份</th><th scope="col">平台权限</th><th scope="col">状态</th><th scope="col">操作</th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><strong>{item.name}{item.id === user.id ? '（你）' : ''}</strong><small>{item.email}</small></td><td>{professionLabels[item.profession]}</td><td>{item.platformRole === 'admin' ? '平台管理员' : '普通成员'}</td><td>{item.status === 'active' ? '已启用' : '已停用'}</td><td><div className="access-actions"><AppTextButton disabled={busy || item.id === user.id || item.platformRole === 'admin'} onClick={() => void changeStatus(item)}>{item.status === 'active' ? '停用' : '启用'}</AppTextButton><AppTextButton disabled={busy || item.status !== 'active'} onClick={() => void reset(item)}>重置密码</AppTextButton></div></td></tr>)}</tbody></table>{!visible.length && <p className="access-empty">没有匹配的用户，试试其他姓名或邮箱。</p>}</AccessTableScroll>}
      {!loading && error && <DSButton onClick={() => void load()}>重新加载</DSButton>}
    </section> : <><section><div className="access-section-head"><div><h2>新建项目</h2><p>创建后，你暂时担任项目管理员，可邀请成员接管维护。</p></div></div><CreateProjectForm onCreated={project => { void refresh(); setNotice(`项目“${project.name}”已创建。可在项目列表进入并配置。`) }} /></section><section><h2>全部项目</h2><div className="access-project-list">{session.projects.map(project => <article key={project.id}><div><h3>{project.name}</h3><p>{project.description || '尚未填写项目说明'}</p></div><div className="access-project-actions"><Link className="secondary-action" to={`/projects/${project.id}/members`}>成员与权限</Link><DSButton variant="tertiary" semantic="danger" disabled={busy} onClick={() => requestDelete(project)}>删除项目</DSButton></div></article>)}</div></section></>}
    <DSDialog open={Boolean(deleteTarget)} onOpenChange={open => { if (!open && !busy) { setDeleteTarget(null); setDeleteConfirmation(''); setDeleteError('') } }} title="删除项目" description="这是不可撤销的操作。" role="alertdialog" dismissible={!busy} closeOnEscape={!busy} loading={busy} footer={<><DSButton variant="secondary" disabled={busy} onClick={() => { setDeleteTarget(null); setDeleteConfirmation(''); setDeleteError('') }}>取消</DSButton><DSButton variant="primary" semantic="danger" loading={busy} disabled={!deleteTarget || deleteConfirmation.trim() !== deleteTarget.name} onClick={() => void deleteProject()}>确认删除</DSButton></>}>
      {deleteTarget && <div className="access-delete-project"><p>删除“{deleteTarget.name}”后，项目主题、成员权限、邀请、版本和交付验收记录都会被永久移除。</p><DSInput label={`输入“${deleteTarget.name}”以确认`} value={deleteConfirmation} onChange={setDeleteConfirmation} disabled={busy} required maxLength={80} />{deleteError && <p role="alert" className="access-error">{deleteError}</p>}</div>}
    </DSDialog>
  </div>
}
