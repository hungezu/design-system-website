import { deriveBrandPalette, projectPreviewVariables, PROJECT_THEME_SHADOWS, type ProjectThemeSettings } from './project-theme'
import { changeSizing, resolvedSizing, type SizingId } from './theme-sizing'

export const DESIGN_MARKDOWN_IMPORT_LIMIT = 200_000

export interface DesignMarkdownIdentity {
  schema?: string
  scope?: string
  projectId?: string
  releaseProjectId?: string
  releaseVersion?: string
  status?: string
  runtimeBuildId?: string
  snapshotChecksum?: string
  title: string
}

type ThemeField = Exclude<keyof ProjectThemeSettings, 'sizing'>

export interface DesignMarkdownThemeChange {
  id: string
  token: string
  field: ThemeField
  label: string
  before: string | number
  after: string | number
  classification: 'applicable' | 'confirmation'
  reason: string
  sizingId?: SizingId
}

export interface DesignMarkdownFinding {
  id: string
  title: string
  detail: string
}

export interface DesignMarkdownAnalysis {
  identity: DesignMarkdownIdentity
  changes: DesignMarkdownThemeChange[]
  review: DesignMarkdownFinding[]
  conflicts: DesignMarkdownFinding[]
  sourceUnchangedCount: number
  alreadyAppliedCount: number
  recognizedTokenCount: number
  canApply: boolean
}

export interface DesignMarkdownPreviewResponse {
  documentChecksum: string
  baseRevision: number
  analysis: DesignMarkdownAnalysis
}

export interface DesignMarkdownApplyResponse {
  theme: ProjectThemeSettings
  revision: number
  appliedCount: number
}

interface ImportContext {
  projectId: string
  releaseProjectId: string
  theme: ProjectThemeSettings
  baseTokens?: Record<string, string>
  currentTokens?: Record<string, string>
  expectedSnapshotChecksum?: string
  expectedRuntimeBuildId?: string
}

interface TokenMapping {
  field: ThemeField
  label: string
  parse: (value: string) => string | number | null
  sizingId?: SizingId
  currentToken?: string
}

const color = (value: string) => /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim().toUpperCase() : null
const pixels = (min: number, max: number) => (value: string) => {
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)px$/i)
  const number = match ? Number(match[1]) : NaN
  return Number.isFinite(number) && number >= min && number <= max ? number : null
}
const safeText = (value: string) => value.trim() && value.length <= 500 && !/[;{}]|url\s*\(|@import/i.test(value) ? value.trim() : null
const supportedFont = (value: string) => {
  const parsed = safeText(value)
  return parsed && [
    '"Noto Sans SC Variable", sans-serif',
    '"PingFang SC", sans-serif',
  ].includes(parsed) ? parsed : null
}
const supportedShadow = (value: string) => {
  const parsed = safeText(value)
  return parsed && (Object.values(PROJECT_THEME_SHADOWS) as string[]).includes(parsed) ? parsed : null
}

const TOKEN_MAPPINGS: Record<string, TokenMapping> = {
  'brand-primary': { field: 'brandPrimary', label: '品牌主色', parse: color },
  'brand-secondary': { field: 'brandSecondary', label: '品牌辅助色', parse: color },
  'brand-hover': { field: 'brandHover', label: '悬停色', parse: color },
  'brand-active': { field: 'brandActive', label: '按下色', parse: color },
  'text-primary': { field: 'textPrimary', label: '主要文字', parse: color },
  'text-secondary': { field: 'textSecondary', label: '次要文字', parse: color },
  'surface-canvas': { field: 'surfaceCanvas', label: '页面背景', parse: color },
  'surface-primary': { field: 'surfacePrimary', label: '内容背景', parse: color },
  'border-default': { field: 'borderDefault', label: '边框颜色', parse: color },
  'status-success': { field: 'statusSuccess', label: '成功状态色', parse: color },
  'status-warning': { field: 'statusWarning', label: '警告状态色', parse: color },
  'status-error': { field: 'statusError', label: '错误状态色', parse: color },
  'button-brand-filled-bg-default': { field: 'buttonPrimaryBackground', label: '主按钮背景', parse: color, currentToken: 'button-brand-filled-bg-default' },
  'button-brand-filled-text-default': { field: 'buttonPrimaryText', label: '主按钮文字与图标', parse: color, currentToken: 'button-brand-filled-text-default' },
  'preview-font-family': { field: 'fontFamily', label: '字体', parse: supportedFont },
  'preview-body-size': { field: 'bodySize', label: '正文字号', parse: pixels(12, 18) },
  'preview-title-size': { field: 'titleSize', label: '标题字号', parse: pixels(18, 32) },
  'radius-control': { field: 'radius', label: '控件圆角', parse: pixels(0, 16) },
  'radius-table': { field: 'tableRadius', label: '表格圆角', parse: pixels(0, 24) },
  'spacing-16': { field: 'spacing', label: '基准间距', parse: pixels(8, 24) },
  'control-height-md': { field: 'controlHeight', label: '标准控件高度', parse: pixels(28, 44), sizingId: 'heightMd' },
  'shadow-base': { field: 'shadow', label: '基础阴影', parse: supportedShadow },
}

function scalar(value: string): string {
  const trimmed = value.trim()
  try {
    const parsed = JSON.parse(trimmed)
    return typeof parsed === 'string' ? parsed : String(parsed)
  } catch {
    return trimmed.replace(/^['"]|['"]$/g, '')
  }
}

function frontmatter(source: string): { values: Record<string, string>; duplicates: string[] } {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---(?:\s*\n|$)/)
  if (!match) return { values: {}, duplicates: [] }
  const values: Record<string, string> = {}, duplicates: string[] = []
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z][\w-]*):\s*(.+)$/)
    if (!item) continue
    if (Object.hasOwn(values, item[1])) duplicates.push(item[1])
    else values[item[1]] = scalar(item[2])
  }
  return { values, duplicates }
}

