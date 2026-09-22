import type { ProjectConfig } from '../types/design-system'
import type { ProjectThemeSettings } from './project-theme'
import type { LocalReleaseSnapshot } from './release-catalog'
import { contentChecksum, SNAPSHOT_SCHEMA } from './release-snapshot'
import { validateWorkspaceBackup } from './workspace-backup'
import type { DeliveryAcceptance, DeliveryAcceptanceStatus } from './project-delivery'

export const BACKUP_LIMIT = 20_000_000
export interface ServerBackup {
  schema: 'design-workspace-server-backup/1'
  createdAt: string
  checksum: string
  payload: { projects: Array<{ config: ProjectConfig; theme: ProjectThemeSettings }>; releases: LocalReleaseSnapshot[]; acceptances?: Array<Omit<DeliveryAcceptance, 'updatedBy'>> }
}
export interface RestorePreview { backup: ServerBackup; revisions: Record<string, number | null> }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
function check(ok: unknown, message: string): asserts ok { if (!ok) throw new Error(message) }
export function validateProjectConfig(value: unknown): asserts value is ProjectConfig {
  check(record(value), '项目配置无效。')
  for (const key of ['id','releaseProjectId','name','shortName','description','fontFamily','iconRegistryVersion']) check(typeof value[key] === 'string' && (value[key] as string).length <= 2000, `项目字段无效：${key}`)
  check(/^[a-z][a-z0-9-]{1,49}$/.test(String(value.id)) && /^[\w-]{1,100}$/.test(String(value.releaseProjectId)) && String(value.name).trim(), '项目标识无效。')
  for (const key of ['brandPrimary','brandSecondary']) check(/^#[0-9a-f]{6}$/i.test(String(value[key])), '项目颜色无效。')
  check(['web','mobile','embedded','spatial'].includes(String(value.platform)) && ['light','dark','adaptive'].includes(String(value.themeMode)) && ['compact','comfortable','spacious'].includes(String(value.density)) && ['active','demo'].includes(String(value.status)), '项目选项无效。')
  check(typeof value.radiusScale === 'number' && Number.isFinite(value.radiusScale) && value.radiusScale >= 0 && value.radiusScale <= 10, '项目圆角无效。')
  for (const key of ['componentIds','customAssetIds','specialRules']) check(Array.isArray(value[key]) && value[key].length <= 1000 && value[key].every(item => typeof item === 'string' && item.length <= 2000), `项目列表无效：${key}`)
  check(record(value.tokenOverrides) && Object.keys(value.tokenOverrides).length <= 1000, '项目变量无效。')
  for (const [key, item] of Object.entries(value.tokenOverrides)) check(/^[\w-]+$/.test(key) && typeof item === 'string' && item.length <= 500 && !/[;{}<>]|url\s*\(|@import/i.test(item), '项目变量值无效。')
  check(!/[;{}<>]|url\s*\(|@import/i.test(String(value.fontFamily)), '项目字体无效。')
}
export function makeServerBackup(payload: ServerBackup['payload']): ServerBackup {
  return { schema: 'design-workspace-server-backup/1', createdAt: new Date().toISOString(), checksum: contentChecksum(payload), payload }
}
export function validateServerBackup(input: unknown): ServerBackup {
  if (typeof input === 'string') { check(new TextEncoder().encode(input).length <= BACKUP_LIMIT, '备份文件超过 20 MB。'); input = JSON.parse(input) }
  check(record(input) && input.schema === 'design-workspace-server-backup/1' && typeof input.createdAt === 'string' && Number.isFinite(Date.parse(input.createdAt)) && record(input.payload), '请选择服务端工作区备份；旧浏览器备份需要单独迁移。')
  const backup = input as unknown as ServerBackup
  check(Array.isArray(backup.payload.projects) && backup.payload.projects.length > 0 && backup.payload.projects.length <= 200, '备份项目列表无效。')
  check(backup.checksum === contentChecksum(backup.payload), '备份校验失败，内容可能已损坏。')
  for (const item of backup.payload.projects) { check(record(item), '备份项目无效。'); validateProjectConfig(item.config) }
  const registry = backup.payload.projects.map(item => item.config)
  check(new Set(registry.map(item => item.releaseProjectId)).size === registry.length, '冻结项目标识重复。')
  check(Array.isArray(backup.payload.releases) && backup.payload.releases.every(snapshot => record(snapshot) && record(snapshot.assets) && record(snapshot.assets['manifest.json']) && snapshot.assets['manifest.json'].schemaVersion === SNAPSHOT_SCHEMA), '服务端恢复需要完整冻结快照，不能导入旧版兼容引用。')
  const statuses: DeliveryAcceptanceStatus[] = ['planned', 'testing', 'verified', 'rollback-required']
  check(backup.payload.acceptances === undefined || (Array.isArray(backup.payload.acceptances) && backup.payload.acceptances.length <= 5000), '验收记录无效。')
  for (const item of backup.payload.acceptances ?? []) check(record(item) && registry.some(project => project.id === item.projectId) && typeof item.id === 'string' && typeof item.version === 'string' && typeof item.applicationName === 'string' && typeof item.owner === 'string' && statuses.includes(item.status as DeliveryAcceptanceStatus) && Array.isArray(item.checks) && typeof item.notes === 'string' && typeof item.updatedAt === 'number', '验收记录无效。')
  const payload = { projects: backup.payload.projects.map(item => ({ id: item.config.id, theme: item.theme })), releases: backup.payload.releases, selectedVersions: {}, activeProjectId: registry[0].id, compatibilityReferences: [] }
  validateWorkspaceBackup({ schema: 'design-workspace-backup/1', createdAt: backup.createdAt, checksum: contentChecksum(payload), payload }, registry.map(item => item.id), registry)
  return backup
}
