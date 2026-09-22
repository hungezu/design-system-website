import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  Button,
  ListBox,
  ListBoxItem,
  Select,
  SelectValue,
} from 'react-aria-components'
import { Check, ChevronDown } from 'lucide-react'
import { ScopedPopover } from '../design-system/theme/PreviewScope'

type OptionProps = {
  value?: string | number
  disabled?: boolean
  children?: ReactNode
}

export interface AppSelectProps {
  value?: string | number
  defaultValue?: string | number
  disabled?: boolean
  className?: string
  children: ReactNode
  'aria-label': string
  onChange?: (event: { target: { value: string } }) => void
}

export function AppSelect({
  value,
  defaultValue,
  disabled,
  className = '',
  children,
  onChange,
  'aria-label': ariaLabel,
}: AppSelectProps) {
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child, index) => {
      const element = child as ReactElement<OptionProps>
      const label = String(element.props.children ?? '')
      return {
        id: String(element.props.value ?? label ?? index),
        label,
        disabled: Boolean(element.props.disabled),
      }
    })
  const uncontrolledDefault = defaultValue == null ? options[0]?.id : String(defaultValue)

  return (
    <Select
      className={`app-select ${className}`.trim()}
      aria-label={ariaLabel}
      selectedKey={value == null ? undefined : String(value)}
      defaultSelectedKey={value == null ? uncontrolledDefault : undefined}
      isDisabled={disabled}
      onSelectionChange={(key) => onChange?.({ target: { value: String(key) } })}
    >
      <Button className="app-select__trigger">
        <SelectValue />
        <span className="app-select__indicator"><ChevronDown size={14} aria-hidden="true" /></span>
      </Button>
      <ScopedPopover className="app-select__popover" placement="bottom end" offset={4}>
        <ListBox className="app-select__listbox">
          {options.map((option) => (
            <ListBoxItem
              id={option.id}
              key={option.id}
              textValue={option.label}
              isDisabled={option.disabled}
              className="app-select__option"
            >
              {({ isSelected }) => (
                <>
                  <span>{option.label}</span>
                  {isSelected && <Check size={14} aria-hidden="true" />}
                </>
              )}
            </ListBoxItem>
          ))}
        </ListBox>
      </ScopedPopover>
    </Select>
  )
}