function decodeMarkdownLiteral(value: string) {
  return value.trim().replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
}

function withoutCodeFences(source: string) {
  return source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '')
}

function section(source: string, title: string) {
  const clean = withoutCodeFences(source)
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const heading = new RegExp(`^##\\s+${escaped}\\s*$`, 'm').exec(clean)
  if (!heading) return ''
  const following = clean.slice(heading.index + heading[0].length).replace(/^\s*\n/, '')
  const next = following.search(/^##\s+/m)
  return next >= 0 ? following.slice(0, next) : following
}

function tokenRows(source: string) {
  const rows = new Map<string, string[]>()
  for (const match of source.matchAll(/^\|\s*`--([a-z0-9-]+)`\s*\|\s*([^|\n]+?)\s*\|\s*$/gim)) {
    const values = rows.get(match[1]) ?? []
    values.push(decodeMarkdownLiteral(match[2]))
    rows.set(match[1], values)
  }
  return rows
}

function sameValue(before: string | number, after: string | number) {
  if (typeof before === 'number' || typeof after === 'number') return Number(before) === Number(after)
  return before.trim().toLowerCase() === after.trim().toLowerCase()
}

function headingList(source: string) {
  return [...withoutCodeFences(source).matchAll(/^##\s+(.+?)\s*$/gm)].map(match => match[1].trim())
}

export function readDesignMarkdownIdentity(source: string): DesignMarkdownIdentity {
  const meta = frontmatter(source).values
  return {
    schema: meta.schema, scope: meta.scope, projectId: meta.projectId, releaseProjectId: meta.releaseProjectId,
    releaseVersion: meta.releaseVersion, status: meta.status, runtimeBuildId: meta.runtimeBuildId, snapshotChecksum: meta.snapshotChecksum,
    title: source.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim() ?? '未命名设计规范',
  }
}

export function analyzeDesignMarkdown(source: string, context: ImportContext): DesignMarkdownAnalysis {
  const input = source.replace(/\r\n/g, '\n').trim()
  if (!input) throw new Error('请粘贴 DESIGN.md 内容或选择 Markdown 文件。')
  if (input.length > DESIGN_MARKDOWN_IMPORT_LIMIT) throw new Error('Markdown 超过 200 KB，请移除无关内容后重试。')
  if ([...input].some(character => { const code = character.charCodeAt(0); return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127 })) throw new Error('Markdown 包含不支持的控制字符。')
  if (input.split('\n').some(line => line.length > 10_000)) throw new Error('Markdown 存在过长单行，请整理后重试。')

  const parsedMeta = frontmatter(input)
  const identity = readDesignMarkdownIdentity(input)
  const review: DesignMarkdownFinding[] = []
  const conflicts: DesignMarkdownFinding[] = []

  if (parsedMeta.duplicates.length) conflicts.push({ id: 'frontmatter-duplicates', title: '文档身份存在重复字段', detail: `请合并为唯一值：${[...new Set(parsedMeta.duplicates)].join('、')}。` })
  if (identity.schema !== 'design-workspace/design-md-1') conflicts.push({ id: 'schema', title: '规范格式不支持', detail: '需要 design-workspace/design-md-1 的 schema，不会从普通文章猜测项目配置。' })
  if (identity.scope !== 'project-consumption') conflicts.push({ id: 'scope', title: '作用域不符', detail: '只能将项目交付规范回流到项目草稿，平台 DESIGN.md 不能在这里应用。' })
  if (identity.projectId !== context.projectId || identity.releaseProjectId !== context.releaseProjectId) conflicts.push({ id: 'project', title: '项目身份不一致', detail: `导入文档必须属于 ${context.projectId}，且发布标识与当前项目一致。` })
  if (!context.baseTokens) conflicts.push({ id: 'source-version', title: '无法核对来源版本', detail: '必须能读取文档标注的冻结版本，才能区分 AI 改动与旧版本原值。' })
  if (!identity.snapshotChecksum) conflicts.push({ id: 'snapshot-checksum-missing', title: '缺少来源快照校验值', detail: '请使用从项目版本页下载的完整 DESIGN.md，不会对无法追溯的文档自动写入。' })
  else if (context.expectedSnapshotChecksum && identity.snapshotChecksum !== context.expectedSnapshotChecksum) conflicts.push({ id: 'snapshot-checksum', title: '来源快照校验不一致', detail: '文档标注的快照与网站保存的同版本资产不同，本次不会写入。' })
  if (!identity.runtimeBuildId) conflicts.push({ id: 'runtime-missing', title: '缺少组件运行时标识', detail: '请保留完整 frontmatter，确保规范与对应组件契约可追溯。' })
  else if (context.expectedRuntimeBuildId && identity.runtimeBuildId !== context.expectedRuntimeBuildId) conflicts.push({ id: 'runtime', title: '组件运行时不一致', detail: '文档与来源版本使用的 Runtime 不同，本次不会写入。' })

  const headings = headingList(input)
  const proseSections = headings.filter(heading => !['开始前必须具备', '安装与读取顺序', '主题与颜色边界', '交付前检查'].includes(heading))
  if (proseSections.length) review.push({ id: 'prose-sections', title: `检测到 ${proseSections.length} 个规则章节`, detail: `${proseSections.slice(0, 4).join('、')}${proseSections.length > 4 ? '等' : ''}本期仅作参考；尚未与来源正文做差异对比，不会自动改写组件、Pattern 或页面结构。` })

  const rows = tokenRows(section(input, '主题与颜色边界'))
  if (!rows.size) conflicts.push({ id: 'tokens-missing', title: '未找到 Token 表', detail: '请保留规范中“Token / 当前值”表格，才能生成可验证的草稿变更。' })
  if (rows.size > 256) conflicts.push({ id: 'token-limit', title: 'Token 数量超出限制', detail: '单份修改稿最多解析 256 个 Token。' })

  const changes: DesignMarkdownThemeChange[] = []
  const proposed = new Map<ThemeField, DesignMarkdownThemeChange>()
  const currentTokens = context.currentTokens ?? projectPreviewVariables(context.theme)
  let sourceUnchangedCount = 0
  let alreadyAppliedCount = 0
  let recognizedTokenCount = 0
  const unsupportedTokens: string[] = []
  for (const [token, values] of rows) {
    const mapping = TOKEN_MAPPINGS[token]
    const baseRaw = context.baseTokens?.[`--${token}`]
    if (!mapping) {
      if (baseRaw === undefined || decodeMarkdownLiteral(baseRaw).trim().toLowerCase() !== values[0]?.trim().toLowerCase()) unsupportedTokens.push(token)
      continue
    }
    recognizedTokenCount++
    const unique = [...new Set(values)]
    if (unique.length !== 1) {
      conflicts.push({ id: `duplicate:${token}`, title: `${token} 存在冲突`, detail: '同一 Token 在文档中出现了多个不同值，请先合并为唯一值。' })
      continue
    }
    const after = mapping.parse(unique[0])
    if (after === null) {
      conflicts.push({ id: `invalid:${token}`, title: `${mapping.label}的值不可用`, detail: `导入值“${unique[0]}”不符合当前网站支持的格式或范围。` })
      continue
    }
    const base = baseRaw === undefined ? null : mapping.parse(decodeMarkdownLiteral(baseRaw))
    if (context.baseTokens && base === null) {
      conflicts.push({ id: `source-token:${token}`, title: `${mapping.label}缺少可核对的源值`, detail: `来源版本没有可用的 --${token}，不会把它当作可自动应用的修改。` })
      continue
    }
    if (base !== null && sameValue(base, after)) { sourceUnchangedCount++; continue }
    const currentTokenValue = mapping.currentToken ? currentTokens[`--${mapping.currentToken}`] : undefined
    const before = mapping.sizingId && context.theme.sizing
      ? resolvedSizing(context.theme)[mapping.sizingId]
      : currentTokenValue ?? context.theme[mapping.field] as string | number
    if (before === undefined) {
      conflicts.push({ id: `current-token:${token}`, title: `${mapping.label}缺少当前值`, detail: `当前草稿无法解析 --${token}，本次不会覆盖。` })
      continue
    }
    if (sameValue(before, after)) { alreadyAppliedCount++; continue }
    const classification = base !== null && !sameValue(before, base) ? 'confirmation' : 'applicable'
    proposed.set(mapping.field, { id: `theme:${mapping.field}`, token, field: mapping.field, label: mapping.label, before, after, sizingId: mapping.sizingId, classification, reason: classification === 'confirmation' ? '当前草稿与来源版本也有差异，应用会覆盖草稿中的同字段修改。' : 'AI 修改稿与来源版本不同，当前草稿仍保持源值。' })
  }
  const primary = proposed.get('brandPrimary')
  if (primary) {
    const linked = deriveBrandPalette(String(primary.after))
    if (linked) for (const [field, label, token] of [['brandSecondary', '品牌辅助色', 'brand-secondary'], ['brandHover', '悬停色', 'brand-hover'], ['brandActive', '按下色', 'brand-active']] as const) {
      if (proposed.has(field) || rows.get(token)?.some(value => context.baseTokens?.[`--${token}`] && !sameValue(value, context.baseTokens[`--${token}`]))) continue
      const after = linked[field]
      if (sameValue(context.theme[field], after)) continue
      proposed.set(field, { id: `theme:${field}`, token, field, label, before: context.theme[field], after, classification: primary.classification, reason: '由新的品牌主色按现有色阶规则联动生成。' })
    }
  }
  changes.push(...proposed.values())
  if (unsupportedTokens.length) review.push({ id: 'unsupported-tokens', title: `${unsupportedTokens.length} 个 Token 仅作参考`, detail: `${unsupportedTokens.slice(0, 6).map(token => `--${token}`).join('、')}${unsupportedTokens.length > 6 ? '等' : ''}当前没有安全的草稿反向映射。` })

  return { identity, changes, review, conflicts, sourceUnchangedCount, alreadyAppliedCount, recognizedTokenCount, canApply: conflicts.length === 0 && changes.length > 0 }
}

export function applyDesignMarkdownChanges(theme: ProjectThemeSettings, changes: DesignMarkdownThemeChange[], acceptedChangeIds: Iterable<string>) {
  const accepted = new Set(acceptedChangeIds)
  const next = { ...theme }
  for (const change of changes) if (accepted.has(change.id)) {
    if (change.sizingId && next.sizing) next.sizing = changeSizing(next, change.sizingId, Number(change.after))
    else Object.assign(next, { [change.field]: change.after })
  }
  return next
}
