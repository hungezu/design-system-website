import { validateWorkspaceBackup, type WorkspaceBackup } from './workspace-backup'
export interface VersionedWorkspace { revision:string; workspace:WorkspaceBackup }
/** Host-supplied authenticated API. It must enforce access and If-Match on the server. */
export function createWorkspaceRepository(baseUrl:string,request:typeof fetch=fetch){
 const base=new URL(baseUrl,typeof location==='undefined'?'http://127.0.0.1':location.origin)
 if(!['127.0.0.1','localhost','[::1]'].includes(base.hostname)&&(typeof location==='undefined'||base.origin!==location.origin))throw new Error('工作区服务需通过本地或同源代理接入。')
 async function responseValue(response:Response):Promise<VersionedWorkspace>{if(response.status===409||response.status===412)throw new Error('版本冲突：请重新读取远端工作区并人工合并。');if(!response.ok)throw new Error(`工作区服务失败：HTTP ${response.status}`);const data=await response.json() as VersionedWorkspace;if(!data||typeof data.revision!=='string'||!data.revision)throw new Error('缺少工作区版本号。');return{revision:data.revision,workspace:validateWorkspaceBackup(data.workspace)}}
 return {
  read:(id:string,signal?:AbortSignal)=>request(new URL(encodeURIComponent(id),base.href.endsWith('/')?base:base.href+'/'),{credentials:'same-origin',signal}).then(responseValue),
  save:(id:string,current:VersionedWorkspace,signal?:AbortSignal)=>request(new URL(encodeURIComponent(id),base.href.endsWith('/')?base:base.href+'/'),{method:'PUT',credentials:'same-origin',headers:{'Content-Type':'application/json','If-Match':current.revision},body:JSON.stringify(validateWorkspaceBackup(current.workspace)),signal}).then(responseValue),
 }
}
