import { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync, existsSync, renameSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { listFiles, sha256, readRuntimeArchive, type RuntimeArchive } from '../server/runtime-archive'
import { computeRuntimeIdentity } from './runtime-identity'
import identity from '../src/data/generated/runtime-build.json'
if (computeRuntimeIdentity().buildId !== identity.buildId) throw new Error('源码在构建期间发生变化，请重新构建。')
const executable = await import(pathToFileURL(resolve('dist-project-runtime/runtime.js')).href)
if (executable.RUNTIME_BUILD_ID !== identity.buildId) throw new Error('编译代码的运行时标识不一致。')
const root = 'artifacts/runtime-builds', directory = join(root, identity.buildId.slice(7))
if (existsSync(directory)) { readRuntimeArchive(root, identity.buildId); console.log(`Runtime archive already verified: ${identity.buildId}`) }
else {
  const stage = `${directory}.tmp-${process.pid}`
  mkdirSync(stage, { recursive: true })
  try {
    cpSync('dist-project-runtime', join(stage, 'dist'), { recursive: true })
    cpSync('dist-project-types', join(stage, 'types'), { recursive: true })
    mkdirSync(join(stage, 'types/runtime/vendor'), { recursive: true })
    cpSync('src/runtime/vendor/runtime.d.ts', join(stage, 'types/runtime/vendor/runtime.d.ts'))
    cpSync('src/runtime/vendor/types', join(stage, 'types/runtime/vendor/types'), { recursive: true })
    for (const path of listFiles(join(stage, 'types')).filter(path => path.endsWith('.d.ts'))) {
      const file = join(stage, 'types', path)
      writeFileSync(file, readFileSync(file, 'utf8').replace(/^import ['"][^'"\n]+\.css['"];?\n/gm, ''))
    }
    let notices = '# Third-party notices\n\nPrivate component delivery. Included dependencies retain their respective licenses.\n'
    for (const dependency of ['react-aria-components','react-aria','react-stately','@internationalized/date','lucide-react','reicon-react','@fontsource-variable/noto-sans-sc','tvision-color','@material/material-color-utilities','chroma-js','bezier-easing','@babel/runtime-corejs3','core-js-pure']) {
      const location = join('node_modules', dependency), pkg = JSON.parse(readFileSync(join(location, 'package.json'), 'utf8'))
      notices += `\n## ${dependency} ${pkg.version}\nLicense: ${pkg.license ?? 'See package license'}\n`
      for (const file of readdirSync(location).filter(name => /^(license|ofl|copying)/i.test(name))) {
        try { notices += readFileSync(join(location, file), 'utf8') + '\n' } catch { /* License directories are not text files. */ }
      }
    }
    writeFileSync(join(stage, 'THIRD_PARTY_NOTICES.md'), notices)
    const manifest: RuntimeArchive = { schema: 'project-runtime-archive/1', buildId: identity.buildId, peerDependencies: { react: '^19.1.1', 'react-dom': '^19.1.1' }, files: listFiles(stage).map(path => { const data = readFileSync(join(stage, path)); return { path, bytes: data.length, sha256: sha256(data) } }) }
    writeFileSync(join(stage, 'runtime-archive.json'), JSON.stringify(manifest, null, 2))
    renameSync(stage, directory)
    readRuntimeArchive(root, identity.buildId)
    console.log(`Runtime archived: ${directory}`)
  } finally { rmSync(stage, { recursive: true, force: true }) }
}
