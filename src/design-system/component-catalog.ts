import { AI_COMPONENTS, AI_COMPONENT_IDS } from '../data/ai-components'
import { DESKTOP_COMPONENT_BINDINGS } from './component-bindings'
export const COMPONENT_GROUPS = ['按钮','表单','选择器','集合与列表','数据展示','日期与时间','颜色','导航','浮层与反馈','布局','文件与媒体','排版与工具','AI 交互'] as const
export const COMPONENT_DISPLAY_NAMES: Record<string, string> = {
  ...Object.fromEntries(AI_COMPONENTS.map(item=>[item.id,item.name])),
  'combo-box': '组合输入框', slider: '滑块', calendar: '日历', 'date-field': '日期字段', 'drop-zone': '拖放区', icon: '图标',
  button: '按钮', input: '输入框', select: '选择器', textarea: '多行输入框', checkbox: '复选框', radio: '单选框', switch: '开关', form: '表单', field: '表单字段',
  'date-picker': '日期选择器', 'date-range-picker': '日期范围选择器', 'time-picker': '时间选择器', cascader: '级联选择器', autocomplete: '自动完成',
  table: '表格', pagination: '分页', tag: '标签', badge: '徽标', empty: '空状态', loading: '加载状态', progress: '进度', descriptions: '描述列表', tree: '树形控件',
  tabs: '标签页', breadcrumb: '面包屑', menu: '菜单', dropdown: '下拉菜单', steps: '步骤条', dialog: '对话框', drawer: '抽屉', toast: '轻提示', message: '消息提示', alert: '警告提示', tooltip: '文字提示', popover: '气泡卡片', popconfirm: '气泡确认',
  card: '卡片', divider: '分隔线', grid: '网格', space: '间距', stack: '堆叠布局', 'page-container': '页面容器', 'resizable-panel': '可调整面板', upload: '上传', 'image-preview': '图片预览', avatar: '头像', 'file-list': '文件列表',
  accordion: '手风琴', 'alert-dialog': '警告对话框', 'button-group': '按钮组', 'close-button': '关闭按钮', disclosure: '折叠面板', 'disclosure-group': '折叠面板组', 'checkbox-group': '复选框组',
  'color-area': '色彩区域', 'color-field': '色值输入', 'color-picker': '颜色选择器', 'color-slider': '色彩滑块', 'color-swatch': '色块', 'color-swatch-picker': '色块选择器',
  'input-group': '输入框组', 'input-otp': '验证码输入', kbd: '键盘按键', link: '链接', 'list-box': '列表框', meter: '度量条', modal: '模态框', 'number-field': '数字输入框',
  'progress-bar': '进度条', 'progress-circle': '环形进度', 'range-calendar': '日期范围日历', 'scroll-shadow': '滚动阴影', 'search-field': '搜索框', separator: '分隔符', skeleton: '骨架屏', spinner: '加载指示器', surface: '内容表面',
  'tag-group': '标签组', 'time-field': '时间字段', 'toggle-button': '切换按钮', 'toggle-button-group': '切换按钮组', toolbar: '工具栏',
}

export const componentDisplayName = (componentId: string) => COMPONENT_DISPLAY_NAMES[componentId] ?? componentId
const groupIds: Record<string,string[]> = {
  按钮:['button','button-group','close-button','toggle-button','toggle-button-group'],
  表单:['input','textarea','checkbox','checkbox-group','radio','switch','form','field','input-group','input-otp','number-field','search-field'],
  选择器:['select','autocomplete','combo-box','cascader','slider'],
  集合与列表:['table','tree','list-box','tag-group'],
  数据展示:['tag','badge','empty','loading','progress','progress-bar','progress-circle','meter','skeleton','spinner','descriptions'],
  日期与时间:['date-picker','date-range-picker','date-field','time-picker','time-field','calendar','range-calendar'],
  导航:['tabs','breadcrumb','menu','dropdown','steps','accordion','disclosure','disclosure-group','link','toolbar'],
  浮层与反馈:['dialog','alert-dialog','drawer','modal','toast','message','alert','tooltip','popover','popconfirm'],
  文件与媒体:['upload','image-preview','avatar','file-list','drop-zone'],
  排版与工具:['kbd','scroll-shadow'],
}
export function componentGroup(id:string) { if(AI_COMPONENT_IDS.includes(id))return 'AI 交互'; if(id.startsWith('color-')) return '颜色'; return Object.entries(groupIds).find(([,ids])=>ids.includes(id))?.[0] ?? '布局' }
export const COMPONENT_CATALOG = DESKTOP_COMPONENT_BINDINGS.map(binding=>({...binding,group:componentGroup(binding.componentId)}))
