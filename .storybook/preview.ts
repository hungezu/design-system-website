import '@fontsource-variable/noto-sans-sc'
import '../src/design-system/tokens.css'
import type { Preview } from '@storybook/react-vite'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: '工作区',
      values: [
        { name: '工作区', value: '#F2F3F5' },
        { name: '内容面', value: '#FFFFFF' },
      ],
    },
    layout: 'centered',
  },
}

export default preview
