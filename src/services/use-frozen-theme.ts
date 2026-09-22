import { assertReleaseContext } from './release-context'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProject } from '../app/project-context'
import { releasePreviewVariables } from './project-theme'
import { resolveReleaseThemeFromCss } from './theme-resolver'

/** Never show a previous version or the current draft while a Frozen request settles. */
export function useFrozenTheme(enabled: boolean) {
  const { project, release, releaseError, releaseLoading, releases, loadReleaseAsset } = useProject()
  const [params] = useSearchParams()
  const version = params.get('version')
  const key = `${project.id}/${version}`
  const [result, setResult] = useState<{ key: string; css?: string; componentIds?: string[]; supportsTableComposition?: boolean; error?: string } | null>(null)
  const matches = release?.version === version && release?.projectId === project.releaseProjectId
  useEffect(() => {
    if (!enabled || !matches) return
    let active = true
    Promise.all([loadReleaseAsset<string>('tokens.css'),loadReleaseAsset<{availableComponents?:Array<{id:string;props?:Array<{name:string}>}>}>('manifest.json')]).then(([css,manifest]) => {
      assertReleaseContext(css,manifest,project.releaseProjectId,version!)
      if (active) setResult({ key, css, supportsTableComposition: manifest.availableComponents?.some(item=>item.id==='table'&&item.props?.some(prop=>prop.name==='footer')), componentIds:Array.isArray(manifest?.availableComponents)?manifest.availableComponents.map(item=>item.id):[] })
    }).catch(error => {
      if (active) setResult({ key, error: error instanceof Error ? error.message : String(error) })
    })
    return () => { active = false }
  }, [enabled, matches, key, loadReleaseAsset, project.releaseProjectId, version])
  const current = enabled && matches && result?.key === key ? result : null
  const css = current?.css
  const error = enabled ? current?.error ?? releaseError ?? (!releaseLoading && !releases.some(item => item.version === version) ? '冻结版本不可用' : null) : null
  return {
    css,
    ...(current?.supportsTableComposition ? { supportsTableComposition:true } : {}),
    componentIds:current?.componentIds??null,
    style: css !== undefined ? releasePreviewVariables(css) : null,
    theme: css !== undefined ? resolveReleaseThemeFromCss(css, project) : null,
    error,
    loading: enabled && css === undefined && !error,
  }
}
