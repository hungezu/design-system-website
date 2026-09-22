---
name: "设计规范管理平台"
description: "分离公共资源与项目主题的 B 端设计资产平台"
scope: "management-platform-only"
colors:
  brand-primary: "#315C52"
  brand-secondary: "#E7EFEC"
  text-primary: "#1D2129"
  text-secondary: "#4E5969"
  text-tertiary: "#6B7785"
  field-placeholder: "#6B7785"
  text-on-brand: "#FFFFFF"
  surface-page: "#F2F3F5"
  surface-card: "#FFFFFF"
  surface-subtle: "#F7F8FA"
  surface-highlight: "#FFF1A8"
  surface-inverse: "#1D2129"
  overlay-mask: "rgba(29, 33, 41, 0.46)"
  border-default: "#E5E6EB"
  border-strong: "#C9CDD4"
  status-success: "#00B42A"
  status-warning: "#FF7D00"
  status-error: "#F53F3F"
  status-error-strong: "#C62835"
  status-info: "#315C52"
  status-success-text: "#0A7D34"
  status-warning-text: "#8A4B00"
  status-error-text: "#C62835"
typography:
  display:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "clamp(28px, 2.5vw, 36px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  page-title:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "28px"
    letterSpacing: "normal"
  section-title:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
    letterSpacing: "normal"
  body:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "normal"
  secondary:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
  table-head:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "22px"
    letterSpacing: "normal"
  table-body:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "normal"
  label:
    fontFamily: "Noto Sans SC Variable, PingFang SC, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "normal"
  code:
    fontFamily: "ui-monospace, SFMono-Regular, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "2px"
  control: "4px"
  container: "6px"
  dialog: "8px"
  circular: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  compact: "12px"
  md: "16px"
  lg: "24px"
  control-sm: "28px"
  control-md: "32px"
  control-lg: "40px"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "{colors.text-on-brand}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "32px"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "32px"
  input-default:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "32px"
  table-header:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text-primary}"
    typography: "{typography.table-head}"
    height: "42px"
  table-row:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.table-body}"
    height: "48px"
  status-tag:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 7px"
---

# Design System: 设计规范管理平台

> **适用范围：管理平台网站本身。** 此文档包含平台外壳、公共基线和项目预览三个作用域，不能作为某个项目业务页面的交付规范。交给外部 AI 或开发实现项目页面时，使用对应版本组件包内的 `DESIGN.md`，或从版本页下载“AI 设计规范”，并同时提供匹配组件包。两份文档不能混用。

> 机器可读的权威配置为根目录 `system.manifest.json`；本文档是设计师可读的同步说明，不得单独改写品牌值、Icon 来源或发布策略。

## Overview

**Creative North Star: "公共基线清晰、项目主题可控的资源工作台"**

平台外壳保持中性、稳定；公共资源使用通用基线，项目空间才应用对应项目的品牌与主题。浅灰工作区、白色内容面和紧凑表格共同形成专业 B 端工具语言；结构和业务规则优先于装饰。

首页服务三项高频任务：查找组件、查找页面方案、进入项目。完整来源链放入开发详情；公共资源与项目资源共享实现但不共享默认视觉状态。

**Key Characteristics:**

- 全站使用统一顶部导航；组件目录与页内目录只作为局部导航。
- 平台外壳使用中性色，国科信蓝只作用于国科信项目预览。
- 语义 Token 按品牌、文字、背景、边框、状态、字体、间距、控件尺寸、圆角和阴影分组。
- Button 与 Table 提供可操作的专业详情，展示变体、状态、规则与变量来源。
- 12 个结构化 Pattern 描述组件组合、任务步骤、必要状态与使用规则。
- Audit 执行已实现的本地确定性规则；不得把规则检查描述为 AI 推理、视觉验收或完整业务检查。

## Design Principles

本系统吸收 HeroUI v3 的原则，并结合设计资产、设计模式和规范检查工作流形成以下约束：

