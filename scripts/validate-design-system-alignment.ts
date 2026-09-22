import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { guokexinProject } from '../src/data/projects/guokexin'
import { GUOKEXIN_BRAND_TOKENS } from '../src/instances/guokexin/theme'
import { runtimeThemeAliases } from '../src/design-system/theme/runtimeThemeAliases'
import { iconPackForProject } from '../src/services/icon-pack'
import { iconAssets } from '../src/data/assets/icons'
import { getIcon } from '../src/runtime/vendor/runtime.js'
import systemManifest from '../system.manifest.json'
import { buttonRecipeTokens } from '../src/data/components/button-recipe-tokens'
import { componentAssets } from '../src/data/assets/components'
import { RUNTIME_COMPONENT_REGISTRY } from '../src/runtime/registry'
import runtimeApi from '../src/data/generated/runtime-api.json'

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const failures: string[] = []
if (systemManifest.appUi.tokenNamespace !== '--app-' || systemManifest.appUi.inheritsProjectBrand) failures.push('system.manifest.json 的 App UI Token 边界无效')
if (systemManifest.icons.registry !== 'src/runtime/vendor/runtime.js#ICON_REGISTRY') failures.push('system.manifest.json 未将 Runtime Icon Registry 设为图标权威源')
const manifestComponentIds = new Set(systemManifest.components.projectScope)
if (manifestComponentIds.size !== guokexinProject.componentIds.length || guokexinProject.componentIds.some((componentId) => !manifestComponentIds.has(componentId))) failures.push('system.manifest.json 与国科信 project.componentIds 不一致')
for (const componentId of systemManifest.components.projectScope) {
  const registry = RUNTIME_COMPONENT_REGISTRY[componentId]
  const asset = componentAssets.find((item) => item.id === componentId || item.id === `component-${componentId}`)
  if (!registry) failures.push(`项目组件 ${componentId} 未进入 Runtime Registry`)
  if (registry && !fs.existsSync(path.join(projectRoot, registry.sourcePath))) failures.push(`项目组件 ${componentId} 的 Runtime sourcePath 不存在`)
  if (!asset) failures.push(`项目组件 ${componentId} 缺少 ComponentAsset`)
  if (asset && (!asset.bindings?.react || asset.bindings.react.exportName !== registry?.runtimeExport)) failures.push(`项目组件 ${componentId} 的 React Binding 与 Runtime Registry 不一致`)
  const declaredProps = registry ? (runtimeApi as Record<string, unknown[]>)[registry.runtimeExport] : undefined
  if (asset?.bindings?.react && !Object.keys(asset.bindings.react.props).length && !declaredProps?.length) failures.push(`项目组件 ${componentId} 的 React Binding 缺少 Props 契约`)
  if (asset?.bindings?.react && !fs.existsSync(path.join(projectRoot, asset.bindings.react.sourcePath))) failures.push(`项目组件 ${componentId} 的 React Binding sourcePath 不存在`)
  if (asset && (!asset.tokens.length || !asset.states.length)) failures.push(`项目组件 ${componentId} 缺少 Token 或状态契约`)
}

const expectedProjectTokens = {
  'brand-primary': GUOKEXIN_BRAND_TOKENS.primary,
  'brand-hover': GUOKEXIN_BRAND_TOKENS.hover,
  'brand-active': GUOKEXIN_BRAND_TOKENS.active,
  'brand-secondary': GUOKEXIN_BRAND_TOKENS.subtle,
} as const

const relativeLuminance = (hex: string) => {
  const channels = [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16) / 255)
    .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}
