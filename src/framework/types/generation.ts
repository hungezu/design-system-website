export type GenerationSource = 'rule-based-demo'
export type InformationDensity = 'compact' | 'comfortable' | 'spacious'
export type DataVolume = 'small' | 'medium' | 'large'
export type LayoutDirection = 'horizontal' | 'vertical'

export interface UserRoleSpec {
  id: string
  name: string
  responsibilities: string[]
}

export interface ProductPageBrief {
  id: string
  name: string
  type: 'list' | 'detail' | 'form' | 'dashboard' | 'custom'
  tasks: string[]
  moduleId: string
}

export interface BusinessModuleSpec {
  id: string
  name: string
  description: string
  pageIds: string[]
}

export interface ProductBrief {
  id: string
  productName: string
  productType: string
  targetUsers: string[]
  businessGoal: string
  userRoles: UserRoleSpec[]
  modules: BusinessModuleSpec[]
  pages: ProductPageBrief[]
  coreTasks: string[]
  informationHierarchy: {
    maxNavigationDepth: number
    density: InformationDensity
    dataVolume: DataVolume
    crossModuleOperations: boolean
  }
  constraints: string[]
}

export interface InformationArchitectureNode {
  id: string
  type: 'system' | 'module' | 'page'
  name: string
  route?: string
  children?: InformationArchitectureNode[]
}

export interface InformationArchitectureSpec {
  id: string
  productBriefId: string
  root: InformationArchitectureNode
  navigationDepth: number
  generatedBy: GenerationSource
}

export type LayoutPrimitiveType =
  | 'root'
  | 'header'
  | 'sidebar'
  | 'primary-navigation'
  | 'secondary-navigation'
  | 'context-navigation'
  | 'breadcrumb'
  | 'page-header'
  | 'tabs'
  | 'toolbar'
  | 'content'
  | 'grid'
  | 'aside'
  | 'inspector'
  | 'split-view'
  | 'detail-pane'
  | 'drawer-region'
  | 'footer-region'
  | 'card-grid'
  | 'table-region'
  | 'custom-region'

export interface LayoutNode {
  id: string
  type: LayoutPrimitiveType
  label: string
  direction?: LayoutDirection
  width?: string
  height?: string
  locked?: boolean
  customKind?: string
  children?: LayoutNode[]
}

export interface SystemLayoutCandidate {
  id: string
  name: string
  reason: string
  benefits: string[]
  limitations: string[]
  root: LayoutNode
}

export interface SystemLayoutSpec {
  id: string
  productBriefId: string
  candidates: SystemLayoutCandidate[]
  selectedCandidateId: string
  generatedBy: GenerationSource
}

export interface PageSectionSpec {
  id: string
  layoutNode: LayoutNode
  patternId?: string
  componentId?: string
  businessFields?: string[]
}

export interface PageSpec {
  id: string
  moduleId: string
  name: string
  route: string
  task: string
  recommendedStartingPoint?: string
  patternIds: string[]
  componentIds: string[]
  layout: LayoutNode
  sections: PageSectionSpec[]
}

export interface ThemeSpec {
  id: string
  name: string
  mode: 'light' | 'dark'
  brandPrimary: string
  brandSecondary: string
  fontFamily: string
  radius: string
  border: string
  shadow: string
  density: InformationDensity
  spacingScale: InformationDensity
  tableDensity: InformationDensity
  componentDensity: InformationDensity
  buttonAppearance: 'filled' | 'outline' | 'balanced'
  pageBackground: string
  iconStyle: 'outline' | 'filled' | 'mixed'
  tokenOverrides: Record<string, string>
}

export interface GeneratedSystem {
  id: string
  instanceId: string
  productBrief: ProductBrief
  informationArchitecture: InformationArchitectureSpec
  systemLayout: SystemLayoutSpec
  pageSpecs: PageSpec[]
  theme: ThemeSpec
  generatedBy: GenerationSource
  generatedAt: string
}
