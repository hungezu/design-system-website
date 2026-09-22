import { writeFileSync } from 'node:fs'
import { computeRuntimeIdentity } from './runtime-identity'
const identity=computeRuntimeIdentity()
writeFileSync('src/data/generated/runtime-build.json',JSON.stringify(identity,null,2)+'\n')
console.log(identity.buildId)
