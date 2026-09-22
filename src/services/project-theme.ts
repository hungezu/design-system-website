import { sizingTokens, type ThemeSizing } from './theme-sizing'
import { paletteValues } from '../data/global/color-palettes'
import { resolveBaselineTheme, resolveReleaseThemeFromCss } from './theme-resolver'
import type { ResolvedTheme } from '../types/design-system'
import type { ProjectConfig } from '../types/design-system'
import { runtimeThemeAliases } from '../design-system/theme/runtimeThemeAliases'

export interface ProjectThemeSettings {
  sizing?: ThemeSizing
  preset: 'professional' | 'compact' | 'soft'
  mode: 'light' | 'dark'
  brandPrimary: string
  brandSecondary: string
  brandHover: string
  brandActive: string
  textPrimary: string
  textSecondary: string
  surfaceCanvas: string
  surfacePrimary: string
  borderDefault: string
  statusSuccess: string
  statusWarning: string
  statusError: string
  /** Optional project-level override for the primary Button recipe. */
  buttonPrimaryBackground?: string
  /** Shared text/icon color for every primary Button interaction state. */
  buttonPrimaryText?: string
  fontFamily: string
  bodySize: number
  titleSize: number
  radius: number
  tableRadius?: number
  shadow: string
  spacing: number
  controlHeight: number
  density: 'compact' | 'comfortable' | 'spacious'
}

export const projectThemeStorageKey = (projectId: string) => `design-intelligence-project-theme-v1:${projectId}`

export const PROJECT_THEME_MODE_VALUES = {
  light: {
    surfaceCanvas: '#F2F3F5', surfacePrimary: '#FFFFFF', surfaceSecondary: '#F7F8FA',
    textPrimary: '#1D2129', textSecondary: '#4E5969', borderDefault: '#E5E6EB',
  },
  dark: {
    surfaceCanvas: '#111417', surfacePrimary: '#1F2428', surfaceSecondary: '#2B3137',
    textPrimary: '#F5F7FA', textSecondary: '#C4CAD1', borderDefault: '#3A424A',
  },
} as const

export const PROJECT_THEME_SHADOWS = {
  none: 'none',
  subtle: '0 1px 3px rgba(29, 33, 41, 0.08)',
  overlay: '0 8px 24px rgba(29, 33, 41, 0.14)',
} as const

export const baselineThemeSettings: ProjectThemeSettings = {
  preset: 'professional', mode: 'light', brandPrimary: '#315C52', brandSecondary: '#E7EFEC', brandHover: '#447167', brandActive: '#244B43',
  textPrimary: '#1D2129', textSecondary: '#4E5969', surfaceCanvas: '#F2F3F5', surfacePrimary: '#FFFFFF',
  borderDefault: '#E5E6EB', statusSuccess: '#00B42A', statusWarning: '#FF7D00', statusError: '#F53F3F',
  fontFamily: '"Noto Sans SC Variable", sans-serif', bodySize: 14, titleSize: 20, radius: 4, tableRadius: 6,
  shadow: PROJECT_THEME_SHADOWS.subtle, spacing: 16, controlHeight: 32, density: 'comfortable',
}

