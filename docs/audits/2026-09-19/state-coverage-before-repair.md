# 88 个组件的状态声明与示例清单

这是源码清单，候选项不等于缺陷：hover/focus/open 通常由交互触发，Button 还有单独的配置开关。应先判定状态是否适用于组件，再核对实现与示例。

|组件|声明状态|现有示例|需人工确认的声明/示例差异|
|---|---|---|---|
|combo-box|default, hover, focus, disabled, loading, error|默认、已选择、禁用|loading, error|
|slider|default, hover, focus, disabled, loading, error|单值、范围、禁用|loading, error|
|calendar|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|date-field|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|drop-zone|default, hover, focus, disabled, loading, error|默认、紧凑|disabled, loading, error|
|icon|default, hover, focus, disabled, loading, error|默认、其他|disabled, loading, error|
|button|default, hover, focus, active, disabled, loading|主要、次要、文字、危险|disabled, loading|
|input|default, hover, focus, disabled, error|默认、已填写、错误、禁用|—|
|select|default, hover, focus, open, selected, disabled, error|未选择、已选择、错误、禁用|—|
|textarea|default, hover, focus, disabled, loading, error|默认、已填写、错误、禁用|loading|
|checkbox|default, hover, focus, checked, indeterminate, disabled, error|未选中、已选中、部分选中、禁用|error|
|radio|default, hover, focus, checked, disabled, error|默认、已选择、禁用|error|
|switch|default, hover, focus, checked, disabled|关闭、开启、禁用|—|
|form|default, disabled, loading, error, success|默认、提交错误、禁用|loading|
|field|default, hover, focus, disabled, error|默认、必填、错误|disabled|
|date-picker|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|date-range-picker|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|time-picker|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|cascader|default, hover, focus, disabled, loading, error|地区、部门|disabled, loading, error|
|autocomplete|default, hover, focus, disabled, loading, error|默认、已选择、禁用|loading, error|
|table|default, hover, selected, loading, empty|标准、紧凑、宽松、可选择|loading, empty|
|pagination|default, hover, focus, active, disabled|默认、其他|disabled|
|tag|default, hover, disabled|默认、可移除、禁用|—|
|badge|default, success, warning, error, info|信息、成功、警告、错误|—|
|empty|empty|默认、带操作|empty|
|loading|loading|小、中、大|loading|
|progress|default, hover, focus, disabled, loading, empty|进行中、已完成|disabled, loading, empty|
|descriptions|default, hover, focus, disabled, loading, empty|基础、详细|disabled, loading, empty|
|tree|default, hover, focus, disabled, loading, empty|单选、多选|disabled, loading, empty|
|tabs|default, hover, focus, selected, disabled|横向、纵向、禁用|—|
|breadcrumb|default, hover, focus, selected, disabled|简短、多层|disabled|
|menu|default, hover, focus, selected, disabled|默认、含禁用项|disabled|
|dropdown|default, hover, focus, selected, disabled|默认、含禁用项|disabled|
|steps|default, hover, focus, selected, disabled|开始、进行中、完成|disabled|
|dialog|default, open, loading|信息、表单|loading|
|drawer|default, open, loading|查看、编辑|loading|
|toast|default, success, warning, error, info|信息、成功、错误|—|
|message|default, open, loading, error, disabled|信息、成功、警告、错误|disabled, loading|
|alert|default, success, warning, error, info|信息、成功、警告、错误|—|
|tooltip|default, open, loading, error, disabled|上方、下方、左侧、右侧、左上、右上、左下、右下|disabled, loading, error|
|popover|default, open, loading, error, disabled|简短、详细|disabled, loading, error|
|popconfirm|default, open, loading, error, disabled|普通、危险|disabled, loading, error|
|card|default, hover, focus, disabled, loading, error|简洁、详细|disabled, loading, error|
|divider|default, hover, focus, disabled, loading, error|横向、纵向|disabled, loading, error|
|grid|default, hover, focus, disabled, loading, error|两列、三列|disabled, loading, error|
|space|default, hover, focus, disabled, loading, error|紧凑、宽松|disabled, loading, error|
|stack|default, hover, focus, disabled, loading, error|纵向、横向|disabled, loading, error|
|page-container|default, hover, focus, disabled, loading, error|标准、紧凑|disabled, loading, error|
|resizable-panel|default, hover, focus, disabled, loading, error|窄、宽|disabled, loading, error|
|upload|default, hover, focus, disabled, loading, error|单文件、多文件、错误、禁用|loading|
|image-preview|default, hover, focus, disabled, loading, error|横图、方图|disabled, loading, error|
|avatar|default, hover, focus, disabled, loading, error|小、中、大|disabled, loading, error|
|file-list|default, hover, focus, disabled, loading, error|只读、可移除|disabled, loading, error|
|accordion|default, hover, focus, disabled, loading, error|单项展开、多项展开|disabled, loading, error|
|alert-dialog|default, hover, focus, disabled, loading, error|确认、危险|disabled, loading, error|
|button-group|default, hover, focus, disabled, loading, error|主要操作、混合层级、禁用|loading, error|
|close-button|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|disclosure|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|disclosure-group|default, hover, focus, disabled, loading, error|单项展开、多项展开|disabled, loading, error|
|checkbox-group|default, hover, focus, disabled, loading, error|默认、已选择、错误、禁用|loading|
|color-area|default, hover, focus, disabled, loading, error|蓝色、绿色、红色|disabled, loading, error|
|color-field|default, hover, focus, disabled, loading, error|蓝色、绿色、红色|disabled, loading, error|
|color-picker|default, hover, focus, disabled, loading, error|蓝色、绿色、红色|disabled, loading, error|
|color-slider|default, hover, focus, disabled, loading, error|蓝色、绿色、红色|disabled, loading, error|
|color-swatch|default, hover, focus, disabled, loading, error|蓝色、绿色、红色|disabled, loading, error|
|color-swatch-picker|default, hover, focus, disabled, loading, error|品牌色、状态色|disabled, loading, error|
|input-group|default, hover, focus, disabled, loading, error|网址、金额|disabled, loading, error|
|input-otp|default, hover, focus, disabled, loading, error|六位、四位、禁用|loading, error|
|kbd|default, hover, focus, disabled, loading, error|复制、搜索|disabled, loading, error|
|link|default, hover, focus, disabled, loading, error|站内、外部|disabled, loading, error|
|list-box|default, hover, focus, disabled, loading, error|单选、多选|disabled, loading, error|
|meter|default, hover, focus, disabled, loading, error|正常、偏高、临界|disabled, loading, error|
|modal|default, hover, focus, disabled, loading, error|信息、确认|disabled, loading, error|
|number-field|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|progress-bar|default, hover, focus, disabled, loading, error|进行中、已完成|disabled, loading, error|
|progress-circle|default, hover, focus, disabled, loading, error|进行中、已完成|disabled, loading, error|
|range-calendar|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|scroll-shadow|default, hover, focus, disabled, loading, error|紧凑、较高|disabled, loading, error|
|search-field|default, hover, focus, disabled, loading, error|空值、已输入、禁用|loading, error|
|separator|default, hover, focus, disabled, loading, error|横向、纵向|disabled, loading, error|
|skeleton|default, hover, focus, disabled, loading, error|文本、卡片|disabled, loading, error|
|spinner|default, hover, focus, disabled, loading, error|小、中、大|disabled, loading, error|
|surface|default, hover, focus, disabled, loading, error|默认、弱背景|disabled, loading, error|
|tag-group|default, hover, focus, disabled, loading, error|只读、可移除|disabled, loading, error|
|time-field|default, hover, focus, disabled, loading, error|默认、禁用|loading, error|
|toggle-button|default, hover, focus, disabled, loading, error|未选中、已选中、禁用|loading, error|
|toggle-button-group|default, hover, focus, disabled, loading, error|单选、多选|disabled, loading, error|
|toolbar|default, hover, focus, disabled, loading, error|格式、对齐|disabled, loading, error|
