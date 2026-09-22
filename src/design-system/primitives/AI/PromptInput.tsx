import {useEffect,useLayoutEffect,useRef,useState,type ReactNode,type KeyboardEvent} from 'react'
import {DSTextArea} from '../TextField'
import {DSButton} from '../Button'
import {DSIcon} from '../../../runtime/vendor/runtime.js'
import {DSChatAttachment} from './Sources'
import {formatAIFileSize,type AIRunState} from './shared'
export interface DSPromptInputProps {
 value:string;onChange:(value:string)=>void;onSubmit:(value:string,files:File[])=>void|Promise<void>
 status?:AIRunState;onStop?:()=>void;disabled?:boolean;placeholder?:string;label?:string;error?:string
 files?:File[];onFilesChange?:(files:File[])=>void;accept?:string;maxFiles?:number;maxFileSize?:number
 layout?:'stacked'|'inline'|'compact';footer?:ReactNode;toolbar?:ReactNode
}
function LocalAttachment({file,onRemove,disabled}:{file:File;onRemove:()=>void;disabled:boolean}){
 const [url,setUrl]=useState<string>()
 useEffect(()=>{if(!file.type.startsWith('image/')||!URL.createObjectURL)return;const next=URL.createObjectURL(file);setUrl(next);return()=>URL.revokeObjectURL(next)},[file])
 return <DSChatAttachment name={file.name} size={file.size} type={file.type} src={url} onRemove={onRemove} disabled={disabled}/>
}
export function DSPromptInput({value,onChange,onSubmit,status='ready',onStop,disabled=false,placeholder='输入问题，或描述你需要的帮助',label='发送给助手的消息',error,files=[],onFilesChange,accept,maxFiles=5,maxFileSize=10*1024*1024,layout='stacked',footer,toolbar}:DSPromptInputProps){
 const root=useRef<HTMLFormElement>(null),picker=useRef<HTMLInputElement>(null),lock=useRef(false),composing=useRef(false)
 const [pending,setPending]=useState(false),[failure,setFailure]=useState(''),[dragging,setDragging]=useState(false),[multiline,setMultiline]=useState(false)
 const running=status==='submitted'||status==='streaming',blocked=disabled||pending||running
 const addFiles=(next:File[])=>{if(blocked||!onFilesChange)return;setFailure('');if(accept&&next.some(file=>!accept.split(',').some(rule=>{const match=rule.trim().toLowerCase();return match.startsWith('.')?file.name.toLowerCase().endsWith(match):match.endsWith('/*')?file.type.toLowerCase().startsWith(match.slice(0,-1)):file.type.toLowerCase()===match}))){setFailure(`附件类型不支持，请选择 ${accept}。`);return}if(files.length+next.length>maxFiles){setFailure(`最多添加 ${maxFiles} 个附件。`);return}if(next.some(file=>file.size>maxFileSize)){setFailure(`单个附件不能超过 ${formatAIFileSize(maxFileSize)}。`);return}onFilesChange([...files,...next])}
 const send=async()=>{if(lock.current||blocked||!value.trim()&&!files.length)return;lock.current=true;setPending(true);setFailure('');try{await onSubmit(value.trim(),files);onChange('');onFilesChange?.([])}catch(err){setFailure(err instanceof Error?err.message:'发送失败，请重试。')}finally{lock.current=false;setPending(false)}}
 const keyDown=(event:KeyboardEvent)=>{if(event.key==='Enter'&&!event.shiftKey&&!event.nativeEvent.isComposing&&event.nativeEvent.keyCode!==229&&!composing.current&&event.target instanceof HTMLTextAreaElement){event.preventDefault();void send()}}
 useLayoutEffect(()=>{const area=root.current?.querySelector('textarea');if(!area)return;const resize=()=>{area.style.height='auto';const desired=area.scrollHeight||36;area.style.height=`${Math.min(180,Math.max(36,desired))}px`;setMultiline(desired>56||value.includes('\n'))};resize();let width=area.clientWidth;const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(()=>{if(area.clientWidth!==width){width=area.clientWidth;resize()}});observer?.observe(area);return()=>observer?.disconnect()},[value,layout,files.length])
 return <form className="ai-prompt" ref={root} aria-label="AI 消息输入" onSubmit={event=>{event.preventDefault();void send()}} onKeyDown={keyDown} onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}}
  data-layout={layout==='compact'&&(multiline||files.length)?'stacked':layout} data-dragging={dragging||undefined}
  onDragOver={event=>{if(onFilesChange&&!blocked&&event.dataTransfer.types.includes('Files')){event.preventDefault();setDragging(true)}}}
  onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setDragging(false)}}
  onDrop={event=>{event.preventDefault();if(!onFilesChange)return;setDragging(false);addFiles([...event.dataTransfer.files])}}>
  <div className="ai-prompt-shell">
   {files.length>0&&<div className="ai-attachments">{files.map((file,index)=><LocalAttachment key={`${file.name}-${file.lastModified}-${index}`} file={file} disabled={blocked} onRemove={()=>onFilesChange?.(files.filter((_,i)=>i!==index))}/>)}</div>}
   <DSTextArea className="ai-prompt-text" label={label} rows={1} value={value} onChange={onChange} placeholder={placeholder} disabled={blocked}/>
   <div className="ai-prompt-toolbar"><div className="ai-inline-actions">{onFilesChange&&<><input className="ds-visually-hidden" ref={picker} type="file" accept={accept} multiple disabled={blocked} aria-label="选择附件" tabIndex={-1} onChange={event=>{addFiles([...event.target.files??[]]);event.target.value=''}}/><DSButton type="button" size="sm" variant="tertiary" icon={<DSIcon name="add" decorative size="sm"/>} aria-label="添加附件" disabled={blocked} onClick={()=>picker.current?.click()}/></>}{toolbar}</div>
    {running?<DSButton type="button" size="sm" variant="secondary" icon={<DSIcon name="stop" decorative size="sm"/>} aria-label="停止生成" disabled={disabled||!onStop} onClick={onStop}/>:<DSButton type="submit" size="sm" variant="primary" icon={<DSIcon name="send" decorative size="sm"/>} aria-label="发送消息" loading={pending} disabled={disabled||!value.trim()&&!files.length}/>}
   </div>
  </div>
  {(failure||error)&&<p className="ai-error" role="alert">{failure||error}</p>}{footer&&<div className="ai-prompt-footer">{footer}</div>}
 </form>
}
