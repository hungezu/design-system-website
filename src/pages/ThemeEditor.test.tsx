import { ApiError } from '../services/workspace-api'
// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProjectContext, type ProjectContextValue } from '../app/project-context'
import { guokexinProject } from '../data/projects'
import { baselineThemeSettings } from '../services/project-theme'
import { resolveProjectTheme } from '../services/theme-resolver'
import { ThemeEditor } from './ThemeEditor'

const projectTheme = {
  ...baselineThemeSettings,
  brandPrimary: '#165DFF',
  brandSecondary: '#E8F3FF',
  brandHover: '#4080FF',
  brandActive: '#0E42D2',
}

const contextValue: ProjectContextValue = {
  project: guokexinProject,
  theme: resolveProjectTheme(guokexinProject),
  setProjectId: vi.fn(),
  releases: [],
  release: null,
  releaseLoading: false,
  releaseError: null,
  setReleaseVersion: vi.fn(),
  publishDraft: vi.fn(),
  loadReleaseAsset: async <T,>() => '' as T,
  projectTheme,
  saveProjectTheme: vi.fn(),
  restoreProjectTheme: () => projectTheme,
}

afterEach(cleanup)

describe('ThemeEditor', () => {
  it('点击标签切换配置和预览，并保持草稿参数实时联动', async () => {
    const user = userEvent.setup()
    window.history.replaceState({}, '', '/projects/guokexin/foundations/theme?version=draft')
    render(
      <BrowserRouter>
        <ProjectContext.Provider value={contextValue}>
          <ThemeEditor />
        </ProjectContext.Provider>
      </BrowserRouter>,
    )

    const config = within(screen.getByRole('radiogroup', { name: '配置分类' }))
    const preview = within(screen.getByRole('radiogroup', { name: '预览范围' }))
    await user.click(preview.getByText('完整页面'))
    expect(document.querySelector('.theme-system-preview--page')).not.toBeNull()

    fireEvent.change(screen.getByRole('textbox', { name: '品牌主色色值' }), { target: { value: '#167C52' } })
    const previewRoot = () => document.querySelector<HTMLElement>('.theme-system-preview')!
    expect(previewRoot().style.getPropertyValue('--brand-primary')).toBe('#167C52')
    expect(previewRoot().style.getPropertyValue('--button-brand-filled-bg-default')).toBe('#167C52')

    await user.click(config.getByText('色彩'))
    expect(screen.getByRole('heading', { name: '品牌色阶' })).not.toBeNull()

    await user.click(config.getByText('尺寸外观'))
    fireEvent.change(screen.getByRole('slider', { name: /^圆角/ }), { target: { value: '8' } })
    fireEvent.change(screen.getByRole('slider', { name: /^控件高度/ }), { target: { value: '40' } })
    expect(previewRoot().style.getPropertyValue('--radius-control')).toBe('8px')
    expect(previewRoot().style.getPropertyValue('--control-height-md')).toBe('40px')

    await user.click(preview.getByText('组件'))
    expect(document.querySelector('.theme-system-preview--components')).not.toBeNull()
    expect(previewRoot().style.getPropertyValue('--brand-primary')).toBe('#167C52')
    expect(previewRoot().style.getPropertyValue('--radius-control')).toBe('8px')
    expect(document.querySelector('[data-theme-unsaved="true"]')).not.toBeNull()

    await user.click(screen.getByRole('button', { name: '撤销本次修改' }))
    expect(previewRoot().style.getPropertyValue('--brand-primary')).toBe(projectTheme.brandPrimary)
    expect(document.querySelector('[data-theme-unsaved="true"]')).toBeNull()
  })
})

