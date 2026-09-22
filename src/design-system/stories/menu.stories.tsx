// Menu styles use the same shared controls as the component catalog.
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RuntimeExample } from '../../components/RuntimeExample'
import { PreviewScope } from '../theme/PreviewScope'
import { defaultProjectTheme, projectPreviewVariables } from '../../services/project-theme'
import { guokexinProject } from '../../data/projects/guokexin'
import '../../styles/index.css'
const meta = { title: 'Navigation/menu', component: RuntimeExample, tags:['autodocs'], args:{id:'menu',demoVariant:'default'}, argTypes:{id:{table:{disable:true}},demoVariant:{control:'select',options:["default","horizontal","horizontal-filled","grouped","inline","accordion","collapsed","disabled-item","action"]}}, decorators:[Story=><PreviewScope vars={projectPreviewVariables(defaultProjectTheme(guokexinProject))}><div style={{width:'min(880px,90vw)',padding:24}}><Story/></div></PreviewScope>], parameters:{docs:{description:{component:"菜单：真实 DS 控件。交互、禁用和异常示例与组件详情同源；状态是否适用以组件 API 为准。"}}} } satisfies Meta<typeof RuntimeExample>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { name: "纵向导航", args: { demoVariant: "default" } }
export const Horizontal: Story = { name: "横向导航", args: { demoVariant: "horizontal" } }
export const HorizontalFilled: Story = { name: "横向填充", args: { demoVariant: "horizontal-filled" } }
export const Grouped: Story = { name: "分组导航", args: { demoVariant: "grouped" } }
export const Inline: Story = { name: "内嵌子菜单", args: { demoVariant: "inline" } }
export const Accordion: Story = { name: "手风琴展开", args: { demoVariant: "accordion" } }
export const Collapsed: Story = { name: "收起模式", args: { demoVariant: "collapsed" } }
export const DisabledItem: Story = { name: "含禁用项", args: { demoVariant: "disabled-item" } }
export const Action: Story = { name: "操作列表", args: { demoVariant: "action" } }