1. **语义优先**：DSButton 的 `variant` 使用 `primary / secondary / tertiary`，危险意图单独使用 `semantic="danger"`；不得把 `danger` 作为 variant。视觉表现由 Token 决定。
2. **无障碍默认**：键盘操作、焦点态、ARIA、禁用态和错误态属于组件基础能力。
3. **组合式构建**：复杂组件拆成可组合区域；业务 Pattern 提供经过验证的组合模板。
4. **渐进式披露**：默认只呈现完成当前任务所需的信息，高级配置和规则详情按需展开。
5. **行为可预测**：尺寸、状态、反馈、命名和交互顺序在组件之间保持一致。
6. **类型安全**：Token、组件属性、Pattern 和规则数据均使用 TypeScript 类型约束。
7. **样式与逻辑分离**：交互逻辑、语义数据和视觉 Token 分层维护，支持主题与端的延展。
8. **受控定制**：优先通过 Token 和 slot 定制，局部 CSS 覆盖必须不破坏系统层级与状态规则。
9. **设计与代码同源**：设计资源、组件示例、规则检查和实现共享同一组语义 Token 与组件契约。
10. **开放可扩展**：允许通过组合和包装扩展业务能力，不绑定单一组件库或单一视觉风格。

## Colors

平台色板以中性灰白承载高密度内容；项目色板在项目预览边界内建立操作层级，并以独立状态色表达结果。

### Public Baseline

- **基线主色** (`brand-primary`, `#315C52`)：公共组件示例中的主操作、链接、焦点和选中状态。
- **基线浅色** (`brand-secondary`, `#E7EFEC`)：公共组件示例中的弱强调背景。
- 项目品牌色不改写公共基线，只在项目预览作用域内覆盖。

### Guokexin Project Source of Truth

- **国科信品牌主色** (`brand-primary`, `#165DFF`) 是项目源码唯一权威值。
- 交互色基准为 Hover `#4080FF`、Active `#0E42D2`、弱品牌背景 `#E8F3FF`；统一由 `src/instances/guokexin/theme.ts` 导出，其他源码不得复制第二份国科信品牌常量。`#4080FF` 只用于边框、链接等无白色小字的 Hover；品牌实心按钮 Hover 使用 `#0E42D2`，Pressed 在此基础上继续加深。
- 工作台外壳的黑白灰 App UI Token 不属于国科信项目品牌色，不得用于项目组件、页面模板或发布包。
- 已冻结历史发布包保持不可变；如其颜色与当前源码不一致，只能通过新版本发布收口，不得回写历史版本。

### Secondary

- **成功绿** (`status-success`)：通过、正常和成功状态。
- **警告橙** (`status-warning`)：需要关注但可以继续的状态。
- **错误红** (`status-error`)：错误与阻断反馈。
- **危险红** (`status-error-strong`)：删除等危险操作的实色背景。
- **信息蓝** (`status-info`)：说明、处理中和中性反馈。
- **状态文字** (`status-success-text` / `status-warning-text` / `status-error-text`)：用于浅色表面上的小字号状态文案；状态基础色继续用于图标、描边和背景，不直接替代正文色。

### Neutral

- **主要文字** (`text-primary`)：标题、正文和关键数据。
- **次要文字** (`text-secondary`)：解释、辅助内容和表格次级信息。
- **三级文字** (`text-tertiary`)：元信息、占位内容与索引。
- **字段占位文字** (`field-placeholder`)：Input、Select 与 ComboBox 的未输入 / 未选择提示，不得继承正文颜色。
- **品牌色上文字** (`text-on-brand`)：品牌色或危险色实底上的文字与图标。
- **页面灰** (`surface-page`)：应用工作区底层画布。
- **内容白** (`surface-card`)：卡片、表格、表单与详情内容面。
- **分组灰** (`surface-subtle`)：表头、筛选分组、悬停和低强调区域。
- **检索高亮** (`surface-highlight`)：搜索命中文字的定位背景，禁止在页面 CSS 中重复硬编码。
- **反色墨黑** (`surface-inverse`)：代码等高对比局部表面。
- **模态遮罩** (`overlay-mask`)：仅用于 Dialog 与 Drawer 背后的上下文压暗。
- **默认边框** (`border-default`) 与 **强调边框** (`border-strong`)：分别用于常规分隔和悬停、强边界。

