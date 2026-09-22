import { useRef, useState, type ReactNode } from 'react'
import { TextField, Label, Input, TextArea, Text, FieldError } from 'react-aria-components'
import { DSIconAction } from '../IconAction'
import './TextField.css'

export type InputSize = 'sm' | 'md' | 'lg'
export interface DSInputProps {
  label: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
  description?: string
  errorMessage?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  invalid?: boolean
  size?: InputSize
  prefix?: ReactNode
  suffix?: ReactNode
  clearable?: boolean
  maxLength?: number
  name?: string
  className?: string
}
export interface DSTextAreaProps extends DSInputProps { rows?: number }

function Field({ label, value, defaultValue = '', onChange, placeholder, description, errorMessage, required, disabled, readOnly, invalid, size = 'md', prefix, suffix, clearable, maxLength, name, className = '', rows }: DSTextAreaProps) {
  const [localValue, setLocalValue] = useState(defaultValue)
  const current = value === undefined ? localValue : value
  const inputRef = useRef<HTMLInputElement>(null)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const change = (next: string) => { if (value === undefined) setLocalValue(next); onChange?.(next) }
  return <TextField className={`ds-input ds-input--${size} owned-textfield ${className}`} value={current} onChange={change} name={name} isDisabled={disabled} isReadOnly={readOnly} isRequired={required} isInvalid={invalid} maxLength={maxLength}>
    <Label className="ds-input__label">{label}{required && <span className="ds-input__required" aria-hidden="true"> *</span>}</Label>
    <div className="ds-input__box">
      {prefix && <span>{prefix}</span>}
      {rows ? <TextArea ref={areaRef} rows={rows} className="ds-input__native" placeholder={placeholder} /> : <Input ref={inputRef} className="ds-input__native" placeholder={placeholder} />}
      {suffix && <span>{suffix}</span>}
      {clearable && current && !disabled && !readOnly && <DSIconAction semantic="clear-input" iconWeight="filled" compact className="owned-textfield__clear" aria-label={`清空${label}`} onPress={() => { change(''); (rows ? areaRef.current : inputRef.current)?.focus() }} />}
    </div>
    {description && <Text slot="description" className="ds-input__desc">{description}</Text>}
    <FieldError className="ds-input__error">{errorMessage}</FieldError>
  </TextField>
}
export function DSInput(props: DSInputProps) { return <Field {...props} /> }
export function DSTextArea({ rows = 4, ...props }: DSTextAreaProps) { return <Field {...props} rows={Math.max(1, rows)} /> }
