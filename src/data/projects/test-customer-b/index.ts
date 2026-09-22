import type { ProjectConfig } from '../../../types/design-system'

/**
 * 来自旧工程冻结发布包的隔离测试项目。它只用于验证多项目主题、Pattern、
 * Icon Pack 与版本上下文不会串用，不冒充真实客户规范。
 */
export const testCustomerBProject: ProjectConfig = {
  id: 'test-customer-b',
  releaseProjectId: 'proj-mtwbe3v9-zf5v8f',
  name: '测试客户 B',
  shortName: '客户 B',
  platform: 'web',
  description: '用于验证多项目 Token、Pattern、Icon Pack 与发布版本隔离的测试项目。',
  brandPrimary: '#13B2BA',
  brandSecondary: '#006a70',
  fontFamily: '"Noto Sans SC Variable", sans-serif',
  radiusScale: 1,
  density: 'comfortable',
  themeMode: 'light',
  tokenOverrides: {
    'brand-primary': '#13B2BA',
    'brand-secondary': '#006a70',
    'surface-canvas': '#f5f6f7',
    'surface-primary': '#ffffff',
    'surface-subtle': '#fafbfc',
    'border-default': '#e5e6eb',
    'text-primary': '#1f2329',
    'text-secondary': '#646a73',
    'radius-control': '6px',
  },
  specialRules: [
    '测试项目只验证隔离，不作为真实客户规范。',
    '查询列表使用双列筛选与更宽内容容器。',
    '项目 Icon Pack 与国科信项目独立。',
  ],
  customAssetIds: [],
  componentIds: ['button', 'input', 'select', 'table', 'pagination', 'dialog', 'tag', 'badge'],
  status: 'demo',
  iconRegistryVersion: '1.1.0',
}
