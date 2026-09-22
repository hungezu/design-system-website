import './Pagination.css'
import { DSButton } from '../Button'
import { DSSelect } from '../Select'
import { DSIcon } from '../../../runtime/vendor/runtime.js'

export interface DSPaginationProps {
  page: number
  pageSize: number
  total: number
  pageSizeOptions?: number[]
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  disabled?: boolean
  showTotal?: boolean
  className?: string
}
/** Preserve the Runtime contract while using owned controls and portal theme inheritance. */
export function DSPagination({ page, pageSize, total, pageSizeOptions = [10, 20, 50], onPageChange, onPageSizeChange, disabled = false, showTotal = true, className = '' }: DSPaginationProps) {
  const totalPages = Math.max(1, pageSize > 0 ? Math.ceil(total / pageSize) : 1)
  const effective = Math.min(Math.max(1, page), totalPages)
  const sizes = [...new Set([...pageSizeOptions, pageSize].filter(size => Number.isFinite(size) && size > 0))].sort((a, b) => a - b)
  const start = Math.max(1, Math.min(effective - 2, totalPages - 4))
  const visiblePages = Array.from({ length: Math.min(5, totalPages) }, (_, index) => start + index)
  const go = (next: number) => { if (!disabled) onPageChange?.(Math.min(Math.max(1, next), totalPages)) }
  return <nav className={`ds-pagination owned-pagination${disabled ? ' is-disabled' : ''}${className ? ` ${className}` : ''}`} aria-label="分页">
    {showTotal && <span className="ds-pagination__total">共 {total} 条</span>}
    <div className="owned-pagination__controls">
    <div className="ds-pagination__items">
      <span className="ds-pagination__nav">
        <DSButton size="sm" variant="secondary" aria-label="首页" icon={<DSIcon name="pagination-first" decorative size="sm" />} disabled={disabled || effective <= 1} onClick={() => go(1)} className="ds-pagination__btn ds-pagination__nav-boundary" />
        <DSButton size="sm" variant="secondary" aria-label="上一页" icon={<DSIcon name="pagination-previous" decorative size="sm" />} disabled={disabled || effective <= 1} onClick={() => go(effective - 1)} className="ds-pagination__btn" />
      </span>
      <span className="ds-pagination__pages">{visiblePages.map(number => <DSButton key={number} size="sm" variant={number === effective ? 'primary' : 'secondary'} className={`ds-pagination__btn ds-pagination__page${Math.abs(number - effective) > 1 ? ' ds-pagination__page--far' : ''}`} aria-current={number === effective ? 'page' : undefined} aria-label={`第 ${number} 页`} disabled={disabled} onClick={() => go(number)}>{number}</DSButton>)}</span>
      <span className="ds-pagination__nav">
        <DSButton size="sm" variant="secondary" aria-label="下一页" icon={<DSIcon name="pagination-next" decorative size="sm" />} disabled={disabled || effective >= totalPages} onClick={() => go(effective + 1)} className="ds-pagination__btn" />
        <DSButton size="sm" variant="secondary" aria-label="末页" icon={<DSIcon name="pagination-last" decorative size="sm" />} disabled={disabled || effective >= totalPages} onClick={() => go(totalPages)} className="ds-pagination__btn ds-pagination__nav-boundary" />
      </span>
    </div>
    <div className="ds-pagination__size"><DSSelect label="每页条数" labelVisuallyHidden size="sm" options={sizes.map(number => ({ value: String(number), label: `${number}条` }))} value={String(pageSize)} disabled={disabled || !onPageSizeChange || sizes.length < 2} onChange={value => { const next = Number(value); if (!disabled && sizes.includes(next)) onPageSizeChange?.(next) }} /></div>
    </div>
  </nav>
}
