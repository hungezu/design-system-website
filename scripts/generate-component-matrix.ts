import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import systemManifest from '../system.manifest.json'
import { componentAssets } from '../src/data/assets/components'
import { RUNTIME_COMPONENT_REGISTRY } from '../src/runtime/registry'
import { componentDisplayName } from '../src/design-system/component-catalog'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const rows = systemManifest.components.projectScope.map((componentId) => {
  const runtime = RUNTIME_COMPONENT_REGISTRY[componentId]
  const asset = componentAssets.find((item) => item.id === componentId || item.id === `component-${componentId}`)
  return `| ${componentDisplayName(componentId)} | \`${componentId}\` | \`${runtime?.runtimeExport ?? '缺失'}\` | ${asset?.tokens.length ?? 0} | ${asset?.states.map((state) => state.id).join(' / ') || '缺失'} | ${asset?.bindings?.react ? '已绑定' : '缺失'} | ${asset?.bindings?.storybook ? '已绑定' : '待补充'} | ${asset?.bindings?.figma ? '已绑定' : '待补充'} |`
})

const markdown = `# 国科信项目组件矩阵

> 由 \`scripts/generate-component-matrix.ts\` 从 \`system.manifest.json\`、Runtime Registry 和 ComponentAsset 自动生成，请勿手工维护清单。

| 组件 | ID | Runtime | Token 数 | 状态 | React | Storybook | Figma |
| --- | --- | --- | ---: | --- | --- | --- | --- |
${rows.join('\n')}

## 准入规则

- React Binding、Token 与状态契约必须完整，才能进入项目草稿组件目录。
- Frozen 版本只展示其 \`manifest.availableComponents\` 中已包含的组件。
- Storybook 和 Figma 状态必须如实呈现；未绑定不得宣称同步完成。
`

writeFileSync(resolve(projectRoot, 'docs/COMPONENT-MATRIX.md'), markdown)
console.log(`Generated component matrix: ${rows.length} project components`)
