// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DesignMarkdownImportDialog } from './DesignMarkdownImportDialog'
import { guokexinProject } from '../data/projects'
import { defaultProjectTheme } from '../services/project-theme'
import { api } from '../services/workspace-api'

vi.mock('../services/workspace-api', async original => {
  const actual = await original<typeof import('../services/workspace-api')>()
  return { ...actual, api: vi.fn() }
})

beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} }) })
afterEach(() => { cleanup(); vi.clearAllMocks() })

it('解析 AI 修改稿、默认选中安全变更并只写入草稿', async () => {
  const user = userEvent.setup()
  const theme = defaultProjectTheme(guokexinProject)
  const preview = {
    documentChecksum: 'sha256:test', baseRevision: 2,
    analysis: {
      identity: { schema: 'design-workspace/design-md-1', scope: 'project-consumption', projectId: 'guokexin', releaseProjectId: guokexinProject.releaseProjectId, releaseVersion: '1.5.5', title: '国科信设计规范' },
      changes: [
        { id: 'theme:brandPrimary', token: 'brand-primary', field: 'brandPrimary', label: '品牌主色', before: '#165DFF', after: '#234567', classification: 'applicable', reason: '安全变更' },
        { id: 'theme:radius', token: 'radius-control', field: 'radius', label: '控件圆角', before: 4, after: 8, classification: 'confirmation', reason: '草稿也有变更' },
      ],
      review: [{ id: 'prose', title: '正文仅作参考', detail: '本期不自动改写。' }], conflicts: [], sourceUnchangedCount: 8, alreadyAppliedCount: 0, recognizedTokenCount: 10, canApply: true,
    },
  }
  vi.mocked(api).mockResolvedValueOnce(preview).mockResolvedValueOnce({ theme: { ...theme, brandPrimary: '#234567' }, revision: 3, appliedCount: 1 })
  const onApplied = vi.fn()
  render(<DesignMarkdownImportDialog project={guokexinProject} theme={theme} canEdit onApplied={onApplied} />)
  await user.click(screen.getByRole('button', { name: '导入 AI 修改稿' }))
  await user.click(screen.getByRole('tab', { name: '粘贴内容' }))
  fireEvent.change(screen.getByLabelText('AI 修改后的 DESIGN.md'), { target: { value: '# 修改稿' } })
  await user.click(screen.getByRole('button', { name: '解析并预览' }))
  expect(await screen.findByText('国科信设计规范')).toBeTruthy()
  expect((screen.getByRole('checkbox', { name: '品牌主色（--brand-primary）' }) as HTMLInputElement).checked).toBe(true)
  expect((screen.getByRole('checkbox', { name: '控件圆角（--radius-control）' }) as HTMLInputElement).checked).toBe(false)
  const selectAutomatic = screen.getByRole('checkbox', { name: '全选可直接应用项' })
  await user.click(selectAutomatic)
  await user.click(selectAutomatic)
  expect((screen.getByRole('checkbox', { name: '控件圆角（--radius-control）' }) as HTMLInputElement).checked).toBe(false)
  await user.click(screen.getByRole('button', { name: '应用 1 项到当前草稿' }))
  await waitFor(() => expect(onApplied).toHaveBeenCalledWith(1))
  expect(vi.mocked(api).mock.calls[1]?.[1]?.body).toMatchObject({ baseRevision: 2, acceptedChangeIds: ['theme:brandPrimary'] })
})

it('查看者不能打开导入流程', () => {
  render(<DesignMarkdownImportDialog project={guokexinProject} theme={defaultProjectTheme(guokexinProject)} canEdit={false} onApplied={() => undefined} />)
  expect((screen.getByRole('button', { name: '仅编辑者可导入' }) as HTMLButtonElement).disabled).toBe(true)
})

it('可从本地 Markdown 文件读取内容再解析', async () => {
  const user = userEvent.setup()
  vi.mocked(api).mockResolvedValueOnce({
    documentChecksum: 'sha256:file', baseRevision: 0,
    analysis: { identity: { title: '文件修改稿' }, changes: [], review: [], conflicts: [], sourceUnchangedCount: 1, alreadyAppliedCount: 0, recognizedTokenCount: 1, canApply: false },
  })
  const { container } = render(<DesignMarkdownImportDialog project={guokexinProject} theme={defaultProjectTheme(guokexinProject)} canEdit onApplied={() => undefined} />)
  await user.click(screen.getByRole('button', { name: '导入 AI 修改稿' }))
  const input = container.ownerDocument.querySelector('input[type="file"]') as HTMLInputElement
  await user.upload(input, new File(['# 文件修改稿'], 'DESIGN-updated.md', { type: 'text/markdown' }))
  expect(await screen.findByText('DESIGN-updated.md')).toBeTruthy()
  await user.click(screen.getByRole('button', { name: '解析并预览' }))
  await waitFor(() => expect(api).toHaveBeenCalledWith('/projects/guokexin/draft/design-md/preview', expect.objectContaining({ method: 'POST', body: { markdown: '# 文件修改稿' } })))
})
