# 88 个组件的状态与示例清单（修复后）

本清单从当前源码生成。旧审计快照保存在 [修复前清单](./state-coverage-before-repair.md)。

- 状态声明表示当前公开 API 或真实交互提供该状态，不等于每个视觉组合已验收。
- disabled / loading / error 按组件分别判定；不适用不计作待实现。不存在通用 fallbackStates。
- 各示例使用正式组件；hover、focus、open 由真实交互触发。示例挂载与专项行为证据分开记录。
- 已确认的缺实现及修复证据见 [补查修复记录](./component-state-repair.md)。本次没有新增“待实现”的功能承诺。
- 日期示例使用固定日期范围；上传示例只演示本地选择和大小校验，不模拟网络任务。

|组件|当前实现状态|不适用的通用状态|可操作示例|专项证据|
|---|---|---|---|---|
|combo-box|default, hover, focus, disabled, error|loading|默认、已选择、禁用、错误、只读、无匹配|示例挂载检查；不等同于行为验收|
|slider|default, focus, disabled|loading, error|单值、范围、禁用|示例挂载检查；不等同于行为验收|
|calendar|default, focus, selected, disabled|loading, error|默认、禁用、已选择、范围限制、不可用日期|示例挂载检查；不等同于行为验收|
|date-field|default, hover, focus, disabled, error|loading|默认、禁用、已填写、只读、错误、范围限制|示例挂载检查；不等同于行为验收|
|drop-zone|default|disabled, loading, error|默认、紧凑|示例挂载检查；不等同于行为验收|
|icon|default|disabled, loading, error|小图标、中图标、大图标|专项行为回归|
|button|default, hover, focus, active, disabled, loading|error|主要、次要、文字、危险|示例挂载检查；不等同于行为验收|
|input|default, hover, focus, disabled, error|loading|默认、已填写、错误、禁用、只读且可清空、必填、长度限制、前后缀|专项行为回归|
|select|default, hover, focus, open, selected, disabled, error|loading|未选择、已选择、错误、禁用、只读、必填且配置清空、可清空、空选项、含禁用选项、长选项|示例挂载检查；不等同于行为验收|
|textarea|default, hover, focus, disabled, error|loading|默认、已填写、错误、禁用、只读、必填、长度限制|示例挂载检查；不等同于行为验收|
|checkbox|default, hover, focus, checked, indeterminate, disabled, error, loading|—|未选中、已选中、部分选中、禁用、错误、加载、选中且禁用、部分选中且禁用|示例挂载检查；不等同于行为验收|
|radio|default, hover, focus, checked, disabled, error, loading|—|默认、已选择、禁用、错误、加载、选中且禁用|示例挂载检查；不等同于行为验收|
|switch|default, hover, focus, checked, disabled, loading|error|关闭、开启、禁用、加载、开启且禁用|专项行为回归|
|form|default, disabled, loading, error, success|—|默认、提交错误、禁用、提交中|示例挂载检查；不等同于行为验收|
|field|default, hover, focus, disabled, error|loading|默认、必填、错误、禁用|示例挂载检查；不等同于行为验收|
|date-picker|default, hover, focus, disabled, error|loading|默认、禁用、已填写、只读、错误、范围限制、不可用日期|示例挂载检查；不等同于行为验收|
|date-range-picker|default, hover, focus, disabled, error|loading|默认、禁用、已填写、只读、错误、范围限制、不可用日期|示例挂载检查；不等同于行为验收|
|time-picker|default, hover, focus, disabled, error|loading|默认、禁用、已填写、只读、错误、范围限制|示例挂载检查；不等同于行为验收|
|cascader|default|disabled, loading, error|地区、部门|示例挂载检查；不等同于行为验收|
|autocomplete|default, hover, focus, disabled, error|loading|默认、已选择、禁用、错误、只读、无匹配|示例挂载检查；不等同于行为验收|
|table|default, hover, selected, loading, empty|disabled, error|标准、紧凑、宽松、可选择、加载、空数据、无搜索结果、受控排序、跨页选择|专项行为回归|
|pagination|default, hover, focus, active, disabled|loading, error|首页、中间页、末页、禁用|专项行为回归|
|tag|default, hover, disabled|loading, error|默认、可移除、禁用|专项行为回归|
|badge|default, success, warning, error, info|disabled, loading|信息、成功、警告、错误|示例挂载检查；不等同于行为验收|
|empty|empty|disabled, loading, error|默认、带操作|示例挂载检查；不等同于行为验收|
|loading|loading|disabled, error|小、中、大|示例挂载检查；不等同于行为验收|
|progress|default|disabled, loading, error|进行中、已完成|示例挂载检查；不等同于行为验收|
|descriptions|default|disabled, loading, error|基础、详细|示例挂载检查；不等同于行为验收|
|tree|default, focus, selected, open|disabled, loading, error|单选、多选|示例挂载检查；不等同于行为验收|
|tabs|default, hover, focus, selected, disabled|loading, error|横向、纵向、禁用|示例挂载检查；不等同于行为验收|
|breadcrumb|default|disabled, loading, error|简短、多层|示例挂载检查；不等同于行为验收|
|menu|default, hover, focus, disabled|loading, error|默认、含禁用项|示例挂载检查；不等同于行为验收|
|dropdown|default, hover, focus, open, disabled|loading, error|默认、含禁用项|示例挂载检查；不等同于行为验收|
|steps|default|disabled, loading, error|开始、进行中、完成|示例挂载检查；不等同于行为验收|
|dialog|default, open, loading|disabled, error|信息、表单、加载保护、长内容滚动、嵌套选择器、关闭方式限制|专项行为回归|
|drawer|default, open, loading|disabled, error|查看、编辑、长内容滚动、嵌套选择器、关闭方式限制、加载保护|专项行为回归|
|toast|default, success, warning, error, info|disabled, loading|信息、成功、错误、关闭后重开、持续显示|专项行为回归|
|message|default, success, warning, error, info|disabled, loading|信息、成功、警告、错误|示例挂载检查；不等同于行为验收|
|alert|default, success, warning, error, info|disabled, loading|信息、成功、警告、错误|示例挂载检查；不等同于行为验收|
|tooltip|default, open|disabled, loading, error|上方、下方、左侧、右侧、左上、右上、左下、右下|示例挂载检查；不等同于行为验收|
|popover|default, open|disabled, loading, error|简短、详细|示例挂载检查；不等同于行为验收|
|popconfirm|default, open|disabled, loading, error|普通、危险|示例挂载检查；不等同于行为验收|
|card|default|disabled, loading, error|简洁、详细|示例挂载检查；不等同于行为验收|
|divider|default|disabled, loading, error|横向、纵向|示例挂载检查；不等同于行为验收|
|grid|default|disabled, loading, error|两列、三列|示例挂载检查；不等同于行为验收|
|space|default|disabled, loading, error|紧凑、宽松|示例挂载检查；不等同于行为验收|
|stack|default|disabled, loading, error|纵向、横向|示例挂载检查；不等同于行为验收|
|page-container|default|disabled, loading, error|标准、紧凑|示例挂载检查；不等同于行为验收|
|resizable-panel|default|disabled, loading, error|窄、宽|示例挂载检查；不等同于行为验收|
|upload|default, hover, focus, disabled, loading, error|—|单文件、多文件、错误、禁用、加载、文件大小校验|专项行为回归|
|image-preview|default, open|disabled, loading, error|横图、方图|示例挂载检查；不等同于行为验收|
|avatar|default|disabled, loading, error|小、中、大、图片、失败后恢复|专项行为回归|
|file-list|default|disabled, loading, error|只读、可移除|示例挂载检查；不等同于行为验收|
|accordion|default, hover, focus, disabled, open|loading, error|单项展开、多项展开|示例挂载检查；不等同于行为验收|
|alert-dialog|default, open|disabled, loading, error|确认、危险|示例挂载检查；不等同于行为验收|
|button-group|default|disabled, loading, error|主要操作、混合层级、禁用|示例挂载检查；不等同于行为验收|
|close-button|default, hover, focus, disabled|loading, error|默认、禁用|示例挂载检查；不等同于行为验收|
|disclosure|default, hover, focus, disabled, open|loading, error|默认、禁用|示例挂载检查；不等同于行为验收|
|disclosure-group|default, hover, focus, disabled, open|loading, error|单项展开、多项展开|示例挂载检查；不等同于行为验收|
|checkbox-group|default, hover, focus, selected, disabled, loading, error|—|默认、已选择、错误、禁用、加载、选中且禁用|示例挂载检查；不等同于行为验收|
|color-area|default, focus, disabled|loading, error|蓝色、绿色、红色|示例挂载检查；不等同于行为验收|
|color-field|default, hover, focus, disabled, error|loading|蓝色、绿色、红色|示例挂载检查；不等同于行为验收|
|color-picker|default|disabled, loading, error|蓝色、绿色、红色|示例挂载检查；不等同于行为验收|
|color-slider|default, focus, disabled|loading, error|蓝色、绿色、红色|示例挂载检查；不等同于行为验收|
|color-swatch|default|disabled, loading, error|蓝色、绿色、红色|示例挂载检查；不等同于行为验收|
|color-swatch-picker|default, focus, selected, disabled|loading, error|品牌色、状态色|示例挂载检查；不等同于行为验收|
|input-group|default|disabled, loading, error|网址、金额|示例挂载检查；不等同于行为验收|
|input-otp|default, focus, disabled|loading, error|六位、四位、禁用|专项行为回归|
|kbd|default|disabled, loading, error|复制、搜索|示例挂载检查；不等同于行为验收|
|link|default, hover, focus, disabled|loading, error|站内、外部|示例挂载检查；不等同于行为验收|
|list-box|default, focus, selected, disabled|loading, error|单选、多选|示例挂载检查；不等同于行为验收|
|meter|default|disabled, loading, error|正常、偏高、临界|示例挂载检查；不等同于行为验收|
|modal|default, open|disabled, loading, error|信息、确认|示例挂载检查；不等同于行为验收|
|number-field|default, hover, focus, disabled, error|loading|默认、禁用、错误、只读、最小值、最大值|示例挂载检查；不等同于行为验收|
|progress-bar|default|disabled, loading, error|进行中、已完成|示例挂载检查；不等同于行为验收|
|progress-circle|default|disabled, loading, error|进行中、已完成|示例挂载检查；不等同于行为验收|
|range-calendar|default, focus, selected, disabled|loading, error|默认、禁用、已选择、范围限制、不可用日期|示例挂载检查；不等同于行为验收|
|scroll-shadow|default|disabled, loading, error|紧凑、较高|示例挂载检查；不等同于行为验收|
|search-field|default, hover, focus, disabled, error|loading|空值、已输入、禁用、错误、只读|示例挂载检查；不等同于行为验收|
|separator|default|disabled, loading, error|横向、纵向|示例挂载检查；不等同于行为验收|
|skeleton|loading|disabled, error|文本、卡片|示例挂载检查；不等同于行为验收|
|spinner|loading|disabled, error|小、中、大|示例挂载检查；不等同于行为验收|
|surface|default|disabled, loading, error|默认、弱背景|示例挂载检查；不等同于行为验收|
|tag-group|default|disabled, loading, error|只读、可移除|专项行为回归|
|time-field|default, hover, focus, disabled, error|loading|默认、禁用、已填写、只读、错误、范围限制|示例挂载检查；不等同于行为验收|
|toggle-button|default, focus, selected, disabled|loading, error|未选中、已选中、禁用|示例挂载检查；不等同于行为验收|
|toggle-button-group|default, focus, selected, disabled|loading, error|单选、多选|示例挂载检查；不等同于行为验收|
|toolbar|default|disabled, loading, error|格式、对齐|示例挂载检查；不等同于行为验收|
