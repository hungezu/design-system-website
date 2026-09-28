# React Aria 基础库适配缺口

日期：2026-09-23
复验：2026-09-28

## 结论

统计基线是当前工程使用的 `react-aria-components@1.21.1`：按官方组件文档和产品语义归并为 54 个用户可见组件家族，另将 6 个辅助能力单独治理。这是“组件家族覆盖”口径，不是 npm 包根导出数；子部件、hooks、state 对象和类型工具不重复计数。

权威机器可读清单为 `docs/acceptance/react-aria/coverage.json`，页面不读取、不展示该统计。

| 范围 | 已覆盖 | 未覆盖 | 说明 |
|---|---:|---:|---|
| 公共网站组件目录 | 54 / 54 | 0 | 54 个基础家族均有直接实现或明确语义等价包装 |
| 国科信项目批准范围 | 54 / 54 | 0 | 公共目录中的 54 个基础家族已全部准入 |
| 辅助基础设施 | 不计入业务组件 | 6 项需单独治理 | 不应为了数量强行增加业务组件页面 |

国科信项目当前草稿有 76 个批准组件，其中 54 个映射到 React Aria 的 54 个基础组件家族；其余为 8 个 B 端扩展组件和 14 个 AI 组件。因此不能用“76 / 54”声称基础库超额覆盖，应使用家族映射口径。

### “已适配”的判定边界

- **公共网站已覆盖**：组件目录已有独立入口，或有对外暴露的明确语义等价包装；不代表内部一定直接使用同名 React Aria API。
- **项目已适配**：项目批准清单已显式暴露该家族或其主要等价能力；其他组件的偶发内部依赖不计为项目已适配。
- `Autocomplete` 目前复用 `ComboBox` 实现，`Toast` 为自研语义等价实现；两者计入功能覆盖，但不应宣称为同名 React Aria API 已原生接入。
- `FileTrigger` 的主要能力由对外暴露的 `upload` 承载，因此计为等价覆盖；`Group` 已从内部组合能力提升为独立 `DSGroup` 公共契约。

## 第三批已补齐：7 项

| React Aria 家族 | 当前状态 | 准入结果 |
|---|---|---|
| `TokenField` | `token-field` / `DSTokenField` | 已进入公共目录与国科信草稿 |
| `GridList` | `grid-list` / `DSGridList` | 已进入公共目录与国科信草稿 |
| `ColorWheel` | `color-wheel` / `DSColorWheel` | 已进入公共目录与国科信草稿 |
| `NavigationTree` | `navigation-tree` / `DSNavigationTree` | 已进入公共目录与国科信草稿，保持导航语义独立于普通 Tree |
| `PreviewTrigger` | `preview-trigger` / `DSPreviewTrigger` | 已进入公共目录与国科信草稿 |
| `Group` | `group` / `DSGroup` | 已建立独立公共契约并进入国科信草稿 |
| `Virtualizer` | `virtualizer` / `DSVirtualizer` | 已建立虚拟化契约并进入国科信草稿 |

`FileTrigger` 已由公共 `upload` 组件组合使用，因此计为语义等价覆盖，不作为缺失项。

## 公共网站已有，但国科信项目尚未适配：0 项

第二批 23 项和第三批 7 项均已加入国科信草稿范围，目前公共网站与项目均无 React Aria 家族缺口。

## 国科信项目已适配的 React Aria 家族：54 项

| React Aria 家族 | 项目组件 |
|---|---|
| `Button` | `button` |
| `ToggleButton` | `toggle-button` |
| `ToggleButtonGroup` | `toggle-button-group` |
| `Checkbox` | `checkbox` |
| `CheckboxGroup` | `checkbox-group` |
| `Form` | `form` |
| `NumberField` | `number-field` |
| `RadioGroup` | `radio`，内部使用 RadioGroup 语义 |
| `SearchField` | `search-field` |
| `Switch` | `switch` |
| `TextField` | `input` |
| `TokenField` | `token-field` |
| `Autocomplete` | `autocomplete`，当前为 ComboBox 语义等价实现 |
| `ComboBox` | `combo-box` |
| `Select` | `select` |
| `Slider` | `slider` |
| `GridList` | `grid-list` |
| `ListBox` | `list-box` |
| `Table` | `table` |
| `TagGroup` | `tag-group` |
| `Tree` | `tree` |
| `Meter` | `meter` |
| `ProgressBar` | `progress-bar` |
| `Calendar` | `calendar` |
| `DateField` | `date-field` |
| `DatePicker` | `date-picker` |
| `DateRangePicker` | `date-range-picker` |
| `RangeCalendar` | `range-calendar` |
| `TimeField` | `time-field` |
| `ColorArea` | `color-area` |
| `ColorField` | `color-field` |
| `ColorPicker` | `color-picker` |
| `ColorSlider` | `color-slider` |
| `ColorSwatch` | `color-swatch` |
| `ColorSwatchPicker` | `color-swatch-picker` |
| `ColorWheel` | `color-wheel` |
| `Breadcrumbs` | `breadcrumb` |
| `Disclosure` | `disclosure` |
| `DisclosureGroup` | `disclosure-group` |
| `Link` | `link` |
| `Menu` | `menu` |
| `NavigationTree` | `navigation-tree` |
| `Tabs` | `tabs` |
| `Toolbar` | `toolbar` |
| `Modal` | `dialog`，底层使用 Modal / ModalOverlay |
| `Popover` | `popover` |
| `PreviewTrigger` | `preview-trigger` |
| `Toast` | `toast` |
| `Tooltip` | `tooltip` |
| `Group` | `group` |
| `Separator` | `separator` |
| `Virtualizer` | `virtualizer` |
| `DropZone` | `drop-zone` |
| `FileTrigger` | `upload` 内部组合 FileTrigger |

