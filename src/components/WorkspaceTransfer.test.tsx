// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { WorkspaceTransfer } from './WorkspaceTransfer'
import { api } from '../services/workspace-api'
import { makeServerBackup } from '../services/server-backup'
import { guokexinProject } from '../data/projects'
import { defaultProjectTheme } from '../services/project-theme'
vi.mock('../services/workspace-api', () => ({ api: vi.fn() }))
const backup = makeServerBackup({ projects: [{ config: guokexinProject, theme: defaultProjectTheme(guokexinProject) }], releases: [] })
const file = (content = JSON.stringify(backup)) => { const result = new File([content], 'backup.json', { type: 'application/json' }); result.text = async () => content; return result }
beforeEach(() => { vi.resetAllMocks(); window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} }) })
afterEach(cleanup)
it('先显示服务端校验范围；取消不会写入恢复接口', async () => {
  vi.mocked(api).mockResolvedValue({ backup, revisions: { guokexin: 3 } })
  render(<WorkspaceTransfer />); const user = userEvent.setup()
  await user.upload(screen.getByLabelText('选择工作区备份'), file())
  expect(await screen.findByText('1 个项目 · 0 个冻结版本')).toBeTruthy()
  expect(api).toHaveBeenCalledWith('/workspace/restore-preview', { method: 'POST', body: { backup } })
  await user.click(screen.getByRole('button', { name: '取消恢复' }))
  expect(screen.queryByRole('button', { name: '恢复已校验的备份' })).toBeNull()
  expect(api).toHaveBeenCalledTimes(1)
})
it('恢复携带校验修订号，冲突后清除旧确认并可重新选择同文件', async () => {
  const preview = { backup, revisions: { guokexin: 3 } }
  vi.mocked(api).mockResolvedValueOnce(preview).mockRejectedValueOnce(new Error('项目在校验后已更新')).mockResolvedValueOnce({ ...preview, revisions: { guokexin: 4 } })
  render(<WorkspaceTransfer />); const user = userEvent.setup()
  const input = screen.getByLabelText('选择工作区备份')
  await user.upload(input, file()); await user.click(await screen.findByRole('button', { name: '恢复已校验的备份' }))
  expect(await screen.findByRole('alert')).toHaveProperty('textContent', '项目在校验后已更新')
  expect(api).toHaveBeenLastCalledWith('/workspace/restore', { method: 'POST', body: preview })
  expect(screen.queryByRole('button', { name: '恢复已校验的备份' })).toBeNull()
  await user.upload(input, file()); expect(await screen.findByRole('button', { name: '恢复已校验的备份' })).toBeTruthy()
})
it('损坏文件在发送前拒绝，不读取浏览器旧数据作为当前备份', async () => {
  render(<WorkspaceTransfer />); const user = userEvent.setup()
  await user.upload(screen.getByLabelText('选择工作区备份'), file('{broken'))
  expect(await screen.findByRole('alert')).toBeTruthy(); expect(api).not.toHaveBeenCalled()
})
