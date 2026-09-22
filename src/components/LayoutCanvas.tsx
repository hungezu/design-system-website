import { Box, Columns3, Grid3X3, LayoutPanelLeft, LockKeyhole, PanelBottom, PanelLeft, PanelRight, PanelTop, Rows3 } from 'lucide-react'
import type { ComponentType, CSSProperties } from 'react'
import type { LayoutNode, LayoutPrimitiveType } from '../framework/types/generation'

const typeIcons: Partial<Record<LayoutPrimitiveType, ComponentType<{ size?: number; strokeWidth?: number }>>> = {
  root: Box,
  header: PanelTop,
  sidebar: PanelLeft,
  'primary-navigation': Rows3,
  'secondary-navigation': Rows3,
  'context-navigation': LayoutPanelLeft,
  content: Box,
  grid: Grid3X3,
  aside: PanelRight,
  inspector: PanelRight,
  'split-view': Columns3,
  'detail-pane': PanelRight,
  'drawer-region': PanelRight,
  'footer-region': PanelBottom,
  'card-grid': Grid3X3,
  'table-region': Rows3,
  'custom-region': Box,
}

export function LayoutCanvas({ root, selectedId, onSelect }: { root: LayoutNode; selectedId?: string; onSelect?: (id: string) => void }) {
  const renderNode = (item: LayoutNode, depth = 0) => {
    const Icon = typeIcons[item.type] ?? Box
    const children = item.children ?? []
    return (
      <div key={item.id} className={`layout-node layout-node--${item.type} ${selectedId === item.id ? 'is-selected' : ''}`} style={{ '--layout-depth': depth, '--layout-basis': item.width === 'fill' ? 'auto' : item.width } as CSSProperties}>
        <button type="button" className="layout-node__select" disabled={!onSelect} onClick={(event) => { event.stopPropagation(); onSelect?.(item.id) }}>
          <span className="layout-node__label"><Icon size={14} strokeWidth={1.7} /><strong>{item.label}</strong><small>{item.type}</small>{item.locked && <LockKeyhole size={12} />}</span>
          {item.width && <span className="layout-node__measure">{item.width}</span>}
        </button>
        {children.length > 0 && <span className={`layout-node__children layout-node__children--${item.direction ?? 'vertical'}`}>{children.map((child) => renderNode(child, depth + 1))}</span>}
      </div>
    )
  }

  return <div className="layout-canvas">{renderNode(root)}</div>
}
