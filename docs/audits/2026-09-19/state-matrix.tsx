import React from 'react'
import { createRoot } from 'react-dom/client'
import * as DS from '../../../src/runtime/index.ts'
import { PreviewScope } from '../../../src/design-system/theme/PreviewScope.tsx'
import { baselineThemeSettings, projectPreviewVariables } from '../../../src/services/project-theme.ts'
import '../../../src/design-system/tokens.css'
import '../../../src/styles/app-tokens.css'
import '../../../src/styles/index.css'
const states=['default','disabled','error'] as const
const controls: Array<[string, (state: typeof states[number]) => React.ReactNode]> = [
 ['input',(s:string)=><DS.DSInput label="输入框" defaultValue="示例内容" disabled={s==='disabled'} invalid={s==='error'} errorMessage="请检查输入"/>],
 ['search-field',(s:string)=><DS.DSSearchField label="搜索框" defaultValue="示例内容" isDisabled={s==='disabled'} isInvalid={s==='error'} errorMessage="请检查输入"/>],
 ['number-field',(s:string)=><DS.DSNumberField label="数字输入框" defaultValue={2} isDisabled={s==='disabled'} isInvalid={s==='error'} errorMessage="请检查输入"/>],
 ['combo-box',(s:string)=><DS.DSComboBox label="组合输入框" options={[{id:'a',label:'示例内容'}]} defaultSelectedKey="a" isDisabled={s==='disabled'} isInvalid={s==='error'} errorMessage="请检查输入"/>],
 ['select',(s:string)=><DS.DSSelect label="选择器" options={[{value:'a',label:'示例内容'}]} defaultValue="a" disabled={s==='disabled'} invalid={s==='error'} errorMessage="请检查输入"/>],
 ['date-field',(s:string)=><DS.DSDateField label="日期字段" isDisabled={s==='disabled'} isInvalid={s==='error'}/>],
 ['date-picker',(s:string)=><DS.DSDatePicker label="日期选择器" isDisabled={s==='disabled'} isInvalid={s==='error'}/>],
 ['checkbox',(s:string)=><DS.DSCheckbox label="复选框" defaultChecked disabled={s==='disabled'} invalid={s==='error'} errorMessage="请检查选择"/>],
 ['radio',(s:string)=><DS.DSRadio label="单选框" options={[{value:'a',label:'示例内容'}]} defaultValue="a" disabled={s==='disabled'} invalid={s==='error'} errorMessage="请检查选择"/>],
]
createRoot(document.getElementById('root')!).render(<div style={{padding:24}}><h1>组件状态核查矩阵</h1><p>审计辅助页：直接引用当前源码的真实组件与公共主题；不保存项目配置。三列依次为默认、禁用、错误。</p><PreviewScope vars={projectPreviewVariables(baselineThemeSettings)}>{controls.map(([id,render])=><section key={id} data-audit-component={id} style={{marginBlock:24}}><h2>{id}</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:24}}>{states.map(state=><div key={state} data-audit-state={state}><h3>{state}</h3>{render(state)}</div>)}</div></section>)}</PreviewScope></div>)
