// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppSelect } from './AppSelect'

afterEach(cleanup)

describe('AppSelect', () => {
  it('默认显示第一项，并保持原生 Select 的 onChange 调用形式', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <AppSelect aria-label="资源排序" onChange={onChange}>
        <option value="name">按名称</option>
        <option value="type">按类型</option>
      </AppSelect>,
    )

    expect(screen.getByRole('button', { name: /资源排序/ }).textContent).toContain('按名称')
    await user.click(screen.getByRole('button', { name: /资源排序/ }))
    await user.click(screen.getByRole('option', { name: '按类型' }))

    expect(onChange).toHaveBeenCalledWith({ target: { value: 'type' } })
  })

  it('传递禁用状态并阻止打开菜单', async () => {
    const user = userEvent.setup()
    render(
      <AppSelect aria-label="禁用选择" disabled>
        <option value="one">选项一</option>
      </AppSelect>,
    )

    const trigger = screen.getByRole('button', { name: /禁用选择/ })
    expect((trigger as HTMLButtonElement).disabled).toBe(true)
    await user.click(trigger)
    expect(screen.queryByRole('listbox')).toBeNull()
  })
})
