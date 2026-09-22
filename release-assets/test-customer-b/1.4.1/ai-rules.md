# AI 使用规则（test-customer-b · v1.4.1）

- 项目：test-customer-b（projectId: proj-mtwbe3v9-zf5v8f）
- 发布版本：1.4.1（schema bds-release/3；整包 checksum 见 manifest.json）
- 资产来源：本发布包内文件；它们来自发布时刻的不可变快照。

## 必须遵守

1. 只使用 manifest.availableComponents 中列出的组件；缺少的组件要报告，不自造替代 API。
2. 使用 DSButton / DSSelect 的稳定语义 API（variant = primary/secondary/tertiary × semantic = default/danger；Select 按契约 props 传参）。
3. 不得直接 import react-aria-components 或任何第三方交互底座（Radix / Floating UI / Headless UI 等）。
4. 不得自行用 div 绘制下拉菜单（焦点 / 键盘 / aria 由 DSSelect 内部保证）。
5. 不得自行生成颜色：颜色 / 背景 / 边框只使用 tokens.css 与 tokens.json 中的 Resolved Token（CSS 变量名与运行时一致）。
6. 不得使用未发布候选：候选库中的未确认观察值不是正式规范。
7. 不得读取工作台 Draft / localStorage：一切以当前发布包为准。
8. 只使用当前 projectId（proj-mtwbe3v9-zf5v8f）与 releaseVersion（1.4.1）的资产；切换项目 / 版本必须显式加载对应发布包。
9. 不得用内联样式绕过 Token 与 Recipe。
10. Region Appearance 通过 tokens.css 的 --bds-bg-page / --bds-bg-surface / --bds-bg-surface-alt 等变量生效，不要在业务代码硬编码表面色。
11. 不得出现孤立的原生 input / table 元素：输入与选择类控件必须使用 DSSelect（DSButton 承担操作按钮），缺少对应组件时报告需求，不得用原生 input / table 拼装替代。
12. 图标一律使用 DSIcon（name 为 icons.json publishedIcons 中的语义 id；weight 仅 outline / filled，尺寸 xs/sm/md/lg）；禁止直接 import reicon-react；禁止自行绘制 SVG；禁止使用 emoji 或字符（×、↑、↕ 等）代替正式图标。分页边界图标使用 pagination-first / pagination-last（双箭头 AnglesLeft / AnglesRight），单步翻页使用 pagination-previous / pagination-next（单箭头）——不得混用或用字符箭头代替。
13. 缺少所需图标时在生成报告中如实报告（missingIcons），不得临时生成或用占位字符代替；图标为 Reicon 人工绘制资产，AI 只做语义检索与匹配。
14. 页面内容排版必须来自 patterns.json：槽位顺序遵循 slotMapping，间距 / 筛选列数 / 分页对齐 / 分页单行与紧凑收敛等只使用 patternCss 提供的 --bds-pattern-* CSS 变量；禁止在业务页面硬编码 Pattern 管理的尺寸（padding / max-width / gap / 列数）或自写媒体查询（响应式三档由 patternCss 的 tablet / compact 断点决定）。
15. 四层职责分离：系统结构只来自 layout.json，区域表面只来自 Region Appearance Token，组件外观只来自 Recipe，页面排版只来自 patterns.json；修改其中一层不得改写其他层。
16. 业务文字必须使用 tokens.css 的 Typography 语义角色（.bds-typo-* 类或 --bds-typo-* 变量）：筛选字段 Label = formLabel，结果标题 = sectionTitle，结果摘要 = sectionMeta（独立元素，摘要不嵌套在标题内、不继承标题字重）；字号 / 行高 / 字重来自 TDesign 字阶（12/14/16/20/24/28，行高 = 字号 + 8px，字重 400/600），禁止组件或页面自行决定业务文字字号与颜色。
17. 颜色只使用 Semantic / Component Token（--bds-text-primary / secondary / placeholder / disabled、--bds-border-*、--bds-fill-*、--bds-surface-*、--bds-selection-*、--bds-field-* 等）；占位文字用 text.placeholder（黑 40%），真实值用 text.primary（黑 90%），禁用用 text.disabled；禁止 brightness / filter / color-mix 派生颜色，禁止组件内计算颜色，禁止项目 HEX。

## 当前可用组件

- DSButton（按钮 Button，id: button）
- DSSelect（下拉选择 Select，id: select）
- DSInput（文本输入 Input，id: input）
- DSTable（数据表格 Table，id: table）
- DSPagination（分页 Pagination，id: pagination）
- DSDialog（对话框 Dialog，id: dialog）
- DSIcon（图标 Icon（Reicon 底座），id: icon）

## 明确缺失（不可使用）

- Table 高级能力：虚拟滚动 / 树表 / 单元格编辑 / 拖拽列宽 / 服务端请求 —— 未实现，不随 DSTable 发布
- 多行文本 Textarea / Toast：未开发（见组件目录 planned）
- 图标能力边界：仅接入 Reicon 已发布语义图标（icons.json publishedIcons）；图标品牌插画 / 动效图标未实现
- Figma Library：尚未生成 —— 标记为 pending，不随发布输出
