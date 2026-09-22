import { createRoot } from 'react-dom/client'
import { ResourceManagerDemo } from '../../../src/pages/Components'
import { RuntimeExample } from '../../../src/components/RuntimeExample'
import { ResourceWorkflow } from '../../../src/examples/ResourceWorkflow'
import { PreviewScope } from '../../../src/design-system/theme/PreviewScope'
import { baselineThemeSettings, defaultProjectTheme, previewVariablesFromTheme, resolvePreviewTheme } from '../../../src/services/project-theme'
import { guokexinProject } from '../../../src/data/projects'
import '../../../src/styles/index.css'
const project = new URLSearchParams(location.search).has('project')
const settings = {...(project ? defaultProjectTheme(guokexinProject) : baselineThemeSettings), tableRadius: Number(new URLSearchParams(location.search).get('radius') ?? 6)}
const vars = previewVariablesFromTheme(resolvePreviewTheme(settings), settings)
createRoot(document.getElementById('root')!).render(<PreviewScope vars={vars}><main style={{padding:16,display:'grid',gap:24,minWidth:0}}><h1>{project?'项目':'公共'}表格同步验收</h1><section style={{minWidth:0}} aria-label="组件预览"><RuntimeExample id="table" demoVariant="selection" /></section><section style={{minWidth:0}} aria-label="管理示例"><ResourceManagerDemo /></section><section style={{minWidth:0}} aria-label="列表模板"><ResourceWorkflow bulk /></section></main></PreviewScope>)
