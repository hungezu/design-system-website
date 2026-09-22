# 全站组件、主题变量与交互状态核查

> 修复更新：本报告保留修复前证据。F01–F10 的处理结果与当前验证范围见 [修复记录](./global-style-repair.md)。

日期：2026-09-19。对象：当前本地源码及 `http://127.0.0.1:5173`。

**结论：尚未达到全站样式与变量一致性要求。** 已有统一 Runtime 入口、组件 Primitive 和主题解析，但实际存在“文档值、预览值、浮层值、冻结版本值”分离的情况。本轮确认 10 类问题：P1 4 类、P2 6 类，未发现新的 P0 阻断。

本报告记录现状，不代表这些问题已修复。本轮产物是审计报告、源码清单、检查日志及真实组件状态矩阵；没有批量改写应用样式、主题或冻结包。

## 覆盖范围与证据等级

| 范围 | 本轮实际检查 |
| --- | --- |
| 共享基础 | 19 个 CSS 文件；Primitive、Runtime 兼容层、Token 定义、主题解析、浮层、组件状态说明及页面调用 |
| 公共组件 | 88 个组件详情 URL 逐页打开，检查标题、预览区、默认状态变量是否为空；包含日期、颜色、导航、浮层、媒体等族 |
| 全站页面 | 首页、设计基础、组件目录、模式目录、模板目录、项目列表、项目概览、快速开始、公告、管理后台、全站搜索、版本记录、设计检查 |
| 组合页面 | 全部 12 个交互模式详情、3 个页面模板详情 |
| 主题上下文 | 公共基线、国科信草稿、测试客户 B 草稿、国科信 v1.5.5；主题页临时深色模式，测试后恢复 |
| 真实状态矩阵 | Input、SearchField、NumberField、ComboBox、Select、DateField、DatePicker、Checkbox、Radio，9 族 × 默认/禁用/错误，共 27 格 |
| 手动交互 | 复选框实际 hover/选中、弹窗打开/关闭及键盘焦点、日期组合字段键盘焦点、按钮层级与状态说明切换、主题参数联动 |
| 响应式 | 实际 CSS 内容宽度 1016px；390px 下抽查首页、组件目录、查询列表、主题编辑及抽屉 |
| 自动检查 | 491 项测试通过、TypeScript 检查通过、设计系统对齐和 27 条发布资产完整性校验通过 |

证据分为“浏览器实测”和“源码确认”。88 页可打开不等于 88 个组件的每一种状态都已通过。按下瞬间、全部 hover/组合态及所有冻结版本没有逐一做截图认证；相关 CSS/契约已检查，已证实问题列在下方。没有把自动生成的状态色块当作真实组件状态验证。

## P1：应优先修复

### F01　占位文字与部分品牌按钮对比度不足

**浏览器实测。** 公共 Input/Select 的占位文字是 `color(srgb 0.500235 0.531294 0.576471)`，白底对比度 **3.61:1**，低于普通文字 4.5:1。设计基础页面却展示 `field-placeholder = #6B7785`，该色白底为 **4.56:1**。

原因是 `projectPreviewVariables` 将占位色重新计算成“次文字 72% + 内容表面”，覆盖了语义 Token。公共和项目示例都经过这个函数。

测试客户 B 的主按钮另有相同类别问题：白字配 `#13B2BA` 为 **2.59:1**。该项目明确是隔离测试数据，不是生产客户规范，但证明任意主题色进入主按钮后没有可读性约束。

定位：[project-theme.ts:153](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/services/project-theme.ts:153)、[semantic-tokens.ts:25](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/data/global/semantic-tokens.ts:25)、[测试项目定义](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/data/projects/test-customer-b/index.ts:14)。

建议：占位色纳入唯一的解析结果；主题编辑对文字/背景配对提供对比度校验，不直接改变既定品牌主色。验收应覆盖浅色、深色与自定义品牌。

### F02　项目浮层只携带部分变量，出现混合主题