function showEditor(overrides:Partial<ProjectContextValue>={}) {
 window.history.replaceState({}, '', '/projects/guokexin/foundations/theme?version=draft')
 return render(<BrowserRouter><ProjectContext.Provider value={{...contextValue,...overrides}}><ThemeEditor/></ProjectContext.Provider></BrowserRouter>)
}
const styleValue=(name:string)=>document.querySelector<HTMLElement>('.theme-system-preview')!.style.getPropertyValue(name)
it('不完整色值保留编辑，预览继续使用有效配置，并阻止保存',()=>{
 showEditor()
 fireEvent.change(screen.getByRole('textbox',{name:'品牌主色色值'}),{target:{value:'#12'}})
 expect(styleValue('--brand-primary')).toBe('#165DFF')
 expect((screen.getByRole('button',{name:'保存主题'}) as HTMLButtonElement).disabled).toBe(true)
 expect(screen.getByRole('alert').textContent).toContain('品牌主色')
})
it('密度联动间距和高度，自定义外观不会仍标为原预设；支持对比',async()=>{
 showEditor();const user=userEvent.setup()
 await user.click(screen.getByRole('button',{name:/信息密度/}));await user.click(screen.getByRole('option',{name:'宽松'}))
 expect(styleValue('--control-height-md')).toBe('36px');expect(styleValue('--preview-gap')).toBe('18px')
 expect(screen.getByText(/已自定义外观/)).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'对比已保存主题'}));expect(styleValue('--control-height-md')).toBe('32px')
 await user.click(screen.getByRole('button',{name:'返回当前编辑效果'}));expect(styleValue('--control-height-md')).toBe('36px')
})
it('深浅模式往返保留本次编辑的自定义表面色',async()=>{
 showEditor();const user=userEvent.setup();const config=within(screen.getByRole('radiogroup',{name:'配置分类'}))
 await user.click(config.getByText('色彩'));await user.click(screen.getByText('高级色值覆盖'))
 fireEvent.change(screen.getByRole('textbox',{name:'内容背景色值'}),{target:{value:'#FEFEFD'}})
 await user.click(config.getByText('基础'));await user.click(screen.getByRole('button',{name:/主题模式/}));await user.click(screen.getByRole('option',{name:'深色'}))
 expect(styleValue('--surface-primary')).not.toBe('#FEFEFD')
 await user.click(screen.getByRole('button',{name:/主题模式/}));await user.click(screen.getByRole('option',{name:'浅色'}))
 expect(styleValue('--surface-primary')).toBe('#FEFEFD')
})
it('主按钮背景和文字图标颜色可独立预览、校验并保存',async()=>{
 const save=vi.fn(async()=>{});showEditor({saveProjectTheme:save});const user=userEvent.setup();const config=within(screen.getByRole('radiogroup',{name:'配置分类'}))
 await user.click(config.getByText('色彩'));await user.click(screen.getByText('高级色值覆盖'))
 await user.click(screen.getByRole('checkbox',{name:'单独设置主按钮颜色'}))
 fireEvent.change(screen.getByRole('textbox',{name:'主按钮背景色值'}),{target:{value:'#FFFFFF'}})
 fireEvent.change(screen.getByRole('textbox',{name:'主按钮文字与图标色值'}),{target:{value:'#FFFFFF'}})
 expect(screen.getByRole('alert').textContent).toContain('对比度')
 expect((screen.getByRole('button',{name:'保存主题'}) as HTMLButtonElement).disabled).toBe(true)
 fireEvent.change(screen.getByRole('textbox',{name:'主按钮背景色值'}),{target:{value:'#112233'}})
 expect(styleValue('--button-brand-filled-bg-default')).toBe('#112233')
 expect(styleValue('--button-brand-filled-text-default')).toBe('#FFFFFF')
 await user.click(screen.getByRole('button',{name:'保存主题'}))
 expect(save).toHaveBeenCalledWith(expect.objectContaining({buttonPrimaryBackground:'#112233',buttonPrimaryText:'#FFFFFF'}))
})
it('保存期间锁定编辑，成功后清除未保存标记',async()=>{
 let finish:()=>void=()=>{};const save=vi.fn(()=>new Promise<void>(resolve=>{finish=resolve}))
 showEditor({saveProjectTheme:save});const user=userEvent.setup()
 fireEvent.change(screen.getByRole('textbox',{name:'品牌主色色值'}),{target:{value:'#112233'}})
 await user.click(screen.getByRole('button',{name:'保存主题'}))
 expect(screen.getByRole('textbox',{name:'品牌主色色值'}).matches(':disabled')).toBe(true)
 await act(async()=>finish());expect(document.querySelector('[data-theme-unsaved="true"]')).toBeNull();expect(save).toHaveBeenCalledTimes(1)
})
it('保存冲突保留草稿，明确放弃后才读取新版本',async()=>{
 const reload=vi.fn(async()=>({...projectTheme,brandPrimary:'#334455'}))
 showEditor({saveProjectTheme:vi.fn().mockRejectedValue(new ApiError('主题已被其他成员更新。',409)),reloadProjectTheme:reload});const user=userEvent.setup()
 fireEvent.change(screen.getByRole('textbox',{name:'品牌主色色值'}),{target:{value:'#112233'}})
 await user.click(screen.getByRole('button',{name:'保存主题'}))
 expect(await screen.findByRole('button',{name:'放弃修改并读取最新主题'})).toBeTruthy();expect(styleValue('--brand-primary')).toBe('#112233');expect(reload).not.toHaveBeenCalled()
 await user.click(screen.getByRole('button',{name:'放弃修改并读取最新主题'}));expect(styleValue('--brand-primary')).toBe('#334455');expect(document.querySelector('[data-theme-unsaved="true"]')).toBeNull()
})

