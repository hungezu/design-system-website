import {AI_COMPONENTS,AI_COMPONENT_RULES} from '../ai-components'
import type {ComponentAsset,ReactPropSchema} from '../../types/design-system'
const labels:Record<string,string>={default:'默认',open:'展开',loading:'处理中',error:'错误',disabled:'禁用',selected:'选中',empty:'空状态'}
export const aiComponentAssets:ComponentAsset[]=AI_COMPONENTS.map(item=>({
 id:`component-${item.id}`,type:'component',name:`${item.name} ${item.exportName.slice(2)}`,description:item.description,semantic:item.description,platforms:['web'],
 rules:[...AI_COMPONENT_RULES],tokens:['font-body','surface-primary','surface-secondary','text-primary','text-secondary','border-default','ai-message-gap','ai-composer-radius','ai-panel-radius',...(['code-block','markdown','chat-tool'].includes(item.id)?['ai-code-background','ai-code-keyword','ai-code-string','ai-code-literal']:[]),...(['chat-message','chat-conversation'].includes(item.id)?['ai-user-background','ai-content-width']:[])],
 variants:item.variants.map(([id,name])=>({id,name,description:`${item.name}的${name}场景。`})),states:item.states.map(id=>({id,name:labels[id],description:`${item.name}的${labels[id]}状态。`})),projectOverrides:[],status:'stable',tags:['AI','交互'],
 bindings:{react:{package:'design-intelligence-system',exportName:item.exportName,sourcePath:`src/design-system/primitives/AI/${item.file}`,props:Object.fromEntries(item.required.map(name=>[name,{type:'react-node',required:true,description:`必填 ${name}；精确类型见 Runtime API 声明。`} as ReactPropSchema]))},storybook:{url:`http://127.0.0.1:6006/?path=/docs/ai-${item.id}--docs`,title:`AI/${item.id}`,storyId:`ai-${item.id}--default`,sourcePath:`src/design-system/stories/ai-${item.id}.stories.tsx`}},
 sync:{react:'bound',storybook:'bound',figma:'unbound',overall:'partially-bound'},
}))
