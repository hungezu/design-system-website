import {AIExpandable} from './Expandable'
import {useRef,useState,type ReactNode} from 'react'
import {DSButton} from '../Button'
import {DSIcon} from '../../../runtime/vendor/runtime.js'
import {DSCodeBlock,DSTextShimmer} from './Content'
import {activityLabels,readableJSON,type AIActivityState} from './shared'
export interface AITraceStep {id:string;title:string;description?:ReactNode;status?:AIActivityState;children?:AITraceStep[]}
export interface DSChainOfThoughtProps {title:string;steps:AITraceStep[];streaming?:boolean;expanded?:boolean;defaultExpanded?:boolean;onExpandedChange?:(value:boolean)=>void}
function TraceSteps({steps}:{steps:AITraceStep[]}){return <ol className="ai-trace-steps">{steps.map(step=><li key={step.id} data-state={step.status??'success'}><div className="ai-trace-step-heading"><span className="ai-trace-dot" aria-hidden="true"/><strong>{step.title}</strong><small>{activityLabels[step.status??'success']}</small></div>{step.description&&<div className="ai-trace-description">{step.description}</div>}{step.children&&<TraceSteps steps={step.children}/>}</li>)}</ol>}
export function DSChainOfThought({title,steps,streaming=false,...props}:DSChainOfThoughtProps){return <AIExpandable {...props} className="ai-chain" title={<DSTextShimmer active={streaming}>{title}</DSTextShimmer>}><TraceSteps steps={steps}/></AIExpandable>}
export interface DSChatToolProps {name:string;state:AIActivityState;input?:unknown;output?:unknown;error?:string;expanded?:boolean;defaultExpanded?:boolean;onExpandedChange?:(value:boolean)=>void;onApprove?:()=>void|Promise<void>;onReject?:()=>void|Promise<void>}
export function DSChatTool({name,state,input,output,error,expanded,defaultExpanded,onExpandedChange,onApprove,onReject}:DSChatToolProps){
 const lock=useRef(false)
 const [pending,setPending]=useState(false),[decision,setDecision]=useState(''),[failure,setFailure]=useState('')
 const decide=async(approve:boolean)=>{if(lock.current||pending||decision)return;lock.current=true;setPending(true);setFailure('');try{await (approve?onApprove?.():onReject?.());setDecision(approve?'已确认，等待处理。':'已拒绝。')}catch(err){setFailure(err instanceof Error?err.message:'操作失败，请重试。')}finally{lock.current=false;setPending(false)}}
 return <div className="ai-tool" data-state={state}><AIExpandable expanded={expanded} defaultExpanded={defaultExpanded??(state==='error'||state==='approval')} onExpandedChange={onExpandedChange}
  title={<><DSIcon name={state==='cancelled'?'close':state==='error'?'error':state==='success'?'success':state==='approval'?'warning':state==='running'?'loading':'clock'} decorative size="sm"/><span>{name}</span><small>{activityLabels[state]}</small></>}>
  {input!==undefined&&<DSCodeBlock code={readableJSON(input)} language={typeof input==='object'?'json':'plaintext'} title="输入"/>}
  {output!==undefined&&<DSCodeBlock code={readableJSON(output)} language={typeof output==='object'?'json':'plaintext'} title="结果"/>}
  {state==='error'&&<p className="ai-error" role="alert">{error||'工具执行失败。'}</p>}
  {state==='approval'&&<div className="ai-tool-approval"><p>执行前需要确认。</p><div className="ai-inline-actions">{onApprove&&<DSButton size="sm" variant="primary" disabled={pending||!!decision} onClick={()=>void decide(true)}>确认执行</DSButton>}{onReject&&<DSButton size="sm" variant="secondary" disabled={pending||!!decision} onClick={()=>void decide(false)}>拒绝</DSButton>}</div>{decision&&<p role="status">{decision}</p>}{failure&&<p role="alert" className="ai-error">{failure}</p>}</div>}
 </AIExpandable></div>
}
