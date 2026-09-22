import { aiComponentAssets } from './ai'
import type { ComponentAsset, ReactPropSchema } from '../../types/design-system'
import { TABLE_LAYOUT_RULES } from '../patterns/table-layout'
import { BUTTON_CONTRACT, BUTTON_SIZES } from '../../design-system/primitives/Button/Button.types'
import type { DSButtonProps } from '../../design-system/primitives/Button/DSButton'
import { buttonRecipeTokens } from '../components/button-recipe-tokens'
import { RUNTIME_COMPONENT_REGISTRY } from '../../runtime/registry'

const component = (data: Partial<ComponentAsset> & Pick<ComponentAsset, 'id' | 'name' | 'description' | 'semantic'>): ComponentAsset => ({
  type: 'component', platforms: ['web'], rules: [], tokens: [], variants: [], states: [], projectOverrides: [], status: 'stable', priority: 'core', ...data,
})

type ButtonManifestProp = keyof Pick<DSButtonProps, 'variant' | 'semantic' | 'size' | 'disabled' | 'loading' | 'icon' | 'iconPosition' | 'children'>
const buttonPropsSchema = {
  variant: { type: 'string', enum: ['primary', 'secondary', 'tertiary'], default: 'secondary', description: '公开操作层级；内部映射到 Priority 与 Appearance。' },
  semantic: { type: 'string', enum: ['default', 'danger'], default: 'default', description: '操作语义：默认或危险。' },
  size: { type: 'string', enum: [...BUTTON_SIZES], default: 'md', description: '按钮高度与水平间距。' },
  disabled: { type: 'boolean', default: false, description: '禁用原生 button 并阻止操作。' },
  loading: { type: 'boolean', default: false, description: '显示等待状态并阻止重复触发。' },
  icon: { type: 'react-node', description: '按钮文字前的可选图标。' },
  iconPosition: { type: 'string', enum: ['start', 'end'], default: 'start', description: '图标在文字的前方或后方。' },
  children: { type: 'react-node', required: true, description: '按钮操作文案。' },
} satisfies Record<ButtonManifestProp, ReactPropSchema>

export const buttonAsset = component({
    id: 'button', name: 'Button 按钮',
    description: '触发即时操作，并通过层级表达重要性与风险。', semantic: '执行用户明确发起的操作。',
    rules: ['主要操作用于当前任务最关键的操作，同一区域原则上仅保留一个。', '次要操作优先级低于主要操作，可使用线框或浅色填充。', '辅助操作用于低频、低强调操作，采用无背景表达。', '危险属于 Tone：主要危险操作使用实心，次要危险操作使用线框。', 'Loading 保留原尺寸并阻止重复提交。'],
    tokens: [...buttonRecipeTokens.map((token) => token.id), 'brand-primary', 'radius-control', 'control-height-sm', 'control-height-md', 'control-height-lg', 'spacing-12', 'spacing-16'],
    tokenRoles: [
      { role: '品牌实心', token: 'button-brand-filled-bg-default' }, { role: '中性线框', token: 'button-neutral-outline-bg-default' },
      { role: '中性浅色', token: 'button-neutral-soft-bg-default' }, { role: '中性无背景', token: 'button-neutral-ghost-bg-default' },
      { role: '危险实心', token: 'button-danger-filled-bg-default' }, { role: '危险线框', token: 'button-danger-outline-bg-default' },
      { role: '圆角', token: 'radius-control' }, { role: '高度', token: 'control-height-md' }, { role: '左右间距', token: 'spacing-16' },
    ],
    contract: BUTTON_CONTRACT,
    states: [
      { id: 'default', name: '默认', description: '可操作初始状态。' }, { id: 'hover', name: 'Hover', description: '指针进入。' },
      { id: 'active', name: 'Active', description: '正在按下，由 CSS :active 实现。' }, { id: 'disabled', name: 'Disabled', description: '条件不满足。' },
      { id: 'loading', name: 'Loading', description: '操作处理中。' },
    ],
    projectOverrides: [{ projectId: 'guokexin', tokenOverrides: { 'radius-control': '4px', 'control-height-md': '32px' }, ruleOverrides: ['表格内按钮优先使用文字按钮或小尺寸。'] }],
    anatomy: ['容器', '操作文案', '可选图标', 'Loading 指示'],
    accessibility: ['使用原生 button。', '键盘焦点清晰可见。', 'Disabled 必须解释不可用原因。'],
    bindings: {
      react: {
        package: 'design-intelligence-system',
        exportName: 'DSButton',
        sourcePath: 'src/design-system/primitives/Button/DSButton.tsx',
        props: buttonPropsSchema,
      },
      storybook: {
        storyId: 'design-system-primitives-button--primary',
        sourcePath: 'src/design-system/primitives/Button/Button.stories.tsx',
        url: 'http://127.0.0.1:6006/?path=/story/design-system-primitives-button--primary',
      },
    },
    lifecycle: {
      version: '1.0.0',
      revision: 1,
      changelog: [{
        version: '1.0.0',
        date: '2026-09-08',
        changes: ['建立真实 React Primitive', '建立 Storybook Story', '绑定 React Component', '拆分 Priority、Appearance、Tone、Size 多维属性'],
      }],
    },
    sync: { react: 'bound', storybook: 'bound', figma: 'unbound', overall: 'partially-bound' },
    tags: ['操作', '表单', '基础组件'],
  })

