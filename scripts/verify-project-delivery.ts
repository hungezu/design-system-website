import { mkdtempSync, rmSync, mkdirSync, writeFileSync, cpSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createWorkspace } from '../server/workspace'
import { createDeliveryService } from '../server/project-delivery'
import { sha256 } from '../server/runtime-archive'
const root=resolve('artifacts/project-delivery-acceptance'),temp=mkdtempSync(join(tmpdir(),'project-package-acceptance-'))
const workspace=createWorkspace({dbPath:join(temp,'workspace.sqlite'),bootstrapToken:'test-only-setup'})
await new Promise<void>(done=>workspace.server.listen(0,'127.0.0.1',done))
const base=`http://127.0.0.1:${(workspace.server.address() as {port:number}).port}`
let cookie=''
const request=async(path:string,method='GET',body?:unknown)=>{const response=await fetch(base+'/api'+path,{method,headers:{Cookie:cookie,Origin:base,'X-Workspace-Request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie')!.split(';')[0];const value=await response.json();if(!response.ok)throw new Error(JSON.stringify(value));return value}
try{
 await request('/auth/setup','POST',{token:'test-only-setup',email:'acceptance@example.test',name:'交付验收',password:'Test-only-delivery-2026!'})
 const packages=[]
 for(const [projectId,version,color] of [['guokexin','9.0.0','#165DFF'],['guokexin','9.1.0','#6236FF'],['test-customer-b','9.0.0','#006A70']]){
  const current=await request(`/projects/${projectId}/theme`)
  await request(`/projects/${projectId}/theme`,'PUT',{...current,theme:{...current.theme,brandPrimary:color}})
  await request(`/projects/${projectId}/releases`,'POST',{version,note:'隔离交付验收版本，不是用户项目发布'})
  await request(`/projects/${projectId}/deliveries/${version}`,'POST',{})
  await workspace.deliveries.idle()
  const result=await request(`/projects/${projectId}/deliveries/${version}`)
  if(result.status!=='ready')throw new Error(JSON.stringify(result))
  const artifact=result.artifact
  const snapshot=JSON.parse((workspace.db.prepare('SELECT snapshot FROM releases WHERE projectId=? AND version=?').get(projectId,version) as {snapshot:string}).snapshot)
  const service=createDeliveryService({runtimeRoot:resolve('artifacts/runtime-builds'),outputRoot:join(temp,'deliveries')})
  const {data}=service.download(snapshot)
  if(sha256(data)!==artifact.sha256)throw new Error('Archive checksum mismatch')
  const dir=join(root,projectId,version);mkdirSync(dir,{recursive:true})
  writeFileSync(join(dir,artifact.archiveName),data);writeFileSync(join(dir,'snapshot.json'),JSON.stringify(snapshot,null,2));writeFileSync(join(dir,'delivery.json'),JSON.stringify(artifact,null,2));writeFileSync(join(dir,'README.md'),result.guide)
  packages.push({...artifact,archive:join(dir,artifact.archiveName),expectedBrand:color})
 }
 writeFileSync(join(root,'verification.json'),JSON.stringify({scope:'isolated acceptance fixtures; not user releases',packages},null,2))
 // Fixture DB supports the browser acceptance server without altering the real workspace.
 await workspace.close()
 cpSync(join(temp,'workspace.sqlite'),join(root,'workspace.sqlite'))
 cpSync(join(temp,'deliveries'),join(root,'deliveries'),{recursive:true})
 const consumer=resolve('consumer-project'),pkg=JSON.parse(readFileSync(join(consumer,'package.json'),'utf8'))
 pkg.dependencies['@design-workspace/guokexin']=`file:../artifacts/project-delivery-acceptance/guokexin/9.1.0/${packages[1].archiveName}`
 writeFileSync(join(consumer,'package.json'),JSON.stringify(pkg,null,2)+'\n')
 writeFileSync(join(consumer,'expected-release.json'),JSON.stringify({projectId:'guokexin',releaseVersion:'9.1.0',runtimeBuildId:packages[1].runtimeBuildId,snapshotSha256:packages[1].snapshotSha256},null,2))
 console.log('Project delivery: two projects, two versions, frozen assets and immutable package checks passed.')
}finally{if(workspace.server.listening)await workspace.close();rmSync(temp,{recursive:true,force:true})}
