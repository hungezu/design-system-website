import type {
  GeneratedSystem,
  InformationArchitectureSpec,
  LayoutNode,
  LayoutPrimitiveType,
  PageSpec,
  ProductBrief,
  SystemLayoutCandidate,
  SystemLayoutSpec,
  ThemeSpec,
} from '../types/generation'

let nodeSequence = 0
const node = (
  type: LayoutPrimitiveType,
  label: string,
  options: Partial<Omit<LayoutNode, 'id' | 'type' | 'label'>> = {},
): LayoutNode => ({ id: `${type}-${++nodeSequence}`, type, label, ...options })

export function generateInformationArchitecture(brief: ProductBrief): InformationArchitectureSpec {
  return {
    id: `${brief.id}-ia`,
    productBriefId: brief.id,
    navigationDepth: brief.informationHierarchy.maxNavigationDepth,
    generatedBy: 'rule-based-demo',
    root: {
      id: `${brief.id}-system`, type: 'system', name: brief.productName,
      children: brief.modules.map((module) => ({
        id: module.id, type: 'module', name: module.name,
        children: brief.pages.filter((page) => page.moduleId === module.id).map((page) => ({
          id: page.id, type: 'page', name: page.name, route: `/${module.id}/${page.id}`,
        })),
      })),
    },
  }
}

export function generateSystemLayoutCandidates(brief: ProductBrief): SystemLayoutCandidate[] {
  const deepNavigation = brief.informationHierarchy.maxNavigationDepth >= 3
  const needsInspector = brief.constraints.some((item) => /对照|不跳转|上下文/.test(item))
  const sharedHeader = () => node('header', '全局 Header', { locked: true })

  return [
    {
      id: 'workspace-sidebar', name: '深层业务工作台',
      reason: deepNavigation ? '业务模块多且导航层级较深，需要稳定侧栏保持定位。' : '适合以模块切换为主的日常管理任务。',
      benefits: ['模块位置稳定', '适合高频列表任务', '内容区宽度充足'], limitations: ['跨模块任务需要额外上下文提示'],
      root: node('root', '系统根节点', { direction: 'vertical', children: [sharedHeader(), node('split-view', '主体分栏', { direction: 'horizontal', children: [node('sidebar', '模块导航', { width: '240px' }), node('content', '主内容', { width: 'fill' })] })] }),
    },
    {
      id: 'workspace-context', name: '上下文协同工作台',
      reason: '适合跨模块操作和需要保持当前对象上下文的任务。',
      benefits: ['一级模块切换直接', '上下文信息持续可见', '支持就地编辑'], limitations: ['可用内容宽度相对减少'],
      root: node('root', '系统根节点', { direction: 'vertical', children: [node('header', 'Header + 一级导航', { locked: true, children: [node('primary-navigation', '一级业务导航')] }), node('split-view', '上下文工作区', { direction: 'horizontal', children: [node('context-navigation', '上下文导航', { width: '208px' }), node('content', '主内容', { width: 'fill' }), node('inspector', '右侧 Inspector', { width: needsInspector ? '320px' : '280px' })] })] }),
    },
    {
      id: 'workspace-comparison', name: '对照分析工作台',
      reason: needsInspector ? '特殊约束要求左右对照，并在同一页面保留实时状态。' : '适合多维数据比较与联动分析。',
      benefits: ['并行比较两类信息', '支持非标准业务区域', '上下文无需跳转'], limitations: ['需要更宽桌面视口', '低频页面不宜使用'],
      root: node('root', '系统根节点', { direction: 'vertical', children: [sharedHeader(), node('split-view', '主分析区', { direction: 'horizontal', children: [node('sidebar', '业务导航', { width: '220px' }), node('content', '分析内容', { width: 'fill', children: [node('split-view', '双维度对照', { direction: 'horizontal', children: [node('content', '左侧主内容'), node('custom-region', '右侧实时状态', { customKind: 'live-status', width: '36%' })] })] })] }), node('footer-region', '底部活动时间线', { height: '160px' })] }),
    },
  ]
}

export function generateSystemLayout(brief: ProductBrief, selectedCandidateId?: string): SystemLayoutSpec {
  const candidates = generateSystemLayoutCandidates(brief)
  return { id: `${brief.id}-layout`, productBriefId: brief.id, candidates, selectedCandidateId: selectedCandidateId ?? candidates[0].id, generatedBy: 'rule-based-demo' }
}

