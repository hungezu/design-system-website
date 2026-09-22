import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createWorkspace } from './workspace'
import type { SessionData, Account } from '../src/services/access-types'
const password = '12345678' // Boundary fixture: eight numeric characters must be accepted.
const bootstrapToken = 'test-only-bootstrap-secret'
test('真实会话、项目隔离、角色校验、邀请、并发保存与持久化', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'workspace-access-test-'))
  let workspace = createWorkspace({ dbPath: join(dir, 'test.sqlite'), bootstrapToken })
  await new Promise<void>(done => workspace.server.listen(0, '127.0.0.1', done))
  let base = `http://127.0.0.1:${(workspace.server.address() as { port: number }).port}`
  const client = () => {
    let cookie = ''
    return async (path: string, method = 'GET', body?: unknown, overrides?: Record<string, string>) => {
      const res = await fetch(`${base}${path}`, { method, headers: { Cookie: cookie, Origin: base, 'Content-Type': 'application/json', 'X-Workspace-Request': '1', ...overrides }, body: body === undefined ? undefined : JSON.stringify(body) })
      const set = res.headers.get('set-cookie'); if (set) cookie = set.split(';')[0]
      return { status: res.status, headers: res.headers, data: await res.json() }
    }
  }
  const admin = client(); const anonymous = client(); const viewer = client(); const editor = client(); const manager = client(); const outsider = client()
  let viewerId = ''; let editorId = ''; let adminId = ''; let managerId = ''; let viewerInvite = ''
  const invite = async (email: string, role: string, target = 'guokexin') => {
    const result = await admin(`/api/projects/${target}/invitations`, 'POST', { email, role }); assert.equal(result.status, 201); return result.data.token as string
  }
  try {
    await t.test('初始无默认管理员会话；初始化要求一次性秘密', async () => {
      assert.equal((await anonymous('/api/auth/me')).status, 401)
      assert.equal((await anonymous('/api/auth/setup', 'POST', { token: 'wrong', email: 'admin@example.test', name: '管理员', password })).status, 403)
      assert.equal((await anonymous('/api/auth/setup', 'POST', { token: bootstrapToken, email: 'admin@example.test', name: '管理员', password: '1234567' })).status, 400)
      const result = await admin('/api/auth/setup', 'POST', { token: bootstrapToken, email: 'admin@example.test', name: '管理员', password })
      assert.equal(result.status, 201); adminId = result.data.user.id
      assert.match(result.headers.get('set-cookie')!, /HttpOnly; SameSite=Strict/)
      assert.equal((await anonymous('/api/auth/setup', 'POST', { token: bootstrapToken, email: 'other@example.test', name: 'other', password })).status, 409)
    })
    await t.test('跨站写入被拒绝，客户端伪造角色不能授权', async () => {
      assert.equal((await admin('/api/admin/projects', 'POST', { id: 'cross-site', name: '拒绝' }, { Origin: 'https://untrusted.example' })).status, 403)
      assert.equal((await anonymous('/api/admin/users', 'GET', undefined, { 'X-Role': 'super-admin' })).status, 401)
    })
    await t.test('成功登录不累计锁定；连续失败仅限制对应账号', async () => {
      const repeated = client()
      for (let index = 0; index < 26; index++) assert.equal((await repeated('/api/auth/login', 'POST', { email: 'admin@example.test', password })).status, 200)
      for (let index = 0; index < 25; index++) assert.equal((await anonymous('/api/auth/login', 'POST', { email: 'unknown@example.test', password: 'wrong-password' })).status, 401)
      assert.equal((await anonymous('/api/auth/login', 'POST', { email: 'unknown@example.test', password: 'wrong-password' })).status, 429)
      assert.equal((await repeated('/api/auth/login', 'POST', { email: 'admin@example.test', password })).status, 200)
    })
    await t.test('邀请建立真实账号和项目内不同角色，不泄露密码散列', async () => {
      viewerInvite = await invite('viewer@example.test', 'viewer')
      const invitation = await anonymous(`/api/auth/invitation?token=${viewerInvite}`); assert.equal(invitation.data.projectId, 'guokexin')
      let result = await viewer('/api/auth/accept', 'POST', { token: viewerInvite, password, name: '查看者', profession: 'product' })
      assert.equal(result.status, 200); viewerId = result.data.user.id
      assert.equal(result.data.user.platformRole, 'member'); assert.equal('password' in result.data.user, false)
      assert.deepEqual((result.data as SessionData).projects.map(project => project.id), ['guokexin'])
      result = await editor('/api/auth/accept', 'POST', { token: await invite('editor@example.test', 'editor'), password, name: '开发', profession: 'development' }); editorId = result.data.user.id; assert.equal(result.status, 200)
      result = await manager('/api/auth/accept', 'POST', { token: await invite('manager@example.test', 'project-admin'), password, name: '项目管理员' }); managerId = result.data.user.id; assert.equal(result.status, 200)
      result = await outsider('/api/auth/accept', 'POST', { token: await invite('outside@example.test', 'viewer', 'test-customer-b'), password, name: '客户B' }); assert.equal(result.status, 200)
      assert.equal((await anonymous('/api/auth/accept', 'POST', { token: viewerInvite, password, name: '重复使用' })).status, 404)
      const users = await admin('/api/admin/users'); assert.ok(users.data.every((user: Account) => !('password' in user)))
    })
    await t.test('查看者可读不可写，不能访问另一个项目或成员管理', async () => {
      const theme = await viewer('/api/projects/guokexin/theme'); assert.equal(theme.status, 200)
      assert.equal((await viewer('/api/projects/guokexin/theme', 'PUT', theme.data)).status, 403)
      assert.equal((await viewer('/api/projects/guokexin/releases', 'POST', { version: '7.0.0' })).status, 403)
      assert.equal((await viewer('/api/projects/guokexin/members')).status, 403)
      assert.equal((await viewer('/api/projects/test-customer-b/theme')).status, 403)
      assert.equal((await viewer('/api/admin/users')).status, 403)
    })
    await t.test('编辑者可保存共享主题；过期修订冲突不覆盖他人修改', async () => {
      const current = await editor('/api/projects/guokexin/theme')
      const changed = { ...current.data.theme, brandPrimary: '#123456' }
      assert.equal((await editor('/api/projects/guokexin/theme', 'PUT', { theme: changed, revision: current.data.revision })).status, 200)
      assert.equal((await viewer('/api/projects/guokexin/theme')).data.theme.brandPrimary, '#123456')
      assert.equal((await editor('/api/projects/guokexin/theme', 'PUT', current.data)).status, 409)
      assert.equal((await editor('/api/projects/guokexin/releases', 'POST', { version: '7.0.0' })).status, 403)
    })
    await t.test('项目管理员可发布版本但不能管理平台；发布资产受项目权限保护', async () => {
      assert.equal((await manager('/api/admin/users')).status, 403)
      const result = await manager('/api/projects/guokexin/releases', 'POST', { version: '7.0.0', note: '测试冻结' }); assert.equal(result.status, 201, JSON.stringify(result.data))
      const asset = await viewer('/api/projects/guokexin/releases/7.0.0/tokens.json'); assert.equal(asset.status, 200); assert.equal(asset.data['--brand-primary'], '#123456')
      assert.equal((await outsider('/api/projects/guokexin/releases/7.0.0/tokens.json')).status, 403)
      assert.equal((await manager('/api/projects/guokexin/releases', 'POST', { version: '7.0.0' })).status, 409)
      const index = await outsider('/release-assets/index.json'); assert.ok(index.data.every((entry: { projectId: string }) => entry.projectId !== 'proj-mtwba7n6-nh1d88'))
      assert.equal((await anonymous('/release-assets/index.json')).status, 401)
    })
    await t.test('已有账号加入另一项目须原密码，且权限按项目隔离', async () => {
      const token = await invite('editor@example.test', 'viewer', 'test-customer-b')
      assert.equal((await editor('/api/auth/accept', 'POST', { token, password: 'A-wrong-password-2026' })).status, 401)
      assert.equal((await editor('/api/auth/accept', 'POST', { token, password })).status, 200)
      const theme = await editor('/api/projects/test-customer-b/theme'); assert.equal(theme.status, 200)
      assert.equal((await editor('/api/projects/test-customer-b/theme', 'PUT', theme.data)).status, 403)
    })
    await t.test('成员角色修改立即生效；最后一位项目管理员受到保护', async () => {
      assert.equal((await manager(`/api/projects/guokexin/members/${viewerId}`, 'PATCH', { role: 'editor' })).status, 200)
      const current = await viewer('/api/projects/guokexin/theme'); assert.equal((await viewer('/api/projects/guokexin/theme', 'PUT', current.data)).status, 200)
      // Bootstrap admin is also a project admin; remove that membership first.
      const adminMembership = workspace.db.prepare('SELECT role FROM memberships WHERE projectId=? AND userId=?').get('guokexin', adminId)
      if (adminMembership) assert.equal((await admin(`/api/projects/guokexin/members/${adminId}`, 'DELETE')).status, 200)
      assert.equal((await manager(`/api/projects/guokexin/members/${managerId}`, 'DELETE')).status, 409)
      assert.equal((await manager(`/api/projects/guokexin/members/${viewerId}`, 'DELETE')).status, 200)
      assert.equal((await viewer('/api/projects/guokexin/theme')).status, 403)
      assert.equal((await manager('/api/projects/guokexin/invitations', 'POST', { email: 'new@example.test', role: 'super-admin' })).status, 400)
    })
    await t.test('撤销、过期邀请不可使用', async () => {
      const token = await invite('revoke@example.test', 'viewer')
      const invites = await manager('/api/projects/guokexin/invitations')
      const row = invites.data.find((item: { email: string }) => item.email === 'revoke@example.test')
      assert.equal((await manager(`/api/projects/guokexin/invitations/${row.id}`, 'DELETE')).status, 200)
      assert.equal((await anonymous(`/api/auth/invitation?token=${token}`)).status, 404)
      const expired = await invite('expired@example.test', 'viewer'); workspace.db.prepare('UPDATE invitations SET expiresAt=0 WHERE email=?').run('expired@example.test')
      assert.equal((await anonymous('/api/auth/accept', 'POST', { token: expired, password, name: 'Expired' })).status, 404)
    })
    await t.test('停用立即结束旧会话，启用后必须重新登录', async () => {
      assert.equal((await admin(`/api/admin/users/${editorId}`, 'PATCH', { status: 'disabled' })).status, 200)
      assert.equal((await editor('/api/auth/me')).status, 401)
      assert.equal((await editor('/api/auth/login', 'POST', { email: 'editor@example.test', password })).status, 401)
      assert.equal((await admin(`/api/admin/users/${editorId}`, 'PATCH', { status: 'active' })).status, 200)
      assert.equal((await editor('/api/auth/me')).status, 401)
      assert.equal((await editor('/api/auth/login', 'POST', { email: 'editor@example.test', password })).status, 200)
    })
    await t.test('密码重置使旧密码、旧会话和已使用链接失效', async () => {
      const result = await admin(`/api/admin/users/${editorId}/reset`, 'POST', {})
      const resetter = client(); const nextPassword = 'abcdefgh'
      assert.equal((await resetter('/api/auth/accept', 'POST', { token: result.data.token, password: nextPassword })).status, 200)
      assert.equal((await editor('/api/auth/me')).status, 401)
      assert.equal((await editor('/api/auth/login', 'POST', { email: 'editor@example.test', password })).status, 401)
      assert.equal((await resetter('/api/auth/logout', 'POST', {})).status, 200)
      assert.equal((await resetter('/api/auth/me')).status, 401)
    })
    await t.test('新建项目存储独立，服务重启后账号、权限和主题保留', async () => {
      const generated = await admin('/api/admin/projects', 'POST', { name: '自动生成项目标识' })
      assert.equal(generated.status, 201)
      assert.match(generated.data.id, /^project-[a-f0-9]{8}$/)
      assert.equal((await admin(`/api/projects/${generated.data.id}/theme`)).status, 200)
      assert.equal((await admin('/api/admin/projects', 'POST', { id: 'team-new', name: '新的真实项目' })).status, 201)
      assert.equal((await admin('/api/projects/team-new/theme')).status, 200)
      assert.equal((await manager('/api/projects/team-new/theme')).status, 403)
      await workspace.close()
      workspace = createWorkspace({ dbPath: join(dir, 'test.sqlite'), bootstrapToken })
      await new Promise<void>(done => workspace.server.listen(0, '127.0.0.1', done)); base = `http://127.0.0.1:${(workspace.server.address() as { port: number }).port}`
      assert.equal((await admin('/api/auth/me')).status, 200)
      assert.equal((await admin('/api/projects/guokexin/theme')).data.theme.brandPrimary, '#123456')
      assert.equal((await admin('/api/projects/guokexin/releases/7.0.0/tokens.json')).status, 200)
      assert.equal((await admin('/api/auth/status')).data.needsSetup, false)
    })
    await t.test('平台管理员删除项目及其关联数据，重启后不会恢复内置项目', async () => {
      assert.equal((await manager('/api/admin/projects/team-new', 'DELETE')).status, 403)
      assert.equal((await admin('/api/admin/projects/team-new', 'DELETE')).status, 200)
      assert.equal((await admin('/api/projects/team-new/theme')).status, 404)
      assert.equal((await admin('/api/admin/projects/test-customer-b', 'DELETE')).status, 200)
      for (const table of ['projects', 'memberships', 'invitations', 'themes', 'releases', 'delivery_acceptances']) {
        const row = workspace.db.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${table === 'projects' ? 'id' : 'projectId'}=?`).get('test-customer-b') as { count: number }
        assert.equal(row.count, 0, `${table} 仍有项目关联数据`)
      }
      const current = await admin('/api/auth/me')
      assert.equal(current.data.projects.some((project: { id: string }) => project.id === 'team-new' || project.id === 'test-customer-b'), false)
      assert.equal((await outsider('/api/projects/test-customer-b/theme')).status, 404)
      const stored = workspace.db.prepare('SELECT config FROM projects WHERE id=?').get('guokexin') as { config: string }
      const legacyConfig = JSON.parse(stored.config)
      legacyConfig.componentIds = legacyConfig.componentIds.filter((id: string) => id !== 'search-field')
      workspace.db.prepare('UPDATE projects SET config=? WHERE id=?').run(JSON.stringify(legacyConfig), 'guokexin')
      workspace.db.prepare('DELETE FROM workspace_migrations WHERE id=?').run('guokexin-search-field-1')
      await workspace.close()
      workspace = createWorkspace({ dbPath: join(dir, 'test.sqlite'), bootstrapToken })
      await new Promise<void>(done => workspace.server.listen(0, '127.0.0.1', done)); base = `http://127.0.0.1:${(workspace.server.address() as { port: number }).port}`
      const afterRestart = await admin('/api/auth/me')
      assert.equal(afterRestart.data.projects.some((project: { id: string }) => project.id === 'team-new' || project.id === 'test-customer-b'), false)
      assert.equal(afterRestart.data.projects.find((project: { id: string }) => project.id === 'guokexin')?.componentIds.includes('search-field'), true)
    })
  } finally { await workspace.close(); rmSync(dir, { recursive: true, force: true }) }
})
