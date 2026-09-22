import { expect, it, vi } from 'vitest'
import { loadAiDataBundle } from './ai-bundle'
import type { ReleaseCatalogEntry } from './release-catalog'

const release: ReleaseCatalogEntry = { dir: 'x', label: 'x', projectId: 'project-id', version: '1.2.3', migrationStatus: 'frozen' }

it('AI 数据包拆出页面模板契约并声明读取顺序', async () => {
  const loader = vi.fn(async (_release, name) => name === 'patterns.json' ? { templates: [{ id: 'template-list', schemaVersion: 'page-template/1' }] } : name === 'manifest.json' ? { projectId: 'project-id' } : name === 'ai-rules.md' ? '# rules' : {})
  const bundle = await loadAiDataBundle(release, loader)
  expect(bundle.readOrder).toContain('templates.json')
  expect(bundle.files['templates.json']).toMatchObject({ schemaVersion: 'page-template-collection/1', templates: [{ id: 'template-list' }] })
})