const contrast = (left: string, right: string) => {
  const values = [relativeLuminance(left), relativeLuminance(right)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}
for (const color of [GUOKEXIN_BRAND_TOKENS.primary, GUOKEXIN_BRAND_TOKENS.active]) {
  if (contrast('#FFFFFF', color) < 4.5) failures.push(`白色小字与品牌操作色 ${color} 对比度未达 4.5:1`)
}
if (buttonRecipeTokens.find((token) => token.id === 'button-brand-filled-bg-hover')?.defaultValue !== 'var(--brand-active)') {
  failures.push('品牌实心按钮 Hover 必须使用通过白字对比度的 brand-active')
}

for (const [tokenId, expected] of Object.entries(expectedProjectTokens)) {
  const actual = guokexinProject.tokenOverrides[tokenId]
  if (actual !== expected) failures.push(`国科信 ${tokenId} 应为 ${expected}，实际为 ${actual ?? '未定义'}`)
}

const generatedCss = fs.readFileSync(path.join(projectRoot, 'src/design-system/tokens.css'), 'utf8')
const guokexinBlock = generatedCss.match(/\.theme-guokexin\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
for (const [tokenId, expected] of Object.entries(expectedProjectTokens)) {
  if (!guokexinBlock.includes(`--${tokenId}: ${expected};`)) {
    failures.push(`生成 CSS 的 --${tokenId} 未与国科信源码基准一致`)
  }
}

const expectedRuntimeAliases = {
  '--bds-brand': 'var(--brand-primary)',
  '--bds-brand-default': 'var(--brand-primary)',
  '--bds-brand-hover': 'var(--brand-hover)',
  '--bds-brand-active': 'var(--brand-active)',
  '--bds-brand-light': 'var(--brand-secondary)',
  '--bds-focus-ring': 'var(--brand-primary)',
} as const
for (const [alias, expected] of Object.entries(expectedRuntimeAliases)) {
  if (runtimeThemeAliases[alias as keyof typeof runtimeThemeAliases] !== expected) {
    failures.push(`Runtime 别名 ${alias} 未指向 ${expected}`)
  }
}

const projectPack = iconPackForProject('guokexin')
const projectRuntimeIds = projectPack.map((icon) => icon.tags?.[1]).filter((id): id is string => Boolean(id))
const requiredSemanticIcons = ['close', 'clear-input', 'remove-item']
for (const iconId of requiredSemanticIcons) {
  if (!projectRuntimeIds.includes(iconId)) failures.push(`国科信 Icon Pack 缺少语义图标 ${iconId}`)
}
for (const asset of iconAssets) {
  const runtimeId = asset.tags?.[1]
  const registryItem = runtimeId ? getIcon(runtimeId) : undefined
  if (!registryItem) failures.push(`资源目录 ${asset.id} 未映射到 Runtime Icon Registry`)
  else if (registryItem.status !== 'published' && registryItem.status !== 'deprecated') failures.push(`资源目录 ${asset.id} 引用不可调用图标 ${runtimeId}`)
}

const hardcodedColorPattern = /#[0-9a-f]{3,8}\b|rgba?\(/i
const appTokensCss = fs.readFileSync(path.join(projectRoot, 'src/styles/app-tokens.css'), 'utf8')
if (/--button-[a-z0-9-]+\s*:/.test(appTokensCss)) failures.push('App UI Token 不得改写项目 Button Recipe Token')
const hardcodedColorTargets = [
  path.join(projectRoot, 'src/styles/index.css'),
  path.join(projectRoot, 'src/pages/ThemeEditor.tsx'),
  path.join(projectRoot, 'src/services/workbench-draft.ts'),
  ...fs.readdirSync(path.join(projectRoot, 'src/design-system/primitives'), { recursive: true })
    .filter((entry): entry is string => typeof entry === 'string' && /\.(css|tsx)$/.test(entry) && !/\.test\./.test(entry) && !entry.startsWith('Colors/'))
    .map((entry) => path.join(projectRoot, 'src/design-system/primitives', entry)),
]
for (const file of hardcodedColorTargets) {
  const lines = fs.readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    if (hardcodedColorPattern.test(line)) failures.push(`未授权硬编码颜色：${path.relative(projectRoot, file)}:${index + 1}`)
  })
}
const runtimeCssPath = path.join(projectRoot, 'src/runtime/vendor/runtime.css')
fs.readFileSync(runtimeCssPath, 'utf8').split('\n').forEach((line, index) => {
  if (hardcodedColorPattern.test(line) && !line.includes('var(')) failures.push(`Runtime CSS 存在未经 Token 包装的颜色：${path.relative(projectRoot, runtimeCssPath)}:${index + 1}`)
})

if (failures.length) {
  for (const failure of failures) console.error(`✗ ${failure}`)
  process.exitCode = 1
} else {
  console.log(`✓ 国科信源码品牌基准已对齐：${GUOKEXIN_BRAND_TOKENS.primary}`)
  console.log(`✓ Runtime 品牌别名已对齐：${Object.keys(expectedRuntimeAliases).length} 项`)
  console.log(`✓ 项目 Icon Pack 语义入口已验证：${new Set(projectRuntimeIds).size} 个唯一 Runtime ID`)
  console.log(`✓ 资源目录已映射到 Runtime Icon Registry：${iconAssets.length} 条`)
  console.log(`✓ 项目组件资产、Binding 与 Runtime Registry 已对齐：${systemManifest.components.projectScope.length} 个`)
}

const catalogPath = path.join(projectRoot, 'public/release-assets/index.json')
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')) as Array<{ dir: string; projectId: string; version: string; migrationStatus: string }>
const latest = catalog.find((entry) => entry.projectId === guokexinProject.releaseProjectId)
if (latest?.migrationStatus === 'frozen') {
  const releaseCss = fs.readFileSync(path.join(projectRoot, 'public/release-assets', latest.dir, 'tokens.css'), 'utf8')
  const releasedBrand = releaseCss.match(/--bds-brand:\s*([^;]+);/)?.[1]?.trim()
  if (releasedBrand && releasedBrand.toLowerCase() !== GUOKEXIN_BRAND_TOKENS.primary.toLowerCase()) {
    console.warn(`! 历史冻结版 v${latest.version} 保留品牌色 ${releasedBrand}；当前源码基准为 ${GUOKEXIN_BRAND_TOKENS.primary}，下一次发布必须从当前源码生成新版本。`)
  }
}
