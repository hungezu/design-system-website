// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { RuntimeExample } from './RuntimeExample'
beforeAll(()=>{vi.stubGlobal('ResizeObserver',class{observe(){} unobserve(){} disconnect(){}});window.matchMedia=vi.fn().mockReturnValue({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}})})
afterEach(cleanup)
it('Tag 移除后消失，恢复按钮可还原',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="tag" demoVariant="removable"/>);await user.click(screen.getByLabelText('移除设计'))
 expect(screen.queryByText('设计',{exact:true})).toBeNull();expect(screen.getByRole('status').textContent).toBe('已移除标签')
 await user.click(screen.getByRole('button',{name:'恢复标签'}));expect(screen.getByText('设计',{exact:true})).toBeTruthy()
})
it('标签组按回调移除目标，并可恢复',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="tag-group" demoVariant="removable"/>);await user.click(screen.getByLabelText('移除设计'))
 expect(screen.queryByText('设计',{exact:true})).toBeNull();expect(screen.getByText('开发',{exact:true})).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'恢复标签'}));expect(screen.getByText('设计',{exact:true})).toBeTruthy()
})
it.each([['default','设计规范'],['middle','组件文档'],['end','验收记录']])('分页 %s 展示不同的当前页内容', (demoVariant, expected)=>{
 render(<RuntimeExample id="pagination" demoVariant={demoVariant}/>);expect(screen.getByText(expected,{exact:true})).toBeTruthy()
})
it('中间页示例可向后翻页并返回',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="pagination" demoVariant="middle"/>);await user.click(screen.getByRole('button',{name:'下一页'}));expect(screen.getByText('验收记录',{exact:true})).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'上一页'}));expect(screen.getByText('组件文档',{exact:true})).toBeTruthy()
})
it('图标不同尺寸示例实际输出不同尺寸',()=>{
 const {container,rerender}=render(<RuntimeExample id="icon" demoVariant="sm"/>);const small=container.querySelector('svg')!.outerHTML
 rerender(<RuntimeExample id="icon" demoVariant="lg"/>);expect(container.querySelector('svg')!.outerHTML).not.toBe(small)
})
it('输入框只读且配置清空时保留内容并隐藏清空操作',()=>{
 render(<RuntimeExample id="input" demoVariant="readonly"/>);expect((screen.getByRole('textbox') as HTMLInputElement).readOnly).toBe(true);expect(screen.queryByLabelText('清空项目名称')).toBeNull()
})
it('选中且禁用示例真实输出组合属性，Switch 不接受切换',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="switch" demoVariant="checked-disabled"/>);const control=screen.getByRole('switch') as HTMLInputElement
 expect(control.checked).toBe(true);expect(control.disabled).toBe(true);await user.click(control);expect(control.checked).toBe(true)
})
it('表格区分空数据与无搜索结果',()=>{
 const {rerender}=render(<RuntimeExample id="table" demoVariant="empty"/>);expect(screen.getByText('暂无资源')).toBeTruthy()
 rerender(<RuntimeExample id="table" demoVariant="no-results"/>);expect(screen.getByText('没有符合搜索条件的资源')).toBeTruthy()
})
it('文件超大小后可以重新选择恢复',()=>{
 const {container}=render(<RuntimeExample id="upload" demoVariant="size-limit"/>);const input=container.querySelector('input[type="file"]')!
 fireEvent.change(input,{target:{files:[new File(['x'.repeat(1025)],'large.txt',{type:'text/plain'})]}});expect(screen.getByRole('alert').textContent).toContain('超过大小限制')
 fireEvent.change(input,{target:{files:[new File(['ok'],'small.txt',{type:'text/plain'})]}});expect(screen.queryByRole('alert')).toBeNull();expect(screen.getByRole('status').textContent).toContain('small.txt')
})
it('嵌套浮层示例确实包含可展开的选择器',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="dialog" demoVariant="nested"/>);await user.click(screen.getByRole('button',{name:'编辑资源'}))
 const dialog=screen.getByRole('dialog');await user.click(within(dialog).getByRole('button',{name:/资源类型/}));expect(screen.getByRole('listbox')).toBeTruthy()
})

it('跨页选择在翻页和返回后保留已选行',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="table" demoVariant="paged-selection"/> )
 await user.click(screen.getByRole('checkbox',{name:'选择行 设计规范'}))
 await user.click(screen.getByRole('button',{name:'下一页'}))
 expect(screen.getByRole('cell',{name:'组件文档'})).toBeTruthy()
 await user.click(screen.getByRole('checkbox',{name:'选择行 组件文档'}))
 expect(screen.getByRole('status').textContent).toContain('已选择 2 项')
 await user.click(screen.getByRole('button',{name:'上一页'}))
 expect((screen.getByRole('checkbox',{name:'选择行 设计规范'}) as HTMLInputElement).checked).toBe(true)
})

it('加载抽屉先保护关闭，结束演示后可正常离开',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="drawer" demoVariant="loading"/> )
 await user.click(screen.getByRole('button',{name:'查看详情'}))
 expect((screen.getByLabelText('关闭资源详情') as HTMLButtonElement).disabled).toBe(true)
 await user.click(screen.getByRole('button',{name:'结束加载演示'}))
 expect((screen.getByLabelText('关闭资源详情') as HTMLButtonElement).disabled).toBe(false)
 await user.click(screen.getByLabelText('关闭资源详情'));expect(screen.queryByRole('dialog')).toBeNull()
})

it('多选状态复用表格上方操作条，文字操作真实更新并可取消',async()=>{
 const user=userEvent.setup();render(<RuntimeExample id="table" demoVariant="selection"/>)
 expect(screen.queryByRole('region',{name:'表格批量操作'})).toBeNull()
 const boxes=screen.getAllByRole('checkbox')
 await user.click(boxes[1])
 const bar=screen.getByRole('region',{name:'表格批量操作'})
 expect(bar.querySelector('strong')).toBeNull()
 const disable=within(bar).getByRole('button',{name:'批量停用'})
 expect(disable.getAttribute('data-appearance')).toBe('ghost')
 await user.click(disable);expect(screen.getByText('已停用')).toBeTruthy()
 await user.click(within(bar).getByRole('button',{name:'取消选择'}));expect(screen.queryByRole('region',{name:'表格批量操作'})).toBeNull()
})
