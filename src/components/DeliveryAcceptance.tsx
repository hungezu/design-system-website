import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { DSButton, DSCheckbox, DSInput, DSSelect, DSTextArea } from '../runtime'
import { api } from '../services/workspace-api'
import type { DeliveryAcceptance as Acceptance, DeliveryAcceptanceStatus } from '../services/project-delivery'

const statusLabels: Record<DeliveryAcceptanceStatus, string> = { planned: '待接入', testing: '验证中', verified: '已验证', 'rollback-required': '需回退' }
const checkOptions = [
  { id: 'package-installed', label: '已安装并锁定匹配版本' },
  { id: 'core-flow', label: '真实业务主流程已通过' },
  { id: 'error-recovery', label: '加载、失败与恢复已通过' },
  { id: 'responsive-keyboard', label: '窄屏与键盘操作已通过' },
]

export function DeliveryAcceptance({ projectId, version, canEdit }: { projectId: string; version: string; canEdit: boolean }) {
  const [records, setRecords] = useState<Acceptance[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState('')
  const [open, setOpen] = useState(false), [saving, setSaving] = useState(false)
  const [applicationName, setApplicationName] = useState(''), [owner, setOwner] = useState(''), [status, setStatus] = useState<DeliveryAcceptanceStatus>('testing'), [checks, setChecks] = useState<string[]>([]), [notes, setNotes] = useState('')
  const endpoint = `/projects/${encodeURIComponent(projectId)}/acceptances?version=${encodeURIComponent(version)}`
  const load = useCallback(() => { setLoading(true); api<Acceptance[]>(endpoint).then(value => { setRecords(value); setError('') }).catch(err => setError(err instanceof Error ? err.message : '验收记录读取失败。')).finally(() => setLoading(false)) }, [endpoint])
  useEffect(load, [load])
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError('')
    try { await api<Acceptance>(`/projects/${encodeURIComponent(projectId)}/acceptances`, { method: 'POST', body: { version, applicationName, owner, status, checks, notes } }); setOpen(false); setApplicationName(''); setOwner(''); setChecks([]); setNotes(''); load() }
    catch (err) { setError(err instanceof Error ? err.message : '验收记录保存失败。') } finally { setSaving(false) }
  }
  const toggle = (id: string, selected: boolean) => setChecks(current => selected ? [...new Set([...current, id])] : current.filter(value => value !== id))
  return <section className="delivery-acceptance" aria-labelledby="delivery-acceptance-title">
    <header><div><h2 id="delivery-acceptance-title">消费与验收</h2><p>记录哪些业务系统正在使用 v{version}，以及升级或回退结果。</p></div>{canEdit && <DSButton variant="secondary" onClick={() => setOpen(value => !value)}>{open ? '收起登记' : '登记验收'}</DSButton>}</header>
    {loading && <p role="status">正在读取验收记录…</p>}
    {!loading && !records.length && <p className="muted-copy">暂无业务系统登记此版本。</p>}
    {records.length > 0 && <div className="acceptance-list">{records.map(record => <article key={record.id}><div><strong>{record.applicationName}</strong><span>{statusLabels[record.status]}</span></div><p>{record.owner ? `负责人：${record.owner} · ` : ''}已完成 {record.checks.length}/{checkOptions.length} 项 · {new Date(record.updatedAt).toLocaleString('zh-CN')}</p>{record.notes && <small>{record.notes}</small>}</article>)}</div>}
    {open && <form className="acceptance-form" onSubmit={event => void submit(event)}><DSInput label="业务系统" value={applicationName} onChange={setApplicationName} required /><DSInput label="负责人" value={owner} onChange={setOwner} /><DSSelect label="验收状态" value={status} onChange={value => setStatus(value as DeliveryAcceptanceStatus)} options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}/><fieldset><legend>验收项</legend>{checkOptions.map(item => <DSCheckbox key={item.id} label={item.label} checked={checks.includes(item.id)} onChange={selected => toggle(item.id, selected)} />)}</fieldset><DSTextArea label="结果与问题" value={notes} onChange={setNotes} rows={3}/><div className="example-actions"><DSButton type="submit" variant="primary" loading={saving} disabled={!applicationName.trim() || (status === 'verified' && checks.length !== checkOptions.length)}>保存验收记录</DSButton><DSButton variant="secondary" disabled={saving} onClick={() => setOpen(false)}>取消</DSButton></div></form>}
    {error && <p role="alert">{error}</p>}
  </section>
}
