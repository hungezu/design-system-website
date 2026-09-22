export type AuditSeverity = 'pass' | 'warning' | 'error'

export interface AuditFinding {
  id: string
  category: 'visual' | 'interaction'
  dimension: '色彩' | '字体' | '间距' | '组件' | '表格' | '状态' | '交互'
  severity: AuditSeverity
  title: string
  detail: string
  suggestion?: string
}

export const auditFindings: AuditFinding[] = [
  { id: 'standard-button', category: 'visual', dimension: '组件', severity: 'pass', title: '使用标准 Button', detail: '主操作引用 Button 组件及 brand-primary 语义变量。' },
  { id: 'table-height', category: 'visual', dimension: '表格', severity: 'pass', title: '表格行高符合规范', detail: '数据行保持紧凑且支持快速扫读。' },
  { id: 'font-level', category: 'visual', dimension: '字体', severity: 'pass', title: '字体层级符合规范', detail: '页面标题、表头和正文均命中已定义语义。' },
  { id: 'space-32', category: 'visual', dimension: '间距', severity: 'warning', title: '检测到非标准间距', detail: '筛选区与操作栏之间使用了 20px。', suggestion: '使用 spacing-16。' },
  { id: 'custom-color', category: 'visual', dimension: '色彩', severity: 'error', title: '使用非规范颜色', detail: '#7651F2 未映射到国科信语义变量。', suggestion: '根据用途映射为 brand-primary 或 status-info。' },
  { id: 'duplicate-select', category: 'visual', dimension: '组件', severity: 'warning', title: '当前页面重复创建 Select', detail: '自定义 Dropdown 与标准 Select 能力重叠。', suggestion: '复用 Select 并通过 Token 调整表现。' },
  { id: 'delete-confirm', category: 'interaction', dimension: '交互', severity: 'warning', title: '删除操作缺少确认', detail: '危险操作直接提交，没有说明影响对象。', suggestion: '使用“删除确认”设计模式。' },
  { id: 'missing-error', category: 'interaction', dimension: '状态', severity: 'error', title: 'Loading 后缺少 Error State', detail: '请求失败时没有恢复路径，用户工作可能丢失。', suggestion: '保留当前数据并提供明确重试操作。' },
]
