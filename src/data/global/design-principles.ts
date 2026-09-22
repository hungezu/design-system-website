export const designPrinciples = [
  {
    id: 'semantic-first',
    name: '语义先于外观',
    description: '先说明资产解决什么问题，再决定它在某个项目中的视觉表现。',
  },
  {
    id: 'inherit-not-copy',
    name: '继承而非复制',
    description: '平台和项目扩展已有定义，避免产生无法同步的组件副本。',
  },
  {
    id: 'state-completeness',
    name: '状态必须完整',
    description: '资产定义需要覆盖用户操作和系统反馈所需的关键状态。',
  },
  {
    id: 'traceable-decisions',
    name: '规则可以追溯',
    description: '视觉结果应能追溯到语义变量、平台规范和项目覆盖来源。',
  },
] as const
