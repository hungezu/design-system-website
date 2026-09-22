# 组件状态补查 S01–S08 修复记录

日期：2026-09-19。对应 [补充审计报告](./component-state-gaps.md)。本轮已处理该报告的 8 类问题，并完成专项行为回归。项目基础、主题作用域及历史发布包保持不变。

## 逐项结果

| 项目 | 修复与验证 |
| --- | --- |
| S01 状态声明扩大 | 删除通用 fallbackStates，88 个组件必须提供显式状态契约。Divider、Space、Grid、Kbd、Icon、ColorSwatch 等静态组件仅声明 default；组件详情新增“状态适用性”，按当前公开 API 区分 disabled / loading / error。保留真正存在的加载、选中、展开和错误能力，不从示例名称推断实现。颜色字段补齐已声明的错误和禁用样式。 |
| S02 重复示例和覆盖缺口 | Pagination 改为首页、中间页、末页、禁用；初始页码不再覆盖用户翻页。Icon 改为小、中、大，实测约 16 / 20 / 24px。总示例由 228 增至 315，新增只读、必填、长度限制、前后缀、选择器清空/空选项/长选项、字段错误/边界值、选择控件加载/禁用组合、表格空态/排序/跨页选择、日期范围/不可用日期、嵌套和长内容浮层、文件大小校验等。不存在自动生成的“其他”占位变体。 |
| S03 错误＋hover | 上轮共享样式修复经本轮重新实测确认：Input 与 Checkbox 处于真实 hover 时，错误边框均保持 `#F53F3F`；Checkbox 同时具有 data-hovered 和 data-invalid。错误优先于普通 hover，禁用样式优先于错误交互反馈。 |
| S04 OTP 纠错 | 内部保存固定长度格位数组，空格不会被 join 后挤掉；同步编辑缓冲保证连续事件不丢值。支持任意格输入、替换、中间删除、空格退格、首尾/箭头导航、部分粘贴和全量粘贴。部分粘贴从当前格覆盖，全量验证码替换全部格位。浏览器确认第 4 格输入 7 留在第 4 格；填写 1237 后删除第二格，第一、三、四格保留。 |
| S05 Toast 重开 | 每次显示及消息/时长变化建立新的可见生命周期，重置剩余时间。hover 与 focus 分别计数，鼠标移出不会解除仍存在的键盘焦点暂停。浏览器实测手动关闭后重开，1 秒后再次自动消失；测试覆盖重开、暂停恢复、消息更新、duration=0 和卸载清理。 |
| S06 Avatar 恢复 | 图片失败状态限定在当前 src 的内部实例，换 src 时重建。浏览器实测由错误地址切换到 `/assets/hj-logo-112.png` 后真实 img 成功加载，naturalWidth 为 112。空名称使用带可访问名称的用户图标，Unicode 名称按完整字符回退。 |
| S07 Tag 移除 | 单个 Tag 和同类 TagGroup 示例均以状态控制展示，移除目标后显示反馈，并提供恢复操作；禁用示例保留禁用的移除按钮。浏览器和行为测试确认移除后标签消失、恢复后再次出现。 |
| S08 选中＋禁用 | 上轮修复经本轮复验：禁用 Radio 中心点与 Switch 滑块为 `#6B7785`，Switch 轨道为 `#F7F8FA`，不再保留正常品牌色或白色不可辨识中心点。新增“选中且禁用”“部分选中且禁用”等真实组合示例，禁用开关不能被操作。 |

## 示例修复中额外发现并处理

- 跨页表格原样例在每次渲染时重新创建数据，触发页码重置。改为稳定样例数据后，浏览器与测试确认：第一页选择一项，第二页再选一项，返回第一页仍保留两项选择。
- 加载 Drawer 示例提供“结束加载演示”：加载期间保护关闭，结束后恢复关闭图标与底部操作，避免将用户留在无法退出的演示中。
- SearchField 只读时不提供清空操作。
- 日期示例复用 React Aria 已使用的 `@internationalized/date`，将其列为直接依赖；未引入另一套日期或组件系统。

## 回归证据

- `npm test`：34 个文件、617 项测试通过。相对上一轮新增 27 项专项回归及 87 个示例挂载案例。挂载检查不替代行为或样式验收。
- `npm run build`：通过，包含类型检查、Token 与设计系统检查、Button Binding、27 条发布资产校验及文档生成。
- `npm run lint`：0 错误，保留 8 条原有 Fast Refresh 警告。
- 构建保留现有大体积 chunk 提示及历史发布差异提示；历史包未回写。
- 浏览器重新打开 88 个组件详情：标题与预览存在，桌面根节点无横向溢出。
- 实际操作验证 OTP 非顺序填写/中间删除、Toast 重开、头像加载恢复、Tag 移除/恢复、分页翻页、图标尺寸、错误 hover、禁用组合、表格排序和跨页选择、日期范围展示、Drawer 加载结束/关闭。

专项测试文件：

- `src/design-system/primitives/Collections/InputOTP.test.tsx`
- `src/design-system/primitives/Feedback/Toast.test.tsx`
- `src/design-system/primitives/Content/Avatar.test.tsx`
- `src/components/RuntimeExample.behavior.test.tsx`
- `src/design-system/component-bindings.test.ts`

## 复核入口与范围

- [当前 88 个组件状态清单](./state-coverage.md) / [JSON](./state-coverage.json)
- [修复前状态清单](./state-coverage-before-repair.md)
- [原边界案例页](http://127.0.0.1:5173/docs/audits/2026-09-19/edge-cases.html)
- [真实状态矩阵](http://127.0.0.1:5173/docs/audits/2026-09-19/state-matrix.html)
- [测试日志](./component-state-tests.log)、[构建日志](./component-state-build.log)、[Lint 日志](./component-state-lint.log)

315 个示例均通过挂载检查，但没有将其全部组合状态宣称为逐一浏览器认证。390px 下抽查 6 个详情根节点无横向溢出；截图仍可见现有平台导航和侧栏挤占窄屏内容，这不等于完整响应式验收，本轮没有重做平台壳布局。

Avatar 失败恢复示例故意加载错误图片；Upload 仅演示本地文件选择、大小校验和重新选择，不冒充真实网络上传或重试。
