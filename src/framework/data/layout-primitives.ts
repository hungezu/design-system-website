import type { LayoutPrimitiveType } from '../types/generation'

export interface LayoutPrimitiveDefinition {
  id: LayoutPrimitiveType
  name: string
  category: '导航' | '内容' | '结构' | '辅助'
  description: string
  acceptsChildren: boolean
}

export const layoutPrimitives: LayoutPrimitiveDefinition[] = [
  { id: 'header', name: 'Header', category: '导航', description: '承载系统身份、全局操作和一级上下文。', acceptsChildren: true },
  { id: 'sidebar', name: 'Sidebar', category: '导航', description: '承载稳定的纵向模块导航。', acceptsChildren: true },
  { id: 'primary-navigation', name: 'Primary Navigation', category: '导航', description: '切换产品一级业务模块。', acceptsChildren: false },
  { id: 'secondary-navigation', name: 'Secondary Navigation', category: '导航', description: '组织当前模块内的二级入口。', acceptsChildren: false },
  { id: 'context-navigation', name: 'Context Navigation', category: '导航', description: '根据当前对象或任务提供上下文导航。', acceptsChildren: false },
  { id: 'breadcrumb', name: 'Breadcrumb', category: '导航', description: '表达当前位置与返回路径。', acceptsChildren: false },
  { id: 'page-header', name: 'Page Header', category: '内容', description: '承载页面身份、说明和主要操作。', acceptsChildren: false },
  { id: 'tabs', name: 'Tabs', category: '内容', description: '切换同一上下文中的并列视图。', acceptsChildren: false },
  { id: 'toolbar', name: 'Toolbar', category: '内容', description: '组合筛选、视图和对象操作。', acceptsChildren: true },
  { id: 'content', name: 'Content', category: '内容', description: '主要任务内容区域。', acceptsChildren: true },
  { id: 'table-region', name: 'Table Region', category: '内容', description: '承载高密度结构化数据。', acceptsChildren: true },
  { id: 'card-grid', name: 'Card Grid', category: '内容', description: '承载可独立浏览的对象集合。', acceptsChildren: true },
  { id: 'grid', name: 'Grid', category: '结构', description: '按列与行组织多个区域。', acceptsChildren: true },
  { id: 'split-view', name: 'Split View', category: '结构', description: '并列呈现主内容与关联上下文。', acceptsChildren: true },
  { id: 'aside', name: 'Aside', category: '辅助', description: '承载辅助信息与低频操作。', acceptsChildren: true },
  { id: 'inspector', name: 'Inspector', category: '辅助', description: '查看和编辑当前选中对象属性。', acceptsChildren: true },
  { id: 'detail-pane', name: 'Detail Pane', category: '辅助', description: '在列表旁展示对象详情。', acceptsChildren: true },
  { id: 'drawer-region', name: 'Drawer Region', category: '辅助', description: '在不离开上下文时承载临时任务。', acceptsChildren: true },
  { id: 'footer-region', name: 'Footer Region', category: '辅助', description: '承载持久状态、日志或页尾操作。', acceptsChildren: true },
  { id: 'custom-region', name: 'Custom Region', category: '结构', description: '承载地图、3D、监控、流程编辑器等未知区域。', acceptsChildren: true },
]

export const getLayoutPrimitive = (id: LayoutPrimitiveType) => layoutPrimitives.find((item) => item.id === id)
