// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DSNumberField, DSSearchField } from './AdvancedFields'
import { DSAccordion } from './Collections'
import { DSCloseButton, DSInputOTP, DSResizablePanel, DSTooltip } from './Collections/Additional'
beforeAll(()=>{vi.stubGlobal('ResizeObserver',class{observe(){} unobserve(){} disconnect(){}});window.matchMedia=vi.fn().mockReturnValue({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}})})
afterEach(cleanup)
it('NumberField 到达最大值后禁用递增操作',async()=>{
 const user=userEvent.setup();render(<DSNumberField label="数量" defaultValue={1} minValue={0} maxValue={2}/>)
 await user.click(screen.getByRole('button',{name:'增加 数量'}))
 expect((screen.getByRole('button',{name:'增加 数量'}) as HTMLButtonElement).disabled).toBe(true)
})
it('SearchField 只显示一个语义清空操作',async()=>{
 const user=userEvent.setup();render(<DSSearchField label="搜索资源" />)
 const input=screen.getByRole('searchbox',{name:'搜索资源'})
 expect(screen.queryByRole('button',{name:'清空搜索资源'})).toBeNull()
 await user.type(input,'333')
 const clear=screen.getByRole('button',{name:'清空搜索资源'})
 expect(screen.getAllByRole('button',{name:'清空搜索资源'})).toHaveLength(1)
 expect(clear.querySelector('[data-icon="clear-input"] path[fill="currentColor"]')).not.toBeNull()
 await user.click(clear)
 expect((input as HTMLInputElement).value).toBe('')
 expect(screen.queryByRole('button',{name:'清空搜索资源'})).toBeNull()
})
it('折叠面板由真实按钮切换展开状态',async()=>{
 const user=userEvent.setup();render(<DSAccordion items={[{id:'a',title:'说明',content:'完整说明'}]}/>)
 const trigger=screen.getByRole('button',{name:'说明'})
 expect(trigger.getAttribute('aria-expanded')).toBe('false')
 await user.click(trigger);expect(trigger.getAttribute('aria-expanded')).toBe('true')
})
it('关闭按钮只呈现语义图标并保留可访问名称',()=>{
 render(<DSCloseButton label="关闭详情" onPress={()=>{}} />)
 const close=screen.getByRole('button',{name:'关闭详情'})
 expect(close.textContent).toBe('')
 expect(close.querySelector('[data-icon="close"]')).not.toBeNull()
})
it('Tooltip 在悬停和键盘聚焦时显示',async()=>{
 const user=userEvent.setup();render(<DSTooltip label="字段说明" placement="bottom end" offset={8} shouldFlip={false}>查看说明</DSTooltip>)
 const trigger=screen.getByRole('button',{name:'查看说明'})
 await user.hover(trigger)
 expect((await screen.findByRole('tooltip')).textContent).toBe('字段说明')
 await user.unhover(trigger)
 trigger.focus()
 expect((await screen.findByRole('tooltip')).textContent).toBe('字段说明')
})
it('OTP 过滤非数字且遵守长度限制',async()=>{
 const user=userEvent.setup();const onChange=vi.fn();render(<DSInputOTP label="验证码" length={4} onChange={onChange}/>)
 const cells=screen.getAllByRole('textbox',{name:/验证码第/})
 await user.type(cells[0],'a1234')
 expect(cells.map(cell=>(cell as HTMLInputElement).value).join('')).toBe('1234')
 expect(document.activeElement).toBe(cells[3])
})
it('可调整面板支持键盘边界',async()=>{
 const user=userEvent.setup();render(<DSResizablePanel min={100} max={300}>内容</DSResizablePanel>)
 const handle=screen.getByRole('separator');handle.focus();await user.keyboard('{End}')
 expect(handle.getAttribute('aria-valuenow')).toBe('300')
 await user.keyboard('{ArrowRight}');expect(handle.getAttribute('aria-valuenow')).toBe('300')
 await user.keyboard('{Home}');expect(handle.getAttribute('aria-valuenow')).toBe('100')
})

it('Dialog Escape 关闭并返回触发器焦点',async()=>{
 const user=userEvent.setup()
 const {DSDialog}=await import('./Overlays')
 const {useState}=await import('react')
 function Fixture(){const [open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>打开对话框</button><DSDialog open={open} onOpenChange={setOpen} title="验收对话框"><button>内容按钮</button></DSDialog></>}
 render(<Fixture />)
 const trigger=screen.getByRole('button',{name:'打开对话框'})
 await user.click(trigger)
 expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
 const close=screen.getByRole('button',{name:'关闭验收对话框'})
 expect(close.textContent).toBe('')
 expect(close.querySelector('[data-icon="close"]')).not.toBeNull()
 await user.keyboard('{Escape}')
 expect(screen.queryByRole('dialog')).toBeNull()
 await vi.waitFor(()=>expect(document.activeElement).toBe(trigger))
})
