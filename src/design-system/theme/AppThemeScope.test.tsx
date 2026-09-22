// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppThemeScope, appThemeVariables } from './AppThemeScope'
import { PreviewScope } from './PreviewScope'
import { AppSelect } from '../../components/AppSelect'
import { DSSelect } from '../primitives/Select'
import { DSButton } from '../primitives/Button'
import { baselineThemeSettings, projectPreviewVariables } from '../../services/project-theme'
// Vitest stubs CSS modules; keep the raw-token input identical to Vite's browser import.
vi.mock('../../styles/app-tokens.css?raw', async () => ({ default: (await import('node:fs')).readFileSync('src/styles/app-tokens.css', 'utf8') }))
beforeEach(()=>{vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}})})
afterEach(cleanup)
it('平台语义、组件配方和 Runtime 别名统一读取 App Token',()=>{
 expect(appThemeVariables['--brand-primary']).toBe(appThemeVariables['--app-accent'])
 expect(appThemeVariables['--button-brand-filled-bg-default']).toBe(appThemeVariables['--app-accent'])
 expect(appThemeVariables['--bds-btn-primary-bg']).toBe(appThemeVariables['--app-accent'])
 expect(appThemeVariables['--bds-selection-bg']).toBe(appThemeVariables['--app-accent-subtle'])
})
it('平台与项目的下拉弹层分别继承所属主题，关闭后不污染其他控件',async()=>{
 const user=userEvent.setup(); const projectVars=projectPreviewVariables({...baselineThemeSettings,brandPrimary:'#165DFF',brandSecondary:'#E8F0FF'})
 render(<AppThemeScope><DSButton variant="primary">平台操作</DSButton><AppSelect aria-label="平台选择" defaultValue="a"><option value="a">平台选项</option></AppSelect><PreviewScope vars={projectVars} inspectionId="project-test"><DSSelect label="项目选择" value="b" options={[{value:'b',label:'项目选项'}]}/></PreviewScope></AppThemeScope>)
 await user.click(screen.getByRole('button',{name:/平台选择/}))
 const appPopup=screen.getByRole('option',{name:'平台选项'}).closest('.app-select__popover') as HTMLElement
 expect(appPopup.style.getPropertyValue('--bds-btn-primary-bg')).toBe(appThemeVariables['--app-accent'])
 await user.keyboard('{Escape}');await user.click(screen.getByRole('button',{name:/项目选择/}))
 const projectPopup=screen.getByRole('option',{name:'项目选项'}).closest('.owned-select__popover') as HTMLElement
 expect(projectPopup.style.getPropertyValue('--bds-btn-primary-bg')).toBe('#165DFF')
 expect(projectPopup.style.getPropertyValue('--bds-selection-bg')).toBe('#E8F0FF')
 await user.keyboard('{Escape}')
 expect((screen.getByText('平台操作').closest('[data-preview-owner="platform-ui"]') as HTMLElement).style.getPropertyValue('--brand-primary')).toBe(appThemeVariables['--app-accent'])
})
