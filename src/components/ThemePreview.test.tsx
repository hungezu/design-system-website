// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import type { CSSProperties } from 'react'
import { describe, expect, it } from 'vitest'
import { ThemePreview } from './ThemePreview'

describe('ThemePreview', () => {
  it('使用真实 Runtime 组件展示项目主题', () => {
    render(<ThemePreview style={{ '--brand-primary': '#165DFF' } as CSSProperties} variant="components" />)

    expect(screen.getByRole('button', { name: '主要按钮' }).className).toContain('ds-btn')
    expect(screen.getByLabelText('资源名称').className).toContain('ds-input__native')
    expect(screen.getByRole('table').className).toContain('ds-table')
    expect(document.querySelector('.theme-preview-field-grid .ds-select__trigger')?.className).not.toContain('ds-btn')
    expect(document.querySelector('.app-select')).toBeNull()
  })

  it('组件预览与完整页面使用不同结构', () => {
    const { rerender } = render(<ThemePreview style={{}} variant="components" />)
    expect(screen.queryByText('工作台')).toBeNull()
    expect(document.querySelector('.theme-system-preview--components')).not.toBeNull()

    rerender(<ThemePreview style={{}} variant="page" />)
    expect(screen.getByText('工作台')).not.toBeNull()
    expect(screen.getByLabelText('关键词')).not.toBeNull()
    expect(document.querySelector('.theme-system-preview--page')).not.toBeNull()
  })
})
