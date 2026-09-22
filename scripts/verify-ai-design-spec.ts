import { AI_COMPONENT_IDS } from '../src/data/ai-components'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { createDeliveryService } from '../server/project-delivery'
import { createReleaseSnapshot } from '../src/services/release-snapshot'
import { defaultProjectTheme } from '../src/services/project-theme'
import { guokexinProject, testCustomerBProject } from '../src/data/projects'
import { generateProjectDesignMarkdown } from '../src/services/design-markdown'
import { computeRuntimeIdentity } from './runtime-identity'
import runtimeBuild from '../src/data/generated/runtime-build.json'

if (computeRuntimeIdentity().buildId !== runtimeBuild.buildId) throw new Error('请先运行 delivery:runtime，确保消费的是当前匹配构建。')
const root = process.cwd(), temp = realpathSync(mkdtempSync(join(tmpdir(), 'design-md-consumer-')))
const output = resolve('artifacts/design-md-acceptance')
mkdirSync(output, { recursive: true })
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const version = (name: string) => read(join(root, 'node_modules', name, 'package.json')).version
const consumer = join(temp, 'consumer'); mkdirSync(consumer)
writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'design-md-independent-check', private: true, type: 'module', dependencies: { react: version('react'), 'react-dom': version('react-dom') }, devDependencies: { '@types/react': version('@types/react'), '@types/react-dom': version('@types/react-dom') } }, null, 2))
writeFileSync(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', jsx: 'react-jsx', strict: true, skipLibCheck: true, noEmit: true, resolveJsonModule: true, esModuleInterop: true, lib: ['ES2022','DOM'] }, include: ['*.tsx'] }, null, 2))
const service = createDeliveryService({ runtimeRoot: resolve('artifacts/runtime-builds'), outputRoot: join(temp, 'packages') })
const checks: object[] = []
try {
  for (const [project, releaseVersion, color] of [[testCustomerBProject, '8.0.0', '#006A70'], [guokexinProject, '8.0.0', '#165DFF'], [guokexinProject, '8.1.0', '#6236FF']] as const) {
    const snapshot = createReleaseSnapshot({ project: {...project,componentIds:[...new Set([...project.componentIds,...AI_COMPONENT_IDS])]}, theme: { ...defaultProjectTheme(project), brandPrimary: color }, version: releaseVersion, status: 'published', note: 'AI 规范独立消费验收，仅测试夹具' })
    service.start(snapshot); await service.idle()
    const result = service.status(snapshot)
    if (result.status !== 'ready' || !result.artifact || !result.designSpec) throw new Error(JSON.stringify(result))
    const artifact = result.artifact, dir = join(output, project.id, releaseVersion); mkdirSync(dir, { recursive: true })
    const archive = join(dir, artifact.archiveName)
    writeFileSync(archive, service.download(snapshot).data)
    writeFileSync(join(dir, 'DESIGN.md'), result.designSpec)
    const installed = spawnSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--offline', '--save-exact', archive], { cwd: consumer, encoding: 'utf8' })
    if (installed.status !== 0) throw new Error(`独立安装失败：${installed.stderr || installed.stdout}`)
    const packageRoot = join(consumer, 'node_modules', ...artifact.packageName.split('/'))
    const md = readFileSync(join(packageRoot, 'DESIGN.md'), 'utf8')
    if (md !== result.designSpec) throw new Error('包内 DESIGN.md 与下载文档不一致。')
    const codeBlocks = [...md.matchAll(/```tsx\n([\s\S]*?)```/g)].map(match => match[1])
    const code = codeBlocks[0]
    if (!code) throw new Error('文档缺少可编译示例。')
    if (!md.includes(`| \`--brand-primary\` | ${color} |`)) throw new Error('文档丢失冻结项目色。')
    writeFileSync(join(consumer, 'Generated.tsx'), code)
    codeBlocks.slice(1).forEach((example,index) => writeFileSync(join(consumer, `Example${index + 1}.tsx`), example))
    execFileSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', consumer], { cwd: consumer, stdio: 'pipe' })
    const cssVariables = [...md.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(match => match[1])
    const tokens = read(join(packageRoot, 'tokens.json'))
    if (cssVariables.some(name => !(name in tokens))) throw new Error('示例引用不存在的 Token。')
    // Negative control: ensure declarations catch a common event/value API mistake.
    writeFileSync(join(consumer, 'Generated.tsx'), code.replace('onChange={value => { setQuery(value);', 'onChange={event => { setQuery(event.target.value);'))
    const invalid = spawnSync(process.execPath, [join(root, 'node_modules/typescript/bin/tsc'), '-p', consumer], { cwd: consumer, encoding: 'utf8' })
    if (invalid.status === 0 || !invalid.stdout.includes('target')) throw new Error('类型检查没有识别错误的 DSInput onChange 用法。')
    writeFileSync(join(consumer, 'Generated.tsx'), code)
    writeFileSync(join(consumer, 'example.css'), md.match(/```css\n([\s\S]*?)```/)?.[1] ?? '')
    const identity = read(join(packageRoot, 'release.json'))
    if (identity.projectId !== project.id || identity.releaseVersion !== releaseVersion || identity.snapshotSha256 !== artifact.snapshotSha256) throw new Error('独立安装版本关联错误。')
    checks.push({ projectId: project.id, releaseVersion, color, packageName: artifact.packageName, sha256: artifact.sha256, snapshotSha256: artifact.snapshotSha256, documentBytes: Buffer.byteLength(md), independentTypecheck: 'pass', compiledExamples: codeBlocks.length, invalidEventRejected: true, tokenReferences: cssVariables.length })
    console.log(`${project.id}/${releaseVersion}: DESIGN.md identity, API, tokens and independent compilation PASS`)
  }
  writeFileSync(join(consumer, 'index.html'), '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>AI 设计规范独立消费验收</title></head><body><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>')
  writeFileSync(join(consumer, 'main.tsx'), `import { createRoot } from 'react-dom/client'\nimport { useState } from 'react'\nimport { GeneratedResourcePage } from './Generated'\nimport './example.css'\nfunction App(){const [rows,setRows]=useState(Array.from({length:12},(_,index)=>({id:String(index),name:'验收资源 '+(index+1),owner:'测试数据'})));return <GeneratedResourcePage rows={rows} loading={false} onRetry={()=>{}} onCreate={()=>setRows(current=>[{id:String(Date.now()),name:'新增验收资源',owner:'测试数据'},...current])}/>}\ncreateRoot(document.getElementById('root')!).render(<App/>)\n`)
  const config = join(consumer, 'vite.config.mjs')
  writeFileSync(config, `export default ${JSON.stringify({ root: consumer, esbuild: { jsx: 'automatic' }, build: { outDir: join(output, 'consumer-dist'), emptyOutDir: true } })}`)
  execFileSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--config', config], { cwd: consumer, stdio: 'pipe', encoding: 'utf8' })
  cpSync(join(consumer, 'Generated.tsx'), join(output, 'GeneratedResourcePage.tsx'))
  const local = createReleaseSnapshot({ project: guokexinProject, theme: defaultProjectTheme(guokexinProject), version: '0.0.0-local.spec-audit', status: 'candidate' })
  writeFileSync(join(output, 'CANDIDATE-DESIGN.md'), generateProjectDesignMarkdown(local, { packageName: '@local/design-system', archiveName: 'local-design-system-0.0.0-local.spec-audit.tgz', mode: 'candidate' }))
  writeFileSync(join(output, 'verification.json'), JSON.stringify({ scope: 'Isolated fixtures, not user releases. Mechanical consumption checks, not a multi-model generation evaluation.', runtimeBuildId: runtimeBuild.buildId, checks, browserFixture: 'consumer-dist' }, null, 2))
  console.log('AI design Markdown consumption checks PASS. Artifacts: artifacts/design-md-acceptance')
} finally { await service.idle(); rmSync(temp, { recursive: true, force: true }) }
