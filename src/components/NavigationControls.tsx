import { useId, type ReactNode } from 'react'
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

function ControlledTabs({ items, selectedKey, onSelectionChange, className }: { items: TabItem[]; selectedKey: string; onSelectionChange: (key: string) => void; className: string }) {
  return <Tabs className={className} selectedKey={selectedKey} onSelectionChange={(key) => onSelectionChange(String(key))} keyboardActivation="automatic">
    <TabList aria-label="页面内容">{items.map((item) => <Tab id={item.id} key={item.id}>{item.label}</Tab>)}</TabList>
    {items.map((item) => <TabPanel id={item.id} key={item.id}>{item.content}</TabPanel>)}
  </Tabs>
}

export function PageTabs(props: Omit<Parameters<typeof ControlledTabs>[0], 'className'>) {
  return <ControlledTabs {...props} className="page-tabs" />
}

export function LocalTabs(props: Omit<Parameters<typeof ControlledTabs>[0], 'className'>) {
  return <ControlledTabs {...props} className="local-tabs" />
}

export function SegmentedControl<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (value: T) => void }) {
  const name = useId()
  return <div className="segmented-control" role="radiogroup" aria-label={label}>{options.map((option) => <label key={option.value} data-selected={value === option.value || undefined}>
    <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
    <span>{option.label}</span>
  </label>)}</div>
}

export function Stepper({ steps, current, furthest, onChange }: { steps: string[]; current: number; furthest: number; onChange: (index: number) => void }) {
  return <nav className="stepper" aria-label="生成步骤">{steps.map((label, index) => <button type="button" key={label} aria-current={current === index ? 'step' : undefined} disabled={index > furthest} data-complete={index < furthest || undefined} onClick={() => onChange(index)}><span>{index + 1}</span><strong>{label}</strong></button>)}</nav>
}
