import type { DesignAsset } from '../../types/design-system'

type IconSeed = readonly [assetId: string, name: string, category: string, runtimeId?: string, aliases?: readonly string[]]

const icon = ([assetId, name, category, runtimeId = assetId, aliases = []]: IconSeed): DesignAsset => ({
  id: `icon-${assetId}`, name, type: 'icon', description: `${category}类公共图标。`, semantic: `${name}操作或状态。`,
  platforms: ['web'], rules: ['默认使用 16px 和 currentColor；描边与面性风格由 Icon Profile 统一控制。'], tokens: ['text-secondary'],
  variants: [
    { id: 'outline', name: '线性', description: '常规界面和工具栏默认样式。' },
    { id: 'filled', name: '面性', description: '高强调、选中或紧凑场景样式。' },
  ], states: [], projectOverrides: [], status: 'stable', tags: [category, runtimeId, assetId, ...aliases],
})

const ICON_SEEDS: IconSeed[] = [
  // 通用操作
  ['add', '添加', '操作'], ['edit', '编辑', '操作'], ['delete', '删除', '操作'], ['search', '搜索', '操作'],
  ['refresh', '刷新', '操作'], ['close', '关闭', '操作'], ['clear-input', '清空输入', '操作'], ['remove-item', '移除单项', '操作'],
  ['confirm', '确认', '操作'], ['more', '更多操作', '操作'], ['copy', '复制', '操作'], ['save', '保存', '操作'],
  ['send', '发送', '操作'], ['share', '分享', '操作'], ['bookmark', '书签', '操作'],
  // 导航
  ['home', '首页', '导航'], ['back', '返回', '导航', 'arrow-left'], ['arrow-right', '前往', '导航'],
  ['expand', '展开', '导航', 'chevron-down'], ['collapse', '收起', '导航', 'chevron-up'], ['chevron-left', '左箭头', '导航'],
  ['chevron-right', '右箭头', '导航'], ['menu', '菜单', '导航'], ['compass', '指南针', '导航'], ['route', '路径', '导航'],
  ['map', '地图', '导航'], ['location', '位置', '导航'], ['pin', '定位点', '导航'], ['globe', '全球', '导航'], ['login', '登录', '导航'], ['logout', '退出登录', '导航'],
  // 数据与表格
  ['sort', '排序', '数据'], ['sort-ascending', '升序', '数据'], ['sort-descending', '降序', '数据'], ['column-settings', '列设置', '数据'],
  ['pagination-first', '首页页码', '数据'], ['pagination-previous', '上一页', '数据'], ['pagination-next', '下一页', '数据'], ['pagination-last', '末页页码', '数据'],
  ['chart-bar', '柱状图', '数据'], ['chart-line', '折线图', '数据'], ['chart-pie', '饼图', '数据'], ['database', '数据库', '数据'],
  ['checklist', '检查清单', '数据'], ['kanban', '看板', '数据'], ['graph', '关系图', '数据'], ['trend-up', '上升趋势', '数据'],
  // 筛选与搜索
  ['filter', '筛选', '筛选'], ['filter-add', '添加筛选', '筛选'], ['filter-remove', '移除筛选', '筛选'], ['filter-search', '筛选搜索', '筛选'],
  ['filter-edit', '编辑筛选', '筛选'], ['sliders', '条件调节', '筛选'], ['sort-time', '时间排序', '筛选'],
  // 文件
  ['file', '文件', '文件'], ['file-text', '文本文件', '文件'], ['file-pdf', 'PDF 文件', '文件'], ['file-code', '代码文件', '文件'],
  ['folder', '文件夹', '文件'], ['folder-open', '打开文件夹', '文件'], ['archive', '归档', '文件'], ['document-copy', '复制文档', '文件'],
  ['import', '导入', '文件', 'upload'], ['export', '导出', '文件', 'download'], ['upload', '上传', '文件'], ['download', '下载', '文件'],
  // 用户与权限
  ['user', '用户', '用户与权限'], ['users', '用户组', '用户与权限'], ['role', '角色', '用户与权限'], ['permission', '权限', '用户与权限'],
  ['user-add', '添加用户', '用户与权限'], ['user-remove', '移除用户', '用户与权限'], ['user-check', '用户已验证', '用户与权限'],
  ['user-ban', '禁用用户', '用户与权限'], ['user-circle', '用户头像', '用户与权限'], ['profile', '个人资料', '用户与权限'],
  ['address-book', '通讯录', '用户与权限'], ['organization', '组织机构', '用户与权限'], ['contact-card', '联系人卡片', '用户与权限'],
  // 状态与反馈
  ['success', '成功', '状态'], ['warning', '警告', '状态'], ['error', '错误', '状态'], ['info', '信息', '状态'], ['loading', '加载中', '状态'],
  ['prohibited', '禁止', '状态'], ['security-alert', '安全警告', '状态'], ['security-failed', '安全校验失败', '状态'], ['cloud-success', '云端同步成功', '状态'],
  ['file-error', '文件错误', '状态'], ['bell-alert', '通知提醒', '状态'],
  // 时间与日期
  ['calendar', '日历', '时间'], ['clock', '时钟', '时间'], ['timer', '计时器', '时间'], ['stopwatch', '秒表', '时间'],
  ['calendar-day', '单日日期', '时间'], ['calendar-days', '日期范围', '时间'], ['calendar-check', '已确认日期', '时间'], ['calendar-add', '添加日程', '时间'], ['alarm', '闹钟', '时间'],
  // 内容编辑
  ['bold', '粗体', '编辑'], ['italic', '斜体', '编辑'], ['underline', '下划线', '编辑'], ['align-left', '左对齐', '编辑'],
  ['align-center', '居中对齐', '编辑'], ['align-right', '右对齐', '编辑'], ['crop', '裁剪', '编辑'], ['eraser', '擦除', '编辑'], ['text-highlight', '文字高亮', '编辑'],
  // 媒体
  ['play', '播放', '媒体'], ['pause', '暂停', '媒体'], ['stop', '停止', '媒体'], ['volume-high', '高音量', '媒体'], ['volume-off', '静音', '媒体'],
  ['microphone', '麦克风', '媒体'], ['camera', '相机', '媒体'], ['image', '图片', '媒体'], ['video', '视频', '媒体'],
  // 系统
  ['settings', '设置', '系统'], ['notification', '通知', '系统'], ['help', '帮助', '系统'], ['lock', '锁定', '系统'], ['unlock', '解锁', '系统'],
  ['view', '查看', '系统', 'eye'], ['eye-off', '隐藏', '系统'], ['power', '电源', '系统'], ['wifi', '无线网络', '系统'], ['bluetooth', '蓝牙', '系统'],
  ['server', '服务器', '系统'], ['cloud', '云服务', '系统'], ['terminal', '终端', '系统'], ['bug', '缺陷', '系统'], ['key', '密钥', '系统'], ['shield', '安全防护', '系统'],
  // 布局与视图
  ['sidebar-left', '左侧栏', '布局'], ['sidebar-right', '右侧栏', '布局'], ['sidebar-top', '顶部栏', '布局'], ['sidebar-bottom', '底部栏', '布局'], ['split-view', '分栏视图', '布局'],
]

export const iconAssets: DesignAsset[] = ICON_SEEDS.map(icon)
