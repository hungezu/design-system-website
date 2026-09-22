import { Button, Tabs, TabList, Tab, TabPanel } from 'react-aria-components'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import './Navigation.css'
export { DSMenu } from './Menu'
export type { DSMenuProps, DSMenuItem } from './Menu'
export interface DSTabItem { id: string; label: string; content: ReactNode; disabled?: boolean; icon?: ReactNode; badge?: string | number }
export interface DSTabsProps { label: string; items: DSTabItem[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; disabled?: boolean; orientation?: 'horizontal' | 'vertical'; appearance?: 'underline' | 'filled'; fullWidth?: boolean }
export function DSTabs({ label, items, value, defaultValue, onChange, disabled, orientation = 'horizontal', appearance = 'underline', fullWidth = false }: DSTabsProps) {
  const list = useRef<HTMLDivElement>(null)
  const [scroll, setScroll] = useState({ before: false, after: false })
  const measure = () => {
    const node = list.current
    if (node) setScroll({ before: node.scrollLeft > 1, after: node.scrollWidth - node.clientWidth - node.scrollLeft > 1 })
  }
  useEffect(() => {
    const node = list.current
    if (!node) return
    const reveal = () => {
      const selected = node.querySelector<HTMLElement>('[data-selected]')
      if (selected && orientation === 'horizontal') {
        const outer = node.getBoundingClientRect(), inner = selected.getBoundingClientRect()
        if (inner.left < outer.left) node.scrollLeft -= outer.left - inner.left
        else if (inner.right > outer.right) node.scrollLeft += inner.right - outer.right
      }
      measure()
    }
    reveal()
    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(reveal)
    resize?.observe(node)
    const mutation = new MutationObserver(reveal)
    mutation.observe(node, { subtree: true, attributes: true, attributeFilter: ['data-selected'] })
    return () => { resize?.disconnect(); mutation.disconnect() }
  }, [items, orientation, appearance, fullWidth])
  const shift = (direction: number) => { const node = list.current; if (node) { node.scrollLeft += direction * node.clientWidth * 0.7; measure() } }
  return <Tabs className="owned-tabs" data-appearance={appearance} data-full-width={fullWidth || undefined} selectedKey={value} defaultSelectedKey={defaultValue} onSelectionChange={key => onChange?.(String(key))} orientation={orientation} disabledKeys={items.filter(item => disabled || item.disabled).map(item => item.id)}>
    <div className="owned-tabs__rail">
      {orientation === 'horizontal' && (scroll.before || scroll.after) && <Button className="owned-tabs__scroll" aria-label="向前滚动标签" isDisabled={!scroll.before} onPress={() => shift(-1)}><DSIcon name="chevron-left" size="sm" decorative /></Button>}
      <TabList ref={list} aria-label={label} onScroll={measure}>{items.map(item => <Tab className="owned-tab" id={item.id} key={item.id}>{item.icon && <span aria-hidden="true">{item.icon}</span>}{item.label}{item.badge !== undefined && <span className="owned-tab__badge">{item.badge}</span>}</Tab>)}</TabList>
      {orientation === 'horizontal' && (scroll.before || scroll.after) && <Button className="owned-tabs__scroll" aria-label="向后滚动标签" isDisabled={!scroll.after} onPress={() => shift(1)}><DSIcon name="chevron-right" size="sm" decorative /></Button>}
    </div>
    {items.map(item => <TabPanel className="owned-tab-panel" id={item.id} key={item.id}>{item.content}</TabPanel>)}
  </Tabs>
}
