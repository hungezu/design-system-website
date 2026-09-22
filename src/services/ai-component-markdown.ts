export function aiComponentMarkdown(packageName:string,mode:'project'|'candidate',rules:unknown,approved:Set<string>):string{
 if(!['DSChatConversation','DSChatMessage','DSPromptInput'].every(name=>approved.has(name)))return ''
 const helper=mode==='project'?'ProjectTheme':'PreviewScope'
 const extra=mode==='project'?'':`import type { CSSProperties } from 'react'\nimport tokens from '${packageName}/tokens.json'\n`
 const open=mode==='project'?'<ProjectTheme>':'<PreviewScope vars={tokens as CSSProperties}>'
 const captured=Array.isArray(rules)?rules.filter((value):value is string=>typeof value==='string').map((value,index)=>`${index+1}. ${value}`).join('\n'):'此版本未冻结 AI 交互规则，请先确认业务状态约定。'
 return `\n## AI 交互组件\n\n${captured}\n\n下面只是受控的展示与输入组合。模型请求、消息存储、工具执行、文件上传和取消信号由宿主实现；请勿用固定回复替代业务处理。\n\n\`\`\`tsx
${extra}import { ${helper}, DSChatConversation, DSChatMessage, DSPromptInput, type AIRunState } from '${packageName}'
import '${packageName}/style.css'

type Message = { id: string; role: 'user' | 'assistant'; content: string; status?: 'ready' | 'streaming' | 'error' | 'stopped' }
type ChatProps = {
  messages: Message[]
  value: string
  onChange: (value: string) => void
  status: AIRunState
  onSend: (text: string, files: File[]) => void | Promise<void>
  onStop: () => void
}
export function ProjectChat({ messages, value, onChange, status, onSend, onStop }: ChatProps) {
  return ${open}<section aria-label="项目助手" style={{ minWidth: 0 }}>
    <DSChatConversation streaming={status === 'streaming'} emptyState={<p>输入问题开始对话。</p>}>
      {messages.length ? messages.map(message => <DSChatMessage key={message.id} role={message.role} content={message.content} status={message.status} />) : null}
    </DSChatConversation>
    <DSPromptInput value={value} onChange={onChange} status={status} onSubmit={onSend} onStop={onStop} />
  </section></${helper}>
}
\`\`\`\n`
}
