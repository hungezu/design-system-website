import { describe, expect, it } from 'vitest'
import { isProductRoute } from './routes'

describe('主工程路由信息架构', () => {
  it('保留现有页面并暴露新的产品入口', () => {
    expect(isProductRoute('/')).toBe(true)
    expect(isProductRoute('/quick-start')).toBe(true)
    expect(isProductRoute('/components')).toBe(true)
    expect(isProductRoute('/patterns/query-list')).toBe(true)
    expect(isProductRoute('/workbench')).toBe(true)
    expect(isProductRoute('/projects/guokexin/foundations/theme')).toBe(true)
    expect(isProductRoute('/projects/guokexin/templates/template-list')).toBe(true)
  })
})
