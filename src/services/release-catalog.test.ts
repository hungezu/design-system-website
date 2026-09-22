import { describe, expect, it } from 'vitest'
import { guokexinProject } from '../data/projects'
import { baselineThemeSettings } from './project-theme'
import { compareReleaseEntries, DRAFT_VERSION, isDraftVersion, loadLocalReleaseSnapshots, loadReleaseAsset, nextPatchVersion, publishDraftRelease, releasesForProject, selectRelease, type ReleaseCatalogEntry } from './release-catalog'

const entry = (projectId: string, version: string, migrationStatus: ReleaseCatalogEntry['migrationStatus'] = 'frozen'): ReleaseCatalogEntry => ({ dir: `${projectId}/${version}`, label: version, projectId, version, migrationStatus })

describe('主工程发布上下文', () => {
  it('当前草稿使用独立于语义版本号的稳定标识', () => {
    expect(DRAFT_VERSION).toBe('draft')
    expect(isDraftVersion('draft')).toBe(true)
    expect(isDraftVersion('1.5.5')).toBe(false)
  })
  it('按项目隔离版本并显式计算版本变化', () => {
    const a = entry('project-a', '1.0.0')
    const b = entry('project-a', '1.1.0')
    expect(releasesForProject([a, b, entry('project-b', '1.0.0')], 'project-a')).toHaveLength(2)
    expect(compareReleaseEntries(a, b)).toMatchObject({ projectChanged: false, versionChanged: true, checksumChanged: false })
  })

  it('版本选择只在当前项目内解析，并在首选版本失效时回退到目录首项', () => {
    const a = entry('project-a', '1.1.0')
    const b = entry('project-a', '1.0.0')
    const other = entry('project-b', '9.0.0')
    expect(selectRelease([a, b, other], 'project-a', '1.0.0')).toEqual(b)
    expect(selectRelease([a, b, other], 'project-a', '9.0.0')).toEqual(a)
    expect(selectRelease([a, b, other], 'missing')).toBeNull()
  })

  it('从当前草稿生成按项目隔离的本地正式版本', async () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    }
    const existing = [entry(guokexinProject.releaseProjectId, '1.5.5')]
    const published = publishDraftRelease({ project: guokexinProject, theme: baselineThemeSettings, version: '1.5.6', note: '主题更新', existing }, storage)
    const snapshots = loadLocalReleaseSnapshots(storage)

    expect(published).toMatchObject({ version: '1.5.6', source: 'local', migrationStatus: 'frozen' })
    expect(snapshots).toHaveLength(1)
    expect(snapshots[0].entry.projectId).toBe(guokexinProject.releaseProjectId)
    expect(String(snapshots[0].assets['tokens.css'])).toContain('--brand-primary: #315C52')
    expect(await loadReleaseAsset<string>(published, 'tokens.css', undefined, storage)).toContain('--bds-table-row-bg: #FFFFFF')
    expect(await loadReleaseAsset<{ releaseVersion: string }>(published, 'manifest.json', undefined, storage)).toMatchObject({ releaseVersion: '1.5.6' })
    expect(nextPatchVersion([published, ...existing])).toBe('1.5.7')
  })

  it('拒绝重复或非语义化版本号', () => {
    const storage = { getItem: () => null, setItem: () => undefined }
    const existing = [entry(guokexinProject.releaseProjectId, '1.5.5')]
    expect(() => publishDraftRelease({ project: guokexinProject, theme: baselineThemeSettings, version: '1.5.5', note: '', existing }, storage)).toThrow('已存在')
    expect(() => publishDraftRelease({ project: guokexinProject, theme: baselineThemeSettings, version: 'latest', note: '', existing }, storage)).toThrow('x.y.z')
  })
})
