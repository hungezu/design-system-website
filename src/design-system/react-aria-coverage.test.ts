import { describe, expect, it } from 'vitest'
import { COMPONENT_CATALOG } from './component-catalog'
import { REACT_ARIA_COVERAGE, resolveReactAriaCoverage, validateReactAriaCoverage } from './react-aria-coverage'
import systemManifest from '../../system.manifest.json'

const publicIds = COMPONENT_CATALOG.map((component) => component.componentId)
const projectIds = systemManifest.components.projectScope

describe('React Aria 基础家族覆盖', () => {
  it('覆盖清单必须与公共目录和项目准入保持一致', () => {
    expect(validateReactAriaCoverage(publicIds, projectIds).failures).toEqual([])
  })

  it('可稳定派生公共缺口和项目缺口', () => {
    const result = resolveReactAriaCoverage(publicIds, projectIds)
    expect(result.publicGaps).toEqual([])
    expect(result.publicCovered).toHaveLength(54)
    expect(result.projectApproved).toHaveLength(54)
    expect(result.publicOnly).toHaveLength(0)
    expect(result.projectGaps).toHaveLength(0)
    expect(REACT_ARIA_COVERAGE.baseline.projectPhaseOneFamilyIds.every((id) => result.projectApproved.some((family) => family.id === id))).toBe(true)
    expect(REACT_ARIA_COVERAGE.baseline.projectPhaseTwoFamilyIds.every((id) => result.projectApproved.some((family) => family.id === id))).toBe(true)
    expect(REACT_ARIA_COVERAGE.baseline.projectPhaseThreeFamilyIds.every((id) => result.projectApproved.some((family) => family.id === id))).toBe(true)
  })

  it('辅助能力不混入 54 个业务组件家族', () => {
    expect(REACT_ARIA_COVERAGE.infrastructure).toHaveLength(6)
    expect(REACT_ARIA_COVERAGE.infrastructure.every((item) => item.businessComponent === false)).toBe(true)
  })
})
