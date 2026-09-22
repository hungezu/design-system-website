// @vitest-environment jsdom
import {cleanup,render,screen,within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach,expect,it} from 'vitest'
import {DSTable} from './index'
import {GroupedTableExample} from '../../../components/GroupedTableExample'
import {groupedPersonColumns} from '../../../data/assets/grouped-table-demo'
import {groupedColumns} from './grouped-columns'
afterEach(cleanup)
it('four-level headers span all descendants and leaves reference their full header chain',()=>{
 render(<GroupedTableExample fixed/>)
 const table=screen.getByRole('table',{name:'人员信息多级表头'})
 const header=(name:string)=>within(table).getByRole('columnheader',{name})
 expect(header('个人信息').getAttribute('colspan')).toBe('4')
 expect(header('居住地址').getAttribute('colspan')).toBe('3')
 expect(header('楼栋信息').getAttribute('colspan')).toBe('2')
 expect(header('姓名').getAttribute('rowspan')).toBe('4')
 expect(header('年龄').getAttribute('rowspan')).toBe('3')
 expect(header('街道').getAttribute('rowspan')).toBe('2')
 expect(header('公司名称').getAttribute('rowspan')).toBe('3')
 expect(table.querySelectorAll('tbody tr')[0].children).toHaveLength(8)
 expect(table.querySelectorAll('tbody tr')[0].children[3].getAttribute('headers')).toContain(header('楼栋信息').id)
})
it('sort, current-page selection, filter reset and integrated pagination work together',async()=>{
 const user=userEvent.setup();const {container}=render(<GroupedTableExample selectable fixed/>)
 await user.click(screen.getByRole('checkbox',{name:'全选当前页'}))
 expect(screen.getByRole('status').textContent).toContain('10')
 await user.click(screen.getByRole('button',{name:'年龄'}));await user.click(screen.getByRole('button',{name:'年龄'}))
 expect(screen.getByRole('columnheader',{name:'年龄'}).getAttribute('aria-sort')).toBe('descending')
 expect(screen.getByRole('table').querySelector('tbody tr')?.textContent).toContain('47')
 await user.click(screen.getByRole('button',{name:'下一页'}))
 expect(screen.getByRole('status').textContent).toContain('10')
 expect(container.querySelector('.ds-table-footer .owned-pagination')).toBeTruthy()
 expect(container.querySelector('.ds-table .owned-pagination')).toBeNull()
 await user.type(screen.getByRole('textbox',{name:'按姓名筛选'}),'不存在')
 expect(screen.queryByRole('status')).toBeNull();expect(container.querySelector('.owned-pagination')).toBeNull()
 expect(screen.getByText('没有匹配的人员，请调整姓名筛选。')).toBeTruthy()
})
it('empty and loading cells span the leaf columns and disable selection',()=>{
 const {rerender}=render(<GroupedTableExample state="empty" selectable/>)
 expect(screen.getByRole('cell',{name:'暂无人员信息。'}).getAttribute('colspan')).toBe('9')
 expect((screen.getByRole('checkbox',{name:'全选当前页'}) as HTMLInputElement).disabled).toBe(true)
 rerender(<GroupedTableExample state="loading" selectable/>)
 expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true')
 expect((screen.getByRole('checkbox',{name:'全选当前页'}) as HTMLInputElement).disabled).toBe(true)
})
it('keeps legacy single headers and rejects ambiguous fixed group boundaries',()=>{
 render(<DSTable columns={[{key:'name',title:'名称'}]} data={[{id:'1',name:'示例'}]} rowKey={row=>row.id} footer={<span>底部内容</span>}/>)
 expect(screen.getByRole('table').querySelector('.ds-table__head')).toBeTruthy()
 expect(screen.getByText('底部内容').closest('.ds-table-footer')).toBeTruthy()
 expect(()=>groupedColumns([{key:'g',title:'分组',children:[{key:'a',title:'A',fixed:'left'},{key:'b',title:'B'}]}])).toThrow('不能跨越')
 expect(groupedColumns(groupedPersonColumns).levels).toBe(4)
})
