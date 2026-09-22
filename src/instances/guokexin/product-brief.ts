import type { ProductBrief } from '../../framework/types/generation'

export const guokexinProductBrief: ProductBrief = {
  id: 'guokexin-brief',
  productName: '国科信综合业务系统',
  productType: '复杂 B 端信息管理系统',
  targetUsers: ['系统管理员', '审核员', '运营人员', '普通用户'],
  businessGoal: '统一管理门户内容、智库资源与专题情报，让不同角色在同一系统中完成查询、审核、编辑和配置。',
  userRoles: [
    { id: 'admin', name: '系统管理员', responsibilities: ['系统配置', '权限管理', '数据维护'] },
    { id: 'reviewer', name: '审核员', responsibilities: ['内容审核', '风险确认'] },
    { id: 'operator', name: '运营人员', responsibilities: ['内容编辑', '专题配置', '数据导入导出'] },
    { id: 'member', name: '普通用户', responsibilities: ['搜索', '查看', '收藏'] },
  ],
  modules: [
    { id: 'portal', name: '门户管理', description: '栏目、内容与发布管理。', pageIds: ['content-list', 'content-detail', 'content-edit'] },
    { id: 'think-tank', name: '高端智库', description: '专家与智库资源管理。', pageIds: ['expert-list', 'expert-detail'] },
    { id: 'intelligence', name: '情报管理', description: '专题情报与线索跟踪。', pageIds: ['topic-dashboard', 'topic-detail'] },
    { id: 'system', name: '系统配置', description: '权限与基础配置。', pageIds: ['permission-config'] },
  ],
  pages: [
    { id: 'content-list', name: '内容列表', type: 'list', tasks: ['搜索', '筛选', '批量操作', '导入', '导出'], moduleId: 'portal' },
    { id: 'content-detail', name: '内容详情', type: 'detail', tasks: ['查看', '审核'], moduleId: 'portal' },
    { id: 'content-edit', name: '内容编辑', type: 'form', tasks: ['编辑', '保存'], moduleId: 'portal' },
    { id: 'expert-list', name: '专家列表', type: 'list', tasks: ['搜索', '筛选', '查看'], moduleId: 'think-tank' },
    { id: 'expert-detail', name: '专家详情', type: 'detail', tasks: ['查看', '编辑'], moduleId: 'think-tank' },
    { id: 'topic-dashboard', name: '专题总览', type: 'dashboard', tasks: ['查看', '筛选'], moduleId: 'intelligence' },
    { id: 'topic-detail', name: '专题详情', type: 'custom', tasks: ['查看', '跨模块操作'], moduleId: 'intelligence' },
    { id: 'permission-config', name: '权限配置', type: 'form', tasks: ['配置', '审批'], moduleId: 'system' },
  ],
  coreTasks: ['搜索', '筛选', '查看', '编辑', '批量操作', '审批', '导入', '导出'],
  informationHierarchy: {
    maxNavigationDepth: 3,
    density: 'compact',
    dataVolume: 'large',
    crossModuleOperations: true,
  },
  constraints: ['部分详情页面需要同时左右对照。', '专题首页需要同时查看两个业务维度。', '审核任务需要在当前上下文完成，不能跳转页面。'],
}
