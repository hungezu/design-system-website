import { resolve } from 'node:path'
import { createWorkspace } from './workspace'
const production = process.argv.includes('--production')
const port = Number(process.env.WORKSPACE_PORT ?? 5174)
const workspace = createWorkspace({
  dbPath: resolve(process.env.WORKSPACE_DB ?? '.workspace/workspace.sqlite'),
  appOrigin: process.env.APP_ORIGIN ?? (production ? `http://127.0.0.1:${port}` : 'http://127.0.0.1:5173'),
  serveStatic: production,
})
workspace.server.listen(port, process.env.WORKSPACE_HOST ?? '127.0.0.1', () => {
  console.log(`Workspace service: http://127.0.0.1:${port}`)
  console.log(`首次初始化时，请从本机 ${workspace.setupFile} 读取初始化码。账号由你在网站上设置。`)
})
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { void workspace.close().then(() => process.exit(0)) })
