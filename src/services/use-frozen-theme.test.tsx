// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { MemoryRouter, useNavigate, useSearchParams } from 'react-router-dom'
import { ProjectContext, type ProjectContextValue } from '../app/project-context'
import { guokexinProject } from '../data/projects/guokexin'
import { defaultProjectTheme } from './project-theme'
import { resolveProjectTheme } from './theme-resolver'
import { useFrozenTheme } from './use-frozen-theme'
import type { ReleaseCatalogEntry } from './release-catalog'
afterEach(cleanup)
const entries = ['1.5.5','1.5.4'].map(version => ({version,projectId:guokexinProject.releaseProjectId,dir:`guokexin/${version}`} as ReleaseCatalogEntry))
function Probe() {
  const frozen = useFrozenTheme(true)
  const navigate = useNavigate()
  return <><button onClick={()=>navigate('?version=1.5.4')}>切换版本</button><output>{frozen.error ?? frozen.theme?.values['brand-primary'] ?? '正在读取'}</output></>
}
function Harness({loaders}:{loaders:Record<string,()=>Promise<string>>}) {
  const [params] = useSearchParams()
  const version=params.get('version')!
  const context = {
    project:guokexinProject,theme:resolveProjectTheme(guokexinProject),projectTheme:defaultProjectTheme(guokexinProject),
    releases:entries,release:entries.find(entry=>entry.version===version)!,releaseLoading:false,releaseError:null,
    loadReleaseAsset:async<T,>(name:string)=>name==='manifest.json'?{projectId:guokexinProject.releaseProjectId,releaseVersion:version,availableComponents:[]} as T:await loaders[version]() as T,setProjectId:vi.fn(),setReleaseVersion:vi.fn(),saveProjectTheme:vi.fn(),restoreProjectTheme:()=>defaultProjectTheme(guokexinProject),publishDraft:vi.fn(),
  } as ProjectContextValue
  return <ProjectContext.Provider value={context}><Probe/></ProjectContext.Provider>
}
it('冻结读取失败显示错误，不回退当前草稿', async()=>{
  render(<MemoryRouter initialEntries={['/?version=1.5.5']}><Harness loaders={{'1.5.5':()=>Promise.reject(new Error('读取失败'))}}/></MemoryRouter>)
  expect(await screen.findByText('读取失败')).toBeTruthy()
  expect(screen.queryByText(guokexinProject.brandPrimary)).toBeNull()
})
it('版本切换后晚返回的旧请求不会覆盖新版本', async()=>{
  let finishOld!:(css:string)=>void
  const old=new Promise<string>(resolve=>{finishOld=resolve})
  const loaders={'1.5.5':()=>old,'1.5.4':()=>Promise.resolve('--bds-brand: #123456;')}
  render(<MemoryRouter initialEntries={['/?version=1.5.5']}><Harness loaders={loaders}/></MemoryRouter>)
  fireEvent.click(screen.getByRole('button',{name:'切换版本'}))
  expect(await screen.findByText('#123456')).toBeTruthy()
  await act(async()=>finishOld('--bds-brand: #654321;'))
  expect(screen.getByText('#123456')).toBeTruthy()
  expect(screen.queryByText('#654321')).toBeNull()
})
