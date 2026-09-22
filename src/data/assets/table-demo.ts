export interface TableDemoRow {
  id: string
  name: string
  category: string
  owner: string
  updatedAt: string
  status: '正常' | '待审核' | '已停用'
}

export const tableDemoRows: TableDemoRow[] = [
  { id: 'GKX-1024', name: '科技成果转化政策数据库', category: '数据资源', owner: '系统管理员', updatedAt: '2026-09-06 16:32', status: '正常' },
  { id: 'GKX-1023', name: '高端智库专家信息管理与协同工作区', category: '业务应用', owner: '内容运营', updatedAt: '2026-09-06 14:10', status: '待审核' },
  { id: 'GKX-1022', name: '产业情报专题配置', category: '配置项', owner: '研究中心', updatedAt: '2026-09-05 18:45', status: '正常' },
  { id: 'GKX-1021', name: '历史门户栏目映射', category: '配置项', owner: '系统管理员', updatedAt: '2026-09-04 09:20', status: '已停用' },
  { id: 'GKX-1020', name: '专题服务访问权限', category: '权限', owner: '安全管理员', updatedAt: '2026-09-03 11:08', status: '正常' },
]
