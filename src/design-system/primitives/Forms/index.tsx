import { useId, type ReactNode, type FormEvent } from 'react'
import { Checkbox, CheckboxGroup, Switch, RadioGroup, Radio, Label, Text, FieldError, Form } from 'react-aria-components'
import { Check, Minus } from 'lucide-react'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import './Forms.css'

export interface DSCheckboxProps {
  label: string; labelVisuallyHidden?: boolean; checked?: boolean; defaultChecked?: boolean; onChange?: (checked: boolean) => void
  disabled?: boolean; loading?: boolean; invalid?: boolean; errorMessage?: string
  indeterminate?: boolean; name?: string; value?: string; required?: boolean
}
export function DSCheckbox({ label, labelVisuallyHidden, checked, defaultChecked, onChange, disabled, loading, invalid, errorMessage, indeterminate, name, value, required }: DSCheckboxProps) {
  const errorId = useId()
  return <div className="owned-choice-field" aria-busy={loading || undefined}><Checkbox className="owned-choice" isSelected={checked} defaultSelected={defaultChecked} onChange={onChange} isDisabled={disabled || loading} isIndeterminate={indeterminate} isInvalid={invalid} isRequired={required} name={name} value={value} aria-busy={loading || undefined} aria-describedby={invalid && errorMessage ? errorId : undefined}>
    <span className="owned-choice__box" aria-hidden="true">{indeterminate ? <Minus size={12} strokeWidth={2.2} /> : <Check size={12} strokeWidth={2.2} />}</span><span className={labelVisuallyHidden?'ds-visually-hidden':undefined}>{label}</span>
  </Checkbox>{invalid && errorMessage && <p className="owned-form-error" id={errorId}>{errorMessage}</p>}</div>
}
export type DSSwitchProps = Omit<DSCheckboxProps, 'indeterminate' | 'required' | 'invalid' | 'errorMessage' | 'value' | 'labelVisuallyHidden'>
export function DSSwitch({ label, checked, defaultChecked, onChange, disabled, loading, name }: DSSwitchProps) {
  return <Switch className="owned-choice owned-switch" isSelected={checked} defaultSelected={defaultChecked} onChange={onChange} isDisabled={disabled || loading} name={name} aria-busy={loading || undefined}><span className="owned-choice__label">{label}</span><span className="owned-switch__track" aria-hidden="true"><span /></span></Switch>
}
export interface DSRadioProps {
  label: string; options: { value: string; label: string; disabled?: boolean }[]
  value?: string; defaultValue?: string; onChange?: (value: string) => void
  disabled?: boolean; loading?: boolean; required?: boolean; invalid?: boolean
  errorMessage?: string; description?: string; name?: string
}
export function DSRadio({ label, options, value, defaultValue, onChange, disabled, loading, required, invalid, errorMessage, description, name }: DSRadioProps) {
  return <RadioGroup className="owned-radio-group" value={value} defaultValue={defaultValue} onChange={onChange} isDisabled={disabled || loading} isRequired={required} isInvalid={invalid} name={name} aria-busy={loading || undefined}>
    <Label>{label}</Label>{options.map(option => <Radio key={option.value} className="owned-choice owned-radio" value={option.value} isDisabled={option.disabled}><span className="owned-choice__box" aria-hidden="true" />{option.label}</Radio>)}
    {description && <Text slot="description">{description}</Text>}<FieldError className="owned-form-error">{errorMessage}</FieldError>
  </RadioGroup>
}
export interface DSFormProps { children: ReactNode; onSubmit?: (event: FormEvent<HTMLFormElement>) => void; disabled?: boolean; loading?: boolean; error?: string; success?: string; label?: string }
export function DSForm({ children, onSubmit, disabled, loading, error, success, label }: DSFormProps) {
  const feedback = error ? { tone: 'error' as const, message: error } : success ? { tone: 'success' as const, message: success } : null
  return <Form className="owned-form" aria-label={label} aria-busy={loading || undefined} onSubmit={event => { event.preventDefault(); if (!disabled && !loading) onSubmit?.(event) }}>
    <fieldset disabled={disabled || loading}>{children}</fieldset>
    {feedback && <div role={feedback.tone === 'error' ? 'alert' : 'status'} aria-live={feedback.tone === 'success' ? 'polite' : undefined} className="owned-form-feedback" data-tone={feedback.tone}>
      <DSIcon name={feedback.tone} size="sm" decorative />
      <span>{feedback.message}</span>
    </div>}
  </Form>
}

export interface DSCheckboxGroupProps extends Omit<DSRadioProps, 'value' | 'defaultValue' | 'onChange'> {
  value?: string[]; defaultValue?: string[]; onChange?: (value: string[]) => void
}
export function DSCheckboxGroup({ label, options, value, defaultValue, onChange, disabled, loading, required, invalid, errorMessage, description, name }: DSCheckboxGroupProps) {
  return <CheckboxGroup className="owned-radio-group" value={value} defaultValue={defaultValue} onChange={onChange} isDisabled={disabled || loading} isRequired={required} isInvalid={invalid} name={name}>
    <Label>{label}</Label>
    {options.map(option => <Checkbox key={option.value} className="owned-choice" value={option.value} isDisabled={option.disabled}><span className="owned-choice__box" aria-hidden="true"><Check size={12} strokeWidth={2.2} /></span>{option.label}</Checkbox>)}
    {description && <Text slot="description">{description}</Text>}<FieldError className="owned-form-error">{errorMessage}</FieldError>
  </CheckboxGroup>
}
export interface DSFieldControlProps { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; 'aria-required'?: boolean }
export interface DSFieldProps { label: string; children: (props: DSFieldControlProps) => ReactNode; description?: string; error?: string; required?: boolean }
/** Layout/association helper for native controls. RAC TextField already owns these associations. */
export function DSField({ label, children, description, error, required }: DSFieldProps) {
  const id = useId()
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  return <div className="owned-field" data-invalid={error ? true : undefined}><label htmlFor={id}>{label}{required && <span className="owned-field__required" aria-hidden="true">*</span>}</label>
    {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined, 'aria-required': required || undefined })}
    {description && <p id={`${id}-description`}>{description}</p>}{error && <p id={`${id}-error`} className="owned-form-error">{error}</p>}
  </div>
}
