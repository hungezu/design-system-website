> 当前状态更新：本文为历史阶段记录。最新本地准入结论与限制见 [本地稳定候选验收](./acceptance/local-stable/ACCEPTANCE.md)，不能将旧准入文字理解为外部正式发布。

# Web 组件接入记录

## 本轮结果

- 公共组件目录保留 89 个 Runtime 导出（包含组合组件和兼容别名）；国科信项目显式启用 21 个组件，全部具有 ComponentAsset、React Binding、Token 与状态契约。
- `Button` 是唯一 React Aria 视觉实现；`DSButton` 保留 `variant / semantic` 公开 API，并映射到同一个 Button Primitive。
- 项目默认进入“当前草稿”；选择具体版本后，组件目录、预览、API 和 Token 检查器只读取该 Frozen 包。
- 自有源码新增：数字/搜索输入、ComboBox、Slider、进度、集合、导航、日期与时间、颜色、布局、文件展示等组件；保持已接入 TextField、Forms、Tabs、Select、Dialog、Drawer。
- 文档呈现：顶部平台导航与项目版本，左侧分类搜索，中间单组件预览和属性控制，右侧章节目录。
- API 表由 scripts/generate-runtime-api.ts 读取 TypeScript 真实 Runtime 导出生成，build 前刷新。
- 示例颜色、圆角修改只改变预览，不写入项目或 Frozen 文件。

## 验证

- TypeScript 检查通过。
- 12 个测试文件，114 项测试通过；包含 88 个示例挂载、输入/清空/只读、CheckboxGroup 多选、Radio 键盘、Switch、Tabs、NumberField 上限、OTP 字符过滤、折叠及面板键盘调整。
- build 通过，仍存在大 chunk 警告。
- 浏览器已实际检查 Input 文档及三栏布局，修复主导航空白与样式覆盖。
- 测试日志见 verification/components-tests.log；构建日志见 verification/components-build.log。

## 尚未完成的外部交付

- Storybook 目前只对 Button 建立正式绑定；其余 19 个项目组件待按需补充 Story。
- Figma Library / Code Connect 仍为 pending，不在本地代码闭环中宣称完成。
- `v1.5.5` 及之前的 Frozen 包保留历史颜色和组件范围；新蓝色版本需从完整 ProjectRelease/Scheme 快照重新编译。
- Autocomplete/ComboBox、Modal/Dialog、DisclosureGroup/Accordion、Divider/Separator、TimePicker/TimeField 等复用实现，需要按最终业务语义进一步规范 API；不以别名增加的数量宣称成熟度。
- 日期国际化、复杂 Tree/TagGroup、上传异常及新引入浮层的完整浏览器验证尚待补齐。

当前国科信 21 个项目组件已达到主工程草稿复用与下一版发布准入条件；历史 Frozen 范围和外部 Figma 交付仍按实际状态单独管理。
