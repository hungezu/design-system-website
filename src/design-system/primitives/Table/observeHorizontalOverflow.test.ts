// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { observeHorizontalOverflow } from './observeHorizontalOverflow'

it('tracks fitting, overflowing and resized tables and stops after cleanup', async () => {
  let resize: () => void = () => {}
  vi.stubGlobal('ResizeObserver', class { constructor(callback: () => void) { resize = callback } observe() {} disconnect() {} })
  const wrapper = document.createElement('div')
  wrapper.append(document.createElement('table'))
  let client = 800, scroll = 800
  Object.defineProperties(wrapper, { clientWidth: {get:()=>client}, scrollWidth: {get:()=>scroll} })
  const stop = observeHorizontalOverflow(wrapper)
  expect(wrapper.dataset.horizontalOverflow).toBe('false')
  scroll=980;resize()
  expect(wrapper.dataset.horizontalOverflow).toBe('true')
  client=1000;resize()
  expect(wrapper.dataset.horizontalOverflow).toBe('false')
  scroll=1200;wrapper.firstElementChild!.append(document.createElement('tr'))
  await Promise.resolve()
  expect(wrapper.dataset.horizontalOverflow).toBe('true')
  stop();client=1500;resize();window.dispatchEvent(new Event('resize'))
  expect(wrapper.dataset.horizontalOverflow).toBe('true')
  vi.unstubAllGlobals()
})
