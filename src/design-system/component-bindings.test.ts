import { describe, expect, it } from 'vitest'
import { DESKTOP_COMPONENT_BINDINGS, getDesktopComponentBinding, resolveComponentBinding, resolveComponentStateTokens, resolveComponentTokens } from './component-bindings'

describe('桌面组件绑定契约', () => {
  it('覆盖电脑端组件目录并为每项提供 Recipe、Token 和状态槽位', () => {
    expect(DESKTOP_COMPONENT_BINDINGS.length).toBeGreaterThanOrEqual(40)
    for (const binding of DESKTOP_COMPONENT_BINDINGS) {
      expect(binding.runtimeExport).toMatch(/^DS/)
      expect(binding.recipeId).toContain(binding.componentId)
      expect(binding.tokenSlots).toContain('radius')
      expect(binding.states.length).toBeGreaterThan(0)
    }
  })
  it('项目覆盖只改变绑定状态，不改变组件语义 ID', () => {
    const base = getDesktopComponentBinding('button')!
    const override = resolveComponentBinding(base, { recipeId: 'button-guokexin', tokenSlots: [...base.tokenSlots, 'brand-primary'] })
    expect(override.componentId).toBe('button')
    expect(override.source).toBe('project')
    expect(override.status).toBe('override')
    expect(override.recipeId).toBe('button-guokexin')
  })
  it('将圆角、颜色和控件尺寸槽位解析为当前项目 Token', () => {
    const binding = getDesktopComponentBinding('button')!
    const resolved = resolveComponentTokens(binding, { 'radius-control': '4px', 'surface-primary': '#fff', 'text-primary': '#111', 'border-default': '#ddd', 'control-height-md': '32px', 'spacing-16': '16px', 'brand-primary': '#08f' }, {})
    expect(resolved.find((item) => item.slot === 'radius')).toMatchObject({ tokenId: 'radius-control', value: '4px' })
    expect(resolved.find((item) => item.slot === 'background')?.value).toBe('#fff')
  })
  it('激活态解析到项目品牌色及按钮状态变量', () => {
    const binding = getDesktopComponentBinding('button')!
    const values = {
      'brand-primary': '#165DFF',
      'brand-active': '#0E42D2',
      'button-brand-filled-bg-active': 'var(--brand-active)',
      'button-brand-filled-text-default': 'var(--text-on-brand)',
      'button-brand-filled-border-default': 'var(--brand-primary)',
      'text-on-brand': '#FFFFFF',
    }
    const sources = {
      'brand-primary': 'project' as const,
      'brand-active': 'project' as const,
      'button-brand-filled-bg-active': 'global' as const,
      'button-brand-filled-text-default': 'global' as const,
      'button-brand-filled-border-default': 'global' as const,
      'text-on-brand': 'global' as const,
    }
    const rows = resolveComponentStateTokens(binding, 'active', values, sources)
    expect(rows.find((row) => row.slot === '背景')).toMatchObject({ tokenId: 'button-brand-filled-bg-active', resolvedValue: '#0E42D2', source: 'project' })
    expect(rows.find((row) => row.slot === '文字')?.resolvedValue).toBe('#FFFFFF')
  })
  it('表单、选择和浮层组件使用各自的状态 Token 契约', () => {
    const values = { 'brand-primary': '#165DFF', 'text-on-brand': '#FFFFFF', 'surface-primary': '#FFFFFF', 'text-primary': '#1D2129', 'border-default': '#E5E6EB', 'shadow-dialog': '0 16px 40px rgba(29,33,41,.18)' }
    const sources = Object.fromEntries(Object.keys(values).map((key) => [key, 'project' as const]))
    expect(resolveComponentStateTokens(getDesktopComponentBinding('checkbox')!, 'checked', values, sources).map((row) => row.tokenId)).toContain('text-on-brand')
    expect(resolveComponentStateTokens(getDesktopComponentBinding('select')!, 'open', values, sources).find((row) => row.slot === '边框')?.tokenId).toBe('brand-primary')
    expect(resolveComponentStateTokens(getDesktopComponentBinding('dialog')!, 'default', values, sources).find((row) => row.slot === '阴影')?.tokenId).toBe('shadow-dialog')
  })
})

it('静态组件不声明 disabled/loading/error，交互组件保留真实 API 状态', async () => {
  const { getComponentStateSupport } = await import('./component-bindings')
  for (const id of ['divider','space','grid','kbd','icon','color-swatch','descriptions']) {
    expect(getDesktopComponentBinding(id)?.states).toEqual(['default'])
    expect(getComponentStateSupport(id).every(item=>item.status==='not-applicable')).toBe(true)
  }
  expect(getComponentStateSupport('checkbox').every(item=>item.status==='implemented')).toBe(true)
  expect(getDesktopComponentBinding('color-picker')?.states).not.toContain('open')
})
