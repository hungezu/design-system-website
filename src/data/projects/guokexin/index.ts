import { guokexinTheme } from '../../../instances/guokexin/theme'
import { AI_COMPONENT_IDS } from '../../ai-components'
import type { ProjectConfig } from '../../../types/design-system'

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
  componentIds: ['button', 'input', 'select', 'table', 'pagination', 'dialog', 'drawer', 'tabs', 'tag', 'badge', 'toast', 'form', 'field', 'upload', 'empty', 'loading', 'alert', 'checkbox', 'radio', 'switch', ...AI_COMPONENT_IDS],
  status: 'active',
  iconRegistryVersion: '1.1.0',
}
