import { describe,expect,it } from 'vitest'
import { projects,guokexinProject } from '../data/projects'
import { defaultProjectTheme,projectThemeStorageKey } from './project-theme'
import { createReleaseSnapshot,contentChecksum,validateSnapshot } from './release-snapshot'
import { createWorkspaceBackup,restoreWorkspaceBackup,validateWorkspaceBackup } from './workspace-backup'
import { LOCAL_RELEASE_STORAGE_KEY,loadReleaseAsset,type ReleaseCatalogEntry,type ReleaseAssetName } from './release-catalog'
import { compareMaps,compareReleaseAssets } from './release-diff'
function memory(){const values=new Map<string,string>();return {values,getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value)},removeItem:(key:string)=>{values.delete(key)}}}
function fixture(){const storage=memory();const snapshot=createReleaseSnapshot({project:guokexinProject,theme:defaultProjectTheme(guokexinProject),version:'1.6.0',status:'candidate'});storage.setItem(LOCAL_RELEASE_STORAGE_KEY,JSON.stringify([snapshot]));storage.setItem('design-intelligence-project-versions',JSON.stringify({guokexin:'1.6.0'}));return {storage,snapshot}}
describe('本地交付闭环',()=>{
 it('新快照包含所有资产，可独立读取而不访问历史 baseDir',async()=>{const{storage,snapshot}=fixture();expect(validateSnapshot(snapshot)).toBe(snapshot);expect(Object.keys(snapshot.assets)).toHaveLength(11);expect(snapshot.entry.baseDir).toBeUndefined();expect(await loadReleaseAsset(snapshot.entry,'patterns.json',undefined,storage)).toHaveProperty('patterns');expect(await loadReleaseAsset(snapshot.entry,'icons.json',undefined,storage)).toHaveProperty('icons')})
 it('实际内容变化改变校验值，篡改 Token 被拒绝',()=>{const{snapshot}=fixture();const altered=structuredClone(snapshot);altered.assets['tokens.css']+='\n--bad: red;';expect(()=>validateSnapshot(altered)).toThrow('校验失败')})
 it('导出导入往返保留主题和选中版本，重复恢复幂等',()=>{const{storage}=fixture();const backup=createWorkspaceBackup(storage);const target=memory();restoreWorkspaceBackup(JSON.stringify(backup),target);expect(target.getItem('design-intelligence-project-versions')).toContain('1.6.0');expect(target.getItem(projectThemeStorageKey('guokexin'))).toBe(JSON.stringify(defaultProjectTheme(guokexinProject)));restoreWorkspaceBackup(backup,target);expect(JSON.parse(target.getItem(LOCAL_RELEASE_STORAGE_KEY)!)).toHaveLength(1)})
 it('格式、校验、项目权限和关联错误均在写入前拒绝',()=>{const{storage}=fixture();const backup=createWorkspaceBackup(storage);expect(()=>validateWorkspaceBackup('bad')).toThrow('JSON');expect(()=>validateWorkspaceBackup({...backup,checksum:'bad'})).toThrow('校验');expect(()=>validateWorkspaceBackup(backup,[projects[1].id])).toThrow('无权限');const bad=structuredClone(backup);bad.payload.selectedVersions.guokexin='99.0.0';bad.checksum=contentChecksum(bad.payload);expect(()=>validateWorkspaceBackup(bad)).toThrow('关联');const target=memory();expect(()=>restoreWorkspaceBackup(bad,target)).toThrow();expect(target.values.size).toBe(0)})
 it('同号不同内容拒绝覆盖冻结数据',()=>{const{storage,snapshot}=fixture();const backup=createWorkspaceBackup(storage);const target=memory();const changed=structuredClone(snapshot);changed.entry.label='不同记录';target.setItem(LOCAL_RELEASE_STORAGE_KEY,JSON.stringify([changed]));expect(()=>restoreWorkspaceBackup(backup,target)).toThrow('版本冲突');expect(target.getItem(LOCAL_RELEASE_STORAGE_KEY)).toContain('不同记录')})
 it('存储写入失败时回滚先前主题与版本',()=>{const{storage}=fixture();const backup=createWorkspaceBackup(storage);const target=memory();target.setItem(projectThemeStorageKey('guokexin'),'old');const base=target.setItem;let calls=0;target.setItem=(key,value)=>{calls++;if(calls===2)throw new Error('quota');base(key,value)};expect(()=>restoreWorkspaceBackup(backup,target)).toThrow('quota');expect(target.getItem(projectThemeStorageKey('guokexin'))).toBe('old');expect(target.values.size).toBe(1)})
 it('版本差异包含新增、删除、修改及不可读资产说明',async()=>{expect(compareMaps('tokens', {a:1,b:2},{a:3,c:null}).map(row=>row.kind)).toEqual(['changed','removed','added']);const{snapshot}=fixture();const next={...snapshot.entry,version:'1.7.0'};const result=await compareReleaseAssets(snapshot.entry,next,async<T>(entry:ReleaseCatalogEntry,name:ReleaseAssetName)=>{if(name==='icons.json')throw new Error('missing');return (name==='tokens.css'?`--brand-primary: ${entry.version==='1.7.0'?'blue':'green'};`:{availableComponents:[{id:'button'}]}) as T});expect(result.changes.some(row=>row.id==='brand-primary'&&row.kind==='changed')).toBe(true);expect(result.unavailable).toEqual([{asset:'icons.json',reason:'missing'}])})
})

