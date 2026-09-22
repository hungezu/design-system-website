import fs from 'node:fs'
import { COMPONENT_CATALOG } from '../../../src/design-system/component-catalog'
import { componentDemoVariants } from '../../../src/design-system/component-demo-variants'
const aliases: Record<string,string> = { invalid:'error', checked:'checked' }
const tracked=['disabled','loading','error','empty']
const rows=COMPONENT_CATALOG.map(component=>{
 const variants=componentDemoVariants(component.componentId)
 const variantStates=variants.map(v=>aliases[v.id]??v.id)
 return {component:component.componentId,states:component.states,variants,reviewCandidates:tracked.filter(s=>component.states.includes(s)&&!variantStates.includes(s))}
})
fs.writeFileSync('docs/audits/2026-09-19/state-coverage.json',JSON.stringify(rows,null,2))
fs.writeFileSync('docs/audits/2026-09-19/state-coverage.md',`# 88 个组件的状态声明与示例清单\n\n这是源码清单，候选项不等于缺陷：hover/focus/open 通常由交互触发，Button 还有单独的配置开关。应先判定状态是否适用于组件，再核对实现与示例。\n\n|组件|声明状态|现有示例|需人工确认的声明/示例差异|\n|---|---|---|---|\n`+rows.map(r=>`|${r.component}|${r.states.join(', ')}|${r.variants.map(v=>v.label).join('、')}|${r.reviewCandidates.join(', ')||'—'}|`).join('\n')+'\n')
console.log(JSON.stringify({components:rows.length,states:Object.fromEntries(tracked.map(s=>[s,rows.filter(r=>r.states.includes(s)).length])),fallbackExamples:rows.filter(r=>r.variants.some(v=>v.id==='alternate')).map(r=>r.component)},null,2))
