import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { createResourceApi } from './api.mjs'
const api=createResourceApi({dataFile:resolve('.data/resources.json')})
api.listen(4187,'127.0.0.1')
api.on('error',error=>{console.error(error.message);process.exit(1)})
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--force'],{stdio:'inherit'})
let stopping=false
function stop(){if(stopping)return;stopping=true;vite.kill('SIGTERM');api.close();api.closeAllConnections()}
vite.on('exit',stop);process.on('SIGINT',stop);process.on('SIGTERM',stop)
