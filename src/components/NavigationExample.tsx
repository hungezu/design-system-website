import { useState } from 'react'
import { DSIcon, DSMenu, DSTabs, type DSMenuItem } from '../runtime'
import './NavigationExample.css'

const content: Record<string, [string, string]> = {
  overview: ['项目概览', '查看项目资源与最近更新。'],
  components: ['组件资源', '统一查阅按钮、表单、表格等基础组件。'],
  templates: ['页面模板', '取用已组合的业务页面与完整流程。'],
  members: ['成员管理', '查看成员及其在项目中的职责。'],
  settings: ['项目设置', '管理项目的基本信息与主题配置。'],
  audit: ['审核记录', '查看发布前的设计检查记录。'],
}
const entry = (id: string, icon: string, extra: Partial<DSMenuItem> = {}): DSMenuItem => ({ id, label: content[id][0], icon: <DSIcon name={icon} size="sm" decorative />, ...extra })
const flat = [entry('overview', 'home'), entry('components', 'menu'), entry('members', 'users'), entry('settings', 'settings')]
const nested = [flat[0], { id: 'resources', label: '资源管理', icon: <DSIcon name="menu" size="sm" decorative />, children: [entry('components', 'menu'), entry('templates', 'file')] }, { id: 'project', label: '项目管理', icon: <DSIcon name="settings" size="sm" decorative />, children: [entry('members', 'users'), entry('settings', 'settings'), entry('audit', 'lock', { disabled: true })] }]

export function MenuExample({ variant = 'default', disabled = false }: { variant?: string; disabled?: boolean }) {
  const [selected, setSelected] = useState('overview')
  const horizontal = variant === 'horizontal' || variant === 'horizontal-filled'
  const hierarchical = ['inline', 'accordion', 'collapsed', 'horizontal'].includes(variant)
  const items = hierarchical ? nested : variant === 'grouped' ? flat.map((item, index) => ({ ...item, group: index < 2 ? '工作空间' : '项目管理' })) : variant === 'disabled-item' ? [...flat, entry('audit', 'lock', { disabled: true })] : flat
  const [title, description] = content[selected] ?? content.overview
  if (variant === 'action') return <div className="runtime-menu-example"><DSMenu label="资源操作" items={[{ id: 'copy', label: '复制链接' }, { id: 'export', label: '导出资源' }, { id: 'archive', label: '归档资源', disabled: true }]} onAction={setSelected} disabled={disabled} />{selected !== 'overview' && <p role="status">{selected === 'copy' ? '已触发复制链接示例' : '已触发导出资源示例'}</p>}</div>
  return <div className="navigation-demo" data-horizontal={horizontal || undefined}>
    <DSMenu label="项目导航示例" mode={horizontal ? 'horizontal' : 'vertical'} appearance={variant === 'horizontal-filled' ? 'filled' : undefined} items={items} value={selected} onAction={setSelected} disabled={disabled} defaultOpenKeys={variant === 'inline' || variant === 'accordion' ? ['resources'] : []} accordion={variant === 'accordion'} collapsible={variant === 'collapsed'} defaultCollapsed={variant === 'collapsed'} />
    <section className="navigation-demo__content" aria-label="导航内容" aria-live="polite"><h3>{title}</h3><p>{description}</p><span className="navigation-demo__hint">演示内容，点击菜单切换。</span></section>
  </div>
}

export function TabsExample({ variant, disabled }: { variant: string; disabled: boolean }) {
  const filled = variant === 'filled' || variant === 'vertical-filled' || variant === 'full-width'
  const labels = variant === 'overflow' ? ['基本信息', '成员权限', '主题配置', '组件资源', '页面模板', '发布记录', '审核记录', '使用统计'] : ['基本信息', '成员权限', '通知设置']
  return <div className="tabs-demo" data-overflow={variant === 'overflow' || undefined}>
    <DSTabs label="项目设置示例" disabled={disabled} orientation={variant.startsWith('vertical') ? 'vertical' : 'horizontal'} appearance={filled ? 'filled' : 'underline'} fullWidth={variant === 'full-width'} items={labels.map((label, index) => ({ id: String(index), label, disabled: variant === 'disabled-item' && index === 1, icon: variant === 'with-icons' ? <DSIcon name={['settings', 'users', 'notification'][index]} size="sm" decorative /> : undefined, badge: variant === 'with-icons' && index === 1 ? 8 : undefined, content: <div className="navigation-demo__content"><h3>{label}</h3><p>{index === 0 ? '配置项目名称、说明与所属团队。' : index === 1 ? '查看团队成员与项目访问范围。' : `查看与管理${label}。`}</p></div> }))} />
  </div>
}
