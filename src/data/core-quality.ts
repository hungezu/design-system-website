import { AI_COMPONENT_IDS } from './ai-components'
import systemManifest from '../../system.manifest.json'
export const CORE_COMPONENT_IDS:readonly string[]=systemManifest.components.projectScope.filter(id=>!AI_COMPONENT_IDS.includes(id))
export function componentMaturity(id:string){return AI_COMPONENT_IDS.includes(id)?{label:'AI 交互组件',detail:'包含真实交互与状态示例；模型、工具执行及上传由接入方提供。'}:CORE_COMPONENT_IDS.includes(id)?{label:'核心验收范围',detail:`纳入 ${CORE_COMPONENT_IDS.length} 个核心组件的状态、Storybook 与消费侧验收。`}:{label:'公共预览',detail:'可用范围以当前 API 和示例为准；不以可挂载代替全部状态验收。'}}
