import type { CSSProperties } from 'react'
import type { InformationArchitectureSpec, LayoutNode, PageSpec, ProductBrief, SystemLayoutSpec, ThemeSpec } from '../framework/types/generation'
import { PROJECT_THEME_MODE_VALUES } from './project-theme'

export const WORKBENCH_DRAFT_KEY = 'design-intelligence-workbench-draft-v1'
export const workbenchDraftKey = (projectId = 'global') => `${WORKBENCH_DRAFT_KEY}:${projectId}`

export interface WorkbenchDraft {
  step: number
  furthestStep: number
  brief: ProductBrief
  ia: InformationArchitectureSpec
  layoutSpec: SystemLayoutSpec
  selectedCandidateId: string
  activeLayout: LayoutNode
  pageSpecs: PageSpec[]
  selectedPageId: string
  theme: ThemeSpec
}

export function loadWorkbenchDraft(storage: Pick<Storage, 'getItem'> = localStorage, projectId = 'global'): WorkbenchDraft | null {
  try { return JSON.parse(storage.getItem(workbenchDraftKey(projectId)) ?? 'null') as WorkbenchDraft | null }
  catch { return null }
}

export function saveWorkbenchDraft(draft: WorkbenchDraft, storage: Pick<Storage, 'setItem'> = localStorage, projectId = 'global') {
  storage.setItem(workbenchDraftKey(projectId), JSON.stringify(draft))
}

export function createStableId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`
}

export function createThemePreviewStyle(theme: ThemeSpec): CSSProperties {
  const modeValues = PROJECT_THEME_MODE_VALUES[theme.mode]
  return {
    '--brand-primary': theme.brandPrimary,
    '--brand-secondary': theme.brandSecondary,
    '--surface-canvas': theme.pageBackground,
    '--surface-primary': modeValues.surfacePrimary,
    '--surface-secondary': modeValues.surfaceSecondary,
    '--text-primary': modeValues.textPrimary,
    '--text-secondary': modeValues.textSecondary,
    '--radius-control': theme.radius,
    '--border-default': theme.border,
    '--shadow-overlay': theme.shadow,
    '--font-button': `500 14px/22px ${theme.fontFamily}`,
    '--preview-gap': theme.spacingScale === 'compact' ? '8px' : theme.spacingScale === 'spacious' ? '20px' : '14px',
    '--preview-row-height': theme.tableDensity === 'compact' ? '36px' : theme.tableDensity === 'spacious' ? '54px' : '44px',
    fontFamily: theme.fontFamily,
  } as CSSProperties
}
