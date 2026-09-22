# 菜单与标签页

本次参考 [HeroUI Tabs](https://heroui.com/en/docs/react/components/tabs) 的填充、下划线与滚动机制，以及 [Arco Menu](https://arco.design/react/components/menu) 的横向、内嵌、分组、手风琴和收起模式。沿用 React Aria 与项目主题，不引入第三方组件包。

## 选择组件

- `DSMenu mode="vertical"`：侧边导航，支持分组、递归子菜单和收起。
- `DSMenu mode="horizontal"`：顶部导航，一级横向滚动，子菜单点击弹出。
- `DSTabs`：同一页面内切换内容，自动关联标签与面板。
- `DSMenu mode="action"`（兼容默认值）：简单操作列表，使用扁平 items。按钮触发的操作菜单使用 `DSDropdown`。

菜单详情默认展示纵向导航；组件 API 默认仍是 action，已有调用无需迁移。

## 前端使用

从项目交付包的 Runtime 入口导入 `DSMenu`、`DSTabs` 和对应类型；在现有项目主题 Provider / PreviewScope 内使用，沿用交付包的样式入口。组件详情的“代码”可复制对应演示，实际业务应使用下面的原始组件 API。

```tsx
const [page, setPage] = useState('overview')
<DSMenu
  label="项目导航"
  mode="vertical"
  value={page}
  onAction={setPage}
  defaultOpenKeys={['resources']}
  collapsible
  items={[
    { id: 'overview', label: '项目概览', href: '/project/overview' },
    { id: 'resources', label: '资源管理', children: [
      { id: 'components', label: '组件资源', href: '/project/components' },
      { id: 'templates', label: '页面模板', disabled: true },
    ] },
  ]}
/>
```

路由项目应由当前 pathname 推导 `value`。可为叶子提供 `href`，或在 `onAction(id)` 中调用现有路由的 navigate；不要仅改变高亮而不更新实际内容。收起导航推荐为一级项提供注册库图标；没有图标时保留截断文字及完整 title，不产生空白入口。`group` 是分组标题，`children` 是可展开层级，不在父节点上设置 href。

选择、展开、收起分别支持受控与非受控：`value/defaultValue`、`openKeys/defaultOpenKeys`、`collapsed/defaultCollapsed`，对应回调为 `onAction`、`onOpenChange`、`onCollapsedChange`。`accordion` 限制同层只展开一个分组。

```tsx
<DSTabs
  label="项目设置"
  appearance="filled"
  fullWidth
  items={[
    { id: 'basic', label: '基本信息', content: <BasicSettings /> },
    { id: 'members', label: '成员权限', badge: 8, content: <MemberSettings /> },
    { id: 'notice', label: '通知设置', disabled: true, content: null },
  ]}
/>
```

`appearance` 为 `underline`（默认）或 `filled`；`orientation` 为 `horizontal`（默认）或 `vertical`。`fullWidth` 等宽分配空间，过长仍保留滚动。`icon`、`badge` 是可选的内容补充。`value/defaultValue/onChange` 控制当前标签。

## 行为与主题

菜单保留原生 Tab 顺序，方向键与 Home/End 辅助定位；按钮可用 Enter/Space 激活。内嵌标题展开和关闭，浮层可用 Escape 关闭并恢复焦点。Tabs 使用 React Aria 的方向键切换与禁用跳过。标签过多时显示滚动按钮，选中标签自动进入可见区。

默认、悬停、当前项、禁用和键盘焦点均读取 `--bds-*` / 语义 Token。菜单浮层使用 ScopedPopover，继承当前公共或项目主题。此修改只更新当前组件源码，不改写已冻结的发布资产。

本次没有照搬 Arco 的独立深色主题开关或悬浮工具球，主题继续由项目统一控制。菜单路由内容、权限计算、远程加载由业务提供。

## 本次验证记录（2026-09-20）

- 浏览器：公共主题 `#315C52`；隔离国科信主题 `#165DFF`，导航选中项、页签与浮层继承一致。
- 浏览器：菜单选择更新内容，弹出菜单选择后关闭并恢复焦点；400px 视口中标签滚动与末项切换正常，页面没有横向溢出。
- 一并修复外层 LocalTabs / PageTabs 的后代选择器污染，以及示例网格最小宽度导致的裁切。
- 最新生产构建、TypeScript 与改动文件 ESLint 通过；设计样式检查未报告问题。
- 首轮相关回归 617 项通过。末次增加了禁用分组后代的回归用例；完整复跑遇到本机依赖文件读取延迟，首轮重跑产生 Vitest 工作线程响应超时，单线程复用重试超过 10 分钟仍停在依赖加载，已停止。没有将未完成的复跑计为通过。