### Named Rules

**The Resolved Token Rule.** 公共资源消费全局语义基线；项目资源依次解析全局、平台、项目和组件覆盖。完整来源链在开发详情中按需展开。

**The Neutral Shell Rule.** 网站外壳使用黑白灰中性色；项目品牌色只保留在项目组件、页面模板和主题预览内，不污染公共导航或其他项目。

**The App Token Namespace Rule.** 工作台外壳的原始值只能在 `src/styles/app-tokens.css` 以 `--app-*` 命名；兼容映射可以指向语义 Token，但不得把 App 黑白灰常量复制到项目组件或预览样式中。

平台页面与登录页由 `AppThemeScope` 从 App UI Token 一次解析完整的语义值、组件配方和 Runtime 别名，并通过 `PreviewScope` 传入下拉和弹窗。不得只改 `--brand-primary` 而继续继承旧配方；公共和项目预览须用完整的自身变量覆盖。按钮的默认、悬停、按下、禁用状态统一由自研 Button 配方决定，不受旧 Runtime 同名类覆盖。

**The Hardcoded Color Boundary.** 产品页与设计系统 Primitive 不得直接声明颜色常量；颜色值只能存在 Token 源、App UI Token、明确的主题模式预设或颜色选择演示数据中。Runtime CSS 可保留后备值，但必须优先解析语义变量。

**The State Redundancy Rule.** 成功、警告和错误必须同时使用文字或图标表达，不能只依赖颜色。

## Typography

**Display Font:** Noto Sans SC Variable（回退到 PingFang SC 和 `sans-serif`）  
**Body Font:** Noto Sans SC Variable（回退到 PingFang SC 和 `sans-serif`）  
**Label/Mono Font:** `ui-monospace, SFMono-Regular, monospace`

**Character:** 中文无衬线字体承担所有内容和控件，通过明确字号、字重和行高形成紧凑、可扫读的工具层级；等宽字体只用于变量、资源 ID、序号和测量值。

### Hierarchy

- **Display**（`700`, `clamp(28px, 2.5vw, 36px)`, `1.2`）：首页与高层级页面的主标题。
- **文档页标题**（`650`, `28px / 36px`）：组件、模式与资源详情标题。
- **文档章节标题**（`700`, `20px / 28px`）：文档内主要内容分区。
- **Page Title**（`600`, `20px / 28px`）：语义 Token 中的标准页面标题。
- **Section Title**（`600`, `16px / 24px`）：模块标题和内容分组标题。
- **Body**（`400`, `14px / 22px`）：正文、说明和表格数据。
- **Secondary**（`400`, `12px / 20px`）：辅助说明与元信息。
- **Label**（`500`, `12px / 20px`）：按钮、字段、标签与状态。
- **Code**（`400`, `11px`, `1.6`）：变量名、ID、序号和技术值。

### Named Rules

**The Tool Density Rule.** 大字只用于页面身份；任务区、控件和表格以 `12–14px` 为主并保持清晰行高。

**The Technical Label Rule.** 等宽字体服务于可复制、可比对的技术值，不用于长段中文内容。

## Layout

桌面端使用两级顶部结构：公共一级导航高 `64px`；进入项目后显示项目导航与项目、平台、版本上下文栏。页面内容最大宽度为 `1180px`；组件文档使用左侧组件目录、中央正文和右侧页内目录，宽表格仅在自身容器内滚动。

公共一级导航固定为：概览、设计基础、组件、交互模式、页面模板、项目。快速开始与公告位于账号菜单。项目内导航为：概览、设计规范、组件、交互模式、页面模板、版本记录；成员与权限仅向管理员开放，设计检查作为项目操作入口。

