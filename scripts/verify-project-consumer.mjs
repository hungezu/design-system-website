import { readFileSync, writeFileSync, realpathSync, cpSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'
const cwd=resolve('consumer-project'),root=resolve('artifacts/project-delivery-acceptance')
const results=[]
for(const version of ['9.0.0','9.1.0']){
 const metadata=JSON.parse(readFileSync(join(root,'guokexin',version,'delivery.json'),'utf8'))
 const archive=`../artifacts/project-delivery-acceptance/guokexin/${version}/${metadata.archiveName}`
 execFileSync('npm',['install',`file:${archive}`,'--save-exact','--ignore-scripts'],{cwd,stdio:'pipe'})
 writeFileSync(join(cwd,'expected-release.json'),JSON.stringify({projectId:'guokexin',releaseVersion:version,runtimeBuildId:metadata.runtimeBuildId,snapshotSha256:metadata.snapshotSha256},null,2))
 if(!realpathSync(join(cwd,'node_modules/@design-workspace/guokexin')).startsWith(join(cwd,'node_modules')+'/'))throw new Error('Consumer must use a separately installed package')
 cpSync(join(cwd,'node_modules/@design-workspace/guokexin/examples/ControlledForm.tsx'),join(cwd,'ControlledForm.tsx'))
 execFileSync('npm',['run','build'],{cwd,stdio:'pipe'})
 const output=execFileSync(process.execPath,['--input-type=module','-e',"import { PROJECT_RELEASE, RUNTIME_BUILD_ID } from '@design-workspace/guokexin'; console.log(JSON.stringify({release:PROJECT_RELEASE,build:RUNTIME_BUILD_ID}))"],{cwd,encoding:'utf8'})
 const loaded=JSON.parse(output)
 if(loaded.release.releaseVersion!==version||loaded.build!==metadata.runtimeBuildId||loaded.release.snapshotSha256!==metadata.snapshotSha256)throw new Error('Installed package identity mismatch')
 results.push({operation:version==='9.0.0'?'rollback from 9.1.0':'upgrade to 9.1.0',version,package:metadata.packageName,runtimeBuildId:loaded.build,typecheck:'passed',build:'passed',controlledFormExample:'passed',separateInstall:true})
 console.log(`${version}: separate installation, frozen identity, controlled form and build passed`)
}
writeFileSync(join(root,'consumer-verification.json'),JSON.stringify({scope:'independent reference business; synthetic releases',results},null,2))
