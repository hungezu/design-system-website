import { useId, useLayoutEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { DSTable as LegacyTable, DSIcon } from '../../../runtime/vendor/runtime.js'
import type { DSTableProps as LegacyProps } from '../../../runtime/vendor/types/components/base/DSTable'
import { DSCheckbox } from '../Forms'
import { useActionColumnWidth } from './useActionColumnWidth'
import { groupedColumns, type DSTableColumn, type HeaderCell } from './grouped-columns'
import './Table.css'
export type { DSTableColumn } from './grouped-columns'
export interface DSTableProps<Row> extends Omit<LegacyProps<Row>,'columns'> {
  columns:DSTableColumn<Row>[]
  /** Footer stays outside the scroll area; compose DSPagination here. */
  footer?:ReactNode
  variant?:'primary'|'secondary'
  'aria-label'?:string
}
export function DSTable<Row>({footer,variant='primary',...props}:DSTableProps<Row>){
  const structured=props.columns.some(column=>column.children?.length||column.fixed||column.align)
  return <div className={`ds-table-surface ds-table-surface--${variant}`}>
    {structured?<GroupedTable {...props}/>:<LegacyTable {...props}/>}
    {footer!=null&&footer!==false&&<div className="ds-table-footer">{footer}</div>}
  </div>
}
const valueOf=<Row,>(row:Row,key:string)=>(row as Record<string,unknown>)[key]
function GroupedTable<Row>({columns,data,rowKey,loading=false,emptyState,selectable=false,selectedRowKeys=[],onSelectionChange,isRowSelectable,sort,onSortChange,pagination,density='default',stickyHeader=false,className='', 'aria-label':label='数据表格'}:DSTableProps<Row>){
  const model=useMemo(()=>groupedColumns(columns),[columns])
  const {ref,width:actionWidth}=useActionColumnWidth()
  const [measured,setMeasured]=useState<Record<string,number>>({})
  const id=useId()
  const leafKeys=model.leaves.map(item=>item.column.key).join('|')
  useLayoutEffect(()=>{
    const root=ref.current;if(!root)return
    const nodes=[...root.querySelectorAll<HTMLElement>('[data-leaf-key]')]
    const update=()=>{root.style.setProperty('--ds-grouped-message-width',`${Math.max(0,root.clientWidth-32)}px`);const next=Object.fromEntries(nodes.map(node=>[node.dataset.leafKey!,node.getBoundingClientRect().width]));setMeasured(old=>Object.keys(next).every(key=>Math.abs((old[key]??0)-next[key])<.1)?old:next)}
    update();const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(update)
    observer?.observe(root);nodes.forEach(node=>observer?.observe(node));return()=>observer?.disconnect()
  },[leafKeys,ref])
  const widths=model.leaves.map(({column})=>column.key==='actions'&&actionWidth?actionWidth:column.width??140)
  const actual=model.leaves.map(({column},index)=>measured[column.key]||widths[index])
  const selectionWidth=selectable?40:0
  const fixedStyle=(start:number,span=1,fixed?:'left'|'right'):CSSProperties=>fixed==='left'?{left:selectionWidth+actual.slice(0,start).reduce((a,b)=>a+b,0)}:fixed==='right'?{right:actual.slice(start+span).reduce((a,b)=>a+b,0)}:{}
  const sorted=useMemo(()=>{
    if(!sort||!model.leaves.some(item=>item.column.key===sort.key&&item.column.sortable))return data
    return [...data].sort((a,b)=>{const x=valueOf(a,sort.key),y=valueOf(b,sort.key);return (sort.dir==='asc'?1:-1)*(typeof x==='number'&&typeof y==='number'?x-y:String(x??'').localeCompare(String(y??''),'zh-CN',{numeric:true}))})
  },[data,sort,model])
  const page=Math.min(Math.max(1,pagination?.page??1),Math.max(1,Math.ceil(data.length/(pagination?.pageSize||data.length||1))))
  const visible=pagination?sorted.slice((page-1)*pagination.pageSize,page*pagination.pageSize):sorted
  const available=loading?[]:visible.filter(row=>!isRowSelectable||isRowSelectable(row))
  const all=available.length>0&&available.every(row=>selectedRowKeys.includes(rowKey(row)))
  const some=available.some(row=>selectedRowKeys.includes(rowKey(row)))
  const select=(row:Row)=>{if(!selectable||loading||(isRowSelectable&&!isRowSelectable(row)))return;const key=rowKey(row);onSelectionChange?.(selectedRowKeys.includes(key)?selectedRowKeys.filter(id=>id!==key):[...selectedRowKeys,key])}
  const selectPage=()=>onSelectionChange?.(all?selectedRowKeys.filter(key=>!available.some(row=>rowKey(row)===key)):[...new Set([...selectedRowKeys,...available.map(rowKey)])])
  const headerId=(key:string)=>`${id}-${encodeURIComponent(key)}`
  const renderHeader=(cell:HeaderCell<Row>)=>{
    const {column,start,span,rowSpan,fixed}=cell,group=!!column.children?.length,canSort=!group&&column.sortable&&!!onSortChange,active=sort?.key===column.key
    return <th key={column.key} id={headerId(column.key)} scope={group?'colgroup':'col'} colSpan={span} rowSpan={rowSpan}
      data-leaf-key={!group?column.key:undefined} data-last={start+span===model.leaves.length||undefined} data-fixed={fixed} data-group={group||undefined}
      className={column.key==='actions'?'ds-table__cell--actions':undefined}
      aria-sort={canSort?(active?sort?.dir==='asc'?'ascending':'descending':'none'):undefined}
      style={{...fixedStyle(start,span,fixed),textAlign:group?'center':column.align??'left'}}>
      {canSort?<button type="button" className="ds-table__sort" disabled={loading} onClick={()=>onSortChange?.(!active?{key:column.key,dir:'asc'}:sort?.dir==='asc'?{key:column.key,dir:'desc'}:null)}>
        <span>{column.title}</span><DSIcon name={active?sort?.dir==='asc'?'sort-ascending':'sort-descending':'sort'} decorative size="xs"/>
      </button>:<span>{column.title}</span>}
    </th>
  }
  return <div ref={ref} className={`ds-table ds-table--grouped ds-table--${density}${stickyHeader?' ds-table--sticky':''}${className?` ${className}`:''}`}>
    <table className="ds-grouped-table" aria-label={label} aria-busy={loading||undefined} style={{width:widths.reduce((a,b)=>a+b,selectionWidth),minWidth:'100%'}}>
      <colgroup>{selectable&&<col style={{width:40}}/>}{model.leaves.map(({column},index)=><col key={column.key} style={{width:widths[index]}}/>)}</colgroup>
      <thead>{model.headers.map((headers,index)=><tr key={index}>
        {index===0&&selectable&&<th rowSpan={model.levels} scope="col" className="ds-grouped-select" data-fixed="left" style={{left:0}}><DSCheckbox label="全选当前页" labelVisuallyHidden checked={all} indeterminate={some&&!all} disabled={!available.length} onChange={selectPage}/></th>}
        {headers.map(renderHeader)}
      </tr>)}</thead>
      <tbody>{loading||!visible.length?<tr><td colSpan={model.leaves.length+(selectable?1:0)} className="ds-grouped-state"><div className="ds-grouped-state-message">{loading?'加载中…':emptyState??'暂无数据'}</div></td></tr>:visible.map(row=>{
        const key=rowKey(row),disabled=!!isRowSelectable&&!isRowSelectable(row),selected=selectedRowKeys.includes(key)
        return <tr key={key} data-selected={selectable&&selected||undefined} data-disabled={disabled||undefined} onClick={event=>{if((event.target as Element).closest('button,input,a,select,textarea,label,[role="checkbox"],[role="switch"],[role="button"],[role="combobox"]'))return;select(row)}}>
          {selectable&&<td className="ds-grouped-select" data-fixed="left" style={{left:0}}><DSCheckbox label={`选择行 ${String(valueOf(row,model.leaves[0]?.column.key)??key)}`} labelVisuallyHidden checked={selected} disabled={disabled} onChange={()=>select(row)}/></td>}
          {model.leaves.map(({column,parents,fixed},index)=><td key={column.key} headers={[...parents,column.key].map(headerId).join(' ')} data-fixed={fixed}
            className={column.key==='actions'?'ds-table__cell--actions':undefined} style={{...fixedStyle(index,1,fixed),textAlign:column.align??'left'}}>
            <div className={column.ellipsis===false?'ds-grouped-cell':'ds-grouped-cell ds-ellipsis'} title={!column.render?String(valueOf(row,column.key)??''):undefined}>{column.render?column.render(row):String(valueOf(row,column.key)??'')}</div>
          </td>)}
        </tr>
      })}</tbody>
    </table>
  </div>
}
