# AI 使用规则（test-customer-b · v1.0.1）

- 项目：test-customer-b（projectId: proj-mtwbe3v9-zf5v8f）
- 发布版本：1.0.1（schema bds-release/1；整包 checksum 见 manifest.json）
- 资产来源：本发布包内文件；它们来自发布时刻的不可变快照。

## 必须遵守

1. 只使用 manifest.availableComponents 中列出的组件；缺少的组件要报告，不自造替代 API。
2. 使用 DSButton / DSSelect 的稳定语义 API（variant = primary/secondary/tertiary × semantic = default/danger；Select 按契约 props 传参）。
3. 不得直接 import react-aria-components 或任何第三方交互底座（Radix / Floating UI / Headless UI 等）。
4. 不得自行用 div 绘制下拉菜单（焦点 / 键盘 / aria 由 DSSelect 内部保证）。
5. 不得自行生成颜色：颜色 / 背景 / 边框只使用 tokens.css 与 tokens.json 中的 Resolved Token（CSS 变量名与运行时一致）。
6. 不得使用未发布候选：候选库中的未确认观察值不是正式规范。
7. 不得读取工作台 Draft / localStorage：一切以当前发布包为准。
8. 只使用当前 projectId（proj-mtwbe3v9-zf5v8f）与 releaseVersion（1.0.1）的资产；切换项目 / 版本必须显式加载对应发布包。
9. 不得用内联样式绕过 Token 与 Recipe。
10. Region Appearance 通过 tokens.css 的 --bds-bg-page / --bds-bg-surface / --bds-bg-surface-alt 等变量生效，不要在业务代码硬编码表面色。
11. 不得出现孤立的原生 input / table 元素：输入与选择类控件必须使用 DSSelect（DSButton 承担操作按钮），缺少对应组件时报告需求，不得用原生 input / table 拼装替代。

## 当前可用组件

- DSButton（按钮 Button，id: button）
- DSSelect（下拉选择 Select，id: select）

## 明确缺失（不可使用）

- Icon Pack：未接入 —— manifest 中为 null，不提供图标资产
- Figma Library：尚未生成 —— 标记为 pending，不随发布输出
