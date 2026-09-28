import { pathToFileURL } from 'node:url'
import { existsSync, readFileSync, realpathSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import { canonicalJson, contentChecksum, validateSnapshot } from '../src/services/release-snapshot'
import type { LocalReleaseSnapshot } from '../src/services/release-catalog'
import { computeRuntimeIdentity } from './runtime-identity'
import { JSDOM } from 'jsdom'

type DeliveryRecord = {
  version:string
  runtimeBuildId:string
  archive:string
  sha256:string
  snapshotChecksum:string
  approvedComponentCount:number
}
type ExpectedDelivery = {
  version:string
  runtimeBuildId:string
  snapshotChecksum:string
  componentExports:string[]
}
type CandidateManifest = {
  availableComponents:Array<{id:string;runtimeExport:string}>
}
type InstalledPackage = {
  exports?:Record<string,{import?:string}>
  designSystemApprovedExports?:string[]
}
type RuntimeBuild = { buildId:string }

const read=<T>(path:string):T=>JSON.parse(readFileSync(path,'utf8'))
function listEntries(directory:string, prefix=''):string[] {
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const relative=prefix?`${prefix}/${entry.name}`:entry.name
    return entry.isDirectory()?[relative,...listEntries(join(directory,entry.name),relative)]:[relative]
  })
}
const releaseAssets=(paths:string[])=>paths.filter(path=>path.split('/').includes('release-assets'))
const equalStrings=(left:string[],right:string[])=>canonicalJson([...left].sort())===canonicalJson([...right].sort())

const delivery=read<DeliveryRecord>('artifacts/local-stable/delivery.json')
const stagedSnapshot=read<LocalReleaseSnapshot>('artifacts/local-stable/package/snapshot.json')
validateSnapshot(stagedSnapshot)
if(computeRuntimeIdentity().buildId!==delivery.runtimeBuildId)throw new Error('工作区源码已变化；候选包过期，请重新执行 delivery:build。')
if(createHash('sha256').update(readFileSync(delivery.archive)).digest('hex')!==delivery.sha256)throw new Error('tarball SHA-256 不一致。')

const stagedReleaseAssets=releaseAssets(listEntries('artifacts/local-stable/package'))
if(stagedReleaseAssets.length)throw new Error(`候选 package 仍包含历史 release-assets：${stagedReleaseAssets.slice(0,3).join('、')}`)
const archiveEntries=execFileSync('tar',['-tzf',delivery.archive],{encoding:'utf8'}).split(/\r?\n/).filter(Boolean)
const archiveReleaseAssets=releaseAssets(archiveEntries)
if(archiveReleaseAssets.length)throw new Error(`候选 tarball 仍包含历史 release-assets：${archiveReleaseAssets.slice(0,3).join('、')}`)

for(const file of stagedSnapshot.assets['manifest.json'].artifactFiles){
  const data=readFileSync(`artifacts/local-stable/snapshot/${file.path}`)
  if(data.length!==file.bytes||contentChecksum(data.toString())!==file.checksum)throw new Error(`交付文件损坏：${file.path}`)
}

const expected=read<ExpectedDelivery>('consumer/expected-delivery.json')
if(expected.runtimeBuildId!==delivery.runtimeBuildId||expected.version!==delivery.version||expected.snapshotChecksum!==delivery.snapshotChecksum)throw new Error('Consumer 目标候选记录已过期。')

const installedRoot=realpathSync('consumer/node_modules/@local/design-system')
const consumerModulesRoot=resolve('consumer/node_modules')+'/'
if(!installedRoot.startsWith(consumerModulesRoot))throw new Error('Consumer 不能通过源码软链接自证。')
const installedReleaseAssets=releaseAssets(listEntries(installedRoot))
if(installedReleaseAssets.length)throw new Error(`Consumer 安装包仍包含历史 release-assets：${installedReleaseAssets.slice(0,3).join('、')}`)

