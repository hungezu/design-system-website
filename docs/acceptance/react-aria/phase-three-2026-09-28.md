# React Aria 第三批全量补齐验收

日期：2026-09-28

## 准入范围

`TokenField`、`GridList`、`ColorWheel`、`NavigationTree`、`PreviewTrigger`、`Group`、`Virtualizer`。

本批同时加入公共组件目录和国科信当前草稿；不改写 v1.5.6、v1.5.7 等历史冻结快照，不发布新版本。

## 闭环结果

- React Aria 公共覆盖：54 / 54。
- React Aria 国科信项目覆盖：54 / 54，待适配 0。
- 国科信草稿：76 个批准组件（62 个通用组件 + 14 个 AI 组件）。
- Runtime Registry：77 项，比项目草稿多一个内部 `icon`。
- 公共目录 / Binding：109 项。
- Runtime `DS*` API：110 项。
- 核心 Story 与验收映射：62 项，无 `undefined` 回归路径。

## 实现要点

- TokenField 以 `TokenFieldValue` 保留结构化 Token 和可编辑文本；Token 创建策略由业务层控制，不虚构逗号分词行为。
- GridList 具备行选择、禁用项、行操作、空数据和 stack / grid 布局。
- ColorWheel 显示可读色值与色块，并支持键盘调整和禁用态。
- NavigationTree 保留层级导航、当前路由、祖先标记和禁用链接；React Aria Link 已接入应用 RouterProvider。
- PreviewTrigger 使用带主题继承的 ScopedPopover，覆盖延时、禁用和可交互内容。
- Group 明确为语义分组，禁用与只读不会暗中改写任意子控件。
- Virtualizer 与 GridList 组合，固定行高、估算行高和真实 DOM 高度保持一致。

## 自动化验证

- `npm run validate:design-system`：通过，76 个项目组件的 Asset、Binding 与 Registry 对齐。
- `npm run validate:coverage`：通过，公共与项目覆盖均为 54 / 54。
- `npm run typecheck` 与 `npm run typecheck:server`：通过。
- 第三批、项目范围、覆盖和 Runtime 导出：5 个测试文件、15 项断言通过。
- RuntimeExample 全目录与全变体：655 项断言通过。
- 工作区迁移与项目交付：25 项 Node 测试通过。
- Vite 生产构建：通过，6582 个模块完成转换。
- Storybook 生产构建：通过，7 个新 Story 全部进入产物。

## 浏览器验收

通过无登录静态模式验证，不读写工作区账号或项目数据：

- 项目目录共 76 项，唯一 ID 76 项，第三批 7 项无缺失。
- 页面未显示 React Aria 覆盖统计。
- TokenField：初始 Token 正常，文本输入追加在 Token 之后，禁用和只读态存在。
- GridList：行选择后 `aria-selected="true"`，grid 变体生效，行操作返回「查看 设计」，禁用行不可操作。
- ColorWheel：键盘方向键将可读色值从 `hsl(216, 100%, 54%)` 更新为 `#146EFF`，禁用样本的输入为 disabled。
- NavigationTree：当前路由与祖先节点可识别，禁用链接为 `aria-disabled="true"`，路由后保留 `version=draft`。
- PreviewTrigger：可交互预览可打开，内部操作返回「已查看品牌色详情」，禁用触发器不可用。
- Group：默认 `group`、`region`、disabled 与 invalid 状态均可见；禁用示例同步禁用子按钮。
- Virtualizer：120 和 1000 条数据只渲染 7–8 个可见行，`aria-rowcount` 保留全量；键盘 Space 可选中行，固定 / 估算行高与布局变量一致。
- 控制台 error：0。

## 已知环境限制

- 第一、二批两个大型 jsdom 回归文件仍可在当前 Vitest worker 初始化阶段超时；这两批继续以已留档的真实浏览器交互证据为补充，不将未执行断言记为通过。
