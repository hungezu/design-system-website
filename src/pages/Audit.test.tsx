// @vitest-environment jsdom
import {cleanup,render,screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {MemoryRouter} from 'react-router-dom'
import {afterEach,expect,it,vi} from 'vitest'
import {Audit} from './Audit'
import {baselineThemeSettings,projectPreviewVariables,resolvePreviewTheme} from '../services/project-theme'
vi.mock('../app/project-context',()=>({useProject:()=>({project:{id:'test',name:'Test',componentIds:['button','input']},projectTheme:baselineThemeSettings,theme:resolvePreviewTheme(baselineThemeSettings)})}))
vi.mock('../services/use-frozen-theme',()=>({useFrozenTheme:()=>({style:projectPreviewVariables(baselineThemeSettings),componentIds:['button'],error:null})}))
afterEach(cleanup)
it('frozen checks use the frozen component list and edited input invalidates old results',async()=>{
 const user=userEvent.setup()
 render(<MemoryRouter initialEntries={['/audit?version=1.0.0']}><Audit/></MemoryRouter>)
 await user.type(screen.getByRole('textbox'),'<DSInput />')
 await user.click(screen.getByRole('button',{name:'执行本地规则检查'}))
 expect(screen.getByRole('region',{name:'规则检查结果'}).textContent).toContain('未被当前项目显式启用')
 await user.clear(screen.getByRole('textbox'))
 expect(screen.queryByRole('region',{name:'规则检查结果'})).toBeNull()
 await user.click(screen.getByRole('button',{name:'执行本地规则检查'}))
 expect(screen.getByRole('region',{name:'规则检查结果'}).textContent).toContain('2 项通过')
})