**浏览器实测。** 国科信 `/projects/guokexin/components/dialog?version=draft` 的“编辑资源”弹窗内，“保存”按钮背景是蓝色 `#165DFF`，边框却是公共绿色 `#315C52`。键盘 Tab 聚焦该按钮后，焦点阴影也使用绿色。

同一按钮解析结果：`--bds-brand = #165DFF`，`--brand-primary = #315C52`。这是因为 Overlay 只复制 `--bds-*` / `--ds-*`，遗漏 `--brand-*`、`--button-*` 等实际被新 Primitive 消费的语义与组件变量。Select 也使用同类局部复制逻辑，需一起归并，但本轮没有将其所有浮层组合态认定为已复现。

定位：[Overlays/index.tsx:17](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Overlays/index.tsx:17)、[Select/index.tsx:21](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Select/index.tsx:21)。

建议：所有 Portal 使用统一主题上下文传递完整解析结果，而非各自按变量名前缀抓取。验收覆盖按钮背景、边框、focus、错误文字和打开浮层后的主题变化。

### F03　冻结版本详情与预览混入当前草稿

**浏览器实测。** 国科信主题页 `?version=1.5.5` 显示“冻结版本只读”，其 `--brand-primary` 是历史值 `#0a7b6c`，但按钮 Token、Runtime 按钮背景仍为草稿蓝 `#165DFF`，按钮也实际显示蓝色。

`/projects/guokexin/foundations/brand-primary?version=1.5.5` 同样显示“当前项目最终值 #165DFF，来源：项目”，并没有展示冻结值。

原因有两处：`releasePreviewVariables` 先注入整套草稿变量，再只覆盖少量历史语义变量；`TokenDetail` 始终读取当前 `theme.values`。另外 PatternDetail 不读取版本参数，源码上也存在同类上下文缺口。

定位：[project-theme.ts:239](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/services/project-theme.ts:239)、[AssetDetail.tsx:15](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/pages/AssetDetail.tsx:15)、[PatternDetail.tsx:29](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/pages/PatternDetail.tsx:29)。

建议：冻结值由单独的版本解析结果供应给变量详情、模板、模式和预览；缺失值标明历史兼容来源，不能默默使用草稿。**保留历史包原始颜色，不把它“修正”为当前品牌。**

### F04　“状态与颜色变量”并非真实渲染值的可靠说明

**浏览器实测。** 公共按钮切到“次要”后：

| 项目 | 状态说明 | 真实组件变量/样式 |
| --- | --- | --- |
| 默认背景 | `transparent` | `#FFFFFF`，浏览器显示白底 |
| hover 背景 | `#F7F8FA` | `--button-neutral-outline-bg-hover = #F2F3F5` |

组件预览消费 `projectPreviewVariables`；检查器读取 `resolveBaselineTheme()` 或项目 `theme`。两套映射没有保持一致。大量组件状态又来自通用回退表，不能证明该组件真正实现了对应 loading/error/hover。

定位：[Components.tsx:902](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/pages/Components.tsx:902)、[component-bindings.ts:109](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/component-bindings.ts:109)、[project-theme.ts:193](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/services/project-theme.ts:193)。

建议：检查器、组件 CSS、项目预览引用同一份组件状态配方和解析结果；区分“真实组件交互态”与“颜色说明示意”。只暴露已实现或明确标注未实现的状态。

## P2：组件状态和复用缺口

### F05　复合字段错误、禁用与焦点样式不完整

**27 格真实组件矩阵验证。**

| 组件族 | 错误态边框 | 禁用外观 |
| --- | --- | --- |
| Input | 正确变红 `#F53F3F` | 背景弱化，但内容文字仍使用正常 `#1D2129` |
| Select | 正确变红 | 背景弱化 |
| SearchField / NumberField / ComboBox | 已有 `data-invalid`，边框仍是默认 `#E5E6EB` | 背景弱化，内容文字仍为正常色 |
| DateField | 已有错误标记，边框仍是默认色 | 白底、正常文字、默认边框，与正常态相同 |
| DatePicker | 错误标记未带来红边框 | 外层有弱化背景，内部日期区域仍需统一处理 |
| Checkbox / Radio | 错误边框、选中和禁用基础样式生效 | 可区分 |