it('损坏的已有版本或选中版本不会被当成空数据覆盖',()=>{
 const {storage}=fixture(),backup=createWorkspaceBackup(storage),target=memory();target.setItem(LOCAL_RELEASE_STORAGE_KEY,'{broken')
 expect(()=>restoreWorkspaceBackup(backup,target)).toThrow('损坏');expect(target.getItem(LOCAL_RELEASE_STORAGE_KEY)).toBe('{broken');expect(()=>createWorkspaceBackup(target)).toThrow('损坏')
 target.removeItem(LOCAL_RELEASE_STORAGE_KEY);target.setItem('design-intelligence-project-versions','[]');expect(()=>restoreWorkspaceBackup(backup,target)).toThrow('格式');expect(target.values.size).toBe(1)
})
it('备份拒绝零字号、损坏的保存主题以及伪造兼容引用',()=>{
 const {storage}=fixture(),backup=createWorkspaceBackup(storage);backup.payload.projects[0].theme.bodySize=0;backup.checksum=contentChecksum(backup.payload);expect(()=>validateWorkspaceBackup(backup)).toThrow('越界')
 storage.setItem(projectThemeStorageKey('guokexin'),'{broken');expect(()=>createWorkspaceBackup(storage)).toThrow('损坏')
})
it('快照返回值不共享可变的全局绑定对象',async()=>{
 const {snapshot}=fixture();const {getDesktopComponentBinding}=await import('../design-system/component-bindings');const original=[...getDesktopComponentBinding('button')!.states]
 const recipes=snapshot.assets['recipes.json'] as {bindings:Array<{states:string[]}>};recipes.bindings[0].states.push('unexpected');expect(getDesktopComponentBinding('button')!.states).toEqual(original)
})
it('即使重算文件校验，CSS/JSON 矛盾或 Manifest 清单错误仍会拒绝',async()=>{
 const {snapshot}=fixture();const tokens=snapshot.assets['tokens.json'] as Record<string,string>;tokens['--brand-primary']='#123456'
 const {canonicalJson}=await import('./release-snapshot');const manifest=snapshot.assets['manifest.json'] as Record<string,unknown>
 const files=Object.entries(snapshot.assets).filter(([path])=>path!=='manifest.json').map(([path,value])=>({path,checksum:contentChecksum(value),bytes:new TextEncoder().encode(typeof value==='string'?value:canonicalJson(value)).length}))
 manifest.artifactFiles=files;manifest.checksum=contentChecksum(files);snapshot.entry.checksum=String(manifest.checksum);snapshot.entry.releaseId=`local-guokexin-${snapshot.entry.version}-${snapshot.entry.checksum.slice(-16)}`
 expect(()=>validateSnapshot(snapshot)).toThrow('CSS 与 JSON')
 const other=fixture().snapshot;(other.assets['manifest.json'] as Record<string,unknown>).availableComponents=[];expect(()=>validateSnapshot(other)).toThrow('组件清单不一致')
})
it('版本差异不会遗漏同一文件中的模板和布局变化',async()=>{
 const {snapshot}=fixture();const {assetRecords}=await import('./release-diff');const changes=compareMaps('patterns.json',assetRecords({patterns:[{id:'p'}],templates:[{id:'t',value:1}]}),assetRecords({patterns:[{id:'p'}],templates:[{id:'t',value:2}]}));expect(changes).toEqual([expect.objectContaining({id:'templates/t',kind:'changed'})])
 const result=await compareReleaseAssets(snapshot.entry,{...snapshot.entry,version:'1.7.0'},async<T,>(entry:ReleaseCatalogEntry,name:ReleaseAssetName)=>(name==='tokens.css'?'--brand: blue;':name==='layout.json'?{spacing:entry.version==='1.7.0'?24:16}:{}) as T)
 expect(result.changes).toEqual(expect.arrayContaining([expect.objectContaining({asset:'layout.json',kind:'changed'})]))
})
it('原始诊断导出保留损坏内容且不包含账号等无关存储',async()=>{
 const {createRawWorkspaceRecovery}=await import('./workspace-backup');const storage=memory();storage.setItem(LOCAL_RELEASE_STORAGE_KEY,'{broken');storage.setItem('unrelated-secret','not-exported')
 const recovery=createRawWorkspaceRecovery(storage);expect(recovery.records[LOCAL_RELEASE_STORAGE_KEY]).toBe('{broken');expect(recovery.records['unrelated-secret']).toBeUndefined();expect(()=>validateWorkspaceBackup(recovery)).toThrow('格式')
})
