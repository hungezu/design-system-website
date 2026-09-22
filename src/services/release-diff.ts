import { loadReleaseAsset, type ReleaseCatalogEntry, type ReleaseAssetName } from './release-catalog'
import { canonicalJson } from './release-snapshot'
export interface AssetDifference { asset:string; id:string; kind:'added'|'removed'|'changed'; before?:unknown; after?:unknown }
export interface ReleaseDifference { changes:AssetDifference[]; unavailable:Array<{asset:string;reason:string}> }
export function compareMaps(asset:string,before:Record<string,unknown>,after:Record<string,unknown>):AssetDifference[]{return [...new Set([...Object.keys(before),...Object.keys(after)])].sort().flatMap(id=>id in before&&id in after&&canonicalJson(before[id])===canonicalJson(after[id])?[]:[{asset,id,kind:!(id in before)?'added':!(id in after)?'removed':'changed',before:before[id],after:after[id]}])}
function tokenMap(css:unknown){if(typeof css!=='string')throw new Error('Token CSS 格式无效');const entries=[...css.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)];if(!entries.length)throw new Error('Token CSS 没有可比较的声明');return Object.fromEntries(entries.map(match=>[match[1],match[2].trim()]))}
/** Flatten every collection, retaining metadata and never silently discarding malformed entries. */
export function assetRecords(value:unknown):Record<string,unknown>{
 if(!value||typeof value!=='object')throw new Error('资产格式无法解析')
 const output:Record<string,unknown>={}
 const list=(items:unknown[],prefix:string)=>{for(const item of items){if(!item||typeof item!=='object'||!('id'in item)||typeof item.id!=='string')throw new Error(`${prefix||'资产'}条目缺少 id`);const id=`${prefix}${item.id}`;if(Object.hasOwn(output,id))throw new Error(`重复资产 id：${id}`);output[id]=item}}
 if(Array.isArray(value)){list(value,'');return output}
 for(const [key,item] of Object.entries(value)){
  if(['availableComponents','icons','patterns','templates','bindings'].includes(key)&&Array.isArray(item)){
   if(key==='bindings')list(item.map(binding=>binding&&typeof binding==='object'?{...binding,id:binding.componentId}:binding),'bindings/')
   else list(item,`${key}/`)
  }else output[`@${key}`]=item
 }
 return output
}
export async function compareReleaseAssets(previous:ReleaseCatalogEntry,next:ReleaseCatalogEntry,loader=loadReleaseAsset):Promise<ReleaseDifference>{
 if(previous.projectId!==next.projectId)throw new Error('只能比较同一项目的版本。')
 const result:ReleaseDifference={changes:[],unavailable:[]}
 await Promise.all((['tokens.css','components.json','icons.json','recipes.json','patterns.json','layout.json','region-appearance.json'] as ReleaseAssetName[]).map(async name=>{try{const [before,after]=await Promise.all([loader<unknown>(previous,name),loader<unknown>(next,name)]);result.changes.push(...compareMaps(name,name==='tokens.css'?tokenMap(before):assetRecords(before),name==='tokens.css'?tokenMap(after):assetRecords(after)))}catch(error){result.unavailable.push({asset:name,reason:error instanceof Error?error.message:String(error)})}}))
 result.changes.sort((a,b)=>(a.asset+a.id).localeCompare(b.asset+b.id));result.unavailable.sort((a,b)=>a.asset.localeCompare(b.asset));return result
}
