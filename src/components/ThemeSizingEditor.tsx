import { useState } from 'react'
import { DSButton } from '../runtime'
import type { ProjectThemeSettings } from '../services/project-theme'
import { changeSizing, enableSizing, resolvedSizing, sizingDefaults, sizingParameters, type ThemeSizing } from '../services/theme-sizing'
export function ThemeSizingEditor({theme,onChange,disabled=false,baseValues}:{theme:ProjectThemeSettings;onChange:(value:ThemeSizing)=>void;disabled?:boolean;baseValues?:Record<string,string>}) {
 const [onlyOverrides,setOnlyOverrides]=useState(false)
 const base=sizingDefaults(theme.density),values=resolvedSizing(theme)
 if(!theme.sizing)return <section className="theme-sizing"><h3>分层尺寸与边距</h3><p>启用后保留当前尺寸，按用途细调。与密度推荐值不同的原有设置会保留为覆盖值。</p><DSButton variant="secondary" disabled={disabled} onClick={()=>onChange(enableSizing(theme,baseValues))}>启用分层调节</DSButton></section>
 return <section className="theme-sizing"><h3>分层尺寸与边距</h3><p>跟随项随信息密度更新；单独调节后保持覆盖。恢复跟随会使用当前密度的推荐值。</p><label className="sizing-filter"><input type="checkbox" checked={onlyOverrides} onChange={e=>setOnlyOverrides(e.target.checked)}/>仅看单项覆盖</label>
 {['控件尺寸','控件内边距','浮层与间距'].map(group=><details key={group} open={group==='控件尺寸'} className="sizing-group"><summary>{group}</summary>{sizingParameters.filter(p=>p.group===group&&(!onlyOverrides||Object.hasOwn(theme.sizing!.overrides,p.id))).map(p=>{
 const overridden=Object.hasOwn(theme.sizing!.overrides,p.id),value=values[p.id]
 return <div className="sizing-parameter" key={p.id}><label><strong>{p.label}</strong><span className="sizing-measure" aria-hidden="true"><i style={{width:`${Math.min(Number.isFinite(value)?value:base[p.id],72)}px`}}/></span><span className="sizing-input"><input aria-label={p.label} type="number" min={p.min} max={p.max} step={1} value={Number.isFinite(value)?value:''} disabled={disabled} onChange={e=>onChange(changeSizing(theme,p.id,e.target.valueAsNumber))}/><span>px</span></span></label><small>{overridden?'已覆盖':'跟随密度'} · 推荐 {base[p.id]}px</small><p>{p.targets}</p><details><summary>变量映射</summary><code>--{p.token}</code></details>{overridden&&<DSButton size="sm" variant="tertiary" disabled={disabled} onClick={()=>onChange(changeSizing(theme,p.id,undefined))}>恢复跟随：{p.label}</DSButton>}</div>
 })}</details>)}
 {onlyOverrides&&!Object.keys(theme.sizing.overrides).length&&<p>所有参数都在跟随当前密度。</p>}
 </section>
}
