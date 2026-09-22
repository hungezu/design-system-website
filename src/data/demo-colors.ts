/** 仅用于 Color Primitive 的可编辑演示数据，不得作为产品语义 Token 使用。 */
export const DEMO_COLORS = {
  brand: '#165DFF',
  positive: '#00875A',
  critical: '#C62835',
  accent: '#5B3CC4',
} as const

export const DEMO_HUE_COLORS = {
  brand: 'hsl(216, 100%, 54%)',
  positive: 'hsl(160, 100%, 26%)',
  critical: 'hsl(355, 65%, 49%)',
} as const

export const DEMO_STATUS_SWATCHES = ['#00B42A', '#FF7D00', '#C62835'] as const
export const DEMO_BRAND_SWATCHES = [DEMO_COLORS.brand, DEMO_COLORS.positive, DEMO_COLORS.accent] as const
