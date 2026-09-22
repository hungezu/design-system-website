import {useEffect,useRef,useState} from 'react'
import * as DS from '../runtime'
import type {AIActivityState,AIRunState} from '../design-system/primitives/AI'
const sampleMarkdown='## 设计检查建议\n\n先确认 **信息层级**，再核对间距和状态。\n\n- 保留统一的组件语义\n- 检查键盘操作与错误恢复\n\n使用 `spacing-16` 组织相关内容。\n\n```tsx\n<DSButton variant="primary">保存</DSButton>\n```'
const sampleSources=[{id:'s1',title:'组件使用规范',href:'/components',description:'本地组件目录与使用说明。'},{id:'s2',title:'设计基础',href:'/assets',description:'本地变量与颜色基础。'}]
const suggestions=[{id:'summary',title:'总结这份文档',description:'提取重点、风险与下一步。'},{id:'review',title:'检查页面设计',description:'从层级、间距与状态开始。'},{id:'code',title:'解释这段代码',description:'说明结构和输入输出。'}]
const initialThreads=[{id:'one',title:'项目规范整理',preview:'整理组件状态与使用规则',time:'今天',unread:2},{id:'two',title:'页面交互检查',preview:'检查筛选、分页和错误恢复',time:'昨天'},{id:'three',title:'交付文档讨论',preview:'补充设计 MD 与接入示例',time:'周一'}]
export function AIExample({id,variant='default'}:{id:string;variant?:string}){
 const [value,setValue]=useState(''),[feedback,setFeedback]=useState<'positive'|'negative'|null>(null),[thread,setThread]=useState('one'),[removed,setRemoved]=useState(false)
 const [files,setFiles]=useState<File[]>([]),[done,setDone]=useState(false),[result,setResult]=useState('')
 const [toolState,setToolState]=useState<AIActivityState|null>(null)
 const note=<p className="ai-example-note">本地交互示例，不会调用模型或上传文件。</p>
 let content:React.ReactNode
 switch(id){
 case 'chain-of-thought':content=<><DS.DSChainOfThought title={variant==='streaming'&&!done?'正在整理任务（示例）':variant==='error'?'部分步骤未完成':'任务处理记录（示例）'} streaming={variant==='streaming'&&!done} defaultExpanded={variant!=='collapsed'} steps={[{id:'read',title:'读取输入',description:'已接收需求摘要与页面范围。',status:'success'},{id:'check',title:'检查组件约定',description:variant==='error'?'示例数据读取失败，请补充输入。':'核对组件状态、布局与变量。',status:variant==='error'?'error':variant==='streaming'&&!done?'running':'success',children:variant==='nested'?[{id:'tokens',title:'变量映射',description:'检查正文、操作和反馈的语义变量。',status:'success'},{id:'states',title:'交互状态',description:'检查加载、空数据与恢复入口。',status:'success'}]:undefined}]}/>{variant==='streaming'&&!done&&<DS.DSButton size="sm" onClick={()=>setDone(true)}>完成模拟任务</DS.DSButton>}</>;break
 case 'chat-attachment':content=removed?<DS.DSButton onClick={()=>setRemoved(false)}>恢复示例附件</DS.DSButton>:<DS.DSChatAttachment name={variant==='long'?'产品设计规范与交付记录_包含长文件名称的示例版本.pdf':'设计说明.pdf'} size={824120} type="application/pdf" status={variant==='uploading'&&!done?'uploading':variant==='error'&&!done?'error':'ready'} progress={48} error={variant==='error'&&!done?'网络中断，请重试。':undefined} onRetry={variant==='error'?()=>setDone(true):undefined} onRemove={variant==='removable'?()=>setRemoved(true):undefined}/>;break
 case 'chat-conversation':content=<AIChatDemo empty={variant==='empty'} long={variant==='long'} initialStreaming={variant==='streaming'} composer={variant==='full-chat'}/>;break
 case 'chat-list-view':content=<DS.DSChatListView compact={variant==='compact'} items={variant==='empty'?[]:initialThreads.map((item,index)=>({...item,disabled:variant==='disabled'&&index===1}))} selectedId={thread} onSelect={setThread}/>;break
 case 'chat-loader':content=<DS.DSChatLoader variant={variant==='default'?'dots':variant as 'pulse'|'spinner'|'skeleton'}/>;break
 case 'chat-message':content=<DS.DSChatMessage role={variant==='user'?'user':'assistant'} name={variant==='user'?'示例用户':'设计助手'} content={variant==='streaming'&&!done?'':variant==='rich'?sampleMarkdown:'可以先从主要操作、信息层级和状态反馈三个方面检查这个页面。'} status={variant==='error'&&!done?'error':variant==='streaming'&&!done?'streaming':variant==='stopped'?'stopped':'ready'} error="示例请求中断，已有内容保留。" onRetry={()=>setDone(true)} sources={variant==='rich'?sampleSources:undefined} actions={variant==='default'?<DS.DSChatMessageActions text="可以先从主要操作、信息层级和状态反馈三个方面检查这个页面。"/>:undefined}/>;break
 case 'chat-message-actions':content=<><DS.DSChatMessageActions text="这是一段用于复制的示例回复。" onRetry={variant==='minimal'?undefined:()=>setResult('已重新生成示例回复。')} feedback={feedback} onFeedback={variant==='minimal'?undefined:setFeedback} disabled={variant==='disabled'}/>{result&&<p role="status">{result}</p>}</>;break
 case 'chat-source':content=<DS.DSChatSource collapsible={variant==='grouped'} sources={variant==='document'?[{id:'doc',title:'设计说明.pdf',type:'document',description:'已选择的本地文档（示例）',onOpen:()=>setResult('示例文档预览，不读取实际文件。')}]:sampleSources.map((source,index)=>({...source,title:variant==='long'&&index===0?'跨项目设计规范、组件行为与完整交付检查说明文档':source.title}))}/>;break
 case 'chat-tool':{const state=toolState??(variant==='running'?'running':variant==='error'?'error':variant==='approval'?'approval':variant==='rejected'?'cancelled':'success');content=<DS.DSChatTool name="检索项目规范（示例）" state={state} input={{query:'分页与表格规范',scope:'当前项目'}} output={state==='success'?{matches:3,source:'本地演示数据'}:undefined} error="读取示例数据失败，实际项目未受影响。" defaultExpanded={variant!=='default'} onApprove={()=>setToolState('success')} onReject={()=>setToolState('cancelled')}/>;break}
 case 'code-block':content=<DS.DSCodeBlock language={variant==='json'?'json':variant==='plain'?'plaintext':'typescript'} code={variant==='json'?JSON.stringify({name:'示例组件',status:'ready'},null,2):variant==='plain'?'这是一段纯文本内容，复制后保持原样。':variant==='long'?'const description = "'+ '这是一段长代码内容。'.repeat(30)+'";':'const message: string = "Hello";\nconsole.log(message);'}/>;break
 case 'markdown':content=<DS.DSMarkdown streaming={variant==='streaming'} content={variant==='table'?'| 检查项 | 状态 |\n| --- | --- |\n| 字号 | 已确认 |\n| 分页 | 已确认 |':variant==='streaming'?'正在整理 **关键结论\n\n```ts\nconst result =':variant==='unsafe'?'普通文本仍会显示。\n\n<script>alert("不会执行")</script>\n\n[无效链接](javascript:alert(1))':sampleMarkdown}/>;break
 case 'prompt-input':content=<><DS.DSPromptInput value={value} onChange={setValue} layout={variant==='inline'?'inline':variant==='compact'?'compact':'stacked'} disabled={variant==='disabled'} status={variant==='streaming'&&!done?'streaming':'ready'} onStop={()=>{setDone(true);setResult('模拟生成已停止。')}} onSubmit={async text=>{if(variant==='error'&&!done){setDone(true);throw new Error('模拟发送失败，输入已保留，可再次发送。')}setResult(`已提交本地示例：${text||'附件'}`)}} files={files} onFilesChange={variant==='attachments'?setFiles:undefined} error={variant==='error'&&!done?'演示一次失败，重试可恢复。':undefined} footer="Enter 发送，Shift+Enter 换行"/>{result&&<p role="status">{result}</p>}</>;break
 case 'prompt-suggestion':content=<><DS.DSPromptSuggestion items={suggestions} onSelect={setValue} layout={variant==='cards'?'cards':'chips'} disabled={variant==='disabled'}/><DS.DSInput label="待发送问题" value={value} onChange={setValue}/></>;break
 case 'text-shimmer':content=<DS.DSTextShimmer active={variant!=='inactive'}>正在整理回复</DS.DSTextShimmer>;break
 default:return null
 }
 return <div className={`ai-example ai-example--${id}`}>{content}{id==='chat-source'&&result&&<p role="status">{result}</p>}{note}</div>
}
interface DemoMessage {id:string;role:'user'|'assistant';content:string;status?:'ready'|'streaming'|'error'|'stopped'}
export function AIChatDemo({empty=false,long=false,initialStreaming=false,composer=true}:{empty?:boolean;long?:boolean;initialStreaming?:boolean;composer?:boolean}){
 const [value,setValue]=useState(''),[files,setFiles]=useState<File[]>([]),[status,setStatus]=useState<AIRunState>(initialStreaming?'streaming':'ready')
 const [messages,setMessages]=useState<DemoMessage[]>(()=>empty?[]:long?Array.from({length:16},(_,index)=>({id:String(index),role:index%2?'assistant':'user',content:index%2?'这是历史回复，用来验证阅读时不会被强制拉回底部。':'请检查这个页面的交互。'})):[{id:'a',role:'assistant',content:initialStreaming?'':'你好，可以从检查设计规范或整理文档开始。',status:initialStreaming?'streaming':'ready'}])
 const timer=useRef<ReturnType<typeof setInterval>|null>(null),sequence=useRef(0),lastPrompt=useRef('')
 useEffect(()=>()=>{if(timer.current)clearInterval(timer.current)},[])
 const stop=()=>{if(timer.current)clearInterval(timer.current);sequence.current++;setStatus('ready');setMessages(items=>items.map((item,index)=>index===items.length-1&&item.role==='assistant'?{...item,status:'stopped'}:item))}
 const submit=(prompt:string,_files:File[],retry=false)=>{
  if(timer.current)clearInterval(timer.current)
  const run=++sequence.current;lastPrompt.current=prompt
  const id=`reply-${run}`,response=`已收到你的问题。\n\n这是本地组件演示的流式回复，不代表实际模型分析。\n\n- 可验证发送、停止和复制\n- 阅读历史消息时保持滚动位置\n- 使用当前项目的字体与颜色变量`
  setMessages(items=>retry?[...items.slice(0,-1),{id,role:'assistant',content:'',status:'streaming'}]:[...items,{id:`user-${run}`,role:'user',content:prompt||`已选择 ${_files.length} 个附件（本地演示）`},{id,role:'assistant',content:'',status:'streaming'}]);setStatus('streaming')
  let length=0;timer.current=setInterval(()=>{if(sequence.current!==run)return;length+=8;const finished=length>=response.length;setMessages(items=>items.map(item=>item.id===id?{...item,content:response.slice(0,length),status:finished?'ready':'streaming'}:item));if(finished){if(timer.current)clearInterval(timer.current);timer.current=null;setStatus('ready')}},50)
 }
 return <div className="ai-chat-demo"><DS.DSChatConversation height={composer?330:300} streaming={status==='streaming'} emptyState={<div className="ai-chat-empty"><h3>开始一段对话</h3><p>选择建议或输入你的问题。</p></div>}>
  {messages.length?messages.map((item,index)=><DS.DSChatMessage key={item.id} role={item.role} content={item.content} status={item.status} name={item.role==='assistant'?'设计助手':undefined} actions={item.role==='assistant'&&item.status!=='streaming'?<DS.DSChatMessageActions text={item.content} onRetry={index===messages.length-1&&lastPrompt.current?()=>submit(lastPrompt.current,[],true):undefined}/>:undefined}/>):null}
 </DS.DSChatConversation>{composer&&<><DS.DSPromptSuggestion items={suggestions.slice(0,2)} onSelect={setValue} disabled={status==='streaming'}/><DS.DSPromptInput value={value} onChange={setValue} onSubmit={submit} files={files} onFilesChange={setFiles} status={status} onStop={stop}/></>}</div>
}
