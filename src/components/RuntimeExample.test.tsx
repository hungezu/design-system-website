// @vitest-environment jsdom
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { render, cleanup, screen } from '@testing-library/react'
import { COMPONENT_CATALOG } from '../design-system/component-catalog'
import { componentDemoVariants } from '../design-system/component-demo-variants'
import { RuntimeExample } from './RuntimeExample'
beforeAll(()=>{vi.stubGlobal('ResizeObserver',class{observe(){} unobserve(){} disconnect(){}}); window.matchMedia=vi.fn().mockReturnValue({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}})})
afterEach(cleanup)
it.each(COMPONENT_CATALOG.map(item=>[item.componentId]))('%s 提供真实可挂载示例',id=>{
 const {container}=render(<RuntimeExample id={id} />)
 expect(container.textContent).not.toContain('尚未提供独立交互示例')
 expect(container.childElementCount).toBeGreaterThan(0)
})

it.each(COMPONENT_CATALOG.map(item=>[item.componentId]))('%s 提供显式示例而不生成重复的其他变体',id=>{
 const options=componentDemoVariants(id)
 expect(options.length).toBeGreaterThanOrEqual(1)
 expect(options.some(option=>option.id==='alternate')).toBe(false)
 expect(new Set(options.map(option=>option.id)).size).toBe(options.length)
})

it.each(COMPONENT_CATALOG.flatMap(item=>componentDemoVariants(item.componentId).map(option=>[item.componentId,option.id])))('%s / %s 变体可挂载', (id,demoVariant)=>{
 const {container}=render(<RuntimeExample id={id} demoVariant={demoVariant} />)
 expect(container.childElementCount).toBeGreaterThan(0)
})

it('按钮交互配置与实际预览保持一致', () => {
 render(<RuntimeExample id="button" buttonVariant="primary" buttonSemantic="danger" buttonSize="lg" buttonLoading buttonBlock />)
 const button=screen.getByRole('button',{name:'确定'})
 expect(button.className).toContain('ds-btn--primary')
 expect(button.className).toContain('ds-btn--sem-danger')
 expect(button.className).toContain('ds-btn--lg')
 expect(button.getAttribute('aria-busy')).toBe('true')
 expect(button.querySelector('.gkx-button__spinner')).not.toBeNull()
 expect((button as HTMLButtonElement).disabled).toBe(true)
 expect(button.style.width).toBe('100%')
})
