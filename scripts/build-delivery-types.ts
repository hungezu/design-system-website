import { rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
rmSync(new URL('../dist-types/',import.meta.url),{recursive:true,force:true})
execFileSync('node',['node_modules/typescript/bin/tsc','-p','tsconfig.delivery.json'],{stdio:'inherit'})
