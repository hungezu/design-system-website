import type { ReactNode } from 'react'
import { DSButton } from '../design-system/primitives/Button/DSButton'
import '../design-system/primitives/Table/Table.css'
export function TableSelectionBar({count,otherPageCount=0,onClear,disabled=false,children,label='批量操作',className=''}:{count:number;otherPageCount?:number;onClear:()=>void;disabled?:boolean;children?:ReactNode;label?:string;className?:string}) {
 if(count===0)return null
 return <section className={`ds-table-bulk ds-table-selection-bar ${className}`} role="region" aria-label={label}>
  <span className="ds-table-bulk__count" role="status" aria-live="polite">已选择 {count} 项{otherPageCount>0&&<span>（含其他页 {otherPageCount} 项）</span>}</span>
  {children}
  <DSButton className="ds-table-selection-clear" size="sm" variant="tertiary" disabled={disabled} onClick={onClear}>取消选择</DSButton>
 </section>
}
