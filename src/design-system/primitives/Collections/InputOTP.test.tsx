// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { DSInputOTP } from './Additional'
afterEach(cleanup)
const values=()=>screen.getAllByRole('textbox').map(e=>(e as HTMLInputElement).value)
const cell=(index:number)=>screen.getAllByRole('textbox')[index]
const paste=(index:number,text:string)=>fireEvent.paste(cell(index),{clipboardData:{getData:()=>text}})
it('第 4 格输入保留位置，提示统计非空格数',async()=>{
 const user=userEvent.setup();const onChange=vi.fn();render(<DSInputOTP label="验证码" length={4} onChange={onChange}/>)
 await user.type(cell(3),'7');expect(values()).toEqual(['','','','7']);expect(screen.getByText('已输入 1 / 4 位')).toBeTruthy();expect(onChange).toHaveBeenLastCalledWith('7')
})
it('删除中间格不移动后续数字，空格退格只清除前一格',async()=>{
 const user=userEvent.setup();render(<DSInputOTP label="验证码" length={4}/>);paste(0,'1234')
 await user.click(cell(1));await user.keyboard('{Delete}');expect(values()).toEqual(['1','','3','4'])
 await user.keyboard('{Backspace}');expect(values()).toEqual(['','','3','4']);expect(document.activeElement).toBe(cell(0))
})
it('已填格聚焦后直接键入可替换，焦点前进且不挪动其它格',async()=>{
 const user=userEvent.setup();render(<DSInputOTP label="验证码" length={4}/>);paste(0,'1234')
 await user.click(cell(1));await user.keyboard('9');expect(values()).toEqual(['1','9','3','4']);expect(document.activeElement).toBe(cell(2))
})
it('部分粘贴从当前格覆盖；全量粘贴从首格替换并过滤非数字',()=>{
 render(<DSInputOTP label="验证码" length={4}/>);paste(3,'7');paste(1,'8x9');expect(values()).toEqual(['','8','9','7'])
 paste(2,'a12 34');expect(values()).toEqual(['1','2','3','4'])
 paste(0,'abc');expect(values()).toEqual(['1','2','3','4'])
})
it('首尾、箭头及非数字输入不会损坏已有格位',async()=>{
 const user=userEvent.setup();render(<DSInputOTP label="验证码" length={4}/>);paste(0,'1234')
 await user.click(cell(2));await user.keyboard('{Home}');expect(document.activeElement).toBe(cell(0))
 await user.keyboard('{End}{ArrowLeft}');expect(document.activeElement).toBe(cell(2))
 await user.keyboard('x');expect(values()).toEqual(['1','2','3','4'])
})
it('长度变化重建编辑格位，禁用阻止变更回调',()=>{
 const onChange=vi.fn();const {rerender}=render(<DSInputOTP label="验证码" length={4} onChange={onChange}/>);paste(0,'1234')
 rerender(<DSInputOTP label="验证码" length={6} onChange={onChange} disabled/>);expect(values()).toEqual(['','','','','',''])
 onChange.mockClear();act(()=>paste(0,'999999'));expect(onChange).not.toHaveBeenCalled()
})
