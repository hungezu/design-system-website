// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { NewProject } from './NewProject'
import { Projects } from './Projects'
import { useAccess } from '../app/access-context'
import { api } from '../services/workspace-api'
import { getProject, guokexinProject } from '../data/projects'
vi.mock('../app/access-context',()=>({useAccess:vi.fn()}))
vi.mock('../services/workspace-api',()=>({api:vi.fn()}))
vi.mock('../data/projects',async original=>({...await original<typeof import('../data/projects')>(),getProject:vi.fn()}))
beforeEach(()=>{vi.resetAllMocks();window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}});vi.mocked(useAccess).mockReturnValue({user:{platformRole:'admin'},visibleProjectIds:[],refresh:vi.fn().mockResolvedValue(undefined)} as unknown as ReturnType<typeof useAccess>)})
afterEach(cleanup)
const show=()=>render(<MemoryRouter initialEntries={['/new-project']}><Routes><Route path="new-project" element={<NewProject/>}/><Route path="projects/:projectId" element={<h1>新项目详情</h1>}/></Routes></MemoryRouter>)
it('项目列表提供新增入口，普通成员不可创建',()=>{
 const view=render(<MemoryRouter><Projects/></MemoryRouter>);expect(screen.getByRole('link',{name:'新增项目'}).getAttribute('href')).toBe('/new-project');view.unmount()
 vi.mocked(useAccess).mockReturnValue({user:{platformRole:'member'}} as unknown as ReturnType<typeof useAccess>);show();expect(screen.getByRole('heading',{name:'需要平台管理权限'})).toBeTruthy();expect(screen.queryByRole('button',{name:'创建项目'})).toBeNull()
})
it('创建成功刷新可访问项目并进入详情',async()=>{
 const project={...guokexinProject,id:'new-team',name:'新团队'};vi.mocked(api).mockResolvedValue(project);vi.mocked(getProject).mockReturnValue(project)
 show();const user=userEvent.setup();expect((screen.getByRole('button',{name:'创建项目'}) as HTMLButtonElement).disabled).toBe(true)
 await user.type(screen.getByRole('textbox',{name:/^项目名称/}),'新团队');await user.click(screen.getByText('自定义项目网址（可选）'));await user.type(screen.getByRole('textbox',{name:/^项目标识/}),'new-team');await user.click(screen.getByRole('button',{name:'创建项目'}))
 expect(await screen.findByRole('heading',{name:'新项目详情'})).toBeTruthy();expect(api).toHaveBeenCalledWith('/admin/projects',{method:'POST',body:{name:'新团队',id:'new-team',description:''}})
})
it('项目标识重复时保留输入，可修改后重试；刷新失败不重复创建',async()=>{
 vi.mocked(api).mockRejectedValueOnce(new Error('项目标识已存在。')).mockResolvedValue({...guokexinProject,id:'second-team',name:'新团队'});vi.mocked(getProject).mockReturnValue(undefined)
 show();const user=userEvent.setup();await user.type(screen.getByRole('textbox',{name:/^项目名称/}),'新团队');await user.click(screen.getByText('自定义项目网址（可选）'));await user.type(screen.getByRole('textbox',{name:/^项目标识/}),'first-team');await user.click(screen.getByRole('button',{name:'创建项目'}));expect(await screen.findByRole('alert')).toHaveProperty('textContent','项目标识已存在。');expect((screen.getByRole('textbox',{name:/^项目名称/}) as HTMLInputElement).value).toBe('新团队')
 await user.clear(screen.getByRole('textbox',{name:/^项目标识/}));await user.type(screen.getByRole('textbox',{name:/^项目标识/}),'second-team');await user.click(screen.getByRole('button',{name:'创建项目'}));expect(await screen.findByRole('heading',{name:'新团队 已创建'})).toBeTruthy();expect(screen.queryByRole('button',{name:'创建项目'})).toBeNull();await user.click(screen.getByRole('button',{name:'进入项目'}));expect(api).toHaveBeenCalledTimes(2)
})

it('只填写项目名称即可创建，标识交由服务端自动生成',async()=>{
 const project={...guokexinProject,id:'project-auto1234',name:'自动标识'}
 vi.mocked(api).mockResolvedValue(project);vi.mocked(getProject).mockReturnValue(project)
 show();const user=userEvent.setup()
 expect(screen.getByText('自定义项目网址（可选）').closest('details')?.open).toBe(false)
 await user.type(screen.getByRole('textbox',{name:/^项目名称/}),'自动标识')
 await user.click(screen.getByRole('button',{name:'创建项目'}))
 expect(api).toHaveBeenCalledWith('/admin/projects',{method:'POST',body:{name:'自动标识',description:''}})
 expect(await screen.findByRole('heading',{name:'新项目详情'})).toBeTruthy()
})
