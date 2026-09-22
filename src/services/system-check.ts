import { contrastRatio } from './project-theme'
import { RUNTIME_COMPONENT_REGISTRY } from '../runtime/registry'
export interface SystemFinding { rule:string; severity:'pass'|'warning'|'error'|'unverified'; evidence:string; line?:number }
export function runSystemChecks({variables,componentIds,source=''}:{variables:Record<string,string>;componentIds:string[];source?:string}):SystemFinding[]{
 const findings:SystemFinding[]=[]
 for(const [name,text,bg]of [['占位文字','--field-placeholder','--surface-primary'],['品牌按钮文字','--button-brand-filled-text-default','--button-brand-filled-bg-default']] as const){const ratio=contrastRatio(variables[text]??'',variables[bg]??'');findings.push({rule:`contrast:${text}`,severity:Number.isNaN(ratio)?'unverified':ratio>=4.5?'pass':'error',evidence:Number.isNaN(ratio)?`${name}使用了当前检查器尚未解析的颜色表达式。`:`${name}：${variables[text]} / ${variables[bg]} = ${ratio.toFixed(2)}:1`})}
 const knownExports=new Map(Object.values(RUNTIME_COMPONENT_REGISTRY).map(entry=>[entry.runtimeExport,entry.id]))
 const localTokens=new Set([...source.matchAll(/--([\w-]+)\s*:/g)].map(match=>`--${match[1]}`))
 source.split('\n').forEach((line,index)=>{
  for(const match of line.matchAll(/var\((--[\w-]+)/g))if(!(match[1] in variables)&&!localTokens.has(match[1]))findings.push({rule:'unknown-token',severity:'error',line:index+1,evidence:`未定义变量 ${match[1]}`})
  for(const match of line.matchAll(/<(DS\w+)\b/g)){const id=knownExports.get(match[1]);if(!id)findings.push({rule:'unknown-component',severity:'error',line:index+1,evidence:`Runtime 没有导出 ${match[1]}`});else if(!componentIds.includes(id))findings.push({rule:'project-component',severity:'warning',line:index+1,evidence:`${match[1]} 属于公共实现，未被当前项目显式启用。`})}
 })
 if(source&&!findings.some(item=>item.line))findings.push({rule:'source-references',severity:'pass',evidence:'输入文本中发现的 DS 组件和变量引用均可解析。此项不执行代码，也不证明交互正确。'})
 return findings
}
