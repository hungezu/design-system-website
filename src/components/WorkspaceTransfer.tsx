import { useRef, useState } from 'react'
import { DSButton, DSAlert } from '../runtime'
import { api } from '../services/workspace-api'
import { BACKUP_LIMIT, validateServerBackup, type ServerBackup, type RestorePreview } from '../services/server-backup'
import { createRawWorkspaceRecovery } from '../services/workspace-backup'

function download(backup: ServerBackup) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a'); link.href = url; link.download = `design-workspace-server-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url)
}
export function LegacyWorkspaceExport() {
  const [error, setError] = useState('')
  const exportRaw = () => {
    try {
      const url = URL.createObjectURL(new Blob([JSON.stringify(createRawWorkspaceRecovery(localStorage), null, 2)], { type: 'application/json' }))
      const link = document.createElement('a'); link.href = url; link.download = 'legacy-browser-workspace-raw.json'; link.click(); URL.revokeObjectURL(url)
      setError('')
    } catch (err) { setError(err instanceof Error ? err.message : String(err)) }
  }
  return <section><p>仅保留本机旧主题、旧版本和选中记录，不包含当前服务端数据。原始记录供迁移修复使用，不能直接导入服务端。旧主题可在主题编辑页载入、核对并保存。</p><DSButton onClick={exportRaw}>导出旧浏览器原始记录</DSButton>{error && <p role="alert">{error}</p>}</section>
}
export function WorkspaceTransfer() {
  const sequence = useRef(0)
  const locked = useRef(false)
  const [pending, setPending] = useState<RestorePreview | null>(null)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const fail = (error: unknown) => { setFailed(true); setMessage(error instanceof Error ? error.message : String(error)) }
  const exportBackup = async () => {
    if (locked.current) return
    locked.current = true; setBusy(true)
    try { download(validateServerBackup(await api<ServerBackup>('/workspace/backup'))); setFailed(false); setMessage('服务端备份已导出，包含可见项目配置、已保存主题和冻结版本。') }
    catch (error) { fail(error) }
    finally { locked.current = false; setBusy(false) }
  }
  const read = async (file: File | undefined) => {
    const ticket = ++sequence.current; setPending(null)
    if (!file) return
    setBusy(true)
    try {
      if (file.size > BACKUP_LIMIT) throw new Error('备份文件超过 20 MB。')
      const backup = validateServerBackup(await file.text())
      const preview = await api<RestorePreview>('/workspace/restore-preview', { method: 'POST', body: { backup } })
      if (ticket !== sequence.current) return
      setPending(preview); setFailed(false); setMessage('校验和权限检查通过，请核对恢复范围。')
    } catch (error) { if (ticket === sequence.current) fail(error) }
    finally { if (ticket === sequence.current) setBusy(false) }
  }
  const restore = async () => {
    if (!pending || locked.current) return
    locked.current = true; setBusy(true)
    try {
      const result = await api<{ projectId: string }>('/workspace/restore', { method: 'POST', body: pending })
      window.location.assign(`/projects/${encodeURIComponent(result.projectId)}/releases?version=draft`)
    } catch (error) { fail(error); setPending(null) }
    finally { locked.current = false; setBusy(false) }
  }
  return <section className="workspace-transfer"><h2>备份与恢复</h2>
    <p>导出服务端已保存的项目配置、主题、冻结版本和消费验收记录。恢复需要所有目标项目的管理权限；新项目仅平台管理员可恢复。保留已有版本和其他项目，同号内容冲突或校验后的并发修改会拒绝整批恢复。</p>
    <p>账号、成员权限、登录会话、未保存编辑和浏览器旧草稿不在此备份范围。恢复不会改写已有账号和成员权限。</p>
    <div className="example-actions"><DSButton disabled={busy} onClick={() => void exportBackup()}>导出工作区备份</DSButton><label>选择备份文件<input disabled={busy} aria-label="选择工作区备份" type="file" accept="application/json,.json" onChange={event => { void read(event.target.files?.[0]); event.target.value = '' }} /></label></div>
    {busy && <p role="status">正在处理服务端备份…</p>}{message && <p role={failed ? 'alert' : 'status'}>{message}</p>}
    {pending && <DSAlert title="待恢复内容"><p>{pending.backup.payload.projects.length} 个项目 · {pending.backup.payload.releases.length} 个冻结版本</p><p>项目：{pending.backup.payload.projects.map(item => item.config.name).join('、')}</p><p>确认后将替换这些项目的已保存主题与配置，并补入缺失版本。</p><DSButton variant="primary" disabled={busy} onClick={() => void restore()}>恢复已校验的备份</DSButton><DSButton variant="secondary" disabled={busy} onClick={() => { ++sequence.current; setPending(null) }}>取消恢复</DSButton></DSAlert>}
  </section>
}
