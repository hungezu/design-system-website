import type { ReactNode } from 'react'
import appTokenSource from '../../styles/app-tokens.css?raw'
import { baselineThemeSettings, previewVariablesFromTheme, resolvePreviewTheme } from '../../services/project-theme'
import { PreviewScope } from './PreviewScope'

// app-tokens.css remains the single authority for the platform palette.
const tokens = Object.fromEntries([...appTokenSource.matchAll(/--(app-[a-z-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]))
const appSettings = {
  ...baselineThemeSettings,
  brandPrimary: tokens['app-accent'], brandHover: tokens['app-accent-hover'], brandActive: tokens['app-accent-active'], brandSecondary: tokens['app-accent-subtle'],
  textPrimary: tokens['app-text-primary'], textSecondary: tokens['app-text-secondary'],
  surfaceCanvas: tokens['app-surface-canvas'], surfacePrimary: tokens['app-surface-primary'], borderDefault: tokens['app-border-default'],
}
const appTheme = resolvePreviewTheme(appSettings)
Object.assign(appTheme.values, {
  'surface-secondary': tokens['app-surface-secondary'], 'surface-subtle': tokens['app-surface-secondary'],
  'border-strong': tokens['app-border-strong'], 'text-tertiary': tokens['app-text-tertiary'], 'field-placeholder': tokens['app-text-tertiary'],
  'status-info': tokens['app-accent'],
})
export const appThemeVariables = {
  ...Object.fromEntries(Object.entries(tokens).map(([key, value]) => [`--${key}`, value])),
  ...previewVariablesFromTheme(appTheme, appSettings),
}
/** Both inline controls and portalled overlays receive the complete platform recipe. */
export function AppThemeScope({ children }: { children: ReactNode }) {
  return <PreviewScope vars={appThemeVariables} inspectionId="platform-ui">{children}</PreviewScope>
}
