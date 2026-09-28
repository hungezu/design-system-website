// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { parseDate } from '@internationalized/date'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { DSMeter, DSSlider } from './AdvancedFields'
import { DSAutocomplete, DSDisclosure, DSTagGroup } from './Collections/Additional'
import { DSAccordion, DSBreadcrumb, DSLink, DSSeparator, DSToggleButton, DSToggleButtonGroup, DSToolbar } from './Collections'
import { DSCalendar, DSDateField, DSDateRangePicker, DSRangeCalendar, DSTimeField } from './DateTime'
import { DSColorArea, DSColorField, DSColorSlider, DSColorSwatch, DSColorSwatchPicker } from './Colors'
import { DSColorPicker } from './Colors/ColorPicker'

beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} })
})
afterEach(cleanup)

const options = [{ id: 'design', label: '设计' }, { id: 'develop', label: '开发' }]

describe('国科信第二批基础组件准入', () => {
  it('切换按钮组具有组名称、选中态和禁用态', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DSToggleButtonGroup aria-label="对齐方式" selectionMode="single"><DSToggleButton id="left">左对齐</DSToggleButton><DSToggleButton id="center">居中</DSToggleButton></DSToggleButtonGroup>)
    const left = screen.getByRole('radio', { name: '左对齐' })
    await user.click(left)
    expect(left.getAttribute('aria-checked')).toBe('true')
    rerender(<DSToggleButtonGroup aria-label="对齐方式" selectionMode="single" isDisabled><DSToggleButton id="left">左对齐</DSToggleButton><DSToggleButton id="center">居中</DSToggleButton></DSToggleButtonGroup>)
    expect((screen.getByRole('radio', { name: '左对齐' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('Autocomplete、Slider 与 Meter 保留真实键盘和数值语义', async () => {
    const user = userEvent.setup()
    const selected = vi.fn()
    const changed = vi.fn()
    render(<><DSAutocomplete label="职责" options={options} onSelectionChange={selected} /><DSSlider label="密度" defaultValue={40} onChange={changed} /><DSMeter label="已用容量" value={35} /></>)
    const input = screen.getByRole('combobox', { name: '职责' })
    await user.click(input); await user.keyboard('{ArrowDown}{Enter}')
    expect(selected).toHaveBeenCalled()
    const slider = screen.getByRole('slider', { name: /^密度(?: 密度)?$/ })
    slider.focus(); await user.keyboard('{ArrowRight}')
    expect(changed).toHaveBeenCalled()
    expect(screen.getByRole('meter', { name: '已用容量' }).getAttribute('aria-valuenow')).toBe('35')
  })

  it('标签组移除操作返回精确条目', async () => {
    const user = userEvent.setup()
    const remove = vi.fn()
    render(<DSTagGroup label="标签" items={options} onRemove={remove} />)
    await user.click(screen.getByRole('button', { name: /^移除设计(?: 设计)?$/ }))
    expect(remove).toHaveBeenCalledWith(['design'])
  })

  it('日期与时间家族具有独立可访问契约', () => {
    render(<><DSCalendar aria-label="日历" defaultValue={parseDate('2026-09-23')} /><DSDateField label="日期字段" defaultValue={parseDate('2026-09-23')} /><DSDateRangePicker label="日期范围" /><DSRangeCalendar aria-label="范围日历" /><DSTimeField label="时间字段" /></>)
    expect(screen.getAllByRole('grid').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('日期字段')).toBeTruthy()
    expect(screen.getByText('日期范围')).toBeTruthy()
    expect(screen.getByText('时间字段')).toBeTruthy()
  })

  it('颜色家族正常绑定值，禁用态不可操作', () => {
    const { container } = render(<><DSColorArea aria-label="颜色区域" defaultValue="#165DFF" colorSpace="hsb" xChannel="saturation" yChannel="brightness" isDisabled /><DSColorField label="颜色值" defaultValue="#165DFF" isDisabled /><DSColorSlider label="色相" channel="hue" defaultValue="hsl(217, 100%, 54%)" isDisabled /><DSColorPicker label="选择颜色" defaultValue="#165DFF" isDisabled /><DSColorSwatch color="#165DFF" /><DSColorSwatchPicker aria-label="选择色块" colors={['#165DFF','#00B42A']} isDisabled /></>)
    expect(container.querySelectorAll('[data-disabled]').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.owned-color-picker-panel[data-disabled] input:disabled').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.owned-color-picker[data-disabled] [aria-disabled="true"]')).toHaveLength(2)
    expect(container.querySelector('.owned-color-swatch')).toBeTruthy()
  })

  it('面包屑、折叠、链接、工具栏和分隔符保留正确语义', async () => {
    const user = userEvent.setup()
    const { container } = render(<><DSBreadcrumb items={[{id:'root',label:'首页',href:'/'},{id:'current',label:'当前页'}]} /><DSDisclosure title="展开说明">说明内容</DSDisclosure><DSAccordion label="帮助" items={[{id:'a',title:'禁用项',content:'不可展开',disabled:true}]} /><DSLink href="/quick-start" isDisabled>禁用链接</DSLink><DSToolbar aria-label="格式工具"><DSToggleButton>强调</DSToggleButton></DSToolbar><DSSeparator orientation="vertical" /></>)
    const current = container.querySelector('[aria-current="page"]')
    expect(current?.tagName).toBe('SPAN')
    const disclosure = screen.getByRole('button', { name: '展开说明' })
    await user.click(disclosure)
    expect(disclosure.getAttribute('aria-expanded')).toBe('true')
    expect((screen.getByRole('button', { name: '禁用项' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText('禁用链接').getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('toolbar', { name: '格式工具' })).toBeTruthy()
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical')
  })
})
