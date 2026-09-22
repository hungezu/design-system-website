import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baselineThemeSettings, contrastRatio, defaultProjectTheme, projectPreviewVariables, releasePreviewVariables, resolvePreviewTheme } from './project-theme'
import { resolveReleaseThemeFromCss } from './theme-resolver'
import { getDesktopComponentBinding, resolveComponentStateTokens } from '../design-system/component-bindings'
import { guokexinProject } from '../data/projects/guokexin'
import { testCustomerBProject } from '../data/projects/test-customer-b'
import { checkTheme } from './workspace-backup'

describe('审计修复：预览、文档、冻结主题同源', () => {
  it('公共、深色、自定义表面上的占位文字均可读', () => {
    for (const settings of [baselineThemeSettings, { ...baselineThemeSettings, mode: 'dark' as const, surfacePrimary: '#1F2428', textSecondary: '#C4CAD1' }, { ...baselineThemeSettings, surfacePrimary: '#777777' }]) {
      const vars = projectPreviewVariables(settings)
      expect(contrastRatio(vars['--field-placeholder'], settings.surfacePrimary)).toBeGreaterThanOrEqual(4.5)
      expect(vars['--field-placeholder']).toBe(resolvePreviewTheme(settings).values['field-placeholder'])
    }
  })
  it('保留自定义品牌主色，并为默认、悬停、按下分别选择可读文字', () => {
    const settings = defaultProjectTheme(testCustomerBProject)
    const vars = projectPreviewVariables(settings)
    expect(vars['--brand-primary']).toBe(settings.brandPrimary)
    expect(vars['--button-brand-filled-text-default']).toBe('#FFFFFF')
    expect(contrastRatio(vars['--button-brand-filled-text-default'], vars['--button-brand-filled-bg-default'])).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(vars['--button-brand-filled-text-hover'], vars['--button-brand-filled-bg-hover'])).toBeGreaterThanOrEqual(4.5)
  })
  it('次要按钮状态说明与 CSS 输出完全一致', () => {
    const theme = resolvePreviewTheme(baselineThemeSettings)
    const vars = projectPreviewVariables(baselineThemeSettings)
    for (const state of ['default', 'hover', 'active']) {
      const rows = resolveComponentStateTokens(getDesktopComponentBinding('button')!, state, theme.values, theme.sources, { variant: 'secondary', semantic: 'default' })
      for (const row of rows) expect(row.resolvedValue).toBe(vars[`--${row.tokenId}`])
    }
  })
  it('冻结包的实际按钮配方和历史品牌分开保留，不读取草稿', () => {
    const css = readFileSync(new URL('../../public/release-assets/guokexin/1.5.5/tokens.css', import.meta.url), 'utf8')
    const vars = releasePreviewVariables(css)
    expect(vars['--brand-primary']).toBe('#0a7b6c')
    expect(vars['--button-brand-filled-bg-default']).toBe('#006c5d')
    expect(vars['--bds-btn-primary-bg']).toBe('#006c5d')
    expect(vars['--button-brand-filled-border-default']).toBe('#006c5d')
    expect(resolveReleaseThemeFromCss(css, { ...guokexinProject, tokenOverrides: { 'brand-primary': '#F0A001' } }).values).toEqual(resolveReleaseThemeFromCss(css, guokexinProject).values)
  })
  it('缺失历史值明确标为兼容基线，并保留原包直接语义值', () => {
    const theme = resolveReleaseThemeFromCss('--brand-primary: #123456; --bds-brand: #654321;', { ...guokexinProject, tokenOverrides: { 'radius-dialog': '99px' } })
    expect(theme.values['brand-primary']).toBe('#123456')
    expect(theme.sources['brand-primary']).toBe('release')
    expect(theme.values['radius-dialog']).not.toBe('99px')
    expect(theme.sources['radius-dialog']).toBe('compatibility')
  })
  it('正文尺寸与按钮字体配方一起更新', () => {
    const vars = projectPreviewVariables({ ...baselineThemeSettings, bodySize: 18, fontFamily: 'serif' })
    expect(vars['--font-button']).toBe('500 18px/26px serif')
    expect(vars['--preview-body-size']).toBe('18px')
    expect(vars['--bds-font']).toBe('serif')
  })
  it('静态组件不声明虚假的交互、加载或错误状态', () => {
    for (const id of ['divider', 'space', 'grid', 'kbd', 'icon']) expect(getDesktopComponentBinding(id)?.states).toEqual(['default'])
  })
})

it('品牌实心按钮各状态使用白字，浅底色仅在按钮配方中加深',()=>{
 for(const brandPrimary of ['#4080FF','#FFCC00','#FFFFFF','#165DFF']) {
  const vars=projectPreviewVariables({...baselineThemeSettings,brandPrimary,brandActive:brandPrimary})
  expect(vars['--brand-primary']).toBe(brandPrimary)
  for(const state of ['default','hover','active']) {
   expect(vars[`--button-brand-filled-text-${state}`]).toBe('#FFFFFF')
   expect(contrastRatio('#FFFFFF',vars[`--button-brand-filled-bg-${state}`])).toBeGreaterThanOrEqual(4.5)
  }
 }
 expect(projectPreviewVariables({...baselineThemeSettings,brandPrimary:'#165DFF'})['--button-brand-filled-bg-default']).toBe('#165DFF')
})

it('主按钮显式颜色在安全配方之后覆盖，并同步文字与图标状态',()=>{
 const settings={...baselineThemeSettings,buttonPrimaryBackground:'#FFFFFF',buttonPrimaryText:'#000000'}
 const vars=projectPreviewVariables(settings)
 expect(vars['--button-brand-filled-bg-default']).toBe('#FFFFFF')
 expect(vars['--button-brand-filled-border-default']).toBe('#FFFFFF')
 expect(vars['--button-brand-filled-bg-hover']).toBe('#E6E6E6')
 expect(vars['--button-brand-filled-bg-active']).toBe('#C1C1C1')
 expect(vars['--bds-btn-primary-bg']).toBe('#FFFFFF')
 for(const state of ['default','hover','active'])expect(vars[`--button-brand-filled-text-${state}`]).toBe('#000000')
 expect(()=>checkTheme(settings)).not.toThrow()
 expect(()=>checkTheme({...baselineThemeSettings,buttonPrimaryBackground:'#FFFFFF'})).toThrow('4.5:1')
 expect(()=>checkTheme({...baselineThemeSettings,buttonPrimaryText:'red'})).toThrow('buttonPrimaryText')
})

it('危险文字按钮的状态说明使用危险文字配方',()=>{
 const theme=resolvePreviewTheme(baselineThemeSettings)
 for(const state of ['default','hover','active']){
 const rows=resolveComponentStateTokens(getDesktopComponentBinding('button')!,state,theme.values,theme.sources,{variant:'tertiary',semantic:'danger'})
 expect(rows.find(row=>row.slot==='文字')?.resolvedValue).toBe(theme.values['status-error-text'])
 expect(rows.find(row=>row.slot==='背景')?.resolvedValue).toBe('transparent')
 }
})
