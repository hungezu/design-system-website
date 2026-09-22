import {memo,type ReactNode} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import {DSButton} from '../Button'
import {DSIcon} from '../../../runtime/vendor/runtime.js'
import {safeAIUrl,useAICopy} from './shared'
for(const [name,language] of Object.entries({javascript,typescript,json,css,xml,python,bash}))hljs.registerLanguage(name,language)
export interface DSCodeBlockProps {code:string;language?:string;title?:string;copyable?:boolean}
export const DSCodeBlock=memo(function DSCodeBlock({code,language='plaintext',title,copyable=true}:DSCodeBlockProps){
 const {copy,feedback}=useAICopy()
 const known=hljs.getLanguage(language)
 const markup=known?hljs.highlight(code,{language,ignoreIllegals:true}).value:null
 return <section className="ai-code-block" aria-label={title??`${language} 代码`}>
  <header><span>{title??language}</span>{copyable&&<DSButton size="sm" variant="tertiary" aria-label="复制代码" icon={<DSIcon name="copy" decorative size="sm"/>} onClick={()=>void copy(code)}/>}</header>
  <pre tabIndex={0}>{markup?<code className="hljs" dangerouslySetInnerHTML={{__html:markup}}/>:<code>{code}</code>}</pre>
  {feedback&&<span className="ai-action-feedback" role="status">{feedback}</span>}
 </section>
})
export interface DSMarkdownProps {content:string;streaming?:boolean;className?:string}
export const DSMarkdown=memo(function DSMarkdown({content,streaming=false,className=''}:DSMarkdownProps){
 return <div className={`ai-markdown ${className}`} data-streaming={streaming||undefined}>
  <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml urlTransform={url=>safeAIUrl(url)??''} components={{
   pre:({children})=><div className="ai-markdown-code">{children}</div>,
   code:({className,children})=>{const language=/language-([^\s]+)/.exec(className??'')?.[1],code=String(children??'');return language||code.includes('\n')?<DSCodeBlock code={code.replace(/\n$/,'')} language={language}/>:<code>{children}</code>},
   a:({href,children})=>safeAIUrl(href)?<a href={safeAIUrl(href)} target="_blank" rel="noopener noreferrer">{children}</a>:<span>{children}</span>,
   img:({alt,src})=>safeAIUrl(typeof src==='string'?src:undefined)?<a href={safeAIUrl(String(src))} target="_blank" rel="noopener noreferrer">{alt||'查看图片'}</a>:<span>{alt}</span>,
   table:({children})=><div className="ai-markdown-table"><table>{children}</table></div>,
  }}>{content}</ReactMarkdown>
 </div>
})
export interface DSTextShimmerProps {children:ReactNode;active?:boolean}
export function DSTextShimmer({children,active=true}:DSTextShimmerProps){return <span className="ai-text-shimmer" data-active={active||undefined}>{children}</span>}
export interface DSChatLoaderProps {variant?:'dots'|'pulse'|'spinner'|'skeleton';label?:string}
export function DSChatLoader({variant='dots',label='正在生成回复'}:DSChatLoaderProps){
 return <div className={`ai-chat-loader ai-chat-loader--${variant}`} role="status" aria-label={label}>
  {variant==='skeleton'?<span className="ai-loader-lines" aria-hidden="true"><i/><i/><i/></span>:variant==='spinner'?<span className="ai-loader-spinner" aria-hidden="true"/>:<span className="ai-loader-dots" aria-hidden="true"><i/><i/><i/></span>}
  <span className="ai-loader-label">{label}</span>
 </div>
}
