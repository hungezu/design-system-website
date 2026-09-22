import type { PlatformDefinition, ProjectConfig } from '../types/design-system'

export interface AssistantRecommendation {
  pattern: string
  assets: string[]
  reasoning: string
  contextRules: string[]
}

export const demoPrompts = [
  '我要做一个移动端删除设备的流程',
  '为 Web 数据列表选择合适的搜索方式',
  '设计一个加载失败后的恢复状态',
]

export const getDemoRecommendation = (input: string, project: ProjectConfig, platform?: PlatformDefinition): AssistantRecommendation => {
  const normalized = input.toLowerCase()
  const contextRules = [
    ...(platform?.constraints.slice(0, 1) ?? []),
    ...project.specialRules.slice(0, 1),
  ]

  if (normalized.includes('删除') || normalized.includes('危险')) {
    return {
      pattern: '危险操作确认',
      assets: ['确认弹层', '按钮 / 主操作', '结果反馈'],
      reasoning: '删除是高风险且可能不可逆的操作，需要在确认前说明影响，在处理中阻止重复提交，并在完成后更新导航位置。',
      contextRules,
    }
  }

  if (normalized.includes('搜索') || normalized.includes('筛选')) {
    return {
      pattern: '搜索与筛选',
      assets: ['输入框', '选择器', '空状态'],
      reasoning: '先用搜索缩小候选集合，再用少量高价值筛选条件提高精度，同时为无结果提供快速恢复操作。',
      contextRules,
    }
  }

  return {
    pattern: '错误处理',
    assets: ['结果反馈', '按钮 / 主操作', '空状态'],
    reasoning: '先说明发生了什么，再保留用户上下文，并提供明确的重试或返回路径。',
    contextRules,
  }
}

const draftStorageKey = 'design-intelligence-project-drafts'

export const addRecommendationToDraft = (projectId: string, recommendation: AssistantRecommendation) => {
  const stored = JSON.parse(localStorage.getItem(draftStorageKey) ?? '{}') as Record<string, AssistantRecommendation[]>
  const projectDrafts = stored[projectId] ?? []
  if (!projectDrafts.some((item) => item.pattern === recommendation.pattern)) {
    stored[projectId] = [...projectDrafts, recommendation]
    localStorage.setItem(draftStorageKey, JSON.stringify(stored))
  }
  return stored[projectId].length
}
