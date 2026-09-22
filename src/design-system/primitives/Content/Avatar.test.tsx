// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { DSAvatar } from './index'
afterEach(cleanup)
it('图片失败后更换 src，重新渲染图片而非继续保留失败状态',()=>{
 const {container,rerender}=render(<DSAvatar name="设计师" src="/missing.png"/>);fireEvent.error(container.querySelector('img')!)
 expect(container.querySelector('img')).toBeNull();expect(screen.getByText('设')).toBeTruthy()
 rerender(<DSAvatar name="设计师" src="/valid.png"/>);expect(container.querySelector('img')?.getAttribute('src')).toBe('/valid.png')
 rerender(<DSAvatar name="设计师" src="/missing.png"/>);expect(container.querySelector('img')).not.toBeNull()
})
it('无图片、空名称及 Unicode 名称仍提供可读替代内容',()=>{
 const {container,rerender}=render(<DSAvatar name=""/>);expect(screen.getByRole('img',{name:'用户头像'})).toBeTruthy();expect(container.querySelector('[data-icon="user"]')).not.toBeNull()
 rerender(<DSAvatar name="😀设计师"/>);expect(container.textContent).toBe('😀')
})
