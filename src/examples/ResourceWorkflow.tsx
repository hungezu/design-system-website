import { TableSelectionBar } from '../components/TableSelectionBar'
import { useUnsavedChanges } from './useUnsavedChanges'
import { useEffect, useRef, useState } from 'react'
import { DSAlert, DSBadge, DSButton, DSCheckbox, DSDialog, DSDrawer, DSEmpty, DSForm, DSInput, DSLoading, DSPagination, DSSelect, DSTable, DSTextArea, DSToast } from '../runtime'
import './examples.css'

export type WorkflowScenario = 'ready'|'empty'|'no-results'|'loading'|'error'|'readonly'|'permission'|'long'|'invalid'|'filter-invalid'|'table-loading'|'timeout'|'page-error'
export interface ResourceRecord { id:string; name:string; type:string; owner:string; description:string }
const initialRows:ResourceRecord[]=[
 {id:'policy',name:'政策数据库',type:'数据资源',owner:'内容运营',description:'政策与研究资料的统一管理入口。'},
 {id:'expert',name:'专家信息库',type:'业务应用',owner:'研究中心',description:'专家基础信息与协作记录。'},
 {id:'topic',name:'专题配置',type:'配置项',owner:'内容运营',description:'专题内容与展示规则配置。'},
 {id:'archive',name:'历史映射',type:'配置项',owner:'系统管理员',description:'此示例保留依赖，批量归档时展示部分失败。'},
]
function scenarioRows(scenario:WorkflowScenario):ResourceRecord[]{return scenario==='empty'?[]:initialRows.map(row=>scenario==='long'?{...row,name:`${row.name}——跨部门资源协作、权限审批与历史版本归档的完整说明`,description:row.description.repeat(12)}:{...row})}
const emptyRecord:ResourceRecord={id:'',name:'',type:'数据资源',owner:'内容运营',description:''}
export interface ResourceWorkflowProps { initialView?:'list'|'detail'|'edit'; scenario?:WorkflowScenario; bulk?:boolean; drawerEdit?:boolean; advanced?:boolean; grouped?:boolean; showRelated?:boolean;createNew?:boolean;initialSubmitFailure?:boolean;initialSelection?:'all' }
/** Standalone, local-only reference flow. No router, project store or persistence dependency. */
export function ResourceWorkflow({initialView='list',scenario='ready',bulk=false,drawerEdit=false,advanced=false,grouped=false,showRelated=false,createNew=false,initialSubmitFailure=false,initialSelection}:ResourceWorkflowProps){
 const [rows,setRows]=useState(()=>scenarioRows(scenario))
 const [view,setView]=useState(initialView)
 const [state,setState]=useState(scenario)
 const [query,setQuery]=useState(scenario==='no-results'?'不存在的资源':'')
 const [type,setType]=useState('all')
 const [page,setPage]=useState(1)
 const [pageSize,setPageSize]=useState(3)
 const [selected,setSelected]=useState<string[]>(()=>initialSelection==='all'?initialRows.map(row=>row.id):[])
 const [activeId,setActiveId]=useState(createNew?'':initialRows[0].id)
 const [draft,setDraft]=useState<ResourceRecord>(()=>createNew?{...emptyRecord}:scenario==='invalid'?{...initialRows[0],name:''}:scenarioRows(scenario)[0]??{...emptyRecord})
 const [editing,setEditing]=useState(drawerEdit&&scenario==='loading')
 const [advancedOpen,setAdvancedOpen]=useState(false)
 const [pendingType,setPendingType]=useState('all')
 const [discard,setDiscard]=useState(false)
 const [deleting,setDeleting]=useState(false)
 const [lastDeleted,setLastDeleted]=useState<{row:ResourceRecord;index:number}|null>(null)
 const [error,setError]=useState(scenario==='invalid'?'请输入资源名称。':'')
 const [feedback,setFeedback]=useState('')
 const [toast,setToast]=useState(false)
 const [failNext,setFailNext]=useState(initialSubmitFailure)
 const [pending,setPending]=useState(false)
 const [bulkConfirm,setBulkConfirm]=useState(false)
 const [bulkPending,setBulkPending]=useState(false)
 const saving=useRef(false)
 const mounted=useRef(true)
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[])
 const readOnly=state==='readonly'
 const tableBusy=state==='table-loading'||bulkPending
 const selectionEnabled=bulk&&!readOnly
 const active=rows.find(row=>row.id===activeId)
 const keyword=query.trim()
 const filtered=rows.filter(row=>row.name.includes(keyword)&&(type==='all'||row.type===type))
 const appliedFilterCount=(keyword?1:0)+(type!=='all'?1:0)
 const currentPage=Math.min(page,Math.max(1,Math.ceil(filtered.length/pageSize)))
 const pageRows=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize)
 const selectedOnOtherPages=selected.filter(id=>!pageRows.some(row=>row.id===id)).length
 const showFeedback=(message:string)=>{setFeedback(message);setToast(true)}
 const startEdit=(row:ResourceRecord)=>{setActiveId(row.id);setDraft({...row});setError('');if(drawerEdit)setEditing(true);else setView('edit')}
 const dirty=JSON.stringify(draft)!==JSON.stringify(active??emptyRecord)
 useUnsavedChanges((view==='edit'||editing)&&dirty)
 const back=()=>{setEditing(false);setView('list');setError('')}
 const cancel=()=>dirty?setDiscard(true):back()
 const save=async()=>{
  if(readOnly||saving.current)return
  if(!draft.name.trim()){setError('请输入资源名称。');return}
  if(rows.some(row=>row.id!==draft.id&&row.name===draft.name.trim())){setError('资源名称已存在。');return}
  saving.current=true;setPending(true);setError('')
  await new Promise(resolve=>setTimeout(resolve,250))
  if(!mounted.current)return
  saving.current=false;setPending(false)
  if(failNext){setFailNext(false);setError('本次提交失败，输入已保留。请重试。');return}
  const saved={...draft,id:draft.id||crypto.randomUUID(),name:draft.name.trim()}
  setRows(items=>items.some(row=>row.id===saved.id)?items.map(row=>row.id===saved.id?saved:row):[saved,...items])
  setActiveId(saved.id);setDraft(saved);setEditing(false);setView(initialView==='edit'?'detail':'list');const visible=saved.name.includes(keyword)&&(type==='all'||saved.type===type);if(!draft.id&&visible)setPage(1);if(!visible)setSelected(ids=>ids.filter(id=>id!==saved.id));showFeedback(visible?'资源已保存。':'资源已保存，当前筛选条件下不可见；清除筛选后可查看。')
 }
 const archive=async()=>{
  if(readOnly||saving.current||!selected.length)return
  const ids=[...selected];saving.current=true;setBulkPending(true)
  await new Promise(resolve=>setTimeout(resolve,250))
  if(!mounted.current)return
  const failed:string[]=ids.filter(id=>id==='archive')
  setRows(items=>items.filter(row=>!ids.includes(row.id)||failed.includes(row.id)))
  setSelected(failed);setBulkPending(false);saving.current=false;setBulkConfirm(false)
  showFeedback(failed.length?`已归档 ${ids.length-failed.length} 项；历史映射存在依赖，未归档。`:`已归档 ${ids.length} 项。`)
 }

 const filters=<div className="example-filters"><DSInput label="搜索资源" disabled={tableBusy} value={query} onChange={value=>{setQuery(value);setPage(1);setSelected([])}} placeholder="按名称筛选" clearable/><DSSelect label="筛选类型" disabled={tableBusy} value={type} onChange={value=>{setType(value);setPage(1);setSelected([])}} options={['all','数据资源','业务应用','配置项'].map(value=>({value,label:value==='all'?'全部类型':value}))}/><DSButton variant="secondary" disabled={tableBusy} onClick={()=>{setQuery('');setType('all');setPage(1);setSelected([])}}>清除筛选</DSButton>{advanced&&<DSButton variant="secondary" disabled={tableBusy} onClick={()=>{setPendingType(type);setAdvancedOpen(true)}}>高级筛选{appliedFilterCount?`（${appliedFilterCount}）`:null}</DSButton>}{appliedFilterCount>0&&<span className="example-filter-count">已应用 {appliedFilterCount} 项筛选</span>}</div>
 const editor=<DSForm label="编辑资源表单" onSubmit={()=>void save()} disabled={pending} error={error}>
  {grouped&&<h3>基本信息</h3>}
  <DSInput label="资源名称" value={draft.name} onChange={name=>{setDraft(item=>({...item,name}));setError('')}} required readOnly={readOnly} invalid={error==='请输入资源名称。'||error==='资源名称已存在。'} errorMessage={error==='请输入资源名称。'||error==='资源名称已存在。'?error:undefined}/>
  <DSSelect label="资源类型" value={draft.type} onChange={type=>setDraft(item=>({...item,type}))} readOnly={readOnly} options={['数据资源','业务应用','配置项'].map(value=>({value,label:value}))}/>
  <DSInput label="负责人" value={draft.owner} onChange={owner=>setDraft(item=>({...item,owner}))} readOnly={readOnly}/>
  {grouped&&<h3>补充说明</h3>}
  <DSTextArea label="说明" value={draft.description} onChange={description=>setDraft(item=>({...item,description}))} readOnly={readOnly}/>
  {!readOnly&&<DSCheckbox label="模拟一次提交失败" checked={failNext} onChange={setFailNext}/>}
  <div className="example-actions example-form-actions"><DSButton variant="secondary" disabled={pending} onClick={cancel}>取消编辑</DSButton><DSButton type="submit" variant="primary" loading={pending} disabled={readOnly}>保存资源</DSButton></div>
 </DSForm>
 return <section className="resource-workflow" data-unsaved={(view==='edit'||editing)&&dirty||undefined} aria-label="资源业务流程">
  {state!=='page-error'&&<header><div><h2>{view==='list'?'资源列表':view==='edit'?(draft.id?'编辑资源':'新增资源'):'资源详情'}</h2><p>本地示例，操作不会修改项目或发布版本。</p></div>{readOnly&&<DSBadge>只读</DSBadge>}</header>}
  {state==='page-error'?<DSAlert tone="error" title="页面加载失败"><p>当前页面无法读取，尚未显示资源数据。</p><DSButton onClick={()=>setState('ready')}>重新加载页面演示</DSButton></DSAlert>:state==='filter-invalid'?<>{filters}<DSAlert tone="warning" title="已保存的筛选条件失效"><p>之前的资源类型已不可用，请清除条件或重新配置。</p><DSButton onClick={()=>{setType('all');setState('ready')}}>清除失效条件</DSButton></DSAlert></>:state==='permission'?<DSEmpty title="当前示例无查看权限" description="没有展示受限资源内容。" action={<DSButton onClick={()=>setState('readonly')}>返回可访问列表</DSButton>}/>:state==='loading'&&!drawerEdit?<><DSLoading label="正在加载资源"/><DSButton onClick={()=>setState('ready')}>完成加载演示</DSButton></>:state==='error'||state==='timeout'?<>{filters}<DSAlert tone="error" title={state==='timeout'?'资源加载超时':'资源读取失败'}><p>筛选条件已保留，请重试。</p><DSButton onClick={()=>setState('ready')}>重试加载</DSButton></DSAlert></>:view==='list'?<>
   {filters}
   <div className="example-table-toolbar ds-table-toolbar">
    <DSButton variant="primary" disabled={readOnly||tableBusy} onClick={()=>startEdit(emptyRecord)}>新增资源</DSButton>
   </div>
   {selectionEnabled&&<TableSelectionBar count={selected.length} otherPageCount={selectedOnOtherPages} disabled={tableBusy} onClear={()=>setSelected([])}>
    <DSButton size="sm" variant="tertiary" disabled={tableBusy} onClick={()=>setBulkConfirm(true)}>归档所选资源</DSButton>
    {filtered.length>pageRows.length&&selected.length<filtered.length&&<DSButton size="sm" variant="tertiary" disabled={tableBusy} title="选择当前筛选结果的全部记录" onClick={()=>setSelected(filtered.map(row=>row.id))}>选择全部 {filtered.length} 项</DSButton>}
   </TableSelectionBar>}
   <div className="example-table"><DSTable loading={state==='table-loading'} isRowSelectable={()=>!tableBusy} columns={[{key:'name',title:'资源名称',width:210},{key:'type',title:'类型',width:110},{key:'owner',title:'负责人',width:120},{key:'actions',title:'操作',width:140,render:row=><div className="ds-table-actions"><DSButton size="sm" variant="tertiary" aria-label="查看资源" disabled={tableBusy} onClick={event=>{event.stopPropagation();setActiveId(row.id);setView('detail')}}>查看</DSButton><DSButton size="sm" variant="tertiary" aria-label="编辑资源" disabled={readOnly||tableBusy} onClick={event=>{event.stopPropagation();startEdit(row)}}>编辑</DSButton></div>}]} footer={filtered.length>0?<DSPagination disabled={tableBusy} total={filtered.length} page={currentPage} pageSize={pageSize} pageSizeOptions={[3,10,20,50]} onPageChange={setPage} onPageSizeChange={size=>{setPageSize(size);setPage(1)}}/>:undefined} data={pageRows} rowKey={row=>row.id} selectable={selectionEnabled} selectedRowKeys={selectionEnabled?selected:[]} onSelectionChange={selectionEnabled?setSelected:undefined} emptyState={<DSEmpty title={rows.length?'没有匹配资源':'尚未添加资源'} description={rows.length?'清除条件后重试。':'使用新增资源开始。'}/>}/></div>
   {state==='table-loading'&&<DSButton onClick={()=>setState('ready')}>完成局部加载演示</DSButton>}
  </>:view==='edit'?editor:active?<><DSButton variant="secondary" onClick={back}>返回列表</DSButton><dl className="example-details"><dt>资源名称</dt><dd>{active.name}</dd><dt>类型</dt><dd>{active.type}</dd><dt>负责人</dt><dd>{active.owner}</dd><dt>说明</dt><dd>{active.description}</dd></dl>{showRelated&&<section><h3>关联示例资源</h3>{rows.filter(row=>row.id!==activeId).map(row=><DSButton key={row.id} variant="tertiary" onClick={()=>setActiveId(row.id)}>{row.name}</DSButton>)}</section>}<div className="example-actions"><DSButton variant="primary" disabled={readOnly} onClick={()=>startEdit(active)}>编辑当前资源</DSButton><DSButton semantic="danger" disabled={readOnly} onClick={()=>setDeleting(true)}>删除当前资源</DSButton></div></>:<DSEmpty title="资源已不存在" action={<DSButton onClick={back}>返回列表</DSButton>}/>}
  <p role="status">{feedback}</p>{lastDeleted&&<DSButton variant="secondary" onClick={()=>{const restored=[...rows];restored.splice(Math.min(lastDeleted.index,restored.length),0,lastDeleted.row);setRows(restored);const index=restored.filter(row=>row.name.includes(keyword)&&(type==='all'||row.type===type)).findIndex(row=>row.id===lastDeleted.row.id);if(index>=0)setPage(Math.floor(index/pageSize)+1);setLastDeleted(null);showFeedback(index>=0?'资源已恢复。':'资源已恢复，当前筛选条件下不可见。')}}>撤销删除</DSButton>}
  <DSDrawer open={editing} onOpenChange={open=>open?setEditing(true):cancel()} title="编辑资源" loading={pending||state==='loading'}>{state==='loading'?<><DSLoading label="正在读取编辑内容"/><DSButton onClick={()=>setState('ready')}>完成抽屉加载演示</DSButton></>:editor}</DSDrawer>
  <DSDrawer open={advancedOpen} onOpenChange={setAdvancedOpen} title="高级筛选"><DSSelect label="资源类型条件" value={pendingType} onChange={setPendingType} options={['all','数据资源','业务应用','配置项'].map(value=>({value,label:value==='all'?'全部类型':value}))}/><DSButton variant="primary" onClick={()=>{setType(pendingType);setPage(1);setSelected([]);setAdvancedOpen(false);if(state==='filter-invalid')setState('ready')}}>应用筛选</DSButton><DSButton variant="secondary" onClick={()=>setAdvancedOpen(false)}>取消筛选</DSButton></DSDrawer>
  <DSDialog open={bulkConfirm} onOpenChange={setBulkConfirm} title="确认批量归档" loading={bulkPending} footer={<><DSButton variant="secondary" disabled={bulkPending} onClick={()=>setBulkConfirm(false)}>取消归档</DSButton><DSButton variant="primary" loading={bulkPending} onClick={()=>void archive()}>确认归档 {selected.length} 项</DSButton></>}><p>将处理以下 {selected.length} 项示例资源；存在依赖的记录会保留并反馈失败原因。</p><ul>{rows.filter(row=>selected.includes(row.id)).map(row=><li key={row.id}>{row.name}</li>)}</ul></DSDialog>
  <DSDialog open={discard} onOpenChange={setDiscard} title="放弃未保存的修改？" footer={<><DSButton variant="secondary" onClick={()=>setDiscard(false)}>继续编辑</DSButton><DSButton semantic="danger" onClick={()=>{setDiscard(false);back()}}>放弃修改</DSButton></>}>修改尚未保存，返回会丢弃本次输入。</DSDialog>
  <DSDialog open={deleting} onOpenChange={setDeleting} title="删除资源" footer={<><DSButton variant="secondary" onClick={()=>setDeleting(false)}>取消删除</DSButton><DSButton variant="primary" semantic="danger" onClick={()=>{setLastDeleted(active?{row:active,index:rows.findIndex(row=>row.id===active.id)}:null);setRows(items=>items.filter(row=>row.id!==activeId));setSelected(ids=>ids.filter(id=>id!==activeId));setDeleting(false);back();showFeedback('资源已删除。')}}>确认删除</DSButton></>}>将移除“{active?.name}”，请确认操作对象。</DSDialog>
  <DSToast open={toast} onOpenChange={setToast} message={feedback}/>
 </section>
}
