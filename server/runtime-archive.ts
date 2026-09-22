import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs'
import { join } from 'node:path'
export const sha256 = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
export interface RuntimeArchive {
  schema: 'project-runtime-archive/1'
  buildId: string
  peerDependencies: Record<string, string>
  files: Array<{ path: string; bytes: number; sha256: string }>
}
export function listFiles(root: string, prefix = ''): string[] {
  return readdirSync(join(root, prefix), { withFileTypes: true }).flatMap(entry => {
    if (entry.isSymbolicLink()) throw new Error('运行时归档不能包含软链接。')
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    return entry.isDirectory() ? listFiles(root, path) : [path]
  }).sort()
}
export function readRuntimeArchive(root: string, buildId: string): { directory: string; manifest: RuntimeArchive } {
  if (!/^sha256:[a-f0-9]{64}$/.test(buildId)) throw new Error('版本的运行时标识无效。')
  const directory = join(root, buildId.slice(7))
  if (!existsSync(join(directory, 'runtime-archive.json'))) throw new Error('此版本缺少匹配的组件代码归档，请联系平台管理员准备对应构建。')
  const manifest = JSON.parse(readFileSync(join(directory, 'runtime-archive.json'), 'utf8')) as RuntimeArchive
  if (manifest.schema !== 'project-runtime-archive/1' || manifest.buildId !== buildId || !Array.isArray(manifest.files)) throw new Error('运行时归档标识不一致。')
  const paths = new Set<string>()
  for (const file of manifest.files) {
    if (!/^[\w./-]+$/.test(file.path) || file.path.split('/').some(part => !part || part === '.' || part === '..') || paths.has(file.path)) throw new Error('运行时归档路径无效。')
    paths.add(file.path)
    const path = join(directory, file.path)
    // Reject symlinks in any path segment, including directories.
    let parent = directory
    for (const segment of file.path.split('/')) { parent = join(parent, segment); if (lstatSync(parent).isSymbolicLink()) throw new Error('运行时归档不能包含软链接。') }
    const bytes = readFileSync(path)
    if (bytes.length !== file.bytes || sha256(bytes) !== file.sha256) throw new Error('运行时归档内容校验失败。')
  }
  if (listFiles(directory).filter(path => path !== 'runtime-archive.json').some(path => !paths.has(path))) throw new Error('运行时归档包含未登记文件。')
  for (const required of ['dist/runtime.js','dist/style.css','types/delivery/project-runtime.d.ts','THIRD_PARTY_NOTICES.md']) if (!paths.has(required)) throw new Error('运行时归档不完整。')
  return { directory, manifest }
}
