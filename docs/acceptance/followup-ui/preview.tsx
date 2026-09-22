import {useState} from 'react'
import {createRoot} from 'react-dom/client'
import {RuntimeExample} from '../../../src/components/RuntimeExample'
import {AccessTableScroll} from '../../../src/components/AccessTableScroll'
import {PreviewScope} from '../../../src/design-system/theme/PreviewScope'
import {baselineThemeSettings,projectPreviewVariables} from '../../../src/services/project-theme'
import {DSButton} from '../../../src/runtime'
import '../../../src/styles/index.css'
import '../../../src/pages/Components.css'
import '../../../src/pages/Access.css'
function App(){const [width,setWidth]=useState(1100);return <PreviewScope vars={projectPreviewVariables({...baselineThemeSettings,brandPrimary:'#457EED'})}><main style={{padding:16}}><DSButton onClick={()=>setWidth(1100)}>宽容器</DSButton><DSButton onClick={()=>setWidth(400)}>窄容器</DSButton><DSButton variant="primary">白字按钮</DSButton><section style={{width,maxWidth:'100%',marginTop:16}}><RuntimeExample id="table" demoVariant="selection"/><AccessTableScroll><table className="access-table"><thead><tr><th>姓名</th><th>操作</th></tr></thead><tbody><tr><td>示例</td><td><DSButton variant="tertiary">查看</DSButton></td></tr></tbody></table></AccessTableScroll></section></main></PreviewScope>}
createRoot(document.getElementById('root')!).render(<App/> )