间距基线为 `4 / 8 / 12 / 16 / 24px`；业务控件以 `32px` 为标准高度，表格内紧凑操作为 `28px`，重点流程允许 `40px`。响应式断点按现有实现工作：

- 宽屏检查覆盖 `1280 / 1440 / 1920px`。窄屏按现有 CSS 规则收敛导航、目录和主题编辑布局，表格在自身容器滚动；不得以“只支持桌面”为由保留遮挡或挤压。断点以实际实现为准。

**The Stable Frame Rule.** 全站保持同一顶部外壳；项目上下文只在项目空间出现，公共资源页不继承项目主题。

**The Version Context Rule.** 项目内的概览快捷入口、搜索结果、关联资源和返回链接必须同时保留 `projectId + version`；历史版本不得在无提示的情况下回落到草稿。

**The Release Readiness Rule.** “规范数据已冻结”与“可执行组件包已就绪”必须分开呈现。发布前显示 Runtime 预检结果，交付后记录真实业务应用的验收和回退状态。

**The Task Order Rule.** 复杂列表按“筛选 → 操作 → 表格 → 分页”组织；详情先说明对象与来源，再展示可操作示例和规则。

## Elevation & Depth

系统默认以中性表面、`1px` 边框和内容密度建立层级。阴影只用于浮层、Dialog、卡片悬停、搜索主入口和分段选择等确有层级变化的状态。

### Shadow Vocabulary

- **基础层级** (`shadow-base`): 轻量浮起和悬停反馈。
- **浮层** (`shadow-overlay`): 下拉、Popover、Drawer 与 Table 更多菜单。
- **弹窗** (`shadow-dialog`): 需要阻断焦点的 Dialog。
- **搜索入口** (`0 10px 26px rgba(20, 27, 24, .06)`): 资源搜索的静态主入口。
- **卡片悬停** (`0 9px 24px rgba(20, 27, 24, .06)`): 可点击资源卡片悬停反馈。

### Named Rules

**The Flat-by-Default Rule.** 静止容器优先依靠表面色和边框分组，阴影只说明真实层级或交互反馈。

## Shapes

形态语言是紧凑的轻圆角矩形。标准 Button、Input、Select 与 DatePicker 使用 `4px` 圆角；Card、Table 容器和 Drawer 内容使用 `6px`；Dialog 使用 `8px`；小标签使用 `2px`。状态点与流程节点使用正圆。

**The Four-Pixel Control Rule.** 业务控件以 `32px` 高、`4px` 圆角为默认组合，只有紧凑表格操作或重点流程才切换到已定义的 `28px` / `40px` 尺寸。

## Motion

动效用于说明状态变化、空间关系和操作结果，不承担页面装饰。公共组件与项目组件共享同一套 Motion Token；项目主题不得改变交互含义，只能在规范允许范围内调整节奏。

- **即时反馈**：`motion-duration-fast = 120ms`，用于 Button、Input、Select、Checkbox 等 Hover、Pressed 与 Focus 状态。
- **标准过渡**：`motion-duration-standard = 180ms`，用于 Tooltip、Popover、下拉菜单与局部内容切换。
- **浮层进入**：`motion-duration-overlay = 240ms`，用于 Dialog、Drawer 与 Toast。
- **退出**：`motion-duration-exit = 150ms`，退出短于进入，避免反馈显得迟滞。
- **标准缓动**：`motion-ease-standard = cubic-bezier(0.2, 0, 0, 1)`。
- **强调缓动**：`motion-ease-emphasized = cubic-bezier(0.16, 1, 0.3, 1)`，仅用于空间位移和高层浮层。
- **位移**：轻量浮层使用 `4px`，Dialog 使用 `12px`，Drawer 只沿其出现方向移动。
- **降级**：`prefers-reduced-motion: reduce` 下取消位移与过渡，保留最终状态和必要加载提示。

**The Motion Meaning Rule.** 删除任一动效后如果不影响状态理解、层级关系或操作反馈，则该动效不应存在。

