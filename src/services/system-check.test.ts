import {expect,it,vi} from 'vitest'
import {runSystemChecks} from './system-check'
import {baselineThemeSettings,projectPreviewVariables} from './project-theme'
import {createExternalReviewAdapter} from './external-review'
it('真实规则检查能定位未知变量、组件和低对比文字',()=>{
 const variables=projectPreviewVariables(baselineThemeSettings);variables['--field-placeholder']='#FFFFFF'
 const results=runSystemChecks({variables,componentIds:['button'],source:'<DSMissing />\n.x { color:var(--unknown); }'})
 expect(results).toEqual(expect.arrayContaining([expect.objectContaining({rule:'unknown-component',line:1}),expect.objectContaining({rule:'unknown-token',line:2}),expect.objectContaining({rule:'contrast:--field-placeholder',severity:'error'})]))
})
it('评审适配器不自动调用服务，并传播失败与取消信号',async()=>{
 const request=vi.fn().mockResolvedValue({ok:false,status:503});const adapter=createExternalReviewAdapter('http://127.0.0.1:8787/review',request);expect(request).not.toHaveBeenCalled();await expect(adapter({projectId:'g',version:'draft',source:'x',allowedComponents:[]})).rejects.toThrow('503');expect(()=>createExternalReviewAdapter('https://unconfigured.example/review')).toThrow('同源')
})
it('协作客户端在冲突时拒绝覆盖，并携带版本前置条件',async()=>{
 const {createWorkspaceRepository}=await import('./workspace-repository');const{createWorkspaceBackup}=await import('./workspace-backup')
 const backup=createWorkspaceBackup({getItem:()=>null,setItem(){},removeItem(){}})
 const request=vi.fn().mockResolvedValue({status:409,ok:false});const repository=createWorkspaceRepository('http://127.0.0.1:8787/workspaces/',request)
 await expect(repository.save('gkx',{revision:'r1',workspace:backup})).rejects.toThrow('版本冲突');expect(request.mock.calls[0][1].headers['If-Match']).toBe('r1')
})
