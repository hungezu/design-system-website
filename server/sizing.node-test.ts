import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createWorkspace} from './workspace'
test('分层尺寸通过服务器保存、校验、冻结和备份',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'sizing-api-')),workspace=createWorkspace({dbPath:join(dir,'workspace.sqlite'),bootstrapToken:'sizing-test'})
 await new Promise<void>(done=>workspace.server.listen(0,'127.0.0.1',done));const base=`http://127.0.0.1:${(workspace.server.address() as {port:number}).port}`;let cookie=''
 const request=async(path:string,method='GET',body?:unknown)=>{const res=await fetch(base+'/api'+path,{method,headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json','X-Workspace-Request':'1'},body:body===undefined?undefined:JSON.stringify(body)});if(res.headers.get('set-cookie'))cookie=res.headers.get('set-cookie')!.split(';')[0];return {status:res.status,data:await res.json()}}
 try{
 await request('/auth/setup','POST',{token:'sizing-test',email:'sizing@example.test',name:'尺寸验收',password:'Sizing-test-password!'})
 const current=await request('/projects/guokexin/theme')
 const theme={...current.data.theme,sizing:{version:1,overrides:{heightMd:34,inputPadding:18,popupPadding:32}}}
 assert.equal((await request('/projects/guokexin/theme','PUT',{theme,revision:current.data.revision})).status,200)
 const saved=await request('/projects/guokexin/theme');assert.deepEqual(saved.data.theme.sizing,theme.sizing)
 assert.equal((await request('/projects/guokexin/theme','PUT',{theme:{...theme,sizing:{version:1,overrides:{inputPadding:-2}}},revision:saved.data.revision})).status,400)
 assert.equal((await request('/projects/guokexin/releases','POST',{version:'8.6.0'})).status,201)
 const tokens=await request('/projects/guokexin/releases/8.6.0/tokens.json');assert.equal(tokens.data['--input-padding-inline'],'18px');assert.equal(tokens.data['--control-height-md'],'34px')
 const layout=await request('/projects/guokexin/releases/8.6.0/layout.json');assert.equal(layout.data.controlHeight,34)
 const backup=await request('/workspace/backup');assert.equal(backup.status,200);assert.equal(backup.data.payload.projects.find((p:{config:{id:string}})=>p.config.id==='guokexin').theme.sizing.overrides.popupPadding,32)
 }finally{await workspace.close();rmSync(dir,{recursive:true,force:true})}
})
