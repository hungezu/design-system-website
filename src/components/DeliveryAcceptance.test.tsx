// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DeliveryAcceptance } from './DeliveryAcceptance'
import { api } from '../services/workspace-api'

vi.mock('../services/workspace-api', () => ({ api: vi.fn() }))
beforeEach(() => { vi.resetAllMocks(); window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} }) })
afterEach(cleanup)

it('编辑者可为指定发布版本登记真实验收', async () => {
  vi.mocked(api).mockResolvedValueOnce([]).mockResolvedValueOnce({ id: 'a', projectId: 'guokexin', version: '2.0.0' }).mockResolvedValueOnce([])
  render(<DeliveryAcceptance projectId="guokexin" version="2.0.0" canEdit />)
  expect(await screen.findByText('暂无业务系统登记此版本。')).toBeTruthy()
  const user = userEvent.setup(); await user.click(screen.getByRole('button', { name: '登记验收' })); await user.type(screen.getByLabelText('业务系统'), '情报管理系统'); await user.click(screen.getByRole('button', { name: '保存验收记录' }))
  await waitFor(() => expect(api).toHaveBeenCalledWith('/projects/guokexin/acceptances', expect.objectContaining({ method: 'POST', body: expect.objectContaining({ version: '2.0.0', applicationName: '情报管理系统' }) })))
})

it('查看者只能查看验收记录', async () => {
  vi.mocked(api).mockResolvedValue([])
  render(<DeliveryAcceptance projectId="guokexin" version="2.0.0" canEdit={false} />)
  await screen.findByText('暂无业务系统登记此版本。')
  expect(screen.queryByRole('button', { name: '登记验收' })).toBeNull()
})
