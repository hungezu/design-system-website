import { useLayoutEffect, useRef, type PropsWithChildren } from 'react'
import { observeHorizontalOverflow } from '../design-system/primitives/Table/observeHorizontalOverflow'

export function AccessTableScroll({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => ref.current ? observeHorizontalOverflow(ref.current) : undefined, [])
  return <div className="access-table-scroll" ref={ref}>{children}</div>
}