const definedComponentAssets: ComponentAsset[] = [
  buttonAsset,
  component({
    id: 'component-table', name: 'Table 表格',
    description: '面向复杂 B 端任务的数据浏览、选择、比较和批量操作容器。', semantic: '以稳定列关系管理结构化数据集合。',
    rules: [...TABLE_LAYOUT_RULES, '长文本单行截断并提供完整内容入口。', '状态颜色必须读取语义 Token。'],
    tokens: ['surface-card', 'surface-subtle', 'border-default', 'text-primary', 'font-table-head', 'font-table-body', 'status-success', 'status-warning'],
    tokenRoles: [{ role: '表头背景', token: 'surface-subtle' }, { role: '表格正文', token: 'font-table-body' }, { role: '分隔线', token: 'border-default' }, { role: '状态', token: 'status-success' }],
    variants: [{ id: 'basic', name: '基础表格', description: '默认数据浏览。' }, { id: 'selection', name: '行选择', description: '支持批量操作。' }, { id: 'fixed', name: '固定表头', description: '长列表滚动保持列信息。' }],
    states: [{ id: 'default', name: '默认', description: '展示数据。' }, { id: 'loading', name: 'Loading', description: '加载骨架。' }, { id: 'empty', name: '空状态', description: '没有匹配数据。' }],
    anatomy: ['筛选区', '批量操作条', '表头', '数据行', '状态列', '操作列', '分页'],
    accessibility: ['使用 table、thead、tbody、th 语义。', '排序列使用 aria-sort。', '选择框包含行对象名称。'],
    projectOverrides: [{ projectId: 'guokexin', tokenOverrides: { 'control-height-md': '32px', 'radius-container': '6px' } }], tags: ['数据', '复杂 B 端'],
  }),
  component({ id: 'component-select', name: 'Select 选择器', description: '从有限选项中选择单个或多个值。', semantic: '选择已知枚举值。', rules: ['超过 12 个选项时提供搜索。'], tokens: ['surface-card', 'border-default', 'radius-control', 'control-height-md'], states: [{ id: 'open', name: '展开', description: '显示选项面板。' }], tags: ['表单', '筛选'] }),
  component({ id: 'component-input', name: 'Input 输入框', description: '接收短文本、数字或搜索条件。', semantic: '输入或编辑一项内容。', rules: ['标签不能仅依赖占位符。', '错误信息说明恢复方式。'], tokens: ['text-primary', 'border-default', 'radius-control', 'control-height-md'], states: [{ id: 'focus', name: 'Focus', description: '输入焦点。' }, { id: 'error', name: 'Error', description: '校验失败。' }], tags: ['表单', '输入'] }),
  component({ id: 'component-search-field', name: 'SearchField 搜索框', description: '输入关键词并筛选当前内容，支持一键清空。', semantic: '在当前数据集中定位匹配内容。', rules: ['使用可见标签说明搜索范围，不只依赖占位符。', '已输入时提供语义明确的清空操作。', '无匹配结果时说明原因并允许调整条件。'], tokens: ['surface-card', 'text-primary', 'field-placeholder', 'border-default', 'brand-primary', 'status-error', 'radius-control', 'control-height-md'], states: [{ id: 'default', name: '默认', description: '等待输入。' }, { id: 'hover', name: 'Hover', description: '指针进入搜索框。' }, { id: 'focus', name: 'Focus', description: '键盘或指针聚焦。' }, { id: 'disabled', name: 'Disabled', description: '当前不可搜索。' }, { id: 'error', name: 'Error', description: '搜索条件无效。' }], anatomy: ['字段标签', '搜索图标', '输入区域', '清空按钮', '说明或错误信息'], accessibility: ['使用 searchfield 语义与程序化关联的标签。', '清空按钮提供包含搜索范围的可访问名称。', '键盘焦点由外层组合控件统一呈现。'], tags: ['表单', '搜索', '筛选'] }),
  component({ id: 'component-dialog', name: 'Dialog 对话框', description: '在受保护的焦点环境中完成重要确认。', semantic: '中断当前流程并处理高风险决策。', rules: ['仅用于需要中断或保护焦点的任务。', '关闭后焦点回到触发元素。'], tokens: ['surface-card', 'shadow-dialog', 'radius-dialog'], states: [{ id: 'default', name: '默认', description: '未打开。' }, { id: 'open', name: '打开', description: '模态内容可见并保护焦点。' }], tags: ['浮层', '确认'] }),
  component({ id: 'component-drawer', name: 'Drawer 抽屉', description: '不离开列表上下文完成复杂查看或编辑。', semantic: '在保留来源上下文时承载中等复杂任务。', rules: ['超过 15 个字段时使用独立页面。', '关闭前保护未保存内容。'], tokens: ['surface-card', 'shadow-overlay', 'spacing-16'], states: [{ id: 'default', name: '默认', description: '未打开。' }, { id: 'open', name: '打开', description: '保留来源上下文。' }], tags: ['浮层', '编辑'] }),
  component({
    id: 'component-menu', name: 'Menu 菜单', description: '通过横向、纵向、分组与子菜单组织项目导航。', semantic: '定位当前页面并切换到目标内容。',
    rules: ['横向导航适合少量顶级入口；纵向导航适合多层项目结构。', '分组标题用于分类，子菜单标题用于展开；两者不直接执行页面操作。', '收起模式保留图标与完整名称提示，点击分组打开子菜单。', '导航选中项使用项目主题色；禁用项不可操作，键盘焦点必须可见。', '页面导航使用 vertical 或 horizontal，并传入 href 或在 onAction 中接入路由；操作列表使用默认 action，触发式操作使用 Dropdown。'],
    tokens: ['brand-primary', 'brand-secondary', 'surface-primary', 'surface-subtle', 'text-primary', 'text-secondary', 'text-tertiary', 'border-default', 'radius-control'],
    states: [{ id: 'default', name: '默认', description: '等待导航。' }, { id: 'selected', name: '选中', description: '当前页面与所属分组。' }, { id: 'open', name: '展开', description: '显示子菜单。' }, { id: 'hover', name: '悬停', description: '强调可操作项。' }, { id: 'focus', name: '焦点', description: '键盘定位。' }, { id: 'disabled', name: '禁用', description: '不可操作。' }],
    accessibility: ['导航使用 nav、列表和链接或按钮语义；当前页面标记 aria-current。', 'Tab 保持原生顺序，方向键和 Home/End 辅助定位；Enter/Space 激活按钮。', '浮层支持 Escape 关闭并返回触发器，子菜单继承当前主题。'],
    bindings: { react: { package: 'design-intelligence-system', exportName: 'DSMenu', sourcePath: 'src/design-system/primitives/Navigation/Menu.tsx', props: { label: { type: 'string', required: true, description: '导航或操作列表的可访问名称。' }, items: { type: 'react-node', required: true, description: '唯一 id、文字、可选图标、href、group、disabled 和递归 children。' }, mode: { type: 'string', enum: ['action', 'vertical', 'horizontal'], default: 'action', description: '操作列表或导航布局。' }, value: { type: 'string', description: '当前页面 id，由调用方控制。' }, appearance: { type: 'string', enum: ['filled', 'underline'], description: '横向默认下划线，纵向默认浅色填充。' }, collapsible: { type: 'boolean', description: '纵向导航显示收起按钮。' }, accordion: { type: 'boolean', description: '同层子菜单只展开一项。' } } } }, tags: ['导航', '菜单'],
  }),
  component({ id: 'component-tabs', name: 'Tabs 标签页', description: '切换同一上下文中的并列内容。', semantic: '组织同级且互斥的视图。', rules: ['标签页切换同一页面的并列内容；跨页面导航使用 Menu。', '下划线适合内容分区，填充式适合紧凑设置；同一区域保持一种样式。', '标签过多时横向滚动，不折行；键盘切换时自动显示选中项。', '使用方向键切换，禁用标签不可选；图标与数量不能替代文字。'], tokens: ['brand-primary', 'brand-secondary', 'text-primary'], states: [{ id: 'selected', name: '选中', description: '当前视图。' }], tags: ['导航'] }),
  component({ id: 'component-tag', name: 'Tag 标签', description: '标记对象属性、分类或轻量状态。', semantic: '给对象附加短标签。', rules: ['状态标签必须同时显示文字。'], tokens: ['surface-subtle', 'font-label', 'radius-sm'], states: [{ id: 'default', name: '默认', description: '只读标签。' }, { id: 'disabled', name: '禁用', description: '不可移除。' }], tags: ['状态', '数据'] }),
  component({ id: 'component-pagination', name: 'Pagination 分页', description: '在大量数据结果之间分页导航。', semantic: '控制当前数据页与每页数量。', rules: ['与总数放在表格同一底部区域。'], tokens: ['brand-primary', 'border-default', 'pagination-control-height', 'spacing-8'], states: [{ id: 'default', name: '默认', description: '可分页。' }, { id: 'active', name: '当前页', description: '当前页码。' }, { id: 'disabled', name: '禁用', description: '无更多页。' }], tags: ['数据', '导航'] }),
  component({ id: 'component-date-picker', name: 'DatePicker 日期选择', description: '选择单个日期、日期时间或范围。', semantic: '输入受约束的日期值。', rules: ['显示明确格式并支持键盘输入。'], tokens: ['surface-card', 'border-default', 'radius-control', 'control-height-md'], tags: ['表单', '筛选'] }),
  component({ id: 'component-card', name: 'Card 内容容器', description: '为一组高度相关内容建立边界。', semantic: '组织可独立理解的内容单元。', rules: ['只在边界有助于理解时使用。'], tokens: ['surface-card', 'border-default', 'radius-container'], priority: 'secondary', tags: ['布局'] }),
  component({ id: 'component-toast', name: 'Toast 结果反馈', description: '不阻断当前任务地告知操作结果。', semantic: '反馈已完成操作的结果。', rules: ['错误反馈不能在读完前消失。'], tokens: ['status-success', 'status-error', 'surface-inverse'], states: [{ id: 'info', name: '信息', description: '中性结果。' }, { id: 'success', name: '成功', description: '操作成功。' }, { id: 'error', name: '错误', description: '操作失败。' }], priority: 'secondary', tags: ['反馈'] }),
  component({ id: 'component-badge', name: 'Badge 徽标', description: '以紧凑形式表达数量或状态。', semantic: '表达对象的附加状态。', tokens: ['surface-secondary', 'text-primary', 'status-success-text', 'status-warning-text', 'status-error-text', 'radius-sm'], states: [{ id: 'default', name: '默认', description: '中性信息。' }, { id: 'success', name: '成功', description: '成功状态。' }, { id: 'warning', name: '警告', description: '警告状态。' }, { id: 'error', name: '错误', description: '错误状态。' }], accessibility: ['状态同时使用文字表达。'], tags: ['状态'] }),
  component({ id: 'component-form', name: 'Form 表单', description: '组织字段、校验和提交反馈。', semantic: '完成结构化数据录入。', tokens: ['text-primary', 'border-default', 'spacing-16', 'status-error-text'], states: [{ id: 'default', name: '默认', description: '可编辑。' }, { id: 'loading', name: '提交中', description: '防止重复提交。' }, { id: 'error', name: '错误', description: '存在校验错误。' }, { id: 'success', name: '成功', description: '提交完成。' }], accessibility: ['错误与对应字段关联。', '提交结果使用实时区域通知。'], tags: ['表单'] }),
  component({ id: 'component-field', name: 'Field 表单字段', description: '统一标签、控件、说明和错误信息。', semantic: '承载单个数据字段。', tokens: ['text-primary', 'field-placeholder', 'border-default', 'brand-primary', 'status-error'], states: [{ id: 'default', name: '默认', description: '等待输入。' }, { id: 'focus', name: '聚焦', description: '键盘或指针聚焦。' }, { id: 'error', name: '错误', description: '校验失败。' }], accessibility: ['标签、说明与错误具有程序化关联。'], tags: ['表单'] }),
  component({ id: 'component-upload', name: 'Upload 上传', description: '选择文件并反馈格式、大小和处理状态。', semantic: '导入用户文件。', tokens: ['brand-primary', 'border-default', 'radius-control', 'status-error-text'], states: [{ id: 'default', name: '默认', description: '可选择文件。' }, { id: 'loading', name: '处理中', description: '暂停重复选择。' }, { id: 'error', name: '错误', description: '文件不符合限制。' }], accessibility: ['文件规则与错误信息可被辅助技术读取。'], tags: ['文件'] }),
  component({ id: 'component-empty', name: 'Empty 空状态', description: '在没有数据时解释原因并提供下一步。', semantic: '表达无数据或无匹配结果。', tokens: ['surface-primary', 'text-secondary', 'spacing-24'], states: [{ id: 'empty', name: '空', description: '无可展示数据。' }], accessibility: ['文案明确说明空状态原因。'], tags: ['反馈'] }),
  component({ id: 'component-loading', name: 'Loading 加载状态', description: '表达系统正在处理。', semantic: '向用户反馈等待状态。', tokens: ['brand-primary', 'border-default', 'text-secondary'], states: [{ id: 'loading', name: '加载中', description: '操作尚未完成。' }], accessibility: ['加载状态具有可读标签。', '减少动效模式停止旋转。'], tags: ['反馈'] }),
  component({ id: 'component-alert', name: 'Alert 警告提示', description: '展示持续可见的信息、成功、警告或错误。', semantic: '传达需要关注的状态。', tokens: ['surface-primary', 'status-success', 'status-warning', 'status-error', 'status-info'], states: [{ id: 'info', name: '信息', description: '中性说明。' }, { id: 'success', name: '成功', description: '任务完成。' }, { id: 'warning', name: '警告', description: '需要关注。' }, { id: 'error', name: '错误', description: '需要修复。' }], accessibility: ['错误态使用 alert，其余状态使用 status。'], tags: ['反馈'] }),
  component({ id: 'component-checkbox', name: 'Checkbox 复选框', description: '选择一个或多个独立选项。', semantic: '切换布尔或多选状态。', tokens: ['surface-primary', 'border-default', 'brand-primary', 'text-on-brand'], states: [{ id: 'default', name: '默认', description: '未选中。' }, { id: 'checked', name: '选中', description: '已选中。' }, { id: 'indeterminate', name: '部分选中', description: '部分子项选中。' }, { id: 'disabled', name: '禁用', description: '不可操作。' }], accessibility: ['使用原生 checkbox 语义与可见标签。'], tags: ['表单'] }),
  component({ id: 'component-radio', name: 'Radio 单选框', description: '在互斥选项中选择一项。', semantic: '选择唯一值。', tokens: ['surface-primary', 'border-default', 'brand-primary'], states: [{ id: 'default', name: '默认', description: '未选中。' }, { id: 'checked', name: '选中', description: '当前值。' }, { id: 'disabled', name: '禁用', description: '不可操作。' }], accessibility: ['单选组具有组标签并支持方向键。'], tags: ['表单'] }),
  component({ id: 'component-switch', name: 'Switch 开关', description: '立即切换一项设置。', semantic: '表达开启或关闭状态。', tokens: ['surface-secondary', 'border-default', 'brand-primary', 'text-on-brand'], states: [{ id: 'default', name: '关闭', description: '功能关闭。' }, { id: 'checked', name: '开启', description: '功能开启。' }, { id: 'disabled', name: '禁用', description: '不可操作。' }], accessibility: ['标签说明被切换的设置，不只写开/关。'], tags: ['表单'] }),
]

