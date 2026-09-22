import { ScopedPopover as Popover } from '../../theme/PreviewScope'
import { useRef, useState, type KeyboardEvent, type ReactNode, type ComponentProps } from 'react'
import { Disclosure, DisclosurePanel, Heading, Button, Group, TooltipTrigger, Tooltip, DialogTrigger, Dialog, TagGroup, TagList, Tag, Label, Text, Input, FileTrigger, DropZone, type Placement } from 'react-aria-components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import { DSComboBox, type DSComboBoxProps } from '../AdvancedFields'
import { DSSelect } from '../Select'
import { DSDialog, type DSDialogProps } from '../Overlays'
import { DSIconAction } from '../IconAction'
import { Button as DSButton } from '../Button'

export function DSButtonGroup({children,label}:{children:ReactNode;label:string}) { return <Group role="group" aria-label={label} className="owned-toolbar">{children}</Group> }
export function DSCloseButton({onPress,disabled,label='关闭'}:{onPress:()=>void;disabled?:boolean;label?:string}) { return <DSIconAction semantic="close" aria-label={label} onPress={onPress} isDisabled={disabled} /> }
export function DSInputGroup({children,label}:{children:ReactNode;label:string}) { return <div className="owned-input-group owned-field-stack"><span className="owned-field-label">{label}</span><Group aria-label={label} className="owned-control-row owned-input-group__control">{children}</Group></div> }
export { DSMenu } from '../Navigation/Menu'
export type { DSMenuProps, DSMenuItem } from '../Navigation/Menu'
export function DSDisclosure({title,children,disabled}:{title:string;children:ReactNode;disabled?:boolean}) { return <Disclosure className="owned-accordion" isDisabled={disabled}><Heading><Button slot="trigger">{title}</Button></Heading><DisclosurePanel>{children}</DisclosurePanel></Disclosure> }
export function DSTooltip({label,children,placement='top',offset=8,shouldFlip=true}:{label:string;children:ReactNode;placement?:Placement;offset?:number;shouldFlip?:boolean}) { return <TooltipTrigger delay={0} closeDelay={80}><Button className="owned-menu-trigger">{children}</Button><Tooltip className="owned-tooltip" placement={placement} offset={offset} shouldFlip={shouldFlip}>{label}</Tooltip></TooltipTrigger> }
export function DSPopover({label,children}:{label:string;children:ReactNode}) { return <DialogTrigger><Button className="owned-menu-trigger">{label}</Button><Popover className="owned-popover"><Dialog aria-label={label} className="owned-popover__dialog"><strong>{label}</strong><div>{children}</div></Dialog></Popover></DialogTrigger> }
export function DSPopconfirm({label,description,onConfirm,tone='default'}:{label:string;description:string;onConfirm:()=>void;tone?:'default'|'danger'}) { const danger=tone==='danger';return <DialogTrigger><Button className="owned-menu-trigger">{label}</Button><Popover className="owned-popover owned-popconfirm"><Dialog aria-label={label} className="owned-popover__dialog">{({close})=><><div className="owned-popconfirm__heading"><DSIcon name={danger?'warning':'info'} weight="filled" size="sm" decorative /><strong>{label}</strong></div><p>{description}</p><footer><DSButton size="sm" onClick={close}>取消</DSButton><DSButton size="sm" priority="primary" appearance="filled" tone={danger?'danger':'brand'} onClick={()=>{onConfirm();close()}}>{danger?'删除':'确认'}</DSButton></footer></>}</Dialog></Popover></DialogTrigger> }
export function DSModal(props:DSDialogProps) { return <DSDialog {...props} /> }
export function DSAlertDialog(props:DSDialogProps) { return <DSDialog {...props} role="alertdialog" dismissible={false} /> }
export function DSAutocomplete(props:DSComboBoxProps) { return <DSComboBox {...props} /> }
export function DSTagGroup({label,items,onRemove}:{label:string;items:{id:string;label:string}[];onRemove?:(ids:string[])=>void}) { return <TagGroup selectionMode="none" onRemove={keys=>onRemove?.(Array.from(keys,String))}><Label>{label}</Label><TagList className="owned-toolbar" items={items}>{item=><Tag id={item.id} textValue={item.label} className="owned-menu-trigger">{item.label}{onRemove&&<DSIconAction slot="remove" semantic="remove-item" compact aria-label={`移除${item.label}`} />}</Tag>}</TagList></TagGroup> }
export interface DSInputOTPProps { label:string; length?:number; onChange?:(value:string)=>void; disabled?:boolean }
export function DSInputOTP({length=6,...props}:DSInputOTPProps) {
 const count=Number.isFinite(length)?Math.max(1,Math.floor(length)):6
 return <OTPFields key={count} {...props} length={count}/>
}
function OTPFields({label,length,onChange,disabled}:DSInputOTPProps & {length:number}) {
 const [cells,setCells]=useState<string[]>(()=>Array(length).fill(''))
 const draft=useRef(cells)
 const refs=useRef<Array<HTMLInputElement|null>>([])
 const focus=(index:number)=>{refs.current[index]?.focus();refs.current[index]?.select()}
 // Empty slots belong to the editor; the public callback remains a digits-only string.
 const commit=(next:string[])=>{draft.current=next;setCells(next);onChange?.(next.join(''))}
 const setDigit=(index:number,input:string)=>{
  if(disabled)return
  const digits=input.replace(/\D/g,'')
  if(input && !digits)return
  const next=[...draft.current]
  if(!digits){next[index]='';commit(next);return}
  const start=digits.length>=length?0:index
  const inserted=digits.slice(0,length-start).split('')
  inserted.forEach((digit,offset)=>{next[start+offset]=digit})
  commit(next);focus(Math.min(start+inserted.length,length-1))
 }
 const keyDown=(index:number,event:KeyboardEvent<HTMLInputElement>)=>{
  if(disabled)return
  if(event.key==='Backspace'||event.key==='Delete'){
   event.preventDefault();const target=event.key==='Backspace'&&!draft.current[index]?Math.max(0,index-1):index
   const next=[...draft.current];next[target]='';commit(next);focus(target)
  }
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'||event.key==='Home'||event.key==='End'){
   event.preventDefault();focus(event.key==='Home'?0:event.key==='End'?length-1:Math.max(0,Math.min(length-1,index+(event.key==='ArrowLeft'?-1:1))))
  }
 }
 return <fieldset className="owned-otp" disabled={disabled}><legend>{label}</legend><div className="owned-otp__cells" role="group" aria-label={label}>{cells.map((digit,index)=><Input key={index} ref={node=>{refs.current[index]=node}} aria-label={`${label}第 ${index+1} 位`} autoComplete={index===0?'one-time-code':'off'} inputMode="numeric" pattern="[0-9]*" maxLength={1} value={digit} onFocus={event=>event.currentTarget.select()} onChange={event=>setDigit(index,event.target.value)} onKeyDown={event=>keyDown(index,event)} onPaste={event=>{event.preventDefault();setDigit(index,event.clipboardData.getData('text'))}} />)}</div><Text className="owned-otp__hint">已输入 {cells.filter(Boolean).length} / {length} 位</Text></fieldset>
}
export interface CascadeOption { value:string; label:string; children?:CascadeOption[] }
export function DSCascader({label,options,onChange}:{label:string;options:CascadeOption[];onChange?:(path:string[])=>void}) {
 const [path,setPath]=useState<string[]>([]);const levels:CascadeOption[][]=[options];let current=options
 for(const key of path){const next=current.find(x=>x.value===key)?.children;if(!next?.length)break;levels.push(next);current=next}
 return <div className="owned-toolbar">{levels.map((items,i)=><DSSelect key={i} label={`${label} 第${i+1}级`} options={items} value={path[i]??null} onChange={value=>{const next=[...path.slice(0,i),value];setPath(next);onChange?.(next)}}/>)}</div>
}
export function DSDropZone({label,onFiles}:{label:string;onFiles:(files:File[])=>void}) { return <DropZone className="owned-drop-zone" onDrop={async event=>{const files=await Promise.all(event.items.filter(item=>item.kind==='file').map(item=>item.getFile()));onFiles(files)}}><DSIcon className="owned-drop-zone__icon" name="upload" size="lg" decorative /><strong>{label}</strong><span>拖放文件到此处，或使用下方按钮选择</span><FileTrigger allowsMultiple onSelect={files=>{if(files)onFiles(Array.from(files))}}><DSButton size="sm">选择文件</DSButton></FileTrigger></DropZone> }
export function DSImagePreview({src,alt,aspect='landscape'}:{src:string;alt:string;aspect?:'landscape'|'square'}) { const [open,setOpen]=useState(false);return <><Button className={`owned-image-preview owned-image-preview--${aspect}`} onPress={()=>setOpen(true)} aria-label={`预览${alt}`}><img src={src} alt="" /><span className="owned-image-preview__action"><DSIcon name="eye" size="sm" decorative />查看大图</span></Button><DSDialog open={open} onOpenChange={setOpen} title={alt} size="sm"><div className="owned-image-preview__dialog"><img src={src} alt={alt} /></div></DSDialog></> }
export function DSSteps({items,current}:{items:string[];current:number}) { return <ol className="owned-steps">{items.map((label,i)=><li key={`${i}-${label}`} aria-current={i===current?'step':undefined} data-complete={i<current||undefined}><span>{i<current?<DSIcon name="confirm" size="xs" decorative />:i+1}</span><strong>{label}</strong></li>)}</ol> }
export function DSResizablePanel({children,label='调整面板宽度',min=180,max=600}:{children:ReactNode;label?:string;min?:number;max?:number}) {
 const [width,setWidth]=useState(min)
 const clamp=(next:number)=>setWidth(Math.max(min,Math.min(max,next)))
 return <section className="owned-resizable" style={{width,maxWidth:'100%'}}><div className="owned-card">{children}</div><div role="separator" aria-label={label} aria-orientation="vertical" aria-valuemin={min} aria-valuemax={max} aria-valuenow={width} tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();clamp(width+10)}if(event.key==='ArrowLeft'){event.preventDefault();clamp(width-10)}if(event.key==='Home'){event.preventDefault();clamp(min)}if(event.key==='End'){event.preventDefault();clamp(max)}}} onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);event.currentTarget.dataset.start=String(event.clientX);event.currentTarget.dataset.width=String(width)}} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))clamp(Number(event.currentTarget.dataset.width)+event.clientX-Number(event.currentTarget.dataset.start))}} onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}} /></section>
}
export type DSNativeInputProps=ComponentProps<typeof Input>
