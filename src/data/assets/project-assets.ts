import type { DesignAsset } from '../../types/design-system'

export const projectAssets: DesignAsset[] = [
  {
    id: 'project-gkx-density-rule', name: '国科信复杂表格密度', type: 'pattern',
    description: '国科信复杂管理页面中筛选、操作、表格与分页的紧凑布局规则。',
    semantic: '让高信息密度页面仍保持稳定的浏览和操作顺序。', platforms: ['web'],
    rules: ['标准控件高度为 32px。', '筛选到操作、操作到表格均使用 16px 间距。', '宽表格只在表格容器内部滚动。'],
    tokens: ['control-height-md', 'spacing-16', 'border-default'], variants: [], states: [], projectOverrides: [],
    scope: 'project', ownerProjectId: 'guokexin', status: 'stable', tags: ['项目专属', '复杂表格'],
  },
]
