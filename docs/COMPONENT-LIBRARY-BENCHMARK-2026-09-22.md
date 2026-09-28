# 组件库数量、分类与缺口盘点

日期：2026-09-22
当前源码复验：2026-09-28

## 统计口径

- **基础组件库**：当前工程实际使用的 `react-aria-components@1.21.1`。按官方组件文档和本项目产品语义归并为 54 个用户可见组件家族，另将 6 个辅助能力单独治理；这不是 npm 包根导出数。排除子部件、hooks、state 对象和类型工具，分类为了横向比较按本项目语义重分。
- **对标库**：HeroUI React `3.2.6` 官方组件目录，以及 TDesign React `1.18.3` 官方 `site.config.mjs`。保留各自官方分类和组件粒度。
- **自身组件库**：`COMPONENT_CATALOG` 中的公共目录项。
- **项目交付集**：国科信 v1.5.7 冻结快照的 `manifest.availableComponents`，也是前端业务项目的批准使用范围。

各库对复合组件和子部件的拆分粒度不同，数量只用于规模和覆盖分析，不直接代表质量。

## 总览

| 库 | 版本 / 上下文 | 大分类 | 组件项 | 说明 |
|---|---:|---:|---:|---|
| React Aria Components | 1.21.1 | 12（统一归类） | 54 + 6 | 54 个组件家族 + 6 个单独治理的辅助能力 |
| HeroUI React | 3.2.6 | 15 | 72 | 开源 React 组件目录，不含 HeroUI Pro AI 组件 |
| TDesign React | 1.18.3 | 7 | 72 | 官方目录含 1 个 AI Chat 高阶入口 |
| 自身公共组件目录 | 当前源码 | 13 | 109 | 包含 14 个 AI 交互组件 |
| 国科信项目草稿 | 当前源码 | 12 个非空分类 | 76 | 62 个通用组件 + 14 个 AI 组件 |
| 国科信项目交付集 | v1.5.7 | 9 个非空分类 | 34 | 20 个通用组件 + 14 个 AI 组件 |

## “组件数”必须分开显示

| 口径 | 当前数量 | 用途 |
|---|---:|---|
| 公共组件目录 | 109 | 平台可查看、演示和候选的全部组件条目 |
| Runtime `DS*` 导出 | 110 | 共享运行时 API；比目录多一个内部 `DSIconAction` |
| Runtime Registry | 77 | 可发布的组件注册项；比当前国科信草稿多一个内部 `icon` |
| 国科信当前草稿批准清单 | 76 | 未发布；React Aria 54 个基础家族已全部覆盖 |
| 国科信 v1.5.7 批准清单 | 34 | 前端在该项目/版本可使用的业务组件 |
| v1.5.7 旧交付包根 `DS*` 导出 | 103 | 打包时曾整体 `export *` Runtime，与批准数不同 |

v1.5.7 旧交付包还误带了 27 份 `dist/release-assets/**/components.json`，其中旧版清单只有 2–7 项。因此前端曾可能分别统计出 2–7、v1.5.7 批准清单的 34、旧 Registry 的 35、当时公共目录的 102 或旧包根 Runtime 的 103；这些都是历史快照事实，不随当前草稿更新。当前源码已是公共目录 109、Runtime `DS*` 导出 110、Registry 77、草稿批准 76；新项目包根仍必须只暴露新冻结版本的批准项。冻结包的权威项目清单只能读包根 `release.json.componentIds` 或 `snapshot.json.assets["manifest.json"].availableComponents`。

## React Aria Components：54 个组件家族 + 6 个辅助能力

| 统一分类 | 数量 | 组件家族 |
|---|---:|---|
| 按钮 | 3 | Button、ToggleButton、ToggleButtonGroup |
| 表单 | 9 | Checkbox、CheckboxGroup、Form、NumberField、RadioGroup、SearchField、Switch、TextField、TokenField |
| 选择器 | 4 | Autocomplete、ComboBox、Select、Slider |
| 集合与列表 | 5 | GridList、ListBox、Table、TagGroup、Tree |
| 数据展示 | 2 | Meter、ProgressBar |
| 日期与时间 | 6 | Calendar、DateField、DatePicker、DateRangePicker、RangeCalendar、TimeField |
| 颜色 | 7 | ColorArea、ColorField、ColorPicker、ColorSlider、ColorSwatch、ColorSwatchPicker、ColorWheel |
| 导航 | 8 | Breadcrumbs、Disclosure、DisclosureGroup、Link、Menu、NavigationTree、Tabs、Toolbar |
| 浮层与反馈 | 5 | Modal、Popover、PreviewTrigger、Toast、Tooltip |
| 布局 | 3 | Group、Separator、Virtualizer |
| 文件与媒体 | 2 | DropZone、FileTrigger |
| 辅助与基础设施 | 6 | I18nProvider、VisuallyHidden、FocusRing、FocusScope、UNSAFE_PortalProvider、SSRProvider |

