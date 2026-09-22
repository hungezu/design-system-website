import { validateResolvedSizing } from './theme-sizing'
import type { ProjectConfig } from '../types/design-system'
import bundled from '../../public/release-assets/index.json'
import { projects } from '../data/projects'
import { baselineThemeSettings, contrastRatio, loadProjectTheme, projectPreviewVariables, projectThemeStorageKey, type ProjectThemeSettings } from './project-theme'
import { LOCAL_RELEASE_STORAGE_KEY, loadLocalReleaseSnapshots, type LocalReleaseSnapshot } from './release-catalog'
import { canonicalJson, contentChecksum, SNAPSHOT_SCHEMA, validateSnapshot } from './release-snapshot'
export interface WorkspaceBackup {
 schema:'design-workspace-backup/1';createdAt:string;checksum:string;
 payload:{projects:Array<{id:string;theme:ProjectThemeSettings}>;releases:LocalReleaseSnapshot[];selectedVersions:Record<string,string>;activeProjectId:string;compatibilityReferences:string[]}
}
type Store=Pick<Storage,'getItem'|'setItem'|'removeItem'>
const selectionKey='design-intelligence-project-versions',activeKey='design-intelligence-current-project'
function storedObject(storage:Pick<Storage,'getItem'>,key:string){let value:unknown;try{value=JSON.parse(storage.getItem(key)??'{}')}catch{throw new Error(`已有记录损坏：${key}。未覆盖原始数据。`)};if(!record(value))throw new Error(`已有记录格式无效：${key}`);return value}
const record=(v:unknown):v is Record<string,unknown>=>Boolean(v)&&typeof v==='object'&&!Array.isArray(v)
export function checkTheme(value:unknown):asserts value is ProjectThemeSettings {
 if(!record(value))throw new Error('主题格式无效。')
 for(const [key,base] of Object.entries(baselineThemeSettings)){
  const item=value[key]
  if(key==='tableRadius'&&item===undefined)continue // Older saved themes keep the 6px table default.
  if(key==='tableRadius'&&(typeof item!=='number'||!Number.isFinite(item)||item<0||item>24))throw new Error('主题数值越界：tableRadius')
  if(typeof item!==typeof base)throw new Error(`主题字段类型无效：${key}`)
  if(typeof item==='number'&&(!Number.isFinite(item)||item<({bodySize:8,titleSize:8,controlHeight:16}[key as 'bodySize']??0)||item>200))throw new Error(`主题数值越界：${key}`)
  if(typeof item==='string'&&(!item.trim()||/[;{}]|url\s*\(|@import/i.test(item)||item.length>500))throw new Error(`主题字段无效：${key}`)
  if(/^(brand|text|surface|border|status)/.test(key)&&!/^#[0-9a-f]{6}$/i.test(String(item)))throw new Error(`主题颜色无效：${key}`)
 }
 for(const key of ['buttonPrimaryBackground','buttonPrimaryText'] as const){const item=value[key];if(item!==undefined&&(typeof item!=='string'||!/^#[0-9a-f]{6}$/i.test(item)))throw new Error(`主题颜色无效：${key}`)}
 validateResolvedSizing(value as unknown as ProjectThemeSettings)
 if(!['light','dark'].includes(String(value.mode))||!['compact','comfortable','spacious'].includes(String(value.density))||!['professional','compact','soft'].includes(String(value.preset)))throw new Error('主题枚举值无效。')
 if(value.buttonPrimaryBackground!==undefined||value.buttonPrimaryText!==undefined){const tokens=projectPreviewVariables(value as unknown as ProjectThemeSettings);for(const state of ['default','hover','active'])if(contrastRatio(tokens[`--button-brand-filled-text-${state}`],tokens[`--button-brand-filled-bg-${state}`])<4.5)throw new Error(`主按钮${state}状态的文字与背景对比度不足 4.5:1。`)}
}
export function createWorkspaceBackup(storage:Store,projectIds=projects.map(project=>project.id)):WorkspaceBackup {
 const selected=storedObject(storage,selectionKey) as Record<string,string>
 const included=projects.filter(project=>projectIds.includes(project.id))
 for(const project of included){if(storage.getItem(projectThemeStorageKey(project.id))!==null)storedObject(storage,projectThemeStorageKey(project.id))}
 const releases=loadLocalReleaseSnapshots(storage).filter(snapshot=>included.some(project=>project.releaseProjectId===snapshot.entry.projectId))
 const payload={projects:included.map(project=>({id:project.id,theme:loadProjectTheme(project,storage)})),releases,selectedVersions:Object.fromEntries(Object.entries(selected).filter(([id])=>projectIds.includes(id))),activeProjectId:included.some(p=>p.id===storage.getItem(activeKey))?storage.getItem(activeKey)!:included[0]?.id??'',compatibilityReferences:[...new Set(releases.flatMap(snapshot=>snapshot.entry.baseDir?[snapshot.entry.baseDir]:[]))]}
 return {schema:'design-workspace-backup/1',createdAt:new Date().toISOString(),checksum:contentChecksum(payload),payload}
}
export function validateWorkspaceBackup(input:string|unknown,allowedProjectIds=projects.map(project=>project.id),registry:ProjectConfig[]=projects):WorkspaceBackup {
 if(typeof input==='string'&&input.length>20_000_000)throw new Error('备份文件超过 20 MB。')
 let parsed:unknown
 try{parsed=typeof input==='string'?JSON.parse(input):input}catch{throw new Error('不是有效的 JSON 文件。')}
 if(!record(parsed)||typeof parsed.createdAt!=='string'||!Number.isFinite(Date.parse(parsed.createdAt))||parsed.schema!=='design-workspace-backup/1'||!record(parsed.payload))throw new Error('不支持的备份格式。')
 const value=parsed as unknown as WorkspaceBackup,payload=value.payload
 if(!Array.isArray(payload.projects)||!payload.projects.length||!Array.isArray(payload.releases)||payload.releases.length>200||!record(payload.selectedVersions)||!Array.isArray(payload.compatibilityReferences))throw new Error('备份结构不完整。')
 if(contentChecksum(payload)!==value.checksum)throw new Error('备份校验失败，内容可能已损坏。')
 const ids=new Set<string>()
 for(const item of payload.projects){if(!record(item)||typeof item.id!=='string'||ids.has(item.id)||!allowedProjectIds.includes(item.id)||!registry.some(p=>p.id===item.id))throw new Error('备份包含重复、未知或无权限项目。');ids.add(item.id);checkTheme(item.theme)}
 if(!ids.has(payload.activeProjectId))throw new Error('当前项目关联无效。')
 const releaseKeys=new Set<string>()
 for(const snapshot of payload.releases){
  if(!record(snapshot)||!record(snapshot.entry)||!record(snapshot.assets)||snapshot.entry.source!=='local')throw new Error('本地快照结构无效。')
  const owner=registry.find(p=>p.releaseProjectId===snapshot.entry.projectId)
  if(!owner||!ids.has(owner.id)||!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(snapshot.entry.version))throw new Error('版本与项目关联无效。')
  const key=`${snapshot.entry.projectId}/${snapshot.entry.version}`;if(releaseKeys.has(key))throw new Error('备份包含重复版本。');releaseKeys.add(key)
  const manifest=snapshot.assets['manifest.json'] as {schemaVersion?:string;projectId?:string;projectName?:string;releaseVersion?:string}|undefined
  if(manifest?.schemaVersion===SNAPSHOT_SCHEMA){if(manifest.projectName!==owner.id)throw new Error('快照项目标识与所属项目不一致。');if(snapshot.entry.baseDir)throw new Error('完整快照不能混入历史兼容引用。');validateSnapshot(snapshot)}
  else if(manifest?.schemaVersion==='bds-release/local-1'){
   if(manifest.projectId!==snapshot.entry.projectId||manifest.releaseVersion!==snapshot.entry.version||typeof snapshot.assets['tokens.css']!=='string'||!snapshot.assets['components.json'])throw new Error('旧版快照缺少必要关联。')
   if(snapshot.entry.baseDir&&!bundled.some(entry=>entry.dir===snapshot.entry.baseDir&&entry.projectId===snapshot.entry.projectId))throw new Error('旧版兼容引用不可用。')
  }else throw new Error('未知快照格式。')
  if(/@import|url\s*\(/i.test(String(snapshot.assets['tokens.css'])))throw new Error('Token 快照不能包含外部资源请求。')
 }
 for(const [id,version] of Object.entries(payload.selectedVersions)){
  const owner=registry.find(p=>p.id===id)
  if(!ids.has(id)||!owner||typeof version!=='string'||version!=='draft'&&!releaseKeys.has(`${owner.releaseProjectId}/${version}`)&&!bundled.some(e=>e.projectId===owner.releaseProjectId&&e.version===version))throw new Error('选中版本关联无效。')
 }
 const expectedReferences=[...new Set(payload.releases.flatMap(item=>item.entry.baseDir?[item.entry.baseDir]:[]))].sort()
 if(canonicalJson([...payload.compatibilityReferences].sort())!==canonicalJson(expectedReferences))throw new Error('兼容引用与快照不一致。')
 if(payload.compatibilityReferences.some(dir=>!bundled.some(entry=>entry.dir===dir)))throw new Error('兼容引用不在本地资产目录。')
 return value
}
/** Validate and stage every write first; restore the previous values on storage failure. */
export function restoreWorkspaceBackup(input:string|unknown,storage:Store,allowedProjectIds?:string[]){
 const backup=validateWorkspaceBackup(input,allowedProjectIds)
 const releases=loadLocalReleaseSnapshots(storage)
 for(const incoming of backup.payload.releases){const previous=releases.find(s=>s.entry.projectId===incoming.entry.projectId&&s.entry.version===incoming.entry.version);if(previous&&canonicalJson(previous)!==canonicalJson(incoming))throw new Error(`版本冲突：${incoming.entry.version}。未修改本地数据。`);if(!previous)releases.push(incoming)}
 const currentSelections=storedObject(storage,selectionKey) as Record<string,string>
 const writes=[...backup.payload.projects.map(item=>[projectThemeStorageKey(item.id),JSON.stringify(item.theme)]),[LOCAL_RELEASE_STORAGE_KEY,JSON.stringify(releases)],[selectionKey,JSON.stringify({...currentSelections,...backup.payload.selectedVersions})],[activeKey,backup.payload.activeProjectId]]
 const previous=writes.map(([key])=>[key,storage.getItem(key)] as const)
 try{for(const [key,value] of writes)storage.setItem(key,value)}catch(error){for(const [key,value] of previous){if(value===null)storage.removeItem(key);else storage.setItem(key,value)}throw error}
 return backup
}

/** Diagnostic export preserves malformed text verbatim; it is not accepted as a validated backup. */
export function createRawWorkspaceRecovery(storage:Pick<Storage,'getItem'>){
 const keys=[LOCAL_RELEASE_STORAGE_KEY,selectionKey,activeKey,...projects.map(project=>projectThemeStorageKey(project.id)),'design-intelligence-workbench-draft-v1','design-intelligence-workbench-draft-v1:global']
 return {schema:'design-workspace-recovery/raw-1',createdAt:new Date().toISOString(),records:Object.fromEntries(keys.map(key=>[key,storage.getItem(key)]))}
}
