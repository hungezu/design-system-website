import { ScopedPopover as Popover } from '../../theme/PreviewScope'
import { DSIconAction } from '../IconAction'
import { useState } from 'react'
import { Select, Label, Button, SelectValue, ListBox, ListBoxItem, Text, FieldError } from 'react-aria-components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import './Select.css'
export interface DSSelectOption { value: string; label: string; disabled?: boolean }
export type SelectSize = 'sm' | 'md' | 'lg'
export interface DSSelectProps {
  label: string; placeholder?: string; value?: string | null; defaultValue?: string; onChange?: (value: string) => void
  options: DSSelectOption[]; size?: SelectSize; disabled?: boolean; readOnly?: boolean; required?: boolean; invalid?: boolean
  description?: string; errorMessage?: string; name?: string; labelVisuallyHidden?: boolean; clearable?: boolean; onClear?: () => void; className?: string
}
export function DSSelect({ label, placeholder, value, defaultValue, onChange, options, size='md', disabled, readOnly, required, invalid, description, errorMessage, name, labelVisuallyHidden, clearable, onClear, className='' }: DSSelectProps) {
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null)
  const [active, setActive] = useState(false)
  const current = value === undefined ? internal : value
  const change = (next: string) => { if(readOnly) return; if(value === undefined) setInternal(next || null); onChange?.(next) }
  const showClear = clearable && !required && current && active && !disabled && !readOnly
  return <Select className={`ds-select owned-select ds-select--${size} ${className}`} selectedKey={current} onSelectionChange={key => change(String(key ?? ''))} isDisabled={disabled} isRequired={required} isInvalid={invalid} name={name} placeholder={placeholder} isOpen={readOnly ? false : undefined}>
    <Label className={`ds-select__label${labelVisuallyHidden?' owned-visually-hidden':''}`}>{label}</Label>
    <div className="owned-select__control" onMouseEnter={()=>setActive(true)} onMouseLeave={()=>setActive(false)} onFocusCapture={()=>setActive(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setActive(false)}}>
      <Button className="ds-select__trigger" aria-readonly={readOnly || undefined}><SelectValue className="ds-select__value" />{!showClear && <span className="ds-select__icon"><DSIcon name="chevron-down" className="owned-select__chevron" size="xs" decorative /></span>}</Button>
      {showClear && <DSIconAction slot={null} semantic="clear-input" compact className="owned-select__clear" aria-label={`清空${label}`} onPress={()=>{change('');onClear?.()}} />}
    </div>
    {description && <Text slot="description">{description}</Text>}<FieldError>{errorMessage}</FieldError>
    <Popover className="owned-select__popover"><ListBox aria-label={label} className="owned-select__listbox" renderEmptyState={()=>'暂无选项'}>{options.map(option=><ListBoxItem className="owned-select__option" id={option.value} key={option.value} textValue={option.label} isDisabled={option.disabled}>{option.label}</ListBoxItem>)}</ListBox></Popover>
  </Select>
}
