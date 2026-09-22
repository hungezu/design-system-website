// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { DSMessage } from './index'

afterEach(cleanup)

it.each(['info', 'success', 'warning', 'error'] as const)('消息提示提供 %s 语义与非颜色图标', tone => {
  const { container } = render(<DSMessage title="状态提示" tone={tone}>状态说明</DSMessage>)
  const message = container.querySelector('.owned-message')
  expect(message?.getAttribute('data-tone')).toBe(tone)
  expect(message?.querySelector('.owned-feedback-icon')).not.toBeNull()
  expect(message?.getAttribute('role')).toBe(tone === 'error' ? 'alert' : 'status')
})
