import {Children,useLayoutEffect,useRef,useState,type ReactNode} from 'react'
import {DSButton} from '../Button'
import {DSIcon} from '../../../runtime/vendor/runtime.js'
import {DSMarkdown,DSChatLoader} from './Content'
import {DSChatSource,type AISource,DSChatAttachment,type DSChatAttachmentProps} from './Sources'
import {useAICopy} from './shared'
export interface DSChatMessageActionsProps {text?:string;onRetry?:()=>void;feedback?:'positive'|'negative'|null;onFeedback?:(value:'positive'|'negative'|null)=>void;disabled?:boolean}
export function DSChatMessageActions({text,onRetry,feedback,onFeedback,disabled=false}:DSChatMessageActionsProps){
 const {copy,feedback:copyFeedback}=useAICopy()
 return <div className="ai-message-actions" role="group" aria-label="消息操作">
  {text!==undefined&&<DSButton size="sm" variant="tertiary" icon={<DSIcon name="copy" decorative size="sm"/>} aria-label="复制回复" disabled={disabled} onClick={()=>void copy(text)}/>}
  {onRetry&&<DSButton size="sm" variant="tertiary" icon={<DSIcon name="refresh" decorative size="sm"/>} aria-label="重新生成" disabled={disabled} onClick={onRetry}/>}
  {onFeedback&&<><DSButton size="sm" variant="tertiary" aria-pressed={feedback==='positive'} disabled={disabled} onClick={()=>onFeedback(feedback==='positive'?null:'positive')}>有帮助</DSButton><DSButton size="sm" variant="tertiary" aria-pressed={feedback==='negative'} disabled={disabled} onClick={()=>onFeedback(feedback==='negative'?null:'negative')}>需改进</DSButton></>}
  {copyFeedback&&<span className="ai-action-feedback" role="status">{copyFeedback}</span>}
 </div>
}
export interface DSChatMessageProps {role:'user'|'assistant';content:string;name?:string;status?:'ready'|'streaming'|'error'|'stopped';error?:string;sources?:AISource[];attachments?:DSChatAttachmentProps[];actions?:ReactNode;children?:ReactNode;onRetry?:()=>void}
export function DSChatMessage({role,content,name,status='ready',error,sources,attachments,actions,children,onRetry}:DSChatMessageProps){
 return <article className={`ai-message ai-message--${role}`} aria-label={`${name??(role==='assistant'?'助手':'用户')}消息`} data-status={status}>
  {role==='assistant'&&<div className="ai-avatar" aria-hidden="true">AI</div>}
  <div className="ai-message-body">{name&&<div className="ai-message-name">{name}</div>}{children}
   <div className="ai-message-content">{content?<DSMarkdown content={content} streaming={status==='streaming'}/>:status==='streaming'?<DSChatLoader/>:null}</div>
   {attachments?.length? <div className="ai-attachments">{attachments.map((attachment,index)=><DSChatAttachment key={index} {...attachment}/>)}</div>:null}
   {sources?.length?<DSChatSource sources={sources} collapsible/>:null}
   {status==='error'&&<div className="ai-error" role="alert">{error||'回复生成失败，已保留现有内容。'}{onRetry&&<DSButton variant="tertiary" size="sm" onClick={onRetry}>重试</DSButton>}</div>}
   {status==='stopped'&&<p className="ai-muted">已停止生成</p>}
   {actions}
  </div>
 </article>
}
export interface DSChatConversationProps {children:ReactNode;label?:string;streaming?:boolean;height?:number;emptyState?:ReactNode}
export function DSChatConversation({children,label='对话记录',streaming=false,height=360,emptyState}:DSChatConversationProps){
 const viewport=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null),follow=useRef(true)
 const [atBottom,setAtBottom]=useState(true)
 const track=()=>{const e=viewport.current;if(!e)return;const next=e.scrollHeight-e.clientHeight-e.scrollTop<=40;follow.current=next;setAtBottom(next)}
 const bottom=()=>{const e=viewport.current;if(e){e.scrollTop=e.scrollHeight;follow.current=true;setAtBottom(true)}}
 useLayoutEffect(()=>{if(follow.current)bottom()},[children])
 useLayoutEffect(()=>{const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(()=>{if(follow.current)bottom()});if(content.current)observer?.observe(content.current);return()=>observer?.disconnect()},[])
 return <div className="ai-conversation"><div className="ai-conversation-viewport" ref={viewport} style={{height}} role="log" aria-label={label} aria-live="polite" aria-busy={streaming||undefined} onScroll={track} tabIndex={0}><div className="ai-conversation-content" ref={content}>{Children.toArray(children).some(child=>child!=='')?children:emptyState}</div></div>
  {!atBottom&&<DSButton className="ai-conversation-jump" size="sm" variant="secondary" icon={<DSIcon name="chevron-down" decorative size="sm"/>} onClick={bottom}>回到最新消息</DSButton>}
 </div>
}
export interface AIChatThread {id:string;title:string;preview?:string;time?:string;unread?:number;disabled?:boolean}
export interface DSChatListViewProps {items:AIChatThread[];selectedId?:string;onSelect:(id:string)=>void;compact?:boolean;emptyText?:string}
export function DSChatListView({items,selectedId,onSelect,compact=false,emptyText='暂无会话'}:DSChatListViewProps){
 return <nav className="ai-thread-list" aria-label="会话列表" data-compact={compact||undefined}>{items.length?<ul>{items.map(item=><li key={item.id}><button type="button" disabled={item.disabled} aria-current={selectedId===item.id?'page':undefined} onClick={()=>onSelect(item.id)}><span className="ai-thread-copy"><strong>{item.title}</strong>{!compact&&item.preview&&<small>{item.preview}</small>}</span><span className="ai-thread-meta">{item.time}{!!item.unread&&<span className="ai-thread-unread" aria-label={`${item.unread} 条未读`}>{item.unread}</span>}</span></button></li>)}</ul>:<p className="ai-muted">{emptyText}</p>}</nav>
}
export interface AIPromptSuggestion {id:string;title:string;prompt?:string;description?:string;disabled?:boolean}
export interface DSPromptSuggestionProps {items:AIPromptSuggestion[];onSelect:(prompt:string)=>void;layout?:'chips'|'cards';disabled?:boolean}
export function DSPromptSuggestion({items,onSelect,layout='chips',disabled=false}:DSPromptSuggestionProps){return <div className={`ai-suggestions ai-suggestions--${layout}`} role="group" aria-label="建议问题">{items.map(item=><button type="button" key={item.id} disabled={disabled||item.disabled} onClick={()=>onSelect(item.prompt??item.title)}><strong>{item.title}</strong>{layout==='cards'&&item.description&&<span>{item.description}</span>}</button>)}</div>}
