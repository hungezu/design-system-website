import { semanticTokens } from '../global/semantic-tokens'
import { componentAssets } from './components'
import { iconAssets } from './icons'
import { patternAssets } from './patterns'
import { projectAssets } from './project-assets'
import { templateAssets } from './templates'

export const allAssets = [
  ...semanticTokens,
  ...componentAssets,
  ...iconAssets,
  ...patternAssets,
  ...templateAssets,
  ...projectAssets,
]

export const getAsset = (id: string) => allAssets.find((asset) => asset.id === id)
