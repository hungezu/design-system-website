import type { ProjectThemeSettings } from './project-theme'
export const SIZING_VERSION = 1 as const
export const sizingParameters = [
 {id:'heightSm',label:'小号控件高度',token:'control-height-sm',group:'控件尺寸',min:24,max:64,targets:'小号按钮、输入框、选择器'},
 {id:'heightMd',label:'中号控件高度',token:'control-height-md',group:'控件尺寸',min:24,max:64,targets:'默认按钮、输入框、选择器、分页'},
 {id:'heightLg',label:'大号控件高度',token:'control-height-lg',group:'控件尺寸',min:24,max:72,targets:'大号按钮、输入框、选择器'},
 {id:'buttonSmPadding',label:'小按钮左右内边距',token:'button-padding-inline-sm',group:'控件内边距',min:0,max:40,targets:'带文字的小号按钮，纯图标按钮保持正方形'},
 {id:'buttonPadding',label:'常规按钮左右内边距',token:'button-padding-inline',group:'控件内边距',min:0,max:40,targets:'中号、大号文字按钮'},
 {id:'inputPadding',label:'输入框左右内边距',token:'input-padding-inline',group:'控件内边距',min:0,max:32,targets:'输入框、多行输入框'},
 {id:'selectStartPadding',label:'选择器起始内边距',token:'select-padding-start',group:'控件内边距',min:0,max:32,targets:'选择器文字一侧'},
 {id:'selectEndPadding',label:'选择器结束内边距',token:'select-padding-end',group:'控件内边距',min:6,max:32,targets:'选择器箭头一侧'},
 {id:'optionBlockPadding',label:'下拉选项上下内边距',token:'select-option-padding-block',group:'浮层与间距',min:4,max:24,targets:'选择器下拉选项'},
 {id:'optionInlinePadding',label:'下拉选项左右内边距',token:'select-option-padding-inline',group:'浮层与间距',min:4,max:32,targets:'选择器下拉选项'},
 {id:'popupPadding',label:'弹层内容内边距',token:'popup-padding',group:'浮层与间距',min:8,max:48,targets:'对话框、抽屉桌面内容区'},
 {id:'popupNarrowPadding',label:'窄屏弹层内边距',token:'popup-padding-narrow',group:'浮层与间距',min:8,max:32,targets:'600px 以下对话框、抽屉内容区'},
 {id:'componentGap',label:'组合区域间距',token:'component-gap',group:'浮层与间距',min:4,max:40,targets:'主题预览的组件组合与表单区域'},
] as const
export type SizingId = typeof sizingParameters[number]['id']
export interface ThemeSizing { version:typeof SIZING_VERSION; overrides:Partial<Record<SizingId,number>> }
export type SizingValues = Record<SizingId,number>
export function sizingDefaults(density:ProjectThemeSettings['density']):SizingValues {
 const delta=density==='compact'?-2:density==='spacious'?4:0
 return {heightSm:28+delta,heightMd:32+delta,heightLg:40+delta,buttonSmPadding:12+delta,buttonPadding:16+delta,inputPadding:8+delta,selectStartPadding:10+delta,selectEndPadding:9+delta,optionBlockPadding:8+delta,optionInlinePadding:12+delta,popupPadding:24+delta,popupNarrowPadding:16+delta,componentGap:density==='compact'?12:density==='spacious'?18:16}
}
export function legacySizing(theme:ProjectThemeSettings,base:Record<string,string>={}):SizingValues {const n=(key:string,fallback:number)=>{const value=Number.parseFloat(base[key]??'');return Number.isFinite(value)?value:fallback};return {heightSm:n('control-height-sm',28),heightMd:theme.controlHeight,heightLg:n('control-height-lg',40),buttonSmPadding:n('spacing-12',12),buttonPadding:theme.spacing,inputPadding:n('spacing-8',8),selectStartPadding:10,selectEndPadding:9,optionBlockPadding:8,optionInlinePadding:12,popupPadding:n('spacing-24',24),popupNarrowPadding:theme.spacing,componentGap:theme.spacing}}
export function resolvedSizing(theme:ProjectThemeSettings):SizingValues {return theme.sizing?{...sizingDefaults(theme.density),...theme.sizing.overrides}:legacySizing(theme)}
/** Preserve existing actual sizes when explicitly migrating a legacy theme. */
export function enableSizing(theme:ProjectThemeSettings,baseValues?:Record<string,string>):ThemeSizing {
 if(theme.sizing)return theme.sizing
 const base=sizingDefaults(theme.density),old=legacySizing(theme,baseValues)
 return {version:1,overrides:Object.fromEntries(sizingParameters.filter(p=>old[p.id]!==base[p.id]).map(p=>[p.id,old[p.id]]))}
}
export function changeSizing(theme:ProjectThemeSettings,id:SizingId,value:number|undefined):ThemeSizing {
 const current=enableSizing(theme),overrides={...current.overrides}
 if(value===undefined)delete overrides[id];else overrides[id]=value
 return {version:1,overrides}
}
export function sizingTokens(theme:ProjectThemeSettings):Record<string,string> {
 if(!theme.sizing)return {}
 const values=resolvedSizing(theme)
 return Object.fromEntries(sizingParameters.map(p=>[p.token,`${values[p.id]}px`]))
}
export function validateSizing(value:unknown,bodySize:number) {
 if(value===undefined)return
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('分层尺寸格式无效。')
 const s=value as ThemeSizing
 if(s.version!==1||!s.overrides||typeof s.overrides!=='object'||Array.isArray(s.overrides)||Object.keys(s).some(key=>!['version','overrides'].includes(key)))throw new Error('分层尺寸版本或结构无效。')
 for(const [id,n]of Object.entries(s.overrides)){
  const parameter=sizingParameters.find(p=>p.id===id)
  if(!parameter||typeof n!=='number'||!Number.isFinite(n)||!Number.isInteger(n)||n<parameter.min||n>parameter.max)throw new Error(`尺寸参数无效：${parameter?.label??id}`)
  if(id.startsWith('height')&&n<bodySize+10)throw new Error(`${parameter.label}不足以容纳当前文字行高与边框。`)
 }
}
export function validateResolvedSizing(theme:ProjectThemeSettings){
 validateSizing(theme.sizing,theme.bodySize)
 if(!theme.sizing)return
 const values=resolvedSizing(theme)
 for(const id of ['heightSm','heightMd','heightLg'] as const)if(values[id]<theme.bodySize+10)throw new Error(`${sizingParameters.find(p=>p.id===id)!.label}不足以容纳当前文字，请调整高度或字号。`)
 if(values.heightSm>values.heightMd||values.heightMd>values.heightLg)throw new Error('控件高度需满足：小号 ≤ 中号 ≤ 大号。')
}
