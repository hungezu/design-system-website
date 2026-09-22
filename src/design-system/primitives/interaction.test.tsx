// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DSInput, DSTextArea } from './TextField'
import { DSCheckbox, DSRadio, DSCheckboxGroup, DSSwitch, DSForm } from './Forms'
import { DSTabs } from './Navigation'
afterEach(cleanup)
describe('主工程真实控件交互',()=>{
 it('输入和清空恢复焦点，禁止编辑只读字段',async()=>{
  const user=userEvent.setup();const change=vi.fn()
  render(<><DSInput label="名称" clearable onChange={change}/><DSTextArea label="说明" value="保留" readOnly /></>)
  await user.type(screen.getByRole('textbox',{name:'名称'}),'设计系统')
  expect(change).toHaveBeenLastCalledWith('设计系统')
  await user.click(screen.getByRole('button',{name:'清空名称'}))
  expect((screen.getByRole('textbox',{name:'名称'}) as HTMLInputElement).value).toBe('')
  expect(document.activeElement).toBe(screen.getByRole('textbox',{name:'名称'}))
  await user.type(screen.getByRole('textbox',{name:'说明'}),'不能写入')
  expect((screen.getByRole('textbox',{name:'说明'}) as HTMLTextAreaElement).value).toBe('保留')
 })
 it('CheckboxGroup 多选值独立，Switch 和 Radio 键盘工作',async()=>{
  const user=userEvent.setup();const changes=vi.fn()
  render(<><DSCheckboxGroup label="权限" options={[{value:'read',label:'读取'},{value:'write',label:'编辑'}]} onChange={changes}/><DSSwitch label="通知"/><DSRadio label="密度" options={[{value:'a',label:'标准'},{value:'b',label:'紧凑'}]} /></>)
  await user.click(screen.getByRole('checkbox',{name:'读取'}));await user.click(screen.getByRole('checkbox',{name:'编辑'}))
  expect(changes).toHaveBeenLastCalledWith(['read','write'])
  screen.getByRole('switch',{name:'通知'}).focus();await user.keyboard(' ')
  expect((screen.getByRole('switch',{name:'通知'}) as HTMLInputElement).checked).toBe(true)
  await user.click(screen.getByRole('radio',{name:'标准'}));await user.keyboard('{ArrowDown}')
  expect((screen.getByRole('radio',{name:'紧凑'}) as HTMLInputElement).checked).toBe(true)
 })
 it('加载中表单不提交，Tabs 切换更新面板',async()=>{
  const user=userEvent.setup();const submit=vi.fn()
  render(<><DSForm loading onSubmit={submit}><DSCheckbox label="确认"/><button type="submit">提交</button></DSForm><DSTabs label="文档" items={[{id:'a',label:'预览',content:'预览内容'},{id:'b',label:'代码',content:'代码内容'}]} /></>)
  await user.click(screen.getByRole('button',{name:'提交'}));expect(submit).not.toHaveBeenCalled()
  await user.click(screen.getByRole('tab',{name:'代码'}));expect(screen.getByRole('tabpanel').textContent).toBe('代码内容')
 })
})
