import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
function files(path:string):string[]{return readdirSync(path,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(path,entry.name)):[join(path,entry.name)])}
export function computeRuntimeIdentity(root=process.cwd()){
 const inputs=files(join(root,'src')).filter(path=>/\.(ts|tsx|js|css|json)$/.test(path)&&!/(\.test\.|\.stories\.|runtime-build\.json$)/.test(path)).sort()
 for(const file of ['package-lock.json','package.json','vite.delivery.config.ts','tsconfig.delivery.json','scripts/package-local-delivery.ts','scripts/build-delivery-types.ts','vite.project-delivery.config.ts','tsconfig.project-delivery.json','scripts/archive-project-runtime.ts','scripts/generate-token-css.ts','scripts/generate-runtime-api.ts']){const path=join(root,file);if(existsSync(path))inputs.push(path)}
 const hash=createHash('sha256');for(const path of inputs){hash.update(relative(root,path));hash.update(readFileSync(path))}
 return {schema:'runtime-identity/1',buildId:`sha256:${hash.digest('hex')}`,files:inputs.map(path=>relative(root,path))}
}
