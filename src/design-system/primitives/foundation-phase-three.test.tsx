// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DSTokenField } from './AdvancedFields'
import { DSGridList, DSGroup, DSPreviewTrigger } from './Collections'
import { DSNavigationTree } from './Collections/NavigationTree'
import { DSVirtualizer } from './Collections/Virtualizer'
import { DSColorWheel } from './Colors'

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
})
afterEach(cleanup)

const collectionItems = [
  { id: 'design', label: '设计', description: '设计规范' },
  { id: 'develop', label: '开发', description: '工程实现' },
  { id: 'disabled', label: '禁用', disabled: true },
]

describe('国科信第三批基础组件准入', () => {
  it('TokenField 展示初始 Token 并支持进入编辑状态', async () => {
    const user = userEvent.setup()
    render(<DSTokenField label="技能标签" defaultTokens={[{ id: 'design', label: '设计' }]} defaultText="审核" />)
    const editor = screen.getByRole('textbox', { name: '技能标签' })
    expect(screen.getByText('设计')).toBeTruthy()
    expect(editor.textContent).toContain('审核')
    await user.click(editor)
    expect(document.activeElement).toBe(editor)
  })

  it('GridList 支持行选择、禁用项和通用 Group 状态', async () => {
    const user = userEvent.setup()
    const selectionChange = vi.fn()
    render(<><DSGridList label="资源列表" items={collectionItems} selectionMode="single" onSelectionChange={selectionChange} /><DSGroup label="字段组" isInvalid><button type="button">检查字段</button></DSGroup></>)
    await user.click(screen.getByRole('row', { name: /设计/ }))
    expect(selectionChange).toHaveBeenCalled()
    expect(screen.getByRole('row', { name: /禁用/ }).getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('group', { name: '字段组' }).hasAttribute('data-invalid')).toBe(true)
  })

  it('ColorWheel 保留色相数值与键盘调整语义', async () => {
    const user = userEvent.setup()
    const change = vi.fn()
    const { rerender } = render(<DSColorWheel label="色相" defaultValue="hsl(217, 100%, 54%)" onChange={change} />)
    const slider = screen.getByRole('slider', { name: '色相' })
    slider.focus()
    await user.keyboard('{ArrowRight}')
    expect(change).toHaveBeenCalled()
    rerender(<DSColorWheel label="色相" defaultValue="hsl(217, 100%, 54%)" isDisabled />)
    expect((screen.getByRole('slider', { name: '色相' }) as HTMLInputElement).disabled).toBe(true)
  })

  it('NavigationTree 展开当前路由，PreviewTrigger 在悬停时显示预览', async () => {
    const user = userEvent.setup()
    render(<><DSNavigationTree label="规范导航" selectedRoute="/foundations/color" items={[{ id: 'foundations', label: '基础规范', href: '/foundations', children: [{ id: 'color', label: '颜色', href: '/foundations/color' }] }, { id: 'disabled', label: '禁用导航', href: '/disabled', disabled: true }]} /><DSPreviewTrigger label="预览 Token" previewLabel="Token 预览" preview={<strong>品牌主色 #165DFF</strong>} delay={0} closeDelay={0} /></>)
    expect(screen.getByRole('treegrid', { name: '规范导航' })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /^展开基础规范/ }))
    expect(screen.getByRole('link', { name: '颜色' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: '禁用导航' }).getAttribute('aria-disabled')).toBe('true')
    await user.hover(screen.getByRole('button', { name: '预览 Token' }))
    expect(await screen.findByLabelText('Token 预览')).toBeTruthy()
  })

  it('Virtualizer 暴露完整集合数量并保留选择交互', async () => {
    const user = userEvent.setup()
    const selectionChange = vi.fn()
    const items = Array.from({ length: 100 }, (_, index) => ({ id: `item-${index}`, label: `资源 ${index + 1}` }))
    render(<DSVirtualizer label="大型资源列表" items={items} height={160} rowSize={32} selectionMode="single" onSelectionChange={selectionChange} />)
    const grid = screen.getByRole('grid', { name: '大型资源列表' })
    expect(grid.getAttribute('aria-rowcount')).toBe('100')
    expect(grid.style.height).toBe('160px')
    expect(grid.style.getPropertyValue('--owned-virtualizer-row-size')).toBe('32px')
    await user.click(screen.getByRole('row', { name: '资源 1' }))
    expect(selectionChange).toHaveBeenCalled()
  })
})
