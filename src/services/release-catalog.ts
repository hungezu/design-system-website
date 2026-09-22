import { api } from './workspace-api'
import systemManifest from '../../system.manifest.json'
import { createReleaseSnapshot } from './release-snapshot'
import type { ProjectConfig } from '../types/design-system'
import { type ProjectThemeSettings } from './project-theme'

export type ReleaseMigrationStatus = 'frozen' | 'legacy-unfrozen' | 'migrated'
export const DRAFT_VERSION = systemManifest.releasePolicy.draftVersionId
export const isDraftVersion = (version?: string | null) => version === DRAFT_VERSION

export interface ReleaseCatalogEntry {
  dir: string
  label: string
  projectId: string
  version: string
  migrationStatus: ReleaseMigrationStatus
  checksum?: string
  releaseId?: string
  legacy?: boolean
  source?: 'bundled' | 'local' | 'server'
  workspaceProjectId?: string
  baseDir?: string
  publishedAt?: string
  deliveryKind?: 'specification' | 'executable-ready'
}

export type ReleaseAssetName =
  | 'manifest.json'
  | 'tokens.json'
  | 'tokens.css'
  | 'recipes.json'
  | 'components.json'
  | 'icons.json'
  | 'patterns.json'
  | 'layout.json'
  | 'region-appearance.json'
  | 'validation-report.json'
  | 'ai-rules.md'

export interface LocalReleaseSnapshot {
  entry: ReleaseCatalogEntry
  assets: Partial<Record<ReleaseAssetName, unknown>>
}

export const LOCAL_RELEASE_STORAGE_KEY = 'design-intelligence-local-releases-v1'

type ReleaseStorage = Pick<Storage, 'getItem' | 'setItem'>

function browserStorage(): ReleaseStorage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}

export function loadLocalReleaseSnapshots(storage: Pick<Storage, 'getItem'> | null = browserStorage()): LocalReleaseSnapshot[] {
  if (!storage) return []
  let value:unknown
  try{value=JSON.parse(storage.getItem(LOCAL_RELEASE_STORAGE_KEY)??'[]')}catch{throw new Error('已有本地版本数据损坏，已停止读取，未覆盖原始记录。')}
  if(!Array.isArray(value)||value.some(item=>!item||typeof item!=='object'||item.entry?.source!=='local'||typeof item.entry?.projectId!=='string'||typeof item.entry?.version!=='string'||!item.assets||typeof item.assets!=='object'))throw new Error('已有本地版本结构无效，未覆盖原始记录。')
  return value as LocalReleaseSnapshot[]
}

export function nextPatchVersion(entries: ReleaseCatalogEntry[]) {
  const latest = entries
    .map((entry) => entry.version.match(/^(\d+)\.(\d+)\.(\d+)$/)?.slice(1).map(Number))
    .filter((parts): parts is number[] => Boolean(parts))
    .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])[0]
  return latest ? `${latest[0]}.${latest[1]}.${latest[2] + 1}` : '1.0.0'
}

export function publishDraftRelease(
  input: {
    project: ProjectConfig
    theme: ProjectThemeSettings
    version: string
    note: string
    existing: ReleaseCatalogEntry[]
  },
  storage: ReleaseStorage | null = browserStorage(),
) {
  if (!storage) throw new Error('当前环境不支持本地版本保存。')
  const version = input.version.trim()
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('版本号需使用 x.y.z 格式。')
  if (input.existing.some((entry) => entry.projectId === input.project.releaseProjectId && entry.version === version)) throw new Error(`v${version} 已存在，请使用新版本号。`)

  const snapshot = createReleaseSnapshot({...input,version,status:'published'})
  const entry = snapshot.entry
  const snapshots = loadLocalReleaseSnapshots(storage)
  if(snapshots.some(item=>item.entry.projectId===entry.projectId&&item.entry.version===version))throw new Error(`v${version} 已存在，请使用新版本号。`)
  snapshots.unshift(snapshot)
  storage.setItem(LOCAL_RELEASE_STORAGE_KEY, JSON.stringify(snapshots))
  return entry
}

const assetRoot = `${import.meta.env?.BASE_URL ?? '/'}release-assets`

export async function loadReleaseCatalog(signal?: AbortSignal): Promise<ReleaseCatalogEntry[]> {
  const response = await fetch(`${assetRoot}/index.json`, { signal })
  if (!response.ok) throw new Error(`发布索引读取失败：HTTP ${response.status}`)
  const entries = await response.json() as ReleaseCatalogEntry[]
  const bundled = entries.filter((entry) => entry && entry.projectId && entry.version && entry.dir).map((entry) => ({ ...entry, source: 'bundled' as const }))
  const local = loadLocalReleaseSnapshots().map((item) => item.entry)
  return [...local, ...bundled]
}

export async function loadReleaseAsset<T = unknown>(
  release: ReleaseCatalogEntry,
  name: ReleaseAssetName,
  signal?: AbortSignal,
  storage: Pick<Storage, 'getItem'> | null = browserStorage(),
): Promise<T> {
  if (release.source === 'server') return api<T>(`/projects/${encodeURIComponent(release.workspaceProjectId ?? '')}/releases/${encodeURIComponent(release.version)}/${name}`, { signal })
  if (release.source === 'local') {
    const snapshot = loadLocalReleaseSnapshots(storage).find((item) => item.entry.releaseId === release.releaseId && item.entry.projectId === release.projectId && item.entry.version === release.version)
    const value = snapshot?.assets[name]
    if (value !== undefined) return value as T
    if (!release.baseDir) throw new Error(`本地版本缺少资产：${name}`)
    return loadReleaseAsset<T>({ ...release, source: 'bundled', dir: release.baseDir, baseDir: undefined }, name, signal, storage)
  }
  const response = await fetch(`${assetRoot}/${release.dir}/${name}`, { signal })
  if (!response.ok) throw new Error(`发布资产读取失败：${release.dir}/${name}（HTTP ${response.status}）`)
  if (name.endsWith('.json')) return await response.json() as T
  return await response.text() as T
}

export function releasesForProject(entries: ReleaseCatalogEntry[], releaseProjectId: string) {
  return entries.filter((entry) => entry.projectId === releaseProjectId)
}

/** Resolve the selected version inside one project; never falls back across projects. */
export function selectRelease(entries: ReleaseCatalogEntry[], releaseProjectId: string, preferredVersion?: string) {
  const scoped = releasesForProject(entries, releaseProjectId)
  return scoped.find((entry) => entry.version === preferredVersion) ?? scoped[0] ?? null
}

export function compareReleaseEntries(previous: ReleaseCatalogEntry, next: ReleaseCatalogEntry) {
  return {
    projectChanged: previous.projectId !== next.projectId,
    versionChanged: previous.version !== next.version,
    checksumChanged: previous.checksum !== next.checksum,
    migrationChanged: previous.migrationStatus !== next.migrationStatus,
  }
}
