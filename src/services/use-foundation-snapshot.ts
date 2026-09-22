import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProject } from '../app/project-context'
import { capturedPaletteValues } from '../data/global/color-palettes'

export function useFoundationSnapshot(enabled: boolean) {
  const { project, release, loadReleaseAsset } = useProject()
  const [params] = useSearchParams()
  const version = params.get('version')
  const key = `${project.id}/${version}`
  const matches = release?.version === version && release.projectId === project.releaseProjectId
  const [result, setResult] = useState<{ key: string; palette: Record<string,string>; iconIds: string[]; error?: string } | null>(null)
  useEffect(() => {
    if (!enabled || !matches) return
    let active = true
    Promise.all([loadReleaseAsset<Record<string,unknown>>('tokens.json'), loadReleaseAsset<Record<string,unknown>>('icons.json')]).then(([tokens, icons]) => {
      if ((tokens.projectId && tokens.projectId !== project.releaseProjectId) || (tokens.releaseVersion && tokens.releaseVersion !== version) || icons.projectId !== project.releaseProjectId || (icons.releaseVersion && icons.releaseVersion !== version)) throw new Error('设计基础文件与当前项目或版本不一致。')
      const captured = (icons.projectIconPack as {iconIds?:string[]} | undefined)?.iconIds
      const entries = icons.icons ?? icons.publishedIcons
      if (!Array.isArray(entries)) throw new Error('此版本缺少可读取的图标清单。')
      const published = new Set(entries.map(item => typeof item === 'string' ? item : item?.id).filter((id):id is string => typeof id === 'string'))
      const iconIds = captured ? captured.filter(id => published.has(id)) : [...published]
      if (active) setResult({ key, palette: capturedPaletteValues(tokens), iconIds })
    }).catch(error => { if (active) setResult({ key, palette: {}, iconIds: [], error: error instanceof Error ? error.message : String(error) }) })
    return () => { active = false }
  }, [enabled, matches, key, loadReleaseAsset, project.releaseProjectId, version])
  const current = enabled && matches && result?.key === key ? result : null
  return { palette: current?.palette ?? {}, iconIds: current?.iconIds ?? [], error: current?.error, loading: enabled && !current }
}
