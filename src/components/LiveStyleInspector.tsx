import { useEffect, useState } from 'react'
import { DSButton } from '../runtime'
import { readPreviewStyles, type MeasuredStyle } from '../services/preview-measurements'
export function LiveStyleInspector({ownerId,componentId,scopeLabel}:{ownerId:string;componentId:string;scopeLabel:string}){
 const [rows,setRows]=useState<MeasuredStyle[]>([])
 const read=()=>setRows(previous=>{const next=readPreviewStyles(ownerId,componentId);return JSON.stringify(previous)===JSON.stringify(next)?previous:next})
 useEffect(()=>{
  let frame=0
  const refresh=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>setRows(previous=>{const next=readPreviewStyles(ownerId,componentId);return JSON.stringify(previous)===JSON.stringify(next)?previous:next}))}
  const belongs=(node:Node|null)=>node instanceof Element&&node.closest(`[data-preview-owner="${ownerId}"]`)!==null
  const onInteraction=(event:Event)=>{if(belongs(event.target as Node))refresh()}
  const observer=new MutationObserver(records=>{if(records.some(record=>belongs(record.target)||[...record.addedNodes,...record.removedNodes].some(node=>node instanceof Element&&(belongs(node)||!!node.querySelector(`[data-preview-owner="${ownerId}"]`)))))refresh()})
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','data-hovered','data-pressed','data-disabled','data-invalid','data-selected','data-current','data-indeterminate','data-focus-visible','data-open','data-expanded','data-state','data-status','data-active','data-dragging','aria-expanded','aria-selected','aria-busy','disabled']})
  const events=['pointerover','pointerout','pointerdown','pointerup','focusin','focusout','input','change','transitionend']
  for(const name of events)document.addEventListener(name,onInteraction,true)
  refresh()
  return()=>{cancelAnimationFrame(frame);observer.disconnect();for(const name of events)document.removeEventListener(name,onInteraction,true)}
 },[ownerId,componentId])
 return <section className="live-style-inspector" aria-label="真实预览样式"><h3>真实预览样式</h3><p>作用域：{scopeLabel}。变量列是 DOM 的最终继承值，可与项目 Token 定义对照。</p><p>直接读取上方实时示例和它打开的浮层。移动鼠标、键盘聚焦或切换示例后更新；关闭的浮层不会显示虚构数值。</p><DSButton variant="secondary" size="sm" onClick={read}>重新读取实际样式</DSButton>{rows.length?<div className="live-style-table"><table><thead><tr><th>元素 / 实际状态</th><th>背景 / 文字</th><th>边框 / 焦点</th><th>尺寸 / 字体</th><th>作用域变量</th></tr></thead><tbody>{rows.map(row=><tr key={row.element}><th>{row.element}<small>{row.states.join(' + ')||'default'}</small></th><td><code>{row.background}</code><code>{row.color}</code>{row.placeholder&&<code>占位：{row.placeholder}</code>}</td><td><code>{row.border}</code><code>{row.outline}</code><code>{row.shadow}</code></td><td>{row.size}<code>圆角：{row.radius}</code><code>{row.font}</code></td><td><code>--brand-primary: {row.brand}</code>{row.variables.map(([name,value])=><code key={name}>{name}: {value}</code>)}</td></tr>)}</tbody></table></div>:<p>尚未找到可见的目标元素；请切换到预览，或先打开该组件的浮层。</p>}</section>
}
