import { writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { DESKTOP_COMPONENT_BINDINGS, getComponentStateSupport } from '../src/design-system/component-bindings'
import { componentDemoVariants } from '../src/design-system/component-demo-variants'
import { RUNTIME_COMPONENT_REGISTRY } from '../src/runtime/registry'

const directory = new URL('../docs/audits/2026-09-19/', import.meta.url)
for (const extension of ['md','json']) {
  const original=new URL(`state-coverage.${extension}`,directory), backup=new URL(`state-coverage-before-repair.${extension}`,directory)
  if(existsSync(original)&&!existsSync(backup))copyFileSync(original,backup)
}
const evidence:Record<string,string[]>={
 'input-otp':['src/design-system/primitives/Collections/InputOTP.test.tsx'],
 toast:['src/design-system/primitives/Feedback/Toast.test.tsx'],
 avatar:['src/design-system/primitives/Content/Avatar.test.tsx'],
 tag:['src/components/RuntimeExample.behavior.test.tsx'],
 'tag-group':['src/components/RuntimeExample.behavior.test.tsx'],
 pagination:['src/components/RuntimeExample.behavior.test.tsx'],
 icon:['src/components/RuntimeExample.behavior.test.tsx'],
 upload:['src/components/RuntimeExample.behavior.test.tsx'],
 table:['src/components/RuntimeExample.behavior.test.tsx'],
 dialog:['src/components/RuntimeExample.behavior.test.tsx'],
 drawer:['src/components/RuntimeExample.behavior.test.tsx'],
 input:['src/components/RuntimeExample.behavior.test.tsx'],
 switch:['src/components/RuntimeExample.behavior.test.tsx'],
}
const items=DESKTOP_COMPONENT_BINDINGS.map(binding=>({
 component:binding.componentId,
 source:RUNTIME_COMPONENT_REGISTRY[binding.componentId]?.sourcePath??'参见 Runtime 入口',
 implementedStates:binding.states,
 stateApplicability:getComponentStateSupport(binding.componentId),
 variants:componentDemoVariants(binding.componentId),
 behaviorEvidence:evidence[binding.componentId]??[],
 browserEvidence:['input','checkbox','radio','switch','input-otp','toast','avatar','tag','pagination','icon'].includes(binding.componentId)?'component-state-repair.md':'本轮不声明每个组合态均已浏览器验证',
}))
writeFileSync(new URL('state-coverage.json',directory),JSON.stringify(items,null,2)+'\n')
const rows=items.map(item=>`|${item.component}|${item.implementedStates.join(', ')}|${item.stateApplicability.filter(s=>s.status==='not-applicable').map(s=>s.state).join(', ')||'—'}|${item.variants.map(v=>v.label).join('、')}|${item.behaviorEvidence.length?'专项行为回归':'示例挂载检查；不等同于行为验收'}|`)
writeFileSync(new URL('state-coverage.md',directory),`# 88 个组件的状态与示例清单（修复后）\n\n本清单从当前源码生成。旧审计快照保存在 [修复前清单](./state-coverage-before-repair.md)。\n\n- 状态声明表示当前公开 API 或真实交互提供该状态，不等于每个视觉组合已验收。\n- disabled / loading / error 按组件分别判定；不适用不计作待实现。不存在通用 fallbackStates。\n- 各示例使用正式组件；hover、focus、open 由真实交互触发。示例挂载与专项行为证据分开记录。\n- 已确认的缺实现及修复证据见 [补查修复记录](./component-state-repair.md)。本次没有新增“待实现”的功能承诺。\n- 日期示例使用固定日期范围；上传示例只演示本地选择和大小校验，不模拟网络任务。\n\n|组件|当前实现状态|不适用的通用状态|可操作示例|专项证据|\n|---|---|---|---|---|\n${rows.join('\n')}\n`)
console.log(`已更新 ${items.length} 个组件、${items.reduce((sum,item)=>sum+item.variants.length,0)} 个示例及状态适用性。`)
