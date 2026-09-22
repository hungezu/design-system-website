import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { ComponentContract } from '../../../types/design-system'

export const BUTTON_PRIORITIES = ['primary', 'secondary', 'tertiary'] as const
export const BUTTON_APPEARANCES = ['filled', 'outline', 'soft', 'ghost'] as const
export const BUTTON_TONES = ['brand', 'neutral', 'danger'] as const
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const

export type ButtonPriority = (typeof BUTTON_PRIORITIES)[number]
export type ButtonAppearance = (typeof BUTTON_APPEARANCES)[number]
export type ButtonTone = (typeof BUTTON_TONES)[number]
export type ButtonSize = (typeof BUTTON_SIZES)[number]

export interface ButtonCombination {
  priority: ButtonPriority
  appearance: ButtonAppearance
  tone: ButtonTone
}

export const BUTTON_ALLOWED_COMBINATIONS = [
  { priority: 'primary', appearance: 'filled', tone: 'brand' },
  { priority: 'secondary', appearance: 'outline', tone: 'neutral' },
  { priority: 'secondary', appearance: 'soft', tone: 'neutral' },
  { priority: 'tertiary', appearance: 'ghost', tone: 'neutral' },
  { priority: 'tertiary', appearance: 'ghost', tone: 'danger' },
  { priority: 'primary', appearance: 'filled', tone: 'danger' },
  { priority: 'secondary', appearance: 'outline', tone: 'danger' },
] as const satisfies readonly ButtonCombination[]

export const BUTTON_DEFAULT_COMBINATION = {
  priority: 'secondary',
  appearance: 'outline',
  tone: 'neutral',
} as const satisfies ButtonCombination

export const BUTTON_CONTRACT = {
  properties: {
    priority: {
      type: 'enum', reactProp: 'priority', figmaProperty: 'Priority', values: BUTTON_PRIORITIES,
      labels: { primary: '主要操作', secondary: '次要操作', tertiary: '辅助操作' },
      figmaValues: { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiary' },
    },
    appearance: {
      type: 'enum', reactProp: 'appearance', figmaProperty: 'Appearance', values: BUTTON_APPEARANCES,
      labels: { filled: '实心', outline: '线框', soft: '浅色填充', ghost: '无背景' },
      figmaValues: { filled: 'Filled', outline: 'Outline', soft: 'Soft', ghost: 'Ghost' },
    },
    tone: {
      type: 'enum', reactProp: 'tone', figmaProperty: 'Tone', values: BUTTON_TONES,
      labels: { brand: '品牌', neutral: '中性', danger: '危险' },
      figmaValues: { brand: 'Brand', neutral: 'Neutral', danger: 'Danger' },
    },
    size: {
      type: 'enum', reactProp: 'size', figmaProperty: 'Size', values: BUTTON_SIZES,
      labels: { sm: '小', md: '中', lg: '大' },
      figmaValues: { sm: 'Small', md: 'Medium', lg: 'Large' },
    },
  },
  allowedCombinations: BUTTON_ALLOWED_COMBINATIONS,
} as const satisfies ComponentContract

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  priority?: ButtonPriority
  appearance?: ButtonAppearance
  tone?: ButtonTone
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  children: ReactNode
}

export function isButtonCombinationAllowed(combination: ButtonCombination) {
  return BUTTON_ALLOWED_COMBINATIONS.some((allowed) =>
    allowed.priority === combination.priority
    && allowed.appearance === combination.appearance
    && allowed.tone === combination.tone)
}

export function resolveButtonCombination(
  combination: ButtonCombination,
  preferredProperty?: keyof ButtonCombination,
): ButtonCombination {
  if (isButtonCombinationAllowed(combination)) return combination

  const score = (candidate: ButtonCombination) => {
    const preferredScore = preferredProperty && candidate[preferredProperty] === combination[preferredProperty] ? 16 : 0
    return preferredScore
      + (candidate.priority === combination.priority ? 4 : 0)
      + (candidate.tone === combination.tone ? 2 : 0)
      + (candidate.appearance === combination.appearance ? 1 : 0)
  }

  return BUTTON_ALLOWED_COMBINATIONS.reduce<ButtonCombination>((best, candidate) =>
    score(candidate) > score(best) ? candidate : best,
  BUTTON_DEFAULT_COMBINATION)
}
