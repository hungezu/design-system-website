import {test} from 'node:test'
import assert from 'node:assert/strict'
import {mkdtempSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createResourceApi} from './api.mjs'
test('独立业务接口校验、并发保护和持久化',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'consumer-api-')),dataFile=join(dir,'resources.json'),server=createResourceApi({dataFile})
 await new Promise(done=>server.listen(0,'127.0.0.1',done));const origin=`http://127.0.0.1:${server.address().port}`
 const put=async body=>{const response=await fetch(origin+'/api/resources/experts',{method:'PUT',headers:{Origin:origin,'Content-Type':'application/json','X-Resource-Request':'1'},body:JSON.stringify(body)});return {status:response.status,data:await response.json()}}
 try{assert.equal((await put({name:'',revision:0})).status,422);assert.equal((await put({name:'政策数据库',revision:0})).status,409);assert.equal((await put({name:'已更新专家资源',revision:0})).status,200);assert.equal((await put({name:'覆盖更新',revision:0})).status,409);const response=await fetch(origin+'/api/resources?query=已更新');assert.equal((await response.json()).items[0].revision,1)}finally{await new Promise(done=>server.close(done));server.closeAllConnections();rmSync(dir,{recursive:true,force:true})}
})
