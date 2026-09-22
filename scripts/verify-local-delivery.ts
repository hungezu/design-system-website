import { pathToFileURL } from 'node:url'
import { readFileSync, realpathSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { contentChecksum,validateSnapshot } from '../src/services/release-snapshot'
import { computeRuntimeIdentity } from './runtime-identity'
import { JSDOM } from 'jsdom'
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const delivery=read('artifacts/local-stable/delivery.json'),snapshot=read('artifacts/local-stable/package/snapshot.json')
validateSnapshot(snapshot)
if(computeRuntimeIdentity().buildId!==delivery.runtimeBuildId)throw new Error('工作区源码已变化；候选包过期，请重新执行 delivery:build。')
if(createHash('sha256').update(readFileSync(delivery.archive)).digest('hex')!==delivery.sha256)throw new Error('tarball SHA-256 不一致。')
for(const file of snapshot.assets['manifest.json'].artifactFiles){const data=readFileSync(`artifacts/local-stable/snapshot/${file.path}`);if(data.length!==file.bytes||contentChecksum(data.toString())!==file.checksum)throw new Error(`交付文件损坏：${file.path}`)}
const expected=read('consumer/expected-delivery.json')
if(expected.runtimeBuildId!==delivery.runtimeBuildId||expected.version!==delivery.version||expected.snapshotChecksum!==delivery.snapshotChecksum)throw new Error('Consumer 目标候选记录已过期。')
// The delivery is explicitly client-only. Give its import-time Markdown decoder
// the same DOM surface it receives in a browser before checking its identity.
const dom = new JSDOM('<!doctype html><html><body></body></html>')
Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.window.document })
Object.defineProperty(globalThis, 'window', { configurable: true, value: dom.window })
const executable=await import(pathToFileURL(resolve('artifacts/local-stable/package/dist/design-system.js')).href)
if(executable.RUNTIME_BUILD_ID!==delivery.runtimeBuildId)throw new Error('编译后的执行代码不匹配目标运行时。')
const installed=read('consumer/node_modules/@local/design-system/runtime-build.json')
if(installed.buildId!==delivery.runtimeBuildId)throw new Error('Consumer 安装的是旧包，请在 consumer 执行 npm install。')
if(!realpathSync('consumer/node_modules/@local/design-system').startsWith(resolve('consumer/node_modules')+'/'))throw new Error('Consumer 不能通过源码软链接自证。')
console.log(`Delivery verified: source, tarball SHA, snapshot payload, separate consumer install. ${delivery.version}`)
