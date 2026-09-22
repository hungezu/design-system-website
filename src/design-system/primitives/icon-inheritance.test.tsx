// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { DSComboBox, DSNumberField, DSSearchField } from './AdvancedFields'
import { DSDatePicker } from './DateTime'
import { DSMessage } from './Feedback'
import { DSCheckbox, DSRadio } from './Forms'
import { DSSelect } from './Select'
import { DSIcon, DesignSystemProvider } from '../../runtime'

afterEach(cleanup)

const options = [
  { id: 'design', label: '设计' },
  { id: 'develop', label: '开发' },
]

it('日期、下拉、搜索和反馈图标通过 Icon Registry 渲染', () => {
  const { container } = render(
    <>
      <DSDatePicker label="日期" />
      <DSSelect label="职责" options={options.map(item => ({ value: item.id, label: item.label }))} />
      <DSComboBox label="职责" options={options} />
      <DSSearchField label="搜索" />
      <DSMessage title="提示" tone="warning">请检查内容</DSMessage>
    </>,
  )

  for (const name of ['calendar', 'chevron-down', 'search', 'warning']) {
    expect(container.querySelector(`.ds-icon[data-icon="${name}"][data-icon-status="published"]`)).not.toBeNull()
  }
})

it('复选框和单选框保留 Primitive 自身状态标记', () => {
  const { container } = render(
    <>
      <DSCheckbox label="同意" defaultChecked />
      <DSRadio label="职责" options={[{ value: 'design', label: '设计' }]} defaultValue="design" />
    </>,
  )

  expect(container.querySelector('.owned-choice__box')).not.toBeNull()
  expect(container.querySelector('.owned-choice__box .ds-icon')).toBeNull()
})

it('数字输入框两侧统一使用 Reicon 加减图标', () => {
  const { container } = render(<DSNumberField label="数量" defaultValue={2} />)
  const icons = Array.from(container.querySelectorAll('.owned-number__step-icon'))

  expect(icons).toHaveLength(2)
  expect(icons.every(icon => icon.tagName.toLowerCase() === 'svg')).toBe(true)
  expect(icons.every(icon => icon.classList.contains('reicon'))).toBe(true)
  expect(icons.every(icon => icon.getAttribute('width') === '14')).toBe(true)
})

it('Runtime 对内置图标同样执行项目 Icon Pack 白名单', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const manifest = {
    projectId: 'icon-pack-test', projectName: 'Icon Pack Test', releaseVersion: '1.0.0', checksum: '12345678',
    iconPack: { status: 'confirmed', version: '1', count: 1, defaultWeight: 'outline', defaultSize: 'md', source: 'test', checksum: 'pack' },
  } as never
  const icons = JSON.stringify({
    projectIconPack: { status: 'confirmed', iconIds: ['search'] },
    publishedIcons: [{ id: 'search' }, { id: 'calendar' }],
  })
  const { container } = render(
    <DesignSystemProvider manifest={manifest} tokens="" icons={icons}>
      <DSIcon name="search" decorative />
      <DSIcon name="calendar" decorative />
    </DesignSystemProvider>,
  )

  expect(container.querySelector('[data-icon="search"]')).not.toBeNull()
  expect(container.querySelector('.ds-icon--missing[data-icon="help"]')).not.toBeNull()
  expect(error).toHaveBeenCalledWith(expect.stringContaining('calendar'))
})
