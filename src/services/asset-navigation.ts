import type { DesignAsset } from '../types/design-system'
export function assetDestination(asset: Pick<DesignAsset, 'type' | 'id'>) {
  const prefix = asset.type === 'component' ? '/components' : asset.type === 'template' ? '/templates' : asset.type === 'pattern' ? '/patterns' : '/assets'
  return `${prefix}/${asset.id}`
}

export function componentDestination(base: string, componentId: string | null, params?: Pick<URLSearchParams, 'get'>) {
  const next = new URLSearchParams()
  const version = params?.get('version')?.trim()
  const query = params?.get('q')?.trim()
  if (version) next.set('version', version)
  if (query) next.set('q', query)
  const search = next.toString()
  return `${base}${componentId ? `/${componentId}` : ''}${search ? `?${search}` : ''}`
}

export function projectDestination(projectId: string, section = '', params?: Pick<URLSearchParams, 'get'>) {
  const next = new URLSearchParams()
  const version = params?.get('version')?.trim()
  if (version) next.set('version', version)
  const suffix = section ? `/${section.replace(/^\//, '')}` : ''
  const search = next.toString()
  return `/projects/${encodeURIComponent(projectId)}${suffix}${search ? `?${search}` : ''}`
}

export function contextualAssetDestination(asset: Pick<DesignAsset, 'type' | 'id'>, projectId?: string, version?: string) {
  if (!projectId) return assetDestination(asset)
  const section = asset.type === 'component' ? 'components' : asset.type === 'template' ? 'templates' : asset.type === 'pattern' ? 'patterns' : 'foundations'
  const params = new URLSearchParams()
  if (version) params.set('version', version)
  return projectDestination(projectId, `${section}/${asset.id}`, params)
}

export function isFoundationAsset(asset: Pick<DesignAsset, 'type'>) {
  return asset.type === 'token' || asset.type === 'icon'
}
