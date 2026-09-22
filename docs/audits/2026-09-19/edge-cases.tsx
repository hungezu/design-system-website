import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DSAvatar, DSInputOTP, DSToast, DSButton, DSSelect, DSInput, DSCheckbox, DSRadio, DSSwitch } from '../../../src/runtime/index'
import { PreviewScope } from '../../../src/design-system/theme/PreviewScope'
import { baselineThemeSettings, projectPreviewVariables } from '../../../src/services/project-theme'
import '../../../src/design-system/tokens.css'
import '../../../src/styles/index.css'
export function EdgeCases() {
 const [src,setSrc]=useState('/audit-intentionally-missing-avatar.png')
 const [toast,setToast]=useState(false)
 const [otp,setOtp]=useState('')
 return <div style={{maxWidth:1000,margin:'auto',padding:24}}><h1>组件边界情况核查</h1><p>使用当前正式组件的审计辅助页。所有操作仅影响本页临时状态。</p><PreviewScope vars={projectPreviewVariables(baselineThemeSettings)}>
  <section id="otp"><h2>验证码：从任意位置填写或更正</h2><DSInputOTP label="核查验证码" length={4} onChange={setOtp}/><p data-otp-value>回调值：{otp}</p></section>
  <section id="avatar"><h2>头像：失败后更换有效图片</h2><DSAvatar name="核查头像" src={src}/><DSButton onClick={()=>setSrc('/assets/hj-logo-112.png')}>替换有效图片</DSButton><p>{src}</p></section>
  <section id="toast"><h2>通知：关闭后再次打开，1 秒自动关闭</h2><DSButton onClick={()=>setToast(true)}>打开核查通知</DSButton><DSToast open={toast} onOpenChange={setToast} message="边界核查通知" duration={1000}/></section>
  <section id="combinations"><h2>组合态：选中且禁用、错误且禁用</h2><DSCheckbox label="选中且禁用" checked disabled/><DSRadio label="已选单选且禁用" options={[{value:'a',label:'禁用单选'}]} value="a" disabled/><DSSwitch label="开启且禁用" checked disabled/><DSInput label="错误且禁用" defaultValue="保留内容" invalid disabled errorMessage="字段错误"/><DSInput label="只读且可清空" value="只读内容" readOnly clearable/><DSSelect label="必填且配置可清空" defaultValue="a" required clearable options={[{value:'a',label:'选项 A'}]}/><DSSelect label="只读选择器" defaultValue="a" readOnly clearable options={[{value:'a',label:'选项 A'},{value:'b',label:'选项 B'}]}/></section>
 </PreviewScope></div>
}
createRoot(document.getElementById('root')!).render(<EdgeCases/> )
