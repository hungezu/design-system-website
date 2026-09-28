import type { ComponentProps } from 'react'
import { ColorArea, ColorThumb, ColorField, ColorSlider, SliderTrack, SliderOutput, Label, Input, FieldError, ColorSwatch, ColorSwatchPicker, ColorSwatchPickerItem, ColorWheel, ColorWheelTrack } from 'react-aria-components'
import './Colors.css'
export function DSColorArea(props:Omit<ComponentProps<typeof ColorArea>,'children'|'className'>) { return <ColorArea {...props} className="owned-color-area"><ColorThumb /></ColorArea> }
export function DSColorField({label,...props}:Omit<ComponentProps<typeof ColorField>,'children'|'className'>&{label:string}) { return <ColorField {...props} className="owned-color-field"><Label>{label}</Label><Input className="owned-color-input"/><FieldError /></ColorField> }
export function DSColorSlider({label,...props}:Omit<ComponentProps<typeof ColorSlider>,'children'|'className'>&{label:string}) { return <ColorSlider {...props} className="owned-color-slider"><Label>{label}</Label><SliderOutput /><SliderTrack><ColorThumb /></SliderTrack></ColorSlider> }
export type DSColorWheelProps = Omit<ComponentProps<typeof ColorWheel>, 'children' | 'className' | 'outerRadius' | 'innerRadius' | 'aria-label'> & {
  label: string
  size?: number
  trackWidth?: number
}
export function DSColorWheel({label,size=200,trackWidth=28,...props}:DSColorWheelProps) {
  const outerRadius=Math.max(24,size/2)
  const safeTrackWidth=Math.min(Math.max(4,trackWidth),outerRadius-2)
  return <ColorWheel {...props} aria-label={label} outerRadius={outerRadius} innerRadius={outerRadius-safeTrackWidth} className="owned-color-wheel">
    <ColorWheelTrack className="owned-color-wheel__track" />
    <ColorThumb className="owned-color-wheel__thumb" />
  </ColorWheel>
}
export function DSColorSwatch(props:ComponentProps<typeof ColorSwatch>) { return <ColorSwatch {...props} className="owned-color-swatch" /> }
export interface DSColorSwatchPickerProps extends Omit<ComponentProps<typeof ColorSwatchPicker>,'children'|'className'> {
  colors:string[]
  isDisabled?:boolean
}
export function DSColorSwatchPicker({colors,isDisabled=false,...props}:DSColorSwatchPickerProps) { return <ColorSwatchPicker {...props} className="owned-color-picker" data-disabled={isDisabled||undefined}>{colors.map(color=><ColorSwatchPickerItem key={color} color={color} isDisabled={isDisabled}><DSColorSwatch /></ColorSwatchPickerItem>)}</ColorSwatchPicker> }
