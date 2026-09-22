// @vitest-environment jsdom
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach,beforeAll,expect,it,vi} from 'vitest'
import {MemoryRouter,Route,Routes,useNavigate} from 'react-router-dom'
import {AccessProvider} from '../app/access-context'
import {ProjectContext,type ProjectContextValue} from '../app/project-context'
import {guokexinProject} from '../data/projects'
import {defaultProjectTheme} from '../services/project-theme'
import {resolveProjectTheme} from '../services/theme-resolver'
import {createReleaseSnapshot} from '../services/release-snapshot'
import type {LocalReleaseSnapshot,ReleaseAssetName} from '../services/release-catalog'
import {Components} from './Components'
vi.mock('../services/workspace-api',async importOriginal=>{
 const actual=await importOriginal<typeof import('../services/workspace-api')>()
 const {guokexinProject}=await import('../data/projects')
 return {...actual,api:vi.fn(async()=>({user:{id:'test-admin',email:'test@example.invalid',name:'测试管理员',profession:'other',platformRole:'admin',status:'active'},memberships:[],projects:[guokexinProject]}))}
})
beforeAll(()=>{vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({user:{id:'test-admin',email:'admin@example.test',name:'测试管理员',profession:'other',platformRole:'admin',status:'active'},memberships:[],projects:[guokexinProject]}),{headers:{'Content-Type':'application/json'}})));vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}})})
afterEach(cleanup)
const base=defaultProjectTheme(guokexinProject)
const first=createReleaseSnapshot({project:guokexinProject,theme:{...base,brandPrimary:'#112233'},version:'1.6.0'})
const second=createReleaseSnapshot({project:guokexinProject,theme:{...base,brandPrimary:'#445566'},version:'1.7.0'})
function Fixture({snapshot}:{snapshot:LocalReleaseSnapshot}){
 const navigate=useNavigate()
 const context:ProjectContextValue={project:guokexinProject,theme:resolveProjectTheme(guokexinProject),projectTheme:base,releases:[first.entry,second.entry],release:snapshot.entry,releaseLoading:false,releaseError:null,setProjectId(){},setReleaseVersion(){},saveProjectTheme(){},restoreProjectTheme:()=>base,publishDraft:async()=>snapshot.entry,loadReleaseAsset:async<T,>(name:ReleaseAssetName)=>snapshot.assets[name] as T}
 return <ProjectContext.Provider value={context}><button onClick={()=>navigate('?version=1.7.0')}>切换到新版本</button><Components/></ProjectContext.Provider>
}
const tree=(snapshot:LocalReleaseSnapshot)=><MemoryRouter initialEntries={['/projects/guokexin/components/button?version=1.6.0']}><AccessProvider><Routes><Route path="/projects/:projectId/components/:componentId" element={<Fixture snapshot={snapshot}/>}/></Routes></AccessProvider></MemoryRouter>
it('URL 已切换而上下文尚未更新时不显示旧冻结值或草稿',async()=>{
 const user=userEvent.setup();const {rerender}=render(tree(first));await screen.findByRole('button',{name:'确定'});expect((document.querySelector('[data-preview-owner="component-primary-preview"]') as HTMLElement).style.getPropertyValue('--brand-primary')).toBe('#112233')
 await user.click(screen.getByRole('button',{name:'切换到新版本'}));expect(screen.getByText('正在读取冻结版本 1.7.0…')).toBeTruthy();expect(document.querySelector('[data-preview-owner="component-primary-preview"]')).toBeNull()
 rerender(tree(second));await screen.findByRole('button',{name:'确定'});expect((document.querySelector('[data-preview-owner="component-primary-preview"]') as HTMLElement).style.getPropertyValue('--brand-primary')).toBe('#445566')
})
