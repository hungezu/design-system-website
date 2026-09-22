import { AI_COMPONENTS } from '../data/ai-components'
export type ComponentDemoVariant = {
  id: string
  label: string
}

const variants = (...items: Array<[string, string]>): ComponentDemoVariant[] =>
  items.map(([id, label]) => ({ id, label }))

const defaultDisabled = variants(['default', '默认'], ['disabled', '禁用'])

const demoVariants: Record<string, ComponentDemoVariant[]> = {
  button: variants(['primary', '主要'], ['secondary', '次要'], ['tertiary', '文字'], ['danger', '危险']),
  'button-group': variants(['default', '主要操作'], ['mixed', '混合层级'], ['disabled', '禁用']),
  'close-button': defaultDisabled,
  'toggle-button': variants(['default', '未选中'], ['selected', '已选中'], ['disabled', '禁用']),
  'toggle-button-group': variants(['single', '单选'], ['multiple', '多选']),

  input: variants(['default', '默认'], ['filled', '已填写'], ['invalid', '错误'], ['disabled', '禁用'], ['readonly', '只读且可清空'], ['required', '必填'], ['max-length', '长度限制'], ['adornments', '前后缀']),
  textarea: variants(['default', '默认'], ['filled', '已填写'], ['invalid', '错误'], ['disabled', '禁用'], ['readonly', '只读'], ['required', '必填'], ['max-length', '长度限制']),
  checkbox: variants(['default', '未选中'], ['checked', '已选中'], ['indeterminate', '部分选中'], ['disabled', '禁用'], ['invalid', '错误'], ['loading', '加载'], ['checked-disabled', '选中且禁用'], ['indeterminate-disabled', '部分选中且禁用']),
  'checkbox-group': variants(['default', '默认'], ['selected', '已选择'], ['invalid', '错误'], ['disabled', '禁用'], ['loading', '加载'], ['selected-disabled', '选中且禁用']),
  radio: variants(['default', '默认'], ['selected', '已选择'], ['disabled', '禁用'], ['invalid', '错误'], ['loading', '加载'], ['selected-disabled', '选中且禁用']),
  switch: variants(['default', '关闭'], ['checked', '开启'], ['disabled', '禁用'], ['loading', '加载'], ['checked-disabled', '开启且禁用']),
  form: variants(['default', '默认'], ['error', '提交错误'], ['disabled', '禁用'], ['loading', '提交中']),
  field: variants(['default', '默认'], ['required', '必填'], ['error', '错误'], ['disabled', '禁用']),
  'input-group': variants(['url', '网址'], ['amount', '金额']),
  'input-otp': variants(['six', '六位'], ['four', '四位'], ['disabled', '禁用']),
  'number-field': variants(['default','默认'], ['disabled','禁用'], ['invalid','错误'], ['readonly','只读'], ['min','最小值'], ['max','最大值']),
  'search-field': variants(['default', '空值'], ['filled', '已输入'], ['disabled', '禁用'], ['invalid', '错误'], ['readonly', '只读']),

  select: variants(['default', '未选择'], ['selected', '已选择'], ['invalid', '错误'], ['disabled', '禁用'], ['readonly', '只读'], ['required', '必填且配置清空'], ['clearable', '可清空'], ['empty', '空选项'], ['disabled-option', '含禁用选项'], ['long-option', '长选项']),
  'combo-box': variants(['default', '默认'], ['selected', '已选择'], ['disabled', '禁用'], ['invalid', '错误'], ['readonly', '只读'], ['no-results', '无匹配']),
  autocomplete: variants(['default', '默认'], ['selected', '已选择'], ['disabled', '禁用'], ['invalid', '错误'], ['readonly', '只读'], ['no-results', '无匹配']),
  cascader: variants(['region', '地区'], ['department', '部门']),
  slider: variants(['default', '单值'], ['range', '范围'], ['disabled', '禁用']),

  pagination: variants(['default','首页'], ['middle','中间页'], ['end','末页'], ['disabled', '禁用']),
  icon: variants(['sm','小图标'], ['md','中图标'], ['lg','大图标']),
  table: variants(['default', '标准'], ['secondary', '轻量表格'], ['pagination', '表格与分页'], ['grouped-header', '多级表头'], ['grouped-fixed', '多级表头与固定列'], ['grouped-selection', '多级表头与选择'], ['grouped-empty', '多级表头空数据'], ['grouped-loading', '多级表头加载'], ['compact', '紧凑'], ['comfortable', '宽松'], ['selection', '可选择'], ['loading', '加载'], ['empty', '空数据'], ['no-results', '无搜索结果'], ['sorting', '受控排序'], ['paged-selection', '跨页选择']),
  tree: variants(['single', '单选'], ['multiple', '多选']),
  'list-box': variants(['single', '单选'], ['multiple', '多选']),
  'tag-group': variants(['default', '只读'], ['removable', '可移除']),

  tag: variants(['default', '默认'], ['removable', '可移除'], ['disabled', '禁用']),
  badge: variants(['info', '信息'], ['success', '成功'], ['warning', '警告'], ['error', '错误']),
  empty: variants(['default', '默认'], ['action', '带操作']),
  loading: variants(['sm', '小'], ['md', '中'], ['lg', '大']),
  progress: variants(['partial', '进行中'], ['complete', '已完成']),
  'progress-bar': variants(['partial', '进行中'], ['complete', '已完成']),
  'progress-circle': variants(['partial', '进行中'], ['complete', '已完成']),
  meter: variants(['normal', '正常'], ['warning', '偏高'], ['critical', '临界']),
  skeleton: variants(['text', '文本'], ['card', '卡片']),
  spinner: variants(['sm', '小'], ['md', '中'], ['lg', '大']),
  descriptions: variants(['basic', '基础'], ['detailed', '详细']),

  'date-picker': variants(['default','默认'], ['disabled','禁用'], ['selected','已填写'], ['readonly','只读'], ['invalid','错误'], ['bounded','范围限制'], ['unavailable','不可用日期']),
  'date-range-picker': variants(['default','默认'], ['disabled','禁用'], ['selected','已填写'], ['readonly','只读'], ['invalid','错误'], ['bounded','范围限制'], ['unavailable','不可用日期']),
  'date-field': variants(['default','默认'], ['disabled','禁用'], ['selected','已填写'], ['readonly','只读'], ['invalid','错误'], ['bounded','范围限制']),
  'time-picker': variants(['default','默认'], ['disabled','禁用'], ['selected','已填写'], ['readonly','只读'], ['invalid','错误'], ['bounded','范围限制']),
  'time-field': variants(['default','默认'], ['disabled','禁用'], ['selected','已填写'], ['readonly','只读'], ['invalid','错误'], ['bounded','范围限制']),
  calendar: variants(['default','默认'], ['disabled','禁用'], ['selected','已选择'], ['bounded','范围限制'], ['unavailable','不可用日期']),
  'range-calendar': variants(['default','默认'], ['disabled','禁用'], ['selected','已选择'], ['bounded','范围限制'], ['unavailable','不可用日期']),

  'color-area': variants(['blue', '蓝色'], ['green', '绿色'], ['red', '红色']),
  'color-field': variants(['blue', '蓝色'], ['green', '绿色'], ['red', '红色']),
  'color-picker': variants(['blue', '蓝色'], ['green', '绿色'], ['red', '红色']),
  'color-slider': variants(['blue', '蓝色'], ['green', '绿色'], ['red', '红色']),
  'color-swatch': variants(['blue', '蓝色'], ['green', '绿色'], ['red', '红色']),
  'color-swatch-picker': variants(['brand', '品牌色'], ['status', '状态色']),

  tabs: variants(['horizontal', '下划线'], ['filled', '填充式'], ['vertical', '纵向下划线'], ['vertical-filled', '纵向填充'], ['full-width', '等宽填充'], ['with-icons', '图标与数量'], ['overflow', '溢出滚动'], ['disabled-item', '含禁用项'], ['disabled', '全部禁用']),
  breadcrumb: variants(['short', '简短'], ['deep', '多层']),
  menu: variants(['default', '纵向导航'], ['horizontal', '横向导航'], ['horizontal-filled', '横向填充'], ['grouped', '分组导航'], ['inline', '内嵌子菜单'], ['accordion', '手风琴展开'], ['collapsed', '收起模式'], ['disabled-item', '含禁用项'], ['action', '操作列表']),
  dropdown: variants(['default', '默认'], ['disabled-item', '含禁用项']),
  steps: variants(['start', '开始'], ['middle', '进行中'], ['complete', '完成']),
  accordion: variants(['single', '单项展开'], ['multiple', '多项展开']),
  disclosure: defaultDisabled,
  'disclosure-group': variants(['single', '单项展开'], ['multiple', '多项展开']),
  link: variants(['internal', '站内'], ['external', '外部']),
  toolbar: variants(['format', '格式'], ['align', '对齐']),

  dialog: variants(['info', '信息'], ['form', '表单'], ['loading','加载保护'], ['long', '长内容滚动'], ['nested', '嵌套选择器'], ['protected', '关闭方式限制']),
  'alert-dialog': variants(['confirm', '确认'], ['danger', '危险']),
  drawer: variants(['info', '查看'], ['form', '编辑'], ['long', '长内容滚动'], ['nested', '嵌套选择器'], ['protected', '关闭方式限制'], ['loading', '加载保护']),
  modal: variants(['info', '信息'], ['confirm', '确认']),
  toast: variants(['info', '信息'], ['success', '成功'], ['error', '错误'], ['restart', '关闭后重开'], ['persistent', '持续显示']),
  message: variants(['info', '信息'], ['success', '成功'], ['warning', '警告'], ['error', '错误']),
  alert: variants(['info', '信息'], ['success', '成功'], ['warning', '警告'], ['error', '错误']),
  tooltip: variants(['top', '上方'], ['bottom', '下方'], ['left', '左侧'], ['right', '右侧'], ['top-start', '左上'], ['top-end', '右上'], ['bottom-start', '左下'], ['bottom-end', '右下']),
  popover: variants(['short', '简短'], ['detailed', '详细']),
  popconfirm: variants(['normal', '普通'], ['danger', '危险']),

  card: variants(['simple', '简洁'], ['detailed', '详细']),
  divider: variants(['horizontal', '横向'], ['vertical', '纵向']),
  separator: variants(['horizontal', '横向'], ['vertical', '纵向']),
  grid: variants(['two', '两列'], ['three', '三列']),
  space: variants(['compact', '紧凑'], ['loose', '宽松']),
  stack: variants(['vertical', '纵向'], ['horizontal', '横向']),
  'page-container': variants(['default', '标准'], ['compact', '紧凑']),
  'resizable-panel': variants(['narrow', '窄'], ['wide', '宽']),
  surface: variants(['default', '默认'], ['subtle', '弱背景']),

  upload: variants(['single', '单文件'], ['multiple', '多文件'], ['error', '错误'], ['disabled', '禁用'], ['loading', '加载'], ['size-limit', '文件大小校验']),
  'drop-zone': variants(['default', '默认'], ['compact', '紧凑']),
  'image-preview': variants(['landscape', '横图'], ['square', '方图']),
  avatar: variants(['sm', '小'], ['md', '中'], ['lg', '大'], ['image', '图片'], ['recovery', '失败后恢复']),
  'file-list': variants(['readonly', '只读'], ['removable', '可移除']),
  kbd: variants(['copy', '复制'], ['search', '搜索']),
  'scroll-shadow': variants(['compact', '紧凑'], ['tall', '较高']),
}

Object.assign(demoVariants,Object.fromEntries(AI_COMPONENTS.map(item=>[item.id,item.variants.map(([id,label])=>({id,label}))])))
export function componentDemoVariants(componentId: string) {
  return demoVariants[componentId] ?? variants(['default', '默认'])
}
