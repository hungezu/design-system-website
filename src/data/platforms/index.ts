import type { PlatformDefinition } from '../../types/design-system'

export const platforms: PlatformDefinition[] = [
  {
    id: 'web',
    name: 'Web',
    description: '面向指针、键盘和不同桌面视口的生产力界面。',
    capabilities: ['指针输入', '键盘导航', '自适应布局', '高信息密度'],
    stateExtensions: ['hover', 'focus-visible'],
    componentExtensions: ['Table', 'Sidebar', 'Tooltip'],
    constraints: ['关键操作必须支持键盘完成。'],
    tokenOverrides: { 'space-md': '16px' },
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: '面向触控、单手操作与小屏连续任务。',
    capabilities: ['触控输入', '手势', '系统返回', '安全区域'],
    stateExtensions: ['pressed', 'dragging'],
    componentExtensions: ['Bottom Navigation', 'Bottom Sheet', 'Swipe Action'],
    constraints: ['主要触控目标不小于 44px。'],
    tokenOverrides: { 'space-md': '18px', 'radius-control': '10px' },
  },
  {
    id: 'embedded',
    name: 'Embedded',
    description: '面向有限屏幕、物理按键和受限输入的设备界面。',
    capabilities: ['物理按键', '旋钮输入', '有限屏幕', '离线运行'],
    stateExtensions: ['focused', 'held'],
    componentExtensions: ['Focus Ring', 'Physical Button Hint'],
    constraints: ['操作路径短，状态反馈不能依赖颜色单独表达。'],
    tokenOverrides: { 'border-strong': '#777d76', 'radius-control': '5px' },
  },
  {
    id: 'spatial',
    name: 'Spatial',
    description: '面向视野空间、凝视、手势和语音协同。',
    capabilities: ['凝视', '手势', '语音', '空间锚定'],
    stateExtensions: ['targeted', 'pinched'],
    componentExtensions: ['HUD', 'Spatial Panel', 'Voice Prompt'],
    constraints: ['信息必须适应视野范围和观看距离。'],
    tokenOverrides: { 'space-lg': '30px', 'radius-container': '18px' },
  },
]

export const getPlatform = (id: string) => platforms.find((platform) => platform.id === id)
