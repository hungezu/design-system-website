import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, renameSync, rmSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createWorkspace } from './workspace'
import { createDeliveryService } from './project-delivery'
import { listFiles, sha256 } from './runtime-archive'
import identity from '../src/data/generated/runtime-build.json'
import { guokexinProject } from '../src/data/projects'
import { getRuntimeComponent } from '../src/runtime/registry'

test('项目交付：权限、冻结版本、代码归档、异步生成、安装包与不可变下载', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'project-delivery-test-')), runtimeRoot = join(dir, 'runtime'), outputRoot = join(dir, 'deliveries')
  const workspace = createWorkspace({ dbPath: join(dir, 'test.sqlite'), bootstrapToken: 'test-setup', deliveryRuntimeRoot: runtimeRoot, deliveryOutputRoot: outputRoot })
  await new Promise<void>(done => workspace.server.listen(0, '127.0.0.1', done))
  const origin = `http://127.0.0.1:${(workspace.server.address() as {port:number}).port}`
  const client = () => {
    let cookie = ''
    return async (path:string, method='GET', body?:unknown) => {
      const response = await fetch(origin+'/api'+path, {method,headers:{Cookie:cookie,Origin:origin,'X-Workspace-Request':'1','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)})
      if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie')!.split(';')[0]
      return {status:response.status,data:response.headers.get('content-type')?.includes('json')?await response.json():Buffer.from(await response.arrayBuffer())}
    }
  }
  const admin=client(),viewer=client(),other=client(),anonymous=client()
  const password='Test-delivery-password-2026!'
  const base='/projects/guokexin/deliveries/9.0.0'
  const archive=join(runtimeRoot,identity.buildId.slice(7))
  try {
    await admin('/auth/setup','POST',{token:'test-setup',email:'admin@example.test',name:'测试',password})
    for(const [request,email,project] of [[viewer,'viewer@example.test','guokexin'],[other,'other@example.test','test-customer-b']] as const){const invitation=await admin(`/projects/${project}/invitations`,'POST',{email,role:'viewer'});await request('/auth/accept','POST',{token:invitation.data.token,name:'测试',password})}
    const theme=await admin('/projects/guokexin/theme')
    await admin('/projects/guokexin/theme','PUT',{...theme.data,theme:{...theme.data.theme,brandPrimary:'#112233'}})
    await admin('/projects/guokexin/releases','POST',{version:'9.0.0'})
    await t.test('缺代码归档及历史版本明确不可生成，草稿拒绝',async()=>{
      const unavailable=await admin(base);assert.equal(unavailable.data.status,'unavailable');assert.match(unavailable.data.designSpec,/releaseVersion: "9.0.0"/)
      assert.equal((await admin('/projects/guokexin/deliveries/preflight')).data.status,'unavailable')
      assert.equal((await admin('/projects/guokexin/releases','POST',{version:'8.9.9',requireDeliverable:true})).status,409)
      assert.equal((await admin(base,'POST',{})).status,409)
      assert.equal((await admin('/projects/guokexin/deliveries/draft','POST',{})).status,400)
      assert.equal((await admin('/projects/guokexin/deliveries/1.5.5')).data.status,'unavailable')
    })
    const approvedRuntimeExports=guokexinProject.componentIds.map(id=>getRuntimeComponent(id)!.runtimeExport)
    const runtimeValues=`export const RUNTIME_BUILD_ID=${JSON.stringify(identity.buildId)};\nexport const PreviewScope=({children})=>children;\n${approvedRuntimeExports.map(name=>`export const ${name}=()=>null;`).join('\n')}`
    const runtimeTypes=`export declare const RUNTIME_BUILD_ID: string;\nexport declare const PreviewScope: unknown;\n${approvedRuntimeExports.map(name=>`export declare const ${name}: unknown;`).join('\n')}`
    for(const [path,content] of Object.entries({'dist/runtime.js':runtimeValues,'dist/style.css':'.test{}','dist/release-assets/legacy/components.json':'{"availableComponents":[]}','types/delivery/project-runtime.d.ts':runtimeTypes,'THIRD_PARTY_NOTICES.md':'test fixture'})) {mkdirSync(join(archive,path,'..'),{recursive:true});writeFileSync(join(archive,path),content)}
    writeFileSync(join(archive,'runtime-archive.json'),JSON.stringify({schema:'project-runtime-archive/1',buildId:identity.buildId,peerDependencies:{react:'^19.1.1','react-dom':'^19.1.1'},files:listFiles(archive).map(path=>{const content=readFileSync(join(archive,path));return {path,bytes:content.length,sha256:sha256(content)}})}))
    assert.equal((await admin('/projects/guokexin/deliveries/preflight')).data.status,'ready')
    await t.test('每次请求检查项目权限；查看者可读取但不可生成',async()=>{
      assert.equal((await anonymous(base)).status,401)
      assert.equal((await viewer(base)).data.status,'not-generated')
      assert.equal((await viewer(base,'POST',{})).status,403)
      assert.equal((await other(base)).status,403)
      assert.equal((await viewer(base+'/package')).status,409)
    })
    await t.test('重复生成合并；冻结主题不被随后草稿修改覆盖',async()=>{
      const current=await admin('/projects/guokexin/theme');await admin('/projects/guokexin/theme','PUT',{...current.data,theme:{...current.data.theme,brandPrimary:'#445566'}})
      const results=await Promise.all([admin(base,'POST',{}),admin(base,'POST',{})]);assert.ok(results.every(result=>[200,202].includes(result.status)))
      await workspace.deliveries.idle()
      const ready=await viewer(base);assert.equal(ready.data.status,'ready',JSON.stringify(ready.data))
      const download=await viewer(base+'/package');assert.equal(download.status,200);assert.equal(sha256(download.data),ready.data.artifact.sha256)
      const file=join(dir,'download.tgz');writeFileSync(file,download.data);const extract=join(dir,'extract');mkdirSync(extract);execFileSync('tar',['-xzf',file,'-C',extract])
      const tokens=JSON.parse(readFileSync(join(extract,'package/tokens.json'),'utf8'));assert.equal(tokens['--brand-primary'],'#112233')
      const packedSnapshot=JSON.parse(readFileSync(join(extract,'package/snapshot.json'),'utf8'))
      const approvedExports=(packedSnapshot.assets['manifest.json'].availableComponents as Array<{runtimeExport:string}>).map(item=>item.runtimeExport).sort()
      const pkg=JSON.parse(readFileSync(join(extract,'package/package.json'),'utf8'));assert.equal(pkg.name,'@design-workspace/guokexin');assert.equal(pkg.version,'9.0.0')
      const design=readFileSync(join(extract,'package/DESIGN.md'),'utf8')
      assert.equal(pkg.exports['./DESIGN.md'],'./DESIGN.md')
      assert.equal(ready.data.designSpec,design)
      assert.match(design,/projectId: "guokexin"/)
      assert.match(design,/releaseVersion: "9.0.0"/)
      assert.match(design,/\| `--brand-primary` \| #112233 \|/)
      assert.doesNotMatch(design,/\| `--brand-primary` \| #445566 \|/)
      const packageIndex=readFileSync(join(extract,'package/index.js'),'utf8'),packageTypes=readFileSync(join(extract,'package/index.d.ts'),'utf8')
      assert.ok(packageIndex.includes('ProjectTheme'))
      assert.doesNotMatch(packageIndex,/export\s+\*/)
      assert.deepEqual([...new Set(packageIndex.match(/\bDS[A-Z][A-Za-z0-9_$]*\b/g)??[])].sort(),approvedExports)
      assert.deepEqual([...new Set(packageTypes.match(/\bDS[A-Z][A-Za-z0-9_$]*\b/g)??[])].sort(),approvedExports)
      assert.equal(listFiles(join(extract,'package')).some(path=>path.startsWith('dist/release-assets/')),false)
      assert.equal(JSON.parse(readFileSync(join(extract,'package/templates.json'),'utf8')).schemaVersion,'page-template-collection/1')
      assert.doesNotMatch(readFileSync(join(extract,'package/index.js'),'utf8'),/TemplateExample|test-customer-b/)
      assert.equal((await other(base+'/package')).status,403)
      const again=await admin(base,'POST',{});assert.equal(again.data.artifact.sha256,ready.data.artifact.sha256)
    })
    await t.test('消费应用验收记录按项目和版本持久化',async()=>{
      const endpoint='/projects/guokexin/acceptances'
      assert.equal((await viewer(endpoint,'POST',{version:'9.0.0',applicationName:'查询系统',status:'testing',checks:[]})).status,403)
      assert.equal((await admin(endpoint,'POST',{version:'9.0.0',applicationName:'查询系统',owner:'前端组',status:'verified',checks:['package-installed','core-flow','error-recovery','responsive-keyboard'],notes:'回归通过'})).status,201)
      const records=await viewer(endpoint+'?version=9.0.0');assert.equal(records.data.length,1);assert.equal(records.data[0].status,'verified')
    })
    await t.test('两项目与同项目两版本各自保留快照；旧包可回退',async()=>{
      await admin('/projects/guokexin/releases','POST',{version:'9.1.0'});await admin('/projects/test-customer-b/releases','POST',{version:'9.0.0'})
      for(const endpoint of ['/projects/guokexin/deliveries/9.1.0','/projects/test-customer-b/deliveries/9.0.0'])await admin(endpoint,'POST',{})
      await workspace.deliveries.idle()
      const second=await admin('/projects/guokexin/deliveries/9.1.0');assert.equal(second.data.status,'ready');assert.equal(second.data.artifact.releaseVersion,'9.1.0')
      const foreign=await other('/projects/test-customer-b/deliveries/9.0.0');assert.equal(foreign.data.status,'ready');assert.equal(foreign.data.artifact.projectId,'test-customer-b')
      assert.notEqual(foreign.data.artifact.snapshotSha256,(await admin(base)).data.artifact.snapshotSha256)
      assert.equal((await viewer(base+'/package')).status,200)
      assert.equal(readdirSync(join(outputRoot,'guokexin')).length,2)
    })
    await t.test('生成工具失败后保留失败状态并允许重试',async()=>{
      await admin('/projects/guokexin/releases','POST',{version:'9.3.0'})
      const path=process.env.PATH
      try{process.env.PATH='';await admin('/projects/guokexin/deliveries/9.3.0','POST',{});await workspace.deliveries.idle()}finally{process.env.PATH=path}
      assert.equal((await admin('/projects/guokexin/deliveries/9.3.0')).data.status,'failed')
      await admin('/projects/guokexin/deliveries/9.3.0','POST',{});await workspace.deliveries.idle()
      assert.equal((await viewer('/projects/guokexin/deliveries/9.3.0/package')).status,200)
    })
    await t.test('已生成包脱离当前源码归档仍可取用；新版本拒绝错误归档',async()=>{
      renameSync(archive,archive+'-away')
      assert.equal((await viewer(base)).data.status,'ready')
      await admin('/projects/guokexin/releases','POST',{version:'9.2.0'})
      assert.equal((await admin('/projects/guokexin/deliveries/9.2.0')).data.status,'unavailable')
      renameSync(archive+'-away',archive)
      writeFileSync(join(archive,'dist/runtime.js'),'corrupted')
      assert.equal((await admin('/projects/guokexin/deliveries/9.2.0','POST',{})).status,409)
    })
    await t.test('快照的短项目标识必须与授权项目一致',async()=>{
      const row=workspace.db.prepare('SELECT snapshot FROM releases WHERE projectId=? AND version=?').get('guokexin','9.0.0') as {snapshot:string}
      const altered=JSON.parse(row.snapshot);altered.assets['manifest.json'].projectName='test-customer-b';altered.entry.dir='local/test-customer-b/9.0.0';altered.entry.releaseId=`local-test-customer-b-9.0.0-${altered.entry.checksum.slice(-16)}`
      workspace.db.prepare('UPDATE releases SET snapshot=? WHERE projectId=? AND version=?').run(JSON.stringify(altered),'guokexin','9.0.0')
      assert.equal((await viewer(base)).status,409);assert.equal((await admin(base,'POST',{})).status,409)
      workspace.db.prepare('UPDATE releases SET snapshot=? WHERE projectId=? AND version=?').run(row.snapshot,'guokexin','9.0.0')
    })
    await t.test('服务重建后记录仍可读；篡改已生成包后拒绝下载和覆盖',async()=>{
      const snapshot=JSON.parse((workspace.db.prepare('SELECT snapshot FROM releases WHERE projectId=? AND version=?').get('guokexin','9.0.0') as {snapshot:string}).snapshot)
      const service=createDeliveryService({runtimeRoot,outputRoot});assert.equal(service.status(snapshot).status,'ready')
      const ready=await admin(base);writeFileSync(join(outputRoot,'guokexin','9.0.0','ready',ready.data.artifact.archiveName),'corrupted')
      assert.equal((await viewer(base+'/package')).status,409)
      assert.equal((await admin(base,'POST',{})).status,409)
    })
  } finally {await workspace.deliveries.idle();await workspace.close();rmSync(dir,{recursive:true,force:true})}
})
