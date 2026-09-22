import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BUTTON_CONTRACT, resolveButtonCombination } from '../src/design-system/primitives/Button/Button.types'
import { buttonAsset } from '../src/data/assets/components'
import { semanticTokens } from '../src/data/global/semantic-tokens'
import { buttonRecipeTokens } from '../src/data/components/button-recipe-tokens'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const reactBinding = buttonAsset.bindings?.react
const storybookBinding = buttonAsset.bindings?.storybook
const tokenIds = new Set([...semanticTokens, ...buttonRecipeTokens].map((token) => token.id))
const failures: string[] = []

if (buttonAsset.id !== 'button') failures.push('Button 资产 ID 必须为 button')
if (!reactBinding) failures.push('缺少 React Binding')
if (!storybookBinding) failures.push('缺少 Storybook Binding')
if (buttonAsset.bindings?.figma) failures.push('当前阶段不能声明 Figma Binding')
if (buttonAsset.sync?.figma !== 'unbound') failures.push('Figma 同步状态必须为 unbound')
if (buttonAsset.contract !== BUTTON_CONTRACT) failures.push('AssetManifest 未引用统一 Button Contract')
if (buttonAsset.contract?.allowedCombinations.length !== 7) failures.push('Button 合法组合数量必须为 7')
if (Object.values(BUTTON_CONTRACT.properties).some((property) => property.values.some((value) => !property.figmaValues[value]))) failures.push('Figma Property value 映射不完整')
const fallback = resolveButtonCombination({ priority: 'primary', appearance: 'ghost', tone: 'brand' })
if (fallback.priority !== 'primary' || fallback.appearance !== 'filled' || fallback.tone !== 'brand') failures.push('非法组合回退结果不稳定')
if (buttonAsset.tokens.some((tokenId) => !tokenIds.has(tokenId))) failures.push('Button 引用了不存在的 Token')
if (reactBinding && !existsSync(resolve(projectRoot, reactBinding.sourcePath))) failures.push('React sourcePath 不存在')
if (storybookBinding && !existsSync(resolve(projectRoot, storybookBinding.sourcePath))) failures.push('Storybook sourcePath 不存在')
const expectedProps = ['variant', 'semantic', 'size', 'disabled', 'loading', 'icon', 'iconPosition', 'children']
if (JSON.stringify(Object.keys(reactBinding?.props ?? {})) !== JSON.stringify(expectedProps)) failures.push('React Binding Props 与 Button API 不一致')
if (reactBinding?.exportName !== 'DSButton') failures.push('Button React Binding 必须指向公开 DSButton 适配层')

const buttonCss = readFileSync(resolve(projectRoot, 'src/design-system/primitives/Button/Button.css'), 'utf8')
const referencedTokens = [...buttonCss.matchAll(/var\(--([a-z0-9-]+)/g)].map((match) => match[1])
const localCustomProperties = new Set([...buttonCss.matchAll(/--([a-z0-9-]+)\s*:/g)].map((match) => match[1]))
const missingTokens = [...new Set(referencedTokens.filter((tokenId) => !tokenIds.has(tokenId) && !localCustomProperties.has(tokenId)))]
if (missingTokens.length) failures.push(`Button CSS 引用了不存在的 Token：${missingTokens.join(', ')}`)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Button binding validation PASS')