export function generatePageLayouts(brief: ProductBrief): PageSpec[] {
  return brief.pages.map((page) => {
    const isList = page.type === 'list'
    const isDetail = page.type === 'detail'
    const isDashboard = page.type === 'dashboard'
    const isCustom = page.type === 'custom'
    const sections: LayoutNode[] = [node('page-header', `${page.name}标题`)]
    const patternIds: string[] = []
    const componentIds: string[] = ['button']

    if (isList) {
      sections.push(node('toolbar', '搜索与筛选'), node('table-region', '数据表格'), node('footer-region', '分页'))
      patternIds.push('pattern-search-filter', 'pattern-table-management', 'pattern-bulk-actions')
      componentIds.push('component-input', 'component-select', 'component-table', 'component-pagination')
    } else if (isDetail) {
      sections.unshift(node('breadcrumb', '面包屑'))
      sections.push(node('split-view', '详情与上下文', { direction: 'horizontal', children: [node('content', '主要信息'), node('aside', '关联信息', { width: '320px' })] }))
      patternIds.push('pattern-detail-page')
      componentIds.push('component-tabs', 'component-drawer')
    } else if (isDashboard || isCustom) {
      sections.push(node('split-view', '多维业务区', { direction: 'horizontal', children: [node('custom-region', isDashboard ? '业务指标区域' : '专题主内容', { customKind: isDashboard ? 'dashboard' : 'domain-content' }), node('custom-region', '实时状态区域', { customKind: 'live-status', width: '36%' })] }), node('footer-region', '活动日志'))
      patternIds.push('pattern-loading', 'pattern-error')
    } else {
      sections.push(node('content', '表单内容'), node('toolbar', '表单操作'))
      patternIds.push('pattern-form-create-edit')
      componentIds.push('component-input', 'component-select', 'component-date-picker')
    }

    const recommendedStartingPoint = page.type === 'custom' ? undefined : {
      list: 'template-list', detail: 'template-detail', form: 'template-form', dashboard: 'template-dashboard',
    }[page.type]

    const sectionSpecs = sections.map((layoutNode) => {
      const binding = layoutNode.type === 'toolbar'
        ? { patternId: isList ? 'pattern-search-filter' : 'pattern-form-create-edit', componentId: isList ? 'component-input' : 'button' }
        : layoutNode.type === 'table-region'
          ? { patternId: 'pattern-table-management', componentId: 'component-table' }
          : layoutNode.type === 'footer-region' && isList
            ? { componentId: 'component-pagination' }
            : layoutNode.type === 'split-view' && isDetail
              ? { patternId: 'pattern-detail-page', componentId: 'component-tabs' }
              : layoutNode.type === 'split-view'
                ? { patternId: 'pattern-loading' }
                : {}
      return { id: `${page.id}-${layoutNode.id}`, layoutNode, ...binding, businessFields: page.tasks }
    })

    return {
      id: `${page.id}-spec`, moduleId: page.moduleId, name: page.name, route: `/${page.moduleId}/${page.id}`,
      task: page.tasks.join('、'), recommendedStartingPoint,
      patternIds, componentIds: [...new Set(componentIds)],
      layout: node('root', `${page.name}布局`, { direction: 'vertical', children: sections }),
      sections: sectionSpecs,
    }
  })
}

export function generateSystem(brief: ProductBrief, theme: ThemeSpec, selectedCandidateId?: string): GeneratedSystem {
  return {
    id: `${brief.id}-generated`, instanceId: 'guokexin', productBrief: brief,
    informationArchitecture: generateInformationArchitecture(brief),
    systemLayout: generateSystemLayout(brief, selectedCandidateId),
    pageSpecs: generatePageLayouts(brief), theme,
    generatedBy: 'rule-based-demo', generatedAt: new Date().toISOString(),
  }
}

export function visitLayout(root: LayoutNode, visitor: (node: LayoutNode, parent?: LayoutNode) => void, parent?: LayoutNode) {
  visitor(root, parent)
  root.children?.forEach((child) => visitLayout(child, visitor, root))
}

export function updateLayoutNode(root: LayoutNode, nodeId: string, patch: Partial<Pick<LayoutNode, 'label' | 'direction' | 'width' | 'height' | 'locked'>>): LayoutNode {
  if (root.id === nodeId) return { ...root, ...patch }
  return { ...root, children: root.children?.map((child) => updateLayoutNode(child, nodeId, patch)) }
}

export function addLayoutNode(root: LayoutNode, parentId: string, child: LayoutNode): LayoutNode {
  if (root.id === parentId && !root.locked) return { ...root, children: [...(root.children ?? []), child] }
  return { ...root, children: root.children?.map((item) => addLayoutNode(item, parentId, child)) }
}

export function removeLayoutNode(root: LayoutNode, nodeId: string): LayoutNode {
  return { ...root, children: root.children?.filter((child) => child.id !== nodeId || child.locked).map((child) => removeLayoutNode(child, nodeId)) }
}

export function moveLayoutNode(root: LayoutNode, nodeId: string, offset: -1 | 1): LayoutNode {
  const children = root.children ? [...root.children] : undefined
  if (children) {
    const index = children.findIndex((child) => child.id === nodeId)
    const target = index + offset
    if (index >= 0 && target >= 0 && target < children.length && !children[index].locked) {
      ;[children[index], children[target]] = [children[target], children[index]]
      return { ...root, children }
    }
  }
  return { ...root, children: children?.map((child) => moveLayoutNode(child, nodeId, offset)) }
}

export function createCustomRegion(label: string): LayoutNode {
  return node('custom-region', label || '自定义区域', { customKind: 'designer-defined', width: 'fill' })
}

export function createLayoutRegion(type: LayoutPrimitiveType, label: string): LayoutNode {
  return node(type, label, { width: type === 'inspector' || type === 'aside' ? '320px' : 'fill', direction: type === 'split-view' || type === 'grid' ? 'horizontal' : undefined })
}

export function getLayoutNodes(root: LayoutNode) {
  const result: LayoutNode[] = []
  visitLayout(root, (item) => result.push(item))
  return result
}

export function reparentLayoutNode(root: LayoutNode, nodeId: string, newParentId: string): LayoutNode {
  const nodes = getLayoutNodes(root)
  const moving = nodes.find((item) => item.id === nodeId)
  const newParent = nodes.find((item) => item.id === newParentId)
  if (!moving || moving.type === 'root' || moving.locked || !newParent || newParent.locked) return root

  const movingDescendants = new Set(getLayoutNodes(moving).map((item) => item.id))
  if (movingDescendants.has(newParentId)) return root

  const withoutNode = removeLayoutNode(root, nodeId)
  return addLayoutNode(withoutNode, newParentId, moving)
}
