// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { DSButton } from './DSButton'

afterEach(cleanup)

it('DSButton 通过统一 Button Primitive 保留兼容 API 和状态', () => {
  const { container } = render(<DSButton variant="primary" semantic="danger" size="lg" aria-busy disabled>Test</DSButton>)
  const button = container.querySelector('button')!
  expect(button.className).toContain('gkx-button')
  expect(button.className).toContain('ds-btn--primary')
  expect(button.dataset.priority).toBe('primary')
  expect(button.dataset.appearance).toBe('filled')
  expect(button.dataset.tone).toBe('danger')
  expect(button.getAttribute('aria-busy')).toBe('true')
  expect((button as HTMLButtonElement).disabled).toBe(true)
})

it('DSButton 纯图标模式不渲染空文本槽并保留可访问名称', () => {
  const { container } = render(
    <DSButton icon={<svg data-testid="plus-icon" />} aria-label="新增" />,
  )
  const button = container.querySelector('button')!

  expect(button.dataset.iconOnly).toBe('true')
  expect(button.getAttribute('aria-label')).toBe('新增')
  expect(button.querySelector('.gkx-button__label')).toBeNull()
  expect(button.querySelector('.gkx-button__icon svg')).not.toBeNull()
})

it('加载切换保留名称和原文本图标槽，阻止重复操作并可恢复', () => {
  const { container, rerender, getByRole } = render(<DSButton icon={<svg/>}>保存</DSButton>)
  const label = container.querySelector('.gkx-button__label')
  const icon = container.querySelector('.gkx-button__icon')
  rerender(<DSButton icon={<svg/>} loading>保存</DSButton>)
  expect((getByRole('button', { name: '保存' }) as HTMLButtonElement).disabled).toBe(true)
  expect(container.querySelector('.gkx-button__label')).toBe(label)
  expect(container.querySelector('.gkx-button__icon')).toBe(icon)
  expect(container.querySelector('.gkx-button__spinner')).not.toBeNull()
  rerender(<DSButton icon={<svg/>}>保存</DSButton>)
  expect((getByRole('button', { name: '保存' }) as HTMLButtonElement).disabled).toBe(false)
  expect(container.querySelector('.gkx-button__spinner')).toBeNull()
})

it('危险文字按钮保留 ghost 与 danger，不回退到普通主题色', () => {
  const {getByRole}=render(<DSButton variant="tertiary" semantic="danger">删除</DSButton>)
  const button=getByRole('button',{name:'删除'})
  expect(button.dataset.priority).toBe('tertiary')
  expect(button.dataset.appearance).toBe('ghost')
  expect(button.dataset.tone).toBe('danger')
})
