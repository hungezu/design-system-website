import { generateProjectDesignMarkdown } from '../src/services/design-markdown'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { LocalReleaseSnapshot } from '../src/services/release-catalog'
import type { ProjectDeliveryArtifact, ProjectDeliveryStatus } from '../src/services/project-delivery'
import { canonicalJson, validateSnapshot } from '../src/services/release-snapshot'
import { readRuntimeArchive, sha256 } from './runtime-archive'
import templateSchema from '../template.schema.json'
const exec = promisify(execFile)
export function deliveryIdentity(snapshot: LocalReleaseSnapshot) {
  validateSnapshot(snapshot)
  const manifest = snapshot.assets['manifest.json'] as { projectName: string; status: string; componentRuntimeVersion: string; availableComponents: Array<{id:string;runtimeExport:string}> }
  if (manifest.status !== 'published') throw new Error('请先发布项目版本，再生成前端交付包。')
  const componentExports = manifest.availableComponents.map(item => item.runtimeExport)
  if (componentExports.some(name => !/^DS[A-Z][A-Za-z0-9_$]*$/.test(name)) || new Set(componentExports).size !== componentExports.length) throw new Error('项目组件导出名无效或重复。')
  return { projectId: manifest.projectName, releaseVersion: snapshot.entry.version, runtimeBuildId: manifest.componentRuntimeVersion, componentIds: manifest.availableComponents.map(item => item.id), componentExports, snapshotSha256: sha256(canonicalJson(snapshot)) }
}
export function deliveryGuide(artifact: Omit<ProjectDeliveryArtifact, 'sha256' | 'bytes' | 'createdAt'>): string {
  return `# ${artifact.projectId} / ${artifact.releaseVersion} 前端接入\n\n支持：React 19.1.1 及同主版本、React DOM、ES Modules。已验证 Vite 客户端工程；Vue、SSR 和其他 React 主版本未验证。\n\n## 安装\n\nnpm install ./${artifact.archiveName} --save-exact\n\n提交包文件（或上传到团队批准的内部制品存储）与依赖锁文件，确保 CI 能取得相同版本。\n\n## 交给 AI 使用\n\n同时提供 DESIGN.md 与本版本组件包。DESIGN.md 明确项目身份、主题边界、组件 API、状态与可编译示例；管理平台根目录的 DESIGN.md 不适用于业务页面。旧归档保持不变，如果旧包没有此文件，可从版本页另行下载对应的 AI 设计规范。\n\n## 接入\n\n\`\`\`tsx\nimport { ProjectTheme, DSButton, PROJECT_RELEASE } from '${artifact.packageName}'\nimport '${artifact.packageName}/style.css'\n\nexport function SaveAction({ saving, onSave }: { saving: boolean; onSave: () => void }) {\n  return <ProjectTheme><DSButton variant="primary" loading={saving} onClick={onSave}>保存</DSButton></ProjectTheme>\n}\n\`\`\`\n\nProjectTheme 使用包内冻结变量，正式 DS 弹窗继承所属主题。不要在业务运行时请求管理站获取主题。\n\n项目组件清单：${artifact.componentIds.join('、')}。此清单是项目使用约定，不提供业务权限隔离。包导出共享控件供组合；不包含内置演示工作流。字段值、表格数据、分页、业务校验、API 和权限由调用方负责。\n\nexamples/ControlledForm.tsx 演示调用方控制字段、校验、加载和提交；将 onSave 接到你自己的业务请求，并保留失败后的输入。\n\n## 升级与回退\n\n1. 在版本页比较新旧版本的实际资产差异，阅读发布说明，评估样式、属性和行为影响。\n2. 安装目标版本并提交锁文件，在业务页面验证正常、加载、失败、禁用与窄屏状态。项目草稿变化不会自动更新已安装包。\n3. 回退时重新安装原包并恢复锁文件。业务数据结构的变更需要业务系统另行制定回退方案。\n\n## 版本关联\n\n项目版本：${artifact.releaseVersion}\n组件运行时：${artifact.runtimeBuildId}\n完整快照 SHA-256：${artifact.snapshotSha256}\n\n首次接入应完成查询列表与编辑表单的真实业务验收。包内项目数据只属于此项目；组件代码和字体为共享实现。\n`
}
export function createDeliveryService(options: { runtimeRoot: string; outputRoot: string }) {
  const jobs = new Map<string, Promise<void>>()
  let queue: Promise<void> = Promise.resolve()
  const location = (snapshot: LocalReleaseSnapshot) => { const identity = deliveryIdentity(snapshot); return { ...identity, directory: join(options.outputRoot, identity.projectId, identity.releaseVersion), key: `${identity.projectId}/${identity.releaseVersion}` } }
  function status(snapshot: LocalReleaseSnapshot): ProjectDeliveryStatus {
    try {
      const info = location(snapshot), recordPath = join(info.directory, 'ready', 'delivery.json')
      const designSpec = generateProjectDesignMarkdown(snapshot, { packageName: `@design-workspace/${info.projectId}`, archiveName: `design-workspace-${info.projectId}-${info.releaseVersion}.tgz`, mode: 'project', snapshotSha256: info.snapshotSha256 })
      if (existsSync(recordPath)) {
        const artifact = JSON.parse(readFileSync(recordPath, 'utf8')) as ProjectDeliveryArtifact
        if (artifact.snapshotSha256 !== info.snapshotSha256 || artifact.runtimeBuildId !== info.runtimeBuildId || artifact.projectId !== info.projectId || artifact.releaseVersion !== info.releaseVersion) return { status: 'unavailable', message: '交付记录与冻结版本不一致，请联系平台管理员核对。' }
        const archive = readFileSync(join(info.directory, 'ready', artifact.archiveName))
        if (archive.length !== artifact.bytes || sha256(archive) !== artifact.sha256) return { status: 'unavailable', message: '已生成交付包校验失败，请联系平台管理员恢复原归档。' }
        return { status: 'ready', artifact, guide: deliveryGuide(artifact), designSpec }
      }
      if (jobs.has(info.key)) return { status: 'building', message: '正在准备组件包和接入说明…', designSpec }
      readRuntimeArchive(options.runtimeRoot, info.runtimeBuildId)
      if (existsSync(join(info.directory, 'attempt.json'))) return { status: 'failed', message: '上次生成未完成。可以重新生成；已发布版本不会被修改。', designSpec }
      return { status: 'not-generated', message: '该版本可以生成前端组件包。', designSpec }
    } catch (error) {
      let designSpec: string | undefined
      try { const info = location(snapshot); designSpec = generateProjectDesignMarkdown(snapshot, { packageName: `@design-workspace/${info.projectId}`, archiveName: `design-workspace-${info.projectId}-${info.releaseVersion}.tgz`, mode: 'project', snapshotSha256: info.snapshotSha256 }) } catch { /* Invalid specification stays unavailable. */ }
      return { status: 'unavailable', message: error instanceof Error ? error.message : '无法读取交付记录。', designSpec }
    }
  }
  function preflight(runtimeBuildId: string) {
    try { readRuntimeArchive(options.runtimeRoot, runtimeBuildId); return { status: 'ready' as const, runtimeBuildId, message: '匹配的组件运行时归档已就绪，发布后可生成交付包。' } }
    catch (error) { return { status: 'unavailable' as const, runtimeBuildId, message: error instanceof Error ? error.message : '组件运行时不可用。' } }
  }
  async function build(snapshot: LocalReleaseSnapshot) {
    const info = location(snapshot)
    const runtime = readRuntimeArchive(options.runtimeRoot, info.runtimeBuildId)
    mkdirSync(info.directory, { recursive: true })
    writeFileSync(join(info.directory, 'attempt.json'), JSON.stringify({ startedAt: new Date().toISOString() }))
    const stage = mkdtempSync(join(info.directory, '.build-')), pkgDir = join(stage, 'package')
    try {
      mkdirSync(pkgDir)
      // Copy only checked files, not unrelated artifacts alongside an archive.
      for (const file of runtime.manifest.files.filter(file => !file.path.startsWith('dist/release-assets/'))) { const target = join(pkgDir, file.path); mkdirSync(join(target, '..'), { recursive: true }); cpSync(join(runtime.directory, file.path), target) }
      const packageName = `@design-workspace/${info.projectId}`, packageVersion = info.releaseVersion
      const archiveName = `design-workspace-${info.projectId}-${packageVersion}.tgz`
      const identity = { projectId: info.projectId, releaseVersion: info.releaseVersion, packageName, packageVersion, runtimeBuildId: info.runtimeBuildId, snapshotChecksum: snapshot.entry.checksum!, snapshotSha256: info.snapshotSha256, componentIds: info.componentIds, archiveName }
      writeFileSync(join(pkgDir, 'tokens.json'), canonicalJson(snapshot.assets['tokens.json']))
      writeFileSync(join(pkgDir, 'snapshot.json'), canonicalJson(snapshot))
      const patterns = snapshot.assets['patterns.json'] as { templates?: unknown[] }
      writeFileSync(join(pkgDir, 'templates.json'), canonicalJson({ schemaVersion: 'page-template-collection/1', templateSchema, templates: patterns?.templates ?? [] }))
      writeFileSync(join(pkgDir, 'release.json'), JSON.stringify(identity, null, 2))
      const componentValueExports = info.componentExports.length ? `export { ${info.componentExports.join(', ')} } from './dist/runtime.js';\n` : ''
      const componentTypeExports = info.componentExports.length ? `export { ${info.componentExports.join(', ')} } from './types/delivery/project-runtime';\n` : ''
      writeFileSync(join(pkgDir, 'index.js'), `import { createElement } from 'react';\nimport { PreviewScope } from './dist/runtime.js';\n${componentValueExports}export { RUNTIME_BUILD_ID } from './dist/runtime.js';\nconst tokens = ${canonicalJson(snapshot.assets['tokens.json'])};\nexport const PROJECT_RELEASE = Object.freeze(${JSON.stringify(identity)});\nexport function ProjectTheme({children}) { return createElement(PreviewScope, {vars:tokens}, children); }\n`)
      writeFileSync(join(pkgDir, 'index.d.ts'), `export type * from './types/delivery/project-runtime';\n${componentTypeExports}export { RUNTIME_BUILD_ID } from './types/delivery/project-runtime';\nimport type { ReactNode, ReactElement } from 'react';\nexport declare const PROJECT_RELEASE: Readonly<{ projectId:string; releaseVersion:string; runtimeBuildId:string; snapshotChecksum:string; snapshotSha256:string; componentIds:readonly string[] }>;\nexport declare function ProjectTheme(props:{children:ReactNode}):ReactElement;\n`)
      writeFileSync(join(pkgDir, 'README.md'), deliveryGuide(identity))
      writeFileSync(join(pkgDir, 'DESIGN.md'), generateProjectDesignMarkdown(snapshot, { packageName, archiveName, mode: 'project', snapshotSha256: info.snapshotSha256 }))
      mkdirSync(join(pkgDir, 'examples'))
      writeFileSync(join(pkgDir, 'examples/ControlledForm.tsx'), `import { DSInput, DSButton, DSAlert, ProjectTheme } from '${packageName}'\nexport function ControlledForm({name,error,saving,onChange,onSave}:{name:string;error?:string;saving:boolean;onChange:(value:string)=>void;onSave:()=>void}) {\n return <ProjectTheme><form onSubmit={event=>{event.preventDefault();if(!saving)onSave()}}><DSInput label="资源名称" value={name} onChange={onChange} required invalid={!!error} errorMessage={error}/>{error&&<DSAlert title="保存失败">{error}</DSAlert>}<DSButton type="submit" variant="primary" loading={saving}>保存</DSButton></form></ProjectTheme>\n}\n`)
      writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({ name: packageName, version: packageVersion, private: true, type: 'module', license: 'UNLICENSED', types: './index.d.ts', exports: { '.': { types: './index.d.ts', import: './index.js' }, './style.css': './dist/style.css', './tokens.json': './tokens.json', './templates.json': './templates.json', './snapshot.json': './snapshot.json', './release.json': './release.json', './DESIGN.md': './DESIGN.md' }, files: ['index.js','index.d.ts','dist','types','tokens.json','templates.json','snapshot.json','release.json','README.md','DESIGN.md','examples','THIRD_PARTY_NOTICES.md'], peerDependencies: runtime.manifest.peerDependencies }, null, 2))
      const { stdout } = await exec('npm', ['pack','--ignore-scripts','--json','--pack-destination',stage], { cwd: pkgDir, timeout: 120_000, maxBuffer: 1_000_000 })
      const packed = JSON.parse(stdout) as Array<{filename:string}>
      if (packed[0]?.filename !== archiveName) throw new Error('生成的包文件名不一致。')
      const bytes = readFileSync(join(stage, archiveName))
      const artifact: ProjectDeliveryArtifact = { ...identity, sha256: sha256(bytes), bytes: bytes.length, createdAt: new Date().toISOString() }
      const completed = join(stage, 'complete')
      mkdirSync(completed)
      renameSync(join(stage, archiveName), join(completed, archiveName))
      writeFileSync(join(completed, 'delivery.json'), JSON.stringify(artifact, null, 2))
      // Publish the pair atomically. A nonempty ready directory cannot be replaced.
      try { renameSync(completed, join(info.directory, 'ready')) }
      catch (error) { if (status(snapshot).status !== 'ready') throw error }
      rmSync(join(info.directory, 'attempt.json'), { force: true })
    } finally { rmSync(stage, { recursive: true, force: true }) }
  }
  function start(snapshot: LocalReleaseSnapshot): ProjectDeliveryStatus {
    const current = status(snapshot)
    if (current.status === 'ready' || current.status === 'building' || current.status === 'unavailable') return current
    const info = location(snapshot), captured = structuredClone(snapshot)
    const pending = queue.then(() => build(captured)).catch(() => { /* A persistent attempt record exposes retry without leaking process output. */ }).finally(() => { jobs.delete(info.key) })
    jobs.set(info.key, pending); queue = pending
    return { status: 'building', message: '正在准备组件包和接入说明…' }
  }
  function download(snapshot: LocalReleaseSnapshot) {
    const result = status(snapshot)
    if (result.status !== 'ready' || !result.artifact) throw new Error('组件包尚未就绪或完整性校验失败。')
    return { artifact: result.artifact, data: readFileSync(join(location(snapshot).directory, 'ready', result.artifact.archiveName)) }
  }
  function removeProject(projectId: string) {
    if (jobs.has(projectId) || [...jobs.keys()].some(key => key.startsWith(`${projectId}/`))) throw new Error('项目交付包正在生成，请稍后再删除。')
    rmSync(join(options.outputRoot, projectId), { recursive: true, force: true })
  }
  return { status, preflight, start, download, removeProject, idle: () => queue }
}
