export type PlatformId = 'web' | 'mobile' | 'embedded' | 'spatial'
export type AssetType = 'token' | 'component' | 'icon' | 'pattern' | 'template'
export type ThemeMode = 'light' | 'dark' | 'adaptive'
export type Density = 'comfortable' | 'compact' | 'spacious'

export interface AssetVariant {
  id: string
  name: string
  description: string
  tokenOverrides?: Record<string, string>
}

export interface AssetState {
  id: string
  name: string
  description: string
}

export interface ProjectAssetOverride {
  projectId: string
  tokenOverrides?: Record<string, string>
  ruleOverrides?: string[]
}

export interface ReactPropSchema {
  type: 'string' | 'boolean' | 'react-node'
  required?: boolean
  default?: string | boolean
  enum?: string[]
  description: string
}

export interface ComponentPropertyContract {
  type: 'enum'
  values: readonly string[]
  reactProp: string
  figmaProperty: string
  labels: Record<string, string>
  figmaValues: Record<string, string>
}

export interface ComponentContract {
  properties: Record<string, ComponentPropertyContract>
  allowedCombinations: readonly Record<string, string>[]
}

export interface ReactComponentBinding {
  package: string
  exportName: string
  sourcePath: string
  props: Record<string, ReactPropSchema>
}

export interface StorybookBinding {
  storyId: string
  sourcePath: string
  url: string
}

export interface AssetBindings {
  react?: ReactComponentBinding
  storybook?: StorybookBinding
  figma?: {
    fileKey: string
    nodeId: string
  }
}

export interface AssetLifecycle {
  version: string
  revision: number
  changelog: Array<{
    version: string
    date: string
    changes: string[]
  }>
}

export interface AssetSyncStatus {
  react: 'unbound' | 'bound'
  storybook: 'unbound' | 'bound'
  figma: 'unbound' | 'bound'
  overall: 'unbound' | 'partially-bound' | 'synced'
}

export interface DesignAsset {
  id: string
  name: string
  type: AssetType
  description: string
  semantic: string
  platforms: PlatformId[]
  rules: string[]
  tokens: string[]
  variants: AssetVariant[]
  states: AssetState[]
  projectOverrides: ProjectAssetOverride[]
  status?: 'stable' | 'draft' | 'review'
  tags?: string[]
  scope?: 'global' | 'project' | 'component'
  ownerProjectId?: string
  ownerComponentId?: string
  bindings?: AssetBindings
  lifecycle?: AssetLifecycle
  sync?: AssetSyncStatus
}

export interface TokenAsset extends DesignAsset {
  type: 'token'
  category: 'color' | 'typography' | 'radius' | 'space' | 'shadow' | 'motion'
  group: string
  defaultValue: string
  layer?: 'global' | 'platform' | 'project' | 'component'
}

export interface ComponentAsset extends DesignAsset {
  type: 'component'
  anatomy?: string[]
  sizes?: AssetVariant[]
  accessibility?: string[]
  tokenRoles?: Array<{ role: string; token: string }>
  priority?: 'core' | 'secondary'
  contract?: ComponentContract
}

export interface PatternAsset extends DesignAsset {
  type: 'pattern'
  components: string[]
  steps: Array<{ title: string; description: string }>
  necessaryStates: string[]
  usage: string[]
  notes: string[]
}

export interface PageTemplateSlot {
  id: string
  label: string
  required: boolean
  accepts: string[]
}

export interface PageTemplateAction {
  id: string
  label: string
  intent: 'primary' | 'secondary' | 'danger' | 'navigation'
  handler: string
  permission?: string
}

export interface PageTemplateAsset extends DesignAsset {
  type: 'template'
  schemaVersion: 'page-template/1'
  templateVersion: string
  intent: string
  patternIds: string[]
  requiredComponents: string[]
  slots: PageTemplateSlot[]
  dataContract: Array<{ id: string; type: string; required: boolean; description: string }>
  actions: PageTemplateAction[]
  necessaryStates: string[]
  responsiveRules: string[]
  accessibility: string[]
  example: string
}

export interface PlatformDefinition {
  id: PlatformId
  name: string
  description: string
  capabilities: string[]
  stateExtensions: string[]
  componentExtensions: string[]
  constraints: string[]
  tokenOverrides: Record<string, string>
}

export interface ProjectConfig {
  id: string
  name: string
  shortName: string
  platform: PlatformId
  description: string
  brandPrimary: string
  brandSecondary: string
  fontFamily: string
  radiusScale: number
  density: Density
  themeMode: ThemeMode
  tokenOverrides: Record<string, string>
  specialRules: string[]
  customAssetIds: string[]
  componentIds: string[]
  status: 'active' | 'demo'
  /** Frozen 发布目录使用的稳定项目 ID；与产品侧短 ID 显式隔离。 */
  releaseProjectId: string
  /** 当前项目采用的 Icon Registry 版本；项目 Pack 不因 Registry 升级自动扩容。 */
  iconRegistryVersion: string
}

export interface ResolvedTheme {
  projectId: string
  values: Record<string, string>
  sources: Record<string, 'global' | 'platform' | 'project' | 'asset' | 'release' | 'compatibility'>
}

export interface ResolvedAssetContext extends ResolvedTheme {
  assetId: string
  rules: Array<{ text: string; source: 'asset' | 'platform' | 'project' }>
  platformStates: string[]
  inheritance: Array<{ layer: 'global' | 'platform' | 'project' | 'asset'; label: string; detail: string }>
}
