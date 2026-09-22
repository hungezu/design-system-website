import { Box, Columns3, Grid3X3, LayoutPanelLeft, PanelBottom, PanelLeft, PanelRight, PanelTop, Rows3 } from 'lucide-react'
import type { ComponentType } from 'react'
import { Badge } from '../components/Badge'
import { PageHeader } from '../components/PageHeader'
import { layoutPrimitives } from '../framework/data/layout-primitives'
import type { LayoutPrimitiveType } from '../framework/types/generation'

const icons: Partial<Record<LayoutPrimitiveType, ComponentType<{ size?: number; strokeWidth?: number }>>> = {
  header: PanelTop, sidebar: PanelLeft, 'primary-navigation': Rows3, 'secondary-navigation': Rows3,
  'context-navigation': LayoutPanelLeft, content: Box, grid: Grid3X3, aside: PanelRight,
  inspector: PanelRight, 'split-view': Columns3, 'detail-pane': PanelRight,
  'drawer-region': PanelRight, 'footer-region': PanelBottom, 'card-grid': Grid3X3,
  'table-region': Rows3, 'custom-region': Box,
}

export function Layouts() {
  const categories = ['导航', '结构', '内容', '辅助'] as const
  return <div className="page layouts-page">
    <PageHeader title="布局能力" description="Layout Primitive 描述区域能力和组合关系，不规定固定 App Shell，也不携带 Theme。" actions={<Badge>{layoutPrimitives.length} 项能力</Badge>} />
    <div className="layout-principle"><strong>组合优于模板</strong><span>每个区域都可以加入 Layout Tree；Custom Region 为地图、3D、实时监控和流程编辑器保留扩展入口。</span></div>
    <div className="layout-catalog">{categories.map((category) => <section key={category}><div className="resource-section-title"><h2>{category}</h2><span>{layoutPrimitives.filter((item) => item.category === category).length} 项</span></div><div className="layout-primitive-list">{layoutPrimitives.filter((item) => item.category === category).map((item) => { const Icon = icons[item.id] ?? Box; return <article key={item.id}><span><Icon size={18} strokeWidth={1.7} /></span><div><strong>{item.name}</strong><code>{item.id}</code><p>{item.description}</p></div><Badge>{item.acceptsChildren ? '可嵌套' : '叶子区域'}</Badge></article> })}</div></section>)}</div>
  </div>
}
