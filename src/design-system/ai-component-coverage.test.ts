import {expect,it} from 'vitest'
import {AI_COMPONENTS,AI_COMPONENT_IDS} from '../data/ai-components'
import {componentAssets} from '../data/assets/components'
import {COMPONENT_CATALOG,componentGroup} from './component-catalog'
import {componentDemoVariants} from './component-demo-variants'
import {getRuntimeComponent} from '../runtime/registry'
import * as runtime from '../runtime'
import {baselineThemeSettings,projectPreviewVariables,contrastRatio,PROJECT_THEME_MODE_VALUES} from '../services/project-theme'
it('all 14 AI components have real exports, project registry, assets and explicit variants',()=>{
 expect(AI_COMPONENT_IDS).toHaveLength(14)
 for(const item of AI_COMPONENTS){
  expect(runtime).toHaveProperty(item.exportName)
  expect(getRuntimeComponent(item.id)?.runtimeExport).toBe(item.exportName)
  expect(COMPONENT_CATALOG.some(row=>row.componentId===item.id)).toBe(true)
  expect(componentGroup(item.id)).toBe('AI 交互')
  expect(componentAssets.find(asset=>asset.id===`component-${item.id}`)?.bindings?.react?.exportName).toBe(item.exportName)
  expect(componentDemoVariants(item.id).length).toBeGreaterThan(0)
 }
})
it('AI syntax text stays readable in light and dark project themes',()=>{
 for(const theme of [baselineThemeSettings,{...baselineThemeSettings,...PROJECT_THEME_MODE_VALUES.dark,mode:'dark' as const}]){
  const values=projectPreviewVariables(theme)
  for(const token of ['ai-code-keyword','ai-code-string','ai-code-literal'])expect(contrastRatio(values[`--${token}`],values['--ai-code-background'])).toBeGreaterThanOrEqual(4.5)
 }
})
