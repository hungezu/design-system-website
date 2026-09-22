import type { DSTableColumn as BaseColumn } from '../../../runtime/vendor/types/components/base/DSTable'

export interface DSTableColumn<Row> extends BaseColumn<Row> {
  /** Group columns recursively; only leaves read row data or sort. */
  children?: DSTableColumn<Row>[]
  /** Fix a leaf or an entire contiguous group at the table edge. */
  fixed?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
}
export interface HeaderCell<Row> { column:DSTableColumn<Row>; start:number; span:number; rowSpan:number; level:number; parents:string[]; fixed?:'left'|'right' }
export function groupedColumns<Row>(columns:DSTableColumn<Row>[]) {
  const keys=new Set<string>()
  const leaves:Array<{column:DSTableColumn<Row>;parents:string[];fixed?:'left'|'right'}>=[]
  const headers:HeaderCell<Row>[][]=[]
  const depth=(items:DSTableColumn<Row>[]):number=>Math.max(1,...items.map(c=>c.children?.length?1+depth(c.children):1))
  const levels=depth(columns)
  const visit=(items:DSTableColumn<Row>[],level:number,parents:string[],inherited?:'left'|'right')=>{
    for(const column of items){
      if(keys.has(column.key))throw new Error(`重复的表格列 key：${column.key}`)
      keys.add(column.key)
      const start=leaves.length, fixed=column.fixed??inherited??(column.key==='actions'&&!column.children?.length?'right':undefined)
      if(column.children?.length)visit(column.children,level+1,[...parents,column.key],fixed)
      else leaves.push({column,parents,fixed})
      const members=leaves.slice(start),sides=new Set(members.map(item=>item.fixed??'scroll'))
      if(sides.size>1)throw new Error(`分组“${column.title}”不能跨越固定区与滚动区，请将整组固定或移到分组外。`)
      const cell={column,start,span:leaves.length-start,rowSpan:column.children?.length?1:levels-level,level,parents,fixed:members[0]?.fixed}
      ;(headers[level]??=[]).push(cell)
    }
  }
  visit(columns,0,[])
  let region=0
  for(const leaf of leaves){const next=leaf.fixed==='left'?0:leaf.fixed==='right'?2:1;if(next<region)throw new Error('固定列应连续排列在左侧或右侧。');region=next}
  return {leaves,headers,levels}
}
