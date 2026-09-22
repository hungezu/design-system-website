import { describe, expect, it } from 'vitest'
import { allAssets } from '../data/assets'
import { assetDestination, componentDestination, contextualAssetDestination, isFoundationAsset, projectDestination } from './asset-navigation'

describe('目录单一归属', () => {
  it('设计基础不包含组件、模式和模板', () => {
    const foundations = allAssets.filter(isFoundationAsset)
    expect(foundations.length).toBeGreaterThan(0)
    expect(foundations.every(asset => ['token', 'icon'].includes(asset.type))).toBe(true)
  })
  it('每种资源只有一个规范地址且无重复 ID', () => {
    expect(new Set(allAssets.map(asset => asset.id)).size).toBe(allAssets.length)
    expect(assetDestination({type:'component',id:'button'})).toBe('/components/button')
    expect(assetDestination({type:'template',id:'template-list'})).toBe('/templates/template-list')
    expect(assetDestination({type:'pattern',id:'query-list'})).toBe('/patterns/query-list')
    expect(assetDestination({type:'token',id:'radius-control'})).toBe('/assets/radius-control')
  })
  it('项目组件详情保留版本与搜索上下文', () => {
    const params = new URLSearchParams('version=1.5.5&q=按钮&view=code')
    expect(componentDestination('/projects/guokexin/components', 'button', params)).toBe('/projects/guokexin/components/button?version=1.5.5&q=%E6%8C%89%E9%92%AE')
    expect(componentDestination('/projects/guokexin/components', null, params)).toBe('/projects/guokexin/components?version=1.5.5&q=%E6%8C%89%E9%92%AE')
  })
  it('项目组件详情保留当前草稿上下文', () => {
    const params = new URLSearchParams('version=draft')
    expect(componentDestination('/projects/guokexin/components', 'tag', params)).toBe('/projects/guokexin/components/tag?version=draft')
  })
  it('项目快捷入口和搜索结果保留冻结版本', () => {
    const params = new URLSearchParams('version=1.5.6')
    expect(projectDestination('guokexin', 'foundations', params)).toBe('/projects/guokexin/foundations?version=1.5.6')
    expect(contextualAssetDestination({ type: 'template', id: 'template-list' }, 'guokexin', '1.5.6')).toBe('/projects/guokexin/templates/template-list?version=1.5.6')
  })
})
