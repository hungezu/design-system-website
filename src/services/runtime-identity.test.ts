import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {expect,it} from 'vitest'
import {computeRuntimeIdentity} from '../../scripts/runtime-identity'
it('真实源码或依赖锁变化使旧交付指纹失效，测试文件不冒充执行代码',()=>{
 const root=mkdtempSync(join(tmpdir(),'design-runtime-check-'))
 try{mkdirSync(join(root,'src'));writeFileSync(join(root,'src/control.ts'),'export const value=1');writeFileSync(join(root,'package-lock.json'),'{}');const first=computeRuntimeIdentity(root).buildId
 writeFileSync(join(root,'src/control.test.ts'),'test only');expect(computeRuntimeIdentity(root).buildId).toBe(first)
 writeFileSync(join(root,'src/control.ts'),'export const value=2');expect(computeRuntimeIdentity(root).buildId).not.toBe(first)
 const second=computeRuntimeIdentity(root).buildId;writeFileSync(join(root,'package-lock.json'),'{"lockfileVersion":3}');expect(computeRuntimeIdentity(root).buildId).not.toBe(second)
 const third=computeRuntimeIdentity(root).buildId;writeFileSync(join(root,'vite.delivery.config.ts'),'changed build config');expect(computeRuntimeIdentity(root).buildId).not.toBe(third)
 }finally{rmSync(root,{recursive:true,force:true})}
})
