import { paletteValues } from '../data/global/color-palettes'
import { semanticTokens } from '../data/global/semantic-tokens'
import { buttonRecipeTokens } from '../data/components/button-recipe-tokens'
import { getPlatform } from '../data/platforms'
import type { DesignAsset, ProjectConfig, ResolvedAssetContext, ResolvedTheme } from '../types/design-system'
import type { CSSProperties } from 'react'

export const resolveBaselineTheme = (): ResolvedTheme => ({
  projectId: 'global',
  values: Object.fromEntries([...semanticTokens, ...buttonRecipeTokens].map((token) => [token.id, token.defaultValue])),
  sources: Object.fromEntries([...semanticTokens, ...buttonRecipeTokens].map((token) => [token.id, 'global' as const])),
})

export const resolveProjectTheme = (project: ProjectConfig): ResolvedTheme => {
  const values: Record<string, string> = {}
  const sources: ResolvedTheme['sources'] = {}
  const platform = getPlatform(project.platform)

  ;[...semanticTokens, ...buttonRecipeTokens].forEach((token) => {
    const platformValue = platform?.tokenOverrides[token.id]
    const projectValue = project.tokenOverrides[token.id]
    values[token.id] = projectValue ?? platformValue ?? token.defaultValue
    sources[token.id] = projectValue ? 'project' : platformValue ? 'platform' : 'global'
  })

  for (const [id, value] of Object.entries(paletteValues(values))) {
    values[id] = project.tokenOverrides[id] ?? value
    sources[id] = values[id] !== semanticTokens.find(token => token.id === id)?.defaultValue ? 'project' : 'global'
  }
  return { projectId: project.id, values, sources }
}

export const resolveAssetContext = (asset: DesignAsset, project: ProjectConfig): ResolvedAssetContext => {
  const platform = getPlatform(project.platform)
  const baseTheme = resolveProjectTheme(project)
  const assetOverride = asset.projectOverrides.find((override) => override.projectId === project.id)
  const values = { ...baseTheme.values, ...assetOverride?.tokenOverrides }
  const sources = { ...baseTheme.sources }
  Object.keys(assetOverride?.tokenOverrides ?? {}).forEach((tokenId) => { sources[tokenId] = 'asset' })

  return {
    assetId: asset.id,
    projectId: project.id,
    values,
    sources,
    platformStates: platform?.stateExtensions ?? [],
    rules: [
      ...asset.rules.map((text) => ({ text, source: 'asset' as const })),
      ...(platform?.constraints ?? []).map((text) => ({ text, source: 'platform' as const })),
      ...project.specialRules.map((text) => ({ text, source: 'project' as const })),
      ...(assetOverride?.ruleOverrides ?? []).map((text) => ({ text, source: 'project' as const })),
    ],
    inheritance: [
      { layer: 'global', label: '全局语义定义', detail: `${semanticTokens.length} 个基础语义变量` },
      { layer: 'platform', label: `${platform?.name ?? project.platform} 规范`, detail: `${platform?.stateExtensions.length ?? 0} 个平台状态扩展` },
      { layer: 'project', label: project.name, detail: `${Object.keys(project.tokenOverrides).length} 项项目变量覆盖` },
      { layer: 'asset', label: asset.name, detail: `${Object.keys(assetOverride?.tokenOverrides ?? {}).length} 项资产级映射` },
    ],
  }
}

export const themeToCssVariables = (theme: ResolvedTheme) =>
  Object.fromEntries(
    Object.entries(theme.values).map(([key, value]) => [`--${key}`, value]),
  ) as CSSProperties

