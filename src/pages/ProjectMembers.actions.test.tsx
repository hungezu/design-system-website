// @vitest-environment jsdom
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach,beforeEach,expect,it,vi} from 'vitest'
import {MemoryRouter,Route,Routes} from 'react-router-dom'
import {ProjectMembers} from './ProjectMembers'
import {api} from '../services/workspace-api'
vi.mock('../app/access-context',()=>({useAccess:()=>({user:{id:'admin'},refresh:async()=>{}})}))
vi.mock('../app/project-context',()=>({useProject:()=>({project:{name:'样式验收'}})}))
vi.mock('../services/workspace-api',()=>({api:vi.fn()}))
beforeEach(()=>{
 vi.resetAllMocks();vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}})
 window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}})
 vi.mocked(api).mockImplementation(async path=>path.endsWith('/members')?[{id:'member',name:'测试成员',email:'member@example.test',profession:'design',platformRole:'member',status:'active',role:'viewer'}]:[])
})
afterEach(cleanup)
it('成员行使用相同平台文字按钮，未修改角色时保留禁用状态',async()=>{
 render(<MemoryRouter initialEntries={['/projects/test/members']}><Routes><Route path="/projects/:projectId/members" element={<ProjectMembers/>}/></Routes></MemoryRouter>)
 const remove=await screen.findByRole('button',{name:'移除'}),save=screen.getByRole('button',{name:'保存角色'})
 for(const button of [remove,save]){expect(button.classList.contains('app-text-action')).toBe(true);expect(button.getAttribute('data-appearance')).toBe('ghost');expect(button.getAttribute('data-tone')).toBe('neutral')}
 expect((save as HTMLButtonElement).disabled).toBe(true)
 const user=userEvent.setup();await user.click(screen.getByRole('button',{name:/测试成员的项目角色/}));await user.click(screen.getByRole('option',{name:'编辑者'}))
 expect((screen.getByRole('button',{name:'保存角色'}) as HTMLButtonElement).disabled).toBe(false)
 expect(api).toHaveBeenCalledTimes(3) // Reading/changing the local select must not write membership.
})
