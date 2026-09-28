import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COMPONENT_CATALOG } from '../src/design-system/component-catalog'
import { REACT_ARIA_COVERAGE, validateReactAriaCoverage } from '../src/design-system/react-aria-coverage'
import systemManifest from '../system.manifest.json'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const failures = validateReactAriaCoverage(
  COMPONENT_CATALOG.map((component) => component.componentId),
  systemManifest.components.projectScope,
).failures
const packageMetadata = JSON.parse(readFileSync(resolve(root, 'node_modules/react-aria-components/package.json'), 'utf8')) as { version?: string }
const reference = systemManifest.components.foundationCoverage

if (packageMetadata.version !== REACT_ARIA_COVERAGE.baseline.auditedVersion) {
  failures.push(`React Aria 已安装 ${packageMetadata.version ?? '未知版本'}，覆盖基线仍是 ${REACT_ARIA_COVERAGE.baseline.auditedVersion}`)
}
if (reference.source !== 'docs/acceptance/react-aria/coverage.json' || reference.schema !== 'docs/acceptance/react-aria/coverage.schema.json') failures.push('system.manifest.json 的 React Aria 覆盖源或 schema 路径无效')
if (reference.familyCount !== REACT_ARIA_COVERAGE.baseline.familyCount || reference.infrastructureCount !== REACT_ARIA_COVERAGE.baseline.infrastructureCount) failures.push('system.manifest.json 与 React Aria 覆盖基线数量不一致')
for (const path of [reference.source, reference.schema, reference.validator]) if (!existsSync(resolve(root, path))) failures.push(`React Aria 覆盖治理文件不存在：${path}`)
for (const family of REACT_ARIA_COVERAGE.families) {
  if (!existsSync(resolve(root, 'node_modules/react-aria-components', family.id, 'package.json'))) {
    failures.push(`React Aria 安装包中无法解析家族入口：${family.id}`)
  }
}
for (const item of REACT_ARIA_COVERAGE.infrastructure) {
  for (const evidence of item.evidence) if (!existsSync(resolve(root, evidence))) failures.push(`${item.id} 的验收证据不存在：${evidence}`)
}

if (failures.length) {
  for (const failure of failures) console.error(`✗ ${failure}`)
  process.exit(1)
} else {
  const result = validateReactAriaCoverage(COMPONENT_CATALOG.map((component) => component.componentId), systemManifest.components.projectScope)
  console.log(`✓ React Aria 家族基线：${REACT_ARIA_COVERAGE.families.length} 项`)
  console.log(`✓ 公共网站覆盖：${result.publicCovered.length} / ${REACT_ARIA_COVERAGE.baseline.familyCount}`)
  console.log(`✓ 国科信项目覆盖：${result.projectApproved.length} / ${REACT_ARIA_COVERAGE.baseline.familyCount}`)
  console.log(`✓ 项目待适配：${result.projectGaps.length}（公共已有 ${result.publicOnly.length} + 公共缺失 ${result.publicGaps.length}）`)
  console.log(`✓ 辅助能力单独治理：${REACT_ARIA_COVERAGE.infrastructure.length} 项`)
  process.exit(0)
}
