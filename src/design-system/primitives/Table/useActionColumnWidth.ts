import { useLayoutEffect, useRef, useState } from 'react'
import { observeHorizontalOverflow } from './observeHorizontalOverflow'

/** Keep the action header and rows aligned without reserving unused column space. */
export function useActionColumnWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number>()
  useLayoutEffect(() => ref.current ? observeHorizontalOverflow(ref.current) : undefined, [])
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const cells = [...root.querySelectorAll<HTMLElement>('.ds-table__cell--actions')]
    const content = cells.flatMap(cell => [...cell.children] as HTMLElement[])
    let active = true
    const measure = () => {
      if (!active) return
      const next = Math.ceil(Math.max(0, ...cells.map(cell => {
        const css = getComputedStyle(cell)
        const bounds = [...cell.children].map(child => child.getBoundingClientRect())
        const contentWidth = bounds.length ? Math.max(...bounds.map(rect => rect.right)) - Math.min(...bounds.map(rect => rect.left)) : 0
        return contentWidth + parseFloat(css.paddingLeft || '0') + parseFloat(css.paddingRight || '0')
      })))
      if (next > 0) setWidth(previous => previous === next ? previous : next)
    }
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    content.forEach(element => observer?.observe(element))
    void document.fonts?.ready.then(measure)
    return () => { active = false; observer?.disconnect() }
  })
  return { ref, width }
}
