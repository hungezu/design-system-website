# 组件状态、组合态与边界情况补充核查

> 修复更新：S01–S08 已处理并完成专项复核，见 [补查修复记录](./component-state-repair.md)。下文保留修复前的审计证据。

日期：2026-09-19。基于上一轮全局样式审计，继续检查“是否遗漏情况”，不批量修改组件实现。

**结论：还有遗漏，而且不能只增加几张状态截图解决。** 需要分别处理状态适用性、示例完整性、真实组合态以及进入/退出/恢复过程。本轮列出 8 类补充发现，其中部分深化原报告 F04/F05，不与上一轮 10 类机械相加。

## 新的实测发现

### S01 · P1　状态声明被通用默认值扩大，不能证明实现完整

完整清点 88 个组件，当前有 **80 个声明 disabled、71 个声明 loading、71 个声明 error**。其中包括 Divider、Space、Grid、Kbd 等没有相应状态 API 的静态组件。

原因：[component-bindings.ts](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/component-bindings.ts) 中 `make` 的通用 fallbackStates 被广泛套用。组件目录据此生成状态检查器，再用通用颜色角色回退。显示“错误/加载”选项不等于该组件可产生该状态。

建议：每个组件记录“适用且已实现 / 适用但待实现 / 不适用”。静态容器不需要被强行增加 loading/error；不能通过生成虚假状态来满足覆盖率。

完整 88 行清单：[state-coverage.md](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/state-coverage.md)。其中候选差异须结合真实 API 判定，不能直接算作缺陷。

### S02 · P2　部分示例重复，很多已支持的情况没有展示

**浏览器实测：** Pagination 的“默认/其他”都显示 `共 3 条 · 1/3 页`，Icon 的“默认/其他”均展示相同的 12 个图标。两者没有专属变体配置，使用了通用 `default/alternate`，但渲染代码没有处理 `alternate`。Pagination 渲染代码已支持 `middle/end`，配置列表却未暴露。

**源码确认的展示缺口：**

| 组件族 | 当前展示 | 已有能力但缺少清晰入口/组合示例 |
| --- | --- | --- |
| Input / TextArea | 默认、填入、错误、禁用 | 只读、必填、长度限制、前后缀、清空与只读组合 |
| Checkbox / Radio / Switch | 基础选中与禁用 | 加载、错误、选中且禁用、部分选中且禁用 |
| Select | 未选择、已选择、错误、禁用 | 必填、只读、可清空、空选项、禁用选项与长选项 |
| NumberField / SearchField / ComboBox | 以默认/输入/禁用为主 | 错误、边界值、只读、搜索无匹配等 |
| Table | 三档密度、可选择 | loading、空数据、无搜索结果、受控排序、跨页选择等 |
| 日期/时间 | 默认、禁用 | 已选日期、只读、错误、最小/最大值、不可用日期、范围纠错 |
| Dialog / Drawer | 信息、表单 | 长内容滚动、嵌套选择器、loading、关闭保护、焦点回归 |
| Upload | 单文件、多文件、静态错误、禁用 | 已支持的 loading、超大小校验与再次选择恢复 |

这是“展示/验收缺口”，不是断言这些底层能力都不存在。应检查组件包装层实际暴露的 API；例如 DSSelect 当前是单选 API，不应凭空宣称已支持多选。

定位：[component-demo-variants.ts](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/component-demo-variants.ts)、[RuntimeExample.tsx:65](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/components/RuntimeExample.tsx:65)。

### S03 · P1　错误态叠加 hover 后，错误边框被覆盖

**真实组件矩阵和鼠标实测。** Input、Checkbox 均保持 `data-invalid=true`，但鼠标移入后边框从错误红 `#F53F3F` 变成品牌 hover 色 `#447167`。这不是错误状态消失，而是 CSS 优先级错误地遮住了错误信号。

Input 的 `:not([data-disabled]) ... :hover` 和 Checkbox 的 `[data-hovered]:not([data-disabled])` 比错误规则更具体。这深化了上一轮 F05：除了缺少某些状态，已存在的状态之间也会互相覆盖。

定位：[TextField.css:7](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/TextField/TextField.css:7)、[Forms.css:34](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Forms/Forms.css:34)。

建议：明确 disabled、readOnly、invalid、focus、hover、pressed 的组合优先级。验收至少包括 invalid+hover、invalid+focus、disabled+hover、selected+disabled。

### S04 · P1　OTP 非顺序输入会落入错误位置

**浏览器真实按键与截图确认。** 四格验证码为空时，在第 4 格输入 `7`，焦点仍在第 4 格，数字却显示在第 1 格，回调值为 `7`。内部用字符串保存内容，`chars.join('')` 消掉了前面的空格位。中间删除、纠错与从中间粘贴也存在同一结构性风险；这些衍生路径本轮没有全部逐条验证。

定位：[Collections/Additional.tsx:24](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Collections/Additional.tsx:24)。

建议：保留固定长度的格位状态，输出验证码字符串与内部编辑状态分开。增加任意格输入、中间清空、退格、替换、部分粘贴、全量粘贴、非数字过滤等验收。

### S05 · P2　Toast 手动关闭后重开，自动关闭计时失效

