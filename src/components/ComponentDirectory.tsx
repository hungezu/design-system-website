import { Link } from 'react-router-dom'
import { componentAssets } from '../data/assets/components'
import { assetDestination } from '../services/asset-navigation'
import { useState } from 'react'
import { DESKTOP_COMPONENT_BINDINGS } from '../design-system/component-bindings'
import * as runtime from '../runtime'

const sourceMigrated = new Set(['input', 'textarea', 'checkbox', 'checkbox-group', 'radio', 'switch', 'form', 'field', 'tabs'])
const categories = { form: '表单与选择', data: '数据展示', navigation: '导航', feedback: '反馈与浮层', layout: '布局及扩展', media: '文件与媒体' }

/** Availability is checked against actual exports; migration is a separate claim. */
export function ComponentDirectory() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [selected, setSelected] = useState<string | null>(null)
  const filtered = DESKTOP_COMPONENT_BINDINGS.filter(item =>
    (category === 'all' || item.category === category) &&
    `${item.componentId} ${item.runtimeExport}`.toLowerCase().includes(query.toLowerCase().trim()))
  const detail = DESKTOP_COMPONENT_BINDINGS.find(item => item.componentId === selected)
  const available = (name: string) => Object.hasOwn(runtime, name)
  return <section className="component-binding-directory" aria-label="电脑端组件目录">
    <h2>电脑端组件目录</h2>
    <p>目录包含规划项。已有 Runtime 导出不等于源码迁移完成，也不等于绑定已验证。</p>
    <label>搜索组件<input value={query} onChange={event => setQuery(event.target.value)} placeholder="例如 Input、Dialog" /></label>
    <nav aria-label="组件分类" className="directory-categories">
      {Object.entries({ all: '全部', ...categories }).map(([key, label]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => { setCategory(key); setSelected(null) }}>{label}</button>)}
    </nav>
    <p role="status">显示 {filtered.length} / {DESKTOP_COMPONENT_BINDINGS.length} 项</p>
    <div className="component-binding-grid">{filtered.map(item => <article key={item.componentId}>
      <h3>{item.runtimeExport}</h3>
      {componentAssets.filter(asset => asset.id === item.componentId || asset.id === `component-${item.componentId}`).map(asset => <Link key={asset.id} to={assetDestination(asset)}>查看使用文档</Link>)}
      <dl><dt>Runtime</dt><dd>{available(item.runtimeExport) ? '已有导出 · 待完整验收' : '待实现'}</dd>
        <dt>源码迁移</dt><dd>{item.componentId === 'button' ? '已有 Button 源码；DSButton 仍使用兼容包' : sourceMigrated.has(item.componentId) ? '主工程源码已接入 · 待批次验收' : '未确认完成'}</dd>
        <dt>自定义绑定</dt><dd>待端到端验证</dd></dl>
      <button type="button" aria-expanded={selected === item.componentId} onClick={() => setSelected(selected === item.componentId ? null : item.componentId)}>查看绑定规划</button>
      {detail?.componentId === item.componentId && <div><p>规划 Recipe：<code>{detail.recipeId}</code></p><p>目标槽位：{detail.tokenSlots.join('、')}</p><p>目标状态：{detail.states.join('、')}</p><p>这些是迁移目标，尚未作为已发布组件契约。</p></div>}
    </article>)}</div>
    {!filtered.length && <p>没有匹配的组件，请更换关键词或选择全部分类。</p>}
  </section>
}
