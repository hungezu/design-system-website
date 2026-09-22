// @vitest-environment jsdom
import { useState } from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { DSToast } from './index'
beforeEach(()=>vi.useFakeTimers())
afterEach(()=>{cleanup();vi.useRealTimers()})
const advance=(ms:number)=>act(()=>vi.advanceTimersByTime(ms))
function Fixture({duration=1000,message='通知'}:{duration?:number;message?:string}){const [open,setOpen]=useState(false);return <><button onClick={()=>setOpen(true)}>打开</button><DSToast open={open} onOpenChange={setOpen} message={message} duration={duration}/></>}
it('手动关闭后重开，重新开始完整自动关闭计时',()=>{
 render(<Fixture/>);fireEvent.click(screen.getByText('打开'));advance(200)
 const close=screen.getByLabelText('关闭通知');fireEvent.mouseEnter(close.closest('.owned-toast')!);fireEvent.focus(close);fireEvent.click(close)
 expect(screen.queryByText('通知')).toBeNull();fireEvent.click(screen.getByText('打开'));advance(999);expect(screen.getByText('通知')).toBeTruthy();advance(1);expect(screen.queryByText('通知')).toBeNull()
})
it('hover 和 focus 分别暂停，移出鼠标不能解除仍存在的键盘暂停',()=>{
 render(<Fixture/>);fireEvent.click(screen.getByText('打开'));advance(400)
 const close=screen.getByLabelText('关闭通知'),toast=close.closest('.owned-toast')!
 fireEvent.mouseEnter(toast);fireEvent.focus(close);advance(1500);fireEvent.mouseLeave(toast);advance(1500);expect(screen.getByText('通知')).toBeTruthy()
 fireEvent.blur(close,{relatedTarget:screen.getByText('打开')});advance(599);expect(screen.getByText('通知')).toBeTruthy();advance(1);expect(screen.queryByText('通知')).toBeNull()
})
it('消息更新重启计时，不继承上一条通知的暂停状态',()=>{
 const {rerender}=render(<Fixture/>);fireEvent.click(screen.getByText('打开'));advance(400);fireEvent.mouseEnter(screen.getByText('通知').closest('.owned-toast')!)
 rerender(<Fixture message="新通知"/>);advance(999);expect(screen.getByText('新通知')).toBeTruthy();advance(1);expect(screen.queryByText('新通知')).toBeNull()
})
it('duration=0 持续展示，卸载后清理所有计时器',()=>{
 const {unmount}=render(<Fixture duration={0}/>);fireEvent.click(screen.getByText('打开'));advance(60000);expect(screen.getByText('通知')).toBeTruthy();unmount();expect(vi.getTimerCount()).toBe(0)
})
