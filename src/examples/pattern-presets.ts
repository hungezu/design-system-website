import type { ResourceWorkflowProps } from './ResourceWorkflow'
export interface PatternPreset { id:string; label:string; props:ResourceWorkflowProps }
const preset=(id:string,label:string,props:ResourceWorkflowProps={}):PatternPreset=>({id,label,props})
export const patternPresets:Record<string,PatternPreset[]>={
 'pattern-search-filter':[preset('ready','搜索与组合筛选'),preset('no-results','无匹配结果',{scenario:'no-results'})],
 'pattern-advanced-filter':[preset('ready','编辑后应用',{advanced:true}),preset('invalid','失效条件恢复',{advanced:true,scenario:'filter-invalid'})],
 'pattern-table-management':[preset('ready','列表与选择',{bulk:true}),preset('loading','局部加载',{scenario:'table-loading'}),preset('empty','空数据',{scenario:'empty'}),preset('error','读取失败',{scenario:'error'})],
 'pattern-bulk-actions':[preset('ready','选择与确认',{bulk:true}),preset('partial','部分失败',{bulk:true,initialSelection:'all'})],
 'pattern-form-create-edit':[preset('create','创建资源',{initialView:'edit',createNew:true}),preset('edit','编辑资源',{initialView:'edit'}),preset('invalid','校验错误',{initialView:'edit',scenario:'invalid'}),preset('submit-error','提交失败与重试',{initialView:'edit',initialSubmitFailure:true})],
 'pattern-delete-confirmation':[preset('ready','确认、删除与撤销',{initialView:'detail'})],
 'pattern-drawer-edit':[preset('ready','编辑与未保存保护',{drawerEdit:true}),preset('loading','抽屉加载',{drawerEdit:true,scenario:'loading'}),preset('readonly','只读查看',{drawerEdit:true,scenario:'readonly'})],
 'pattern-empty-state':[preset('empty','首次为空',{scenario:'empty'}),preset('no-results','筛选为空',{scenario:'no-results'}),preset('permission','无权查看',{scenario:'permission'})],
 'pattern-loading':[preset('table','局部等待',{scenario:'table-loading'}),preset('page','整区加载',{scenario:'loading'}),preset('timeout','超时恢复',{scenario:'timeout'})],
 'pattern-error':[preset('inline','行内校验',{initialView:'edit',scenario:'invalid'}),preset('region','区域读取失败',{scenario:'error'}),preset('page','页面读取失败',{scenario:'page-error'})],
 'pattern-permission-denied':[preset('page','页面无权',{scenario:'permission'}),preset('operation','操作只读',{scenario:'readonly'})],
 'pattern-detail-page':[preset('ready','对象信息',{initialView:'detail'}),preset('related','关联资源',{initialView:'detail',showRelated:true}),preset('loading','读取中',{initialView:'detail',scenario:'loading'}),preset('missing','对象失效',{initialView:'detail',scenario:'empty'})],
}
