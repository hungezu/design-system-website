import { ScopedPopover as Popover } from '../../theme/PreviewScope'
import type { ReactNode, ComponentProps } from 'react'
import { DisclosureGroup, Disclosure, Heading, Button, DisclosurePanel, Breadcrumbs, Breadcrumb, Link, ListBox, ListBoxItem, MenuTrigger, Menu, MenuItem, Toolbar, ToggleButton, ToggleButtonGroup, Separator } from 'react-aria-components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import './Collections.css'
export interface DSAccordionProps { label?: string; items: {id:string; title:string; content:ReactNode; disabled?:boolean}[]; allowsMultipleExpanded?:boolean }
export function DSAccordion({items,label,allowsMultipleExpanded}:DSAccordionProps) { return <DisclosureGroup className="owned-accordion" aria-label={label} allowsMultipleExpanded={allowsMultipleExpanded}>{items.map(item=><Disclosure id={item.id} key={item.id} isDisabled={item.disabled}><Heading><Button slot="trigger"><span>{item.title}</span><DSIcon name="chevron-down" size="sm" decorative /></Button></Heading><DisclosurePanel>{item.content}</DisclosurePanel></Disclosure>)}</DisclosureGroup> }
export interface DSBreadcrumbProps { items:{id:string; label:string; href?:string}[] }
export function DSBreadcrumb({items}:DSBreadcrumbProps) { return <Breadcrumbs className="owned-breadcrumbs">{items.map((item,index)=>{const current=index===items.length-1;return <Breadcrumb key={item.id}><Link href={current?undefined:item.href} aria-current={current?'page':undefined}>{item.label}</Link></Breadcrumb>})}</Breadcrumbs> }
export interface DSListBoxProps { label:string; items:{id:string; label:string; disabled?:boolean}[]; selectionMode?:'none'|'single'|'multiple'; selectedKeys?:ComponentProps<typeof ListBox>['selectedKeys']; onSelectionChange?:ComponentProps<typeof ListBox>['onSelectionChange'] }
export function DSListBox({label,items,...props}:DSListBoxProps) { return <ListBox {...props} aria-label={label} className="owned-listbox" disabledKeys={items.filter(item=>item.disabled).map(item=>item.id)}>{items.map(item=><ListBoxItem id={item.id} key={item.id} textValue={item.label}>{item.label}</ListBoxItem>)}</ListBox> }
export interface DSDropdownProps { label:string; items:{id:string; label:string; disabled?:boolean}[]; onAction?:(id:string)=>void }
export function DSDropdown({label,items,onAction}:DSDropdownProps) { return <MenuTrigger><Button className="owned-menu-trigger">{label}</Button><Popover className="owned-menu-popover"><Menu aria-label={label} className="owned-menu owned-menu--popover" onAction={key=>onAction?.(String(key))} disabledKeys={items.filter(item=>item.disabled).map(item=>item.id)}>{items.map(item=><MenuItem id={item.id} key={item.id}>{item.label}</MenuItem>)}</Menu></Popover></MenuTrigger> }
export function DSToolbar(props:ComponentProps<typeof Toolbar>) { return <Toolbar {...props} className="owned-toolbar" /> }
export function DSToggleButton(props:ComponentProps<typeof ToggleButton>) { return <ToggleButton {...props} className="owned-toggle" /> }
export function DSToggleButtonGroup(props:ComponentProps<typeof ToggleButtonGroup>) { return <ToggleButtonGroup {...props} className="owned-toolbar" /> }
export function DSSeparator(props:ComponentProps<typeof Separator>) { return <Separator {...props} className="owned-separator" /> }
export function DSLink(props:ComponentProps<typeof Link>) { return <Link {...props} className="owned-link" /> }