## Components

### Buttons

- **Shape:** 标准高度 `32px`、圆角 `4px`，水平内边距 `16px`；小 / 中 / 大为 `28 / 32 / 40px`。
- **Variants:** 主按钮、次按钮、文字按钮、危险按钮均已实现并可在详情页切换。
- **States:** Default、Hover、Active、Disabled、Loading 均有可操作预览；Loading 保留尺寸并阻止重复提交，Disabled 显示不可用原因。
- **Rules:** 同一区域原则上只保留一个主按钮；文案使用明确动词；不可逆危险操作需要确认。
- **Icon actions:** Dialog、Drawer、Alert、Toast、Tag 等紧凑容器的关闭 / 移除动作统一使用 `DSIconAction` 与语义图标，保留可访问名称，不显示“关闭 / 移除”文字占位。
- **Single implementation:** `Button` 是唯一 React Aria 实现；`DSButton` 只是稳定的 Runtime API 适配层，不得再维护第二份视觉实现。

### Table

- **Structure:** 筛选区、批量操作条、固定表头、数据行、状态列、右侧操作列和分页。
- **Density:** 工具栏控件高 `32px`，表头高 `42px`，数据行高 `48px`。
- **Behavior:** 支持搜索、状态筛选、排序、行选择、批量操作、更多菜单、分页、Loading 和空状态。
- **Rules:** 高频操作直接显示，低频操作进入更多菜单；宽表格只在自身容器内滚动；状态读取语义 Token。
- **Action color:** 表格内普通行操作使用品牌文字色和弱品牌悬停底色，危险操作使用 `status-error-text`；不得继承正文黑色，也不把多项行操作全部做成实心主按钮。

### Table Placement and Selection

Table composition follows the useful parts of HeroUI v3 Table: a shared surface encloses the independently scrolling table and a footer outside that scroll area. Use DSTable footer to compose DSPagination; total count is inset 8px and pagination controls default to 28px. Standard tables retain the gray outer surface and white body; secondary is for an existing card or panel.

For grouped headers, use recursive column children. Parent cells span their leaf columns and center their labels; leaves span the remaining header rows. Body cells follow only the leaf order and associate all ancestor headers. Leaf widths govern the whole column. Sorting belongs only to leaf headers. Keep fixed columns contiguous at the two edges, never divide a group across fixed/scrolling regions. Sticky vertical headers move as a complete header block. Selection, loading and empty states preserve the grouping structure.

Keep the accepted table appearance: gray outer surface and white content. Use `radius-table` for the outer radius (default 6px); derive the content radius as `max(0px, radius-table - 2px)`. Project shape settings expose this independently from `radius-control`; freeze it in tokens and generated DESIGN.md.

Component previews, management examples, templates and new delivery packages must use the shared Runtime table, selection controls and pagination. Keep table geometry in the shared primitive; page CSS may position its container, but must not repaint table headers/rows or recreate native checkboxes/pagination.

表格页面的空间与状态合同见 `src/data/patterns/table-layout.ts`，并写入新发布的 `patterns.json.tableLayout` 与项目 DESIGN.md：

