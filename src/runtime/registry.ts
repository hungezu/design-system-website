import { AI_COMPONENTS } from '../data/ai-components'
export interface RuntimeComponentEntry {
  id: string
  name: string
  runtimeExport: string
  sourcePath: string
}

const entry = (id: string, name: string, runtimeExport: string, sourcePath: string): RuntimeComponentEntry => ({ id, name, runtimeExport, sourcePath })

/** 当前主工程可发布的组件权威清单。 */
export const RUNTIME_COMPONENT_REGISTRY: Readonly<Record<string, RuntimeComponentEntry>> = Object.freeze({
  ...Object.fromEntries(AI_COMPONENTS.map(item=>[item.id,entry(item.id,item.name,item.exportName,`src/design-system/primitives/AI/${item.file}`)])),
  button: entry('button', '按钮 Button', 'DSButton', 'src/design-system/primitives/Button/DSButton.tsx'),
  'toggle-button': entry('toggle-button', '切换按钮 ToggleButton', 'DSToggleButton', 'src/design-system/primitives/Collections/index.tsx'),
  'toggle-button-group': entry('toggle-button-group', '切换按钮组 ToggleButtonGroup', 'DSToggleButtonGroup', 'src/design-system/primitives/Collections/index.tsx'),
  input: entry('input', '文本输入 Input', 'DSInput', 'src/design-system/primitives/TextField/index.tsx'),
  'token-field': entry('token-field', '令牌输入 TokenField', 'DSTokenField', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  'search-field': entry('search-field', '搜索框 SearchField', 'DSSearchField', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  'number-field': entry('number-field', '数字输入 NumberField', 'DSNumberField', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  select: entry('select', '下拉选择 Select', 'DSSelect', 'src/design-system/primitives/Select/index.tsx'),
  autocomplete: entry('autocomplete', '自动完成 Autocomplete', 'DSAutocomplete', 'src/design-system/primitives/Collections/Additional.tsx'),
  'combo-box': entry('combo-box', '组合输入 ComboBox', 'DSComboBox', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  slider: entry('slider', '滑块 Slider', 'DSSlider', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  'checkbox-group': entry('checkbox-group', '复选框组 CheckboxGroup', 'DSCheckboxGroup', 'src/design-system/primitives/Forms/index.tsx'),
  table: entry('table', '数据表格 Table', 'DSTable', 'src/runtime/vendor/runtime.js'),
  'grid-list': entry('grid-list', '网格列表 GridList', 'DSGridList', 'src/design-system/primitives/Collections/index.tsx'),
  'list-box': entry('list-box', '列表框 ListBox', 'DSListBox', 'src/design-system/primitives/Collections/index.tsx'),
  tree: entry('tree', '树形控件 Tree', 'DSTree', 'src/design-system/primitives/Collections/Tree.tsx'),
  'tag-group': entry('tag-group', '标签组 TagGroup', 'DSTagGroup', 'src/design-system/primitives/Collections/Additional.tsx'),
  meter: entry('meter', '度量条 Meter', 'DSMeter', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  pagination: entry('pagination', '分页 Pagination', 'DSPagination', 'src/design-system/primitives/Pagination/index.tsx'),
  'progress-bar': entry('progress-bar', '进度条 ProgressBar', 'DSProgressBar', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  calendar: entry('calendar', '日历 Calendar', 'DSCalendar', 'src/design-system/primitives/DateTime/index.tsx'),
  'date-field': entry('date-field', '日期字段 DateField', 'DSDateField', 'src/design-system/primitives/DateTime/index.tsx'),
  'date-picker': entry('date-picker', '日期选择 DatePicker', 'DSDatePicker', 'src/design-system/primitives/DateTime/index.tsx'),
  'date-range-picker': entry('date-range-picker', '日期范围 DateRangePicker', 'DSDateRangePicker', 'src/design-system/primitives/DateTime/index.tsx'),
  'range-calendar': entry('range-calendar', '范围日历 RangeCalendar', 'DSRangeCalendar', 'src/design-system/primitives/DateTime/index.tsx'),
  'time-field': entry('time-field', '时间字段 TimeField', 'DSTimeField', 'src/design-system/primitives/DateTime/index.tsx'),
  'color-area': entry('color-area', '颜色区域 ColorArea', 'DSColorArea', 'src/design-system/primitives/Colors/index.tsx'),
  'color-field': entry('color-field', '颜色字段 ColorField', 'DSColorField', 'src/design-system/primitives/Colors/index.tsx'),
  'color-picker': entry('color-picker', '颜色选择器 ColorPicker', 'DSColorPicker', 'src/design-system/primitives/Colors/ColorPicker.tsx'),
  'color-slider': entry('color-slider', '颜色滑块 ColorSlider', 'DSColorSlider', 'src/design-system/primitives/Colors/index.tsx'),
  'color-swatch': entry('color-swatch', '色块 ColorSwatch', 'DSColorSwatch', 'src/design-system/primitives/Colors/index.tsx'),
  'color-swatch-picker': entry('color-swatch-picker', '色块选择器 ColorSwatchPicker', 'DSColorSwatchPicker', 'src/design-system/primitives/Colors/index.tsx'),
  'color-wheel': entry('color-wheel', '色相环 ColorWheel', 'DSColorWheel', 'src/design-system/primitives/Colors/index.tsx'),
  breadcrumb: entry('breadcrumb', '面包屑 Breadcrumbs', 'DSBreadcrumb', 'src/design-system/primitives/Collections/index.tsx'),
  menu: entry('menu', '菜单 Menu', 'DSMenu', 'src/design-system/primitives/Navigation/Menu.tsx'),
  'navigation-tree': entry('navigation-tree', '导航树 NavigationTree', 'DSNavigationTree', 'src/design-system/primitives/Collections/NavigationTree.tsx'),
  disclosure: entry('disclosure', '折叠面板 Disclosure', 'DSDisclosure', 'src/design-system/primitives/Collections/Additional.tsx'),
  'disclosure-group': entry('disclosure-group', '折叠面板组 DisclosureGroup', 'DSDisclosureGroup', 'src/design-system/primitives/Collections/index.tsx'),
  link: entry('link', '链接 Link', 'DSLink', 'src/design-system/primitives/Collections/index.tsx'),
  toolbar: entry('toolbar', '工具栏 Toolbar', 'DSToolbar', 'src/design-system/primitives/Collections/index.tsx'),
  dialog: entry('dialog', '对话框 Dialog', 'DSDialog', 'src/design-system/primitives/Overlays/index.tsx'),
  drawer: entry('drawer', '抽屉 Drawer', 'DSDrawer', 'src/design-system/primitives/Overlays/index.tsx'),
  popover: entry('popover', '气泡卡片 Popover', 'DSPopover', 'src/design-system/primitives/Collections/Additional.tsx'),
  tooltip: entry('tooltip', '文字提示 Tooltip', 'DSTooltip', 'src/design-system/primitives/Collections/Additional.tsx'),
  'preview-trigger': entry('preview-trigger', '预览触发器 PreviewTrigger', 'DSPreviewTrigger', 'src/design-system/primitives/Collections/index.tsx'),
  separator: entry('separator', '分隔符 Separator', 'DSSeparator', 'src/design-system/primitives/Collections/index.tsx'),
  group: entry('group', '组合 Group', 'DSGroup', 'src/design-system/primitives/Collections/index.tsx'),
  virtualizer: entry('virtualizer', '虚拟化容器 Virtualizer', 'DSVirtualizer', 'src/design-system/primitives/Collections/Virtualizer.tsx'),
  tabs: entry('tabs', '标签页 Tabs', 'DSTabs', 'src/design-system/primitives/Navigation/index.tsx'),
  tag: entry('tag', '标签 Tag', 'DSTag', 'src/design-system/primitives/Feedback/index.tsx'),
  badge: entry('badge', '徽标 Badge', 'DSBadge', 'src/design-system/primitives/Feedback/index.tsx'),
  toast: entry('toast', '轻提示 Toast', 'DSToast', 'src/design-system/primitives/Feedback/index.tsx'),
  form: entry('form', '表单 Form', 'DSForm', 'src/design-system/primitives/Forms/index.tsx'),
  field: entry('field', '表单字段 Field', 'DSField', 'src/design-system/primitives/Forms/index.tsx'),
  upload: entry('upload', '上传 Upload', 'DSUpload', 'src/design-system/primitives/Upload/index.tsx'),
  'drop-zone': entry('drop-zone', '拖放区 DropZone', 'DSDropZone', 'src/design-system/primitives/Collections/Additional.tsx'),
  empty: entry('empty', '空状态 Empty', 'DSEmpty', 'src/design-system/primitives/Feedback/index.tsx'),
  loading: entry('loading', '加载状态 Loading', 'DSLoading', 'src/design-system/primitives/Feedback/index.tsx'),
  alert: entry('alert', '警告提示 Alert', 'DSAlert', 'src/design-system/primitives/Feedback/index.tsx'),
  checkbox: entry('checkbox', '复选框 Checkbox', 'DSCheckbox', 'src/design-system/primitives/Forms/index.tsx'),
  radio: entry('radio', '单选框 Radio', 'DSRadio', 'src/design-system/primitives/Forms/index.tsx'),
  switch: entry('switch', '开关 Switch', 'DSSwitch', 'src/design-system/primitives/Forms/index.tsx'),
  icon: entry('icon', '图标 Icon', 'DSIcon', 'src/runtime/vendor/runtime.js'),
})

export const listRuntimeComponents = () => Object.values(RUNTIME_COMPONENT_REGISTRY)
export const getRuntimeComponent = (id: string) => RUNTIME_COMPONENT_REGISTRY[id] ?? null
export const isRuntimeComponentExport = (exportName: string) => listRuntimeComponents().some((component) => component.runtimeExport === exportName)
