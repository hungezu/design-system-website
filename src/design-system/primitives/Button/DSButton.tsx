import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button } from './Button'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
export type LegacyButtonVariant = 'secondary-outline' | 'secondary-soft'
export type ButtonSemantic = 'default' | 'danger'
export type ControlSize = 'sm' | 'md' | 'lg'

export interface DSButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  variant?: ButtonVariant | LegacyButtonVariant
  semantic?: ButtonSemantic
  size?: ControlSize
  icon?: ReactNode
  iconPosition?: 'start' | 'end'
  disabled?: boolean
  loading?: boolean
}

/** 稳定 Runtime API 适配层；视觉与交互统一由 React Aria Button Primitive 承担。 */
export function DSButton({
  variant = 'secondary', semantic = 'default', size = 'md', icon, iconPosition = 'start',
  className = '', disabled = false, loading = false, children, 'aria-busy': ariaBusy, ...props
}: DSButtonProps) {
  const resolvedVariant = variant === 'secondary-outline' || variant === 'secondary-soft' ? 'secondary' : variant
  const appearance = variant === 'secondary-soft' ? 'soft' : resolvedVariant === 'primary' ? 'filled' : resolvedVariant === 'tertiary' ? 'ghost' : 'outline'
  const priority = resolvedVariant
  const tone = semantic === 'danger' ? 'danger' : resolvedVariant === 'primary' ? 'brand' : 'neutral'
  const effectiveLoading = loading || ariaBusy === true || ariaBusy === 'true'
  const iconOnly = icon != null && (children === null || children === undefined || children === '')
  const classes = ['ds-btn', `ds-btn--${resolvedVariant}`, `ds-btn--sem-${semantic}`, `ds-btn--${size}`,
    variant === 'secondary-soft' ? 'is-soft' : '', variant === 'secondary-outline' ? 'is-outlined' : '',
    iconOnly ? 'ds-btn--icon-only' : '', className].filter(Boolean).join(' ')

  return <Button {...props} priority={priority} appearance={appearance} tone={tone} size={size}
    disabled={disabled} loading={effectiveLoading} icon={icon} iconPosition={iconPosition} className={classes}>
    {children}
  </Button>
}
