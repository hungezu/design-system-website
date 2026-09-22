// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { FrontendDelivery } from './FrontendDelivery'
import { api } from '../services/workspace-api'
vi.mock('../services/workspace-api',()=>({api:vi.fn()}))
beforeEach(()=>{vi.resetAllMocks();window.matchMedia=vi.fn().mockReturnValue({matches:false,addEventListener(){},removeEventListener(){}})})
afterEach(cleanup)
it('草稿不请求生成接口，查看者看到联系管理员的操作说明',async()=>{
 const view=render(<FrontendDelivery projectId="guokexin" version={null} canGenerate={false}/>);expect(api).not.toHaveBeenCalled()
 vi.mocked(api).mockResolvedValue({status:'not-generated'})
 view.rerender(<FrontendDelivery key="published" projectId="guokexin" version="2.0.0" canGenerate={false}/>)
 expect(await screen.findByText(/请项目管理员生成组件包/)).toBeTruthy();expect(screen.queryByRole('button',{name:'生成前端组件包'})).toBeNull()
})
it('请求失败可重新读取；缺代码归档时不显示生成按钮',async()=>{
 vi.mocked(api).mockRejectedValueOnce(new Error('连接中断')).mockResolvedValueOnce({status:'unavailable',message:'此版本缺少匹配代码',designSpec:'# 冻结规范'})
 render(<FrontendDelivery projectId="guokexin" version="2.0.0" canGenerate/>);expect(await screen.findByRole('alert')).toHaveProperty('textContent','连接中断')
 await userEvent.click(screen.getByRole('button',{name:'重新读取交付信息'}))
 expect(await screen.findByText('此版本缺少匹配代码')).toBeTruthy();expect(screen.queryByRole('button',{name:'生成前端组件包'})).toBeNull();expect(screen.getByRole('button',{name:'下载 AI 设计规范'})).toBeTruthy()
})
it('管理员发起真实生成请求并显示异步状态',async()=>{
 vi.mocked(api).mockResolvedValueOnce({status:'not-generated'}).mockResolvedValue({status:'building',message:'正在准备组件包和接入说明…'})
 render(<FrontendDelivery projectId="guokexin" version="2.0.0" canGenerate/>)
 await userEvent.click(await screen.findByRole('button',{name:'生成前端组件包'}))
 await waitFor(()=>expect(api).toHaveBeenCalledWith('/projects/guokexin/deliveries/2.0.0',{method:'POST',body:{}}))
 expect(await screen.findByText(/离开页面不会取消生成/)).toBeTruthy()
})
it('切换版本后忽略旧请求，不呈现旧版本下载入口',async()=>{
 let resolveOld:(value:unknown)=>void=()=>{}
 vi.mocked(api).mockImplementationOnce(()=>new Promise(resolve=>{resolveOld=resolve})).mockResolvedValue({status:'unavailable',message:'新版本待归档'})
 const view=render(<FrontendDelivery key="one" projectId="guokexin" version="1.0.0" canGenerate/>)
 view.rerender(<FrontendDelivery key="two" projectId="guokexin" version="2.0.0" canGenerate/>)
 expect(await screen.findByText('新版本待归档')).toBeTruthy()
 resolveOld({status:'ready',artifact:{packageName:'old'}})
 expect(screen.queryByRole('button',{name:'下载组件包'})).toBeNull()
})
