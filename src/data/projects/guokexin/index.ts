import { guokexinTheme } from '../../../instances/guokexin/theme'
import { AI_COMPONENT_IDS } from '../../ai-components'
import type { ProjectConfig } from '../../../types/design-system'

/** 第一批通过项目准入的 React Aria 基础家族。 */
export const GUOKEXIN_FOUNDATION_PHASE_ONE_COMPONENT_IDS = [
  'search-field', 'number-field', 'checkbox-group', 'combo-box', 'list-box', 'tree',
  'progress-bar', 'date-picker', 'menu', 'popover', 'tooltip', 'drop-zone',
] as const

/** 第二批将公共目录已有的其余 React Aria 基础家族全部纳入项目。 */
export const GUOKEXIN_FOUNDATION_PHASE_TWO_COMPONENT_IDS = [
  'toggle-button', 'toggle-button-group', 'autocomplete', 'slider', 'tag-group', 'meter',
  'calendar', 'date-field', 'date-range-picker', 'range-calendar', 'time-field',
  'color-area', 'color-field', 'color-picker', 'color-slider', 'color-swatch', 'color-swatch-picker',
  'breadcrumb', 'disclosure', 'disclosure-group', 'link', 'toolbar', 'separator',
] as const

/** 第三批补齐公共目录与国科信项目的 React Aria 基础家族。 */
export const GUOKEXIN_FOUNDATION_PHASE_THREE_COMPONENT_IDS = [
  'token-field', 'grid-list', 'color-wheel', 'navigation-tree',
  'preview-trigger', 'group', 'virtualizer',
] as const

// Compatibility adapter for the existing project/theme resolver.
// The Guokexin source data lives in instances/guokexin.
export const guokexinProject: ProjectConfig = {
  id: 'guokexin',
  releaseProjectId: 'proj-mtwba7n6-nh1d88',
  name: '国科信设计系统',
  shortName: '国科信',
  platform: 'web',
  description: '面向复杂 B 端 Web 系统的设计资产、交互模式与规范检查工作台。',
  brandPrimary: guokexinTheme.brandPrimary,
  brandSecondary: guokexinTheme.brandSecondary,
  fontFamily: guokexinTheme.fontFamily,
  radiusScale: 0.75,
  density: guokexinTheme.density,
  themeMode: guokexinTheme.mode,
  tokenOverrides: guokexinTheme.tokenOverrides,
  specialRules: [
    '筛选、操作、表格与分页按任务顺序排列，区块间距统一为 16px。',
    '标准 Button、Input、Select 与 DatePicker 高度为 32px。',
    '表格操作列位于右侧，高频操作直接显示，低频操作进入更多菜单。',
    '状态必须同时使用文字或图标表达，不能只依赖颜色。',
  ],
  customAssetIds: ['project-gkx-density-rule'],
  componentIds: [
    'button', 'input', 'select', 'table', 'pagination', 'dialog', 'drawer', 'tabs',
    'tag', 'badge', 'toast', 'form', 'field', 'upload', 'empty', 'loading', 'alert',
    'checkbox', 'radio', 'switch', ...GUOKEXIN_FOUNDATION_PHASE_ONE_COMPONENT_IDS,
    ...GUOKEXIN_FOUNDATION_PHASE_TWO_COMPONENT_IDS,
    ...GUOKEXIN_FOUNDATION_PHASE_THREE_COMPONENT_IDS,
    ...AI_COMPONENT_IDS,
  ],
  status: 'active',
  iconRegistryVersion: '1.1.0',
}
