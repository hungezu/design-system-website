# React Aria 第二批浏览器复验

日期：2026-09-28

> 本文件保留第二批完成时的 69 项快照；当前全量结果见 [第三批验收](./phase-three-2026-09-28.md)。

## 环境

- 入口：`http://127.0.0.1:5183/#/projects/guokexin/components?version=draft`
- 模式：`VITE_STATIC_DEMO=true`，仅使用本地静态项目数据，不修改工作区账号或 SQLite 数据。
- 普通认证服务仍保持在 `5173 / 5174`。

## 目录与项目范围

- `.component-card-preview[data-component-id]`：69 项。
- 唯一组件 ID：69 项。
- 第二批 23 项缺失：0。
- 页面不包含 `47 / 54` 或 React Aria 覆盖统计区块。

## 真实 DOM 交互

- ToggleButton：点击前 `aria-pressed="false"`，点击后为 `true`；页内存在 1 个真实 disabled 样本。
- Slider：键盘 `ArrowRight` 将实时样本值从 40 改为 41；禁用样本为原生 `disabled` 且值保持 40。
- ColorPicker：蓝、绿、红样本分别解析为 `rgb(22, 93, 255)`、`rgb(0, 135, 90)`、`rgb(198, 40, 53)`；禁用组合内颜色区域、滑块和 4 个输入都不可操作。
- ColorSwatchPicker：禁用组共 3 个色块项，均具有 `aria-disabled="true"`。
- Breadcrumb：示例末项为无 `href` 的 `SPAN[aria-current="page"]`。
- Disclosure：点击前 `aria-expanded="false"`，点击后为 `true`，内容「这是说明内容。」进入可访问树。
- Link：禁用样本为 `SPAN[role="link"][aria-disabled="true"]`，不会产生导航。
- Button：项目主按钮实测背景为 `rgb(22, 93, 255)`（`#165DFF`），文字为 `rgb(255, 255, 255)`。

## 运行结果

- 浏览器控制台 error：0。
- 不修改历史冻结版本，不发布新版本。
