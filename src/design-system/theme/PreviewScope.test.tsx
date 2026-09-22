// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Button, DialogTrigger, Dialog } from 'react-aria-components'
import { PreviewScope, ScopedPopover } from './PreviewScope'
afterEach(cleanup)
it('Portal继承当前实例变量，不修改根节点或其他实例',()=>{
 vi.stubGlobal('ResizeObserver',class{observe(){} unobserve(){} disconnect(){}})
 render(<><PreviewScope vars={{'--bds-radius-md':'24px'} as React.CSSProperties}><DialogTrigger defaultOpen><Button>打开</Button><ScopedPopover data-testid="portal"><Dialog aria-label="详情">内容</Dialog></ScopedPopover></DialogTrigger></PreviewScope><div data-testid="other" style={{'--bds-radius-md':'4px'} as React.CSSProperties}/></>)
 expect(screen.getByTestId('portal').style.getPropertyValue('--bds-radius-md')).toBe('24px')
 expect(screen.getByTestId('other').style.getPropertyValue('--bds-radius-md')).toBe('4px')
 expect(document.documentElement.style.getPropertyValue('--bds-radius-md')).toBe('')
})

it('打开的 Dialog 完整继承语义与组件变量，并在主题变更后更新', async () => {
 const { DSDialog } = await import('../primitives/Overlays')
 const view = (brand: string) => <PreviewScope vars={{'--brand-primary':brand,'--button-brand-filled-border-default':brand,'--bds-brand':brand} as React.CSSProperties}><DSDialog open onOpenChange={()=>{}} title="主题传递">内容</DSDialog></PreviewScope>
 const { rerender } = render(view('#165DFF'))
 const overlay = () => screen.getByRole('dialog').closest('.owned-overlay') as HTMLElement
 expect(overlay().style.getPropertyValue('--brand-primary')).toBe('#165DFF')
 expect(overlay().style.getPropertyValue('--button-brand-filled-border-default')).toBe('#165DFF')
 rerender(view('#123456'))
 expect(overlay().style.getPropertyValue('--brand-primary')).toBe('#123456')
 expect(overlay().style.getPropertyValue('--bds-brand')).toBe('#123456')
})
it('实测面板只跟踪自己的浮层，所属标识经过 Portal 保留',async()=>{
 const {DSDialog}=await import('../primitives/Overlays');render(<><PreviewScope inspectionId="one" vars={{}}><DSDialog open={false} onOpenChange={()=>{}} title="浮层一">内容</DSDialog></PreviewScope><PreviewScope inspectionId="two" vars={{}}><DSDialog open onOpenChange={()=>{}} title="浮层二">内容</DSDialog></PreviewScope></>)
 expect(screen.getByRole('dialog',{name:'浮层二'}).closest('.owned-overlay')?.getAttribute('data-preview-owner')).toBe('two')
 expect(document.querySelector('.owned-overlay[data-preview-owner="one"]')).toBeNull()
})
