import '@fontsource-variable/noto-sans-sc'
import '../design-system/tokens.css'
import identity from '../data/generated/runtime-build.json'
export * from '../runtime'
export * from '../examples'
export { PreviewScope, ScopedPopover } from '../design-system/theme/PreviewScope'
export { projectPreviewVariables, baselineThemeSettings, releasePreviewVariables } from '../services/project-theme'
export const RUNTIME_BUILD_ID=identity.buildId
