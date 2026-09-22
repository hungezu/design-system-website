import { ScopedPopover as Popover } from '../../theme/PreviewScope'
import type { ComponentProps } from 'react'
import { NumberField, SearchField, Label, Input, Group, Button, Text, FieldError, ComboBox, ListBox, ListBoxItem, Slider, SliderOutput, SliderTrack, SliderThumb, ProgressBar, Meter } from 'react-aria-components'
import { Add, Minus } from 'reicon-react'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import { DSIconAction } from '../IconAction'
import '../TextField/TextField.css'
import './Fields.css'

type Common = { label: string; description?: string; errorMessage?: string }
export type DSNumberFieldProps = Omit<ComponentProps<typeof NumberField>, 'children' | 'className'> & Common
export function DSNumberField({ label, description, errorMessage, ...props }: DSNumberFieldProps) {
  return <NumberField {...props} className="owned-number owned-field-stack"><Label className="owned-field-label">{label}</Label><Group className="owned-control-row owned-number__control"><Button slot="decrement" aria-label="减少"><Minus className="owned-number__step-icon" size={14} weight="Outline" strokeWidth={1.5} aria-hidden="true" /></Button><Input /><Button slot="increment" aria-label="增加"><Add className="owned-number__step-icon" size={14} weight="Outline" strokeWidth={1.5} aria-hidden="true" /></Button></Group>{description && <Text slot="description" className="owned-field-description">{description}</Text>}<FieldError className="owned-field-error">{errorMessage}</FieldError></NumberField>
}
export type DSSearchFieldProps = Omit<ComponentProps<typeof SearchField>, 'children' | 'className' | 'type'> & Common
export function DSSearchField({ label, description, errorMessage, ...props }: DSSearchFieldProps) {
  return <SearchField {...props} className="owned-search owned-field-stack">{({ isEmpty }) => <><Label className="owned-field-label">{label}</Label><Group className="owned-control-row"><DSIcon name="search" className="owned-control-row__leading" size="sm" decorative /><Input type="search" />{!isEmpty && !props.isReadOnly && <DSIconAction className="owned-search__clear" semantic="clear-input" iconWeight="filled" compact aria-label={`清空${label}`} />}</Group>{description && <Text slot="description" className="owned-field-description">{description}</Text>}<FieldError className="owned-field-error">{errorMessage}</FieldError></>}</SearchField>
}
export type DSComboBoxProps = Omit<ComponentProps<typeof ComboBox>, 'children' | 'className' | 'items' | 'defaultItems'> & Common & { options: { id: string; label: string; disabled?: boolean }[] }
export function DSComboBox({ label, options, description, errorMessage, ...props }: DSComboBoxProps) {
  return <ComboBox {...props} className="owned-combobox owned-field-stack" disabledKeys={options.filter(x=>x.disabled).map(x=>x.id)}><Label className="owned-field-label">{label}</Label><Group className="owned-control-row"><Input /><Button className="owned-combobox__indicator" aria-label={`展开${label}`}><DSIcon name="chevron-down" className="owned-select__chevron" size="xs" decorative /></Button></Group>{description && <Text slot="description" className="owned-field-description">{description}</Text>}<FieldError className="owned-field-error">{errorMessage}</FieldError><Popover className="owned-select__popover"><ListBox items={options} className="owned-select__listbox" renderEmptyState={()=>'暂无匹配选项'}>{item=><ListBoxItem id={item.id} textValue={item.label} className="owned-select__option">{item.label}</ListBoxItem>}</ListBox></Popover></ComboBox>
}
export type DSSliderProps = Omit<ComponentProps<typeof Slider>, 'children' | 'className'> & { label: string }
export function DSSlider({ label, ...props }: DSSliderProps) {
  return <Slider {...props} className="owned-slider"><Label>{label}</Label><SliderOutput />
    <SliderTrack>{({state})=><>{state.values.map((_,i)=><SliderThumb key={i} index={i} aria-label={state.values.length>1?`${label} ${i+1}`:label} />)}</>}</SliderTrack>
  </Slider>
}
export type DSProgressBarProps = Omit<ComponentProps<typeof ProgressBar>, 'children' | 'className'> & { label: string }
export function DSProgressBar({ label, ...props }: DSProgressBarProps) { return <ProgressBar {...props} className="owned-progress">{({percentage,valueText})=><><Label>{label}</Label><span>{valueText}</span><div className="owned-progress__track"><div style={{width: percentage === undefined ? '40%' : `${percentage}%`}} /></div></>}</ProgressBar> }
export type DSMeterProps = Omit<ComponentProps<typeof Meter>, 'children' | 'className'> & { label: string }
export function DSMeter({ label, ...props }: DSMeterProps) { return <Meter {...props} className="owned-progress">{({percentage,valueText})=><><Label>{label}</Label><span>{valueText}</span><div className="owned-progress__track"><div style={{width:`${percentage}%`}} /></div></>}</Meter> }
