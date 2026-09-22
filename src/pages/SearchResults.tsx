import { Search, X } from 'lucide-react'
import { FormEvent, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { semanticTokens } from '../data/global/semantic-tokens'
import { COMPONENT_CATALOG } from '../design-system/component-catalog'
import { componentAssets } from '../data/assets/components'
import { patternAssets } from '../data/assets/patterns'
import { templateAssets } from '../data/assets/templates'
import { contextualAssetDestination } from '../services/asset-navigation'
import { getProject } from '../data/projects'
import { useAccess } from '../app/access-context'

interface SearchItem { id: string; name: string; description: string; type: string; to: string; aliases: string[] }
const componentAliases: Record<string, string[]> = { input: ['输入框', '文本输入'], select: ['选择器', '下拉选择'], dialog: ['弹窗', '对话框'], drawer: ['抽屉', '侧边面板'], table: ['表格', '数据列表'], button: ['按钮', '操作'] }

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase())
  if (!query || index < 0) return text
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + query.length)}</mark>{text.slice(index + query.length)}</>
}

export function SearchResults() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const scope = params.get('scope') ?? 'all'
  const requestedProjectId = params.get('project') ?? ''
  const version = params.get('version') ?? 'draft'
  const { visibleProjectIds } = useAccess()
  const scopedProject = visibleProjectIds.includes(requestedProjectId) ? getProject(requestedProjectId) : undefined
  const space = params.get('space') === 'project' && scopedProject ? 'project' : 'public'
  const [input, setInput] = useState(query)
  const items = useMemo<SearchItem[]>(() => [
    ...semanticTokens.map((item) => ({ id: item.id, name: item.name, description: item.description, type: '设计基础', to: contextualAssetDestination({ type: 'token', id: item.id }, space === 'project' ? scopedProject?.id : undefined, version), aliases: [item.id, item.group] })),
    ...COMPONENT_CATALOG.map((item) => { const asset = componentAssets.find((entry) => entry.id === item.componentId || entry.id === `component-${item.componentId}`); return { id: item.componentId, name: asset?.name ?? `${item.runtimeExport.replace(/^DS/, '')} 组件`, description: asset?.description ?? `${item.group}组件`, type: '组件', to: contextualAssetDestination({ type: 'component', id: item.componentId }, space === 'project' ? scopedProject?.id : undefined, version), aliases: [item.runtimeExport, item.componentId, item.group, ...(componentAliases[item.componentId] ?? []), ...(asset?.tags ?? [])] } }),
    ...patternAssets.map((item) => ({ id: item.id, name: item.name, description: item.description, type: '交互模式', to: contextualAssetDestination(item, space === 'project' ? scopedProject?.id : undefined, version), aliases: item.tags ?? [] })),
    ...templateAssets.slice(0, 3).map((item) => ({ id: item.id, name: item.name, description: item.description, type: '页面模板', to: contextualAssetDestination(item, space === 'project' ? scopedProject?.id : undefined, version), aliases: item.tags ?? [] })),
  ], [scopedProject?.id, space, version])
  const matches = items.filter((item) => (scope === 'all' || item.type === scope) && `${item.name} ${item.description} ${item.id} ${item.aliases.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  const submit = (event: FormEvent) => { event.preventDefault(); const next = new URLSearchParams(params); if (input.trim()) next.set('q', input.trim()); else next.delete('q'); setParams(next) }
  const updateScope = (value: string) => { const next = new URLSearchParams(params); if (value === 'all') next.delete('scope'); else next.set('scope', value); setParams(next) }
  const updateSpace = (value: 'public' | 'project') => { const next = new URLSearchParams(params); next.set('space', value); setParams(next) }
  return <div className="page search-page"><PageHeader title="全站搜索" description="搜索设计基础、组件、交互模式和页面模板。" /><form className="asset-search" onSubmit={submit}><Search size={20} /><input aria-label="搜索关键词" value={input} onChange={(event) => setInput(event.target.value)} placeholder="输入中文名称、英文名称或标识" />{input && <button type="button" className="text-action" onClick={() => { const next = new URLSearchParams(params); next.delete('q'); setInput(''); setParams(next) }}><X size={15} />清除</button>}</form>{scopedProject && <div className="category-filter" aria-label="资源空间"><button aria-pressed={space === 'public'} onClick={() => updateSpace('public')}>团队公共资源</button><button aria-pressed={space === 'project'} onClick={() => updateSpace('project')}>{scopedProject.shortName}项目资源 · {version === 'draft' ? '草稿' : `v${version}`}</button></div>}<div className="category-filter" aria-label="资源类型">{['all', '设计基础', '组件', '交互模式', '页面模板'].map((item) => <button key={item} aria-pressed={scope === item} onClick={() => updateScope(item)}>{item === 'all' ? '全部' : item}</button>)}</div><p className="search-result-count">{space === 'project' && scopedProject ? `${scopedProject.shortName}项目 · ${version === 'draft' ? '当前草稿' : `v${version}`} · ` : '团队公共资源 · '}找到 {matches.length} 项结果</p>{matches.length ? <div className="search-results">{matches.map((item) => <Link to={item.to} key={`${item.type}-${item.id}`}><span>{item.type}</span><strong><Highlight text={item.name} query={query} /></strong><p><Highlight text={item.description} query={query} /></p></Link>)}</div> : <div className="empty-state"><Search size={28} /><h2>没有找到匹配内容</h2><p>可尝试“输入框 / Input”“弹窗 / Dialog”等中文或英文关键词。</p></div>}</div>
}
