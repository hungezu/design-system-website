import { generateProjectDesignMarkdown } from '../src/services/design-markdown'
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { guokexinProject } from '../src/data/projects'
import { defaultProjectTheme } from '../src/services/project-theme'
import { createReleaseSnapshot, validateSnapshot, canonicalJson } from '../src/services/release-snapshot'
import { computeRuntimeIdentity } from './runtime-identity'
import identity from '../src/data/generated/runtime-build.json'

type CandidateManifest = {
  availableComponents: Array<{ id:string; runtimeExport:string }>
}
type PackResult = {
  filename:string
  files?:Array<{path:string}>
}

function buildDay() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).map(part => [part.type, part.value]))
  return `${parts.year}${parts.month}${parts.day}`
}

function listEntries(directory:string, prefix=''):string[] {
  return readdirSync(directory, { withFileTypes:true }).flatMap(entry => {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name
    return entry.isDirectory() ? [relative, ...listEntries(join(directory, entry.name), relative)] : [relative]
  })
}

function releaseAssetEntries(directory:string) {
  return listEntries(directory).filter(path => path.split('/').includes('release-assets'))
}

if (computeRuntimeIdentity().buildId !== identity.buildId) throw new Error('源码在构建期间发生变化，请重新执行 delivery:build。')

const version=`0.0.0-local.${buildDay()}.rev${identity.buildId.slice(7,19)}`
const root='artifacts/local-stable'
const directory=join(root,'package')

rmSync(directory,{recursive:true,force:true})
mkdirSync(directory,{recursive:true})
cpSync('dist-types',join(directory,'types'),{recursive:true})
mkdirSync(join(directory,'types/runtime/vendor'),{recursive:true})
cpSync('src/runtime/vendor/runtime.d.ts',join(directory,'types/runtime/vendor/runtime.d.ts'))
cpSync('src/runtime/vendor/types',join(directory,'types/runtime/vendor/types'),{recursive:true})
cpSync('dist-library',join(directory,'dist'),{recursive:true})

const copiedReleaseAssets=releaseAssetEntries(join(directory,'dist'))
if(copiedReleaseAssets.length)throw new Error(`候选包禁止包含历史 release-assets：${copiedReleaseAssets.slice(0,3).join('、')}`)

for(const relative of ['delivery/index.d.ts','runtime/index.d.ts']){
  const path=join(directory,'types',relative)
  writeFileSync(path,readFileSync(path,'utf8').replace(/^import ['"][^'"\n]+(?:\.css)?['"];?\n/gm,''))
}

const snapshot=createReleaseSnapshot({project:guokexinProject,theme:defaultProjectTheme(guokexinProject),version,status:'candidate',source:'project-source',note:'本地稳定版候选，尚未正式发布'})
validateSnapshot(snapshot)
const manifest=snapshot.assets['manifest.json'] as CandidateManifest
const componentExports=manifest.availableComponents.map(component=>component.runtimeExport)
if(componentExports.some(name=>!/^DS[A-Z][A-Za-z0-9_$]*$/.test(name))||new Set(componentExports).size!==componentExports.length)throw new Error('候选项目组件导出名无效或重复。')

rmSync(join(root,'snapshot'),{recursive:true,force:true})
mkdirSync(join(root,'snapshot'),{recursive:true})
for(const [name,asset]of Object.entries(snapshot.assets))writeFileSync(join(root,'snapshot',name),typeof asset==='string'?asset:canonicalJson(asset))

