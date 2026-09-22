// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccess } from '../app/access-context'
import { guokexinProject } from '../data/projects'
import { api } from '../services/workspace-api'
import { UsersPage } from './UsersPage'

vi.mock('../app/access-context', () => ({ useAccess: vi.fn() }))
vi.mock('../services/workspace-api', () => ({ api: vi.fn() }))

describe('平台项目删除', () => {
  const refresh = vi.fn(async () => undefined)

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAccess).mockReturnValue({
      user: { id: 'admin', platformRole: 'admin' },
      session: { projects: [guokexinProject] },
      refresh,
    } as unknown as ReturnType<typeof useAccess>)
    vi.mocked(api).mockImplementation(async path => path === '/admin/users' ? [] : { ok: true })
  })
  afterEach(cleanup)

  it('要求输入项目名后才能确认，成功后刷新项目列表', async () => {
    render(<MemoryRouter><UsersPage /></MemoryRouter>)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: '项目' }))
    await user.click(screen.getByRole('button', { name: '删除项目' }))

    const confirm = screen.getByRole('button', { name: '确认删除' }) as HTMLButtonElement
    expect(confirm.disabled).toBe(true)
    expect(screen.getByRole('alertdialog').textContent).toContain('项目主题、成员权限、邀请、版本和交付验收记录')

    const confirmation = screen.getByRole('textbox', { name: `输入“${guokexinProject.name}”以确认` })
    expect((confirmation as HTMLInputElement).required).toBe(true)
    expect(confirmation.closest('.owned-textfield')?.querySelector('.ds-input__required')?.textContent).toContain('*')
    await user.type(confirmation, guokexinProject.name)
    expect(confirm.disabled).toBe(false)
    await user.click(confirm)

    await waitFor(() => expect(api).toHaveBeenCalledWith('/admin/projects/guokexin', { method: 'DELETE' }))
    expect(refresh).toHaveBeenCalledTimes(1)
    expect((await screen.findByRole('status')).textContent).toContain(`项目“${guokexinProject.name}”已删除。`)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('删除失败时保留确认信息并展示可恢复的错误', async () => {
    vi.mocked(api).mockImplementation(async path => {
      if (path === '/admin/users') return []
      throw new Error('项目交付包正在生成，请稍后再删除。')
    })
    render(<MemoryRouter><UsersPage /></MemoryRouter>)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: '项目' }))
    await user.click(screen.getByRole('button', { name: '删除项目' }))
    const field = screen.getByRole('textbox', { name: `输入“${guokexinProject.name}”以确认` })
    await user.type(field, guokexinProject.name)
    await user.click(screen.getByRole('button', { name: '确认删除' }))

    expect((await screen.findByRole('alert')).textContent).toContain('项目交付包正在生成，请稍后再删除。')
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect((field as HTMLInputElement).value).toBe(guokexinProject.name)
    expect(refresh).not.toHaveBeenCalled()
  })
})
