import type { Meta, StoryObj } from '@storybook/react-vite'
import { buttonAsset } from '../../../data/assets/components'
import { DSIcon } from '../../../runtime/vendor/runtime.js'
import { Button } from './Button'

const contract = buttonAsset.contract!

const meta = {
  title: 'Design System/Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    controls: { include: ['priority', 'appearance', 'tone', 'size', 'disabled', 'loading', 'children'] },
  },
  args: {
    children: '取消',
    priority: 'secondary',
    appearance: 'outline',
    tone: 'neutral',
    size: 'md',
    disabled: false,
    loading: false,
  },
  argTypes: {
    priority: { control: 'select', options: contract.properties.priority.values },
    appearance: { control: 'select', options: contract.properties.appearance.values },
    tone: { control: 'select', options: contract.properties.tone.values },
    size: { control: 'select', options: contract.properties.size.values },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    icon: { control: false },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  name: '主要操作',
  args: { priority: 'primary', appearance: 'filled', tone: 'brand', children: '保存' },
}

export const SecondaryOutline: Story = {
  name: '次要线框',
  args: { priority: 'secondary', appearance: 'outline', tone: 'neutral', children: '取消' },
}

export const SecondarySoft: Story = {
  name: '次要浅色填充',
  args: { priority: 'secondary', appearance: 'soft', tone: 'neutral', children: '稍后处理' },
}

export const Tertiary: Story = {
  name: '辅助操作',
  args: { priority: 'tertiary', appearance: 'ghost', tone: 'neutral', children: '查看更多' },
}

export const DangerPrimary: Story = {
  name: '危险主要操作',
  args: { priority: 'primary', appearance: 'filled', tone: 'danger', children: '删除' },
}

export const DangerSecondary: Story = {
  name: '危险次要操作',
  args: { priority: 'secondary', appearance: 'outline', tone: 'danger', children: '移除' },
}

export const Sizes: Story = {
  name: '尺寸',
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
}

export const Disabled: Story = { name: '禁用', args: { disabled: true } }
export const Loading: Story = { name: '加载', args: { loading: true, children: '正在保存' } }
export const WithIcon: Story = { name: '带图标', args: { icon: <DSIcon name="save" size="sm" decorative />, children: '保存' } }
export const LongText: Story = { name: '长文本', args: { children: '保存并应用到当前全部筛选结果' } }