const rootExports=[...componentExports,'PreviewScope','RUNTIME_BUILD_ID']
writeFileSync(join(directory,'index.js'),`export { ${rootExports.join(', ')} } from './dist/design-system.js';\n`)
writeFileSync(join(directory,'index.d.ts'),`export { ${rootExports.join(', ')} } from './types/delivery/index';\n`)
writeFileSync(join(directory,'DESIGN.md'),generateProjectDesignMarkdown(snapshot,{packageName:'@local/design-system',archiveName:`local-design-system-${version}.tgz`,mode:'candidate'}))
writeFileSync(join(directory,'tokens.json'),canonicalJson(snapshot.assets['tokens.json']))
writeFileSync(join(directory,'snapshot.json'),JSON.stringify(snapshot,null,2)+'\n')
writeFileSync(join(directory,'runtime-build.json'),JSON.stringify(identity,null,2)+'\n')
writeFileSync(join(directory,'package.json'),JSON.stringify({
  name:'@local/design-system',version,private:true,type:'module',license:'UNLICENSED',types:'./index.d.ts',
  exports:{'.':{types:'./index.d.ts',import:'./index.js'},'./style.css':'./dist/style.css','./tokens.json':'./tokens.json','./snapshot.json':'./snapshot.json','./runtime-build.json':'./runtime-build.json','./DESIGN.md':'./DESIGN.md'},
  files:['index.js','index.d.ts','dist','types','tokens.json','snapshot.json','runtime-build.json','DESIGN.md','THIRD_PARTY_NOTICES.md'],
  peerDependencies:{react:'^19.1.1','react-dom':'^19.1.1'},
  dependencies:Object.fromEntries(['react-aria-components','reicon-react'].map(name=>[name,JSON.parse(readFileSync(join('node_modules',name,'package.json'),'utf8')).version])),
  designSystemRuntimeBuild:identity.buildId,
  designSystemApprovedExports:componentExports,
},null,2)+'\n')

let notices='# Third-party notices\n\nThis private delivery includes dependencies under their respective licenses.\n'
for(const dependency of ['react-aria-components','react-aria','react-stately','@internationalized/date','lucide-react','reicon-react','@fontsource-variable/noto-sans-sc','tvision-color','@material/material-color-utilities','chroma-js','bezier-easing','@babel/runtime-corejs3','core-js-pure']){
  const dir=join('node_modules',dependency)
  const pkg=JSON.parse(readFileSync(join(dir,'package.json'),'utf8'))
  notices+=`\n## ${dependency} ${pkg.version}\nLicense: ${pkg.license??'See package license'}\n`
  for(const name of readdirSync(dir).filter(name=>/^(license|ofl|copying)/i.test(name))){try{notices+='\n'+readFileSync(join(dir,name),'utf8')+'\n'}catch{/* Directories are not license text. */}}
}
writeFileSync(join(directory,'THIRD_PARTY_NOTICES.md'),notices)

const packed=(JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--pack-destination','..'],{cwd:directory,encoding:'utf8'})) as PackResult[])[0]
const packedReleaseAssets=(packed.files??[]).map(file=>file.path).filter(path=>path.split('/').includes('release-assets'))
if(packedReleaseAssets.length){rmSync(join(root,packed.filename),{force:true});throw new Error(`候选 tarball 禁止包含历史 release-assets：${packedReleaseAssets.slice(0,3).join('、')}`)}

const archive=join(root,packed.filename)
writeFileSync(join(root,'delivery.json'),JSON.stringify({status:'candidate',version,runtimeBuildId:identity.buildId,archive,sha256:createHash('sha256').update(readFileSync(archive)).digest('hex'),snapshotChecksum:snapshot.entry.checksum,approvedComponentCount:componentExports.length,formalRelease:false},null,2)+'\n')
writeFileSync('consumer/expected-delivery.json',JSON.stringify({version,runtimeBuildId:identity.buildId,snapshotChecksum:snapshot.entry.checksum,componentExports},null,2)+'\n')
writeFileSync('consumer/package.json',JSON.stringify({name:'design-system-independent-consumer',private:true,type:'module',scripts:{dev:'vite --force --host 127.0.0.1 --port 4178 --strictPort',build:'tsc --noEmit && vite build'},dependencies:{'@local/design-system':`file:../${archive}`,react:JSON.parse(readFileSync('node_modules/react/package.json','utf8')).version,'react-dom':JSON.parse(readFileSync('node_modules/react-dom/package.json','utf8')).version},devDependencies:Object.fromEntries(['vite','typescript','@types/react','@types/react-dom'].map(name=>[name,JSON.parse(readFileSync(join('node_modules',name,'package.json'),'utf8')).version]))},null,2)+'\n')
console.log(`Candidate package: ${archive}\nRuntime: ${identity.buildId}\nApproved root DS exports: ${componentExports.length}`)
