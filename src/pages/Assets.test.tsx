// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Assets } from './Assets'
import { AssetDetail } from './AssetDetail'
import { ProjectContext, type ProjectContextValue } from '../app/project-context'
import { guokexinProject } from '../data/projects/guokexin'
import { resolveProjectTheme } from '../services/theme-resolver'
import { defaultProjectTheme } from '../services/project-theme'
import { semanticTokens } from '../data/global/semantic-tokens'
import { useFrozenTheme } from '../services/use-frozen-theme'
import { useFoundationSnapshot } from '../services/use-foundation-snapshot'
vi.mock('../app/access-context',()=>({useAccess:()=>({projectRole:()=> 'project-admin'})}))
vi.mock('../services/use-frozen-theme',()=>({useFrozenTheme:vi.fn()}))
vi.mock('../services/use-foundation-snapshot',()=>({useFoundationSnapshot:vi.fn()}))
const theme=resolveProjectTheme(guokexinProject)
const context:ProjectContextValue={project:guokexinProject,theme,projectTheme:defaultProjectTheme(guokexinProject),release:null,releases:[],releaseLoading:false,releaseError:null,setProjectId(){},setReleaseVersion(){},saveProjectTheme(){},restoreProjectTheme:()=>defaultProjectTheme(guokexinProject),loadReleaseAsset:async<T,>()=>({}) as T,publishDraft:vi.fn()}
function Location(){const value=useLocation();return <output data-testid="location">{value.pathname+value.search+value.hash}</output>}
function show(path='/assets'){render(<MemoryRouter initialEntries={[path]}><ProjectContext.Provider value={context}><Routes><Route path="/assets" element={<Assets/>}/><Route path="/assets/:assetId" element={<AssetDetail/>}/><Route path="/projects/:projectId/foundations" element={<Assets scope="project"/>}/><Route path="/projects/:projectId/foundations/:assetId" element={<AssetDetail scope="project"/>}/></Routes><Location/></ProjectContext.Provider></MemoryRouter>)}
beforeEach(()=>{
 vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}})
 Element.prototype.scrollIntoView=vi.fn()
 window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}})
 vi.mocked(useFrozenTheme).mockReturnValue({supportsTableComposition:false,css:undefined,theme:null,style:null,componentIds:null,error:null,loading:false})
 vi.mocked(useFoundationSnapshot).mockReturnValue({palette:{},iconIds:[],loading:false,error:undefined})
})
afterEach(cleanup)
it('默认展示所有基础变量与完整色阶，没有全部分类或无效排序',()=>{
 show()
 expect(screen.queryByRole('button',{name:/^全部$/})).toBeNull()
 expect(screen.getByRole('button',{name:'设计变量'}).getAttribute('aria-pressed')).toBe('true')
 expect(document.querySelectorAll('[id^="token-"]')).toHaveLength(semanticTokens.length)
 expect(document.querySelectorAll('.foundation-color')).toHaveLength(78)
 expect(screen.getByRole('heading',{name:'动效'})).toBeTruthy()
 expect(screen.queryByRole('button',{name:/资源排序/})).toBeNull()
 expect(screen.queryByRole('link',{name:/品牌主色 brand-primary/})).toBeNull()
})
it('按变量 ID 搜索仍展示当前值和用途，清除不丢失分类或版本',async()=>{
 const user=userEvent.setup();show('/projects/guokexin/foundations?category=token&version=draft')
 await user.type(screen.getByRole('textbox',{name:'搜索设计基础'}),'motion-duration-fast')
 expect(document.querySelectorAll('.foundation-token-row')).toHaveLength(1)
 expect(screen.getByText('120ms')).toBeTruthy()
 await user.click(screen.getByRole('button',{name:'清除搜索'}))
 expect(screen.getByTestId('location').textContent).toContain('version=draft')
 expect(screen.getByTestId('location').textContent).toContain('category=token')
 expect(document.querySelectorAll('[id^="token-"]')).toHaveLength(semanticTokens.length)
})
it('旧全部链接回到变量视图，普通变量内页定位到列表并保留项目版本',async()=>{
 show('/projects/guokexin/foundations/brand-secondary?category=all&version=draft')
 await screen.findByRole('heading',{name:'项目设计规范'})
 await waitFor(()=>expect(screen.getByTestId('location').textContent).toContain('category=token'))
 expect(screen.getByTestId('location').textContent).toContain('version=draft')
 expect(screen.getByTestId('location').textContent).toContain('#token-brand-secondary')
 expect(document.getElementById('token-brand-secondary')).toBeTruthy()
})
it('历史页显示冻结值与已捕获色阶，不用当前项目值补造色盘',()=>{
 vi.mocked(useFrozenTheme).mockReturnValue({supportsTableComposition:false,css:'--brand-primary: #112233;',theme:{...theme,values:{...theme.values,'brand-primary':'#112233'},sources:{...theme.sources,'brand-primary':'release'}},style:{},componentIds:[],loading:false,error:null})
 vi.mocked(useFoundationSnapshot).mockReturnValue({palette:{'color-brand-1':'#F1F2F3','color-brand-2':'#AABBCC'},iconIds:[],loading:false,error:undefined})
 show('/projects/guokexin/foundations?category=token&version=1.5.5')
 expect(document.getElementById('token-brand-primary')?.textContent).toContain('#112233')
 expect(document.getElementById('token-brand-primary')?.textContent).not.toContain('#165DFF')
 expect(document.querySelectorAll('.foundation-color')).toHaveLength(2)
 expect(screen.queryByRole('link',{name:'主题与风格'})).toBeNull()
})
it('冻结读取失败不回落草稿，图标搜索仍保留真实图形视图',async()=>{
 vi.mocked(useFrozenTheme).mockReturnValue({supportsTableComposition:false,css:undefined,theme:null,style:null,componentIds:null,loading:false,error:'读取失败'})
 show('/projects/guokexin/foundations?version=1.5.5')
 expect(screen.getByRole('alert').textContent).toContain('读取失败')
 expect(document.querySelectorAll('[id^="token-"]')).toHaveLength(0)
 cleanup();const user=userEvent.setup();show('/assets?category=icon')
 await user.type(screen.getByRole('textbox',{name:'搜索设计基础'}),'chevron')
 expect(document.querySelector('.icon-grid svg')).toBeTruthy()
 expect(document.querySelector('.asset-grid')).toBeNull()
})
it('旧版色盘没有 CSS 变量时复制真实色值，不生成不存在的 var 引用',async()=>{
 const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue()
 vi.mocked(useFrozenTheme).mockReturnValue({supportsTableComposition:false,css:'--brand-primary: #112233;',theme:{...theme,values:{...theme.values,'brand-primary':'#112233'},sources:{...theme.sources,'brand-primary':'release'}},style:{},componentIds:[],loading:false,error:null})
 vi.mocked(useFoundationSnapshot).mockReturnValue({palette:{'color-brand-1':'#F1F2F3'},iconIds:[],loading:false,error:undefined})
 show('/projects/guokexin/foundations?version=1.5.5')
 await user.click(screen.getByRole('button',{name:'复制品牌色 1色值 #F1F2F3'}))
 expect(write).toHaveBeenCalledWith('#F1F2F3')
 write.mockRestore()
})
