import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createWorkspace } from './workspace'
import { makeServerBackup, type ServerBackup } from '../src/services/server-backup'
import { createReleaseSnapshot } from '../src/services/release-snapshot'

test('服务端备份使用权威数据，校验权限、冲突、原子性及跨库恢复', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'workspace-backup-test-'))
  const source = createWorkspace({ dbPath: join(dir, 'source.sqlite'), bootstrapToken: 'test-bootstrap' })
  const target = createWorkspace({ dbPath: join(dir, 'target.sqlite'), bootstrapToken: 'test-bootstrap' })
  await Promise.all([source, target].map(workspace => new Promise<void>(done => workspace.server.listen(0, '127.0.0.1', done))))
  const client = (workspace = source) => {
    const base = `http://127.0.0.1:${(workspace.server.address() as {port:number}).port}`
    let cookie = ''
    return async (path:string, method = 'GET', body?:unknown) => {
      const res = await fetch(`${base}/api${path}`, {method, headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json','X-Workspace-Request':'1'},body:body === undefined ? undefined : JSON.stringify(body)})
      if (res.headers.get('set-cookie')) cookie = res.headers.get('set-cookie')!.split(';')[0]
      return { status:res.status,data:await res.json() }
    }
  }
  const admin = client(), viewer = client(), editor = client(), manager = client(), destination = client(target)
  const password = 'Backup-test-password-2026!'
  let backup:ServerBackup
  try {
    for (const request of [admin,destination]) assert.equal((await request('/auth/setup','POST',{token:'test-bootstrap',email:'admin@example.test',name:'测试',password})).status,201)
    for (const [request,role] of [[viewer,'viewer'],[editor,'editor'],[manager,'project-admin']] as const) {
      const invite = await admin('/projects/guokexin/invitations','POST',{email:`${role}@example.test`,role})
      assert.equal((await request('/auth/accept','POST',{token:invite.data.token,name:role,password})).status,200)
    }
    await t.test('导出包含服务端最新主题、冻结资产及动态项目，无账号和凭证',async()=>{
      const current = await admin('/projects/guokexin/theme')
      assert.equal((await admin('/projects/guokexin/theme','PUT',{...current.data,theme:{...current.data.theme,brandPrimary:'#112233'}})).status,200)
      assert.equal((await admin('/projects/guokexin/releases','POST',{version:'8.1.0'})).status,201)
      assert.equal((await admin('/projects/guokexin/acceptances','POST',{version:'8.1.0',applicationName:'验收应用',owner:'前端组',status:'testing',checks:['package-installed'],notes:''})).status,201)
      assert.equal((await admin('/admin/projects','POST',{id:'dynamic-project',name:'迁移项目'})).status,201)
      const result = await admin('/workspace/backup');assert.equal(result.status,200);backup=result.data
      assert.equal(backup.payload.projects.find(item=>item.config.id==='guokexin')!.theme.brandPrimary,'#112233')
      assert.ok(backup.payload.projects.some(item=>item.config.id==='dynamic-project'))
      assert.equal(backup.payload.releases.length,1)
      assert.equal(backup.payload.acceptances?.length,1)
      assert.equal('updatedBy' in backup.payload.acceptances![0],false)
      assert.doesNotMatch(JSON.stringify(backup),/password|workspace_session|admin@example.test/)
    })
    await t.test('匿名被拒绝，查看者仅导出可见项目，编辑者不可恢复',async()=>{
      assert.equal((await client()('/workspace/backup')).status,401)
      const visible = await viewer('/workspace/backup');assert.equal(visible.status,200)
      assert.deepEqual(visible.data.payload.projects.map((item:{config:{id:string}})=>item.config.id),['guokexin'])
      for(const request of [viewer,editor]) assert.equal((await request('/workspace/restore-preview','POST',{backup:visible.data})).status,403)
      assert.equal((await manager('/workspace/restore-preview','POST',{backup})).status,403)
      assert.equal((await manager('/workspace/restore-preview','POST',{backup:visible.data})).status,200)
    })
    await t.test('校验后他人修改会拒绝整批恢复，保留新内容',async()=>{
      const preview = await admin('/workspace/restore-preview','POST',{backup});assert.equal(preview.status,200)
      const current = await admin('/projects/guokexin/theme')
      await admin('/projects/guokexin/theme','PUT',{...current.data,theme:{...current.data.theme,brandPrimary:'#445566'}})
      assert.equal((await admin('/workspace/restore','POST',preview.data)).status,409)
      assert.equal((await admin('/projects/guokexin/theme')).data.theme.brandPrimary,'#445566')
    })
    await t.test('损坏及同号不同内容的版本拒绝恢复',async()=>{
      const damaged=structuredClone(backup);damaged.payload.projects[0].theme.brandPrimary='#000000'
      assert.equal((await admin('/workspace/restore-preview','POST',{backup:damaged})).status,400)
      const incomplete=structuredClone(backup);(incomplete.payload.releases[0].assets['manifest.json'] as {schemaVersion:string}).schemaVersion='bds-release/local-1'
      assert.equal((await admin('/workspace/restore-preview','POST',{backup:makeServerBackup(incomplete.payload)})).status,400)
      const item=backup.payload.projects.find(item=>item.config.id==='guokexin')!
      const conflicting=makeServerBackup({...backup.payload,releases:[createReleaseSnapshot({project:item.config,theme:{...item.theme,brandPrimary:'#778899'},version:'8.1.0'})]})
      assert.equal((await admin('/workspace/restore-preview','POST',{backup:conflicting})).status,409)
      assert.equal((await admin('/projects/guokexin/releases/8.1.0/tokens.json')).data['--brand-primary'],'#112233')
    })
    await t.test('数据库中途失败时回滚此前主题和审计写入',async()=>{
      const preview=await admin('/workspace/restore-preview','POST',{backup})
      const before=await admin('/projects/guokexin/theme')
      const auditCount=(source.db.prepare('SELECT COUNT(*) AS n FROM audit').get() as {n:number}).n
      source.db.exec("CREATE TRIGGER fail_restore BEFORE UPDATE ON themes WHEN NEW.projectId='test-customer-b' BEGIN SELECT RAISE(ABORT,'test rollback'); END;")
      assert.equal((await admin('/workspace/restore','POST',preview.data)).status,500)
      source.db.exec('DROP TRIGGER fail_restore')
      assert.deepEqual((await admin('/projects/guokexin/theme')).data,before.data)
      assert.equal((source.db.prepare('SELECT COUNT(*) AS n FROM audit').get() as {n:number}).n,auditCount)
    })
    await t.test('跨数据库恢复动态项目、主题、冻结资产，保留目标账号和成员',async()=>{
      const usersBefore=target.db.prepare('SELECT * FROM users').all()
      const preview=await destination('/workspace/restore-preview','POST',{backup});assert.equal(preview.status,200)
      assert.equal(preview.data.revisions['dynamic-project'],null)
      assert.equal((await destination('/workspace/restore','POST',preview.data)).status,200)
      assert.equal((await destination('/projects/guokexin/theme')).data.theme.brandPrimary,'#112233')
      assert.equal((await destination('/projects/dynamic-project/theme')).status,200)
      assert.equal((await destination('/projects/guokexin/releases/8.1.0/tokens.json')).data['--brand-primary'],'#112233')
      assert.equal((await destination('/projects/guokexin/acceptances?version=8.1.0')).data[0].applicationName,'验收应用')
      assert.deepEqual(target.db.prepare('SELECT * FROM users').all(),usersBefore)
      assert.equal((await destination('/projects/guokexin/audit')).data[0].action,'workspace.restore')
      const again=await destination('/workspace/restore-preview','POST',{backup});assert.equal((await destination('/workspace/restore','POST',again.data)).status,200)
      assert.equal((target.db.prepare('SELECT COUNT(*) AS n FROM releases').get() as {n:number}).n,1)
    })
    await t.test('服务端主题校验与备份一致，拒绝零字号和外部 CSS 资源',async()=>{
      const current=await admin('/projects/guokexin/theme')
      for(const patch of [{bodySize:0},{shadow:'url(https://example.test/x)'},{controlHeight:0}])assert.equal((await admin('/projects/guokexin/theme','PUT',{...current.data,theme:{...current.data.theme,...patch}})).status,400)
    })
  } finally { await Promise.all([source.close(),target.close()]);rmSync(dir,{recursive:true,force:true}) }
})
