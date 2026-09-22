import {GroupedTableExample} from '../components/GroupedTableExample'
import {useState} from 'react'
import { DSEmpty, DSSelect } from '../runtime'
import { ResourceWorkflow, type WorkflowScenario } from './ResourceWorkflow'
import {patternPresets} from './pattern-presets'
const scenarios=new Set(['empty','no-results','loading','error','readonly','permission','long','invalid'])
export function TemplateExample({templateId,variant='basic'}:{templateId:string;variant?:string}) {
 if(!['template-list','template-form','template-detail'].includes(templateId))return <DSEmpty title="模板不可用" description="请使用交付包中的模板 ID。"/>
 if(templateId==='template-list'&&variant==='grouped-header')return <GroupedTableExample fixed selectable/>
 return <ResourceWorkflow key={`${templateId}/${variant}`} initialView={templateId==='template-form'?'edit':templateId==='template-detail'?'detail':'list'} scenario={scenarios.has(variant)?variant as WorkflowScenario:'ready'} advanced={variant==='advanced'} bulk={variant==='bulk'} grouped={variant==='grouped'} showRelated={variant==='related'}/>
}
export function PatternExample({patternId,initialScenario,onScenarioChange}:{patternId:string;initialScenario?:string;onScenarioChange?:(value:string)=>void}) {
 const options=patternPresets[patternId]
 const [selected,setSelected]=useState(initialScenario??options?.[0]?.id??'')
 if(!options)return <DSEmpty title="模式不可用" description="请使用交付包中的模式 ID。"/>
 const active=options.find(option=>option.id===selected)
 if(!active)return <DSEmpty title="模式情形不可用" description="请使用当前模式提供的情形 ID。"/>
 return <section className="pattern-business-example"><DSSelect label="业务情形" value={selected} options={options.map(option=>({value:option.id,label:option.label}))} onChange={value=>{if(document.querySelector('.resource-workflow[data-unsaved="true"]')&&!window.confirm('当前编辑尚未保存，确定切换情形吗？'))return;setSelected(value);onScenarioChange?.(value)}}/><ResourceWorkflow key={`${patternId}/${selected}`} {...active.props}/></section>
}
