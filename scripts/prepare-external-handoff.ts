import { mkdirSync,writeFileSync } from 'node:fs'
import { guokexinProject } from '../src/data/projects'
import { semanticTokens } from '../src/data/global/semantic-tokens'
import { getDesktopComponentBinding } from '../src/design-system/component-bindings'
import { getRuntimeComponent } from '../src/runtime/registry'
import { projectPreviewVariables,defaultProjectTheme } from '../src/services/project-theme'
import identity from '../src/data/generated/runtime-build.json'
const directory='artifacts/external-handoff';mkdirSync(directory,{recursive:true})
const variables=projectPreviewVariables(defaultProjectTheme(guokexinProject))
const color=(hex:string)=>/^#[\da-f]{6}$/i.test(hex)?{r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255}:null
const payload={schema:'figma-handoff/1',projectId:guokexinProject.id,runtimeBuildId:identity.buildId,connectionStatus:'unbound',targetFileKey:null,variables:semanticTokens.map(token=>({id:token.id,name:token.name,category:token.category,value:variables[`--${token.id}`],figmaColor:color(variables[`--${token.id}`]??'')})),components:guokexinProject.componentIds.map(id=>({id,runtime:getRuntimeComponent(id),binding:getDesktopComponentBinding(id),figmaNodeId:null,codeConnectStatus:'unbound'}))}
writeFileSync(`${directory}/figma-handoff.json`,JSON.stringify(payload,null,2)+'\n')
writeFileSync(`${directory}/collaboration-contract.json`,JSON.stringify({schema:'workspace-service-contract/1',status:'adapter-ready-server-not-configured',authentication:'server-owned; browser must not supply trusted roles',read:{method:'GET',path:'/workspaces/:id',response:'{ revision, workspace: design-workspace-backup/1 }'},save:{method:'PUT',path:'/workspaces/:id',headers:{'If-Match':'revision'},conflictStatus:[409,412]},review:{method:'POST',path:'/review',request:'{ projectId, version, source, allowedComponents }',response:'{ summary, findings: [{rule,evidence,line?}] }'}},null,2)+'\n')
console.log('Prepared Figma data and external API contracts; no external write or deployment performed.')