const releaseTokenAliases: Record<string, string> = {
  'brand-primary': 'bds-brand', 'brand-hover': 'bds-brand-hover', 'brand-active': 'bds-brand-active', 'brand-secondary': 'bds-brand-light',
  'text-primary': 'bds-text-primary', 'text-secondary': 'bds-text-secondary', 'text-tertiary': 'bds-text-disabled', 'field-placeholder': 'bds-field-placeholder', 'text-on-brand': 'bds-on-brand',
  'surface-page': 'bds-bg-page', 'surface-canvas': 'bds-bg-page', 'surface-card': 'bds-bg-surface', 'surface-primary': 'bds-bg-surface', 'surface-subtle': 'bds-bg-surface-alt', 'surface-secondary': 'bds-bg-surface-alt',
  'border-default': 'bds-border-default', 'border-strong': 'bds-border-strong', 'status-success': 'bds-success', 'status-warning': 'bds-warning', 'status-error': 'bds-danger',
  'status-success-text': 'bds-success-text', 'status-warning-text': 'bds-warning-text', 'status-error-text': 'bds-danger-text', 'status-info': 'bds-info',
  'radius-control': 'bds-btn-radius', 'radius-container': 'bds-radius-md', 'radius-table': 'bds-table-radius', 'radius-dialog': 'bds-dialog-radius',
  'shadow-base': 'bds-shadow-1', 'shadow-overlay': 'bds-shadow-2', 'shadow-dialog': 'bds-dialog-shadow',
  'control-height-sm': 'bds-ctrl-sm', 'control-height-md': 'bds-ctrl-md', 'control-height-lg': 'bds-ctrl-lg',
  'button-brand-filled-text-hover': 'bds-btn-primary-text-hover', 'button-brand-filled-text-active': 'bds-btn-primary-text-pressed',
  'button-brand-filled-bg-default': 'bds-btn-primary-bg', 'button-brand-filled-bg-hover': 'bds-btn-primary-bg-hover', 'button-brand-filled-bg-active': 'bds-btn-primary-bg-pressed', 'button-brand-filled-text-default': 'bds-btn-primary-text', 'button-brand-filled-border-default': 'bds-btn-primary-bg',
  'button-neutral-outline-bg-default': 'bds-btn-sec-bg', 'button-neutral-outline-bg-hover': 'bds-btn-sec-bg-hover', 'button-neutral-outline-bg-active': 'bds-btn-sec-bg-pressed', 'button-neutral-outline-text-default': 'bds-btn-sec-text', 'button-neutral-outline-border-default': 'bds-btn-sec-border',
  'button-neutral-soft-bg-default': 'bds-fill-subtle', 'button-neutral-soft-bg-hover': 'bds-btn-soft-bg-hover', 'button-neutral-soft-bg-active': 'bds-btn-soft-bg-pressed', 'button-neutral-soft-text-default': 'bds-text-primary',
  'button-neutral-ghost-bg-hover': 'bds-btn-ter-bg-hover', 'button-neutral-ghost-text-default': 'bds-text-secondary',
  'button-danger-filled-bg-default': 'bds-btn-danger-bg', 'button-danger-filled-bg-hover': 'bds-btn-danger-bg-hover', 'button-danger-filled-bg-active': 'bds-btn-danger-bg-pressed', 'button-danger-filled-text-default': 'bds-on-brand',
  'button-danger-outline-bg-hover': 'bds-btn-soft-danger-bg-hover', 'button-danger-outline-bg-active': 'bds-btn-soft-danger-bg-pressed', 'button-danger-outline-text-default': 'bds-btn-danger-outlined-text', 'button-danger-outline-border-default': 'bds-btn-danger-outlined-text',
  'button-control-bg-disabled': 'bds-btn-primary-bg-disabled', 'button-control-text-disabled': 'bds-text-disabled', 'button-control-border-disabled': 'bds-control-border-disabled',
}

/** 将 Frozen tokens.css 解析为组件检查器可消费的已解析 Token，不读取当前草稿。 */
export function resolveReleaseThemeFromCss(css: string, project?: ProjectConfig): ResolvedTheme {
  const cssValues: Record<string, string> = {}
  for (const match of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) cssValues[match[1]] = match[2].trim()
  if(!Object.keys(cssValues).length)throw new Error('冻结文件没有可用的 Token 声明。')
  const resolveCssValue = (name: string, seen = new Set<string>()): string => {
    const value = cssValues[name] ?? ''
    return value.replace(/var\(--([a-z0-9-]+)(?:,\s*([^)]+))?\)/gi, (_, ref: string, fallback: string) => {
      if (seen.has(ref)) return fallback?.trim() ?? `var(--${ref})`
      return cssValues[ref] ? resolveCssValue(ref, new Set([...seen, ref])) : fallback?.trim() ?? `var(--${ref})`
    })
  }
  const base = resolveBaselineTheme()
  const values = { ...base.values }
  const sources: ResolvedTheme['sources'] = Object.fromEntries(Object.keys(base.values).map(id => [id, 'compatibility']))
  for (const id of Object.keys(base.values)) {
    if (cssValues[id]) { values[id] = resolveCssValue(id); sources[id] = 'release' }
  }
  for (const [tokenId, cssName] of Object.entries(releaseTokenAliases)) {
    if (cssValues[tokenId] || !cssValues[cssName]) continue
    values[tokenId] = resolveCssValue(cssName)
    sources[tokenId] = 'release'
  }
  return { projectId: project?.id ?? 'release', values, sources }
}
