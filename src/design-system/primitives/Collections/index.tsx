import { ScopedPopover as Popover } from '../../theme/PreviewScope'
import type { ReactNode, ComponentProps } from 'react'
import { DisclosureGroup, Disclosure, Heading, Button, DisclosurePanel, Breadcrumbs, Breadcrumb, Link, ListBox, ListBoxItem, MenuTrigger, Menu, MenuItem, Toolbar, ToggleButton, ToggleButtonGroup, Separator, GridList, GridListItem, Checkbox, Group, PreviewTrigger, type GridListProps } from 'react-aria-components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import './Collections.css'
export interface DSAccordionProps { label?: string; items: {id:string; title:string; content:ReactNode; disabled?:boolean}[]; allowsMultipleExpanded?:boolean }
export function DSAccordion({items,label,allowsMultipleExpanded}:DSAccordionProps) { return <DisclosureGroup className="owned-accordion" aria-label={label} allowsMultipleExpanded={allowsMultipleExpanded}>{items.map(item=><Disclosure id={item.id} key={item.id} isDisabled={item.disabled}><Heading><Button slot="trigger"><span>{item.title}</span><DSIcon name="chevron-down" size="sm" decorative /></Button></Heading><DisclosurePanel>{item.content}</DisclosurePanel></Disclosure>)}</DisclosureGroup> }
export interface DSBreadcrumbProps { items:{id:string; label:string; href?:string}[] }
export function DSBreadcrumb({items}:DSBreadcrumbProps) { return <Breadcrumbs className="owned-breadcrumbs">{items.map((item,index)=>{const current=index===items.length-1;return <Breadcrumb key={item.id}>{current?<span aria-current="page">{item.label}</span>:<Link href={item.href}>{item.label}</Link>}</Breadcrumb>})}</Breadcrumbs> }
export interface DSListBoxProps { label:string; items:{id:string; label:string; disabled?:boolean}[]; selectionMode?:'none'|'single'|'multiple'; selectedKeys?:ComponentProps<typeof ListBox>['selectedKeys']; onSelectionChange?:ComponentProps<typeof ListBox>['onSelectionChange'] }
export function DSListBox({label,items,...props}:DSListBoxProps) { return <ListBox {...props} aria-label={label} className="owned-listbox" disabledKeys={items.filter(item=>item.disabled).map(item=>item.id)}>{items.map(item=><ListBoxItem id={item.id} key={item.id} textValue={item.label}>{item.label}</ListBoxItem>)}</ListBox> }
export interface DSGridListItem { id:string; label:string; description?:string; disabled?:boolean; href?:string; action?:ReactNode }
export type DSGridListProps = Omit<GridListProps<DSGridListItem>, 'aria-label' | 'children' | 'className' | 'items' | 'defaultItems' | 'disabledKeys' | 'renderEmptyState'> & {
  label:string
  items:DSGridListItem[]
  renderItem?:(item:DSGridListItem)=>ReactNode
  showSelectionControl?:boolean
  disabled?:boolean
  emptyMessage?:ReactNode
}
export function DSGridList({label,items,renderItem,showSelectionControl=true,disabled=false,emptyMessage='暂无内容',...props}:DSGridListProps) {
  return <GridList {...props} aria-label={label} aria-disabled={disabled||undefined} data-disabled={disabled||undefined} className="owned-grid-list" items={items} disabledKeys={items.filter(item=>disabled||item.disabled).map(item=>item.id)} renderEmptyState={()=> <span className="owned-grid-list__empty">{emptyMessage}</span>}>
    {item=><GridListItem id={item.id} textValue={item.label} href={item.href} isDisabled={disabled||item.disabled} className="owned-grid-list__item">{({selectionMode})=><>{showSelectionControl&&selectionMode==='multiple'&&<Checkbox slot="selection" className="owned-grid-list__selection">{({isSelected})=><span aria-hidden="true">{isSelected?'✓':''}</span>}</Checkbox>}<span className="owned-grid-list__body">{renderItem?.(item)?? <><strong>{item.label}</strong>{item.description&&<small>{item.description}</small>}</>}</span>{item.action&&<span className="owned-grid-list__action">{item.action}</span>}</>}</GridListItem>}
  </GridList>
}
type DSGroupBaseProps = Omit<ComponentProps<typeof Group>, 'aria-label' | 'className' | 'role'>
export type DSGroupProps = DSGroupBaseProps & ({role?:'group'|'region';label:string}|{role:'presentation';label?:never})
/** Semantic grouping only. isDisabled styles the group but does not disable arbitrary descendants. */
export function DSGroup({label,role='group',...props}:DSGroupProps) { return <Group {...props} role={role} aria-label={role==='presentation'?undefined:label} className="owned-group" /> }
export type DSPreviewTriggerProps = Omit<ComponentProps<typeof PreviewTrigger>, 'children'> & {
  label:string
  preview:ReactNode
  previewLabel?:string
  href?:string
  target?:ComponentProps<typeof Link>['target']
  rel?:ComponentProps<typeof Link>['rel']
  disabled?:boolean
  onPress?:ComponentProps<typeof Button>['onPress']
  placement?:ComponentProps<typeof Popover>['placement']
}
export function DSPreviewTrigger({label,preview,previewLabel,href,target,rel,disabled=false,onPress,placement='bottom start',...props}:DSPreviewTriggerProps) {
  const isDisabled=disabled||props.isDisabled
  const trigger=href
    ? <Link href={href} target={target} rel={rel??(target==='_blank'?'noopener noreferrer':undefined)} isDisabled={isDisabled} className="owned-preview-trigger owned-link">{label}</Link>
    : <Button isDisabled={isDisabled} onPress={onPress} className="owned-preview-trigger">{label}</Button>
  return <PreviewTrigger {...props} isDisabled={isDisabled}>{trigger}<Popover aria-label={previewLabel??`${label}预览`} placement={placement} offset={8} className="owned-preview-popover">{preview}</Popover></PreviewTrigger>
}
export interface DSDropdownProps { label:string; items:{id:string; label:string; disabled?:boolean}[]; onAction?:(id:string)=>void }
export function DSDropdown({label,items,onAction}:DSDropdownProps) { return <MenuTrigger><Button className="owned-menu-trigger">{label}</Button><Popover className="owned-menu-popover"><Menu aria-label={label} className="owned-menu owned-menu--popover" onAction={key=>onAction?.(String(key))} disabledKeys={items.filter(item=>item.disabled).map(item=>item.id)}>{items.map(item=><MenuItem id={item.id} key={item.id}>{item.label}</MenuItem>)}</Menu></Popover></MenuTrigger> }
export function DSToolbar(props:ComponentProps<typeof Toolbar>) { return <Toolbar {...props} className="owned-toolbar" /> }
export function DSToggleButton(props:ComponentProps<typeof ToggleButton>) { return <ToggleButton {...props} className="owned-toggle" /> }
export function DSToggleButtonGroup(props:ComponentProps<typeof ToggleButtonGroup>) { return <ToggleButtonGroup {...props} className="owned-toolbar" /> }
export function DSSeparator(props:ComponentProps<typeof Separator>) { return <Separator {...props} className="owned-separator" /> }
export function DSLink(props:ComponentProps<typeof Link>) { return <Link {...props} className="owned-link" /> }
export { DSNavigationTree } from './NavigationTree'
export type { DSNavigationTreeItem, DSNavigationTreeProps } from './NavigationTree'
export { DSVirtualizer } from './Virtualizer'
export type { DSVirtualizerItem, DSVirtualizerProps } from './Virtualizer'
