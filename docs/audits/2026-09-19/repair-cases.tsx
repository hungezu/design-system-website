import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { DSButton, DSInput, DSSelect, DSDialog, DSDrawer, DSLoading } from '../../../src/runtime'
import { PreviewScope } from '../../../src/design-system/theme/PreviewScope'
import { baselineThemeSettings, defaultProjectTheme, projectPreviewVariables, PROJECT_THEME_MODE_VALUES } from '../../../src/services/project-theme'
import { guokexinProject } from '../../../src/data/projects/guokexin'
import { testCustomerBProject } from '../../../src/data/projects/test-customer-b'
import '../../../src/design-system/tokens.css'
import '../../../src/styles/index.css'
const options = [{ value: 'one', label: '已选择资源' }, { value: 'two', label: '另一个资源' }]
export function Cases() {
  const [theme, setTheme] = useState(defaultProjectTheme(guokexinProject))
  const [dialog, setDialog] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [value, setValue] = useState('one')
  const changeTheme = () => setTheme(theme.brandPrimary === guokexinProject.brandPrimary ? defaultProjectTheme(testCustomerBProject) : defaultProjectTheme(guokexinProject))
  return <main style={{ padding:24 }}><h1>样式修复回归案例</h1><p>使用正式 DS 控件，不保存项目配置。</p>
    {[['公共', baselineThemeSettings], ['深色', { ...baselineThemeSettings, mode:'dark', ...PROJECT_THEME_MODE_VALUES.dark }], ['客户 B', defaultProjectTheme(testCustomerBProject)], ['18px 字体', { ...baselineThemeSettings, bodySize:18 }]].map(([name, settings]) => <PreviewScope key={String(name)} vars={projectPreviewVariables(settings as typeof theme)}><section data-case={String(name)} style={{padding:16,marginBlock:16,background:'var(--surface-primary)',color:'var(--text-primary)',fontFamily:'var(--preview-font-family)',fontSize:'var(--preview-body-size)'}}><h2>{String(name)}</h2><DSButton variant="primary">主要按钮</DSButton><DSButton variant="secondary">次要按钮</DSButton><DSInput label={`${name}输入`} placeholder="输入内容"/><DSSelect label={`${name}选择`} options={options} placeholder="请选择"/></section></PreviewScope>)}
    <section><h2>加载尺寸</h2>{(['sm','md','lg'] as const).map(size=><DSLoading key={size} size={size} label={size}/>)}</section>
    <PreviewScope vars={projectPreviewVariables(theme)}><section><h2>浮层、主题更新与清空</h2><DSButton onClick={()=>setDialog(true)}>打开主题弹窗</DSButton><DSButton onClick={()=>setDrawer(true)}>打开窄屏抽屉</DSButton>
      <DSSelect label="可清空资源" options={options} value={value} onChange={setValue} clearable/>
      <DSSelect label="必填资源" options={options} defaultValue="one" clearable required/>
      <DSSelect label="只读资源" options={options} defaultValue="one" clearable readOnly/>
      <DSDialog open={dialog} onOpenChange={setDialog} title="主题传递" footer={<DSButton variant="primary">保存资源</DSButton>}><DSButton onClick={changeTheme}>切换浮层主题</DSButton><DSSelect label="弹窗资源" options={options} defaultValue="one"/><DSInput label="名称" invalid errorMessage="请检查名称"/></DSDialog>
      <DSDrawer open={drawer} onOpenChange={setDrawer} title="资源详情与长标题" footer={<><DSButton onClick={()=>setDrawer(false)}>取消</DSButton><DSButton variant="primary">保存</DSButton></>}><p>抽屉包含表单、长中文说明及按钮组，需要在窄屏保持可读。</p><DSInput label="资源名称" placeholder="请输入资源名称"/><DSSelect label="资源类型" options={options}/></DSDrawer>
    </section></PreviewScope>
  </main>
}
createRoot(document.getElementById('root')!).render(<Cases/> )
