import {useRef,useState} from 'react'
export type AIRunState='ready'|'submitted'|'streaming'|'error'
export type AIActivityState='pending'|'running'|'success'|'error'|'approval'|'cancelled'
export const activityLabels:Record<AIActivityState,string>={pending:'等待中',running:'执行中',success:'已完成',error:'失败',approval:'待确认',cancelled:'已取消'}
export function safeAIUrl(value?:string):string|undefined {
 if(!value)return undefined
 const trimmed=value.trim()
 if(/^(https?:|mailto:)/i.test(trimmed)||/^(\/(?!\/)|#|\.\.?\/)/.test(trimmed))return trimmed
 return undefined
}
export function readableJSON(value:unknown){if(typeof value==='string')return value;try{return JSON.stringify(value,null,2)??''}catch{return '该内容无法序列化为 JSON。'}}
export function useAICopy(){
 const [feedback,setFeedback]=useState('');const sequence=useRef(0)
 const copy=async(text:string)=>{const run=++sequence.current;setFeedback('');try{await navigator.clipboard.writeText(text);if(run===sequence.current)setFeedback('已复制')}catch{if(run===sequence.current)setFeedback('复制失败，请手动选择内容。')}}
 return {copy,feedback}
}
export function formatAIFileSize(size?:number){if(size===undefined)return '';if(size<1024)return `${size} B`;if(size<1024**2)return `${(size/1024).toFixed(1)} KB`;return `${(size/1024**2).toFixed(1)} MB`}
