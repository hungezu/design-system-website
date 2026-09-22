import { describe, expect, it } from 'vitest'
import { defaultProjectId, getProject, projects } from './index'
import { allAssets, getAsset } from '../assets'

describe('主工程项目上下文', () => {
  it('提供默认项目并保持项目隔离标识', () => {
    expect(getProject(defaultProjectId)?.id).toBe(defaultProjectId)
    expect(projects.length).toBeGreaterThanOrEqual(2)
    expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length)
  })

  it('项目配置只声明自身覆盖与资产，不共享可变引用', () => {
    const gkx = getProject('guokexin')!
    const customer = getProject('test-customer-b')!
    expect(gkx.releaseProjectId).not.toBe(customer.releaseProjectId)
    expect(gkx.customAssetIds).not.toBe(customer.customAssetIds)
    expect(gkx.customAssetIds).toContain('project-gkx-density-rule')
    expect(allAssets.length).toBeGreaterThan(0)
    expect(getAsset('project-gkx-density-rule')?.scope).toBe('project')
    expect(getAsset('project-gkx-density-rule')?.ownerProjectId).toBe('guokexin')
  })
})
