import { useId, useRef, useState, type FormEvent } from 'react'
import { DSButton } from '../design-system/primitives/Button/DSButton'
import { api } from '../services/workspace-api'
import type { ProjectConfig } from '../types/design-system'
import '../pages/Access.css'

export function CreateProjectForm({ onCreated, onCancel }: { onCreated: (project: ProjectConfig) => void; onCancel?: () => void }) {
  const [name, setName] = useState(''), [id, setId] = useState(''), [description, setDescription] = useState('')
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const fieldId = useId()
  const locked = useRef(false)
  const valid = Boolean(name.trim()) && (!id.trim() || /^[a-z][a-z0-9-]{1,49}$/.test(id.trim()))
  const create = async (event: FormEvent) => {
    event.preventDefault()
    if (locked.current || !valid) return
    locked.current = true; setBusy(true); setError('')
    try {
      const project = await api<ProjectConfig>('/admin/projects', { method: 'POST', body: { name: name.trim(), ...(id.trim() ? { id: id.trim() } : {}), description: description.trim() } })
      setName(''); setId(''); setDescription(''); onCreated(project)
    } catch (err) { setError(err instanceof Error ? err.message : '创建失败，请重试。') }
    finally { locked.current = false; setBusy(false) }
  }
  return <form aria-label="新增项目" className="access-create-project access-form" onSubmit={event => void create(event)}>
    <label><span id={`${fieldId}-name`}>项目名称 <span className="access-required" aria-hidden="true">*</span></span><input aria-labelledby={`${fieldId}-name`} required maxLength={80} value={name} disabled={busy} onChange={event => setName(event.target.value)} autoComplete="off" /></label>
    <details className="access-wide"><summary>自定义项目网址（可选）</summary><label><span id={`${fieldId}-id`}>项目标识</span><input aria-labelledby={`${fieldId}-id`} pattern="[a-z][a-z0-9-]{1,49}" maxLength={50} value={id} disabled={busy} onChange={event => setId(event.target.value)} placeholder="留空自动生成" autoComplete="off" aria-describedby={`${fieldId}-help`} /><small id={`${fieldId}-help`}>用于项目网址和版本归属，例如 /projects/design-team。通常无需填写；自定义时使用 2–50 位小写字母、数字或连字符，以字母开头，创建后不更改。</small></label></details>
    <label className="access-wide">项目说明<textarea maxLength={300} rows={3} value={description} disabled={busy} onChange={event => setDescription(event.target.value)} /></label>
    {error && <p role="alert" className="access-error access-wide">{error}</p>}
    <div className="access-actions access-wide"><DSButton type="submit" variant="primary" loading={busy} disabled={!valid}>创建项目</DSButton>{onCancel && <DSButton variant="secondary" disabled={busy} onClick={onCancel}>取消</DSButton>}</div>
  </form>
}
