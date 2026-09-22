import { describe, expect, it } from 'vitest'
import { baselineThemeSettings, deriveBrandPalette, projectPreviewVariables } from './project-theme'
import { analyzeDesignMarkdown, applyDesignMarkdownChanges } from './design-markdown-import'

const identity = `---
schema: "design-workspace/design-md-1"
scope: "project-consumption"
projectId: "guokexin"
releaseProjectId: "project-release-id"
releaseVersion: "2.0.0"
status: "published"
runtimeBuildId: "sha256:runtime"
snapshotChecksum: "fnv1a64:source"
---

# guokexin · v2.0.0 设计与实现规范`

const context = (theme = baselineThemeSettings) => ({
  projectId: 'guokexin',
  releaseProjectId: 'project-release-id',
  theme,
  expectedSnapshotChecksum: 'fnv1a64:source',
  expectedRuntimeBuildId: 'sha256:runtime',
  baseTokens: {
    '--brand-primary': '#315C52',
    '--brand-secondary': '#E7EFEC',
    '--brand-hover': '#447167',
    '--brand-active': '#244B43',
    '--text-primary': '#1D2129',
    '--text-secondary': '#4E5969',
    '--status-success': '#00B42A',
    '--button-brand-filled-bg-default': '#315C52',
    '--button-brand-filled-text-default': '#FFFFFF',
    '--radius-control': '4px',
    '--motion-duration-fast': '120ms',
  },
})

describe('AI 设计 Markdown 回流', () => {
  it('只把 AI 相对来源版本修改的 Token 视为变更', () => {
    const source = `${identity}

## 主题与颜色边界

| Token | 当前值 |
|---|---|
| \`--brand-primary\` | #165DFF |
| \`--text-primary\` | #1D2129 |
| \`--text-secondary\` | #3B4555 |
| \`--status-success\` | #118822 |
| \`--motion-duration-fast\` | 180ms |
`
    const result = analyzeDesignMarkdown(source, context())
    expect(result.conflicts).toEqual([])
    expect(result.sourceUnchangedCount).toBe(1)
    expect(result.changes.map(change => change.field)).toEqual(expect.arrayContaining(['brandPrimary', 'brandSecondary', 'brandHover', 'brandActive', 'textSecondary', 'statusSuccess']))
    expect(result.review.some(item => item.id === 'unsupported-tokens')).toBe(true)
  })

  it('当前草稿与来源也有变更时要求显式确认', () => {
    const theme = { ...baselineThemeSettings, textSecondary: '#556677' }
    const source = `${identity}

## 主题与颜色边界

| Token | 当前值 |
|---|---|
| \`--text-secondary\` | #334455 |
`
    const result = analyzeDesignMarkdown(source, context(theme))
    expect(result.changes).toEqual([expect.objectContaining({ field: 'textSecondary', classification: 'confirmation', before: '#556677', after: '#334455' })])
  })

  it('来源版本中未改的旧值不回退新草稿', () => {
    const theme = { ...baselineThemeSettings, textPrimary: '#202A35' }
    const source = `${identity}

## 主题与颜色边界

| Token | 当前值 |
|---|---|
| \`--text-primary\` | #1D2129 |
`
    const result = analyzeDesignMarkdown(source, context(theme))
    expect(result.changes).toEqual([])
    expect(result.sourceUnchangedCount).toBe(1)
  })

  it('阻断平台规范、身份冲突和越界值', () => {
    const source = `${identity.replace('project-consumption', 'management-platform-only').replace('guokexin', 'another-project')}

## 主题与颜色边界

| Token | 当前值 |
|---|---|
| \`--radius-control\` | 99px |
`
    const result = analyzeDesignMarkdown(source, context())
    expect(result.canApply).toBe(false)
    expect(result.conflicts.map(item => item.id)).toEqual(expect.arrayContaining(['scope', 'project', 'invalid:radius-control']))
  })

  it('只将用户选中的字段应用到完整主题', () => {
    const palette = deriveBrandPalette('#165DFF')!
    const changes = analyzeDesignMarkdown(`${identity}

## 主题与颜色边界

| Token | 当前值 |
|---|---|
| \`--brand-primary\` | #165DFF |
| \`--radius-control\` | 8px |
`, context()).changes
    const next = applyDesignMarkdownChanges(baselineThemeSettings, changes, ['theme:brandPrimary', 'theme:radius'])
    expect(next.brandPrimary).toBe('#165DFF')
    expect(next.radius).toBe(8)
    expect(next.brandSecondary).not.toBe(palette.brandSecondary)
    expect(next.textPrimary).toBe(baselineThemeSettings.textPrimary)
  })

  it('已启用分层尺寸时将中号控件高度写入真正生效的 override', () => {
    const theme = { ...baselineThemeSettings, sizing: { version: 1 as const, overrides: { heightMd: 34 } } }
    const result = analyzeDesignMarkdown(`${identity}

## 主题与颜色边界

| Token | 当前值 |
|---|---|
| \`--control-height-md\` | 38px |
`, { ...context(theme), baseTokens: { '--control-height-md': '32px' } })
    expect(result.changes[0]).toMatchObject({ id: 'theme:controlHeight', before: 34, after: 38, classification: 'confirmation', sizingId: 'heightMd' })
    const next = applyDesignMarkdownChanges(theme, result.changes, ['theme:controlHeight'])
    expect(next.sizing?.overrides.heightMd).toBe(38)
    expect(next.controlHeight).toBe(theme.controlHeight)
  })

  it('将主按钮配方写入可选持久字段，before 读取当前实际解析 Token', () => {
    const theme = { ...baselineThemeSettings, brandPrimary: '#FFCC00' }
    const currentTokens = projectPreviewVariables(theme)
    const result = analyzeDesignMarkdown(`${identity}

## 主题与颜色边界

| Token | 当前值 |
|---|---|
| \`--button-brand-filled-bg-default\` | #102030 |
| \`--button-brand-filled-text-default\` | #F8FAFC |
`, { ...context(theme), currentTokens })
    expect(result.conflicts).toEqual([])
    expect(result.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'theme:buttonPrimaryBackground', before: currentTokens['--button-brand-filled-bg-default'], after: '#102030' }),
      expect.objectContaining({ id: 'theme:buttonPrimaryText', before: currentTokens['--button-brand-filled-text-default'], after: '#F8FAFC' }),
    ]))
    const next = applyDesignMarkdownChanges(theme, result.changes, result.changes.map(change => change.id))
    expect(next.buttonPrimaryBackground).toBe('#102030')
    expect(next.buttonPrimaryText).toBe('#F8FAFC')
    const variables = projectPreviewVariables(next)
    expect(variables['--button-brand-filled-bg-default']).toBe('#102030')
    expect(variables['--button-brand-filled-text-hover']).toBe('#F8FAFC')
  })
})
