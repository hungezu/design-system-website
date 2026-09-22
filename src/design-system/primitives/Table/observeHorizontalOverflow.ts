/** A fixed-column shadow is useful only while the table actually overflows. */
export function observeHorizontalOverflow(element: HTMLElement): () => void {
  let active = true
  const measure = () => {
    if (!active) return
    const value = element.scrollWidth > element.clientWidth + 1 ? 'true' : 'false'
    if (element.dataset.horizontalOverflow !== value) element.dataset.horizontalOverflow = value
  }
  const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
  const observeContent = () => {
    resize?.disconnect()
    resize?.observe(element)
    for (const child of element.children) resize?.observe(child)
    measure()
  }
  const mutation = new MutationObserver(observeContent)
  mutation.observe(element, { childList: true, subtree: true, characterData: true })
  observeContent()
  window.addEventListener('resize', measure)
  void document.fonts?.ready.then(measure)
  return () => { active = false; resize?.disconnect(); mutation.disconnect(); window.removeEventListener('resize', measure) }
}