日期选择器的键盘焦点环还落在内部 `.owned-date-input`，外层 `.owned-control-row` 是透明 outline 且 `overflow:hidden`，没有遵守“组合控件由外框提供唯一焦点环”的现有约定。

定位：[Fields.css:6](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/AdvancedFields/Fields.css:6)、[DateTime.css:14](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/DateTime/DateTime.css:14)、[TextField.css](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/TextField/TextField.css)。

建议：集中补齐 default/hover/focus/invalid/disabled 及其组合优先级；错误态不可被 hover 覆盖，禁用态不可保留正常 hover 反馈。

### F06　12 个交互模式示例未复用正式 DS 控件

**源码和 12 个页面均确认。** PatternDemo 的“继续/上一步/重新演示”使用 `button.primary-action/secondary-action`，确认字段使用页面原生 input。示例主按钮规格为 40px、12px 字号及独立 hover/active 配方，正式 DSButton 默认是 32px、14px。

模板页主体已经复用 DSButton、DSInput、DSSelect、DSTable、DSPagination；问题集中在 PatternDemo 的另一套实现。平台外壳独立 AppSelect、导航、搜索本身不算违规，不能为了统一把平台外壳也套上项目品牌。

定位：[PatternDetail.tsx:26](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/pages/PatternDetail.tsx:26)、[index.css:121](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/styles/index.css:121)。

建议：模式示例调用正式组件组合；平台壳层继续保留独立 App UI 作用域。

### F07　主题参数只覆盖了部分文字配方

**浏览器实测。** 主题页把正文字号改到 18px 后，右侧容器与输入文字为 18px，按钮仍是 14px。主色、圆角、高度和标题字号联动是有效的，但不能据此声称所有组件文字已统一联动。

原因是按钮消费固定 `--font-button`，主题变量函数只输出 `--preview-body-size` 等字段。字体族也应检查同一处配方，而非仅改变容器继承。

定位：[Button.css:25](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Button/Button.css:25)、[project-theme.ts:176](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/services/project-theme.ts:176)。

建议：明确正文与组件字号的映射策略；若按钮需固定字号，界面明确说明，避免暗示全预览字号都同步；字体族应一致消费项目配置。

### F08　加载组件尺寸 API 与实际样式不符

**浏览器实测。** Loading 页面“小/中/大”三种示例的圆环都约 20px，文字均为 14px。代码虽然输出 `owned-loading--sm/md/lg`，CSS 没有对应尺寸规则。Spinner 复用同一个实现。

定位：[Feedback.css:1](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Feedback/Feedback.css:1)。

建议：将三档尺寸接入尺寸 Token，或删除尚未实现的尺寸承诺。

### F09　可清空 Select 的操作仍是文字，未使用统一语义图标

**源码确认；未计作页面已触发验证。** 可选 `clearable` Select 在有值且 hover/focus 时显示文字“清空”，而输入框、搜索框已复用 DSIconAction。清空时替换下拉箭头的逻辑存在，但具体操作样式不一致。

定位：[Select/index.tsx:26](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Select/index.tsx:26)。

建议：仅对显式可清空的选择器使用统一 `clear-input` 语义图标；普通/必填选择器保留下拉箭头，不扩大清空能力。

### F10　抽屉在窄屏仍固定为 42vw

**浏览器实测。** 在实际 CSS 内容宽度 390px 下，抽屉测得约 158px，正文区域仅 109px，正文 scrollWidth 为 114px，已经产生内部挤压。页面根节点没有横向溢出，不能据此判定抽屉响应式通过。