const sharedProps: Record<string, ReactPropSchema> = {
  disabled: { type: 'boolean', default: false, description: '禁用并阻止用户操作。' },
}
const fieldProps: Record<string, ReactPropSchema> = {
  label: { type: 'string', required: true, description: '与控件程序化关联的字段标签。' },
  ...sharedProps,
}
const bindingProps: Record<string, Record<string, ReactPropSchema>> = {
  input: { ...fieldProps, placeholder: { type: 'string', description: '未输入时的提示。' }, invalid: { type: 'boolean', default: false, description: '是否处于错误状态。' } },
  'search-field': { label: fieldProps.label, value: { type: 'string', description: '受控搜索关键词。' }, defaultValue: { type: 'string', description: '非受控模式的初始关键词。' }, isDisabled: { type: 'boolean', default: false, description: '禁用搜索与清空操作。' }, isReadOnly: { type: 'boolean', default: false, description: '仅展示当前搜索值。' }, isInvalid: { type: 'boolean', default: false, description: '是否处于错误状态。' }, description: { type: 'string', description: '搜索范围或输入提示。' }, errorMessage: { type: 'string', description: '搜索条件错误时的恢复说明。' } },
  select: { ...fieldProps, options: { type: 'react-node', required: true, description: '可选值列表。' }, value: { type: 'string', description: '当前选中值。' } },
  table: { columns: { type: 'react-node', required: true, description: '列定义。' }, data: { type: 'react-node', required: true, description: '数据行。' }, density: { type: 'string', enum: ['compact','default','comfortable'], default: 'default', description: '表格密度。' } },
  pagination: { total: { type: 'string', required: true, description: '数据总数。' }, page: { type: 'string', description: '当前页码。' } },
  dialog: { open: { type: 'boolean', required: true, description: '是否打开。' }, title: { type: 'string', required: true, description: '对话框标题。' }, children: { type: 'react-node', description: '对话框内容。' } },
  drawer: { open: { type: 'boolean', required: true, description: '是否打开。' }, title: { type: 'string', required: true, description: '抽屉标题。' }, children: { type: 'react-node', description: '抽屉内容。' } },
  tabs: { label: { type: 'string', required: true, description: '标签页组名称。' }, items: { type: 'react-node', required: true, description: '标签页数据。' } },
  tag: { children: { type: 'react-node', required: true, description: '标签内容。' }, disabled: sharedProps.disabled },
  badge: { children: { type: 'react-node', required: true, description: '徽标内容。' }, tone: { type: 'string', enum: ['info','success','warning','error'], default: 'info', description: '状态语义。' } },
  toast: { open: { type: 'boolean', required: true, description: '是否显示。' }, message: { type: 'string', required: true, description: '提示文案。' }, tone: { type: 'string', enum: ['info','success','warning','error'], default: 'info', description: '反馈语义。' } },
  form: { children: { type: 'react-node', required: true, description: '表单字段与操作。' }, ...sharedProps },
  field: fieldProps,
  upload: { ...fieldProps, multiple: { type: 'boolean', default: false, description: '是否允许多文件。' } },
  empty: { title: { type: 'string', description: '空状态标题。' }, description: { type: 'string', description: '原因与下一步说明。' } },
  loading: { label: { type: 'string', description: '可读的加载状态。' } },
  alert: { title: { type: 'string', required: true, description: '提示标题。' }, tone: { type: 'string', enum: ['info','success','warning','error'], default: 'info', description: '反馈语义。' } },
  checkbox: { label: { type: 'string', required: true, description: '选项标签。' }, ...sharedProps },
  radio: { label: { type: 'string', required: true, description: '单选组标签。' }, options: { type: 'react-node', required: true, description: '互斥选项。' }, ...sharedProps },
  switch: { label: { type: 'string', required: true, description: '被切换设置的名称。' }, ...sharedProps },
}

