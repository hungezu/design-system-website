import { describe, expect, it } from 'vitest'
import { iconAssets } from './icons'
import { iconIdsForProject, iconPackForProject, projectCanAccessIcon } from '../../services/icon-pack'

describe('Icon Registry 公开资源映射', () => {
  it('提供足够的 B 端常用图标且语义 ID 不重复', () => {
    expect(iconAssets.length).toBeGreaterThanOrEqual(120)
    expect(new Set(iconAssets.map((icon) => icon.id)).size).toBe(iconAssets.length)
    expect(iconAssets.every((icon) => Boolean(icon.tags?.[1]))).toBe(true)
  })

  it('每个公开图标都提供线性和面性变体', () => {
    expect(iconAssets.every((icon) => icon.variants.map((variant) => variant.id).join(',') === 'outline,filled')).toBe(true)
  })

  it('项目 Icon Pack 保持显式子集，不随公共库自动扩容', () => {
    expect(iconPackForProject('global')).toHaveLength(iconAssets.length)
    expect(iconPackForProject('guokexin').length).toBeLessThan(iconAssets.length)
    expect(iconPackForProject('test-customer-b').length).toBeLessThan(iconPackForProject('guokexin').length)
    expect(iconIdsForProject('test-customer-b')).toEqual(expect.arrayContaining(['send','copy','stop']))
    expect(new Set(iconIdsForProject('guokexin')).size).toBe(iconIdsForProject('guokexin').length)
    expect(projectCanAccessIcon('guokexin', 'remove-item')).toBe(true)
    expect(projectCanAccessIcon('guokexin', 'icon-remove-item')).toBe(true)
  })
})