**浏览器实测。** 辅助页设置 1 秒自动关闭；打开通知、点击通知内的关闭按钮、再次打开，超过设定时间仍保留通知，焦点已回到外部“打开”按钮。

`paused` 会在 hover/focus 时置 true；通知卸载后未必产生 mouseleave/blur，重新打开只重置 remaining，没有重置 paused。暂停状态被带入了下一轮显示。

定位：[Feedback/index.tsx:26](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Feedback/index.tsx:26)。

建议：将每次 open 视为新的生命周期，重置暂停和计时状态；分别验证自动消失、hover 暂停、focus 暂停、手动关闭后重开、内容更新和 duration=0。

### S06 · P2　Avatar 图片失败后，换成有效 src 仍不恢复

**浏览器实测。** 初始故意使用无效图片地址，组件回退为文字；再通过按钮把 src 改为项目已有 `/assets/hj-logo-112.png`，组件仍显示文字，DOM 中没有 img。

`failed` 状态只在出错时置 true，没有在 src 更新时复位。

定位：[Content/index.tsx:16](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Content/index.tsx:16)。

建议：失败状态与具体 src 绑定；补验空 src、坏图、换新图、空名称和长名称，不只验证图片首次加载成功。

### S07 · P2　Tag“可移除”示例点击后不移除

**浏览器实测。** `/components/tag` 的“可移除”示例点击“移除设计”后，标签“设计”仍显示，也没有可见的操作反馈。

组件回调入口存在，问题在 RuntimeExample：回调只 setValue，但该分支没有用 value 控制展示，也没有渲染反馈。不能把这个问题误判为 DSTag 的 onRemove API 本身失效。

定位：[RuntimeExample.tsx:62](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/components/RuntimeExample.tsx:62)。

建议：示例完成真正的移除与恢复流程；验收不仅看能否挂载，还要核对操作前后的可见状态。

### S08 · P2　选中且禁用的视觉组合仍不统一

**真实组件矩阵实测。** 禁用且选中的 Radio，底色是 `#F2F3F5`，中心点仍为白色；对应禁用规则修改的是 border-color，但中心点由 background 绘制。Switch 开启且禁用时轨道仍为普通品牌绿色，缺少与其他选择控件一致的禁用视觉处理。

控件确实不可操作，问题是组合态视觉辨识与一致性；这里不把禁用控件对比度直接当作 WCAG 普通文字违规。

定位：[Forms.css](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/src/design-system/primitives/Forms/Forms.css)。

建议：以独立组合案例检查 mark、track、border、text，不只给最外层标签加 disabled。

## 需要补充的验收矩阵

| 范围 | 必查情况 |
| --- | --- |
| 普通交互 | default、hover、keyboard focus、pressed、selected；鼠标与键盘路径分别核对 |
| 字段组合 | invalid+hover/focus、disabled+selected、readOnly+clearable、required+clearable、loading+disabled |
| 数据边界 | 无数据、无搜索结果、单条、首尾页、数据减少、长内容、长选项、受控值变化 |
| 输入边界 | min/max/step、中文输入、粘贴、部分纠错、全量替换、清空、不可编辑 |
| 浮层 | 首次打开、关闭重开、Escape、外部点击、焦点返回、嵌套浮层、长内容滚动 |
| 异步表现 | 开始、等待、成功、失败、重试、取消；当前未实现的任务应标明未提供 |
| 图片与文件 | 空值、加载失败、换新资源恢复、类型/大小限制、再次选择、移除 |
| 环境 | 公共/项目/冻结、浅色/深色、自定义品牌、长中文文案、窄屏、减少动态效果 |

上传组件目前做本地文件选择和大小校验，没有真实网络上传任务；不能把服务器进度/重试当作已经实现，也不因当前产品没有上传服务器而直接报后端缺陷。

## 已有保护与测试盲区

本轮实测及源码核对：只读 Input 没有清空按钮；只读 Select 不展开；必填且 clearable 的 Select 由 required 条件阻止提供清空按钮。这些保护应保留。

已有测试覆盖了输入只读/清空、数字最大值、基础键盘选择、Tooltip、OTP 顺序输入、Dialog Escape/焦点返回等，不能说完全没有交互测试。但按当前测试展开，**404 项是示例挂载/变体数量检查**（88+88+228）；它们不证明状态样式、两个变体有区别、操作后真的生效，或失败后能够恢复。这解释了为什么 491 项测试通过仍遗漏上述路径。

建议优先增加针对 S03–S06 的行为回归，再把每个组件的“适用状态、实现入口、示例入口、测试证据”连在一起。无需给所有组件机械添加相同状态。

## 本轮复核产物

- [完整 88 组件清单](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/state-coverage.md)
- [机器可读清单](/Users/Zhuanz/Documents/ChatGPT/设计智能系统/docs/audits/2026-09-19/state-coverage.json)
- [组合状态矩阵](http://127.0.0.1:5173/docs/audits/2026-09-19/state-matrix.html)
- [边界情况复现页](http://127.0.0.1:5173/docs/audits/2026-09-19/edge-cases.html)

辅助页依赖当前 Vite 服务，引用实际组件，不保存项目数据。上述缺陷仍为待修复状态。
