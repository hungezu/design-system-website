import {AIExpandable} from './Expandable'
import {useState} from 'react'
import {DSButton} from '../Button'
import {DSIconAction} from '../IconAction'
import {DSIcon} from '../../../runtime/vendor/runtime.js'
import {safeAIUrl,formatAIFileSize} from './shared'
export interface DSChatAttachmentProps {name:string;size?:number;type?:string;src?:string;status?:'ready'|'uploading'|'error';progress?:number;error?:string;onRemove?:()=>void;onRetry?:()=>void;disabled?:boolean}
export function DSChatAttachment({name,size,type='',src,status='ready',progress,error,onRemove,onRetry,disabled=false}:DSChatAttachmentProps){
 const [failedSrc,setFailedSrc]=useState<string>()
 const preview=src&&(/^(blob:|https?:|\/)/.test(src))&&(type.startsWith('image/')||/\.(png|jpe?g|webp|gif)$/i.test(name))&&failedSrc!==src
 return <div className="ai-attachment" data-status={status}>
  {preview?<img src={src} alt={name} onError={()=>setFailedSrc(src)}/>:<span className="ai-attachment-icon"><DSIcon name={type==='application/pdf'?'file-pdf':type.startsWith('image/')?'image':'file'} decorative size="md"/></span>}
  <div className="ai-attachment-info"><strong title={name}>{name}</strong><small>{formatAIFileSize(size)}{status==='uploading'?` · 上传中${progress!==undefined?` ${Math.round(Math.min(100,Math.max(0,progress)))}%`:''}`:status==='error'?' · 上传失败':''}</small>{error&&<span className="ai-error" role="alert">{error}</span>}</div>
  {status==='error'&&onRetry&&<DSButton size="sm" variant="tertiary" disabled={disabled} onClick={onRetry}>重试</DSButton>}
  {onRemove&&<DSIconAction compact semantic="remove-item" aria-label={`移除 ${name}`} isDisabled={disabled} onPress={onRemove}/>}
 </div>
}
export interface AISource {id:string;title:string;href?:string;description?:string;type?:'url'|'document';onOpen?:()=>void}
export interface DSChatSourceProps {sources:AISource[];collapsible?:boolean;defaultExpanded?:boolean}
export function DSChatSource({sources,collapsible=false,defaultExpanded=false}:DSChatSourceProps){
 const list=<ol className="ai-sources">{sources.map((source,index)=><li key={source.id}>
  {safeAIUrl(source.href)?<a className="ai-source" href={safeAIUrl(source.href)} target="_blank" rel="noopener noreferrer"><span className="ai-source-number">{index+1}</span><DSIcon name={source.type==='document'?'file-text':'globe'} decorative size="sm"/><span><strong>{source.title}</strong>{source.description&&<small>{source.description}</small>}</span></a>:source.onOpen?<button type="button" className="ai-source" onClick={source.onOpen}><span className="ai-source-number">{index+1}</span><span><strong>{source.title}</strong>{source.description&&<small>{source.description}</small>}</span></button>:<div className="ai-source"><span className="ai-source-number">{index+1}</span><span><strong>{source.title}</strong>{source.description&&<small>{source.description}</small>}</span></div>}
 </li>)}</ol>
 return collapsible?<AIExpandable className="ai-source-group" title={`${sources.length} 个来源`} defaultExpanded={defaultExpanded}>{list}</AIExpandable>:list
}
