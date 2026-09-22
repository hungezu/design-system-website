import type { ThemeSpec } from '../../framework/types/generation'
import systemManifest from '../../../system.manifest.json'

/** 国科信项目品牌色的唯一源码基准。 */
export const GUOKEXIN_BRAND_TOKENS = {
  primary: systemManifest.brand.primary,
  hover: systemManifest.brand.hover,
  active: systemManifest.brand.active,
  subtle: systemManifest.brand.subtle,
} as const

export const guokexinTheme: ThemeSpec = {
  id: 'guokexin-theme',
  name: '国科信 Theme',
  mode: 'light',
  brandPrimary: GUOKEXIN_BRAND_TOKENS.primary,
  brandSecondary: GUOKEXIN_BRAND_TOKENS.subtle,
  fontFamily: '"Noto Sans SC Variable", sans-serif',
  radius: '4px',
  border: '#E5E6EB',
  shadow: '0 8px 24px rgba(29, 33, 41, 0.14)',
  density: 'compact',
  spacingScale: 'compact',
  tableDensity: 'compact',
  componentDensity: 'compact',
  buttonAppearance: 'balanced',
  pageBackground: '#F2F3F5',
  iconStyle: 'outline',
  tokenOverrides: {
    'brand-primary': GUOKEXIN_BRAND_TOKENS.primary,
    'brand-hover': GUOKEXIN_BRAND_TOKENS.hover,
    'brand-active': GUOKEXIN_BRAND_TOKENS.active,
    'brand-secondary': GUOKEXIN_BRAND_TOKENS.subtle,
    'text-primary': '#1D2129',
    'text-secondary': '#4E5969',
    'text-tertiary': '#6B7785',
    'surface-canvas': '#F2F3F5',
    'surface-primary': '#FFFFFF',
    'surface-secondary': '#F7F8FA',
    'border-default': '#E5E6EB',
    'border-strong': '#C9CDD4',
    'radius-control': '4px',
    'radius-container': '6px',
    'control-height-md': '32px',
  },
}