const installedPackage=read<InstalledPackage>(join(installedRoot,'package.json'))
const installedBuild=read<RuntimeBuild>(join(installedRoot,'runtime-build.json'))
const installedSnapshot=read<LocalReleaseSnapshot>(join(installedRoot,'snapshot.json'))
const installedTokens=read<Record<string,string>>(join(installedRoot,'tokens.json'))
validateSnapshot(installedSnapshot)
if(installedBuild.buildId!==delivery.runtimeBuildId)throw new Error('Consumer 安装的是旧包，请在 consumer 执行 npm install。')
if(installedSnapshot.entry.version!==delivery.version||installedSnapshot.entry.checksum!==delivery.snapshotChecksum||canonicalJson(installedSnapshot)!==canonicalJson(stagedSnapshot))throw new Error('Consumer 安装的冻结快照与目标候选不一致。')

const manifest=installedSnapshot.assets['manifest.json'] as CandidateManifest
const approvedExports=manifest.availableComponents.map(component=>component.runtimeExport)
if(approvedExports.length!==delivery.approvedComponentCount||!equalStrings(approvedExports,expected.componentExports))throw new Error('候选批准组件清单与 Consumer 目标不一致。')
if(!equalStrings(approvedExports,installedPackage.designSystemApprovedExports??[]))throw new Error('安装包声明的批准导出与冻结快照不一致。')

// The delivery is explicitly client-only. Give its import-time Markdown decoder
// the same DOM surface it receives in a browser before importing the installed package entry.
const dom=new JSDOM('<!doctype html><html><body></body></html>')
Object.defineProperty(globalThis,'document',{configurable:true,value:dom.window.document})
Object.defineProperty(globalThis,'window',{configurable:true,value:dom.window})
const installedEntry=installedPackage.exports?.['.']?.import
if(typeof installedEntry!=='string')throw new Error('安装包缺少可导入的根入口。')
const executable=await import(pathToFileURL(resolve(installedRoot,installedEntry)).href)
if(executable.RUNTIME_BUILD_ID!==delivery.runtimeBuildId)throw new Error('Consumer 实际导入的执行代码不匹配目标运行时。')
const actualDsExports=Object.keys(executable).filter(name=>/^DS[A-Z]/.test(name))
if(!equalStrings(actualDsExports,approvedExports))throw new Error(`包根 DS 导出与批准清单不一致：批准 ${approvedExports.length}，实际 ${actualDsExports.length}`)

if(canonicalJson(installedTokens)!==canonicalJson(installedSnapshot.assets['tokens.json']))throw new Error('Consumer 安装的 Token 与冻结快照不一致。')
const buttonTokens=[
  '--button-brand-filled-bg-default',
  '--button-brand-filled-bg-hover',
  '--button-brand-filled-bg-active',
  '--button-brand-filled-text-default',
  '--button-brand-filled-text-hover',
  '--button-brand-filled-text-active',
]
const expectedButtonValues:Record<string,string>={
  '--button-brand-filled-bg-default':'#165DFF',
  '--button-brand-filled-bg-hover':'#0E42D2',
  '--button-brand-filled-bg-active':'#0C37B0',
  '--button-brand-filled-text-default':'#FFFFFF',
  '--button-brand-filled-text-hover':'#FFFFFF',
  '--button-brand-filled-text-active':'#FFFFFF',
}
const style=readFileSync(join(installedRoot,'dist/style.css'),'utf8')
for(const token of buttonTokens){
  if(typeof installedTokens[token]!=='string'||!installedTokens[token])throw new Error(`候选包缺少按钮 Token：${token}`)
  if(installedTokens[token].toUpperCase()!==expectedButtonValues[token])throw new Error(`候选包按钮 Token 值不符：${token}=${installedTokens[token]}`)
  if(!style.includes(token))throw new Error(`候选样式没有消费按钮 Token：${token}`)
}

if(!existsSync(join(installedRoot,'DESIGN.md')))throw new Error('Consumer 安装包缺少 DESIGN.md。')
console.log(`Delivery verified: ${approvedExports.length} approved root DS exports, clean archive, installed runtime, snapshot and button tokens. ${delivery.version}`)
