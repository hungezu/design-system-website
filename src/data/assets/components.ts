import { aiComponentAssets } from './ai'
import type { ComponentAsset, ReactPropSchema } from '../../types/design-system'
import { TABLE_LAYOUT_RULES } from '../patterns/table-layout'
import { BUTTON_CONTRACT, BUTTON_SIZES } from '../../design-system/primitives/Button/Button.types'
import type { DSButtonProps } from '../../design-system/primitives/Button/DSButton'
import { buttonRecipeTokens } from '../components/button-recipe-tokens'
import { RUNTIME_COMPONENT_REGISTRY } from '../../runtime/registry'
import { getDesktopComponentBinding } from '../../design-system/component-bindings'

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

const foundationStateLabels: Record<string, string> = {
  default: '默认', hover: '悬停', focus: '聚焦', selected: '已选择', disabled: '禁用',
  open: '展开', current: '当前', error: '错误', invalid: '无效', readonly: '只读', empty: '空状态',
  indeterminate: '不确定', complete: '完成', loading: '加载',
}
const foundationTokens: Record<'control' | 'collection' | 'date' | 'color' | 'navigation' | 'layout', string[]> = {
  control: ['surface-primary', 'surface-secondary', 'text-primary', 'text-tertiary', 'border-default', 'brand-primary', 'radius-control'],
  collection: ['surface-primary', 'surface-secondary', 'text-primary', 'text-tertiary', 'border-default', 'brand-primary', 'radius-control'],
  date: ['surface-primary', 'surface-secondary', 'text-primary', 'text-tertiary', 'border-default', 'brand-primary', 'status-error', 'radius-control'],
  color: ['surface-primary', 'surface-secondary', 'text-primary', 'text-tertiary', 'border-default', 'brand-primary', 'radius-control'],
  navigation: ['surface-primary', 'surface-secondary', 'text-primary', 'text-tertiary', 'border-default', 'brand-primary', 'radius-control'],
  layout: ['border-default', 'spacing-8'],
}
const foundationAsset = (seed: { id:string; name:string; category:keyof typeof foundationTokens; description:string; semantic:string; rule:string; accessibility:string }):ComponentAsset => {
  const binding=getDesktopComponentBinding(seed.id)
  if(!binding)throw new Error(`基础组件 ${seed.id} 缺少 Binding`)
  return component({id:`component-${seed.id}`,name:seed.name,description:seed.description,semantic:seed.semantic,rules:[seed.rule],tokens:foundationTokens[seed.category],states:binding.states.map(state=>({id:state,name:foundationStateLabels[state]??state,description:`组件处于${foundationStateLabels[state]??state}状态。`})),anatomy:['语义容器','内容或当前值','适用状态指示'],accessibility:[seed.accessibility,'键盘焦点必须可见，禁用项不得触发操作。'],tags:['React Aria 基础家族',seed.category]})
}
const phaseTwoFoundationAssets:ComponentAsset[] = [
  foundationAsset({id:'toggle-button',name:'ToggleButton 切换按钮',category:'control',description:'表达可持续开启或关闭的操作状态。',semantic:'切换单一独立模式。',rule:'选中态必须有非颜色识别。',accessibility:'使用按钮与 aria-pressed 语义。'}),
  foundationAsset({id:'toggle-button-group',name:'ToggleButtonGroup 切换按钮组',category:'control',description:'在一组紧密选项中单选或多选。',semantic:'管理成组的切换状态。',rule:'组容器必须提供可访问名称。',accessibility:'保留组标签和子项 aria-pressed。'}),
  foundationAsset({id:'autocomplete',name:'Autocomplete 自动完成',category:'control',description:'根据输入实时缩小候选范围。',semantic:'在可搜索选项中快速定位结果。',rule:'当前为 ComboBox 语义等价实现，不宣称独立 React Aria API。',accessibility:'保留 combobox 键盘模型和无结果反馈。'}),
  foundationAsset({id:'slider',name:'Slider 滑块',category:'control',description:'通过轨道选择单值或范围。',semantic:'调整有边界的连续数值。',rule:'同时展示当前值与有效范围。',accessibility:'支持方向键、Home 和 End。'}),
  foundationAsset({id:'tag-group',name:'TagGroup 标签组',category:'collection',description:'展示并管理一组可识别标签。',semantic:'组织可移除或可选的轻量条目。',rule:'移除操作需要包含标签名称。',accessibility:'使用 TagGroup 集合语义与键盘导航。'}),
  foundationAsset({id:'meter',name:'Meter 度量条',category:'collection',description:'显示已知范围内的当前水平。',semantic:'表达容量、质量或阈值状态。',rule:'不用 Meter 表示任务进度。',accessibility:'提供 meter 名称、当前值和范围。'}),
  foundationAsset({id:'calendar',name:'Calendar 日历',category:'date',description:'在日历网格中选择单个日期。',semantic:'浏览月份并选择日期。',rule:'不可用日期保留可识别的禁用状态。',accessibility:'支持方向键、PageUp / PageDown 和日期朗读。'}),
  foundationAsset({id:'date-field',name:'DateField 日期字段',category:'date',description:'以可编辑分段输入日期。',semantic:'精确输入结构化日期值。',rule:'显示地区化顺序和错误恢复信息。',accessibility:'分段支持键盘输入与屏幕阅读。'}),
  foundationAsset({id:'date-range-picker',name:'DateRangePicker 日期范围选择',category:'date',description:'输入并在日历中选择起止日期。',semantic:'管理有先后关系的日期范围。',rule:'开始日期不得晚于结束日期。',accessibility:'起止字段各自具有明确语义。'}),
  foundationAsset({id:'range-calendar',name:'RangeCalendar 范围日历',category:'date',description:'在日历网格中选择起止日期。',semantic:'可视化选择连续日期范围。',rule:'清楚标记范围起点、终点与中间日期。',accessibility:'支持键盘选择范围并朗读不可用日期。'}),
  foundationAsset({id:'time-field',name:'TimeField 时间字段',category:'date',description:'以可编辑分段输入时间。',semantic:'精确输入结构化时间值。',rule:'小时制和粒度遵循项目区域设置。',accessibility:'分段支持键盘输入与屏幕阅读。'}),
  foundationAsset({id:'color-area',name:'ColorArea 颜色区域',category:'color',description:'在二维色彩空间中调整两个通道。',semantic:'粗粒度定位颜色。',rule:'始终与数值输入或色块预览配合使用。',accessibility:'提供可访问名称并支持方向键。'}),
  foundationAsset({id:'color-field',name:'ColorField 颜色字段',category:'color',description:'输入和校验颜色值。',semantic:'精确编辑颜色表示。',rule:'错误时保留输入并提供恢复说明。',accessibility:'标签与输入框程序化关联。'}),
  foundationAsset({id:'color-picker',name:'ColorPicker 颜色选择器',category:'color',description:'组合颜色区域、色相滑块、色块和数值输入。',semantic:'完成颜色的综合选择与校验。',rule:'所有子控件共享同一颜色状态。',accessibility:'禁用状态同步传递到子控件。'}),
  foundationAsset({id:'color-slider',name:'ColorSlider 颜色滑块',category:'color',description:'沿单一颜色通道调整色值。',semantic:'精确调节色相或其他颜色通道。',rule:'显示当前通道值和可见滑块。',accessibility:'支持方向键精确调整。'}),
  foundationAsset({id:'color-swatch',name:'ColorSwatch 色块',category:'color',description:'显示一个具体颜色样本。',semantic:'为颜色值提供可视化表示。',rule:'色块不能作为唯一的颜色名称。',accessibility:'在可选场景中配合文本或可访问名称。'}),
  foundationAsset({id:'color-swatch-picker',name:'ColorSwatchPicker 色块选择器',category:'color',description:'从预定义色块集合中选择颜色。',semantic:'选择受控色板值。',rule:'选中态不能只依赖颜色差异。',accessibility:'集合提供可访问名称与键盘选择。'}),
  foundationAsset({id:'breadcrumb',name:'Breadcrumbs 面包屑',category:'navigation',description:'显示当前页面在层级结构中的位置。',semantic:'在上下级页面之间回溯导航。',rule:'末项是带 aria-current 的非交互文本。',accessibility:'当前页使用 aria-current="page"，不重复提供无效链接。'}),
  foundationAsset({id:'disclosure',name:'Disclosure 折叠面板',category:'navigation',description:'展开或收起一段补充内容。',semantic:'按需显示局部详情。',rule:'触发器文案明确表达内容主题。',accessibility:'触发器暴露 aria-expanded 和控制关系。'}),
  foundationAsset({id:'disclosure-group',name:'DisclosureGroup 折叠面板组',category:'navigation',description:'协调一组可展开的内容区块。',semantic:'组织单开或多开的分组详情。',rule:'单开与多开模式由使用场景决定。',accessibility:'每个触发器都支持键盘展开与禁用。'}),
  foundationAsset({id:'link',name:'Link 链接',category:'navigation',description:'导航到站内或外部目标。',semantic:'执行导航而非即时操作。',rule:'按钮行为不得伪装成链接。',accessibility:'禁用时不可聚焦或发起导航。'}),
  foundationAsset({id:'toolbar',name:'Toolbar 工具栏',category:'navigation',description:'组织一组与当前对象相关的紧密操作。',semantic:'为编辑或视图提供成组命令。',rule:'按操作逻辑分组，并保留可访问名称。',accessibility:'工具栏提供 aria-label 和方向键导航。'}),
  foundationAsset({id:'separator',name:'Separator 分隔符',category:'layout',description:'在相邻内容或操作组之间建立语义边界。',semantic:'分隔相关但不同的内容区块。',rule:'方向与实际布局一致。',accessibility:'使用 separator 语义并声明方向。'}),
]
const phaseThreeFoundationAssets: ComponentAsset[] = [
  foundationAsset({id:'token-field',name:'TokenField 多值输入',category:'control',description:'输入、编辑并移除一组结构化标签。',semantic:'编辑成员、关键词或结构化搜索条件。',rule:'Token 创建策略由 value / onChange 或业务层的 tokenize 逻辑控制，基础契约不默认按分隔符转换。',accessibility:'标签、可编辑区和 Token 选择与删除具有明确语义。'}),
  foundationAsset({id:'grid-list',name:'GridList 网格列表',category:'collection',description:'展示可选择、可执行操作的结构化列表项。',semantic:'在信息量高于 ListBox 的条目集合中导航和选择。',rule:'行选择与行操作必须保持可区分的交互语义。',accessibility:'保留 grid、row 与网格单元语义，支持方向键导航。'}),
  foundationAsset({id:'color-wheel',name:'ColorWheel 色相环',category:'color',description:'在环形轨道上调整 HSL 或 HSB 色相。',semantic:'直观调整当前颜色的色相通道。',rule:'色相环需与数值或色块预览配合，不作为唯一颜色识别途径。',accessibility:'提供可读名称、当前值并支持键盘调整。'}),
  foundationAsset({id:'navigation-tree',name:'NavigationTree 导航树',category:'navigation',description:'以层级链接展示信息架构与当前路由。',semantic:'在多层页面结构中导航，不用于普通数据选择。',rule:'当前路由与其祖先节点都必须可识别。',accessibility:'使用树形导航与链接语义，展开状态和当前路由可被辅助技术读取。'}),
  foundationAsset({id:'preview-trigger',name:'PreviewTrigger 预览触发器',category:'navigation',description:'通过悬停、聚焦或长按展示可交互预览。',semantic:'在不离开当前上下文时查看对象摘要。',rule:'预览内容可交互时使用 PreviewTrigger，纯文字说明使用 Tooltip。',accessibility:'键盘聚焦也能打开预览，移出后按延时规则关闭。'}),
  foundationAsset({id:'group',name:'Group 控件组',category:'layout',description:'为一组相关控件提供统一语义和交互状态。',semantic:'组合同一任务内的多个控件。',rule:'只有真正相关的控件才应成组，纯视觉包裹使用 presentation。',accessibility:'默认使用 group 角色和可访问名称，重要区块可使用 region。'}),
  foundationAsset({id:'virtualizer',name:'Virtualizer 虚拟化列表',category:'layout',description:'仅渲染可见区域条目，支撑大数据集列表。',semantic:'在保留列表导航与选择语义的前提下降低渲染成本。',rule:'只在大数据量或已证明的性能瓶颈中启用，并提供稳定行高。',accessibility:'虚拟化不得破坏集合的可访问名称、选择和键盘导航。'}),
]

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
  component({ id: 'component-number-field', name: 'NumberField 数字输入框', description: '输入并调整受最小值、最大值和步长限制的数字。', semantic: '编辑结构化数值。', rules: ['明确单位与取值范围。', '达到边界时禁用对应步进按钮。'], tokens: ['surface-card', 'text-primary', 'border-default', 'brand-primary', 'status-error', 'radius-control', 'control-height-md'], states: [{ id: 'default', name: '默认', description: '可输入与步进。' }, { id: 'focus', name: '聚焦', description: '键盘焦点可见。' }, { id: 'disabled', name: '禁用', description: '不可编辑。' }, { id: 'error', name: '错误', description: '数值不符合约束。' }], anatomy: ['标签', '减少按钮', '数值输入', '增加按钮', '说明或错误'], accessibility: ['使用 spinbutton 语义。', '步进按钮包含字段名称。'], tags: ['表单', '数字'] }),
  component({ id: 'component-checkbox-group', name: 'CheckboxGroup 复选框组', description: '在同一问题下选择多个独立选项。', semantic: '管理多值布尔选择。', rules: ['组标签必须说明选择对象。', '加载中阻止重复修改。'], tokens: ['surface-card', 'text-primary', 'border-default', 'brand-primary', 'text-on-brand', 'status-error'], states: [{ id: 'default', name: '默认', description: '未选择。' }, { id: 'selected', name: '已选择', description: '包含选中项。' }, { id: 'disabled', name: '禁用', description: '组或选项不可操作。' }, { id: 'loading', name: '加载', description: '锁定选项并通知辅助技术。' }, { id: 'error', name: '错误', description: '未满足选择规则。' }], anatomy: ['组标签', '复选项', '说明', '错误信息'], accessibility: ['使用 checkboxgroup 与 checkbox 语义。', '错误信息与组关联。'], tags: ['表单', '多选'] }),
  component({ id: 'component-combo-box', name: 'ComboBox 组合输入框', description: '在可搜索选项中选择值，并可按契约允许自定义输入。', semantic: '搜索并选择受约束的值。', rules: ['选项较多或需要搜索时使用。', '无结果时提供明确反馈。'], tokens: ['surface-card', 'text-primary', 'field-placeholder', 'border-default', 'brand-primary', 'status-error', 'radius-control', 'control-height-md', 'shadow-overlay'], states: [{ id: 'default', name: '默认', description: '等待输入。' }, { id: 'focus', name: '聚焦', description: '输入框聚焦。' }, { id: 'open', name: '展开', description: '显示匹配选项。' }, { id: 'selected', name: '已选择', description: '已确定选项。' }, { id: 'disabled', name: '禁用', description: '不可搜索或展开。' }, { id: 'error', name: '错误', description: '值不符合约束。' }], anatomy: ['标签', '输入区', '展开按钮', '选项列表', '说明或错误'], accessibility: ['保留 combobox、listbox 与 option 语义。', '支持键盘搜索与选择。'], tags: ['表单', '搜索', '选择'] }),
  component({ id: 'component-list-box', name: 'ListBox 列表框', description: '在一组选项中进行单选或多选。', semantic: '表达可选择的扁平数据集。', rules: ['不用作普通导航列表。', '禁用项保留可识别但不接受选择。'], tokens: ['surface-card', 'text-primary', 'text-tertiary', 'border-default', 'brand-primary', 'radius-control'], states: [{ id: 'default', name: '默认', description: '显示可选项。' }, { id: 'focus', name: '聚焦', description: '键盘定位项可见。' }, { id: 'selected', name: '已选择', description: '当前选项已选中。' }, { id: 'disabled', name: '禁用项', description: '指定选项不可选。' }], anatomy: ['列表容器', '选项', '选中指示'], accessibility: ['使用 listbox 和 option 语义。', '支持方向键和类型跳转。'], tags: ['列表', '选择'] }),
  component({ id: 'component-tree', name: 'Tree 树形控件', description: '浏览、展开并选择层级数据。', semantic: '表达存在父子关系的数据集。', rules: ['展开操作与选择操作保持独立。', '大数据量使用前需完成虚拟化验收。'], tokens: ['surface-card', 'text-primary', 'text-tertiary', 'border-default', 'brand-primary', 'radius-control'], states: [{ id: 'default', name: '默认', description: '显示根节点。' }, { id: 'focus', name: '聚焦', description: '键盘定位节点。' }, { id: 'selected', name: '已选择', description: '当前节点已选中。' }, { id: 'open', name: '展开', description: '显示子节点。' }], anatomy: ['树容器', '节点', '展开按钮', '子节点'], accessibility: ['使用 tree 和 treeitem 语义。', '展开状态向辅助技术暴露。'], tags: ['树', '层级数据'] }),
  component({ id: 'component-progress-bar', name: 'ProgressBar 进度条', description: '表达可确定或不可确定的任务进度。', semantic: '向用户反馈长时任务的完成程度。', rules: ['已知进度时提供真实数值。', '无法估算时使用不确定状态，不伪造百分比。'], tokens: ['surface-secondary', 'text-primary', 'brand-primary', 'radius-control'], states: [{ id: 'default', name: '确定进度', description: '展示当前数值。' }, { id: 'indeterminate', name: '不确定进度', description: '无法预估完成时间。' }, { id: 'complete', name: '已完成', description: '进度达到最大值。' }], anatomy: ['标签', '数值', '轨道', '进度指示'], accessibility: ['提供 progressbar 语义和可读标签。', '不确定进度不输出伪造的 aria-valuenow。'], tags: ['反馈', '进度'] }),
  component({ id: 'component-popover', name: 'Popover 气泡卡片', description: '在触发元素附近展示补充内容或轻量操作。', semantic: '在不离开当前上下文的情况下展开补充面板。', rules: ['不承载需要长时间编辑的任务。', '关闭后焦点返回触发器。'], tokens: ['surface-card', 'text-primary', 'border-default', 'radius-container', 'shadow-overlay'], states: [{ id: 'default', name: '默认', description: '未展开。' }, { id: 'open', name: '展开', description: '面板可见。' }], anatomy: ['触发器', '浮层', '标题', '内容'], accessibility: ['支持 Escape 关闭与焦点返回。', '浮层继承所属项目主题。'], tags: ['浮层', '补充内容'] }),
  component({ id: 'component-tooltip', name: 'Tooltip 文字提示', description: '为图标或简短操作提供辅助解释。', semantic: '补充触发元素的简短含义。', rules: ['不放置必须阅读的关键信息。', '悬停和键盘聚焦都能触发。'], tokens: ['surface-inverse', 'text-on-brand', 'radius-control', 'shadow-overlay'], states: [{ id: 'default', name: '默认', description: '提示隐藏。' }, { id: 'open', name: '展示', description: '提示可见。' }], anatomy: ['触发器', '提示浮层', '短文本'], accessibility: ['键盘聚焦也必须显示。', '内容与触发器程序化关联。'], tags: ['浮层', '说明'] }),
  component({ id: 'component-drop-zone', name: 'DropZone 拖放区', description: '通过拖放或文件选择器导入文件。', semantic: '接收用户从本地选择的文件。', rules: ['同时提供非拖放的键盘操作途径。', '明确说明支持的文件类型和限制。'], tokens: ['surface-card', 'surface-secondary', 'text-primary', 'text-secondary', 'text-tertiary', 'border-strong', 'brand-primary', 'radius-container'], states: [{ id: 'default', name: '默认', description: '等待文件。' }, { id: 'hover', name: '悬停', description: '指针进入。' }, { id: 'focus', name: '聚焦', description: '键盘路径可见。' }, { id: 'disabled', name: '禁用', description: '不接受拖放或选择。' }], anatomy: ['拖放容器', '图标', '标题', '说明', '文件选择按钮'], accessibility: ['拖放区提供可访问名称。', '保留可聚焦的文件选择按钮。'], tags: ['文件', '上传'] }),
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
  component({ id: 'component-date-picker', name: 'DatePicker 日期选择', description: '选择单个日期或日期时间。', semantic: '输入受约束的日期值。', rules: ['显示明确格式并支持键盘输入。', '日期范围使用 DateRangePicker，不在单日期契约中混用。'], tokens: ['surface-card', 'text-primary', 'border-default', 'brand-primary', 'status-error', 'radius-control', 'control-height-md', 'shadow-overlay'], states: [{ id: 'default', name: '默认', description: '等待输入。' }, { id: 'focus', name: '聚焦', description: '日期分段键盘聚焦。' }, { id: 'open', name: '展开', description: '日历面板可见。' }, { id: 'selected', name: '已选择', description: '已确定日期。' }, { id: 'disabled', name: '禁用', description: '不可输入或展开。' }, { id: 'error', name: '错误', description: '日期不符合约束。' }], anatomy: ['标签', '日期分段', '日历触发器', '日历浮层', '错误信息'], accessibility: ['日期分段支持键盘输入和方向键。', '浮层关闭后焦点返回触发器。'], tags: ['表单', '筛选'] }),
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
  ...phaseTwoFoundationAssets,
  ...phaseThreeFoundationAssets,
]

