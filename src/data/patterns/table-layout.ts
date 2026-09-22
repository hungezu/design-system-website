/** Layout and state contract shared by examples, frozen metadata and generated design Markdown. */
export const TABLE_LAYOUT_CONTRACT = {
  schema: 'table-layout/1',
  order: ['filters', 'toolbar', 'bulk-actions', 'table', 'pagination', 'feedback'],
  pagination: { placement: 'below-table', controlsAlign: 'right-edge', totalAlign: 'left-edge', totalContent: 'count-only', totalInsetToken: 'spacing-8', controlHeightToken: 'pagination-control-height', gapToken: 'spacing-16', hiddenWhenEmpty: true, disabledWhileLoading: true },
  selection: { column: 'first', boxSize: 16, markViewport: 12, headerScope: 'current-page', persistentScopeHint: false, acrossPages: 'retain-within-query', onFilterChange: 'clear', allResultsAction: 'explicit-counted-action' },
  toolbar: { primaryActionAlign: 'left', actionOrder: 'importance-then-frequency', rowActionInlinePadding: 0, rowActionColumnWidth: 'content', rowActionEndPadding: 16, fixedActionShadowToken: 'shadow-table-fixed', bulkBackgroundToken: 'surface-secondary', bulkActionsSeparate: true, bulkVisibleWhen: 'selected-count-positive', rowActions: 'last-column' },
  narrow: { tableScroll: 'inside-container', selectionSticky: 'left', actionsSticky: 'right', fixedActionShadowWhen: 'horizontal-overflow', paginationWrap: true, paginationAlign: 'right' },
  composition: { footer: 'same-surface-outside-scroll', variants: ['primary','secondary'], groupedHeaders: 'recursive-children', leafWidth: 'shared-with-body', groupedHeaderAlign: 'center', leafHeaderRowSpan: 'remaining-depth', fixedColumns: 'contiguous-edges' },
} as const
export const TABLE_LAYOUT_RULES = [
  '表格外层圆角使用 radius-table（默认 6px），内容区圆角为外层减 2px、最小 0px；独立于控件圆角和普通容器圆角，支持项目覆盖并随版本冻结。',
  '组件预览、业务模板和交付示例复用同一 DSTable、DSCheckbox 与 DSPagination 实现；只调整外围布局，不另写表格、复选框或分页样式覆盖组件外观。',
  '筛选、普通工具栏、批量操作条、表格、分页、反馈依次排列；容器左右边界一致。',
  '通过 DSTable 的 footer 组合分页：表格滚动区与底部分页共享外层容器和圆角，分页在滚动区之外，不随宽表格横向滚动。页码与容量靠右，总条数靠左，不重复显示“当前页 / 总页数”；内部间距使用 spacing-16。旧包没有 footer 属性时才使用外部分页组合。',
  '分页总条数相对分页容器左边缘再内缩 spacing-8；页码、翻页按钮及每页条数触发器统一使用 pagination-control-height，默认 28px，不跟随大号表单控件放大。',
  '标准表格采用浅灰外层、白色内容区；轻量 variant=secondary 用于已有卡片或面板内，避免嵌套灰色容器。高密度数据用紧凑行高，阅读型数据用宽松行高，不通过挤压文字来容纳列。',
  '多级表头使用列的 children 描述层级，分组标题居中并横向合并全部子列；叶子表头跨行补齐剩余层数，正文始终只按叶子列顺序输出。表头与正文共用列宽，使用中性分隔线说明归属。',
  '排序只挂在叶子列，选择框跨完整表头高度。固定列必须连续放在两端；同一分组不得跨固定区和滚动区，应整组固定或把固定列放在分组外。横向滚动时整组关系保持完整，纵向固定时整块多级表头一起停留。',
  '全选复选框放在表头最左列，与每行复选框同列、同中心；框体默认 16px，勾选图形占 12px 视口，半选短横水平垂直居中。',
  '用复选框的无障碍名称“全选当前页”表达范围，不在表格上方常驻说明文字；全选仅作用于当前页可选行，半选表示本页部分选中。不得把本页全选伪装为全部筛选结果。',
  '同一筛选范围翻页保留已选项，并说明其他页数量；筛选改变时清空选择并回到第一页。跨页全选使用独立的“选择全部 N 项”入口。',
  '新增等普通操作在表格上方工具栏左侧，从左到右按重要性、使用频率由高到低排列，危险及低频操作靠后；选中数量、批量操作、取消选择放在独立批量条，选中数量大于零才显示，不混在新增按钮旁。批量条使用中性浅灰 surface-secondary，不使用品牌色背景。',
  '行操作置于最后一列；文字按钮 margin、左右 padding 和左右透明边框宽度为 0，文字起点与“操作”表头对齐，按钮间距由容器 gap 控制；高频操作控制在 1–2 个，低频操作进入更多菜单。不要让操作按钮点击同时改变行选择。',
  '操作列按实际内容宽度收紧，同一列的表头与各行统一宽度，最后一个操作后仅保留 16px；仅表格实际存在横向溢出时，固定操作列才使用 shadow-table-fixed 阴影。内容完全放得下时不显示阴影；窗口或内容变化后重新判断。固定列层级高于滚动内容，背景不透出下层文字。',
  '无批量任务或只读场景不展示选择列；无数据时全选禁用且隐藏分页。加载或执行批量操作时禁用全选、行选择及分页，避免处理范围变化。',
  '批量执行前明确对象和数量，需要确认的操作先确认；部分失败保留失败项选择并逐项说明，成功删除的记录从选择集合移除。',
  '从表格进入编辑表单时，取消与保存放在表单末端右侧，顺序为取消在左、保存在右；确认弹窗同样把安全退出放在确认动作之前。',
  '窄屏只让表格在自己的容器滚动；选择列固定左侧、操作列固定右侧。分页可换行，总数可独立一行，页码与页容量仍靠右，不居中或被截断。',
] as const
export function tableLayoutMarkdown(contract: unknown): string {
  if (!contract || typeof contract !== 'object' || !('schema' in contract) || contract.schema !== TABLE_LAYOUT_CONTRACT.schema) return '本版本没有冻结表格布局合同。先核对匹配组件包及业务页面约定，不把最新布局规则当作此旧版已实现的事实。'
  const captured = contract as { rules?: unknown }
  return Array.isArray(captured.rules) ? captured.rules.filter((rule): rule is string => typeof rule === 'string').map((rule,index)=>`${index+1}. ${rule}`).join('\n') : '此版本的表格规则缺失，需补充确认。'
}
