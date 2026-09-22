import type { ComponentProps } from 'react'
import { Button } from 'react-aria-components'
import { DSIcon, type IconWeight } from '../../../runtime/vendor/runtime.js'
import './IconAction.css'

export type DismissIconSemantic = 'close' | 'clear-input' | 'remove-item'

export interface DSIconActionProps extends Omit<ComponentProps<typeof Button>, 'children' | 'aria-label'> {
  semantic: DismissIconSemantic
  'aria-label': string
  compact?: boolean
  danger?: boolean
  iconWeight?: IconWeight
}

/** 关闭、清空和移除动作的统一图标按钮。可见图形来自现有 Icon Registry。 */
export function DSIconAction({ semantic, compact = false, danger = false, iconWeight, className = '', ...props }: DSIconActionProps) {
  return (
    <Button
      {...props}
      className={`owned-icon-action${compact ? ' owned-icon-action--compact' : ''}${danger ? ' owned-icon-action--danger' : ''}${className ? ` ${className}` : ''}`}
    >
      <DSIcon name={semantic} weight={iconWeight} decorative size="sm" />
    </Button>
  )
}
