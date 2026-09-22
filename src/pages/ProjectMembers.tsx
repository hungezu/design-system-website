import { AppTextButton } from '../components/AppTextButton'
import { AccessTableScroll } from '../components/AccessTableScroll'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { useAccess } from '../app/access-context'
import { useProject } from '../app/project-context'
import { PageHeader } from '../components/PageHeader'
import { DSButton } from '../design-system/primitives/Button/DSButton'
import { AppSelect } from '../components/AppSelect'
import { api } from '../services/workspace-api'
import { projectRoleLabels, professionLabels, type Invitation, type Member, type ProjectRole } from '../services/access-types'
import './Access.css'
export function ShareAccessLink({ value, onDismiss }: { value: string; onDismiss: () => void }) {
  const [copied, setCopied] = useState(false); const [error, setError] = useState('')
  return <section className="access-share" aria-label="分享链接"><label>链接仅本次显示<input readOnly value={value} onFocus={event => event.target.select()} /></label><p>请通过你认可的渠道发给对应成员。链接未自动发送。</p><div className="access-actions"><AppTextButton onClick={() => { void navigator.clipboard.writeText(value).then(() => setCopied(true)).catch(() => setError('无法复制，请选中上方链接手动复制。')) }}>{copied ? '已复制' : '复制链接'}</AppTextButton><AppTextButton onClick={onDismiss}>收起</AppTextButton></div>{error && <p role="alert">{error}</p>}</section>
}
function MemberRow({ member, self, busy, onSave, onRemove }: { member: Member; self: string; busy: boolean; onSave: (id: string, role: ProjectRole) => Promise<void>; onRemove: (member: Member) => void }) {
  const [role, setRole] = useState(member.role)
  return <tr><td><strong>{member.name}{member.id === self ? '（你）' : ''}</strong><small>{member.email}</small></td><td>{professionLabels[member.profession]}</td><td><AppSelect aria-label={`${member.name}的项目角色`} value={role} onChange={event => setRole(event.target.value as ProjectRole)} disabled={busy}>{Object.entries(projectRoleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AppSelect>{member.platformRole === 'admin' && <small>同时拥有平台管理员权限</small>}</td><td>{member.status === 'active' ? '已启用' : '已停用'}</td><td><div className="access-actions"><AppTextButton disabled={busy || role === member.role} onClick={() => void onSave(member.id, role)}>保存角色</AppTextButton><AppTextButton disabled={busy} onClick={() => onRemove(member)}>移除</AppTextButton></div></td></tr>
}
interface AuditRow { action: string; subject: string; createdAt: number; actor: string }
const actionLabels: Record<string,string> = { 'invitation.create': '创建邀请', 'invitation.revoke': '撤销邀请', 'member.remove': '移除成员', 'member.viewer': '设为查看者', 'member.editor': '设为编辑者', 'member.project-admin': '设为项目管理员', 'theme.save': '保存主题', 'release.publish': '发布版本', 'account.invite': '接受邀请', 'project.create': '创建项目' }
export function ProjectMembers() {
  const { projectId = '' } = useParams(); const { project } = useProject(); const { user, refresh } = useAccess()
  const [members, setMembers] = useState<Member[]>([]); const [invitations, setInvitations] = useState<Invitation[]>([]); const [audit, setAudit] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('')
  const [email, setEmail] = useState(''); const [role, setRole] = useState<ProjectRole>('viewer'); const [link, setLink] = useState(''); const [query, setQuery] = useState('')
  const base = `/projects/${encodeURIComponent(projectId)}`
  const load = useCallback(async () => { setLoading(true); try { const [nextMembers, nextInvites, nextAudit] = await Promise.all([api<Member[]>(`${base}/members`), api<Invitation[]>(`${base}/invitations`), api<AuditRow[]>(`${base}/audit`)]); setMembers(nextMembers); setInvitations(nextInvites); setAudit(nextAudit) } finally { setLoading(false) } }, [base])
  useEffect(() => { void load().catch(err => setError(err instanceof Error ? err.message : '成员加载失败。')) }, [load])
  const perform = async (operation: () => Promise<unknown>, message: string) => { setBusy(true); setError(''); setNotice(''); try { await operation(); await refresh(); await load(); setNotice(message) } catch (err) { setError(err instanceof Error ? err.message : '操作失败。') } finally { setBusy(false) } }
  const invite = async (event: FormEvent) => { event.preventDefault(); if (busy || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return; await perform(async () => { const result = await api<{ token: string }>(`${base}/invitations`, { method: 'POST', body: { email, role } }); setLink(`${window.location.origin}/join#token=${result.token}`); setEmail('') }, '邀请链接已生成，7 天内有效。同邮箱此前待接受的邀请已失效。') }
  const saveRole = (id: string, next: ProjectRole) => perform(() => api(`${base}/members/${id}`, { method: 'PATCH', body: { role: next } }), '项目角色已更新。')
  const remove = (member: Member) => { if (window.confirm(`确定将“${member.name}”移出此项目吗？其账号和其他项目权限不受影响。`)) void perform(() => api(`${base}/members/${member.id}`, { method: 'DELETE' }), '成员已移出项目。') }
  const visible = members.filter(member => `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase()))
  return <div className="page access-page"><PageHeader title="成员与权限" description={`${project.name} · 权限对本项目的所有版本生效，职业身份不决定访问范围。`} />
    <section><h2>权限说明</h2><dl className="access-permissions"><div><dt>查看者</dt><dd>查阅规范、组件和版本，复制或下载资源。</dd></div><div><dt>编辑者</dt><dd>拥有查看权限，并可编辑、保存项目主题。</dd></div><div><dt>项目管理员</dt><dd>拥有编辑权限，并可发布版本、邀请成员和分配角色。</dd></div></dl><p className="access-help">平台管理员可管理所有项目。最后一位项目管理员不能被移除或降级。</p></section>
    <section><h2>邀请成员</h2><form className="access-invite access-form" onSubmit={event => void invite(event)}><label><span>成员邮箱 <span className="access-required" aria-hidden="true">*</span></span><input type="email" required maxLength={254} placeholder="name@company.com" value={email} onChange={event => setEmail(event.target.value)} /></label><label>项目角色<AppSelect aria-label="邀请成员的项目角色" value={role} onChange={event => setRole(event.target.value as ProjectRole)} disabled={busy}>{Object.entries(projectRoleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AppSelect></label><DSButton type="submit" variant="primary" loading={busy} disabled={!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())}>生成邀请链接</DSButton></form></section>
    {error && <p role="alert" className="access-error">{error}</p>}{notice && <p role="status" className="access-notice">{notice}</p>}{link && <ShareAccessLink value={link} onDismiss={() => setLink('')} />}
    <section><div className="access-section-head"><h2>项目成员</h2><label className="access-search">搜索成员<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="姓名或邮箱" /></label></div>{loading ? <p role="status">正在加载成员…</p> : <AccessTableScroll><table className="access-table"><thead><tr><th scope="col">成员</th><th scope="col">职业身份</th><th scope="col">项目角色</th><th scope="col">状态</th><th scope="col">操作</th></tr></thead><tbody>{visible.map(member => <MemberRow key={`${member.id}-${member.role}`} member={member} self={user.id} busy={busy} onSave={saveRole} onRemove={remove} />)}</tbody></table>{!visible.length && <p className="access-empty">{members.length ? '没有匹配成员。' : '还没有项目成员，从上方邀请第一位项目管理员。'}</p>}</AccessTableScroll>}{error && <DSButton onClick={() => void load().catch(err => setError(String(err)))}>重新加载</DSButton>}</section>
    <section><h2>邀请记录</h2><AccessTableScroll><table className="access-table"><thead><tr><th scope="col">邮箱</th><th scope="col">角色</th><th scope="col">有效期至</th><th scope="col">状态</th><th scope="col">操作</th></tr></thead><tbody>{invitations.map(item => <tr key={item.id}><td>{item.email}</td><td>{projectRoleLabels[item.role]}</td><td>{new Date(item.expiresAt).toLocaleString('zh-CN')}</td><td>{{ pending: '待接受', accepted: '已接受', revoked: '已撤销', expired: '已过期' }[item.status]}</td><td>{item.status === 'pending' && <AppTextButton disabled={busy} onClick={() => void perform(() => api(`${base}/invitations/${item.id}`, { method: 'DELETE' }), '邀请已撤销，原链接已失效。')}>撤销邀请</AppTextButton>}</td></tr>)}</tbody></table>{!invitations.length && <p className="access-empty">暂无邀请记录。</p>}</AccessTableScroll></section>
    <details className="developer-details"><summary>最近操作记录</summary><ul className="access-audit">{audit.map((item, index) => <li key={`${item.createdAt}-${index}`}><strong>{item.actor || '成员'}</strong><span>{actionLabels[item.action] ?? item.action}</span><span>{new Date(item.createdAt).toLocaleString('zh-CN')}</span></li>)}</ul>{!audit.length && <p>暂无操作记录。</p>}</details>
  </div>
}
