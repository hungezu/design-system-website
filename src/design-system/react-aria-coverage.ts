import coverageData from '../../docs/acceptance/react-aria/coverage.json'

export type ReactAriaCoverageMode = 'direct' | 'composite' | 'semantic-equivalent' | 'planned'

export interface ReactAriaCoverageFamily {
  id: string
  category: string
  public: {
    mode: ReactAriaCoverageMode
    componentIds: string[]
    note?: string
  }
}

export interface ReactAriaCoverageManifest {
  schemaVersion: 'react-aria-coverage/1'
  baseline: {
    package: 'react-aria-components'
    auditedVersion: string
    auditedAt: string
    countingRule: string
    familyCount: number
    infrastructureCount: number
    expectedCoverage: {
      publicCovered: number
      projectApproved: number
    }
    projectPhaseOneFamilyIds: string[]
    projectPhaseTwoFamilyIds: string[]
    projectPhaseThreeFamilyIds: string[]
  }
  families: ReactAriaCoverageFamily[]
  infrastructure: Array<{
    id: string
    businessComponent: false
    status: 'direct' | 'composite' | 'semantic-equivalent' | 'partial' | 'unsupported' | 'planned'
    evidence: string[]
  }>
}

export const REACT_ARIA_COVERAGE = coverageData as ReactAriaCoverageManifest

export function resolveReactAriaCoverage(publicComponentIds: readonly string[], projectComponentIds: readonly string[]) {
  const publicIds = new Set(publicComponentIds)
  const projectIds = new Set(projectComponentIds)
  const publicCovered = REACT_ARIA_COVERAGE.families.filter((family) => family.public.componentIds.some((id) => publicIds.has(id)))
  const projectApproved = publicCovered.filter((family) => family.public.componentIds.some((id) => projectIds.has(id)))
  const publicGaps = REACT_ARIA_COVERAGE.families.filter((family) => !publicCovered.includes(family))
  const projectGaps = REACT_ARIA_COVERAGE.families.filter((family) => !projectApproved.includes(family))
  const publicOnly = publicCovered.filter((family) => !projectApproved.includes(family))

  return { publicCovered, projectApproved, publicGaps, projectGaps, publicOnly }
}

export function validateReactAriaCoverage(publicComponentIds: readonly string[], projectComponentIds: readonly string[]) {
  const manifest = REACT_ARIA_COVERAGE
  const failures: string[] = []
  const familyIds = manifest.families.map((family) => family.id)
  const infrastructureIds = manifest.infrastructure.map((item) => item.id)
  const mappedIds = manifest.families.flatMap((family) => family.public.componentIds.map((componentId) => ({ componentId, family: family.id })))
  const coverage = resolveReactAriaCoverage(publicComponentIds, projectComponentIds)

  if (manifest.schemaVersion !== 'react-aria-coverage/1') failures.push('React Aria 覆盖清单 schemaVersion 无效')
  if (manifest.families.length !== manifest.baseline.familyCount) failures.push(`React Aria 组件家族应为 ${manifest.baseline.familyCount} 项，实际 ${manifest.families.length} 项`)
  if (new Set(familyIds).size !== familyIds.length) failures.push('React Aria 组件家族 ID 重复')
  if (manifest.infrastructure.length !== manifest.baseline.infrastructureCount) failures.push(`React Aria 辅助能力应为 ${manifest.baseline.infrastructureCount} 项，实际 ${manifest.infrastructure.length} 项`)
  if (new Set(infrastructureIds).size !== infrastructureIds.length) failures.push('React Aria 辅助能力 ID 重复')
  if (manifest.infrastructure.some((item) => item.businessComponent !== false)) failures.push('React Aria 辅助能力不得计入业务组件')

  for (const family of manifest.families) {
    const isCovered = family.public.componentIds.some((id) => publicComponentIds.includes(id))
    if (family.public.mode === 'planned' && isCovered) failures.push(`${family.id} 已进入公共目录，覆盖状态仍是 planned`)
    if (family.public.mode !== 'planned' && !isCovered) failures.push(`${family.id} 标记已覆盖，但公共目录没有对应组件`)
  }

  const duplicatedMappings = [...new Set(mappedIds.map((item) => item.componentId))]
    .filter((componentId) => mappedIds.filter((item) => item.componentId === componentId).length > 1)
  if (duplicatedMappings.length) failures.push(`公共组件 ID 被重复映射：${duplicatedMappings.join('、')}`)
  if (coverage.publicCovered.length !== manifest.baseline.expectedCoverage.publicCovered) failures.push(`公共覆盖应为 ${manifest.baseline.expectedCoverage.publicCovered} / ${manifest.baseline.familyCount}，实际 ${coverage.publicCovered.length} / ${manifest.baseline.familyCount}`)
  if (coverage.projectApproved.length !== manifest.baseline.expectedCoverage.projectApproved) failures.push(`项目覆盖应为 ${manifest.baseline.expectedCoverage.projectApproved} / ${manifest.baseline.familyCount}，实际 ${coverage.projectApproved.length} / ${manifest.baseline.familyCount}`)
  if (coverage.projectApproved.some((family) => !coverage.publicCovered.includes(family))) failures.push('项目不得批准公共目录未覆盖的基础家族')
  const approvedFamilies = new Set(coverage.projectApproved.map((family) => family.id))
  const missingPhaseOne = manifest.baseline.projectPhaseOneFamilyIds.filter((id) => !approvedFamilies.has(id))
  if (missingPhaseOne.length) failures.push(`国科信第一批基础家族未全部准入：${missingPhaseOne.join('、')}`)
  const missingPhaseTwo = manifest.baseline.projectPhaseTwoFamilyIds.filter((id) => !approvedFamilies.has(id))
  if (missingPhaseTwo.length) failures.push(`国科信第二批基础家族未全部准入：${missingPhaseTwo.join('、')}`)
  const missingPhaseThree = manifest.baseline.projectPhaseThreeFamilyIds.filter((id) => !approvedFamilies.has(id))
  if (missingPhaseThree.length) failures.push(`国科信第三批基础家族未全部准入：${missingPhaseThree.join('、')}`)

  return { failures, ...coverage }
}
