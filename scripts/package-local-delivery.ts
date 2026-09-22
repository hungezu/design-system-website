import { generateProjectDesignMarkdown } from '../src/services/design-markdown'
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { guokexinProject } from '../src/data/projects'
import { defaultProjectTheme } from '../src/services/project-theme'
import { createReleaseSnapshot, validateSnapshot, canonicalJson } from '../src/services/release-snapshot'
import identity from '../src/data/generated/runtime-build.json'
const version=`0.0.0-local.20260919.rev${identity.buildId.slice(7,19)}`,root='artifacts/local-stable',directory=join(root,'package')
rmSync(directory,{recursive:true,force:true});mkdirSync(directory,{recursive:true});cpSync('dist-types',join(directory,'types'),{recursive:true});mkdirSync(join(directory,'types/runtime/vendor'),{recursive:true});cpSync('src/runtime/vendor/runtime.d.ts',join(directory,'types/runtime/vendor/runtime.d.ts'));cpSync('src/runtime/vendor/types',join(directory,'types/runtime/vendor/types'),{recursive:true});cpSync('dist-library',join(directory,'dist'),{recursive:true})
for(const relative of ['delivery/index.d.ts','runtime/index.d.ts']){const path=join(directory,'types',relative);writeFileSync(path,readFileSync(path,'utf8').replace(/^import ['"][^'"\n]+(?:\.css)?['"];?\n/gm,''))}
const snapshot=createReleaseSnapshot({project:guokexinProject,theme:defaultProjectTheme(guokexinProject),version,status:'candidate',source:'project-source',note:'本地稳定版候选，尚未正式发布'})
validateSnapshot(snapshot)
mkdirSync(join(root,'snapshot'),{recursive:true})
for(const [name,asset]of Object.entries(snapshot.assets))writeFileSync(join(root,'snapshot',name),typeof asset==='string'?asset:canonicalJson(asset))
writeFileSync(join(directory,'DESIGN.md'),generateProjectDesignMarkdown(snapshot,{packageName:'@local/design-system',archiveName:`local-design-system-${version}.tgz`,mode:'candidate'}))
writeFileSync(join(directory,'tokens.json'),canonicalJson(snapshot.assets['tokens.json']))
writeFileSync(join(directory,'snapshot.json'),JSON.stringify(snapshot,null,2)+'\n')
writeFileSync(join(directory,'runtime-build.json'),JSON.stringify(identity,null,2)+'\n')
writeFileSync(join(directory,'package.json'),JSON.stringify({name:'@local/design-system',version,private:true,type:'module',license:'UNLICENSED',types:'./types/delivery/index.d.ts',exports:{'.':{types:'./types/delivery/index.d.ts',import:'./dist/design-system.js'},'./style.css':'./dist/style.css','./tokens.json':'./tokens.json','./snapshot.json':'./snapshot.json','./runtime-build.json':'./runtime-build.json','./DESIGN.md':'./DESIGN.md'},files:['dist','types','tokens.json','snapshot.json','runtime-build.json','DESIGN.md','THIRD_PARTY_NOTICES.md'],peerDependencies:{react:'^19.1.1','react-dom':'^19.1.1'},dependencies:Object.fromEntries(['react-aria-components','reicon-react'].map(name=>[name,JSON.parse(readFileSync(join('node_modules',name,'package.json'),'utf8')).version])),designSystemRuntimeBuild:identity.buildId},null,2)+'\n')
let notices='# Third-party notices\n\nThis private delivery includes dependencies under their respective licenses.\n'
for(const dependency of ['react-aria-components','react-aria','react-stately','@internationalized/date','lucide-react','reicon-react','@fontsource-variable/noto-sans-sc','tvision-color','@material/material-color-utilities','chroma-js','bezier-easing','@babel/runtime-corejs3','core-js-pure']){const dir=join('node_modules',dependency);const pkg=JSON.parse(readFileSync(join(dir,'package.json'),'utf8'));notices+=`\n## ${dependency} ${pkg.version}\nLicense: ${pkg.license??'See package license'}\n`;for(const name of readdirSync(dir).filter(n=>/^(license|ofl|copying)/i.test(n))){try{notices+='\n'+readFileSync(join(dir,name),'utf8')+'\n'}catch{/* Directories are not license text. */}}}
writeFileSync(join(directory,'THIRD_PARTY_NOTICES.md'),notices)
const packed=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--pack-destination','..'],{cwd:directory,encoding:'utf8'})) as Array<{filename:string}>
const archive=join(root,packed[0].filename)
writeFileSync(join(root,'delivery.json'),JSON.stringify({status:'candidate',version,runtimeBuildId:identity.buildId,archive,sha256:createHash('sha256').update(readFileSync(archive)).digest('hex'),snapshotChecksum:snapshot.entry.checksum,formalRelease:false},null,2)+'\n')
writeFileSync('consumer/expected-delivery.json',JSON.stringify({version,runtimeBuildId:identity.buildId,snapshotChecksum:snapshot.entry.checksum},null,2)+'\n')
writeFileSync('consumer/package.json',JSON.stringify({name:'design-system-independent-consumer',private:true,type:'module',scripts:{dev:'vite --force --host 127.0.0.1 --port 4178 --strictPort',build:'tsc --noEmit && vite build'},dependencies:{'@local/design-system':`file:../${archive}`,react:JSON.parse(readFileSync('node_modules/react/package.json','utf8')).version,'react-dom':JSON.parse(readFileSync('node_modules/react-dom/package.json','utf8')).version},devDependencies:Object.fromEntries(['vite','typescript','@types/react','@types/react-dom'].map(name=>[name,JSON.parse(readFileSync(join('node_modules',name,'package.json'),'utf8')).version]))},null,2)+'\n')
console.log(`Candidate package: ${archive}\nRuntime: ${identity.buildId}`)
