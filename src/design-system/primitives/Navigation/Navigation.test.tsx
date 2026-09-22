// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DSMenu, DSTabs, type DSMenuItem } from './index'
import { PreviewScope } from '../../theme/PreviewScope'
import type { CSSProperties } from 'react'

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })
const items: DSMenuItem[] = [
  { id: 'home', label: '概览' },
  { id: 'resources', label: '资源', children: [{ id: 'components', label: '组件' }, { id: 'locked', label: '待发布', disabled: true }] },
  { id: 'settings', label: '设置', children: [{ id: 'members', label: '成员' }] },
]
describe('菜单导航', () => {
  it('保留默认操作列表 API，并跳过禁用操作', async () => {
    const user = userEvent.setup(), action = vi.fn()
    render(<DSMenu label="操作" items={[{ id: 'copy', label: '复制' }, { id: 'delete', label: '删除', disabled: true }]} onAction={action} />)
    await user.click(screen.getByRole('menuitem', { name: '复制' }))
    expect(action).toHaveBeenLastCalledWith('copy')
    await user.click(screen.getByRole('menuitem', { name: '删除' }))
    expect(action).toHaveBeenCalledTimes(1)
  })
  it('子菜单可展开、选择，手风琴只展开同层一组', async () => {
    const user = userEvent.setup(), action = vi.fn()
    render(<DSMenu mode="vertical" label="导航" items={items} defaultValue="home" accordion onAction={action} />)
    await user.click(screen.getByRole('button', { name: '资源' }))
    expect(screen.getByRole('button', { name: '资源' }).getAttribute('aria-expanded')).toBe('true')
    await user.click(screen.getByRole('button', { name: '组件' }))
    expect(screen.getByRole('button', { name: '组件' }).getAttribute('aria-current')).toBe('page')
    expect(action).toHaveBeenLastCalledWith('components')
    await user.click(screen.getByRole('button', { name: '待发布' }))
    expect(action).toHaveBeenCalledTimes(1)
    await user.click(screen.getByRole('button', { name: '设置' }))
    expect(screen.queryByRole('button', { name: '组件' })).toBeNull()
    expect(screen.getByRole('button', { name: '成员' })).toBeTruthy()
  })
  it('受控选择和展开只请求变更，由调用方决定实际状态', async () => {
    const user = userEvent.setup(), action = vi.fn(), expand = vi.fn()
    const { rerender } = render(<DSMenu mode="vertical" label="导航" items={items} value="home" openKeys={[]} onAction={action} onOpenChange={expand} />)
    await user.click(screen.getByRole('button', { name: '资源' }))
    expect(expand).toHaveBeenLastCalledWith(['resources'])
    expect(screen.queryByRole('button', { name: '组件' })).toBeNull()
    rerender(<DSMenu mode="vertical" label="导航" items={items} value="home" openKeys={['resources']} onAction={action} />)
    await user.click(screen.getByRole('button', { name: '组件' }))
    expect(action).toHaveBeenLastCalledWith('components')
    expect(screen.getByRole('button', { name: '概览' }).getAttribute('aria-current')).toBe('page')
  })
  it.each(['horizontal', 'vertical'] as const)('%s 弹出子菜单继承主题、选择关闭且 Escape 恢复焦点', async mode => {
    const user = userEvent.setup(), action = vi.fn()
    render(<PreviewScope vars={{ '--bds-brand': '#165DFF' } as CSSProperties}><DSMenu mode={mode} label="导航" items={items} defaultCollapsed onAction={action} /></PreviewScope>)
    const trigger = screen.getByRole('button', { name: '资源' })
    await user.click(trigger)
    const dialog = screen.getByRole('dialog', { name: '资源子菜单' })
    expect((dialog.closest('.owned-nav-popover') as HTMLElement).style.getPropertyValue('--bds-brand')).toBe('#165DFF')
    await user.click(within(dialog).getByRole('button', { name: '组件' }))
    expect(action).toHaveBeenLastCalledWith('components')
    expect(screen.queryByRole('dialog')).toBeNull()
    await user.click(trigger)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })
  it('收起与展开不丢失已选中子项', async () => {
    const user = userEvent.setup()
    render(<DSMenu mode="vertical" label="导航" items={items} defaultValue="components" defaultOpenKeys={['resources']} collapsible />)
    await user.click(screen.getByRole('button', { name: '收起菜单' }))
    expect(screen.getByRole('navigation').hasAttribute('data-collapsed')).toBe(true)
    await user.click(screen.getByRole('button', { name: '展开菜单' }))
    await user.click(screen.getByRole('button', { name: '资源' }))
    expect(screen.getByRole('button', { name: '组件' }).getAttribute('aria-current')).toBe('page')
  })
  it('方向键与 Home/End 跳过禁用项，Enter 执行选中', async () => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{ width: 100, height: 36 }] as unknown as DOMRectList)
    const user = userEvent.setup(), action = vi.fn()
    render(<DSMenu mode="horizontal" label="导航" items={[{ id: 'a', label: '第一项' }, { id: 'b', label: '禁用项', disabled: true }, { id: 'c', label: '第三项' }]} onAction={action} />)
    screen.getByRole('button', { name: '第一项' }).focus()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(action).toHaveBeenLastCalledWith('c')
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '第一项' }))
    await user.keyboard('{End}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '第三项' }))
  })
  it('整个导航禁用时，展开的子项也不能操作', async () => {
    const user = userEvent.setup(), action = vi.fn()
    render(<DSMenu mode="vertical" label="导航" items={items} disabled defaultOpenKeys={['resources']} onAction={action} />)
    await user.click(screen.getByRole('button', { name: '组件' }))
    expect(action).not.toHaveBeenCalled()
  })
  it('禁用分组的已展开后代不能触发操作', async () => {
    const user = userEvent.setup(), action = vi.fn()
    render(<DSMenu mode="vertical" label="导航" items={[{ ...items[1], disabled: true }]} defaultOpenKeys={['resources']} onAction={action} />)
    await user.click(screen.getByRole('button', { name: '组件' }))
    expect(action).not.toHaveBeenCalled()
    expect((screen.getByRole('button', { name: '组件' }) as HTMLButtonElement).disabled).toBe(true)
  })
})
describe('Tabs 展示与键盘语义', () => {
  it.each(['underline', 'filled'] as const)('%s 切换对应内容，键盘跳过禁用项', async appearance => {
    const user = userEvent.setup()
    render(<DSTabs label="设置" appearance={appearance} items={[{ id: 'a', label: '基本', content: '基本内容' }, { id: 'b', label: '禁用', disabled: true, content: '禁用内容' }, { id: 'c', label: '权限', badge: 8, content: '权限内容' }]} />)
    await user.click(screen.getByRole('tab', { name: '基本' }))
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tabpanel').textContent).toBe('权限内容')
    expect(screen.getByRole('tab', { name: '禁用' }).getAttribute('aria-disabled')).toBe('true')
  })
  it('纵向与受控值保留 React Aria 行为', async () => {
    const user = userEvent.setup(), change = vi.fn()
    render(<DSTabs label="设置" orientation="vertical" value="a" onChange={change} items={[{ id: 'a', label: '基本', content: '基本内容' }, { id: 'b', label: '权限', content: '权限内容' }]} />)
    await user.click(screen.getByRole('tab', { name: '权限' }))
    expect(change).toHaveBeenLastCalledWith('b')
    expect(screen.getByRole('tabpanel').textContent).toBe('基本内容')
    expect(screen.getByRole('tablist').getAttribute('aria-orientation')).toBe('vertical')
  })
})
