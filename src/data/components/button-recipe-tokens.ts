import type { TokenAsset } from '../../types/design-system'

const recipeToken = (id: string, name: string, defaultValue: string, semantic: string): TokenAsset => ({
  id,
  name,
  type: 'token',
  category: 'color',
  group: 'Button',
  defaultValue,
  description: semantic,
  semantic,
  platforms: ['web'],
  rules: ['该变量属于 Button Recipe，不作为独立设计基础展示。'],
  tokens: [],
  variants: [],
  states: [],
  projectOverrides: [],
  status: 'stable',
  scope: 'component',
  ownerComponentId: 'button',
  layer: 'component',
})

const visualSet = (
  prefix: string,
  name: string,
  values: { background: string; hover: string; active: string; text: string; border: string },
) => [
  recipeToken(`${prefix}-bg-default`, `${name}默认背景`, values.background, `${name}默认背景。`),
  recipeToken(`${prefix}-bg-hover`, `${name}悬停背景`, values.hover, `${name} Hover 背景。`),
  recipeToken(`${prefix}-bg-active`, `${name}按下背景`, values.active, `${name} Active 背景。`),
  recipeToken(`${prefix}-text-default`, `${name}默认文字`, values.text, `${name}默认文字。`),
  recipeToken(`${prefix}-border-default`, `${name}默认边框`, values.border, `${name}默认、Hover 与 Active 边框。`),
]

export const buttonRecipeTokens: TokenAsset[] = [
  {...recipeToken('button-padding-inline', '常规按钮左右内边距', 'var(--spacing-16)', '中号、大号文字按钮的左右内边距。'), category:'space'},
  {...recipeToken('button-padding-inline-sm', '小按钮左右内边距', 'var(--spacing-12)', '小号文字按钮的左右内边距。'), category:'space'},
  recipeToken('button-brand-filled-text-hover', '品牌实心按钮悬停文字', 'var(--text-on-brand)', '按品牌 Hover 背景解析可读文字色。'),
  recipeToken('button-brand-filled-text-active', '品牌实心按钮按下文字', 'var(--text-on-brand)', '按品牌 Active 背景解析可读文字色。'),
  ...visualSet('button-brand-filled', '品牌实心按钮', {
    background: 'var(--brand-primary)', hover: 'var(--brand-active)', active: 'color-mix(in srgb, var(--brand-active) 84%, black)', text: 'var(--text-on-brand)', border: 'var(--brand-primary)',
  }),
  ...visualSet('button-neutral-outline', '中性线框按钮', {
    background: 'transparent', hover: 'var(--surface-secondary)', active: 'color-mix(in srgb, var(--surface-secondary) 70%, var(--border-default))', text: 'var(--text-primary)', border: 'var(--border-default)',
  }),
  ...visualSet('button-neutral-soft', '中性浅色按钮', {
    background: 'var(--surface-secondary)', hover: 'color-mix(in srgb, var(--surface-secondary) 75%, var(--border-default))', active: 'color-mix(in srgb, var(--surface-secondary) 55%, var(--border-default))', text: 'var(--text-primary)', border: 'transparent',
  }),
  ...visualSet('button-neutral-ghost', '中性无背景按钮', {
    background: 'transparent', hover: 'var(--surface-secondary)', active: 'var(--brand-secondary)', text: 'var(--text-secondary)', border: 'transparent',
  }),
  ...visualSet('button-danger-filled', '危险实心按钮', {
    background: 'var(--status-error-strong)', hover: 'color-mix(in srgb, var(--status-error-strong) 88%, black)', active: 'color-mix(in srgb, var(--status-error-strong) 76%, black)', text: 'var(--text-on-brand)', border: 'var(--status-error-strong)',
  }),
  ...visualSet('button-danger-ghost', '危险文字按钮', {
    background: 'transparent', hover: 'transparent', active: 'transparent', text: 'var(--status-error-text)', border: 'transparent',
  }),
  ...visualSet('button-danger-outline', '危险线框按钮', {
    background: 'transparent', hover: 'color-mix(in srgb, var(--status-error) 10%, transparent)', active: 'color-mix(in srgb, var(--status-error) 18%, transparent)', text: 'var(--status-error-strong)', border: 'var(--status-error-strong)',
  }),
  recipeToken('button-control-bg-disabled', '按钮禁用背景', 'var(--surface-secondary)', '所有按钮组合的 Disabled 背景。'),
  recipeToken('button-control-text-disabled', '按钮禁用文字', 'var(--text-tertiary)', '所有按钮组合的 Disabled 文字。'),
  recipeToken('button-control-border-disabled', '按钮禁用边框', 'var(--border-default)', '所有按钮组合的 Disabled 边框。'),
]
