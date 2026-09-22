import { ColorPicker } from 'react-aria-components'
import type { ComponentProps } from 'react'
import { DSColorArea, DSColorField, DSColorSlider, DSColorSwatch } from './index'
export function DSColorPicker({label,...props}:Omit<ComponentProps<typeof ColorPicker>,'children'>&{label:string}) { return <ColorPicker {...props}>{({color})=><div className="owned-color-picker-panel"><div className="owned-color-picker__summary"><span>当前颜色</span><DSColorSwatch color={color}/></div><DSColorArea aria-label={label} colorSpace="hsb" xChannel="saturation" yChannel="brightness"/><DSColorSlider label="色相" channel="hue" colorSpace="hsb"/><DSColorField label={label}/></div>}</ColorPicker> }
