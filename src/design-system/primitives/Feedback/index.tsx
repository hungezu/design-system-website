import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ProgressBar } from 'react-aria-components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import { DSDialog } from '../Overlays'
import { DSIconAction } from '../IconAction'
import './Feedback.css'
export type FeedbackTone='info'|'success'|'warning'|'error'
export type FeedbackSize='sm'|'md'|'lg'
export interface DSLoadingProps {label?:string;size?:FeedbackSize}
export function DSLoading({label='加载中',size='md'}:DSLoadingProps){return <ProgressBar isIndeterminate aria-label={label} className={`owned-loading owned-loading--${size}`}><span aria-hidden="true" className="owned-loading__ring"/>{label}</ProgressBar>}
export const DSSpinner=DSLoading
export interface DSEmptyProps{title?:string;description?:string;action?:ReactNode}
export function DSEmpty({title='暂无数据',description,action}:DSEmptyProps){return <div className="owned-empty"><strong>{title}</strong>{description&&<p>{description}</p>}{action}</div>}
export interface DSAlertProps{title:string;children?:ReactNode;tone?:FeedbackTone;onClose?:()=>void}
function FeedbackIcon({tone}:{tone:FeedbackTone}) {
 const name=tone==='success'?'success':tone==='warning'?'warning':tone==='error'?'error':'info'
 return <DSIcon className="owned-feedback-icon" name={name} weight="filled" size="sm" decorative />
}
export function DSAlert({title,children,tone='info',onClose}:DSAlertProps){return <div role={tone==='error'?'alert':'status'} className="owned-alert" data-tone={tone}><FeedbackIcon tone={tone}/><div className="owned-alert__content"><strong>{title}</strong>{children&&<div>{children}</div>}</div>{onClose&&<DSIconAction className="owned-alert__close" semantic="close" compact onPress={onClose} aria-label={`关闭${title}`} />}</div>}
export interface DSTagProps{children:ReactNode;onRemove?:()=>void;disabled?:boolean;label?:string}
export function DSTag({children,onRemove,disabled,label}:DSTagProps){return <span className="owned-tag">{children}{onRemove&&<DSIconAction semantic="remove-item" compact aria-label={`移除${label??'标签'}`} onPress={onRemove} isDisabled={disabled} />}</span>}
export interface DSBadgeProps{children:ReactNode;tone?:FeedbackTone}
export function DSBadge({children,tone='info'}:DSBadgeProps){return <span className="owned-badge" data-tone={tone}>{children}</span>}
export interface DSToastProps{open:boolean;onOpenChange:(open:boolean)=>void;message:string;tone?:FeedbackTone;duration?:number;modal?:boolean}
export function DSToast(props:DSToastProps){
 if(!props.open)return null
 return <VisibleToast key={`${props.message}/${props.duration??5000}/${Boolean(props.modal)}`} {...props}/>
}
/** Each visible notification owns its timer and independent hover/focus pause flags. */
function VisibleToast({onOpenChange,message,tone='info',duration=5000,modal=false}:DSToastProps){
 const [hovered,setHovered]=useState(false)
 const [focused,setFocused]=useState(false)
 const remaining=useRef(duration)
 const paused=hovered||focused
 useEffect(()=>{
  if(paused||duration<=0||modal)return
  const started=Date.now()
  const timer=setTimeout(()=>onOpenChange(false),remaining.current)
  return()=>{clearTimeout(timer);remaining.current=Math.max(0,remaining.current-(Date.now()-started))}
 },[paused,duration,modal,onOpenChange])
 if(modal)return <DSDialog open onOpenChange={onOpenChange} title="通知">{message}</DSDialog>
 return <div className="owned-toast" data-tone={tone} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false)}}><FeedbackIcon tone={tone}/><span role={tone==='error'?'alert':'status'}>{message}</span><DSIconAction semantic="close" compact aria-label="关闭通知" onPress={()=>onOpenChange(false)} /></div>
}
export function DSMessage({title,children,tone='info'}:DSAlertProps){return <div role={tone==='error'?'alert':'status'} className="owned-message" data-tone={tone}><FeedbackIcon tone={tone}/><strong>{title}</strong>{children&&<span>{children}</span>}</div>}
export function DSProgressCircle({label,value=0}:{label:string;value?:number}){const percentage=Math.max(0,Math.min(100,value));return <ProgressBar aria-label={label} value={percentage} className="owned-circle"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="none" stroke="var(--bds-border,var(--border-default))" strokeWidth="4"/><circle cx="20" cy="20" r="16" fill="none" stroke="var(--bds-brand,var(--brand-primary))" strokeWidth="4" pathLength="100" strokeDasharray={`${percentage} 100`} transform="rotate(-90 20 20)"/></svg><span>{percentage}%</span></ProgressBar>}
