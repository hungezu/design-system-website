import type { ReactElement } from 'react'
import {
  Button,
  Link,
  NavigationTree,
  NavigationTreeItem,
  NavigationTreeItemContent,
  type NavigationTreeProps,
} from 'react-aria-components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'

export interface DSNavigationTreeItem {
  id:string
  label:string
  href?:string
  disabled?:boolean
  children?:DSNavigationTreeItem[]
}

export type DSNavigationTreeProps = Omit<NavigationTreeProps<DSNavigationTreeItem>, 'aria-label' | 'children' | 'className' | 'items' | 'defaultItems'> & {
  label:string
  items:DSNavigationTreeItem[]
  onNavigate?:(href:string)=>void
}

function renderNavigationItem(item:DSNavigationTreeItem,onNavigate?:DSNavigationTreeProps['onNavigate']):ReactElement {
  return <NavigationTreeItem id={item.id} key={item.id} href={item.href} textValue={item.label} isDisabled={item.disabled} className="owned-navigation-tree__item">
    <NavigationTreeItemContent>{({hasChildItems,isExpanded})=><span className="owned-navigation-tree__content">
      {hasChildItems
        ? <Button slot="chevron" aria-label={`${isExpanded?'收起':'展开'}${item.label}`} className="owned-navigation-tree__chevron"><DSIcon name="chevron-right" className={isExpanded?'is-expanded':''} size="sm" decorative /></Button>
        : <span className="owned-navigation-tree__chevron-placeholder" aria-hidden="true" />}
      {item.href ? <Link isDisabled={item.disabled} onPress={()=>onNavigate?.(item.href!)} className="owned-navigation-tree__link">{item.label}</Link> : <span className="owned-navigation-tree__label">{item.label}</span>}
    </span>}</NavigationTreeItemContent>
    {item.children?.map(child=>renderNavigationItem(child,onNavigate))}
  </NavigationTreeItem>
}

/** Route-aware hierarchical navigation. Use DSTree for selectable data rather than navigation. */
export function DSNavigationTree({label,items,onNavigate,...props}:DSNavigationTreeProps) {
  return <NavigationTree {...props} aria-label={label} className="owned-navigation-tree">{items.map(item=>renderNavigationItem(item,onNavigate))}</NavigationTree>
}
