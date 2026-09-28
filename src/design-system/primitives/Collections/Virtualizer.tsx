import type { CSSProperties, ReactNode } from 'react'
import {
  GridList,
  GridListItem,
  ListLayout,
  Virtualizer,
  type GridListProps,
} from 'react-aria-components'

export interface DSVirtualizerItem {
  id:string
  label:string
  description?:string
  disabled?:boolean
}

export type DSVirtualizerProps = Pick<GridListProps<DSVirtualizerItem>, 'selectionMode' | 'selectionBehavior' | 'selectedKeys' | 'defaultSelectedKeys' | 'onSelectionChange'> & {
  label:string
  items:DSVirtualizerItem[]
  height?:number
  rowSize?:number
  estimatedRowSize?:number
  gap?:number
  padding?:number
  shouldObserveItemSize?:boolean
  renderItem?:(item:DSVirtualizerItem)=>ReactNode
  emptyState?:ReactNode
}

/** List virtualization contract. Accessibility and selection semantics are owned by the GridList. */
export function DSVirtualizer({label,items,height=320,rowSize=40,estimatedRowSize,gap=0,padding=0,shouldObserveItemSize=false,renderItem,emptyState='暂无内容',...selectionProps}:DSVirtualizerProps) {
  const layoutOptions=estimatedRowSize===undefined
    ? {rowSize,gap,padding}
    : {estimatedRowSize,gap,padding}
  return <Virtualizer layout={ListLayout} layoutOptions={layoutOptions} shouldObserveItemSize={shouldObserveItemSize||estimatedRowSize!==undefined}>
    <GridList {...selectionProps} aria-label={label} items={items} disabledKeys={items.filter(item=>item.disabled).map(item=>item.id)} data-variable={estimatedRowSize!==undefined||undefined} className="owned-grid-list owned-virtualizer" style={{height,'--owned-virtualizer-row-size':`${estimatedRowSize??rowSize}px`} as CSSProperties} renderEmptyState={()=> <span className="owned-grid-list__empty">{emptyState}</span>}>
      {item=><GridListItem id={item.id} textValue={item.label} isDisabled={item.disabled} className="owned-grid-list__item"><span className="owned-grid-list__body">{renderItem?.(item)??item.label}</span></GridListItem>}
    </GridList>
  </Virtualizer>
}
