// @vitest-environment jsdom
import { type CSSProperties } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { parseDate } from '@internationalized/date'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { PreviewScope } from '../theme/PreviewScope'
import { DSComboBox, DSNumberField, DSProgressBar, DSSearchField } from './AdvancedFields'
import { DSDropZone, DSPopover, DSTooltip } from './Collections/Additional'
import { DSListBox } from './Collections'
import { DSTree } from './Collections/Tree'
import { DSDatePicker } from './DateTime'
import { DSCheckboxGroup } from './Forms'
import { DSMenu } from './Navigation/Menu'

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
})
afterEach(cleanup)

const options = [{ id: 'design', label: '设计' }, { id: 'develop', label: '开发' }]
const previewVars = { '--brand-primary': '#165DFF', '--bds-brand': '#165DFF' } as CSSProperties

describe('国科信第一批基础组件准入', () => {
  it('搜索框可清空，数字输入遵守上限', async () => {
    const user = userEvent.setup()
    render(<><DSSearchField label="搜索资源" /><DSNumberField label="数量" defaultValue={1} minValue={0} maxValue={2} /></>)
    const search = screen.getByRole('searchbox', { name: '搜索资源' })
    await user.type(search, '按钮')
    await user.click(screen.getByRole('button', { name: '清空搜索资源' }))
    expect((search as HTMLInputElement).value).toBe('')
    await user.click(screen.getByRole('button', { name: '增加 数量' }))
    expect((screen.getByRole('button', { name: '增加 数量' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('复选框组在加载时禁止修改并暴露 busy 语义', async () => {
    const user = userEvent.setup()
    const change = vi.fn()
    render(<DSCheckboxGroup label="权限" options={options.map((item) => ({ value: item.id, label: item.label }))} loading onChange={change} />)
    const group = screen.getByRole('group', { name: '权限' })
    expect(group.closest('.owned-choice-group')?.getAttribute('aria-busy')).toBe('true')
    await user.click(screen.getByRole('checkbox', { name: '设计' }))
    expect(change).not.toHaveBeenCalled()
  })

  it('ComboBox 使用键盘选择并保留 Portal 主题', async () => {
    const user = userEvent.setup()
    const change = vi.fn()
    render(<PreviewScope vars={previewVars} inspectionId="combo-box-test"><DSComboBox label="职责" options={options} onSelectionChange={change} /></PreviewScope>)
    const input = screen.getByRole('combobox', { name: '职责' })
    await user.click(input)
    await user.keyboard('{ArrowDown}')
    const popup = await screen.findByRole('listbox')
    const surface = popup.closest('.owned-select__popover') as HTMLElement
    expect(surface.dataset.previewOwner).toBe('combo-box-test')
    expect(surface.style.getPropertyValue('--brand-primary')).toBe('#165DFF')
    await user.keyboard('{Enter}')
    expect(change).toHaveBeenCalled()
    expect((input as HTMLInputElement).value).toBeTruthy()
  })

  it('ListBox 和 Tree 支持选择与层级展开', async () => {
    const user = userEvent.setup()
    const listChange = vi.fn()
    const treeChange = vi.fn()
    render(<><DSListBox label="资源" items={[...options, { id: 'disabled', label: '禁用', disabled: true }]} selectionMode="single" onSelectionChange={listChange} /><DSTree label="资源树" items={[{ id: 'root', label: '设计规范', children: [{ id: 'child', label: '颜色' }] }]} selectionMode="single" onSelectionChange={treeChange} /></>)
    await user.click(screen.getByRole('option', { name: '开发' }))
    expect(listChange).toHaveBeenCalled()
    expect(screen.getByRole('option', { name: '禁用' }).getAttribute('aria-disabled')).toBe('true')
    await user.click(screen.getByRole('button', { name: /^展开设计规范/ }))
    await user.click(await screen.findByRole('row', { name: '颜色' }))
    expect(treeChange).toHaveBeenCalled()
  })

  it('进度条区分确定与不确定进度', () => {
    const { rerender } = render(<DSProgressBar label="导入进度" value={65} />)
    expect(screen.getByRole('progressbar', { name: '导入进度' }).getAttribute('aria-valuenow')).toBe('65')
    rerender(<DSProgressBar label="导入进度" isIndeterminate />)
    const indeterminate = screen.getByRole('progressbar', { name: '导入进度' })
    expect(indeterminate.hasAttribute('aria-valuenow')).toBe(false)
    expect(indeterminate.hasAttribute('data-indeterminate')).toBe(true)
  })

  it('日期选择器打开日历并继承项目主题', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<PreviewScope vars={previewVars} inspectionId="date-picker-test"><DSDatePicker label="日期" defaultValue={parseDate('2026-09-23')} /></PreviewScope>)
    await user.click(screen.getByRole('button', { name: /^选择日期/ }))
    const dialog = await screen.findByRole('dialog')
    const popover = dialog.closest('.owned-calendar-popover') as HTMLElement
    expect(popover.dataset.previewOwner).toBe('date-picker-test')
    expect(popover.style.getPropertyValue('--brand-primary')).toBe('#165DFF')
    await user.keyboard('{Escape}')
    rerender(<PreviewScope vars={previewVars} inspectionId="date-picker-test"><DSDatePicker label="日期" isInvalid errorMessage="请选择有效日期" /></PreviewScope>)
    expect(screen.getByText('请选择有效日期')).toBeTruthy()
  })

  it('Menu、Popover 和 Tooltip 可交互，且浮层继承项目主题', async () => {
    const user = userEvent.setup()
    const action = vi.fn()
    const { rerender } = render(<DSMenu label="操作" items={options} onAction={action} />)
    await user.click(screen.getByRole('menuitem', { name: '设计' }))
    expect(action).toHaveBeenCalledWith('design')

    rerender(<PreviewScope vars={previewVars} inspectionId="popover-test"><DSPopover label="查看详情">详情内容</DSPopover></PreviewScope>)
    const popoverTrigger = screen.getByRole('button', { name: '查看详情' })
    await user.click(popoverTrigger)
    let popup = (await screen.findByRole('dialog')).closest('.owned-popover') as HTMLElement
    expect(popup.dataset.previewOwner).toBe('popover-test')
    expect(popup.style.getPropertyValue('--brand-primary')).toBe('#165DFF')
    await user.keyboard('{Escape}')
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await user.unhover(popoverTrigger)

    rerender(<PreviewScope vars={previewVars} inspectionId="tooltip-test"><DSTooltip label="字段说明">查看说明</DSTooltip></PreviewScope>)
    await user.hover(screen.getByRole('button', { name: '查看说明' }))
    popup = await screen.findByRole('tooltip')
    expect(popup.dataset.previewOwner).toBe('tooltip-test')
    expect(popup.style.getPropertyValue('--brand-primary')).toBe('#165DFF')
  })

  it('DropZone 具有可访问名称、可选文件，禁用时阻止回调', () => {
    const onFiles = vi.fn()
    const { container, rerender } = render(<DSDropZone label="上传文件" onFiles={onFiles} />)
    expect(screen.getByLabelText('上传文件')).toBeTruthy()
    let input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['ok'], 'design.json', { type: 'application/json' })] } })
    expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'design.json' })])

    onFiles.mockClear()
    rerender(<DSDropZone label="上传文件" onFiles={onFiles} disabled />)
    input = container.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['blocked'], 'blocked.json')] } })
    expect((screen.getByRole('button', { name: '选择文件' }) as HTMLButtonElement).disabled).toBe(true)
    expect(onFiles).not.toHaveBeenCalled()
  })
})