it('表格圆角独立预览、保存，支持零圆角且不改变控件圆角', async () => {
 const save = vi.fn(async () => {})
 showEditor({saveProjectTheme:save})
 const user=userEvent.setup()
 await user.click(within(screen.getByRole('radiogroup',{name:'配置分类'})).getByText('尺寸外观'))
 fireEvent.change(screen.getByRole('slider',{name:/^表格圆角/}),{target:{value:'12'}})
 expect(styleValue('--radius-table')).toBe('12px')
 expect(styleValue('--radius-control')).toBe('4px')
 fireEvent.change(screen.getByRole('slider',{name:/^表格圆角/}),{target:{value:'0'}})
 expect(styleValue('--radius-table')).toBe('0px')
 await user.click(screen.getByRole('button',{name:'保存主题'}))
 expect(save).toHaveBeenCalledWith(expect.objectContaining({tableRadius:0,radius:4}))
})

it('分层尺寸可覆盖、随密度保留并恢复跟随，保存携带输入模型',async()=>{
 const save=vi.fn().mockResolvedValue(undefined);showEditor({saveProjectTheme:save});const user=userEvent.setup()
 const config=within(screen.getByRole('radiogroup',{name:'配置分类'}))
 await user.click(config.getByText('尺寸外观'));await user.click(screen.getByRole('button',{name:'启用分层调节'}))
 await user.click(screen.getByText('控件内边距',{exact:true}))
 fireEvent.change(screen.getByRole('spinbutton',{name:'输入框左右内边距'}),{target:{value:'18'}})
 expect(styleValue('--input-padding-inline')).toBe('18px')
 await user.click(config.getByText('基础'));await user.click(screen.getByRole('button',{name:/信息密度/}));await user.click(screen.getByRole('option',{name:'宽松'}))
 expect(styleValue('--input-padding-inline')).toBe('18px');expect(styleValue('--control-height-md')).toBe('36px')
 await user.click(config.getByText('尺寸外观'));await user.click(screen.getByText('控件内边距',{exact:true}));await user.click(screen.getByRole('button',{name:'恢复跟随：输入框左右内边距'}))
 expect(styleValue('--input-padding-inline')).toBe('12px')
 await user.click(screen.getByRole('button',{name:'保存主题'}))
 expect(save.mock.calls[0][0].sizing).toEqual({version:1,overrides:{}})
})
