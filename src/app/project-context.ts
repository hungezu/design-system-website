import { createContext, useContext } from 'react'
import type { ProjectConfig, ResolvedTheme } from '../types/design-system'
import type { ReleaseAssetName, ReleaseCatalogEntry } from '../services/release-catalog'
import type { ProjectThemeSettings } from '../services/project-theme'

export interface ProjectContextValue {
  project: ProjectConfig
  theme: ResolvedTheme
  setProjectId: (projectId: string) => void
  releases: ReleaseCatalogEntry[]
  release: ReleaseCatalogEntry | null
  releaseLoading: boolean
  releaseError: string | null
  setReleaseVersion: (version: string) => void
  publishDraft: (input: { version: string; note: string; requireDeliverable?: boolean }) => Promise<ReleaseCatalogEntry>
  loadReleaseAsset: <T = unknown>(name: ReleaseAssetName) => Promise<T>
  projectTheme: ProjectThemeSettings
  saveProjectTheme: (settings: ProjectThemeSettings) => void | Promise<void>
  reloadProjectTheme?: () => Promise<ProjectThemeSettings>
  restoreProjectTheme: () => ProjectThemeSettings
}

export const ProjectContext = createContext<ProjectContextValue | null>(null)

export function useProject() {
  const value = useContext(ProjectContext)
  if (!value) throw new Error('useProject 必须在 ProjectProvider 内使用')
  return value
}
