import { createDeliveryService, deliveryIdentity } from './project-delivery'
import type { DeliveryAcceptance } from '../src/services/project-delivery'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { DatabaseSync } from 'node:sqlite'
import { randomBytes, randomUUID, createHash, scrypt as rawScrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync, unlinkSync } from 'node:fs'
import { dirname, resolve, extname, sep } from 'node:path'
import { projects as seeds } from '../src/data/projects/index'
import { AI_COMPONENT_IDS } from '../src/data/ai-components'
import { defaultProjectTheme, projectPreviewVariables, type ProjectThemeSettings } from '../src/services/project-theme'
import { createReleaseSnapshot, validateSnapshot } from '../src/services/release-snapshot'
import type { LocalReleaseSnapshot, ReleaseCatalogEntry, ReleaseAssetName } from '../src/services/release-catalog'
import type { ProjectConfig } from '../src/types/design-system'
import { BACKUP_LIMIT, makeServerBackup, validateServerBackup } from '../src/services/server-backup'
import { canonicalJson } from '../src/services/release-snapshot'
import { checkTheme } from '../src/services/workspace-backup'
import type { Account, Membership, ProjectRole } from '../src/services/access-types'
import { hasValidPasswordLength } from '../src/services/password-policy'
import runtimeBuild from '../src/data/generated/runtime-build.json'
import { analyzeDesignMarkdown, applyDesignMarkdownChanges, DESIGN_MARKDOWN_IMPORT_LIMIT, readDesignMarkdownIdentity } from '../src/services/design-markdown-import'
import { resolveProjectTheme } from '../src/services/theme-resolver'

const scrypt = promisify(rawScrypt)
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const secret = () => randomBytes(32).toString('base64url')
const roles = ['viewer', 'editor', 'project-admin']
const professions = ['product', 'design', 'development', 'other']
const cookieName = 'workspace_session'
const sessionAge = 1000 * 60 * 60 * 12
class HttpError extends Error { constructor(public status: number, message: string) { super(message) } }
function requireValue(ok: unknown, message: string, status = 400): asserts ok { if (!ok) throw new HttpError(status, message) }
const text = (value: unknown, max = 200) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const emailOf = (value: unknown) => { const email = text(value, 254).toLowerCase(); requireValue(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), '请输入有效的邮箱地址。'); return email }
function validPassword(value: unknown): asserts value is string { requireValue(hasValidPasswordLength(value), '密码需为 8–128 个字符。') }
async function hashPassword(password: string) { const salt = secret(); const hash = await scrypt(password, salt, 64) as Buffer; return `${salt}:${hash.toString('hex')}` }
async function checkPassword(password: string, encoded: string) { const [salt, hash] = encoded.split(':'); const actual = await scrypt(password.slice(0, 129), salt, 64) as Buffer; return timingSafeEqual(actual, Buffer.from(hash, 'hex')) }
type UserRow = Account & { password: string }
type InviteRow = { id: string; token: string; email: string; projectId: string; role: ProjectRole; expiresAt: number; used: number; purpose: 'invite' | 'reset' }
type StoredAcceptance = Omit<DeliveryAcceptance, 'checks' | 'updatedBy'> & { checks: string }
const publicUser = (user: UserRow): Account => ({ id: user.id, email: user.email, name: user.name, profession: user.profession, platformRole: user.platformRole, status: user.status })

