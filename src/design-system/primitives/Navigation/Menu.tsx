import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Button, Dialog, DialogTrigger, Link, Menu, MenuItem } from 'react-aria-components'
import { ScopedPopover } from '../../theme/PreviewScope'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import './Menu.css'

export interface DSMenuItem {
  id: string
  label: string
  disabled?: boolean
  icon?: ReactNode
  href?: string
  group?: string
  children?: DSMenuItem[]
}
export interface DSMenuProps {
  label: string
  items: DSMenuItem[]
  /** action preserves the original command-list behavior. */
  mode?: 'action' | 'vertical' | 'horizontal'
  appearance?: 'filled' | 'underline'
  value?: string
  defaultValue?: string
  onAction?: (key: string) => void
  disabled?: boolean
  openKeys?: string[]
  defaultOpenKeys?: string[]
  onOpenChange?: (keys: string[]) => void
  accordion?: boolean
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  collapsible?: boolean
}

function contains(items: DSMenuItem[], key?: string): boolean {
  return items.some(item => item.id === key || (item.children && contains(item.children, key)))
}

export function DSMenu(props: DSMenuProps) {
  if (!props.mode || props.mode === 'action') {
    return <Menu aria-label={props.label} className="owned-menu" disabledKeys={props.items.filter(item => props.disabled || item.disabled).map(item => item.id)} onAction={key => props.onAction?.(String(key))}>
      {props.items.map(item => <MenuItem key={item.id} id={item.id} textValue={item.label}>{item.icon}{item.label}</MenuItem>)}
    </Menu>
  }
  return <NavigationMenu {...props} />
}

function NavigationMenu({ label, items, mode, appearance = mode === 'horizontal' ? 'underline' : 'filled', value, defaultValue, onAction, disabled, openKeys, defaultOpenKeys = [], onOpenChange, accordion, collapsed, defaultCollapsed = false, onCollapsedChange, collapsible }: DSMenuProps) {
  const uid = useId()
  const [selected, setSelected] = useState(defaultValue)
  const [expanded, setExpanded] = useState(defaultOpenKeys)
  const [compact, setCompact] = useState(defaultCollapsed)
  const active = value ?? selected
  const opened = openKeys ?? expanded
  const isCollapsed = mode === 'vertical' && (collapsed ?? compact)
  const updateOpen = (next: string[]) => { if (openKeys === undefined) setExpanded(next); onOpenChange?.(next) }
  const toggle = (item: DSMenuItem, siblings: DSMenuItem[], open: boolean) => {
    const next = opened.filter(key => key !== item.id && !(open && accordion && siblings.some(sibling => sibling.id === key)))
    updateOpen(open ? [...next, item.id] : next)
  }
  const select = (item: DSMenuItem, close?: () => void) => {
    if (value === undefined) setSelected(item.id)
    onAction?.(item.id)
    close?.()
  }
  // Navigation keeps native Tab order; arrows are a convenience, not a menu role.
  const moveFocus = (event: KeyboardEvent<HTMLElement>, horizontal = false) => {
    const keys = horizontal ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown']
    if (![...keys, 'Home', 'End'].includes(event.key)) return
    const targets = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-nav-control]')).filter(node => !node.hasAttribute('disabled') && node.getAttribute('aria-disabled') !== 'true' && node.getClientRects().length)
    const index = targets.indexOf(event.target as HTMLElement)
    if (index < 0 || !targets.length) return
    event.preventDefault(); event.stopPropagation()
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? targets.length - 1 : (index + (event.key === keys[0] ? -1 : 1) + targets.length) % targets.length
    targets[next]?.focus()
  }
  const renderItems = (nodes: DSMenuItem[], depth = 0, close?: () => void, parentDisabled = false): ReactNode => <ul className="owned-nav__list">
    {nodes.map((item, index) => {
      const children = item.children?.length ? item.children : undefined
      const popup = !!children && depth === 0 && (mode === 'horizontal' || isCollapsed)
      const isOpen = opened.includes(item.id)
      const content = <>{item.icon && <span className="owned-nav__icon" aria-hidden="true">{item.icon}</span>}<span className="owned-nav__label">{item.label}</span>{children && <DSIcon className="owned-nav__chevron" name={isCollapsed ? 'chevron-right' : 'chevron-down'} size="xs" decorative />}</>
      const common = { className: 'owned-nav__item', 'data-nav-control': true, 'data-current': (children ? contains(children, active) : active === item.id) || undefined, isDisabled: disabled || parentDisabled || item.disabled, 'aria-label': item.label, title: isCollapsed && depth === 0 ? item.label : undefined }
      const panelId = `${uid}-${item.id}`
      return <li key={item.id} className="owned-nav__entry">
        {item.group && item.group !== nodes[index - 1]?.group && <span className="owned-nav__group">{item.group}</span>}
        {popup ? <DialogTrigger isOpen={isOpen} onOpenChange={open => toggle(item, nodes, open)}>
          <Button {...common}>{content}</Button>
          <ScopedPopover className="owned-nav-popover" placement={mode === 'horizontal' ? 'bottom start' : 'right top'} offset={6}>
            <Dialog aria-label={`${item.label}子菜单`} className="owned-nav__dialog">
              {({ close: dismiss }) => <div onKeyDown={event => moveFocus(event)}><div className="owned-nav__group">{item.label}</div>{renderItems(children, depth + 1, dismiss, parentDisabled || item.disabled)}</div>}
            </Dialog>
          </ScopedPopover>
        </DialogTrigger> : children ? <>
          <Button {...common} aria-expanded={isOpen} aria-controls={panelId} onPress={() => toggle(item, nodes, !isOpen)}>{content}</Button>
          <div id={panelId} hidden={!isOpen} className="owned-nav__children">{isOpen && renderItems(children, depth + 1, close, parentDisabled || item.disabled)}</div>
        </> : item.href ? <Link {...common} href={item.href} aria-current={active === item.id ? 'page' : undefined} onPress={() => select(item, close)}>{content}</Link> : <Button {...common} aria-current={active === item.id ? 'page' : undefined} onPress={() => select(item, close)}>{content}</Button>}
      </li>
    })}
  </ul>
  return <nav aria-label={label} className="owned-nav" data-mode={mode} data-appearance={appearance} data-collapsed={isCollapsed || undefined} onKeyDown={event => moveFocus(event, mode === 'horizontal')}>
    {renderItems(items)}
    {mode === 'vertical' && collapsible && <Button className="owned-nav__collapse" aria-label={isCollapsed ? '展开菜单' : '收起菜单'} isDisabled={disabled} onPress={() => { if (collapsed === undefined) setCompact(!isCollapsed); updateOpen([]); onCollapsedChange?.(!isCollapsed) }}><DSIcon name={isCollapsed ? 'chevron-right' : 'chevron-left'} size="sm" decorative />{!isCollapsed && <span>收起菜单</span>}</Button>}
  </nav>
}
