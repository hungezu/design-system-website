// @vitest-environment jsdom
import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { resolveAccessibleProjectId } from './access-context'
import { publicNavigation } from '../components/AppLayout'
import { PageTabs } from '../components/NavigationControls'
import { ResourceManagerDemo } from '../pages/Components'
import { semanticTokens } from '../data/global/semantic-tokens'
import { buttonRecipeTokens } from '../data/components/button-recipe-tokens'
import { guokexinProject } from '../data/projects/guokexin'
import { testCustomerBProject } from '../data/projects/test-customer-b'
import { resolveProjectTheme } from '../services/theme-resolver'
import { COMPONENT_CATALOG, componentDisplayName } from '../design-system/component-catalog'
import { assetDestination } from '../services/asset-navigation'
import { createStableId, createThemePreviewStyle, loadWorkbenchDraft, saveWorkbenchDraft, type WorkbenchDraft } from '../services/workbench-draft'
import { guokexinProductBrief, guokexinTheme } from '../instances/guokexin'
import { GUOKEXIN_BRAND_TOKENS } from '../instances/guokexin/theme'
import { generateInformationArchitecture, generatePageLayouts, generateSystemLayout } from '../framework/services/generation-service'
import { baselineThemeSettings, deriveBrandPalette, loadProjectTheme, PROJECT_THEME_MODE_VALUES, projectPreviewVariables, projectThemeStorageKey, saveProjectTheme } from '../services/project-theme'

describe('上线信息分层与上下文一致性', () => {
  it('账号切换后立即落到可访问项目', () => {
    expect(resolveAccessibleProjectId('guokexin', ['test-customer-b'], 'guokexin')).toBe('test-customer-b')
  })

  it('项目切换会改变 Token 最终值和来源', () => {
    const guokexin = resolveProjectTheme(guokexinProject)
    const customerB = resolveProjectTheme(testCustomerBProject)
    expect(guokexin.values['brand-primary']).toBe('#165DFF')
    expect(customerB.values['brand-primary']).toBe('#13B2BA')
    expect(guokexin.sources['brand-primary']).toBe('project')
    expect(customerB.sources['brand-primary']).toBe('project')
  })

  it('国科信项目主色与交互色只从源码基准导出', () => {
    expect(guokexinTheme.brandPrimary).toBe(GUOKEXIN_BRAND_TOKENS.primary)
    expect(guokexinTheme.brandSecondary).toBe(GUOKEXIN_BRAND_TOKENS.subtle)
    expect(guokexinProject.tokenOverrides['brand-primary']).toBe(GUOKEXIN_BRAND_TOKENS.primary)
    expect(guokexinProject.tokenOverrides['brand-hover']).toBe(GUOKEXIN_BRAND_TOKENS.hover)
    expect(guokexinProject.tokenOverrides['brand-active']).toBe(GUOKEXIN_BRAND_TOKENS.active)
    expect(guokexinProject.tokenOverrides['brand-secondary']).toBe(GUOKEXIN_BRAND_TOKENS.subtle)
  })

  it('公共基线不读取项目覆盖', () => {
    expect(baselineThemeSettings.brandPrimary).toBe('#315C52')
    expect(baselineThemeSettings.brandPrimary).not.toBe(guokexinProject.tokenOverrides['brand-primary'])
    expect(baselineThemeSettings.brandPrimary).not.toBe(testCustomerBProject.tokenOverrides['brand-primary'])
  })

  it('项目主题按项目隔离保存', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
    saveProjectTheme('guokexin', { ...baselineThemeSettings, brandPrimary: '#165DFF' }, storage)
    saveProjectTheme('test-customer-b', { ...baselineThemeSettings, brandPrimary: '#13B2BA' }, storage)
    expect(loadProjectTheme(guokexinProject, storage).brandPrimary).toBe('#165DFF')
    expect(loadProjectTheme(testCustomerBProject, storage).brandPrimary).toBe('#13B2BA')
    expect(projectThemeStorageKey('guokexin')).not.toBe(projectThemeStorageKey('test-customer-b'))
  })

  it('主题配置真实映射到组件和页面预览变量', () => {
    const vars = projectPreviewVariables({ ...baselineThemeSettings, brandPrimary: '#123456', brandHover: '#345678', brandActive: '#102030', radius: 9, controlHeight: 38, density: 'compact' })
    expect(vars['--bds-btn-primary-bg']).toBe('#123456')
    expect(vars['--bds-btn-primary-bg-hover']).toBe('#102030')
    expect(vars['--bds-btn-primary-bg-pressed']).toBe('#0D1B28')
    expect(vars['--button-brand-filled-bg-default']).toBe('#123456')
    expect(vars['--button-brand-filled-border-default']).toBe('#123456')
    expect(vars['--bds-field-border-hover']).toBe('#345678')
    expect(vars['--bds-field-placeholder']).toBe('var(--field-placeholder)')
    expect(vars['--field-placeholder']).toBe('#6B7785')
    expect(vars['--bds-selection-background-checked']).toBe('#123456')
    expect(vars['--bds-table-row-hover']).toBe(baselineThemeSettings.brandSecondary)
    expect(vars['--bds-table-row-h-comfortable']).toBe('38px')
    expect(vars['--bds-pg-item-size']).toBe('38px')
    expect(vars['--brand-hover']).toBe('#345678')
    expect(vars['--brand-active']).toBe('#102030')
    expect(vars['--radius-control']).toBe('9px')
    expect(vars['--control-height-md']).toBe('38px')
    expect(vars['--preview-control-height']).toBe('38px')
    expect(vars['--preview-row-height']).toBe('38px')
    expect(vars['--preview-font-family']).toBe(baselineThemeSettings.fontFamily)
  })

  it('品牌主色自动生成弱调、悬停和按下色阶', () => {
    const palette = deriveBrandPalette('#165DFF')
    expect(palette).toEqual({ brandSecondary: '#E8EFFF', brandHover: '#407AFF', brandActive: '#124CD1' })
    expect(deriveBrandPalette('invalid')).toBeNull()
  })

  it('Button 专属 Token 不再属于设计基础', () => {
    expect(semanticTokens.some((token) => token.id.startsWith('button-'))).toBe(false)
    expect(semanticTokens.find((token) => token.id === 'field-placeholder')?.group).toBe('文字')
    expect(buttonRecipeTokens.every((token) => token.scope === 'component' && token.ownerComponentId === 'button')).toBe(true)
  })

  it('组件目录只有唯一正式地址并使用同一目录数据', () => {
    expect(new Set(COMPONENT_CATALOG.map((item) => item.componentId)).size).toBe(COMPONENT_CATALOG.length)
    expect(COMPONENT_CATALOG.map((item) => assetDestination({ type: 'component', id: item.componentId })).every((path) => /^\/components\/[^?]+$/.test(path))).toBe(true)
    expect(COMPONENT_CATALOG.every((item) => item.implementation === 'implemented')).toBe(true)
    expect(guokexinProject.componentIds.length).toBeLessThan(COMPONENT_CATALOG.length)
    expect(testCustomerBProject.componentIds).toContain('button')
    expect(componentDisplayName('button-group')).toBe('按钮组')
    expect(componentDisplayName('input')).toBe('输入框')
  })

  it('公开一级导航为中文且控制在六项', () => {
    expect(publicNavigation).toHaveLength(6)
    expect(publicNavigation.map((item) => item.label)).toEqual(['概览', '设计基础', '组件', '交互模式', '页面模板', '项目'])
  })
})