## 54 个组件家族完整映射

| React Aria 家族 | 公共网站 | 国科信项目 |
|---|---|---|
| Button | `button` | 已批准 |
| ToggleButton | `toggle-button` | 已批准 |
| ToggleButtonGroup | `toggle-button-group` | 已批准 |
| Checkbox | `checkbox` | 已批准 |
| CheckboxGroup | `checkbox-group` | 已批准 |
| Form | `form` | 已批准 |
| NumberField | `number-field` | 已批准 |
| RadioGroup | `radio` | 已批准 |
| SearchField | `search-field` | 已批准 |
| Switch | `switch` | 已批准 |
| TextField | `input` | 已批准 |
| TokenField | `token-field` | 已批准 |
| Autocomplete | `autocomplete` | 已批准 |
| ComboBox | `combo-box` | 已批准 |
| Select | `select` | 已批准 |
| Slider | `slider` | 已批准 |
| GridList | `grid-list` | 已批准 |
| ListBox | `list-box` | 已批准 |
| Table | `table` | 已批准 |
| TagGroup | `tag-group` | 已批准 |
| Tree | `tree` | 已批准 |
| Meter | `meter` | 已批准 |
| ProgressBar | `progress-bar` | 已批准 |
| Calendar | `calendar` | 已批准 |
| DateField | `date-field` | 已批准 |
| DatePicker | `date-picker` | 已批准 |
| DateRangePicker | `date-range-picker` | 已批准 |
| RangeCalendar | `range-calendar` | 已批准 |
| TimeField | `time-field` | 已批准 |
| ColorArea | `color-area` | 已批准 |
| ColorField | `color-field` | 已批准 |
| ColorPicker | `color-picker` | 已批准 |
| ColorSlider | `color-slider` | 已批准 |
| ColorSwatch | `color-swatch` | 已批准 |
| ColorSwatchPicker | `color-swatch-picker` | 已批准 |
| ColorWheel | `color-wheel` | 已批准 |
| Breadcrumbs | `breadcrumb` | 已批准 |
| Disclosure | `disclosure` | 已批准 |
| DisclosureGroup | `disclosure-group` | 已批准 |
| Link | `link` | 已批准 |
| Menu | `menu` | 已批准 |
| NavigationTree | `navigation-tree` | 已批准 |
| Tabs | `tabs` | 已批准 |
| Toolbar | `toolbar` | 已批准 |
| Modal | `modal` / `dialog` | `dialog` 已批准 |
| Popover | `popover` | 已批准 |
| PreviewTrigger | `preview-trigger` | 已批准 |
| Toast | `toast` | 已批准 |
| Tooltip | `tooltip` | 已批准 |
| Group | `group` | 已批准 |
| Separator | `separator` | 已批准 |
| Virtualizer | `virtualizer` | 已批准 |
| DropZone | `drop-zone` | 已批准 |
| FileTrigger | `upload` 内部组合 | `upload` 已批准 |

## 6 个辅助基础设施

这些能力应进入 Runtime 内部治理和验收记录，不应计入业务组件白名单：

| 基础设施 | 当前判断 | 后续要求 |
|---|---|---|
| `I18nProvider` | 仅在兼容 Runtime 中可见，未形成平台国际化合同 | 建立语言、数字和日期区域设置验收 |
| `VisuallyHidden` | 当前通过项目 CSS 类实现同类能力 | 统一为可复用无障碍工具或明确内部实现 |
| `FocusRing` | 来自 React Aria 工具层；组件使用 `focus-visible` 配方，没有独立工具入口 | 保留跨组件键盘焦点验收，不需要业务组件页 |
| `FocusScope` | 来自 React Aria 工具层；Dialog / Drawer 等浮层依赖焦点管理 | 继续验证焦点锁定、Escape 与焦点返回 |
| `UNSAFE_PortalProvider` | 底层实际 API 名带 `UNSAFE_`；项目使用 `PreviewScope` 传递浮层主题，不等于该 API | 建立统一 Portal / 主题继承内部合同 |
| `SSRProvider` | 当前客户端 Web 包明确不支持 SSR | 等 SSR 进入支持矩阵后再正式适配 |

## 建议顺序

1. 公共网站的 54 个 React Aria 基础家族已全部进入国科信草稿范围。
2. 后续新增组件应由真实业务场景驱动，不再为了基础家族数量扩充。
3. 对 6 个基础设施建立内部能力矩阵，不为了组件数量把它们做成业务组件卡片。
4. 每次发布同时记录：React Aria 家族覆盖、公共目录覆盖、项目批准覆盖和包根可导入覆盖，四个数字分开验收。