## HeroUI React：72 项

| 官方分类 | 数量 | 组件 |
|---|---:|---|
| Buttons | 5 | Button、ButtonGroup、CloseButton、ToggleButton、ToggleButtonGroup |
| Collections | 3 | Dropdown、ListBox、TagGroup |
| Colors | 6 | ColorArea、ColorField、ColorPicker、ColorSlider、ColorSwatch、ColorSwatchPicker |
| Controls | 2 | Slider、Switch |
| Data Display | 3 | Badge、Chip、Table |
| Date and Time | 6 | Calendar、DateField、DatePicker、DateRangePicker、RangeCalendar、TimeField |
| Feedback | 6 | Alert、Meter、ProgressBar、ProgressCircle、Skeleton、Spinner |
| Forms | 16 | Checkbox、CheckboxGroup、Description、ErrorMessage、FieldError、Fieldset、Form、Input、InputGroup、InputOTP、Label、NumberField、RadioGroup、SearchField、TextArea、TextField |
| Layout | 4 | Card、Separator、Surface、Toolbar |
| Media | 2 | Avatar、AvatarGroup |
| Navigation | 7 | Accordion、Breadcrumbs、Disclosure、DisclosureGroup、Link、Pagination、Tabs |
| Overlays | 6 | AlertDialog、Drawer、Modal、Popover、Toast、Tooltip |
| Pickers | 3 | Autocomplete、ComboBox、Select |
| Typography | 2 | Kbd、Typography |
| Utilities | 1 | ScrollShadow |

与自身公共目录按语义对齐后，72 项中 70 项已有直接或组合对应。明确缺口是 `AvatarGroup` 和可直接使用的 `Typography` 组件；`Description / ErrorMessage / FieldError / Fieldset / Label / TextField / TextArea / RadioGroup / Chip / Breadcrumbs` 已由现有组合组件或命名差异覆盖。

## TDesign React：72 项

| 官方分类 | 数量 | 组件 |
|---|---:|---|
| 高阶组件 | 1 | AI Chat |
| 基础 | 4 | Button、Icon、Link、Typography |
| 布局 | 4 | Divider、Grid、Layout、Space |
| 导航 | 10 | Affix、Anchor、BackTop、Breadcrumb、Dropdown、Menu、Pagination、Steps、StickyTool、Tabs |
| 输入 | 21 | AutoComplete、Cascader、Checkbox、ColorPicker、DatePicker、Form、Input、InputAdornment、InputNumber、TagInput、Radio、RangeInput、Select、SelectInput、Slider、Switch、Textarea、Transfer、TimePicker、TreeSelect、Upload |
| 数据展示 | 24 | Avatar、Badge、Calendar、Card、Collapse、Comment、Descriptions、Empty、Image、ImageViewer、List、Loading、Progress、QRCode、Skeleton、Statistic、Swiper、Table、Tag、Timeline、Tooltip、Tree、Watermark、Rate |
| 消息提醒 | 8 | Alert、Dialog、Drawer、Guide、Message、Notification、Popconfirm、Popup |

## 自身公共组件目录：109 项

| 大分类 | 数量 | 组件 ID |
|---|---:|---|
| 按钮 | 5 | button、button-group、close-button、toggle-button、toggle-button-group |
| 表单 | 13 | input、textarea、checkbox、checkbox-group、radio、switch、form、field、input-group、input-otp、number-field、search-field、token-field |
| 选择器 | 5 | select、autocomplete、combo-box、cascader、slider |
| 集合与列表 | 5 | table、tree、list-box、tag-group、grid-list |
| 数据展示 | 11 | tag、badge、empty、loading、progress、progress-bar、progress-circle、meter、skeleton、spinner、descriptions |
| 日期与时间 | 7 | calendar、date-field、date-picker、date-range-picker、time-picker、range-calendar、time-field |
| 颜色 | 7 | color-area、color-field、color-picker、color-slider、color-swatch、color-swatch-picker、color-wheel |
| 导航 | 12 | tabs、breadcrumb、menu、dropdown、steps、accordion、disclosure、disclosure-group、link、toolbar、pagination、navigation-tree |
| 浮层与反馈 | 11 | dialog、alert-dialog、drawer、modal、toast、message、alert、tooltip、popover、popconfirm、preview-trigger |
| 布局 | 11 | card、divider、grid、space、stack、page-container、resizable-panel、separator、surface、group、virtualizer |
| 文件与媒体 | 5 | upload、image-preview、avatar、file-list、drop-zone |
| 排版与工具 | 3 | kbd、scroll-shadow、icon |
| AI 交互 | 14 | chain-of-thought、chat-attachment、chat-conversation、chat-list-view、chat-loader、chat-message、chat-message-actions、chat-source、chat-tool、code-block、markdown、prompt-input、prompt-suggestion、text-shimmer |

