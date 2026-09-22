import templateSchema from '../../template.schema.json'
import { loadReleaseAsset, type ReleaseAssetName, type ReleaseCatalogEntry } from './release-catalog'

const sourceFiles: ReleaseAssetName[] = ['manifest.json', 'ai-rules.md', 'tokens.json', 'tokens.css', 'components.json', 'icons.json', 'patterns.json', 'layout.json', 'region-appearance.json', 'validation-report.json']
type AiBundleLoader = (release: ReleaseCatalogEntry, name: ReleaseAssetName) => Promise<unknown>

export interface AiDataBundle {
  schemaVersion: 'design-workspace/ai-bundle-1'
  projectId: string
  releaseVersion: string
  createdAt: string
  readOrder: string[]
  files: Record<string, unknown>
  missingFiles: string[]
}

export async function loadAiDataBundle(release: ReleaseCatalogEntry, loader: AiBundleLoader = loadReleaseAsset): Promise<AiDataBundle> {
  const results = await Promise.all(sourceFiles.map(async name => {
    try { return [name, await loader(release, name)] as const }
    catch { return [name, undefined] as const }
  }))
  const files: Record<string, unknown> = Object.fromEntries(results.filter(([, value]) => value !== undefined))
  for (const required of ['manifest.json', 'ai-rules.md', 'tokens.json', 'components.json']) if (!(required in files)) throw new Error(`AI 规范数据缺少必要文件：${required}`)
  const patterns = files['patterns.json'] as { templates?: unknown[] } | undefined
  files['templates.json'] = { schemaVersion: 'page-template-collection/1', templateSchema, templates: patterns?.templates ?? [] }
  const missingFiles = sourceFiles.filter(name => !(name in files))
  return {
    schemaVersion: 'design-workspace/ai-bundle-1', projectId: release.projectId, releaseVersion: release.version,
    createdAt: release.publishedAt ?? 'not-recorded',
    readOrder: ['manifest.json', 'ai-rules.md', 'tokens.json', 'components.json', 'icons.json', 'patterns.json', 'templates.json', 'layout.json', 'region-appearance.json'],
    files, missingFiles,
  }
}
