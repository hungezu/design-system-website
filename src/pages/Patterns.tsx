import { ArrowRight, Filter, FormInput, Layers3, LoaderCircle, LockKeyhole, PanelRight, Rows3, Search, Trash2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useProject } from '../app/project-context'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { patternAssets } from '../data/assets/patterns'

const patternIcons = [Search, Filter, Rows3, Layers3, FormInput, Trash2, PanelRight, Rows3, LoaderCircle, Layers3, LockKeyhole]

export function Patterns() {
  const { projectId } = useParams()
  const { project } = useProject()
  const base = projectId ? `/projects/${project.id}/patterns` : '/patterns'
  return <div className="page patterns-page">
    <PageHeader title={projectId ? '项目交互模式' : '交互模式'} description={projectId ? '复用公共交互模式，并在示例中应用当前项目主题。' : '交互模式不是单个组件，而是多个组件、状态和规则共同解决一个复杂 B 端任务。'} />
    <div className="pattern-definition"><strong>模式不是组件</strong><span>组件提供能力，模式定义这些能力在真实任务中的组合顺序与状态闭环。</span></div>
    <div className="pattern-list">{patternAssets.map((pattern, index) => {
      const Icon = patternIcons[index] ?? Layers3
      return <Link to={`${base}/${pattern.id}`} key={pattern.id}><span className="pattern-list__index">{String(index + 1).padStart(2, '0')}</span><span className="pattern-list__icon"><Icon size={19} strokeWidth={1.7} /></span><span className="pattern-list__copy"><strong>{pattern.name}</strong><small>{pattern.description}</small></span><span className="pattern-list__components">{pattern.tags?.slice(0, 2).map((tag) => <Badge key={tag}>{tag}</Badge>)}</span><ArrowRight size={17} /></Link>
    })}</div>
  </div>
}
