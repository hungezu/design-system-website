import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { guokexinProject } from '../data/projects/guokexin'
import { componentAssets } from '../data/assets/components'
import { RUNTIME_COMPONENT_REGISTRY } from '../runtime/registry'
import { getDesktopComponentBinding, resolveComponentStateTokens } from './component-bindings'
import { resolveProjectTheme, resolveReleaseThemeFromCss } from '../services/theme-resolver'
import { CORE_COMPONENT_IDS } from '../data/core-quality'

describe('国科信项目组件闭环', () => {
  it('21 个核心组件都具有 Runtime、资产、Binding、Token 和状态契约', () => {
    for (const componentId of CORE_COMPONENT_IDS) {
      const runtime = RUNTIME_COMPONENT_REGISTRY[componentId]
      const asset = componentAssets.find((item) => item.id === componentId || item.id === `component-${componentId}`)
      const binding = getDesktopComponentBinding(componentId)
      expect(runtime, componentId).toBeTruthy()
      expect(asset, componentId).toBeTruthy()
      expect(asset?.bindings?.react?.exportName, componentId).toBe(runtime.runtimeExport)
      expect(Object.keys(asset?.bindings?.react?.props ?? {}).length, componentId).toBeGreaterThan(0)
      expect(asset?.tokens.length, componentId).toBeGreaterThan(0)
      expect(asset?.states.length, componentId).toBeGreaterThan(0)
      expect(asset?.lifecycle?.version, componentId).toBeTruthy()
      expect(asset?.sync?.react, componentId).toBe('bound')
      expect(binding?.states.length, componentId).toBeGreaterThan(0)
      expect(asset?.states.every((state) => binding?.states.includes(state.id)), componentId).toBe(true)
    }
  })

  it('每个项目组件的已声明状态都能解析 Token', () => {
    const theme = resolveProjectTheme(guokexinProject)
    for (const componentId of guokexinProject.componentIds) {
      const binding = getDesktopComponentBinding(componentId)!
      for (const state of binding.states) {
        const rows = resolveComponentStateTokens(binding, state, theme.values, theme.sources)
        expect(rows.length, `${componentId}/${state}`).toBeGreaterThan(0)
        expect(rows.every((row) => row.value && row.resolvedValue), `${componentId}/${state}`).toBe(true)
      }
    }
  })

  it('冻结 Token 解析不会回退到当前蓝色草稿', () => {
    const css = readFileSync(new URL('../../public/release-assets/guokexin/1.5.5/tokens.css', import.meta.url), 'utf8')
    const releaseTheme = resolveReleaseThemeFromCss(css, guokexinProject)
    expect(releaseTheme.values['brand-primary']).toBe('#0a7b6c')
    expect(releaseTheme.values['button-brand-filled-bg-default']).toBe('#006c5d')
    expect(releaseTheme.sources['brand-primary']).toBe('release')
    expect(releaseTheme.sources['button-brand-filled-bg-default']).toBe('release')
    expect(releaseTheme.values['brand-primary']).not.toBe(guokexinProject.tokenOverrides['brand-primary'])
  })
})