const sharedProps: Record<string, ReactPropSchema> = {
  disabled: { type: 'boolean', default: false, description: '禁用并阻止用户操作。' },
}
const fieldProps: Record<string, ReactPropSchema> = {
  label: { type: 'string', required: true, description: '与控件程序化关联的字段标签。' },
  ...sharedProps,
}
const phaseThreeBindingProps = {
  'token-field': {
    label: fieldProps.label,
    value: { type: 'collection', description: '受控 TokenFieldValue，由文本段和 Token 段组成。' },
    defaultValue: { type: 'collection', description: '非受控模式的初始 TokenFieldValue。' },
    defaultTokens: { type: 'collection', description: '便捷的初始 Token 集合，每项包含唯一 id 和可见 label。' },
    defaultText: { type: 'string', description: '初始可编辑文本。' },
    description: { type: 'string', description: '输入内容、格式或提交方式说明。' },
    renderToken: { type: 'function', description: '自定义 Token 段的呈现内容。' },
    role: { type: 'string', enum: ['textbox', 'searchbox', 'combobox'], default: 'textbox', description: '编辑区的可访问角色。' },
    allowsNewlines: { type: 'boolean', default: false, description: '是否允许输入换行。' },
    isDisabled: { type: 'boolean', default: false, description: '禁用 Token 编辑、提交与移除。' },
    isReadOnly: { type: 'boolean', default: false, description: '仅展示已有 Token，不允许修改。' },
    onChange: { type: 'function', description: 'TokenFieldValue 发生变化时的回调。' },
    onSubmit: { type: 'function', description: '在编辑区内按 Enter 时的回调。' },
  },
  'grid-list': {
    label: fieldProps.label,
    items: { type: 'collection', required: true, description: '网格列表项，每项包含 id、label，以及可选 description 和 disabled。' },
    selectionMode: { type: 'string', enum: ['none', 'single', 'multiple'], default: 'none', description: '列表的选择模式。' },
    selectedKeys: { type: 'collection', description: '受控的已选项键集合。' },
    defaultSelectedKeys: { type: 'collection', description: '非受控模式的初始已选项键。' },
    onSelectionChange: { type: 'function', description: '选择集合变化时的回调。' },
    onAction: { type: 'function', description: '激活某一列表项时的回调。' },
    disabled: sharedProps.disabled,
    emptyMessage: { type: 'react-node', description: '集合为空时的内容。' },
    renderItem: { type: 'function', description: '自定义行内容的渲染函数。' },
    showSelectionControl: { type: 'boolean', default: true, description: '多选模式下显示选择控件。' },
  },
  'color-wheel': {
    label: fieldProps.label,
    size: { type: 'number', description: '色相环的外径，单位为像素。' },
    trackWidth: { type: 'number', description: '色相轨道宽度，单位为像素。' },
    value: { type: 'string', description: '受控颜色值。' },
    defaultValue: { type: 'string', description: '非受控模式的初始颜色值。' },
    isDisabled: { type: 'boolean', default: false, description: '禁用色相调整。' },
  },
  'navigation-tree': {
    label: fieldProps.label,
    items: { type: 'collection', required: true, description: '带 href 和可选 children 的递归导航节点。' },
    selectedRoute: { type: 'string', description: '当前路由，用于标记当前节点与祖先节点。' },
  },
  'preview-trigger': {
    label: fieldProps.label,
    preview: { type: 'react-node', required: true, description: '悬停、聚焦或长按后展示的可交互预览内容。' },
    delay: { type: 'number', description: '打开预览前的延时毫秒数。' },
    closeDelay: { type: 'number', description: '离开后关闭预览的延时毫秒数。' },
    previewLabel: { type: 'string', description: '预览浮层的可访问名称。' },
    href: { type: 'string', description: '将触发器渲染为链接时的目标。' },
    disabled: { type: 'boolean', default: false, description: '禁用预览触发。' },
    onPress: { type: 'function', description: '按下非链接触发器时的回调。' },
    placement: { type: 'string', description: '预览浮层的优先显示位置。' },
  },
  group: {
    label: { type: 'string', description: '`group` 或 `region` 角色的可访问名称；`presentation` 角色时省略。' },
    role: { type: 'string', enum: ['group', 'region', 'presentation'], default: 'group', description: '组容器的可访问角色。' },
    children: { type: 'react-node', required: true, description: '组内相关控件或内容。' },
    isDisabled: { type: 'boolean', default: false, description: '标记组容器禁用；调用方仍需同步禁用子控件。' },
    isInvalid: { type: 'boolean', default: false, description: '标记组内内容无效。' },
    isReadOnly: { type: 'boolean', default: false, description: '标记组容器只读；调用方仍需约束子控件行为。' },
  },
  virtualizer: {
    label: fieldProps.label,
    items: { type: 'collection', required: true, description: '需虚拟化渲染的大数据项集合。' },
    rowSize: { type: 'number', description: '预期的单行高度，用于布局计算。' },
    estimatedRowSize: { type: 'number', description: '行高不固定时的估算高度。' },
    height: { type: 'number', description: '可滚动可见区的高度。' },
    gap: { type: 'number', description: '相邻行之间的间距。' },
    padding: { type: 'number', description: '虚拟化内容区的内边距。' },
    shouldObserveItemSize: { type: 'boolean', default: false, description: '是否观察实际行高并重新测量。' },
    selectionMode: { type: 'string', enum: ['none', 'single', 'multiple'], default: 'none', description: '虚拟列表的选择模式。' },
    selectedKeys: { type: 'collection', description: '受控的已选项键集合。' },
    defaultSelectedKeys: { type: 'collection', description: '非受控模式的初始已选项键。' },
    onSelectionChange: { type: 'function', description: '可见集合的选择变化时的回调。' },
    renderItem: { type: 'function', description: '自定义行内容的渲染函数。' },
    emptyState: { type: 'react-node', description: '列表为空时的内容。' },
  },
} satisfies Record<'token-field' | 'grid-list' | 'color-wheel' | 'navigation-tree' | 'preview-trigger' | 'group' | 'virtualizer', Record<string, ReactPropSchema>>
const bindingProps: Record<string, Record<string, ReactPropSchema>> = {
  input: { ...fieldProps, placeholder: { type: 'string', description: '未输入时的提示。' }, invalid: { type: 'boolean', default: false, description: '是否处于错误状态。' } },
  'search-field': { label: fieldProps.label, value: { type: 'string', description: '受控搜索关键词。' }, defaultValue: { type: 'string', description: '非受控模式的初始关键词。' }, isDisabled: { type: 'boolean', default: false, description: '禁用搜索与清空操作。' }, isReadOnly: { type: 'boolean', default: false, description: '仅展示当前搜索值。' }, isInvalid: { type: 'boolean', default: false, description: '是否处于错误状态。' }, description: { type: 'string', description: '搜索范围或输入提示。' }, errorMessage: { type: 'string', description: '搜索条件错误时的恢复说明。' } },
  'number-field': { label: fieldProps.label, value: { type: 'number', description: '受控数值。' }, defaultValue: { type: 'number', description: '初始数值。' }, minValue: { type: 'number', description: '最小值。' }, maxValue: { type: 'number', description: '最大值。' }, step: { type: 'number', description: '步进值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' }, isReadOnly: { type: 'boolean', default: false, description: '是否只读。' }, isInvalid: { type: 'boolean', default: false, description: '是否处于错误状态。' }, description: { type: 'string', description: '数值单位或限制。' }, errorMessage: { type: 'string', description: '数值错误的恢复说明。' } },
  'checkbox-group': { label: fieldProps.label, options: { type: 'collection', required: true, description: '复选项列表。' }, value: { type: 'string[]', description: '受控的已选值。' }, defaultValue: { type: 'string[]', description: '初始已选值。' }, disabled: sharedProps.disabled, loading: { type: 'boolean', default: false, description: '加载中锁定整组。' }, invalid: { type: 'boolean', default: false, description: '是否校验失败。' }, errorMessage: { type: 'string', description: '校验失败的恢复说明。' } },
  'combo-box': { label: fieldProps.label, options: { type: 'collection', required: true, description: '可搜索选项。' }, selectedKey: { type: 'string', description: '受控选中项。' }, defaultSelectedKey: { type: 'string', description: '初始选中项。' }, inputValue: { type: 'string', description: '受控输入值。' }, defaultInputValue: { type: 'string', description: '初始输入值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' }, isReadOnly: { type: 'boolean', default: false, description: '是否只读。' }, isInvalid: { type: 'boolean', default: false, description: '是否校验失败。' }, errorMessage: { type: 'string', description: '校验失败的恢复说明。' } },
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
  'list-box': { label: fieldProps.label, items: { type: 'collection', required: true, description: '可选数据项。' }, selectionMode: { type: 'string', enum: ['none', 'single', 'multiple'], default: 'none', description: '选择模式。' }, selectedKeys: { type: 'collection', description: '受控选中项集合。' } },
  tree: { label: fieldProps.label, items: { type: 'collection', required: true, description: '层级节点数据。' }, selectionMode: { type: 'string', enum: ['none', 'single', 'multiple'], default: 'none', description: '选择模式。' } },
  'progress-bar': { label: fieldProps.label, value: { type: 'number', description: '当前进度值。' }, minValue: { type: 'number', description: '最小值。' }, maxValue: { type: 'number', description: '最大值。' }, isIndeterminate: { type: 'boolean', default: false, description: '是否为不确定进度。' } },
  'date-picker': { label: fieldProps.label, value: { type: 'date-value', description: '受控日期值。' }, defaultValue: { type: 'date-value', description: '初始日期值。' }, minValue: { type: 'date-value', description: '最早可选日期。' }, maxValue: { type: 'date-value', description: '最晚可选日期。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' }, isReadOnly: { type: 'boolean', default: false, description: '是否只读。' }, isInvalid: { type: 'boolean', default: false, description: '是否校验失败。' }, description: { type: 'string', description: '日期格式或选择限制。' }, errorMessage: { type: 'string', description: '日期错误的恢复说明。' } },
  popover: { label: fieldProps.label, children: { type: 'react-node', required: true, description: '浮层内容。' } },
  tooltip: { label: fieldProps.label, children: { type: 'react-node', required: true, description: '触发内容。' }, placement: { type: 'string', description: '优先显示方位。' }, offset: { type: 'number', description: '与触发器的距离。' }, shouldFlip: { type: 'boolean', default: true, description: '空间不足时是否翻转。' } },
  'drop-zone': { label: fieldProps.label, onFiles: { type: 'function', required: true, description: '文件选择或拖放后的回调。' }, disabled: sharedProps.disabled },
  'toggle-button': { children: { type: 'react-node', required: true, description: '按钮内容。' }, isSelected: { type: 'boolean', description: '受控选中状态。' }, defaultSelected: { type: 'boolean', default: false, description: '初始选中状态。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  'toggle-button-group': { 'aria-label': { type: 'string', required: true, description: '按钮组的可访问名称。' }, selectionMode: { type: 'string', enum: ['single','multiple'], default: 'single', description: '单选或多选。' }, selectedKeys: { type: 'collection', description: '受控选中项集合。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用整组。' } },
  autocomplete: { label: fieldProps.label, options: { type: 'collection', required: true, description: '可搜索选项。' }, selectedKey: { type: 'string', description: '受控选中项。' }, inputValue: { type: 'string', description: '受控输入值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  slider: { label: fieldProps.label, value: { type: 'collection', description: '受控单值或范围值。' }, defaultValue: { type: 'collection', description: '初始单值或范围值。' }, minValue: { type: 'number', description: '最小值。' }, maxValue: { type: 'number', description: '最大值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  'tag-group': { label: fieldProps.label, items: { type: 'collection', required: true, description: '标签数据。' }, onRemove: { type: 'function', description: '移除标签时的回调。' } },
  meter: { label: fieldProps.label, value: { type: 'number', description: '当前度量值。' }, minValue: { type: 'number', description: '最小值。' }, maxValue: { type: 'number', description: '最大值。' } },
  calendar: { 'aria-label': { type: 'string', required: true, description: '日历的可访问名称。' }, value: { type: 'date-value', description: '受控日期值。' }, defaultValue: { type: 'date-value', description: '初始日期值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  'date-field': { label: fieldProps.label, value: { type: 'date-value', description: '受控日期值。' }, defaultValue: { type: 'date-value', description: '初始日期值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' }, isInvalid: { type: 'boolean', default: false, description: '是否校验失败。' } },
  'date-range-picker': { label: fieldProps.label, value: { type: 'date-value', description: '受控日期范围。' }, defaultValue: { type: 'date-value', description: '初始日期范围。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' }, isInvalid: { type: 'boolean', default: false, description: '是否校验失败。' } },
  'range-calendar': { 'aria-label': { type: 'string', required: true, description: '范围日历的可访问名称。' }, value: { type: 'date-value', description: '受控日期范围。' }, defaultValue: { type: 'date-value', description: '初始日期范围。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  'time-field': { label: fieldProps.label, value: { type: 'date-value', description: '受控时间值。' }, defaultValue: { type: 'date-value', description: '初始时间值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' }, isInvalid: { type: 'boolean', default: false, description: '是否校验失败。' } },
  'color-area': { 'aria-label': { type: 'string', required: true, description: '颜色区域的可访问名称。' }, value: { type: 'string', description: '受控颜色值。' }, defaultValue: { type: 'string', description: '初始颜色值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  'color-field': { label: fieldProps.label, value: { type: 'string', description: '受控颜色值。' }, defaultValue: { type: 'string', description: '初始颜色值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' }, isInvalid: { type: 'boolean', default: false, description: '是否校验失败。' } },
  'color-picker': { label: fieldProps.label, value: { type: 'string', description: '受控颜色值。' }, defaultValue: { type: 'string', description: '初始颜色值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  'color-slider': { label: fieldProps.label, channel: { type: 'string', required: true, description: '被调整的颜色通道。' }, value: { type: 'string', description: '受控颜色值。' }, defaultValue: { type: 'string', description: '初始颜色值。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  'color-swatch': { color: { type: 'string', required: true, description: '要显示的颜色值。' } },
  'color-swatch-picker': { 'aria-label': { type: 'string', required: true, description: '色块组的可访问名称。' }, colors: { type: 'collection', required: true, description: '可选颜色集合。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用。' } },
  breadcrumb: { items: { type: 'collection', required: true, description: '按层级顺序排列的路径项。' } },
  disclosure: { title: { type: 'string', required: true, description: '折叠项标题。' }, children: { type: 'react-node', required: true, description: '展开后的内容。' }, disabled: sharedProps.disabled },
  'disclosure-group': { label: { type: 'string', description: '折叠面板组的可访问名称。' }, items: { type: 'collection', required: true, description: '折叠项数据。' }, allowsMultipleExpanded: { type: 'boolean', default: false, description: '是否允许多项同时展开。' } },
  link: { href: { type: 'string', description: '链接目标。' }, children: { type: 'react-node', required: true, description: '链接文案。' }, isDisabled: { type: 'boolean', default: false, description: '是否禁用导航。' } },
  toolbar: { 'aria-label': { type: 'string', required: true, description: '工具栏的可访问名称。' }, children: { type: 'react-node', required: true, description: '工具按钮或控件。' }, orientation: { type: 'string', enum: ['horizontal','vertical'], default: 'horizontal', description: '工具栏方向。' } },
  separator: { orientation: { type: 'string', enum: ['horizontal','vertical'], default: 'horizontal', description: '分隔符方向。' } },
  ...phaseThreeBindingProps,
}

const baseComponentAssets: ComponentAsset[] = definedComponentAssets.map((asset) => {
  if (asset.id === 'button') return asset
  const componentId = asset.id.replace(/^component-/, '')
  const runtime = RUNTIME_COMPONENT_REGISTRY[componentId]
  if (!runtime) return asset
  return {
    ...asset,
    bindings: { ...asset.bindings, storybook: { url: `http://127.0.0.1:6006/?path=/docs/core-${componentId}--docs`, title: `Core/${componentId}`, storyId: `core-${componentId}--${componentId === 'loading' ? 'sm' : componentId === 'badge' || componentId === 'toast' || componentId === 'alert' ? 'info' : componentId === 'upload' ? 'single' : componentId === 'tabs' ? 'horizontal' : componentId === 'dialog' || componentId === 'drawer' ? 'info' : 'default'}`, sourcePath: `src/design-system/stories/${componentId}.stories.tsx` }, react: { package: 'design-intelligence-system', exportName: runtime.runtimeExport, sourcePath: runtime.sourcePath, props: bindingProps[componentId] ?? asset.bindings?.react?.props ?? {} } },
    lifecycle: asset.lifecycle ?? { version: '1.0.0', revision: 1, changelog: [{ version: '1.0.0', date: '2026-09-18', changes: ['纳入主工程 Runtime Registry', '建立项目 Token 与状态映射'] }] },
    sync: { react: 'bound', storybook: 'bound', figma: asset.bindings?.figma ? 'bound' : 'unbound', overall: asset.bindings?.storybook || asset.bindings?.figma ? 'partially-bound' : 'partially-bound' },
  }
})

export const componentAssets: ComponentAsset[] = [...baseComponentAssets,...aiComponentAssets]