function normalizeHex(value: string) {
  const match = value.trim().match(/^#([0-9a-f]{6})$/i)
  return match ? `#${match[1].toUpperCase()}` : null
}

function mixHex(first: string, second: string, firstWeight: number) {
  const a = normalizeHex(first)
  const b = normalizeHex(second)
  if (!a || !b) return first
  const weight = Math.max(0, Math.min(1, firstWeight))
  const channels = [1, 3, 5].map((index) => {
    const mixed = Math.round(Number.parseInt(a.slice(index, index + 2), 16) * weight + Number.parseInt(b.slice(index, index + 2), 16) * (1 - weight))
    return mixed.toString(16).padStart(2, '0')
  })
  return `#${channels.join('').toUpperCase()}`
}

/** 从单一品牌主色生成稳定的弱调、Hover 和 Pressed 色阶。 */
export function deriveBrandPalette(brandPrimary: string): Pick<ProjectThemeSettings, 'brandSecondary' | 'brandHover' | 'brandActive'> | null {
  const primary = normalizeHex(brandPrimary)
  if (!primary) return null
  return {
    brandSecondary: mixHex(primary, '#FFFFFF', 0.1),
    brandHover: mixHex(primary, '#FFFFFF', 0.82),
    brandActive: mixHex(primary, '#000000', 0.82),
  }
}

export function defaultProjectTheme(project: ProjectConfig): ProjectThemeSettings {
  return {
    preset: project.density === 'compact' ? 'compact' : 'professional',
    mode: project.themeMode === 'dark' ? 'dark' : 'light',
    brandPrimary: project.tokenOverrides['brand-primary'] ?? project.brandPrimary,
    brandSecondary: project.tokenOverrides['brand-secondary'] ?? project.brandSecondary,
    brandHover: project.tokenOverrides['brand-hover'] ?? project.brandPrimary,
    brandActive: project.tokenOverrides['brand-active'] ?? project.brandPrimary,
    textPrimary: project.tokenOverrides['text-primary'] ?? baselineThemeSettings.textPrimary,
    textSecondary: project.tokenOverrides['text-secondary'] ?? baselineThemeSettings.textSecondary,
    surfaceCanvas: project.tokenOverrides['surface-canvas'] ?? project.tokenOverrides['surface-page'] ?? baselineThemeSettings.surfaceCanvas,
    surfacePrimary: project.tokenOverrides['surface-primary'] ?? project.tokenOverrides['surface-card'] ?? baselineThemeSettings.surfacePrimary,
    borderDefault: project.tokenOverrides['border-default'] ?? baselineThemeSettings.borderDefault,
    statusSuccess: project.tokenOverrides['status-success'] ?? baselineThemeSettings.statusSuccess,
    statusWarning: project.tokenOverrides['status-warning'] ?? baselineThemeSettings.statusWarning,
    statusError: project.tokenOverrides['status-error'] ?? baselineThemeSettings.statusError,
    fontFamily: project.fontFamily,
    bodySize: 14,
    titleSize: 20,
    radius: Number.parseFloat(project.tokenOverrides['radius-control'] ?? '4') || 4,
    tableRadius: Number.parseFloat(project.tokenOverrides['radius-table'] ?? '6'),
    shadow: project.tokenOverrides['shadow-base'] ?? PROJECT_THEME_SHADOWS.subtle,
    spacing: Number.parseFloat(project.tokenOverrides['spacing-16'] ?? '16') || 16,
    controlHeight: Number.parseFloat(project.tokenOverrides['control-height-md'] ?? '32') || 32,
    density: project.density,
  }
}

export function loadProjectTheme(project: ProjectConfig, storage: Pick<Storage, 'getItem'> = localStorage): ProjectThemeSettings {
  try {
    const saved = JSON.parse(storage.getItem(projectThemeStorageKey(project.id)) ?? 'null') as Partial<ProjectThemeSettings> | null
    if (!saved && project.id === 'guokexin') {
      const legacy = JSON.parse(storage.getItem('design-intelligence-workbench-draft-v1') ?? storage.getItem('design-intelligence-workbench-draft-v1:global') ?? 'null') as { theme?: { brandPrimary?: string; brandSecondary?: string; fontFamily?: string; radius?: string; shadow?: string; density?: ProjectThemeSettings['density']; spacingScale?: ProjectThemeSettings['density']; componentDensity?: ProjectThemeSettings['density']; pageBackground?: string; border?: string } } | null
      if (legacy?.theme) return { ...defaultProjectTheme(project), brandPrimary: legacy.theme.brandPrimary ?? project.brandPrimary, surfaceCanvas: legacy.theme.pageBackground ?? defaultProjectTheme(project).surfaceCanvas, borderDefault: legacy.theme.border ?? defaultProjectTheme(project).borderDefault, fontFamily: legacy.theme.fontFamily ?? project.fontFamily, radius: Number.parseFloat(legacy.theme.radius ?? '') || defaultProjectTheme(project).radius, shadow: legacy.theme.shadow ?? defaultProjectTheme(project).shadow, density: legacy.theme.componentDensity ?? legacy.theme.density ?? defaultProjectTheme(project).density }
    }
    return { ...defaultProjectTheme(project), ...saved }
  } catch { return defaultProjectTheme(project) }
}

export function saveProjectTheme(projectId: string, value: ProjectThemeSettings, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(projectThemeStorageKey(projectId), JSON.stringify(value))
}

export function projectThemeOverrides(settings: ProjectThemeSettings): Record<string, string> {
  return {
    'brand-primary': settings.brandPrimary,
    'brand-secondary': settings.brandSecondary,
    'brand-hover': settings.brandHover,
    'brand-active': settings.brandActive,
    'text-primary': settings.textPrimary,
    'text-secondary': settings.textSecondary,
    'surface-canvas': settings.surfaceCanvas,
    'surface-page': settings.surfaceCanvas,
    'surface-primary': settings.surfacePrimary,
    'surface-card': settings.surfacePrimary,
    'border-default': settings.borderDefault,
    'status-success': settings.statusSuccess,
    'status-warning': settings.statusWarning,
    'status-error': settings.statusError,
    'font-body': `${settings.bodySize}px / ${settings.bodySize + 8}px / 400`,
    'font-page-title': `${settings.titleSize}px / ${settings.titleSize + 8}px / 600`,
    'radius-control': `${settings.radius}px`,
    'radius-table': `${settings.tableRadius ?? 6}px`,
    'shadow-base': settings.shadow,
    'spacing-16': `${settings.spacing}px`,
    'control-height-md': `${settings.controlHeight}px`,
    ...sizingTokens(settings),
  }
}

/** WCAG contrast for the supported six-digit theme colors. */
export function contrastRatio(foreground: string, background: string): number {
  const luminance = (value: string) => {
    const hex = normalizeHex(value)
    if (!hex) return NaN
    const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
    return c[0] * .2126 + c[1] * .7152 + c[2] * .0722
  }
  const a = luminance(foreground), b = luminance(background)
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
}
export const brandWhiteContrastRatio = (background: string) => contrastRatio('#FFFFFF', background)

export function readableForeground(background: string): string {
  return contrastRatio('#FFFFFF', background) >= contrastRatio('#000000', background) ? '#FFFFFF' : '#000000'
}

/** Preserve the brand itself; only deepen the filled-button surface when white needs it. */
function whiteButtonBackground(background: string): string {
  if (contrastRatio('#FFFFFF', background) >= 4.5) return background
  let readable = 0, original = 1
  for (let step = 0; step < 16; step += 1) {
    const weight = (readable + original) / 2
    if (contrastRatio('#FFFFFF', mixHex(background, '#000000', weight)) >= 4.5) readable = weight
    else original = weight
  }
  return mixHex(background, '#000000', readable)
}

/** One semantic/recipe result feeds both CSS and the token inspector. */
export function resolvePreviewTheme(settings: ProjectThemeSettings, base: ResolvedTheme = resolveBaselineTheme()): ResolvedTheme {
  const values = { ...base.values, ...projectThemeOverrides(settings) }
  const placeholder = base.values['field-placeholder']
  values['field-placeholder'] = contrastRatio(placeholder, settings.surfacePrimary) >= 4.5 ? placeholder
    : contrastRatio(settings.textSecondary, settings.surfacePrimary) >= 4.5 ? settings.textSecondary : readableForeground(settings.surfacePrimary)
  values['surface-secondary'] = settings.mode === 'dark' ? PROJECT_THEME_MODE_VALUES.dark.surfaceSecondary : PROJECT_THEME_MODE_VALUES.light.surfaceSecondary
  values['surface-subtle'] = values['surface-secondary']
  for (const [token, source] of [['ai-code-keyword','status-info'],['ai-code-string','status-success-text'],['ai-code-literal','status-warning-text']]) {
    const color = values[source], background = values['surface-secondary']
    const readable = readableForeground(background)
    let result = color
    for (let weight = 100; weight >= 0 && contrastRatio(result, background) < 4.5; weight -= 1) result = mixHex(color, readable, weight / 100)
    values[token] = result
  }
  values['text-tertiary'] = values['field-placeholder']
  values['text-on-brand'] = readableForeground(settings.brandPrimary)
  values['font-button'] = `500 ${settings.bodySize}px/${settings.bodySize + 8}px ${settings.fontFamily}`
  const buttonBackground = whiteButtonBackground(settings.brandPrimary)
  const hoverBackground = whiteButtonBackground(settings.brandActive)
  values['button-brand-filled-bg-default'] = buttonBackground
  values['button-brand-filled-border-default'] = buttonBackground
  values['button-brand-filled-bg-hover'] = hoverBackground === buttonBackground ? mixHex(hoverBackground, '#000000', .9) : hoverBackground
  values['button-brand-filled-bg-active'] = mixHex(values['button-brand-filled-bg-hover'], '#000000', .84)
  for (const state of ['default', 'hover', 'active']) values[`button-brand-filled-text-${state}`] = '#FFFFFF'
  // Danger has its own contrasting foreground; changing the brand must not recolor it.
  values['button-danger-filled-text-default'] = readableForeground(values['status-error-strong'])
  Object.assign(values, paletteValues(values))
  const buttonPrimaryBackground = settings.buttonPrimaryBackground && normalizeHex(settings.buttonPrimaryBackground)
  if (buttonPrimaryBackground) {
    values['button-brand-filled-bg-default'] = buttonPrimaryBackground
    values['button-brand-filled-border-default'] = buttonPrimaryBackground
    values['button-brand-filled-bg-hover'] = mixHex(buttonPrimaryBackground, '#000000', .9)
    values['button-brand-filled-bg-active'] = mixHex(values['button-brand-filled-bg-hover'], '#000000', .84)
  }
  const buttonPrimaryText = settings.buttonPrimaryText && normalizeHex(settings.buttonPrimaryText)
  if (buttonPrimaryText) for (const state of ['default', 'hover', 'active']) values[`button-brand-filled-text-${state}`] = buttonPrimaryText
  const sources = { ...base.sources }
  for (const id of Object.keys(values)) if (values[id] !== base.values[id]) sources[id] = base.projectId === 'global' ? 'global' : 'project'
  return { ...base, values, sources }
}

export function previewVariablesFromTheme(theme: ResolvedTheme, settings: ProjectThemeSettings = baselineThemeSettings): Record<string, string> {
  const vars: Record<string, string> = {
    '--button-padding-inline': theme.values['spacing-16'] ?? '16px',
    '--button-padding-inline-sm': theme.values['spacing-12'] ?? '12px',
    '--input-padding-inline': theme.values['spacing-8'] ?? '8px',
    '--select-padding-start': '10px', '--select-padding-end': '9px',
    '--select-option-padding-block': '8px', '--select-option-padding-inline': '12px',
    '--popup-padding': theme.values['spacing-24'] ?? '24px',
    '--popup-padding-narrow': theme.values['spacing-16'] ?? '16px',
    '--component-gap': 'initial',
    ...Object.fromEntries(Object.entries(theme.values).map(([id, value]) => [`--${id}`, value])),
    ...runtimeThemeAliases,
    '--preview-gap': theme.values['component-gap'] && theme.values['component-gap'] !== 'initial' ? theme.values['component-gap'] : theme.values['spacing-16'],
    '--preview-row-height': settings.density === 'compact' ? '38px' : settings.density === 'spacious' ? '54px' : '46px',
    '--preview-control-height': theme.values['control-height-md'],
    '--preview-body-size': `${settings.bodySize}px`,
    '--preview-title-size': `${settings.titleSize}px`,
    '--preview-font-family': settings.fontFamily,
    '--bds-font': settings.fontFamily,
    '--bds-typo-form-label-size': `${settings.bodySize}px`,
    '--bds-typo-form-value-size': `${settings.bodySize}px`,
    '--bds-table-row-h-comfortable': settings.density === 'compact' ? '38px' : settings.density === 'spacious' ? '54px' : '46px',
    '--bds-pg-item-size': theme.values['control-height-md'],
    '--bds-radius-sm': theme.values['radius-control'],
    '--bds-radius-md': theme.values['radius-container'],
    '--bds-radius-lg': theme.values['radius-dialog'],
  }
  const resolve = (value: string, seen = new Set<string>()): string => value.replace(/var\((--[a-z0-9-]+)\)/gi, (expression, id: string) => {
    if (seen.has(id) || !vars[id]) return expression
    return resolve(vars[id], new Set([...seen, id]))
  })
  return { ...Object.fromEntries(Object.entries(vars).map(([id, value]) => [id, resolve(value)])), '--bds-field-placeholder': 'var(--field-placeholder)' }

}
export function projectPreviewVariables(settings: ProjectThemeSettings, base?: ResolvedTheme): Record<string, string> {
  return previewVariablesFromTheme(resolvePreviewTheme(settings, base), settings)
}

/** Frozen values are independent of any project draft, including compatibility defaults. */
export function releasePreviewVariables(css: string): Record<string, string> {
  const theme = resolveReleaseThemeFromCss(css)
  const raw = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)].map(m => [`--${m[1]}`, m[2].trim()]))
  return { ...previewVariablesFromTheme(theme), ...raw }
}
