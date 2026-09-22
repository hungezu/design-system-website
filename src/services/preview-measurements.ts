import { AI_COMPONENT_IDS } from '../data/ai-components'
const selectors:Record<string,Array<[string,string]>>={
 'chain-of-thought':[['步骤标题','.ai-disclosure-trigger'],['步骤内容','.ai-trace-description']],'chat-tool':[['工具卡片','.ai-tool'],['工具状态','.ai-tool .ai-disclosure-trigger']],'prompt-input':[['输入区','.ai-prompt-shell'],['输入文字','.ai-prompt textarea']],'chat-message':[['消息','.ai-message-content'],['用户气泡','.ai-message--user .ai-message-body']],'chat-conversation':[['对话区域','.ai-conversation-viewport']],'chat-list-view':[['会话条目','.ai-thread-list button']],'chat-loader':[['加载反馈','.ai-chat-loader']],'chat-message-actions':[['操作按钮','.ai-message-actions button']],'chat-source':[['来源','.ai-source']],'chat-attachment':[['附件','.ai-attachment']],'markdown':[['内容','.ai-markdown']],'code-block':[['代码块','.ai-code-block'],['代码','.ai-code-block pre']],'prompt-suggestion':[['建议','.ai-suggestions button']],'text-shimmer':[['状态文字','.ai-text-shimmer']],
 button:[['按钮','.gkx-button']],input:[['外框','.ds-input__box'],['输入文字','.ds-input__native']],select:[['触发器','.ds-select__trigger'],['下拉面板','.owned-select__popover']],
 checkbox:[['选择框','.owned-choice__box'],['选项文字','.owned-choice']],radio:[['选择框','.owned-choice__box'],['选项文字','.owned-radio']],switch:[['轨道','.owned-switch__track'],['滑块','.owned-switch__track > span']],
 table:[['表格外层','.ds-table-surface'],['内容区','.ds-table__body,.ds-grouped-table tbody'],['表头','.ds-table__head,.ds-grouped-table thead'],['数据行','.ds-table__row,.ds-grouped-table tbody tr'],['底部分页','.ds-table-footer']],pagination:[['页码按钮','button[aria-label^="第"]']],tabs:[['页签','.owned-tab'],['滚动按钮','.owned-tabs__scroll']],menu:[['导航项','.owned-nav__item'],['操作项','.owned-menu [role="menuitem"]'],['子菜单面板','.owned-nav-popover']],
 dialog:[['对话框','.owned-modal'],['主操作','.owned-dialog footer .gkx-button[data-tone="brand"]']],drawer:[['抽屉','.owned-modal--drawer'],['主操作','.owned-dialog footer .gkx-button[data-tone="brand"]']],
 tag:[['标签','.owned-tag']],badge:[['徽标','.owned-badge']],toast:[['通知','.owned-toast']],form:[['表单反馈','.owned-form-feedback'],['表单字段','.ds-input__box']],field:[['字段','input']],upload:[['选择文件','.gkx-button']],empty:[['空状态','.owned-empty']],loading:[['加载环','.owned-loading__ring']],alert:[['提示','.owned-alert']],
}
export interface MeasuredStyle { element:string;states:string[];background:string;color:string;border:string;outline:string;shadow:string;font:string;size:string;radius:string;brand:string;variables:Array<[string,string]>;placeholder?:string }
export function readPreviewStyles(ownerId:string,componentId:string):MeasuredStyle[]{
 const roots=Array.from(document.querySelectorAll<HTMLElement>('[data-preview-owner]')).filter(root=>root.dataset.previewOwner===ownerId)
 return (selectors[componentId]??[['控件','input,button,[role="slider"],svg']]).flatMap(([name,selector])=>{
  const elements=roots.flatMap(root=>[...(root.matches(selector)?[root]:[]),...Array.from(root.querySelectorAll<HTMLElement>(selector))])
  const visible=[...new Set(elements)].filter(item=>item.getClientRects().length>0)
  return visible.slice(0,8).map((element,index)=>{
  const css=getComputedStyle(element),states=new Set<string>()
  for(const attribute of ['data-state','data-status'])if(element.getAttribute(attribute))states.add(element.getAttribute(attribute)!)
  for(let node:Element|null=element;node;node=node.parentElement){
   for(const [attribute,state] of [['data-disabled','disabled'],['data-invalid','invalid'],['data-selected','selected'],['data-current','selected'],['data-indeterminate','indeterminate'],['data-focus-visible','focus-visible'],['data-open','open']])if(node.hasAttribute(attribute))states.add(state)
   if(node.getAttribute('aria-busy')==='true')states.add('loading')
   if(node.hasAttribute('data-preview-owner'))break
  }
  if(element.querySelector('[aria-busy="true"]'))states.add('loading')
  if(element.matches(':hover'))states.add('hover')
  if(element.matches(':active'))states.add('active')
  if(element.matches(':focus-visible')||element.querySelector(':focus-visible'))states.add('focus-visible')
  if(element.getAttribute('aria-expanded')==='true')states.add('open')
  if(element.matches(':disabled')||element.getAttribute('aria-disabled')==='true')states.add('disabled')
  if(element.getAttribute('aria-invalid')==='true')states.add('invalid')
  return {element:visible.length>1?`${name} ${index+1}`:name,states:[...states],background:css.backgroundColor,color:css.color,border:css.borderColor,outline:css.outline,shadow:css.boxShadow,font:css.font,size:`${Math.round(element.getBoundingClientRect().width)} × ${Math.round(element.getBoundingClientRect().height)}`,radius:css.borderRadius,brand:css.getPropertyValue('--brand-primary').trim(),variables:[...['--preview-font-family','--preview-body-size'],...(AI_COMPONENT_IDS.includes(componentId)?['--ai-message-gap','--ai-composer-radius','--ai-panel-radius','--ai-user-background','--ai-code-background','--ai-border','--ai-muted-text']:componentId==='table'?['--radius-table','--bds-table-radius','--bds-table-content-radius']:componentId==='button'?['--button-bg-default','--button-bg-hover','--button-bg-active','--button-text-default','--button-border-default','--font-button']:['menu','tabs'].includes(componentId)?['--bds-brand','--bds-selection-bg','--bds-fill-hover','--bds-bg-surface','--bds-text-primary','--bds-text-disabled','--bds-focus-ring']:['badge','alert','toast'].includes(componentId)?['--feedback-tone','--feedback-ink','--bds-bg-surface','--bds-text-primary']:['--bds-field-bg','--bds-field-border','--bds-field-border-hover','--bds-field-border-focus','--bds-field-border-invalid','--field-placeholder'])].map(name=>[name,css.getPropertyValue(name).trim()] as [string,string]).filter(([,value])=>Boolean(value)),placeholder:element.matches('input,textarea')?getComputedStyle(element,'::placeholder').color:undefined}
  })
 })
}
