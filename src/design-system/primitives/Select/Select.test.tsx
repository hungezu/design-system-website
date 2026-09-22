// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DSSelect } from './index'
afterEach(cleanup)
it('清空按钮有独立名称、语义图标且不打开选择菜单', () => {
  const onChange = vi.fn()
  render(<DSSelect label="资源" options={[{value:'a',label:'资源 A'}]} defaultValue="a" clearable onChange={onChange}/>)
  fireEvent.focus(screen.getByRole('button', {name:'资源 A 资源'}))
  const clear = screen.getByRole('button', {name:'清空资源'})
  expect(clear.textContent).toBe('')
  expect(clear.querySelector('[data-icon="clear-input"]')).not.toBeNull()
  fireEvent.click(clear)
  expect(onChange).toHaveBeenCalledWith('')
  expect(screen.queryByRole('listbox')).toBeNull()
})
it('必填和只读选择器不提供清空操作', () => {
  const { rerender } = render(<DSSelect label="资源" options={[{value:'a',label:'资源 A'}]} defaultValue="a" clearable required/>)
  fireEvent.focus(screen.getByRole('button', {name:'资源 A 资源'}))
  expect(screen.queryByRole('button', {name:'清空资源'})).toBeNull()
  rerender(<DSSelect label="资源" options={[{value:'a',label:'资源 A'}]} defaultValue="a" clearable readOnly/>)
  expect(screen.queryByRole('button', {name:'清空资源'})).toBeNull()
})
