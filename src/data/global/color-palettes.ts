import { Color } from 'tvision-color'
import type { TokenAsset } from '../../types/design-system'

export const PALETTE_ENGINE = 'tvision-color@1.6.0'
export const PALETTE_FAMILIES = [
  { id: 'brand', name: '品牌色', seed: 'brand-primary', count: 10 },
  { id: 'neutral', name: '中性色', seed: '', count: 14 },
  { id: 'brand-neutral', name: '品牌倾向灰', seed: 'brand-primary', count: 14 },
  { id: 'success', name: '成功色', seed: 'status-success', count: 10 },
  { id: 'warning', name: '警告色', seed: 'status-warning', count: 10 },
  { id: 'error', name: '错误色', seed: 'status-error', count: 10 },
  { id: 'info', name: '信息色', seed: 'status-info', count: 10 },
] as const
export interface FoundationPalette { id: string; name: string; seed: string; primaryLevel?: number; colors: Array<{ id: string; value: string; level: number }> }
const cache = new Map<string, FoundationPalette[]>()
/** Same HCT engine recorded by historical releases; semantic overrides remain unchanged. */
export function foundationPalettes(values: Record<string, string>): FoundationPalette[] {
  const key = PALETTE_FAMILIES.map(family => values[family.seed] ?? '').join('|')
  const cached = cache.get(key); if (cached) return cached
  const palettes = PALETTE_FAMILIES.map(family => {
    const seed = values[family.seed] ?? ''
    let colors: string[]; let primaryLevel: number | undefined
    if (family.id === 'neutral') colors = Color.getNeutralColorGradation('#000000')
    else {
      if (!/^#[0-9a-f]{6}$/i.test(seed)) return { id: family.id, name: family.name, seed, colors: [] }
      if (family.id === 'brand-neutral') colors = Color.getNeutralColor(seed)
      else { const result = Color.getColorGradations({ colors: [seed], step: 10, remainInput: true })[0]; colors = result.colors; primaryLevel = result.primary + 1 }
    }
    return { id: family.id, name: family.name, seed, primaryLevel, colors: colors.map((value, index) => ({ id: `color-${family.id}-${index + 1}`, value: value.toUpperCase(), level: index + 1 })) }
  })
  if (cache.size > 100) cache.clear()
  cache.set(key, palettes)
  return palettes
}
export function paletteValues(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(foundationPalettes(values).flatMap(palette => palette.colors.map(color => [color.id, color.value])))
}
export function paletteTokens(values: Record<string, string>): TokenAsset[] {
  return foundationPalettes(values).flatMap(palette => palette.colors.map(color => ({
    id: color.id, name: `${palette.name} ${color.level}`, type: 'token' as const, category: 'color' as const, group: '基础色阶', defaultValue: color.value,
    description: `${palette.name}第 ${color.level} 阶，按浅到深排列。`, semantic: `${palette.name}第 ${color.level} 阶，按浅到深排列。`,
    platforms: ['web' as const], rules: ['使用与历史记录一致的 HCT 引擎生成；改变种子可更新色阶，已确认语义色不自动重映射。', '业务控件优先使用语义变量，不直接依赖色阶编号。'],
    tokens: [], variants: [], states: [], projectOverrides: [], status: 'stable' as const, scope: 'global' as const, layer: 'global' as const,
  })))
}
export const isPaletteToken = (id: string) => /^color-(?:brand|neutral|brand-neutral|success|warning|error|info)-\d+$/.test(id)

/** Preserve old releases' captured scales; never synthesize a new palette for a frozen version. */
export function capturedPaletteValues(data: unknown): Record<string, string> {
  if (!data || typeof data !== 'object') return {}
  const record = data as Record<string, unknown>
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(record)) if (isPaletteToken(key.replace(/^--/, '')) && typeof value === 'string') result[key.replace(/^--/, '')] = value
  const base = record.basePalette as Record<string, unknown> | undefined
  if (!base) return result
  const functional = base.functional as Record<string, unknown> | undefined
  for (const family of PALETTE_FAMILIES) {
    const items = base[family.id === 'brand-neutral' ? 'brandNeutral' : family.id] ?? functional?.[family.id]
    if (!Array.isArray(items)) continue
    items.forEach((item, index) => { if (item && typeof item.value === 'string') result[`color-${family.id}-${index + 1}`] = item.value })
  }
  return result
}
