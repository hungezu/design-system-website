import { DatabaseSync } from 'node:sqlite'
import { dirname, resolve } from 'node:path'
import { createDeliveryService, deliveryIdentity } from '../server/project-delivery'
import type { LocalReleaseSnapshot } from '../src/services/release-catalog'
const flags = new Map<string,string>()
for(let index=2;index<process.argv.length;index+=2){const key=process.argv[index],value=process.argv[index+1];if(!['--project','--version','--database'].includes(key)||!value||value.startsWith('--')||flags.has(key))throw new Error('用法：npm run delivery:project -- --project <项目标识> --version <已发布版本> [--database <SQLite路径>]');flags.set(key,value)}
const projectId=flags.get('--project'),version=flags.get('--version')
if(!projectId||!version||!/^[a-z][a-z0-9-]{1,49}$/.test(projectId)||!/^\d+\.\d+\.\d+$/.test(version))throw new Error('必须指定有效项目标识和已发布的 x.y.z 版本。')
const database=resolve(flags.get('--database')??'.workspace/workspace.sqlite')
// Local operator utility. Team users obtain packages through permission-checked HTTP endpoints.
const db=new DatabaseSync(database,{readOnly:true})
let snapshot:LocalReleaseSnapshot
try{
 const row=db.prepare('SELECT r.snapshot,p.config FROM releases r JOIN projects p ON p.id=r.projectId WHERE r.projectId=? AND r.version=?').get(projectId,version) as {snapshot:string;config:string}|undefined
 if(!row)throw new Error('项目已发布快照不存在；不会使用源码默认主题或当前草稿替代。')
 snapshot=JSON.parse(row.snapshot)
 if(snapshot.entry.projectId!==JSON.parse(row.config).releaseProjectId||deliveryIdentity(snapshot).projectId!==projectId)throw new Error('项目与冻结快照关联不一致。')
}finally{db.close()}
const service=createDeliveryService({runtimeRoot:resolve('artifacts/runtime-builds'),outputRoot:resolve(dirname(database),'deliveries')})
service.start(snapshot);await service.idle()
const result=service.status(snapshot)
if(result.status!=='ready'||!result.artifact)throw new Error(result.message??'生成失败。')
console.log(JSON.stringify({...result.artifact,archive:resolve(dirname(database),'deliveries',projectId,version,'ready',result.artifact.archiveName)},null,2))
