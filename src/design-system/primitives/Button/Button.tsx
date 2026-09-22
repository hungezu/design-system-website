import { forwardRef } from 'react'
import { Button as AriaButton } from 'react-aria-components'
import {
  BUTTON_DEFAULT_COMBINATION,
  isButtonCombinationAllowed,
  resolveButtonCombination,
  type ButtonProps,
} from './Button.types'
import './Button.css'


const warnedCombinations = new Set<string>()

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    priority = BUTTON_DEFAULT_COMBINATION.priority,
    appearance = BUTTON_DEFAULT_COMBINATION.appearance,
    tone = BUTTON_DEFAULT_COMBINATION.tone,
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'start',
    children,
    className,
    type = 'button',
    value: buttonValue,
    onClick,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading
  const requestedCombination = { priority, appearance, tone }
  const resolvedCombination = resolveButtonCombination(requestedCombination)
  const warningKey = `${priority}/${appearance}/${tone}`
  const iconOnly = icon != null && (children === null || children === undefined || children === '')

  if (import.meta.env.DEV && !isButtonCombinationAllowed(requestedCombination) && !warnedCombinations.has(warningKey)) {
    warnedCombinations.add(warningKey)
    console.warn(
      `[Button] Unsupported combination: priority="${priority}" appearance="${appearance}" tone="${tone}". `
      + `Falling back to priority="${resolvedCombination.priority}" appearance="${resolvedCombination.appearance}" tone="${resolvedCombination.tone}".`,
    )
  }

  const classes = ['gkx-button', `gkx-button--${size}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <AriaButton
      {...props}
      ref={(node) => {
        if (node) {
          if (loading) node.setAttribute('aria-busy', 'true')
          else node.removeAttribute('aria-busy')
        }
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      onClick={event => { if (event.currentTarget instanceof HTMLButtonElement) onClick?.(event as import('react').MouseEvent<HTMLButtonElement>) }}
      onFocus={event => { if (event.currentTarget instanceof HTMLButtonElement) onFocus?.(event as import('react').FocusEvent<HTMLButtonElement>) }}
      onBlur={event => { if (event.currentTarget instanceof HTMLButtonElement) onBlur?.(event as import('react').FocusEvent<HTMLButtonElement>) }}
      onKeyDown={event => { if (event.currentTarget instanceof HTMLButtonElement) onKeyDown?.(event as import('react').KeyboardEvent<HTMLButtonElement>) }}
      onKeyUp={event => { if (event.currentTarget instanceof HTMLButtonElement) onKeyUp?.(event as import('react').KeyboardEvent<HTMLButtonElement>) }}
      type={type}
      value={buttonValue == null ? undefined : String(buttonValue)}
      className={classes}
      isDisabled={isDisabled}
      aria-busy={loading || undefined}
      data-priority={resolvedCombination.priority}
      data-appearance={resolvedCombination.appearance}
      data-tone={resolvedCombination.tone}
      data-loading={loading || undefined}
      data-size={size}
      data-icon-position={iconPosition}
      data-icon-only={iconOnly || undefined}
    >
      {icon ? <span className="gkx-button__icon" aria-hidden="true">{icon}</span> : null}
      {iconOnly ? null : <span className="gkx-button__label">{children}</span>}
      {loading && <span className="gkx-button__spinner" aria-hidden="true" />}
    </AriaButton>
  )
})
