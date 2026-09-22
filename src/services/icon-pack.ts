import { iconAssets } from '../data/assets/icons'

export const AI_PROJECT_ICON_IDS = new Set(['copy','send','stop','file','file-text','file-pdf','image','globe','clock','add','remove-item','refresh','chevron-down','loading','success','error','warning'])
export const CORE_PROJECT_ICON_IDS = new Set([
  ...AI_PROJECT_ICON_IDS,
  'add', 'edit', 'delete', 'search', 'refresh', 'close', 'clear-input', 'remove-item', 'confirm', 'more',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'arrow-left', 'arrow-right', 'menu', 'home',
  'sort', 'sort-ascending', 'sort-descending', 'filter', 'column-settings', 'pagination-first', 'pagination-previous', 'pagination-next', 'pagination-last',
  'success', 'warning', 'error', 'info', 'loading', 'user', 'users', 'role', 'permission', 'settings', 'notification', 'help', 'lock', 'unlock', 'calendar', 'upload', 'download', 'eye', 'eye-off',
])

const runtimeIdOf = (icon: (typeof iconAssets)[number]) => icon.tags?.[1] ?? icon.id.replace(/^icon-/, '')

function uniqueByRuntimeId(icons: typeof iconAssets) {
  const seen = new Set<string>()
  return icons.filter((icon) => {
    const runtimeId = runtimeIdOf(icon)
    if (seen.has(runtimeId)) return false
    seen.add(runtimeId)
    return true
  })
}

export function iconPackForProject(projectId: string) {
  if (projectId === 'global') return iconAssets
  const corePack = uniqueByRuntimeId(iconAssets.filter((icon) => CORE_PROJECT_ICON_IDS.has(runtimeIdOf(icon))))
  return projectId === 'test-customer-b' ? uniqueByRuntimeId([...corePack.slice(0,12),...corePack.filter(icon=>AI_PROJECT_ICON_IDS.has(runtimeIdOf(icon)))]) : corePack
}

export function iconIdsForProject(projectId: string) {
  return [...new Set(iconPackForProject(projectId).map(runtimeIdOf))]
}

export function projectCanAccessIcon(projectId: string, iconId: string) {
  return iconPackForProject(projectId).some((icon) => icon.id === iconId || runtimeIdOf(icon) === iconId)
}