当前分类已显式修正：`pagination` 归入“导航”，`icon` 归入“排版与工具”，不再依赖“布局”默认回退。

## 国科信 v1.5.7 项目交付集：34 项

| 大分类 | 项目数量 | 公共目录数量 | 未进入项目交付 |
|---|---:|---:|---:|
| 按钮 | 1 | 5 | 4 |
| 表单 | 6 | 13 | 7 |
| 选择器 | 1 | 5 | 4 |
| 集合与列表 | 1 | 5 | 4 |
| 数据展示 | 4 | 11 | 7 |
| 日期与时间 | 0 | 7 | 7 |
| 颜色 | 0 | 7 | 7 |
| 导航 | 2 | 12 | 10 |
| 浮层与反馈 | 4 | 11 | 7 |
| 布局 | 0 | 11 | 11 |
| 文件与媒体 | 1 | 5 | 4 |
| 排版与工具 | 0 | 3 | 3 |
| AI 交互 | 14 | 14 | 0 |
| **合计** | **34** | **109** | **75** |

v1.5.7 项目交付集的数量并非“代码未实现”，而是当时白名单只批准了 34/102；该历史比例保持不变。与当前 109 项公共目录比较时，v1.5.7 尚未批准 75 项。当前草稿已扩充到 76 项，不应与 v1.5.7 冻结清单混用。

## 缺口结论

### 已完成：公共库能力纳入项目草稿

以下能力已完成项目适用性审查并进入当前草稿；v1.5.7 冻结版本仍保留原批准范围：

- 表单：`textarea`、`search-field`、`number-field`、`input-group`、`checkbox-group`。
- 选择：`autocomplete`、`combo-box`、`cascader`、`slider`。
- 日期时间：`date-field`、`date-picker`、`date-range-picker`、`time-picker`、`calendar`。
- 导航：`breadcrumb`、`menu`、`dropdown`、`steps`、`link`。
- 浮层反馈：`tooltip`、`popover`、`popconfirm`、`message`。
- 数据与媒体：`descriptions`、`tree`、`card`、`avatar`、`file-list`、`skeleton`、`progress`。

这些组件复用公共实现，不另建项目专属组件副本。

### P1：自身公共库真正缺少

- `TreeSelect`：组织、部门、技术领域等层级选择是 B 端高频需求。
- `Transfer`：成员、权限、标签的批量双栏选择。
- `Notification`：比 Toast 更持久、可承载操作的通知。
- `Timeline`：审批、发布、变更和审计记录。
- `Statistic`：总览和业务指标表达。
- `AvatarGroup`：成员与协作场景。
- `Typography`：可直接调用的标题、正文、省略和复制契约。

### P2：按业务需要补充

- `QRCode`、`Watermark`、基础 `Image`。
- `Affix`、`Anchor`、`BackTop`、`RangeInput`。

### P3：不建议仅为追平数量而引入

`Comment`、`Rate`、`Swiper`、`Guide`、`StickyTool` 等应在出现明确产品场景后再纳入，不应为了超过 HeroUI 或 TDesign 的数字而增加维护面。

## 建议的收口顺序

1. 先统一口径：公共目录、项目批准清单、Runtime 导出和交付包分开显示，不再只写“组件数”。
2. 保持分类映射自动校验：`pagination` 属于“导航”，`icon` 属于“排版与工具”。
3. React Aria 54 个基础家族现已进入公共目录和国科信草稿；下一次发布前继续完成状态、窄屏、键盘和冻结消费验收。
4. 对真正缺失的组件按项目场景排期，优先 TreeSelect、Transfer、Notification、Timeline、Statistic 和 AvatarGroup。
5. 每次发布同时记录“公共目录数 / 项目批准数 / 包根可导入数”，三者分开验收。

## 来源

- React Aria Components `1.21.1`：本工程已安装包和 Adobe React Spectrum 官方文档顶层组件页。
- HeroUI React `3.2.6`：[official component catalog](https://www.heroui.com/docs/components) 和 [v3 component metadata](https://github.com/heroui-inc/heroui/blob/v3/apps/docs/content/docs/en/react/components/meta.json)。
- TDesign React `1.18.3`：[official React documentation configuration](https://github.com/Tencent/tdesign-react/blob/develop/packages/tdesign-react/site/site.config.mjs)。
- 自身公共目录：`src/design-system/component-catalog.ts`。
- 国科信项目交付集：工作区数据库中的 v1.5.7 冻结快照。
