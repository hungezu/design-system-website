import fs from 'node:fs'
import path from 'node:path'
import { GUOKEXIN_BRAND_TOKENS } from '../src/instances/guokexin/theme'
import { guokexinProject } from '../src/data/projects/guokexin'
import systemManifest from '../system.manifest.json'

type IndexEntry = { dir: string; projectId: string; version: string; migrationStatus: 'frozen' | 'legacy-unfrozen' | 'migrated' }
type ArtifactRecord = { path: string; checksum: string }
type Manifest = {
  schemaVersion?: string
  projectId?: string
  releaseVersion?: string
  checksum?: string
  artifactFiles?: ArtifactRecord[]
  iconPack?: { count?: number } | null
}

const root = path.resolve('public/release-assets')
const index = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8')) as IndexEntry[]
const latestByProject = new Map<string, IndexEntry>()
for (const entry of index) if (!latestByProject.has(entry.projectId)) latestByProject.set(entry.projectId, entry)
const legacyCutoffs: Record<string, string> = {
  [guokexinProject.releaseProjectId]: systemManifest.releasePolicy.guokexinLegacyCutoff,
  'proj-mtwbe3v9-zf5v8f': '1.4.5',
}
const versionParts = (version: string) => version.split('.').map((part) => Number.parseInt(part, 10) || 0)
const isAtOrBefore = (version: string, cutoff: string) => {
  const left = versionParts(version)
  const right = versionParts(cutoff)
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] ?? 0) !== (right[index] ?? 0)) return (left[index] ?? 0) < (right[index] ?? 0)
  }
  return true
}
const isKnownLegacySnapshot = (entry: IndexEntry) => Boolean(legacyCutoffs[entry.projectId] && isAtOrBefore(entry.version, legacyCutoffs[entry.projectId]))

const v1 = ['manifest.json', 'tokens.json', 'tokens.css', 'recipes.json', 'components.json', 'region-appearance.json', 'layout.json', 'ai-rules.md', 'validation-report.json']
const requiredFor = (schemaVersion?: string) => schemaVersion === 'bds-release/3'
  ? [...v1.slice(0, 5), 'icons.json', 'patterns.json', ...v1.slice(5)]
  : schemaVersion === 'bds-release/2'
    ? [...v1.slice(0, 5), 'icons.json', ...v1.slice(5)]
    : v1

const seeds = [0x811c9dc5, 0x01000193, 0x7fffffff, 0x9e3779b9]
function hashContent(input: string) {
  const hashes = [...seeds]
  for (let index = 0; index < input.length; index += 1) {
    const character = input.charCodeAt(index)
    for (let seed = 0; seed < hashes.length; seed += 1) {
      hashes[seed] ^= character
      hashes[seed] = Math.imul(hashes[seed], 0x01000193) >>> 0
      hashes[seed] ^= character >>> 8
      hashes[seed] = Math.imul(hashes[seed], 0x01000193) >>> 0
    }
  }
  return hashes.map((value) => value.toString(16).padStart(8, '0')).join('')
}

const packageChecksum = (files: ArtifactRecord[]) => hashContent(files
  .filter((file) => file.path !== 'manifest.json')
  .slice()
  .sort((left, right) => left.path.localeCompare(right.path))
  .map((file) => `${file.path}\n${file.checksum}`)
  .join('\n'))

let failures = 0
let warnings = 0

