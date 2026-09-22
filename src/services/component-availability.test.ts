import { describe, expect, it } from 'vitest'
import { COMPONENT_CATALOG } from '../design-system/component-catalog'
import { guokexinProject } from '../data/projects/guokexin'
import { componentsForProjectContext } from './component-availability'

describe('项目组件上下文', () => {
  it('草稿展示项目源码范围', () => {
    expect(componentsForProjectContext(COMPONENT_CATALOG, guokexinProject.componentIds)).toHaveLength(34)
  })

  it('冻结版本只展示 manifest 已发布组件', () => {
    const released = ['button', 'select', 'input', 'table', 'pagination', 'dialog', 'icon']
    const result = componentsForProjectContext(COMPONENT_CATALOG, guokexinProject.componentIds, released)
    expect(result.map((component) => component.componentId)).toEqual(['button', 'input', 'select', 'table', 'pagination', 'dialog'])
    expect(result.some((component) => component.componentId === 'tag')).toBe(false)
  })
})
