/** Business consumption: shared controls and theme scope, without demo workflows. */
import '@fontsource-variable/noto-sans-sc'
import '../design-system/tokens.css'
import identity from '../data/generated/runtime-build.json'
export * from '../runtime'
export { PreviewScope } from '../design-system/theme/PreviewScope'
export const RUNTIME_BUILD_ID = identity.buildId
