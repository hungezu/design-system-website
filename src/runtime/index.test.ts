import { describe, expect, it } from 'vitest'
import * as runtime from './index'

describe('Web Runtime public surface', () => {
  it('exports the complete mature component foundation', () => {
    for (const name of ['DesignSystemProvider', 'DSButton', 'DSInput', 'DSSelect', 'DSTable', 'DSPagination', 'DSDialog', 'DSIcon', 'DSToast', 'DSTabs', 'DSDrawer', 'DSForm', 'DSUpload', 'DSEmpty', 'DSLoading', 'DSAlert', 'DSTag', 'DSBadge', 'DSCheckbox', 'DSRadio', 'DSSwitch']) {
      expect(runtime).toHaveProperty(name)
      expect(typeof runtime[name as keyof typeof runtime]).toBe('function')
    }
  })
  it('主工程 Runtime Registry 覆盖国科信项目组件', () => {
    const ids = new Set(runtime.listRuntimeComponents().map((component) => component.id))
    for (const id of ['button', 'input', 'select', 'table', 'pagination', 'dialog', 'drawer', 'tabs', 'tag', 'badge', 'toast', 'form', 'field', 'upload', 'empty', 'loading', 'alert', 'checkbox', 'radio', 'switch']) {
      expect(ids.has(id), id).toBe(true)
    }
  })
})
