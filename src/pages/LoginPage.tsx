import { useEffect, useId, useState, type FormEvent, type InputHTMLAttributes } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowBigUpDash } from 'lucide-react'
import { DSButton } from '../design-system/primitives/Button/DSButton'
import { AppSelect } from '../components/AppSelect'
import { api } from '../services/workspace-api'
import { professionLabels, projectRoleLabels, type Profession, type ProjectRole, type SessionData } from '../services/access-types'
import { hasValidPasswordLength, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH } from '../services/password-policy'
import './Access.css'
interface InviteInfo { email: string; projectId: string | null; projectName: string | null; role: ProjectRole; purpose: 'invite' | 'reset'; existingAccount: boolean }
function RequiredLabel({ children }: { children: string }) {
  return <span className="access-field-label">{children}<span className="access-required" aria-hidden="true">*</span></span>
}
function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [capsLock, setCapsLock] = useState(false)
  const hintId = useId()
  return <span className={`access-password${capsLock ? ' access-password--caps' : ''}`}>
    <input {...props} type="password" aria-describedby={[props['aria-describedby'], capsLock ? hintId : undefined].filter(Boolean).join(' ') || undefined}
      onKeyDown={event => setCapsLock(event.getModifierState('CapsLock'))}
      onKeyUp={event => setCapsLock(event.getModifierState('CapsLock'))}
      onBlur={() => setCapsLock(false)} />
    {capsLock && <span id={hintId} className="access-caps-lock" role="img" aria-label="大写锁定已开启" title="大写锁定已开启"><ArrowBigUpDash size={18} strokeWidth={1.8} aria-hidden="true" /></span>}
  </span>
}
export function LoginPage({ onAuthenticated }: { onAuthenticated: (session: SessionData) => void }) {
  const location = useLocation(); const navigate = useNavigate()
  const token = new URLSearchParams(location.hash.slice(1)).get('token') ?? ''
  const joining = location.pathname === '/join'
  const [setup, setSetup] = useState(false); const [ready, setReady] = useState(false)
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState(''); const [setupCode, setSetupCode] = useState(''); const [profession, setProfession] = useState<Profession>('other')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true; setReady(false); setError('')
    const load = async () => { try {
      if (joining) { const next = await api<InviteInfo>(`/auth/invitation?token=${encodeURIComponent(token)}`); if (active) { setInvite(next); setEmail(next.email) } }
      else { const status = await api<{ needsSetup: boolean }>('/auth/status'); if (active) setSetup(status.needsSetup) }
    } catch (err) { if (active) setError(String(err instanceof Error ? err.message : err)) } finally { if (active) setReady(true) } }
    void load(); return () => { active = false }
  }, [joining, token])
  const newPassword = setup || (joining && (!invite?.existingAccount || invite.purpose === 'reset'))
  const needsName = setup || (joining && !invite?.existingAccount)
  const confirmationMismatch = newPassword && confirmation.length > 0 && password !== confirmation
  const canSubmit = ready && !busy && (!joining || Boolean(invite))
    && (joining || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    && (!setup || setupCode.trim().length > 0)
    && (!needsName || name.trim().length > 0)
    && hasValidPasswordLength(password)
    && (!newPassword || password === confirmation)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setBusy(true)
    try {
      const path = joining ? '/auth/accept' : setup ? '/auth/setup' : '/auth/login'
      const session = await api<SessionData>(path, { method: 'POST', body: { email, name, password, profession, token: joining ? token : setupCode } })
      onAuthenticated(session); setPassword(''); setConfirmation(''); setSetupCode('')
      if (joining || location.pathname === '/login') navigate(joining && invite?.purpose === 'invite' && invite.projectId ? `/projects/${encodeURIComponent(invite.projectId)}?version=draft` : '/projects', { replace: true })
    } catch (err) { setError(err instanceof Error ? err.message : '操作失败，请重试。') }
    finally { setBusy(false) }
  }
  const title = joining ? invite?.purpose === 'reset' ? '设置新密码' : '加入项目' : setup ? '建立你的工作区' : '登录设计规范管理平台'
  return <main className="auth-page"><section className="auth-panel"><h1>{title}</h1><p>{joining && invite ? `${invite.email}${invite.projectName ? ` · ${invite.projectName} · ${projectRoleLabels[invite.role]}` : ''}` : setup ? '创建首位平台管理员，随后邀请团队成员。' : '使用受邀邮箱登录，查看你参与的项目。'}</p>
    {!ready ? <p role="status">正在读取登录信息…</p> : joining && !invite ? <><p role="alert">{error}</p><DSButton onClick={() => navigate('/login', { replace: true })}>返回登录</DSButton></> : <form onSubmit={event => void submit(event)} className="access-form">
      <p className="access-required-hint"><span className="access-required" aria-hidden="true">*</span> 为必填项</p>
      {setup && <label><RequiredLabel>初始化码</RequiredLabel><input autoComplete="off" value={setupCode} onChange={event => setSetupCode(event.target.value)} required /><small>由部署者从服务端 .workspace/setup-token.txt 获取，仅首次初始化使用。</small></label>}
      {!joining && <label><RequiredLabel>邮箱</RequiredLabel><input type="email" autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} /></label>}
      {needsName && <label><RequiredLabel>姓名</RequiredLabel><input autoComplete="name" value={name} onChange={event => setName(event.target.value)} required maxLength={80} /></label>}
      {joining && !invite?.existingAccount && <label>职业身份<AppSelect aria-label="职业身份" value={profession} onChange={event => setProfession(event.target.value as Profession)}>{Object.entries(professionLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</AppSelect><small>职业身份不决定项目权限。</small></label>}
      <label><RequiredLabel>{newPassword ? '设置密码' : '登录密码'}</RequiredLabel><PasswordInput autoComplete={newPassword ? 'new-password' : 'current-password'} placeholder="至少 8 位，区分大小写" minLength={PASSWORD_MIN_LENGTH} maxLength={PASSWORD_MAX_LENGTH} value={password} onChange={event => setPassword(event.target.value)} required />{!newPassword && <small>{joining ? '已有账号请使用原密码，确认后加入此项目。' : '忘记密码时，请联系平台管理员生成重置链接。'}</small>}</label>
      {newPassword && <label><RequiredLabel>确认密码</RequiredLabel><PasswordInput autoComplete="new-password" placeholder="请再次输入密码，区分大小写" minLength={PASSWORD_MIN_LENGTH} maxLength={PASSWORD_MAX_LENGTH} value={confirmation} onChange={event => setConfirmation(event.target.value)} required aria-invalid={confirmationMismatch || undefined} aria-describedby={confirmationMismatch ? 'password-confirmation-error' : undefined} />{confirmationMismatch && <small id="password-confirmation-error" className="access-error">两次输入的密码不一致。</small>}</label>}
      {error && <p role="alert" className="access-error">{error}</p>}
      <DSButton type="submit" variant="primary" loading={busy} disabled={!canSubmit}>{setup ? '创建管理员并进入' : joining ? invite?.purpose === 'reset' ? '保存密码并登录' : '确认加入' : '登录'}</DSButton>
    </form>}
  </section></main>
}