for (const entry of index) {
  const dir = path.join(root, entry.dir)
  const manifestPath = path.join(dir, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    failures += 1
    console.error(`✗ ${entry.dir}: 缺少 manifest.json`)
    continue
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as Manifest
  const required = requiredFor(manifest.schemaVersion)
  const missing = required.filter((name) => !fs.existsSync(path.join(dir, name)))
  const errors: string[] = []
  if (missing.length) errors.push(`缺少 ${missing.join(', ')}`)
  if (manifest.projectId !== entry.projectId || manifest.releaseVersion !== entry.version) errors.push('manifest 与索引不一致')

  const artifactFiles = manifest.artifactFiles ?? []
  for (const artifact of artifactFiles) {
    if (artifact.path === 'manifest.json') continue
    const artifactPath = path.join(dir, artifact.path)
    if (!fs.existsSync(artifactPath)) continue
    const actual = hashContent(fs.readFileSync(artifactPath, 'utf8'))
    if (actual !== artifact.checksum) errors.push(`${artifact.path} checksum 不一致`)
  }
  if (manifest.checksum && artifactFiles.length && packageChecksum(artifactFiles) !== manifest.checksum) errors.push('整包 checksum 不一致')

  const iconsPath = path.join(dir, 'icons.json')
  if (fs.existsSync(iconsPath) && manifest.iconPack) {
    const icons = JSON.parse(fs.readFileSync(iconsPath, 'utf8')) as { publishedIcons?: Array<{ id?: string }>; projectIconPack?: { iconIds?: string[] } }
    const publishedCount = icons.publishedIcons?.filter((icon) => icon.id).length ?? 0
    const explicitCount = icons.projectIconPack?.iconIds?.length ?? 0
    if (manifest.iconPack.count !== publishedCount) errors.push(`Icon Pack manifest=${manifest.iconPack.count ?? 0}，publishedIcons=${publishedCount}`)
    if (explicitCount && explicitCount !== publishedCount) {
      const message = `Icon Pack 口径差异：explicit=${explicitCount}，published=${publishedCount}`
      if (entry.migrationStatus === 'frozen' && isKnownLegacySnapshot(entry)) {
        if (latestByProject.get(entry.projectId) === entry) {
          warnings += 1
          console.warn(`! ${entry.dir}: ${message}（历史冻结版保留）`)
        }
      } else errors.push(message)
    }
    if (!isKnownLegacySnapshot(entry)) {
      const explicitIds = new Set(icons.projectIconPack?.iconIds ?? [])
      const missingSemantics = ['close', 'clear-input', 'remove-item'].filter((iconId) => !explicitIds.has(iconId))
      if (missingSemantics.length) errors.push(`Icon Pack 缺少必需语义：${missingSemantics.join(', ')}`)
    }
  }

  if (latestByProject.get(entry.projectId) === entry && entry.projectId === guokexinProject.releaseProjectId) {
    const tokensCss = fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8')
    const releasedBrand = tokensCss.match(/--bds-brand:\s*([^;]+);/)?.[1]?.trim()
    if (releasedBrand?.toLowerCase() !== GUOKEXIN_BRAND_TOKENS.primary.toLowerCase()) {
      const message = `品牌主色 ${releasedBrand ?? '未定义'} 与源码 ${GUOKEXIN_BRAND_TOKENS.primary} 不一致`
      if (entry.migrationStatus === 'frozen' && isKnownLegacySnapshot(entry)) {
        warnings += 1
        console.warn(`! ${entry.dir}: ${message}（历史冻结版保留）`)
      } else errors.push(message)
    }
    if (!isKnownLegacySnapshot(entry)) {
      const releasedComponents = new Set((JSON.parse(fs.readFileSync(path.join(dir, 'components.json'), 'utf8')) as { availableComponents?: Array<{ id: string }> }).availableComponents?.map((item) => item.id) ?? [])
      const missingComponents = systemManifest.components.projectScope.filter((componentId) => !releasedComponents.has(componentId))
      if (missingComponents.length) errors.push(`发布包缺少项目组件：${missingComponents.join(', ')}`)
    }
  }

  if (errors.length) {
    failures += 1
    console.error(`✗ ${entry.dir}: ${errors.join('；')}`)
  } else console.log(`✓ ${entry.dir}: ${required.length} 项发布文件与 checksum 完整`)
}

if (failures) process.exitCode = 1
else console.log(`主工程发布资产校验通过：${index.length} 条记录，${warnings} 条历史差异警告`)
