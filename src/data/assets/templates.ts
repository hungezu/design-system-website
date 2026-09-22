import { TABLE_LAYOUT_RULES } from '../patterns/table-layout'
import type { PageTemplateAsset } from '../../types/design-system'

const accessibility = ['页面使用唯一 h1 表达任务身份。', '动态状态通过 status 或 alert 通知。', '全部交互支持键盘与可见焦点。']
const base = { platforms: ['web'] as PageTemplateAsset['platforms'], variants: [], states: [], projectOverrides: [], status: 'draft' as const, schemaVersion: 'page-template/1' as const, accessibility }

export const templateAssets: PageTemplateAsset[] = [
  {
    ...base, id: 'template-list', name: '列表管理起点', type: 'template', templateVersion: '1.0.0', intent: '查询、比较并管理业务对象。',
    description: '由正式 DS 控件组成的筛选、列表、详情与编辑流程。', semantic: '用于高频资源管理，支持复用代码后按业务扩展。',
    patternIds: ['pattern-search-filter', 'pattern-table-management', 'pattern-bulk-actions'], requiredComponents: ['input', 'select', 'button', 'table', 'pagination'],
    slots: [{ id: 'pageHeader', label: '页面标题', required: true, accepts: ['heading', 'description'] }, { id: 'filterArea', label: '筛选区', required: true, accepts: ['input', 'select', 'button'] }, { id: 'primaryActions', label: '主操作', required: true, accepts: ['button'] }, { id: 'resultSummary', label: '结果摘要', required: true, accepts: ['text', 'status'] }, { id: 'table', label: '数据表格', required: true, accepts: ['table'] }, { id: 'pagination', label: '分页', required: false, accepts: ['pagination'] }, { id: 'feedback', label: '状态反馈', required: true, accepts: ['alert', 'empty', 'loading'] }],
    dataContract: [{ id: 'rows', type: 'Array<Record<string, unknown>>', required: true, description: '当前查询结果。' }, { id: 'total', type: 'number', required: true, description: '服务端结果总数。' }, { id: 'query', type: 'Record<string, unknown>', required: true, description: '当前筛选条件。' }],
    actions: [{ id: 'search', label: '查询', intent: 'primary', handler: 'onSearch' }, { id: 'reset', label: '重置', intent: 'secondary', handler: 'onReset' }, { id: 'create', label: '新增', intent: 'primary', handler: 'onCreate', permission: 'create' }],
    status: 'stable', necessaryStates: ['default', 'loading', 'empty', 'no-results', 'error', 'readonly', 'permission-denied', 'long-content'], responsiveRules: ['筛选区按宽度从三列收敛为一列。', '宽表格仅在表格容器内滚动。', '窄屏下主操作与分页始终可达。'], rules: [...TABLE_LAYOUT_RULES], tokens: ['surface-canvas', 'surface-primary', 'spacing-16'], tags: ['推荐起点', '列表'], example: 'DESIGN.md#可编译的最小用法',
  },
  {
    ...base, id: 'template-detail', name: '详情页起点', type: 'template', templateVersion: '1.0.0', intent: '理解单个对象并执行有上下文的操作。',
    description: '展示对象信息、关联资源、编辑与删除确认。', semantic: '为对象信息与相关操作提供可调整的起点。', patternIds: ['pattern-detail-page', 'pattern-delete-confirmation'], requiredComponents: ['button', 'dialog'],
    slots: [{ id: 'objectHeader', label: '对象身份', required: true, accepts: ['heading', 'status', 'button'] }, { id: 'summary', label: '信息概览', required: true, accepts: ['description-list'] }, { id: 'related', label: '关联信息', required: false, accepts: ['table', 'list'] }, { id: 'feedback', label: '状态反馈', required: true, accepts: ['alert', 'empty', 'loading'] }],
    dataContract: [{ id: 'record', type: 'Record<string, unknown>', required: true, description: '当前对象。' }, { id: 'relatedRecords', type: 'Array<Record<string, unknown>>', required: false, description: '关联数据。' }], actions: [{ id: 'edit', label: '编辑', intent: 'primary', handler: 'onEdit', permission: 'edit' }, { id: 'delete', label: '删除', intent: 'danger', handler: 'onDelete', permission: 'delete' }, { id: 'back', label: '返回', intent: 'navigation', handler: 'onBack' }],
    status: 'stable', necessaryStates: ['default', 'loading', 'empty', 'error', 'readonly', 'permission-denied', 'long-content'], responsiveRules: ['对象身份与主操作始终在第一屏可达。', '窄屏下关联区域转为单列。'], rules: ['对象身份和主要操作始终清晰。', '删除必须说明对象和影响并进行确认。'], tokens: ['surface-canvas', 'text-primary', 'spacing-24'], tags: ['推荐起点', '详情'], example: 'DESIGN.md#可编译的最小用法',
  },
  {
    ...base, id: 'template-form', name: '表单页起点', type: 'template', templateVersion: '1.0.0', intent: '创建或编辑结构化业务数据。',
    description: '包含字段校验、未保存保护、提交失败与重试的编辑流程。', semantic: '为结构化输入任务提供可调整的起点。', patternIds: ['pattern-form-create-edit'], requiredComponents: ['input', 'select', 'button'],
    slots: [{ id: 'pageHeader', label: '页面标题', required: true, accepts: ['heading', 'description'] }, { id: 'formSections', label: '字段分组', required: true, accepts: ['input', 'select', 'field'] }, { id: 'formActions', label: '表单操作', required: true, accepts: ['button'] }, { id: 'feedback', label: '提交反馈', required: true, accepts: ['alert', 'loading'] }],
    dataContract: [{ id: 'value', type: 'Record<string, unknown>', required: true, description: '受控表单值。' }, { id: 'errors', type: 'Record<string, string>', required: false, description: '字段级校验错误。' }], actions: [{ id: 'save', label: '保存', intent: 'primary', handler: 'onSave', permission: 'edit' }, { id: 'cancel', label: '取消', intent: 'secondary', handler: 'onCancel' }],
    status: 'stable', necessaryStates: ['default', 'dirty', 'loading', 'invalid', 'error', 'readonly', 'permission-denied', 'long-content'], responsiveRules: ['字段组在窄屏下转为单列。', '主要操作始终在表单末尾可达。'], rules: ['长表单按任务语义分组。', '离开未保存页面前给予保护。', '提交失败后保留输入。'], tokens: ['surface-primary', 'border-default', 'spacing-16'], tags: ['推荐起点', '表单'], example: 'DESIGN.md#可编译的最小用法',
  },
  {
    ...base, id: 'template-dashboard', name: 'Dashboard 起点', type: 'template', templateVersion: '0.1.0', intent: '总览多维业务状态并进入后续任务。',
    description: '推荐的多维信息总览初始结构，可替换为 Split View、Custom Region 或其他组合。', semantic: '为多个业务维度并行浏览提供可调整的起点。', patternIds: [], requiredComponents: [], slots: [{ id: 'pageHeader', label: '页面标题', required: true, accepts: ['heading', 'description'] }, { id: 'overview', label: '总览区', required: true, accepts: ['content-region'] }, { id: 'details', label: '详细区', required: false, accepts: ['table', 'list', 'chart'] }],
    dataContract: [{ id: 'sections', type: 'Array<Record<string, unknown>>', required: true, description: '经业务语义分组的总览数据。' }], actions: [], necessaryStates: ['default', 'loading', 'empty', 'error', 'permission-denied'], responsiveRules: ['区域数量与排布由业务优先级决定。', '窄屏下保留单一阅读顺序。'], rules: ['不以固定卡片数量限制业务信息层级。'], tokens: ['surface-canvas', 'surface-primary', 'spacing-16'], tags: ['推荐起点', '总览'], example: 'DESIGN.md#可编译的最小用法',
  },
]
