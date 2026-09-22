import type { ComponentProps } from 'react'
import { ColorArea, ColorThumb, ColorField, ColorSlider, SliderTrack, SliderOutput, Label, Input, FieldError, ColorSwatch, ColorSwatchPicker, ColorSwatchPickerItem } from 'react-aria-components'
import './Colors.css'
export function DSColorArea(props:Omit<ComponentProps<typeof ColorArea>,'children'|'className'>) { return <ColorArea {...props} className="owned-color-area"><ColorThumb /></ColorArea> }
export function DSColorField({label,...props}:Omit<ComponentProps<typeof ColorField>,'children'|'className'>&{label:string}) { return <ColorField {...props} className="owned-color-field"><Label>{label}</Label><Input className="owned-color-input"/><FieldError /></ColorField> }
export function DSColorSlider({label,...props}:Omit<ComponentProps<typeof ColorSlider>,'children'|'className'>&{label:string}) { return <ColorSlider {...props} className="owned-color-slider"><Label>{label}</Label><SliderOutput /><SliderTrack><ColorThumb /></SliderTrack></ColorSlider> }
export function DSColorSwatch(props:ComponentProps<typeof ColorSwatch>) { return <ColorSwatch {...props} className="owned-color-swatch" /> }
export interface DSColorSwatchPickerProps extends Omit<ComponentProps<typeof ColorSwatchPicker>,'children'|'className'> { colors:string[] }
export function DSColorSwatchPicker({colors,...props}:DSColorSwatchPickerProps) { return <ColorSwatchPicker {...props} className="owned-color-picker">{colors.map(color=><ColorSwatchPickerItem key={color} color={color}><DSColorSwatch /></ColorSwatchPickerItem>)}</ColorSwatchPicker> }
