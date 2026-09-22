import {people,groupedPersonColumns} from '../data/assets/grouped-table-demo'
import {TableSelectionBar} from './TableSelectionBar'
import {useMemo,useState} from 'react'
import {DSTable,DSPagination,DSInput} from '../runtime'
export function GroupedTableExample({fixed=false,selectable=false,state='ready'}:{fixed?:boolean;selectable?:boolean;state?:'ready'|'empty'|'loading'}){
 const [query,setQuery]=useState(''),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(10),[selected,setSelected]=useState<string[]>([])
 const [sort,setSort]=useState<{key:string;dir:'asc'|'desc'}|null>(null)
 const columns=useMemo(()=>fixed?groupedPersonColumns:groupedPersonColumns.map(column=>({...column,fixed:undefined})),[fixed])
 const data=state==='empty'?[]:people.filter(row=>row.name.includes(query.trim()))
 const ordered=sort?[...data].sort((a,b)=>(sort.dir==='asc'?1:-1)*(a.age-b.age)):data
 const pageIds=new Set(ordered.slice((page-1)*pageSize,page*pageSize).map(row=>row.id))
 return <section className="grouped-table-example" aria-label="多级表头示例">
  <DSInput label="按姓名筛选" value={query} disabled={state==='loading'} clearable onChange={value=>{setQuery(value);setPage(1);setSelected([])}}/>
  <TableSelectionBar label="多级表头批量操作" count={selected.length} otherPageCount={selected.filter(id=>!pageIds.has(id)).length} onClear={()=>setSelected([])} disabled={state==='loading'}/>
  <DSTable aria-label="人员信息多级表头" columns={columns} data={data} rowKey={row=>row.id} stickyHeader={fixed} selectable={selectable} selectedRowKeys={selected} onSelectionChange={setSelected} sort={sort} onSortChange={setSort} loading={state==='loading'}
   emptyState={query?'没有匹配的人员，请调整姓名筛选。':'暂无人员信息。'} pagination={{page,pageSize,onPageChange:setPage}}
   footer={data.length>0&&<DSPagination total={data.length} page={page} pageSize={pageSize} pageSizeOptions={[5,10,20]} disabled={state==='loading'} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/>}/>
 </section>
}
