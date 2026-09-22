export interface ProjectDeliveryArtifact {
  projectId: string
  releaseVersion: string
  packageName: string
  packageVersion: string
  runtimeBuildId: string
  snapshotChecksum: string
  snapshotSha256: string
  archiveName: string
  sha256: string
  bytes: number
  createdAt: string
  componentIds: string[]
}
export interface ProjectDeliveryStatus {
  status: 'not-generated' | 'building' | 'ready' | 'failed' | 'unavailable'
  message?: string
  artifact?: ProjectDeliveryArtifact
  guide?: string
  designSpec?: string
}

export interface ProjectDeliveryPreflight {
  status: 'ready' | 'unavailable'
  snapshotReady: boolean
  runtimeBuildId: string
  message: string
}

export type DeliveryAcceptanceStatus = 'planned' | 'testing' | 'verified' | 'rollback-required'
export interface DeliveryAcceptance {
  id: string
  projectId: string
  version: string
  applicationName: string
  owner: string
  status: DeliveryAcceptanceStatus
  checks: string[]
  notes: string
  updatedAt: number
  updatedBy: string
}