const baseComponentAssets: ComponentAsset[] = definedComponentAssets.map((asset) => {
  if (asset.id === 'button') return asset
  const componentId = asset.id.replace(/^component-/, '')
  const runtime = RUNTIME_COMPONENT_REGISTRY[componentId]
  if (!runtime) return asset
  return {
    ...asset,
    bindings: { ...asset.bindings, storybook: { url: `http://127.0.0.1:6006/?path=/docs/core-${componentId}--docs`, title: `Core/${componentId}`, storyId: `core-${componentId}--${componentId === 'loading' ? 'sm' : componentId === 'badge' || componentId === 'toast' || componentId === 'alert' ? 'info' : componentId === 'upload' ? 'single' : componentId === 'tabs' ? 'horizontal' : componentId === 'dialog' || componentId === 'drawer' ? 'info' : 'default'}`, sourcePath: `src/design-system/stories/${componentId}.stories.tsx` }, react: { package: 'design-intelligence-system', exportName: runtime.runtimeExport, sourcePath: runtime.sourcePath, props: bindingProps[componentId] ?? {} } },
    lifecycle: asset.lifecycle ?? { version: '1.0.0', revision: 1, changelog: [{ version: '1.0.0', date: '2026-09-18', changes: ['纳入主工程 Runtime Registry', '建立项目 Token 与状态映射'] }] },
    sync: { react: 'bound', storybook: 'bound', figma: asset.bindings?.figma ? 'bound' : 'unbound', overall: asset.bindings?.storybook || asset.bindings?.figma ? 'partially-bound' : 'partially-bound' },
  }
})

export const componentAssets: ComponentAsset[] = [...baseComponentAssets,...aiComponentAssets]
