import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createWorkspace } from './workspace'

test('AI 设计规范仅经三方差异和修订锁回写当前草稿', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'design-md-import-'))
  const workspace = createWorkspace({ dbPath: join(directory, 'workspace.sqlite'), bootstrapToken: 'design-md-test' })
  await new Promise<void>(done => workspace.server.listen(0, '127.0.0.1', done))
  const origin = `http://127.0.0.1:${(workspace.server.address() as { port: number }).port}`
  let cookie = ''
  const request = async (path: string, method = 'GET', body?: unknown) => {
    const response = await fetch(`${origin}/api${path}`, { method, headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json', 'X-Workspace-Request': '1' }, body: body === undefined ? undefined : JSON.stringify(body) })
    const nextCookie = response.headers.get('set-cookie'); if (nextCookie) cookie = nextCookie.split(';')[0]
    return { status: response.status, data: await response.json() }
  }
  try {
    await request('/auth/setup', 'POST', { token: 'design-md-test', email: 'admin@example.test', name: '管理员', password: 'Design-md-test-password!' })
    assert.equal((await request('/projects/guokexin/releases', 'POST', { version: '7.8.0', note: '回流基线' })).status, 201)
    const delivery = await request('/projects/guokexin/deliveries/7.8.0')
    assert.equal(delivery.status, 200)
    const originalMarkdown = String(delivery.data.designSpec)
    const markdown = originalMarkdown
      .replace('| `--brand-primary` | #165DFF |', '| `--brand-primary` | #234567 |')
      .replace('| `--button-brand-filled-bg-default` | #165DFF |', '| `--button-brand-filled-bg-default` | #102030 |')
      .replace('| `--button-brand-filled-text-default` | #FFFFFF |', '| `--button-brand-filled-text-default` | #F8FAFC |')
    assert.notEqual(markdown, originalMarkdown)

    const preview = await request('/projects/guokexin/draft/design-md/preview', 'POST', { markdown })
    assert.equal(preview.status, 200, JSON.stringify(preview.data))
    assert.equal(preview.data.analysis.conflicts.length, 0)
    assert.ok(preview.data.analysis.changes.some((change: { id: string }) => change.id === 'theme:brandPrimary'))
    assert.ok(preview.data.analysis.changes.some((change: { id: string; before: string }) => change.id === 'theme:buttonPrimaryBackground' && change.before === '#165DFF'))
    assert.ok(preview.data.analysis.changes.some((change: { id: string; before: string }) => change.id === 'theme:buttonPrimaryText' && change.before === '#FFFFFF'))
    const selected = preview.data.analysis.changes.filter((change: { classification: string }) => change.classification === 'applicable').map((change: { id: string }) => change.id)
    const applied = await request('/projects/guokexin/draft/design-md/apply', 'POST', { markdown, documentChecksum: preview.data.documentChecksum, baseRevision: preview.data.baseRevision, acceptedChangeIds: selected })
    assert.equal(applied.status, 200, JSON.stringify(applied.data))
    const savedTheme = (await request('/projects/guokexin/theme')).data.theme
    assert.equal(savedTheme.brandPrimary, '#234567')
    assert.equal(savedTheme.buttonPrimaryBackground, '#102030')
    assert.equal(savedTheme.buttonPrimaryText, '#F8FAFC')
    assert.equal((await request('/projects/guokexin/releases/7.8.0/tokens.json')).data['--brand-primary'], '#165DFF')
    assert.equal((await request('/projects/guokexin/releases/7.8.0/tokens.json')).data['--button-brand-filled-bg-default'], '#165DFF')

    const stalePreview = await request('/projects/guokexin/draft/design-md/preview', 'POST', { markdown: originalMarkdown.replace('| `--radius-control` | 4px |', '| `--radius-control` | 8px |') })
    const current = await request('/projects/guokexin/theme')
    await request('/projects/guokexin/theme', 'PUT', { theme: { ...current.data.theme, textSecondary: '#3B4555' }, revision: current.data.revision })
    const staleApply = await request('/projects/guokexin/draft/design-md/apply', 'POST', { markdown: originalMarkdown.replace('| `--radius-control` | 4px |', '| `--radius-control` | 8px |'), documentChecksum: stalePreview.data.documentChecksum, baseRevision: stalePreview.data.baseRevision, acceptedChangeIds: ['theme:radius'] })
    assert.equal(staleApply.status, 409)

    const foreign = await request('/projects/guokexin/draft/design-md/preview', 'POST', { markdown: markdown.replace('projectId: "guokexin"', 'projectId: "test-customer-b"') })
    assert.equal(foreign.status, 200)
    assert.ok(foreign.data.analysis.conflicts.some((item: { id: string }) => item.id === 'project'))
  } finally {
    await workspace.close()
    rmSync(directory, { recursive: true, force: true })
  }
})
