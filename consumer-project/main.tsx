import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ProjectTheme, PROJECT_RELEASE, DSButton, DSInput, DSTable, DSDialog, DSAlert, DSPagination } from '@design-workspace/guokexin'
import '@design-workspace/guokexin/style.css'
import expected from './expected-release.json'
import './style.css'
interface Resource { id:string; name:string; owner:string; revision:number }
async function request<T>(url:string, options?:{method:string;body:unknown;signal?:AbortSignal}):Promise<T>{
 const response=await fetch(url,{method:options?.method,signal:options?.signal,headers:{'Content-Type':'application/json','X-Resource-Request':'1'},body:options?JSON.stringify(options.body):undefined})
 const data=await response.json();if(!response.ok)throw new Error(data.error??'业务请求失败。');return data
}
export function App(){
 const [items,setItems]=useState<Resource[]>([]),[query,setQuery]=useState(''),[applied,setApplied]=useState(''),[page,setPage]=useState(1)
 const [attempt,setAttempt]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('')
 const [editing,setEditing]=useState<Resource|null>(null),[name,setName]=useState(''),[saveError,setSaveError]=useState(''),[saving,setSaving]=useState(false)
 useEffect(()=>{const controller=new AbortController();setLoading(true);setError('');fetch(`/api/resources?query=${encodeURIComponent(applied)}`,{signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error);return data}).then(data=>{if(!controller.signal.aborted)setItems(data.items)}).catch(err=>{if(!controller.signal.aborted)setError(err.message)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[applied,attempt])
 const save=async()=>{if(!editing||saving)return;setSaving(true);setSaveError('');try{await request<Resource>(`/api/resources/${editing.id}`,{method:'PUT',body:{name,revision:editing.revision}});setEditing(null);setAttempt(value=>value+1);setNotice('已通过业务接口保存，刷新页面后仍可读取。')}catch(err){setSaveError(err instanceof Error?err.message:'保存失败。')}finally{setSaving(false)}}
 const matches=PROJECT_RELEASE.projectId===expected.projectId&&PROJECT_RELEASE.releaseVersion===expected.releaseVersion&&PROJECT_RELEASE.runtimeBuildId===expected.runtimeBuildId&&PROJECT_RELEASE.snapshotSha256===expected.snapshotSha256
 if(!matches)return <main><h1>项目组件版本不匹配</h1><p>请安装 expected-release.json 指定的包并重启开发服务。</p></main>
 return <ProjectTheme><main><h1>项目组件业务接入参考</h1><p>独立安装的 {PROJECT_RELEASE.projectId} / {PROJECT_RELEASE.releaseVersion}。此参考工程通过自己的 HTTP 接口保存本机示例资源，不操作设计管理平台。</p><p role="status">项目版本匹配 · 业务接口独立</p>
 <section aria-label="资源管理"><h2>资源列表</h2><form className="query" onSubmit={event=>{event.preventDefault();setPage(1);setApplied(query);setAttempt(value=>value+1)}}><DSInput label="搜索资源" value={query} onChange={setQuery} clearable/><DSButton type="submit" variant="primary">查询</DSButton><DSButton onClick={()=>{setQuery('');setApplied('');setPage(1)}}>重置</DSButton></form>
 {error?<DSAlert title="读取失败">{error}<DSButton onClick={()=>setAttempt(value=>value+1)}>重新读取</DSButton></DSAlert>:<div className="table-scroll"><DSTable loading={loading} columns={[{key:'name',title:'资源名称',width:240},{key:'owner',title:'负责人',width:160},{key:'actions',title:'操作',width:120,render:(row:Resource)=><DSButton variant="tertiary" aria-label={`编辑${row.name}`} onClick={()=>{setEditing(row);setName(row.name);setSaveError('')}}>编辑</DSButton>}]} data={items.slice((page-1)*2,page*2)} rowKey={row=>row.id}/></div>}
 <DSPagination page={page} pageSize={2} total={items.length} onPageChange={setPage}/>{notice&&<p role="status">{notice}</p>}</section>
 <DSDialog title="编辑资源" open={!!editing} onOpenChange={open=>{if(!open&&!saving)setEditing(null)}} loading={saving} footer={<><DSButton disabled={saving} onClick={()=>setEditing(null)}>取消</DSButton><DSButton variant="primary" loading={saving} onClick={()=>void save()}>保存资源</DSButton></>}><DSInput label="资源名称" value={name} onChange={setName} required invalid={!!saveError} errorMessage={saveError}/><p>名称由业务接口校验。重名会返回错误，修改后可再次保存。</p></DSDialog>
 </main></ProjectTheme>
}
createRoot(document.getElementById('root')!).render(<App/> )
