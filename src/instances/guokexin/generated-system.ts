import { generateSystem } from '../../framework/services/generation-service'
import { guokexinProductBrief } from './product-brief'
import { guokexinTheme } from './theme'

export const guokexinGeneratedSystem = generateSystem(guokexinProductBrief, guokexinTheme)
export const guokexinInformationArchitecture = guokexinGeneratedSystem.informationArchitecture
export const guokexinSystemLayout = guokexinGeneratedSystem.systemLayout
export const guokexinPageSpecs = guokexinGeneratedSystem.pageSpecs