- 筛选 → 普通工具栏 → 批量操作条 → 表格 → 分页 → 反馈，左右边界保持一致。
- 新增等普通操作位于表格上方左侧，按重要性、使用频率从左到右排列。选中数量、批量动作和取消选择使用独立批量条，仅在选中后出现；批量条使用中性浅灰 surface-secondary，不使用品牌色背景。
- 全选位于表头最左列，与行选择框中心一致；默认 16px 框体、12px 勾选视口。半选表示当前页部分选中，短横居中；不允许用固定 top/left 偏移拼出偏心勾。
- 复选框无障碍名称明确为“全选当前页”，不常驻显示范围说明文字，不包含其他页。翻页保留同一筛选内的选择并展示其他页数量；筛选变化清空选择。选择全部筛选结果必须使用独立且带数量的入口。
- 分页左侧只显示总条数，不重复显示“当前页 / 总页数”；右侧页码与表格右边缘对齐。
- 行内文字按钮无外边距、左右内边距和左右透明边框，文字起点与操作表头对齐；按钮之间用容器 gap 保持间距。
- 操作列按实际内容收紧并统一表头与数据行宽度，末个按钮后仅保留 16px。仅实际横向溢出时，固定操作列使用 shadow-table-fixed 阴影区分层级；没有横向滚动时不显示。窗口或内容变化后重新判断，固定列高于滚动内容且背景不透明。
- 分页在表格下方：总数左对齐，页码与每页条数右对齐到表格可视容器边缘，间距使用 `spacing-16`。无数据隐藏分页；加载和执行批量操作时禁用选择与分页。
- 只读或没有批量任务时不显示选择列。行操作位于最后一列；其点击不得同时改变行选择。
- 窄屏表格内部滚动，选择列固定左侧、操作列固定右侧；分页可换行但操作仍靠右。表单末端取消在左、保存在右，两者整体右对齐。

### Token Explorer

“设计基础”按颜色、文字、背景、边框、状态、字体、间距、控件尺寸、圆角、阴影和图标分组，只定义跨组件共用的视觉原子与默认基线。“组件”承载可交互控件的用法、变体、状态、API 和组件专属变量。项目设计规范则显示基础值经平台和项目覆盖后的最终结果。

公共与项目基础页只保留“设计变量 / 图标”分类，默认完整展示变量，不设“全部”混排页或无效排序。基础变量由目录数据自动分组，包含动效，不通过固定分组列表隐藏变量。基础色阶沿用历史记录的 tvision-color 1.6.0 HCT 引擎：品牌及成功、警告、错误、信息色各 10 阶，中性色和品牌倾向灰各 14 阶。色阶进入真实 Token 源、CSS、项目解析与后续冻结导出，不强行改变已有语义状态色。

变量列表直接呈现名称、ID、当前值、用途、项目来源和可展开的组件引用，并提供复制；普通变量不再另开重复内页，旧链接定位到列表锚点。图标保留线性/面性详情。历史页读取该版本真实色盘与图标集；旧色盘只保存值、没有对应 CSS 声明时，复制色值而不是虚构变量。清除搜索保留当前分类、项目与版本。

### Public Icons

公共图标通过 Icon Registry 调用 Reicon 底座。Runtime Icon Registry 是图标状态、映射和可调用性的唯一权威来源；138 条资源目录是其中面向设计师的分类投影，项目 Icon Pack 是语义 ID 子集，冻结 `icons.json` 是发布快照，三者不再各自维护状态。资源库按操作、导航、数据、筛选、文件、用户与权限、状态、时间、编辑、媒体、系统和布局分组；默认尺寸为 `16px`，颜色继承 `currentColor`，线性 / 面性及描边由 Icon Profile 统一控制。

- 日期、展开、搜索、清空、状态、翻页、关闭等具有明确功能语义的图标，必须通过 `DSIcon` 或 `DSIconAction` 使用 Registry 的稳定语义 ID；生产组件不得直接引用另一套图标组件绕过 Registry。
- `DesignSystemProvider` 向 `DSIcon` 注入项目 Icon Profile，统一控制线性 / 面性、描边、尺寸和允许使用的项目 Icon Pack；公共组件使用平台默认 Profile。
- `DSIcon` 对内置图标和自定义图标都必须执行 `allowedIconIds`；不在 Pack 中的 ID 统一渲染 missing 占位并输出诊断。
- 复选框勾选、单选框圆点和开关滑块等控件内部状态标记由对应 Primitive 自身绘制，不作为独立业务图标进入 Registry。
- 成对出现的加减、前后翻页等操作图标必须使用同一 Reicon 家族，并保持相同尺寸、Weight 和 Stroke Width，禁止一侧使用 Registry、另一侧临时绘制。
- Registry 缺少所需语义时必须先新增、审核并发布对应 ID；不得用含义相近但错误的图标代替。