export function createWorkspace(options: { dbPath: string; root?: string; appOrigin?: string; bootstrapToken?: string; serveStatic?: boolean; deliveryRuntimeRoot?: string; deliveryOutputRoot?: string }) {
  const root = options.root ?? process.cwd()
  const deliveries = createDeliveryService({ runtimeRoot: options.deliveryRuntimeRoot ?? resolve(root, 'artifacts/runtime-builds'), outputRoot: options.deliveryOutputRoot ?? resolve(dirname(options.dbPath), 'deliveries') })
  const setupFile = resolve(dirname(options.dbPath), 'setup-token.txt')
  mkdirSync(dirname(options.dbPath), { recursive: true, mode: 0o700 })
  const db = new DatabaseSync(options.dbPath)
  chmodSync(options.dbPath, 0o600)
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, profession TEXT NOT NULL, platformRole TEXT NOT NULL, status TEXT NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, config TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS memberships (projectId TEXT REFERENCES projects(id), userId TEXT REFERENCES users(id), role TEXT NOT NULL, PRIMARY KEY(projectId,userId));
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, userId TEXT REFERENCES users(id), expiresAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS invitations (id TEXT PRIMARY KEY, token TEXT UNIQUE NOT NULL, email TEXT NOT NULL, projectId TEXT REFERENCES projects(id), role TEXT, expiresAt INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0, purpose TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS themes (projectId TEXT PRIMARY KEY REFERENCES projects(id), value TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS releases (projectId TEXT REFERENCES projects(id), version TEXT NOT NULL, snapshot TEXT NOT NULL, PRIMARY KEY(projectId,version));
    CREATE TABLE IF NOT EXISTS delivery_acceptances (id TEXT PRIMARY KEY, projectId TEXT REFERENCES projects(id), version TEXT NOT NULL, applicationName TEXT NOT NULL, owner TEXT NOT NULL, status TEXT NOT NULL, checks TEXT NOT NULL, notes TEXT NOT NULL, updatedAt INTEGER NOT NULL, updatedBy TEXT REFERENCES users(id), UNIQUE(projectId,version,applicationName));
    CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, userId TEXT, projectId TEXT, action TEXT NOT NULL, subject TEXT, createdAt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS deleted_projects (id TEXT PRIMARY KEY, deletedAt INTEGER NOT NULL, deletedBy TEXT REFERENCES users(id));
  `)
  for (const project of seeds) {
    if (db.prepare('SELECT id FROM deleted_projects WHERE id=?').get(project.id)) continue
    db.prepare('INSERT OR IGNORE INTO projects VALUES (?,?)').run(project.id, JSON.stringify(project))
    db.prepare('INSERT OR IGNORE INTO themes VALUES (?,?,0)').run(project.id, JSON.stringify(defaultProjectTheme(project)))
  }
  const userCount = () => (db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number }).count
  let bootstrapToken = ''
  if (!userCount()) {
    bootstrapToken = options.bootstrapToken ?? (existsSync(setupFile) ? readFileSync(setupFile, 'utf8').trim() : secret())
    if (!options.bootstrapToken) writeFileSync(setupFile, bootstrapToken, { mode: 0o600 })
  }
  const transaction = <T,>(fn: () => T): T => { db.exec('BEGIN IMMEDIATE'); try { const value = fn(); db.exec('COMMIT'); return value } catch (error) { db.exec('ROLLBACK'); throw error } }
  db.exec('CREATE TABLE IF NOT EXISTS workspace_migrations (id TEXT PRIMARY KEY)')
  if (!db.prepare('SELECT id FROM workspace_migrations WHERE id=?').get('ai-component-library-1')) transaction(() => {
    for (const row of db.prepare('SELECT id,config FROM projects').all() as {id:string;config:string}[]) {
      const config = JSON.parse(row.config) as ProjectConfig
      config.componentIds = [...new Set([...config.componentIds, ...AI_COMPONENT_IDS])]
      db.prepare('UPDATE projects SET config=? WHERE id=?').run(JSON.stringify(config), row.id)
    }
    db.prepare('INSERT INTO workspace_migrations VALUES (?)').run('ai-component-library-1')
  })
  if (!db.prepare('SELECT id FROM workspace_migrations WHERE id=?').get('guokexin-search-field-1')) transaction(() => {
    const row = db.prepare('SELECT config FROM projects WHERE id=?').get('guokexin') as { config: string } | undefined
    if (row) {
      const config = JSON.parse(row.config) as ProjectConfig
      config.componentIds = [...new Set([...config.componentIds, 'search-field'])]
      db.prepare('UPDATE projects SET config=? WHERE id=?').run(JSON.stringify(config), 'guokexin')
    }
    db.prepare('INSERT INTO workspace_migrations VALUES (?)').run('guokexin-search-field-1')
  })
  const audit = (userId: string, projectId: string | null, action: string, subject: string) => db.prepare('INSERT INTO audit(userId,projectId,action,subject,createdAt) VALUES (?,?,?,?,?)').run(userId, projectId, action, subject, Date.now())
  const getUser = (id: string) => db.prepare('SELECT * FROM users WHERE id=?').get(id) as UserRow | undefined
  const projectById = (id: string) => { const row = db.prepare('SELECT config FROM projects WHERE id=?').get(id) as { config: string } | undefined; requireValue(row, '项目不存在。', 404); return JSON.parse(row.config) as ProjectConfig }
  const memberships = (userId: string) => db.prepare('SELECT * FROM memberships WHERE userId=?').all(userId) as unknown as Membership[]
  const roleFor = (user: Account, projectId: string) => user.platformRole === 'admin' ? 'project-admin' : memberships(user.id).find(x => x.projectId === projectId)?.role
  const allow = (user: Account, projectId: string, level: 'read' | 'edit' | 'manage' = 'read') => {
    projectById(projectId)
    const role = roleFor(user, projectId)
    requireValue(role && (level === 'read' || (level === 'edit' && role !== 'viewer') || role === 'project-admin'), '没有执行此操作的项目权限。', 403)
  }
  const admin = (user: Account) => requireValue(user.platformRole === 'admin', '仅平台管理员可执行此操作。', 403)
  const sessionData = (user: UserRow) => ({ user: publicUser(user), memberships: memberships(user.id), projects: (db.prepare('SELECT config FROM projects').all() as { config: string }[]).map(row => JSON.parse(row.config) as ProjectConfig).filter(project => roleFor(user, project.id)) })
  const cookie = (req: IncomingMessage) => (req.headers.cookie ?? '').split(';').map(x => x.trim()).find(x => x.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1) ?? ''
  const authenticate = (req: IncomingMessage) => {
    const row = db.prepare('SELECT userId FROM sessions WHERE token=? AND expiresAt>?').get(digest(cookie(req)), Date.now()) as { userId: string } | undefined
    const user = row && getUser(row.userId)
    requireValue(user?.status === 'active', '登录已失效，请重新登录。', 401)
    return user!
  }
  const setSession = (res: ServerResponse, user: UserRow) => {
    const token = secret()
    db.prepare('DELETE FROM sessions WHERE expiresAt<?').run(Date.now())
    db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), user.id, Date.now() + sessionAge)
    res.setHeader('Set-Cookie', `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${sessionAge / 1000}${options.appOrigin?.startsWith('https:') ? '; Secure' : ''}`)
  }
  const attempts = new Map<string, { count: number; until: number }>()
  function limit(req: IncomingMessage, subject = 'auth') {
    const now = Date.now(); for (const [key, item] of attempts) if (item.until < now) attempts.delete(key)
    const key = `${req.socket.remoteAddress ?? 'unknown'}:${subject}`
    const item = attempts.get(key) ?? { count: 0, until: now + 15 * 60_000 }
    requireValue(item.count < 25 && attempts.size < 10000, '尝试过于频繁，请 15 分钟后重试。', 429)
    item.count++; attempts.set(key, item)
    return key
  }
  async function body(req: IncomingMessage, maxBytes = 4_000_000): Promise<Record<string, unknown>> {
    requireValue(req.headers['content-type']?.startsWith('application/json'), '请求必须使用 JSON。', 415)
    const chunks: Buffer[] = []; let length = 0
    for await (const chunk of req) { length += chunk.length; requireValue(length <= maxBytes, '请求内容过大。', 413); chunks.push(chunk) }
    let parsed: unknown; try { parsed = JSON.parse(Buffer.concat(chunks).toString() || '{}') } catch { throw new HttpError(400, '请求格式无效。') }
    requireValue(parsed && typeof parsed === 'object' && !Array.isArray(parsed), '请求格式无效。')
    return parsed as Record<string, unknown>
  }
  const json = (res: ServerResponse, value: unknown, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)) }
  const bundledIndex = (): ReleaseCatalogEntry[] => JSON.parse(readFileSync(resolve(root, 'public/release-assets/index.json'), 'utf8'))
  const designMarkdownPreview = (projectId: string, markdown: string) => {
    const project = projectById(projectId)
    const themeRow = db.prepare('SELECT value,revision FROM themes WHERE projectId=?').get(projectId) as { value: string; revision: number }
    const identity = readDesignMarkdownIdentity(markdown)
    let baseTokens: Record<string, string> | undefined
    let expectedSnapshotChecksum: string | undefined
    let expectedRuntimeBuildId: string | undefined
    if (identity.projectId === project.id && identity.releaseProjectId === project.releaseProjectId && identity.releaseVersion) {
      const saved = db.prepare('SELECT snapshot FROM releases WHERE projectId=? AND version=?').get(projectId, identity.releaseVersion) as { snapshot: string } | undefined
      if (saved) {
        const snapshot = JSON.parse(saved.snapshot) as LocalReleaseSnapshot
        const tokens = snapshot.assets['tokens.json']
        if (tokens && typeof tokens === 'object' && !Array.isArray(tokens)) baseTokens = tokens as Record<string, string>
        expectedSnapshotChecksum = snapshot.entry.checksum
        expectedRuntimeBuildId = (snapshot.assets['manifest.json'] as { componentRuntimeVersion?: string } | undefined)?.componentRuntimeVersion
      } else {
        const entry = bundledIndex().find(item => item.projectId === project.releaseProjectId && item.version === identity.releaseVersion)
        if (entry) {
          const assetPath = resolve(root, 'public', 'release-assets', entry.dir, 'tokens.json')
          if (existsSync(assetPath)) {
            const tokens = JSON.parse(readFileSync(assetPath, 'utf8')) as unknown
            if (tokens && typeof tokens === 'object' && !Array.isArray(tokens)) baseTokens = tokens as Record<string, string>
          }
          expectedSnapshotChecksum = entry.checksum
          const manifestPath = resolve(root, 'public', 'release-assets', entry.dir, 'manifest.json')
          if (existsSync(manifestPath)) expectedRuntimeBuildId = (JSON.parse(readFileSync(manifestPath, 'utf8')) as { componentRuntimeVersion?: string }).componentRuntimeVersion
        }
      }
    }
    const theme = JSON.parse(themeRow.value) as ProjectThemeSettings
    return {
      documentChecksum: `sha256:${digest(markdown)}`,
      baseRevision: themeRow.revision,
      analysis: analyzeDesignMarkdown(markdown, { projectId: project.id, releaseProjectId: project.releaseProjectId, theme, baseTokens, currentTokens: projectPreviewVariables(theme, resolveProjectTheme(project)), expectedSnapshotChecksum, expectedRuntimeBuildId }),
    }
  }
  function ensureLastAdmin(projectId: string, userId: string, nextRole?: string) {
    const row = db.prepare('SELECT role FROM memberships WHERE projectId=? AND userId=?').get(projectId, userId) as { role: string } | undefined
    if (row?.role !== 'project-admin' || nextRole === 'project-admin') return
    const count = db.prepare("SELECT COUNT(*) AS count FROM memberships m JOIN users u ON m.userId=u.id WHERE m.projectId=? AND m.role='project-admin' AND u.status='active'").get(projectId) as { count: number }
    requireValue(count.count > 1, '请先指定另一位项目管理员，再移除或降级最后一位管理员。', 409)
  }
  const server = createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('X-Frame-Options', 'DENY')
    try {
      const url = new URL(req.url ?? '/', 'http://workspace.local')
      const path = decodeURIComponent(url.pathname)
      const method = req.method ?? 'GET'
      if (!['GET', 'HEAD'].includes(method)) {
        const address = server.address(); const port = typeof address === 'object' && address ? address.port : 0
        const origins = new Set([`http://127.0.0.1:${port}`, `http://localhost:${port}`, options.appOrigin ?? 'http://127.0.0.1:5173'])
        requireValue(origins.has(String(req.headers.origin)) && req.headers['x-workspace-request'] === '1', '请求来源无效，请刷新页面后重试。', 403)
      }
      if (method === 'GET' && path === '/api/auth/status') return json(res, { needsSetup: !userCount() })
      if (method === 'POST' && path === '/api/auth/setup') {
        const attemptKey = limit(req); requireValue(!userCount(), '平台已初始化。', 409)
        const input = await body(req)
        requireValue(typeof input.token === 'string' && timingSafeEqual(Buffer.from(digest(input.token)), Buffer.from(digest(bootstrapToken))), '初始化码无效。', 403)
        const email = emailOf(input.email); validPassword(input.password)
        const name = text(input.name, 80); requireValue(name, '请输入姓名。')
        const password = await hashPassword(input.password)
        const id = randomUUID()
        transaction(() => { requireValue(!userCount(), '平台已初始化。', 409); db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?)').run(id, email, name, 'other', 'admin', 'active', password); for (const project of seeds) db.prepare('INSERT INTO memberships VALUES (?,?,?)').run(project.id, id, 'project-admin'); audit(id, null, 'platform.setup', id) })
        bootstrapToken = ''; if (!options.bootstrapToken && existsSync(setupFile)) unlinkSync(setupFile)
        attempts.delete(attemptKey)
        const user = getUser(id)!; setSession(res, user); return json(res, sessionData(user), 201)
      }
      if (method === 'POST' && path === '/api/auth/login') {
        const input = await body(req); const email = emailOf(input.email); const attemptKey = limit(req, `login:${email}`)
        const user = db.prepare('SELECT * FROM users WHERE email=?').get(email) as UserRow | undefined
        const dummy = `${'0'.repeat(43)}:${'0'.repeat(128)}`
        const valid = await checkPassword(typeof input.password === 'string' ? input.password : '', user?.password ?? dummy)
        requireValue(valid && user?.status === 'active', '邮箱或密码不正确，或账号已停用。', 401)
        attempts.delete(attemptKey)
        setSession(res, user!); return json(res, sessionData(user!))
      }
      if (method === 'GET' && path === '/api/auth/invitation') {
        const token = url.searchParams.get('token') ?? ''
        const row = db.prepare('SELECT * FROM invitations WHERE token=? AND used=0 AND expiresAt>?').get(digest(token), Date.now()) as InviteRow | undefined
        requireValue(row, '链接已失效、已撤销或已使用，请联系管理员重新生成。', 404)
        return json(res, { email: row.email, projectId: row.projectId, projectName: row.projectId ? projectById(row.projectId).name : null, role: row.role, purpose: row.purpose, existingAccount: Boolean(db.prepare('SELECT id FROM users WHERE email=?').get(row.email)) })
      }
      if (method === 'POST' && path === '/api/auth/accept') {
        const attemptKey = limit(req); const input = await body(req)
        const row = db.prepare('SELECT * FROM invitations WHERE token=? AND used=0 AND expiresAt>?').get(digest(String(input.token)), Date.now()) as InviteRow | undefined
        requireValue(row, '链接已失效，请联系管理员。', 404)
        let user = db.prepare('SELECT * FROM users WHERE email=?').get(row.email) as UserRow | undefined
        requireValue(!user || user.status === 'active', '账号已停用，请联系平台管理员。', 403)
        validPassword(input.password)
        if (user && row.purpose === 'invite') requireValue(await checkPassword(input.password, user.password), '请输入此邮箱已有账号的登录密码。', 401)
        const name = text(input.name, 80)
        if (!user) requireValue(name, '请输入姓名。')
        const password = (!user || row.purpose === 'reset') ? await hashPassword(input.password) : user.password
        const userId = user?.id ?? randomUUID()
        transaction(() => {
          const changed = db.prepare('UPDATE invitations SET used=1 WHERE id=? AND used=0 AND expiresAt>?').run(row.id, Date.now())
          requireValue(changed.changes === 1, '链接已使用或过期。', 409)
          if (!user) db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?)').run(userId, row.email, name, professions.includes(String(input.profession)) ? String(input.profession) : 'other', 'member', 'active', password)
          else if (row.purpose === 'reset') { db.prepare('UPDATE users SET password=? WHERE id=?').run(password, userId); db.prepare('DELETE FROM sessions WHERE userId=?').run(userId) }
          if (row.purpose === 'invite') db.prepare('INSERT INTO memberships VALUES (?,?,?) ON CONFLICT(projectId,userId) DO NOTHING').run(row.projectId, userId, row.role)
          audit(userId, row.projectId, `account.${row.purpose}`, row.id)
        })
        attempts.delete(attemptKey)
        user = getUser(userId)!; setSession(res, user); return json(res, sessionData(user))
      }
      if (path.startsWith('/api/')) {
        const user = authenticate(req)
        if (method === 'GET' && path === '/api/workspace/backup') {
          const configs = sessionData(user).projects
          requireValue(configs.length, '没有可备份的项目。')
          const payload = { projects: configs.map(config => ({ config, theme: JSON.parse((db.prepare('SELECT value FROM themes WHERE projectId=?').get(config.id) as {value:string}).value) as ProjectThemeSettings })), releases: configs.flatMap(config => (db.prepare('SELECT snapshot FROM releases WHERE projectId=?').all(config.id) as {snapshot:string}[]).map(row => JSON.parse(row.snapshot) as LocalReleaseSnapshot)), acceptances: configs.flatMap(config => (db.prepare('SELECT id,projectId,version,applicationName,owner,status,checks,notes,updatedAt FROM delivery_acceptances WHERE projectId=?').all(config.id) as unknown as StoredAcceptance[]).map(row => ({ ...row, checks: JSON.parse(row.checks) as string[] }))) }
          const backup = makeServerBackup(payload)
          requireValue(Buffer.byteLength(JSON.stringify(backup)) <= BACKUP_LIMIT, '备份超过 20 MB，请联系管理员使用数据库备份。', 413)
          validateServerBackup(backup)
          return json(res, backup)
        }
        if (method === 'POST' && ['/api/workspace/restore-preview', '/api/workspace/restore'].includes(path)) {
          const input = await body(req, BACKUP_LIMIT + 100_000)
          requireValue(Buffer.byteLength(JSON.stringify(input.backup ?? null)) <= BACKUP_LIMIT, '备份文件超过 20 MB。', 413)
          let backup
          try { backup = validateServerBackup(input.backup) } catch (error) { throw new HttpError(400, error instanceof Error ? error.message : '备份无效。') }
          const restoring = path === '/api/workspace/restore'
          const result = transaction(() => {
            const revisions: Record<string, number | null> = {}
            for (const item of backup.payload.projects) {
              const id = item.config.id
              const existing = db.prepare('SELECT config FROM projects WHERE id=?').get(id) as {config:string} | undefined
              if (existing) {
                allow(user, id, 'manage')
                requireValue((JSON.parse(existing.config) as ProjectConfig).releaseProjectId === item.config.releaseProjectId, '项目的冻结版本标识冲突。', 409)
                revisions[id] = (db.prepare('SELECT revision FROM themes WHERE projectId=?').get(id) as {revision:number}).revision
              } else { admin(user); revisions[id] = null }
              const all = (db.prepare('SELECT config FROM projects').all() as {config:string}[]).map(row => JSON.parse(row.config) as ProjectConfig)
              requireValue(!all.some(config => config.id !== id && config.releaseProjectId === item.config.releaseProjectId), '冻结版本标识已属于其他项目。', 409)
              if (restoring) {
                const expected = input.revisions as Record<string, unknown> | undefined
                requireValue(expected && Object.hasOwn(expected, id) && expected[id] === revisions[id], '项目在校验后已更新，请重新选择备份并核对。', 409)
              }
            }
            for (const snapshot of backup.payload.releases) {
              const owner = backup.payload.projects.find(item => item.config.releaseProjectId === snapshot.entry.projectId)!.config.id
              const existing = db.prepare('SELECT snapshot FROM releases WHERE projectId=? AND version=?').get(owner, snapshot.entry.version) as {snapshot:string} | undefined
              requireValue(!bundledIndex().some(entry => entry.projectId === snapshot.entry.projectId && entry.version === snapshot.entry.version), `版本与历史发布冲突：${snapshot.entry.version}`, 409)
              requireValue(!existing || canonicalJson(JSON.parse(existing.snapshot)) === canonicalJson(snapshot), `版本内容冲突：${snapshot.entry.version}。未修改数据。`, 409)
            }
            if (restoring) {
              for (const item of backup.payload.projects) {
                const id = item.config.id
                db.prepare('DELETE FROM deleted_projects WHERE id=?').run(id)
                db.prepare('INSERT INTO projects VALUES (?,?) ON CONFLICT(id) DO UPDATE SET config=excluded.config').run(id, JSON.stringify(item.config))
                if (revisions[id] === null) db.prepare('INSERT INTO memberships VALUES (?,?,?)').run(id, user.id, 'project-admin')
                db.prepare('INSERT INTO themes VALUES (?,?,1) ON CONFLICT(projectId) DO UPDATE SET value=excluded.value,revision=themes.revision+1').run(id, JSON.stringify(item.theme))
                audit(user.id, id, 'workspace.restore', backup.checksum)
              }
              for (const snapshot of backup.payload.releases) {
                const owner = backup.payload.projects.find(item => item.config.releaseProjectId === snapshot.entry.projectId)!.config.id
                db.prepare('INSERT OR IGNORE INTO releases VALUES (?,?,?)').run(owner, snapshot.entry.version, JSON.stringify(snapshot))
              }
              for (const item of backup.payload.acceptances ?? []) db.prepare('INSERT INTO delivery_acceptances VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(projectId,version,applicationName) DO UPDATE SET owner=excluded.owner,status=excluded.status,checks=excluded.checks,notes=excluded.notes,updatedAt=excluded.updatedAt,updatedBy=excluded.updatedBy').run(item.id, item.projectId, item.version, item.applicationName, item.owner, item.status, JSON.stringify(item.checks), item.notes, item.updatedAt, user.id)
            }
            return { backup, revisions }
          })
          return json(res, restoring ? { ok: true, projectId: backup.payload.projects[0].config.id } : result)
        }
        if (method === 'GET' && path === '/api/auth/me') return json(res, sessionData(user))
        if (method === 'POST' && path === '/api/auth/logout') { db.prepare('DELETE FROM sessions WHERE token=?').run(digest(cookie(req))); res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`); return json(res, { ok: true }) }
        if (method === 'GET' && path === '/api/admin/users') { admin(user); return json(res, db.prepare('SELECT id,email,name,profession,platformRole,status FROM users ORDER BY name').all()) }
        const userMatch = path.match(/^\/api\/admin\/users\/([^/]+)(\/reset)?$/)
        if (userMatch) {
          admin(user); const target = getUser(userMatch[1]); requireValue(target, '用户不存在。', 404)
          if (method === 'POST' && userMatch[2]) {
            requireValue(target.status === 'active', '请先启用此账号。')
            const token = secret(); const expiresAt = Date.now() + 3600_000
            db.prepare("UPDATE invitations SET used=2 WHERE email=? AND purpose='reset' AND used=0").run(target.email)
            db.prepare('INSERT INTO invitations VALUES (?,?,?,?,?,?,0,?)').run(randomUUID(), digest(token), target.email, null, null, expiresAt, 'reset')
            audit(user.id, null, 'account.reset-link', target.id); return json(res, { token, expiresAt })
          }
          if (method === 'PATCH') {
            const input = await body(req); requireValue(['active', 'disabled'].includes(String(input.status)), '无效账号状态。')
            requireValue(target.id !== user.id && target.platformRole !== 'admin', '不能在此停用当前账号或平台管理员。', 409)
            if (input.status === 'disabled') for (const member of memberships(target.id)) ensureLastAdmin(member.projectId, target.id)
            transaction(() => { db.prepare('UPDATE users SET status=? WHERE id=?').run(String(input.status), target.id); db.prepare('DELETE FROM sessions WHERE userId=?').run(target.id); audit(user.id, null, `account.${input.status}`, target.id) })
            return json(res, { ok: true })
          }
        }
        if (method === 'POST' && path === '/api/admin/projects') {
          admin(user); const input = await body(req); const name = text(input.name, 80); requireValue(name, '请输入项目名称。')
          let id = text(input.id, 50)
          if (!id) { do { id = `project-${randomUUID().slice(0, 8)}` } while (db.prepare('SELECT id FROM projects WHERE id=?').get(id)) }
          requireValue(/^[a-z][a-z0-9-]{1,49}$/.test(id), '项目标识需为 2–50 位小写字母、数字或连字符，以字母开头。')
          requireValue(!db.prepare('SELECT id FROM projects WHERE id=?').get(id), '项目标识已存在。', 409)
          const project: ProjectConfig = { ...seeds[0], id, releaseProjectId: `workspace-${id}`, name, shortName: name, description: text(input.description, 300), customAssetIds: [], specialRules: [], tokenOverrides: {}, componentIds:[...new Set([...seeds[0].componentIds,...AI_COMPONENT_IDS])], brandPrimary: '#315C52', brandSecondary: '#E7EFEC' }
          transaction(() => { db.prepare('DELETE FROM deleted_projects WHERE id=?').run(id); db.prepare('INSERT INTO projects VALUES (?,?)').run(id, JSON.stringify(project)); db.prepare('INSERT INTO themes VALUES (?,?,0)').run(id, JSON.stringify(defaultProjectTheme(project))); db.prepare('INSERT INTO memberships VALUES (?,?,?)').run(id, user.id, 'project-admin'); audit(user.id, id, 'project.create', id) })
          return json(res, project, 201)
        }
        const adminProjectMatch = path.match(/^\/api\/admin\/projects\/([^/]+)$/)
        if (adminProjectMatch) {
          admin(user)
          requireValue(method === 'DELETE', '请使用 DELETE 删除项目。', 405)
          const projectId = adminProjectMatch[1]
          const project = projectById(projectId)
          try { deliveries.removeProject(projectId) }
          catch (error) { throw new HttpError(409, error instanceof Error ? error.message : '项目暂时无法删除。') }
          transaction(() => {
            audit(user.id, projectId, 'project.delete', `${project.id}:${project.name}`)
            db.prepare('INSERT INTO deleted_projects VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET deletedAt=excluded.deletedAt,deletedBy=excluded.deletedBy').run(projectId, Date.now(), user.id)
            db.prepare('DELETE FROM delivery_acceptances WHERE projectId=?').run(projectId)
            db.prepare('DELETE FROM releases WHERE projectId=?').run(projectId)
            db.prepare('DELETE FROM themes WHERE projectId=?').run(projectId)
            db.prepare('DELETE FROM invitations WHERE projectId=?').run(projectId)
            db.prepare('DELETE FROM memberships WHERE projectId=?').run(projectId)
            db.prepare('DELETE FROM projects WHERE id=?').run(projectId)
          })
          return json(res, { ok: true, projectId })
        }
        const designMarkdownMatch = path.match(/^\/api\/projects\/([^/]+)\/draft\/design-md\/(preview|apply)$/)
        if (designMarkdownMatch) {
          const [, projectId, action] = designMarkdownMatch
          allow(user, projectId, 'edit')
          requireValue(method === 'POST', '请使用 POST 提交 AI 设计规范。', 405)
          const input = await body(req, DESIGN_MARKDOWN_IMPORT_LIMIT + 100_000)
          const markdown = typeof input.markdown === 'string' ? input.markdown : ''
          requireValue(markdown.length > 0, '请提供 DESIGN.md 内容。')
          requireValue(Buffer.byteLength(markdown, 'utf8') <= DESIGN_MARKDOWN_IMPORT_LIMIT, 'Markdown 超过 200 KB。', 413)
          let preview: ReturnType<typeof designMarkdownPreview>
          try { preview = designMarkdownPreview(projectId, markdown) }
          catch (error) { throw new HttpError(400, error instanceof Error ? error.message : '无法解析该设计规范。') }
          if (action === 'preview') return json(res, preview)

          requireValue(input.documentChecksum === preview.documentChecksum, '文档内容已变化，请重新解析后再应用。', 409)
          requireValue(Number.isInteger(input.baseRevision) && Number(input.baseRevision) === preview.baseRevision, '当前草稿已被更新，请重新解析后再应用。', 409)
          requireValue(preview.analysis.conflicts.length === 0, '修改稿仍有阻断冲突，未写入草稿。', 409)
          const accepted = Array.isArray(input.acceptedChangeIds) ? [...new Set(input.acceptedChangeIds.map(String))] : []
          requireValue(accepted.length > 0 && accepted.length <= preview.analysis.changes.length, '请至少选择一项可应用变更。')
          const available = new Set(preview.analysis.changes.map(change => change.id))
          requireValue(accepted.every(id => available.has(id)), '选择中包含无效或不可应用的变更。')
          const currentTheme = JSON.parse((db.prepare('SELECT value FROM themes WHERE projectId=?').get(projectId) as { value: string }).value) as ProjectThemeSettings
          const nextTheme = validateTheme(applyDesignMarkdownChanges(currentTheme, preview.analysis.changes, accepted))
          transaction(() => {
            const updated = db.prepare('UPDATE themes SET value=?,revision=revision+1 WHERE projectId=? AND revision=?').run(JSON.stringify(nextTheme), projectId, preview.baseRevision)
            requireValue(updated.changes === 1, '当前草稿已被其他成员更新，请重新解析。', 409)
            audit(user.id, projectId, 'design-md.apply', `${preview.analysis.identity.releaseVersion ?? 'unknown'}:${accepted.length}`)
          })
          return json(res, { theme: nextTheme, revision: preview.baseRevision + 1, appliedCount: accepted.length })
        }
        const projectMatch = path.match(/^\/api\/projects\/([^/]+)\/(members|invitations|theme|releases|audit|deliveries|acceptances)(?:\/([^/]+))?(?:\/([^/]+))?$/)
        if (projectMatch) {
          const [, projectId, resource, child, file] = projectMatch; allow(user, projectId)
          if (resource === 'members') {
            allow(user, projectId, 'manage')
            if (method === 'GET') return json(res, db.prepare('SELECT u.id,u.email,u.name,u.profession,u.platformRole,u.status,m.role FROM memberships m JOIN users u ON u.id=m.userId WHERE projectId=? ORDER BY u.name').all(projectId))
            const input = method === 'PATCH' ? await body(req) : {}
            if ((method === 'PATCH' || method === 'DELETE') && child) {
              const member = db.prepare('SELECT role FROM memberships WHERE projectId=? AND userId=?').get(projectId, child)
              requireValue(member, '成员不存在。', 404)
              if (method === 'PATCH') requireValue(roles.includes(String(input.role)), '无效项目角色。')
              ensureLastAdmin(projectId, child, method === 'PATCH' ? String(input.role) : undefined)
              transaction(() => { if (method === 'DELETE') db.prepare('DELETE FROM memberships WHERE projectId=? AND userId=?').run(projectId, child); else db.prepare('UPDATE memberships SET role=? WHERE projectId=? AND userId=?').run(String(input.role), projectId, child); audit(user.id, projectId, method === 'DELETE' ? 'member.remove' : `member.${input.role}`, child) })
              return json(res, { ok: true })
            }
          }
          if (resource === 'invitations') {
            allow(user, projectId, 'manage')
            if (method === 'GET') return json(res, (db.prepare("SELECT id,email,role,expiresAt,used FROM invitations WHERE projectId=? AND purpose='invite' ORDER BY expiresAt DESC LIMIT 100").all(projectId) as { used: number; expiresAt: number }[]).map(({ used, ...row }) => ({ ...row, status: used === 1 ? 'accepted' : used === 2 ? 'revoked' : row.expiresAt < Date.now() ? 'expired' : 'pending' })))
            if (method === 'DELETE' && child) { db.prepare('UPDATE invitations SET used=2 WHERE id=? AND projectId=? AND used=0').run(child, projectId); audit(user.id, projectId, 'invitation.revoke', child); return json(res, { ok: true }) }
            if (method === 'POST') {
              const input = await body(req); const email = emailOf(input.email); requireValue(roles.includes(String(input.role)), '无效项目角色。')
              requireValue(!db.prepare('SELECT m.userId FROM memberships m JOIN users u ON u.id=m.userId WHERE projectId=? AND u.email=?').get(projectId, email), '该用户已经是项目成员，请在成员列表中调整权限。', 409)
              const token = secret(); const id = randomUUID(); const expiresAt = Date.now() + 7 * 86400_000
              transaction(() => { db.prepare("UPDATE invitations SET used=2 WHERE projectId=? AND email=? AND purpose='invite' AND used=0").run(projectId, email); db.prepare('INSERT INTO invitations VALUES (?,?,?,?,?,?,0,?)').run(id, digest(token), email, projectId, String(input.role), expiresAt, 'invite'); audit(user.id, projectId, 'invitation.create', email) })
              return json(res, { id, token, expiresAt }, 201)
            }
          }
          if (resource === 'audit') { allow(user, projectId, 'manage'); if (method === 'GET') return json(res, db.prepare('SELECT a.action,a.subject,a.createdAt,u.name AS actor FROM audit a LEFT JOIN users u ON u.id=a.userId WHERE projectId=? ORDER BY a.id DESC LIMIT 50').all(projectId)) }
          if (resource === 'theme') {
            if (method === 'GET') { const row = db.prepare('SELECT value,revision FROM themes WHERE projectId=?').get(projectId) as { value: string; revision: number }; return json(res, { theme: JSON.parse(row.value), revision: row.revision }) }
            if (method === 'PUT') {
              allow(user, projectId, 'edit'); const input = await body(req); const theme = validateTheme(input.theme)
              requireValue(Number.isInteger(input.revision) && Number(input.revision) >= 0, '主题修订号无效，请重新加载。')
              const updated = db.prepare('UPDATE themes SET value=?,revision=revision+1 WHERE projectId=? AND revision=?').run(JSON.stringify(theme), projectId, Number(input.revision))
              requireValue(updated.changes === 1, '主题已被其他成员更新，请先恢复服务器版本，再应用你的修改。', 409)
              audit(user.id, projectId, 'theme.save', projectId); return json(res, { theme, revision: Number(input.revision) + 1 })
            }
          }
          if (resource === 'acceptances') {
            const acceptanceStatuses = ['planned', 'testing', 'verified', 'rollback-required']
            const acceptanceChecks = ['package-installed', 'core-flow', 'error-recovery', 'responsive-keyboard']
            if (method === 'GET' && !child) {
              const version = text(url.searchParams.get('version'), 30)
              requireValue(/^\d+\.\d+\.\d+$/.test(version), '请选择已发布的项目版本。')
              return json(res, (db.prepare('SELECT * FROM delivery_acceptances WHERE projectId=? AND version=? ORDER BY updatedAt DESC').all(projectId, version) as Array<Record<string, unknown>>).map(row => ({ ...row, checks: JSON.parse(String(row.checks)) })))
            }
            if (method === 'POST' && !child) {
              allow(user, projectId, 'edit'); const input = await body(req)
              const version = text(input.version, 30), applicationName = text(input.applicationName, 80), owner = text(input.owner, 80), notes = text(input.notes, 500), status = text(input.status, 30)
              requireValue(/^\d+\.\d+\.\d+$/.test(version), '版本号无效。')
              requireValue(db.prepare('SELECT version FROM releases WHERE projectId=? AND version=?').get(projectId, version) || bundledIndex().some(entry => entry.projectId === projectById(projectId).releaseProjectId && entry.version === version), '版本不存在。', 404)
              requireValue(applicationName, '请输入消费应用名称。')
              requireValue(acceptanceStatuses.includes(status), '验收状态无效。')
              const checks = Array.isArray(input.checks) ? [...new Set(input.checks.map(String).filter(value => acceptanceChecks.includes(value)))] : []
              requireValue(status !== 'verified' || checks.length === acceptanceChecks.length, '标记已验证前需完成全部验收项。')
              const previous = db.prepare('SELECT id FROM delivery_acceptances WHERE projectId=? AND version=? AND applicationName=?').get(projectId, version, applicationName) as {id:string} | undefined
              const id = previous?.id ?? randomUUID(), updatedAt = Date.now()
              db.prepare('INSERT INTO delivery_acceptances VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(projectId,version,applicationName) DO UPDATE SET owner=excluded.owner,status=excluded.status,checks=excluded.checks,notes=excluded.notes,updatedAt=excluded.updatedAt,updatedBy=excluded.updatedBy').run(id, projectId, version, applicationName, owner, status, JSON.stringify(checks), notes, updatedAt, user.id)
              audit(user.id, projectId, 'delivery.acceptance', `${version}:${applicationName}`)
              return json(res, { id, projectId, version, applicationName, owner, status, checks, notes, updatedAt, updatedBy: user.id }, previous ? 200 : 201)
            }
            if (method === 'DELETE' && child) {
              allow(user, projectId, 'edit')
              const deleted = db.prepare('DELETE FROM delivery_acceptances WHERE id=? AND projectId=?').run(child, projectId)
              requireValue(deleted.changes === 1, '验收记录不存在。', 404); audit(user.id, projectId, 'delivery.acceptance.delete', child); return json(res, { ok: true })
            }
          }
          if (resource === 'deliveries' && child) {
            if (child === 'preflight' && method === 'GET' && !file) {
              const project = projectById(projectId), row = db.prepare('SELECT value FROM themes WHERE projectId=?').get(projectId) as { value: string }
              validateSnapshot(createReleaseSnapshot({ project, theme: JSON.parse(row.value), version: '0.0.0-preflight', status: 'candidate' }))
              const result = deliveries.preflight(runtimeBuild.buildId)
              return json(res, { ...result, snapshotReady: true, message: result.status === 'ready' ? '快照数据完整，匹配的组件运行时归档已就绪，发布后可生成交付包。' : `快照数据完整；${result.message}` })
            }
            requireValue(/^\d+\.\d+\.\d+$/.test(child), '请选择已发布的项目版本。')
            const row = db.prepare('SELECT snapshot FROM releases WHERE projectId=? AND version=?').get(projectId, child) as {snapshot:string} | undefined
            if (!row) {
              requireValue(bundledIndex().some(entry => entry.projectId === projectById(projectId).releaseProjectId && entry.version === child), '版本不存在。', 404)
              requireValue(method === 'GET' && !file, '历史版本缺少匹配的可执行代码归档，不能生成前端包。', 409)
              return json(res, {status:'unavailable',message:'此历史版本未归档可匹配的组件代码。请使用完成代码归档的新发布版本。'})
            }
            const snapshot = JSON.parse(row.snapshot) as LocalReleaseSnapshot
            requireValue(deliveryIdentity(snapshot).projectId === projectId && snapshot.entry.projectId === projectById(projectId).releaseProjectId, '项目与交付快照关联不一致。', 409)
            if (method === 'GET' && !file) return json(res, deliveries.status(snapshot))
            if (method === 'POST' && !file) {
              allow(user, projectId, 'manage')
              const result = deliveries.start(snapshot)
              requireValue(result.status !== 'unavailable', result.message ?? '此版本不可生成。', 409)
              audit(user.id, projectId, 'delivery.generate', child)
              return json(res, result, result.status === 'ready' ? 200 : 202)
            }
            if (method === 'GET' && file === 'package') {
              requireValue(deliveries.status(snapshot).status === 'ready', '交付包尚未就绪或校验失败。', 409)
              const {artifact,data} = deliveries.download(snapshot)
              res.writeHead(200, {'Content-Type':'application/gzip','Content-Disposition':`attachment; filename="${artifact.archiveName}"`,'Content-Length':data.length,'Cache-Control':'private, no-store'})
              return res.end(data)
            }
          }
          if (resource === 'releases') {
            const project = projectById(projectId)
            if (method === 'GET' && !child) {
              const rows = db.prepare('SELECT snapshot FROM releases WHERE projectId=? ORDER BY rowid DESC').all(projectId) as { snapshot: string }[]
              return json(res, [...rows.map(row => ({ ...JSON.parse(row.snapshot).entry, label: `${project.shortName} · ${JSON.parse(row.snapshot).entry.version}（工作区正式版本）`, source: 'server', workspaceProjectId: projectId })), ...bundledIndex().filter(entry => entry.projectId === project.releaseProjectId).map(entry => ({ ...entry, source: 'bundled', workspaceProjectId: projectId }))])
            }
            if (method === 'GET' && child && file) {
              const row = db.prepare('SELECT snapshot FROM releases WHERE projectId=? AND version=?').get(projectId, child) as { snapshot: string } | undefined
              requireValue(row, '版本不存在。', 404); const value = (JSON.parse(row.snapshot) as LocalReleaseSnapshot).assets[file as ReleaseAssetName]; requireValue(value !== undefined, '版本资产不存在。', 404); return json(res, value)
            }
            if (method === 'POST' && !child) {
              allow(user, projectId, 'manage'); const input = await body(req)
              const version = text(input.version, 30); requireValue(/^\d+\.\d+\.\d+$/.test(version), '版本号需使用 x.y.z 格式。')
              requireValue(!db.prepare('SELECT version FROM releases WHERE projectId=? AND version=?').get(projectId, version) && !bundledIndex().some(entry => entry.projectId === project.releaseProjectId && entry.version === version), '该版本已存在。', 409)
              const deliveryPreflight = deliveries.preflight(runtimeBuild.buildId)
              if (input.requireDeliverable === true) requireValue(deliveryPreflight.status === 'ready', deliveryPreflight.message, 409)
              const row = db.prepare('SELECT value FROM themes WHERE projectId=?').get(projectId) as { value: string }
              const snapshot = createReleaseSnapshot({ project, theme: JSON.parse(row.value), version, note: text(input.note, 500), status: 'published' })
              const manifest = snapshot.assets['manifest.json'] as { sourceSummary: Record<string, unknown>; missingCapabilities: string[] }
              manifest.sourceSummary = { ...manifest.sourceSummary, generatedFrom: 'workspace-server', localOnly: false }
              snapshot.entry.deliveryKind = deliveryPreflight.status === 'ready' ? 'executable-ready' : 'specification'
              manifest.missingCapabilities = deliveryPreflight.status === 'ready' ? [] : ['Snapshot data is frozen; executable code requires the matching delivery package.']
              validateSnapshot(snapshot)
              transaction(() => { db.prepare('INSERT INTO releases VALUES (?,?,?)').run(projectId, version, JSON.stringify(snapshot)); audit(user.id, projectId, 'release.publish', version) })
              return json(res, { ...snapshot.entry, label: `${project.shortName} · ${version}（工作区正式版本）`, source: 'server', workspaceProjectId: projectId }, 201)
            }
          }
        }
        throw new HttpError(404, '接口不存在。')
      }
      if (path.startsWith('/release-assets/')) {
        const user = authenticate(req)
        const entries = bundledIndex().filter(entry => { const project = (db.prepare('SELECT config FROM projects').all() as { config: string }[]).map(row => JSON.parse(row.config) as ProjectConfig).find(project => project.releaseProjectId === entry.projectId); return project && roleFor(user, project.id) })
        if (path === '/release-assets/index.json') return json(res, entries)
        const rest = path.slice('/release-assets/'.length); requireValue(entries.some(entry => rest.startsWith(`${entry.dir}/`)), '无权访问该项目版本。', 403)
        return serveFile(res, resolve(root, 'public'), path)
      }
      if (options.serveStatic) return serveFile(res, resolve(root, 'dist'), path, true)
      throw new HttpError(404, '请使用前端网站地址访问。')
    } catch (error) {
      if (error instanceof HttpError) json(res, { error: error.message }, error.status)
      else { console.error('Workspace request failed:', error instanceof Error ? error.message : error); json(res, { error: '服务处理失败，数据未确认保存，请重试。' }, 500) }
    }
  })
  return { server, db, setupFile, deliveries, close: () => new Promise<void>(done => { server.close(() => { db.close(); done() }); server.closeAllConnections() }) }
}
function validateTheme(value: unknown): ProjectThemeSettings {
  try { checkTheme(value); return value } catch (error) { throw new HttpError(400, error instanceof Error ? error.message : '主题格式无效。') }
}
function serveFile(res: ServerResponse, base: string, requestPath: string, spa = false) {
  let file = resolve(base, `.${requestPath}`)
  requireValue(file.startsWith(`${base}${sep}`) || file === base, '无效文件路径。', 403)
  if (spa && (!extname(file) || requestPath === '/')) file = resolve(base, 'index.html')
  requireValue(existsSync(file) && file !== base, '文件不存在。', 404)
  const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.md': 'text/plain' }
  res.writeHead(200, { 'Content-Type': `${types[extname(file)] ?? 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': extname(file) === '.html' ? 'no-store' : 'private, max-age=0' })
  res.end(readFileSync(file))
}
