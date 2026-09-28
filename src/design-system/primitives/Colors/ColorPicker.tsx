import { ColorPicker } from 'react-aria-components'
import type { ComponentProps } from 'react'
import { DSColorArea, DSColorField, DSColorSlider, DSColorSwatch } from './index'
export interface DSColorPickerProps extends Omit<ComponentProps<typeof ColorPicker>,'children'> {
  label:string
  isDisabled?:boolean
}
export function DSColorPicker({label,isDisabled=false,...props}:DSColorPickerProps) { return <ColorPicker {...props}>{({color})=><div className="owned-color-picker-panel" data-disabled={isDisabled||undefined}><div className="owned-color-picker__summary"><span>当前颜色</span><DSColorSwatch color={color}/></div><DSColorArea aria-label={label} colorSpace="hsb" xChannel="saturation" yChannel="brightness" isDisabled={isDisabled}/><DSColorSlider label="色相" channel="hue" colorSpace="hsb" isDisabled={isDisabled}/><DSColorField label={label} isDisabled={isDisabled}/></div>}</ColorPicker> }