describe('工作台恢复与主题', () => {
  it('草稿可以保存并恢复，新增 ID 不依赖数组长度', () => {
    const brief = structuredClone(guokexinProductBrief)
    const layoutSpec = generateSystemLayout(brief)
    const draft: WorkbenchDraft = { step: 3, furthestStep: 4, brief, ia: generateInformationArchitecture(brief), layoutSpec, selectedCandidateId: layoutSpec.candidates[0].id, activeLayout: layoutSpec.candidates[0].root, pageSpecs: generatePageLayouts(brief), selectedPageId: '', theme: structuredClone(guokexinTheme) }
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) } }
    saveWorkbenchDraft(draft, storage)
    expect(loadWorkbenchDraft(storage)?.step).toBe(3)
    expect(createStableId('page')).toMatch(/^page-/)
  })

  it('深浅主题真实改变预览表面', () => {
    const light = createThemePreviewStyle({ ...guokexinTheme, mode: 'light' }) as Record<string, string>
    const dark = createThemePreviewStyle({ ...guokexinTheme, mode: 'dark' }) as Record<string, string>
    expect(light['--surface-primary']).toBe('#FFFFFF')
    expect(dark['--surface-primary']).toBe(PROJECT_THEME_MODE_VALUES.dark.surfacePrimary)
  })
})

describe('真实交互与无障碍', () => {
  it('Tabs 具有关联语义并支持键盘切换', async () => {
    const user = userEvent.setup()
    function Fixture() { const [selected, setSelected] = useState('a'); return <PageTabs selectedKey={selected} onSelectionChange={setSelected} items={[{ id: 'a', label: '视觉规范', content: '视觉内容' }, { id: 'b', label: '交互逻辑', content: '交互内容' }]} /> }
    render(<Fixture />)
    const first = screen.getByRole('tab', { name: '视觉规范' })
    first.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: '交互逻辑' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBeTruthy()
  })

  it('资源管理支持新增、编辑入口、批量操作和分页反馈', async () => {
    const user = userEvent.setup()
    render(<ResourceManagerDemo />)
    await user.click(screen.getByRole('button', { name: '新增资源' }))
    await user.type(screen.getByLabelText('名称'), '新建资源')
    await user.click(screen.getByRole('button', { name: '保存资源' }))
    expect(screen.getByText('资源已保存')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('搜索资源'), { target: { value: '新建资源' } })
    expect(screen.getByText('新建资源')).toBeTruthy()
    expect(screen.getByText(/共 1 条/)).toBeTruthy()
  })
})