### Navigation

一级导航位于顶部。项目空间使用第二行项目导航；组件页的左侧目录和右侧锚点只承担文档内导航。Tab 只用于同一对象内的同级内容，标签按内容宽度排列。

### Patterns

当前实现包含 12 个结构化 Pattern。列表项展示序号、Lucide 图标、说明和标签；详情页展示组成组件、交互步骤、必要状态、使用场景、注意事项和组合规则。

### Audit Findings

设计检查执行当前已实现的本地确定性规则，结果附规则与位置；只对已覆盖范围作出结论。不得把本地规则结果表述成 AI 推理、截图检查或完整业务验收。

### Inheritance Trace

完整解析链为 `Global → Platform → Project → Component`，默认收纳在开发详情。普通用户优先看到最终效果，项目管理员可查看来源与治理字段。

### Project Theme

“主题与风格”使用左侧配置、右侧实时预览。基础设置包括品牌主色、风格预设和信息密度；颜色、字体、字号、圆角、阴影、间距和控件尺寸放入可展开的详细设置。编辑态与保存态分离，保存范围明确为服务器上的当前项目；冲突或失败保留本次编辑。历史发布版本只读。

### Account and Project Access

平台管理放在账号菜单；项目成员管理放在项目导航。职业身份与权限独立展示。平台用户使用账号状态和平台权限，项目成员使用查看者、编辑者、项目管理员三档角色；不要把产品经理或开发身份直接等同于权限。

成员角色修改需显式保存。邀请链接生成后明确说明有效期、收件邮箱与“未自动发送”，提供复制和撤销。成员权限作用于整个项目，不随冻结版本切换。加载、无成员、无搜索结果、无权限及操作失败均提供明确反馈。服务端权限校验是唯一可信的授权边界。

品牌主色是色彩配置的默认入口；弱调、Hover 和 Pressed 色阶由主色自动生成。中性色和状态色默认使用稳定语义基线，只在“高级色值覆盖”中允许逐项调整。配置分组与预览范围使用页内本地状态即时切换，不触发路由导航或整页重新渲染。

### Page Templates

公共页面模板默认使用通用基线；项目页面模板复用同一结构并应用项目主题。查询列表提供基础列表、多条件查询和批量管理三种方案，搜索、排序、分页和方案选择写入 URL。模板先展示完整可操作页面，再按需展开使用说明和代码。

### Component Scope

公共组件页始终使用固定通用基线，不在组件示例中单独修改主色或圆角；项目视觉统一由“主题与风格”管理。“当前草稿”只展示项目 `componentIds` 且读取当前项目 Token；具体版本只展示 `manifest.availableComponents` 且同时从该版本的 `tokens.css / components.json / icons.json` 读取预览、API 与状态。项目组件不复制公共组件源码。

项目组件详情必须提供可点击的状态检视，至少覆盖组件已声明的 Default、Hover、Focus、Active / Selected、Disabled、Loading 与 Error 等适用状态，并同时展示背景、文字、边框、焦点色对应的 Token、解析值和来源层级。项目内详情导航必须保留当前版本上下文。

## Do's and Don'ts

### Do:

- **Do** 清晰区分公共资源与项目空间，并在项目路由中显式携带项目和版本。
- **Do** 通过语义 Token 和解析来源实现颜色、密度、圆角与组件表现，不在页面组件内硬编码另一套规则。
- **Do** 通过 Icon Registry 的稳定语义 ID 调用 Reicon 底座，并让图标随 `currentColor` 响应状态。
- **Do** 以 `32px` 高、`4px` 圆角作为标准业务控件基线。
- **Do** 将 Button、Table、Pattern 和 Audit 的状态、规则和来源完整呈现。
- **Do** 为键盘焦点保留清晰轮廓，并尊重 `prefers-reduced-motion`。

### Don't:

- **Don't** 让公共资源读取上次选择的项目主题或发布版本。
- **Don't** 添加没有对应路由、数据和交互闭环的入口。
- **Don't** 使用装饰性渐变、紫色发光、玻璃拟态或无意义的大面积品牌色。
- **Don't** 用阴影代替结构，也不要让所有静止卡片默认浮起。
- **Don't** 把单个组件当作 Pattern；Pattern 必须包含任务步骤、必要状态和组合规则。
- **Don't** 把本地 Audit Demo 描述为真实上传、解析或自动检查结果。

Brand-filled primary buttons use white text in their default, hover and pressed states. Preserve the chosen brand token; if needed, darken only the filled-button background recipe to meet 4.5:1 contrast with white. The project font family remains independent of this color choice. Frozen releases retain their captured recipes.

### AI Interaction Components

The AI group is an independent implementation adapted from the public HeroUI Pro AI references. Retain the existing React Aria/Runtime base and Icon Registry. Neutral assistant content, compact user bubbles, lightweight citations and tool disclosures use the `ai-*` purpose tokens plus shared semantic tokens.

AI controls receive data and callbacks from the host. They do not contact a model, execute tools, upload attachments, or fabricate completion. Display task events and public summaries in the process timeline. Prompt input blocks empty submissions and duplicate requests, preserves failed text/files, respects IME composition, and switches to an explicit stop control during generation. Suggestions populate the draft instead of submitting silently.

Only follow the conversation bottom when the reader is already near it. Keep previous messages stable during streaming and offer a jump-to-latest button. Markdown skips raw HTML and unsafe URL schemes; code is never executed; clipboard success follows actual success. Revoke local preview URLs. Reduce motion when requested. Freeze these rules and approved AI APIs in each new project delivery, without rewriting old releases.

### AI Design Markdown Return Flow

项目版本页提供“导入 AI 修改稿”，用于将项目交付 `DESIGN.md` 中经 AI 修改的可控主题参数回流到当前草稿。导入是一个受控的修改审核流程，不是文档覆盖或代码执行入口。

- 来源阶段在同一 Dialog 内提供单个 Markdown 文件上传和文本粘贴，内容上限为 `200 KB`；内容只作为文本解析，不执行 HTML 或代码。只接受 `design-workspace/design-md-1` 与 `project-consumption` 作用域，项目短 ID 和发布 ID 必须同时匹配，文档标注的冻结版本也必须可读；管理平台根 `DESIGN.md` 及其他项目文档必须阻断。
- 差异以文档标注的冻结版本为 base，三方比较 base、AI 修改稿和当前草稿。AI 未改的旧值不得回退新草稿。无阻断项时默认只选中“可直接应用”；当前草稿与 AI 同时修改同一字段时列为“需逐项确认”且默认不选中；存在任一阻断冲突时不得应用。
- 可写入变更只覆盖能安全映射到 `ProjectThemeSettings` 且通过值校验的白名单 Token。品牌主色变更若未显式携带对应派生色，使用现有色阶规则生成辅助色、Hover 与 Active 的独立候选项。组件清单、Pattern、布局正文和代码片段不参与写入；发生变化的未支持 Token 进入“仅供参考”，不猜测反向映射。
- 审核阶段先展示来源文档、项目、版本和写入目标，再以带文字的状态标签汇总“可直接应用 / 需逐项确认 / 仅供参考 / 阻断冲突”。每项变更同时显示复选框、变更前后值和原因，不只靠颜色表达。
- 选中变更后，使用 `PreviewScope` 和真实 DS 控件展示候选主题；该预览不参与交互且不进入辅助技术语义树。Dialog、标签、复选框、输入与预览继续使用平台 DS 组件和语义 Token；在 `640px` 及以下，身份信息、差异行和预览控件改为单列或满宽布局。
- 写入沿用草稿 revision 乐观锁与服务端完整主题校验。编辑者可应用，查看者只读，发布仍仅限项目管理员。写入期间不允许关闭 Dialog；revision 冲突时保留导入内容和选择供重新解析。成功只表示已写入当前草稿，不表示已发布或已完成业务验收。
