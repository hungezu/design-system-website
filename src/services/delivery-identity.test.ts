import {expect,it} from 'vitest'
import {matchesDelivery} from '../../consumer/identity'
it('代码与快照同时过期也不能通过目标版本检查',()=>{
 const old={entry:{version:'old',checksum:'old-data'},assets:{'manifest.json':{componentRuntimeVersion:'old-code'}}}
 expect(matchesDelivery('old-code',old,{version:'new',runtimeBuildId:'new-code',snapshotChecksum:'new-data'})).toBe(false)
 expect(matchesDelivery('old-code',old,{version:'old',runtimeBuildId:'old-code',snapshotChecksum:'old-data'})).toBe(true)
})
it('缺少清单或关联不同的数据版本直接失败',()=>{
 expect(matchesDelivery('code',null,{})).toBe(false)
 expect(matchesDelivery('code',{entry:{version:'v',checksum:'bad'},assets:{'manifest.json':{componentRuntimeVersion:'code'}}},{version:'v',runtimeBuildId:'code',snapshotChecksum:'expected'})).toBe(false)
})