定位：[Overlays.css:11](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Overlays/Overlays.css:11)。

建议：窄屏切到接近全宽的抽屉，按可用视口限制宽高，验证表单、按钮组和长文案。

## 已验证正常的部分

- 88 个公共组件详情都有预览区；默认变量说明表未出现“未定义”。这只是默认路径与数据完整性结果，不覆盖所有计算表达式或组合状态。
- 普通页面中的公共、国科信、客户 B 按钮分别解析到 `#315C52`、`#165DFF`、`#13B2BA`，基础项目隔离有效。
- 公共复选框实际 hover 边框为 `#447167`，与其 hover Token 一致；选中、部分选中、禁用和错误基础表现具备实现。
- Badge 四种浅色状态的实际文字对比度约为：信息 8.85、成功 4.80、警告 4.59、错误 5.95，均通过普通文字阈值。不是所有状态色都有对比度问题。
- 主题页临时深色模式下，输入/选择器/卡片/Badge 的背景与文字可以跟随，不能把整个深色实现判为缺失。
- 三类模板主体使用真实 DS 控件。Input 和普通 Select 错误态边框生效，表单校验提示有文字。
- 之前修复的表格更新死循环未复现；491 项回归测试、类型检查及发布文件完整性校验通过。
- 390px 下抽查的五个页面根节点均无横向溢出；抽屉内部仍有 F10。

## 自动扫描结果如何解读

扫描找到 206 个 CSS 自定义属性声明名，但这个数字包含局部配方，不能与 99 个源 Token 混为一谈。静态缺定义候选包括 `--trigger-width`、`--preview-gap`、`--ia-depth` 等，它们由 React Aria 或组件内联样式供应，不能直接报为未定义。

impeccable 检测器产生 241 条 advisory，涉及颜色、字号、圆角。测试用色、历史冻结回退色及圆形控件尺寸均需结合语义筛选，**不把 241 条提示当作 241 个缺陷**。本报告仅将已核实的问题纳入上述 10 类。

发布资产校验保留 3 条已知历史差异警告。冻结历史色与当前源色不同可以是正确记录；F03 是预览混用版本，而不是历史文件颜色本身错误。

## 健康度与修复顺序

下表为基于本轮证据的工程判断，不是 Lighthouse 或完整 WCAG 认证分数。

| 维度 | 0–4 | 依据 |
| --- | ---: | --- |
| 可访问性 | 2 | 占位对比度、错误辨识、组合焦点问题 |
| 性能 | 3 | 已修复表格死循环；本轮未做全站性能基准 |
| 主题 | 2 | 基础隔离有效，Portal 与冻结上下文有缺口 |
| 响应式 | 2 | 主要页面抽查正常，抽屉内层挤压 |
| 实现一致性 | 2 | 模板复用有效，但模式与检查器未统一 |
| 合计 | **11/20** | 需要有针对性的修复 |

建议顺序：先统一解析结果与浮层传递（F02–F04），再处理文字对比度（F01），补齐共享组件状态（F05），最后收敛模式控件、参数映射、尺寸及响应式（F06–F10）。适用工作流为 impeccable harden / colorize / adapt，修复后再做 polish；不需要重建工程或替换组件库。

## 复核产物

- [真实状态矩阵](http://127.0.0.1:5173/docs/audits/2026-09-19/state-matrix.html)：依赖本地 Vite，直接引用当前组件；可复核默认/禁用/错误区别，不保存主题。
- [源码与变量引用清单](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/source-inventory.json)
- [检测器原始提示](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/detector.json)
- [测试与校验日志](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/tests.log)

## 组件情况补查

后续补查发现错误+hover 优先级、OTP 非顺序输入、Toast 重开计时、Avatar 失败恢复等遗漏，详见[补充报告](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/component-state-gaps.md)及[88 组件状态清单](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/state-coverage.md)。该补查包含对原 F04/F05 的深化，不应把问题数量简单相加。
