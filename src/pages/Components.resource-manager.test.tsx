// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { ResourceManagerDemo } from './Components'

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
})
afterEach(cleanup)

describe('资源管理弹窗', () => {
  it('使用统一字段组件并在弹窗内显示校验错误', async () => {
    const user = userEvent.setup()
    render(<ResourceManagerDemo />)
    await user.click(screen.getByRole('button', { name: '新增资源' }))
    const dialog = screen.getByRole('dialog', { name: '新增资源' })

    expect(within(dialog).getByRole('textbox', { name: /名称/ })).toBeTruthy()
    expect(within(dialog).getByRole('button', { name: /生命周期/ })).toBeTruthy()
    await user.click(within(dialog).getByRole('button', { name: '保存资源' }))
    expect(within(dialog).getByText('请输入资源名称')).toBeTruthy()
  })

  it('生命周期使用统一 DSSelect 而不是页面级 AppSelect', async () => {
    const user = userEvent.setup()
    render(<ResourceManagerDemo />)
    await user.click(screen.getByRole('button', { name: '新增资源' }))
    const dialog = screen.getByRole('dialog', { name: '新增资源' })
    expect(dialog.querySelector('.owned-select')).toBeTruthy()
    expect(dialog.querySelector('.app-select')).toBeNull()
    expect(within(dialog).getByRole('button', { name: /生命周期/ }).textContent).toContain('草稿')
  })
})

it('管理示例复用共享表格、复选框和分页，半选与筛选重置一致', async () => {
  const user = userEvent.setup()
  const {container} = render(<ResourceManagerDemo />)
  expect(container.querySelector('table')).toBeNull()
  expect(container.querySelector('.ds-table')).toBeTruthy()
  expect(container.querySelector('.owned-pagination')).toBeTruthy()
  const header = screen.getByRole('checkbox', {name: '全选当前页'}) as HTMLInputElement
  await user.click(screen.getAllByRole('checkbox')[1])
  expect(header.indeterminate).toBe(true)
  expect(screen.getByRole('region', {name: '批量操作'})).toBeTruthy()
  await user.type(screen.getByRole('textbox', {name: '搜索资源'}), '无匹配内容')
  expect(screen.queryByRole('region', {name: '批量操作'})).toBeNull()
  expect(container.querySelector('.owned-pagination')).toBeNull()
  expect(header.disabled).toBe(true)
})
