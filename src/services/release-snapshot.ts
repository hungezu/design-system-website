import { AI_COMPONENT_IDS, AI_COMPONENT_RULES } from '../data/ai-components'
import { sizingTokens, validateResolvedSizing } from './theme-sizing'
import { snapshotAiRules } from './design-markdown'
import { TABLE_LAYOUT_CONTRACT, TABLE_LAYOUT_RULES } from '../data/patterns/table-layout'
import apiData from '../data/generated/runtime-api.json'
import runtimeBuild from '../data/generated/runtime-build.json'
import { patternAssets } from '../data/assets/patterns'
import { templateAssets } from '../data/assets/templates'
import { iconIdsForProject } from './icon-pack'
import { getIcon } from '../runtime/vendor/runtime.js'
import { getRuntimeComponent } from '../runtime/registry'
import { getDesktopComponentBinding } from '../design-system/component-bindings'
import { projectPreviewVariables, type ProjectThemeSettings } from './project-theme'
import { resolveProjectTheme } from './theme-resolver'
import type { ProjectConfig } from '../types/design-system'
import type { LocalReleaseSnapshot, ReleaseAssetName } from './release-catalog'

export const SNAPSHOT_SCHEMA='bds-release/local-2'
export function canonicalJson(value:unknown):string {
 if(Array.isArray(value))return `[${value.map(canonicalJson).join(',')}]`
 if(value&&typeof value==='object')return `{${Object.entries(value).filter(([,v])=>v!==undefined).sort(([a],[b])=>a.localeCompare(b,'en')).map(([k,v])=>`${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`
 return JSON.stringify(value)??'null'
}
/** Content integrity identifier, not a cryptographic signature. */
export function contentChecksum(value:unknown):string {
 const bytes=new TextEncoder().encode(typeof value==='string'?value:canonicalJson(value));let hash=0xcbf29ce484222325n
 for(const byte of bytes){hash^=BigInt(byte);hash=BigInt.asUintN(64,hash*0x100000001b3n)}
 return `fnv1a64:${hash.toString(16).padStart(16,'0')}`
}
export function createReleaseSnapshot({project,theme,version,note='',status='candidate',source='browser-draft',createdAt=new Date().toISOString()}:{project:ProjectConfig;theme:ProjectThemeSettings;version:string;note?:string;status?:'candidate'|'published';source?:'browser-draft'|'project-source';createdAt?:string}):LocalReleaseSnapshot {
 const variables=projectPreviewVariables(theme,resolveProjectTheme(project))
 const availableComponents=project.componentIds.map(id=>{const entry=getRuntimeComponent(id);if(!entry)throw new Error(`组件未实现：${id}`);return {...entry}})
 const assets:LocalReleaseSnapshot['assets']={
  'tokens.css':`/* ${project.id} / ${version} — immutable snapshot */\n:root, [data-ds-project="${project.releaseProjectId}"] {\n${Object.entries(variables).map(([name,value])=>`  ${name}: ${value};`).join('\n')}\n}`,
  'tokens.json':variables,
  'components.json':{schemaVersion:SNAPSHOT_SCHEMA,projectId:project.releaseProjectId,releaseVersion:version,availableComponents:availableComponents.map(component=>({...component,props:(apiData as Record<string,unknown[]>)[component.runtimeExport]??[],states:getDesktopComponentBinding(component.id)?.states??[]}))},
  'icons.json':{schemaVersion:SNAPSHOT_SCHEMA,projectId:project.releaseProjectId,icons:iconIdsForProject(project.id).map(id=>getIcon(id)),representation:'captured registry metadata; glyph implementation pinned by runtimeBuildId',runtimeBuildId:runtimeBuild.buildId},
  'recipes.json':{schemaVersion:SNAPSHOT_SCHEMA,bindings:project.componentIds.map(getDesktopComponentBinding),values:Object.fromEntries(Object.entries(variables).filter(([key])=>key.startsWith('--button-')))},
  'patterns.json':{schemaVersion:SNAPSHOT_SCHEMA,aiInteraction:{schema:'ai-interaction/1',components:project.componentIds.filter(id=>AI_COMPONENT_IDS.includes(id)),rules:[...AI_COMPONENT_RULES]},tableLayout:{...TABLE_LAYOUT_CONTRACT,rules:[...TABLE_LAYOUT_RULES]},patterns:patternAssets,templates:templateAssets.filter(item=>item.id!=='template-dashboard'),implementation:'@local/design-system PatternExample / TemplateExample',runtimeBuildId:runtimeBuild.buildId},
  'layout.json':{schemaVersion:SNAPSHOT_SCHEMA,spacing:(Number.parseFloat(variables['--component-gap']) || Number.parseFloat(variables['--spacing-16'])),density:theme.density,controlHeight:Number.parseFloat(variables['--control-height-md']),bodySize:theme.bodySize,titleSize:theme.titleSize},
  'region-appearance.json':{schemaVersion:SNAPSHOT_SCHEMA,theme},
  'validation-report.json':{schemaVersion:SNAPSHOT_SCHEMA,scope:'snapshot completeness and identity only; see release acceptance report for behavior verification',projectId:project.releaseProjectId,componentCount:availableComponents.length},
  'ai-rules.md':snapshotAiRules({projectId:project.id,releaseProjectId:project.releaseProjectId,version,runtimeBuildId:runtimeBuild.buildId,status}),
 }
 const artifactFiles=Object.entries(assets).map(([path,value])=>({path,bytes:new TextEncoder().encode(typeof value==='string'?value:canonicalJson(value)).length,checksum:contentChecksum(value),mediaType:path.endsWith('.json')?'application/json':path.endsWith('.css')?'text/css':'text/markdown'}))
 const checksum=contentChecksum(artifactFiles)
 const releaseId=`local-${project.id}-${version}-${checksum.slice(-16)}`
 assets['manifest.json']={schemaVersion:SNAPSHOT_SCHEMA,projectId:project.releaseProjectId,projectName:project.id,releaseVersion:version,status,publishedAt:createdAt,checksum,availableComponents,artifactFiles,runtimeCompatibility:{runtime:'bds-runtime/1',minReact:'19',styleStrategy:'css-variables',componentRuntimeVersion:runtimeBuild.buildId},componentRuntimeVersion:runtimeBuild.buildId,sourceSummary:{generatedFrom:source,capturedAt:createdAt,localOnly:true,note},snapshotCoverage:{captured:Object.keys(assets),compatibilityReferences:[],runtimeCode:import.meta.env?.DEV?'development preview; executable code is not frozen, verify a separately built matching package':'external compiled package with matching buildId',icons:'registry metadata captured; glyphs in compiled package'},missingCapabilities:['No server synchronization or authentication claims.','Browser snapshots capture data; use the matched delivery package for frozen executable code.']}
 return JSON.parse(JSON.stringify({entry:{dir:`local/${project.id}/${version}`,projectId:project.releaseProjectId,version,label:`${project.shortName} · ${version}（${status==='candidate'?'本地稳定版候选':'本地版本'}）${note?' · '+note:''}`,migrationStatus:'frozen',source:'local',releaseId,checksum,publishedAt:createdAt},assets})) as LocalReleaseSnapshot
}
const isRecord=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==='object'&&!Array.isArray(value)
export function validateSnapshot(snapshot:LocalReleaseSnapshot) {
 if(!isRecord(snapshot)||!isRecord(snapshot.entry)||!isRecord(snapshot.assets))throw new Error('快照结构无效。')
 const manifest=snapshot.assets['manifest.json']
 if(!isRecord(manifest)||manifest.schemaVersion!==SNAPSHOT_SCHEMA)throw new Error('不支持的快照格式；旧版快照需保留为兼容引用。')
 if(manifest.projectId!==snapshot.entry.projectId||manifest.releaseVersion!==snapshot.entry.version)throw new Error('快照项目或版本关联不一致。')
 if(typeof manifest.projectName!=='string'||!/^[-a-z0-9]+$/.test(manifest.projectName)||!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(snapshot.entry.version))throw new Error('快照项目名称或版本格式无效。')
 if(snapshot.entry.source!=='local'||snapshot.entry.migrationStatus!=='frozen'||snapshot.entry.dir!==`local/${manifest.projectName}/${snapshot.entry.version}`||snapshot.entry.baseDir)throw new Error('快照路径或类型不一致。')
 if(!['candidate','published'].includes(String(manifest.status))||typeof manifest.componentRuntimeVersion!=='string'||!/^sha256:[a-f0-9]{64}$/.test(manifest.componentRuntimeVersion))throw new Error('快照状态或运行时标识无效。')
 if(!isRecord(manifest.runtimeCompatibility)||manifest.runtimeCompatibility.componentRuntimeVersion!==manifest.componentRuntimeVersion)throw new Error('运行时兼容标识不一致。')
 const required=['tokens.css','tokens.json','components.json','icons.json','recipes.json','patterns.json','layout.json','region-appearance.json','validation-report.json','ai-rules.md']
 if(!Array.isArray(manifest.artifactFiles)||manifest.artifactFiles.length!==required.length||Object.keys(snapshot.assets).length!==required.length+1)throw new Error('快照资产清单不完整。')
 const paths=new Set<string>()
 for(const file of manifest.artifactFiles){
  if(!isRecord(file)||typeof file.path!=='string'||!required.includes(file.path)||paths.has(file.path))throw new Error('未知或重复资产路径。')
  paths.add(file.path);const asset=snapshot.assets[file.path as ReleaseAssetName]
  if(asset===undefined||contentChecksum(asset)!==file.checksum||new TextEncoder().encode(typeof asset==='string'?asset:canonicalJson(asset)).length!==file.bytes)throw new Error(`资产校验失败：${file.path}`)
 }
 if(contentChecksum(manifest.artifactFiles)!==snapshot.entry.checksum||manifest.checksum!==snapshot.entry.checksum)throw new Error('快照清单校验失败。')
 if(snapshot.entry.releaseId!==`local-${manifest.projectName}-${snapshot.entry.version}-${snapshot.entry.checksum!.slice(-16)}`)throw new Error('快照标识不一致。')
 const tokens=snapshot.assets['tokens.json'],css=snapshot.assets['tokens.css']
 if(!isRecord(tokens)||typeof css!=='string'||Object.entries(tokens).some(([key,value])=>!/^--[a-z0-9-]+$/i.test(key)||typeof value!=='string'))throw new Error('Token 数据结构无效。')
 const cssTokens=Object.fromEntries([...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map(match=>[match[1],match[2].trim()]))
 if(canonicalJson(cssTokens)!==canonicalJson(tokens))throw new Error('Token CSS 与 JSON 不一致。')
 const region=snapshot.assets['region-appearance.json']
 if(isRecord(region)&&isRecord(region.theme)&&region.theme.sizing!==undefined){
  if(!['compact','comfortable','spacious'].includes(String(region.theme.density))||typeof region.theme.bodySize!=='number'||!Number.isFinite(region.theme.bodySize))throw new Error('分层尺寸主题基础值无效。')
  validateResolvedSizing(region.theme as unknown as ProjectThemeSettings)
  for(const [name,value] of Object.entries(sizingTokens(region.theme as unknown as ProjectThemeSettings)))if(tokens[`--${name}`]!==value)throw new Error(`分层尺寸输入与冻结取值不一致：${name}`)
 }
 const components=snapshot.assets['components.json'],icons=snapshot.assets['icons.json'],patterns=snapshot.assets['patterns.json']
 if(!isRecord(components)||components.projectId!==snapshot.entry.projectId||components.releaseVersion!==snapshot.entry.version||!Array.isArray(components.availableComponents)||!Array.isArray(manifest.availableComponents))throw new Error('组件清单关联无效。')
 const ids=(items:unknown[])=>{const seen=new Set<string>();return items.map(item=>{if(!isRecord(item)||typeof item.id!=='string'||typeof item.runtimeExport!=='string'||seen.has(item.id))throw new Error('组件清单条目无效或重复。');seen.add(item.id);return {id:item.id,runtimeExport:item.runtimeExport}}).sort((a,b)=>a.id.localeCompare(b.id))}
 if(canonicalJson(ids(components.availableComponents))!==canonicalJson(ids(manifest.availableComponents)))throw new Error('Manifest 与组件清单不一致。')
 if(!isRecord(icons)||icons.projectId!==snapshot.entry.projectId||icons.runtimeBuildId!==manifest.componentRuntimeVersion||!Array.isArray(icons.icons))throw new Error('图标清单关联无效。')
 if(!isRecord(patterns)||patterns.runtimeBuildId!==manifest.componentRuntimeVersion||!Array.isArray(patterns.patterns)||!Array.isArray(patterns.templates))throw new Error('模式与模板清单关联无效。')
 return snapshot
}
