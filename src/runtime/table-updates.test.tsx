// @vitest-environment jsdom
import { Profiler, useState } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DSTable } from './index'

afterEach(cleanup)

describe('Runtime table updates', () => {
  it('settles after its parent rerenders without sorting or pagination', async () => {
    const columns = [{ key: 'name', title: '名称' }]
    const data = [{ id: '1', name: '设计资源' }]
    let commits = 0
    const table = (density: 'compact' | 'comfortable') => (
      <Profiler id="table" onRender={() => {
        commits += 1
        // Bound the regression so a pagination-reset loop cannot hang the test runner.
        if (commits > 20) throw new Error('Table update did not settle')
      }}>
        <DSTable columns={columns} data={data} rowKey={(row) => row.id} density={density} />
      </Profiler>
    )
    const { rerender } = render(table('comfortable'))
    await act(async () => { await Promise.resolve() })
    rerender(table('compact'))
    await act(async () => { await Promise.resolve() })
    expect(screen.getByRole('table').className).toContain('ds-table--compact')
    expect(screen.getByText('设计资源')).toBeTruthy()
    expect(commits).toBeLessThan(20)
  })

  it('keeps ascending, descending and cleared sorting functional', async () => {
    const user = userEvent.setup()
    const columns = [{ key: 'name', title: '名称', sortable: true }]
    const data = [{ id: '1', name: 'B' }, { id: '2', name: 'A' }]
    let commits = 0
    function Fixture() {
      const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
      return <Profiler id="sorting" onRender={() => {
        if (++commits > 30) throw new Error('Sorted table update did not settle')
      }}>
        <DSTable columns={columns} data={data} rowKey={(row) => row.id} sort={sort} onSortChange={setSort} />
      </Profiler>
    }
    render(<Fixture />)
    const values = () => screen.getAllByRole('cell').map((cell) => cell.textContent)
    expect(values()).toEqual(['B', 'A'])
    await user.click(screen.getByRole('button', { name: '名称' }))
    expect(values()).toEqual(['A', 'B'])
    await user.click(screen.getByRole('button', { name: '名称' }))
    expect(values()).toEqual(['B', 'A'])
    await user.click(screen.getByRole('button', { name: '名称' }))
    expect(screen.getByRole('columnheader').getAttribute('aria-sort')).toBe('none')
  })
})

it('action width follows changed content and settles without a render loop', async () => {
  const geometry = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    const width = this.classList.contains('ds-table-actions') ? (this.textContent?.length ?? 0) * 8 : 0
    return {x:0,y:0,left:0,top:0,right:width,bottom:28,width,height:28,toJSON(){return {}}}
  })
  const originalStyle = window.getComputedStyle.bind(window)
  const styles = vi.spyOn(window, 'getComputedStyle').mockImplementation(element => {
    const result = originalStyle(element)
    if (element.classList.contains('ds-table__cell--actions')) return new Proxy(result, {get(target,key){return key==='paddingLeft'||key==='paddingRight'?'16px':Reflect.get(target,key)}})
    return result
  })
  try {
    let commits=0
    const view=(label:string)=><Profiler id="actions" onRender={()=>{if(++commits>20)throw new Error('Action width update did not settle')}}><DSTable columns={[{key:'name',title:'Name'},{key:'actions',title:'Actions',width:260,render:()=> <span className="ds-table-actions">{label}</span>}]} data={[{id:'1',name:'Row'}]} rowKey={row=>row.id}/></Profiler>
    const {container,rerender}=render(view('View'))
    await act(async()=>{})
    expect([...container.querySelectorAll<HTMLElement>('.ds-table__cell--actions')].map(cell=>cell.style.width)).toEqual(['64px','64px'])
    rerender(view('View details'))
    await act(async()=>{})
    expect([...container.querySelectorAll<HTMLElement>('.ds-table__cell--actions')].map(cell=>cell.style.width)).toEqual(['128px','128px'])
    expect(commits).toBeLessThan(10)
  } finally { geometry.mockRestore(); styles.mockRestore() }
})
