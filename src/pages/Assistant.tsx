import { ArrowRight, Bot, Check, Component, LayoutTemplate, Search, Sparkles, WandSparkles } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useProject } from '../app/project-context'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { getPlatform } from '../data/platforms'
import { addRecommendationToDraft, demoPrompts, getDemoRecommendation, type AssistantRecommendation } from '../services/demo-assistant'

const taskTypes = [
  { icon: Search, title: '分析已有界面', description: '梳理页面结构、组件和潜在问题。' },
  { icon: Component, title: '寻找合适组件', description: '根据任务语义匹配已有设计资产。' },
  { icon: Sparkles, title: '推荐设计模式', description: '组合规则、状态和反馈方式。' },
  { icon: LayoutTemplate, title: '生成页面结构', description: '基于页面模板形成初步信息架构。' },
]

export function Assistant() {
  const { project } = useProject()
  const platform = getPlatform(project.platform)
  const [input, setInput] = useState(demoPrompts[0])
  const [recommendation, setRecommendation] = useState<AssistantRecommendation | null>(null)
  const [added, setAdded] = useState(false)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!input.trim()) return
    setRecommendation(getDemoRecommendation(input, project, platform))
    setAdded(false)
  }

  return (
    <div className="page assistant-page">
      <PageHeader title="AI 助手" description="从设计任务进入资产与模式，不从空白聊天开始。" actions={<Badge>本地规则演示</Badge>} />
      <section className="task-type-list" aria-label="设计任务类型">
        {taskTypes.map(({ icon: Icon, title, description }) => (
          <button key={title} onClick={() => setInput(title === '推荐设计模式' ? demoPrompts[0] : description)}>
            <Icon size={20} strokeWidth={1.6} /><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={16} />
          </button>
        ))}
      </section>

      <section className="assistant-workbench">
        <div className="assistant-input-panel">
          <div className="assistant-panel-title"><Bot size={18} /><h2>描述你的设计任务</h2></div>
          <form onSubmit={submit}>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} aria-label="设计任务描述" />
            <div className="assistant-form-footer"><span>结果基于当前本地规则与 {project.name} 项目上下文</span><button className="primary-action" type="submit"><WandSparkles size={16} />生成建议</button></div>
          </form>
          <div className="prompt-examples"><span>试试：</span>{demoPrompts.map((prompt) => <button key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>)}</div>
        </div>

        <div className={`assistant-result ${recommendation ? 'assistant-result--ready' : ''}`}>
          {recommendation ? (
            <>
              <div className="assistant-result__header"><div><Badge tone="brand">推荐结果</Badge><h2>{recommendation.pattern}</h2></div><span>Demo</span></div>
              <p className="assistant-reasoning">{recommendation.reasoning}</p>
              <div className="recommendation-assets"><h3>推荐资产</h3>{recommendation.assets.map((asset, index) => <div key={asset}><span>0{index + 1}</span><strong>{asset}</strong><Check size={16} /></div>)}</div>
              <div className="context-rule-list"><h3>命中的项目上下文</h3>{recommendation.contextRules.map((rule) => <p key={rule}>{rule}</p>)}</div>
              <button className={added ? 'secondary-action is-success' : 'primary-action'} onClick={() => { addRecommendationToDraft(project.id, recommendation); setAdded(true) }}>{added ? <><Check size={16} />已保存到本地项目草稿</> : '加入当前项目'}</button>
            </>
          ) : (
            <div className="assistant-empty"><WandSparkles size={28} /><h2>建议会出现在这里</h2><p>输入一个具体任务，系统会组合设计模式、组件和状态规则。</p></div>
          )}
        </div>
      </section>
    </div>
  )
}
