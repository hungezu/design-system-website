import {createRoot} from 'react-dom/client'
import * as DS from '../../../src/runtime'
import {guokexinProject} from '../../../src/data/projects'
import {defaultProjectTheme,releasePreviewVariables} from '../../../src/services/project-theme'
import {createReleaseSnapshot,validateSnapshot} from '../../../src/services/release-snapshot'
import {PreviewScope} from '../../../src/design-system/theme/PreviewScope'
import {ResourceWorkflow} from '../../../src/examples'
import '../../../src/design-system/tokens.css'
const snapshot=createReleaseSnapshot({project:guokexinProject,theme:defaultProjectTheme(guokexinProject),version:'0.0.0-test',status:'candidate'})
validateSnapshot(snapshot)
const css=String(snapshot.assets['tokens.css']).replace(/:root,\s*/g,'')
createRoot(document.getElementById('root')!).render(<main><h1>新冻结快照验收</h1><p>临时构造，不保存本地版本。</p><DS.DesignSystemProvider manifest={snapshot.assets['manifest.json'] as Parameters<typeof DS.DesignSystemProvider>[0]['manifest']} tokens={css} icons={JSON.stringify(snapshot.assets['icons.json'])}><PreviewScope vars={releasePreviewVariables(css)}><DS.DSButton variant="primary">冻结按钮</DS.DSButton><ResourceWorkflow/></PreviewScope></DS.DesignSystemProvider></main>)
