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
  input: entry('input', '文本输入 Input', 'DSInput', 'src/design-system/primitives/TextField/index.tsx'),
  'search-field': entry('search-field', '搜索框 SearchField', 'DSSearchField', 'src/design-system/primitives/AdvancedFields/index.tsx'),
  select: entry('select', '下拉选择 Select', 'DSSelect', 'src/design-system/primitives/Select/index.tsx'),
  table: entry('table', '数据表格 Table', 'DSTable', 'src/runtime/vendor/runtime.js'),
  pagination: entry('pagination', '分页 Pagination', 'DSPagination', 'src/design-system/primitives/Pagination/index.tsx'),
  dialog: entry('dialog', '对话框 Dialog', 'DSDialog', 'src/design-system/primitives/Overlays/index.tsx'),
  drawer: entry('drawer', '抽屉 Drawer', 'DSDrawer', 'src/design-system/primitives/Overlays/index.tsx'),
  tabs: entry('tabs', '标签页 Tabs', 'DSTabs', 'src/design-system/primitives/Navigation/index.tsx'),
  tag: entry('tag', '标签 Tag', 'DSTag', 'src/design-system/primitives/Feedback/index.tsx'),
  badge: entry('badge', '徽标 Badge', 'DSBadge', 'src/design-system/primitives/Feedback/index.tsx'),
  toast: entry('toast', '轻提示 Toast', 'DSToast', 'src/design-system/primitives/Feedback/index.tsx'),
  form: entry('form', '表单 Form', 'DSForm', 'src/design-system/primitives/Forms/index.tsx'),
  field: entry('field', '表单字段 Field', 'DSField', 'src/design-system/primitives/Forms/index.tsx'),
  upload: entry('upload', '上传 Upload', 'DSUpload', 'src/design-system/primitives/Upload/index.tsx'),
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
