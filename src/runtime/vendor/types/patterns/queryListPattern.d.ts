import type { Scheme } from '../types';
export type PatternFieldSourceType = 'design-image-observation' | 'figma-structure' | 'platform-default' | 'designer-override';
export interface PatternFieldValue<T = number | string | boolean> {
    value: T;
    sourceType: PatternFieldSourceType;
    sourceRef: string;
    /** 0-1：图片观察 / 文档读取的置信度 */
    confidence: number;
    status: 'candidate' | 'confirmed';
    locked: boolean;
    confirmedAt: string | null;
}
export interface QueryListLayout {
    pageContentMaxWidth: PatternFieldValue<number>;
    pagePaddingX: PatternFieldValue<number>;
    pagePaddingY: PatternFieldValue<number>;
    sectionGap: PatternFieldValue<number>;
    headerGap: PatternFieldValue<number>;
    headerActionAlignment: PatternFieldValue<'start' | 'end' | 'space-between'>;
    contentContainerMode: PatternFieldValue<'card' | 'plain'>;
    contentPadding: PatternFieldValue<number>;
    contentRadiusRole: PatternFieldValue<'radius.container' | 'none'>;
}
export interface QueryListFilter {
    displayMode: PatternFieldValue<'grid' | 'flow'>;
    columns: PatternFieldValue<number>;
    rowGap: PatternFieldValue<number>;
    columnGap: PatternFieldValue<number>;
    fieldWidthMode: PatternFieldValue<'fill' | 'fixed'>;
    fieldMinWidth: PatternFieldValue<number>;
    fieldMaxWidth: PatternFieldValue<number>;
    labelPlacement: PatternFieldValue<'top' | 'left'>;
    actionPlacement: PatternFieldValue<'inline' | 'row'>;
    actionAlignment: PatternFieldValue<'start' | 'end'>;
    collapsible: PatternFieldValue<boolean>;
    defaultVisibleRows: PatternFieldValue<number>;
    backgroundRole: PatternFieldValue<'surface.subtle' | 'surface.card' | 'none'>;
    padding: PatternFieldValue<number>;
    radiusRole: PatternFieldValue<'radius.container' | 'none'>;
    /** 筛选字段 Label 的 Typography 角色（Pattern 只绑定角色，不改字号 / 字重 / 颜色） */
    fieldLabelTypographyRole: PatternFieldValue<'formLabel'>;
}
export interface QueryListResults {
    headerAlignment: PatternFieldValue<'space-between' | 'start'>;
    titleActionGap: PatternFieldValue<number>;
    tableGap: PatternFieldValue<number>;
    paginationAlignment: PatternFieldValue<'start' | 'center' | 'end' | 'space-between'>;
    paginationGap: PatternFieldValue<number>;
    /** 分页单行规则：Desktop / Tablet「总数 | 首页 | 上一页 | 页码 | 下一页 | 末页 | 每页条数」不换行 */
    paginationSingleLine: PatternFieldValue<boolean>;
    /** Compact 收敛模式：缩短页码窗口 → 必要时隐藏首页 / 末页，保留上一页 / 当前页 / 下一页 */
    paginationCompactMode: PatternFieldValue<'window-shrink-then-hide-boundary' | 'wrap' | 'stack'>;
    minTableWidth: PatternFieldValue<number>;
    overflowStrategy: PatternFieldValue<'scroll' | 'wrap'>;
    backgroundRole: PatternFieldValue<'surface.card' | 'none'>;
    padding: PatternFieldValue<number>;
    /** 结果标题的 Typography 角色（独立元素，摘要不嵌套继承） */
    sectionTitleTypographyRole: PatternFieldValue<'sectionTitle'>;
    /** 结果摘要的 Typography 角色（独立于标题，不继承标题字重） */
    sectionMetaTypographyRole: PatternFieldValue<'sectionMeta'>;
}
export interface QueryListResponsive {
    /** 响应式断点（px）：≤ tablet 进入平板档；≤ compact 进入紧凑档 */
    breakpoints: {
        tablet: PatternFieldValue<number>;
        compact: PatternFieldValue<number>;
    };
    desktop: {
        filterColumns: PatternFieldValue<number>;
        actionsWrap: PatternFieldValue<boolean>;
        paginationAlignment: PatternFieldValue<'start' | 'center' | 'end' | 'space-between'>;
        contentMaxWidth: PatternFieldValue<number>;
    };
    tablet: {
        filterColumns: PatternFieldValue<number>;
        actionsWrap: PatternFieldValue<boolean>;
        tableOverflow: PatternFieldValue<'scroll' | 'wrap'>;
    };
    compact: {
        filterColumns: PatternFieldValue<number>;
        actionsFullWidth: PatternFieldValue<boolean>;
        tableMinWidth: PatternFieldValue<number>;
        paginationWrap: PatternFieldValue<'wrap' | 'stack'>;
    };
}
export interface ProjectQueryListPattern {
    patternId: 'query-list';
    /** 整体状态：全部字段 confirmed 才可为 confirmed */
    status: 'candidate' | 'review' | 'confirmed';
    source: string;
    confirmedAt: string | null;
    locked: boolean;
    layout: QueryListLayout;
    filter: QueryListFilter;
    results: QueryListResults;
    responsive: QueryListResponsive;
}
/** 平台默认（全部 platform-default / candidate）：不包含任何项目专属值 */
export declare function platformDefaultQueryListPattern(): ProjectQueryListPattern;
/**
 * GKX（guokexin）查询列表 Pattern 候选：
 * - 布局数值来源：DESIGN.md（Layout 章节：内容最大宽度 1160px、默认内边距
 *   50/44/72、间距基线 4/8/12/16/24、断点 1050/820/620、Table 容器内滚动、
 *   任务顺序「筛选 → 操作 → 表格 → 分页」）与 1440 真实截图观察；
 * - 仅作为候选：确认（confirmQueryListPattern）后才可进入正式发布；
 * - 截图（单一 1440 档）无法证明 tablet / compact 的行为 → 标记
 *   platform-default（断点数值本身来自 DESIGN.md 记录）。
 */
export declare function gkxQueryListPatternCandidate(): ProjectQueryListPattern;
/**
 * 测试客户 B 的 Pattern（明确标注测试用途）：
 * 与 GKX 排版刻意不同（筛选两列 / 分页居中 / plain 容器 / 顶部对齐页头），
 * 用于验证「切换项目 = 排版变化，而非只换颜色」；不冒充真实客户规范。
 */
export declare function testQueryListPatternCandidate(): ProjectQueryListPattern;
/** Draft 修复完成后进入 Review；Review 不得编译为发布产物。 */
export declare function markQueryListPatternForReview(pattern: ProjectQueryListPattern, opts: {
    now: string;
    by: string;
}): ProjectQueryListPattern;
/** 确认 Pattern：全部字段 → confirmed（记录确认时间）；可选锁定 */
export declare function confirmQueryListPattern(pattern: ProjectQueryListPattern, opts: {
    locked: boolean;
    confirmedAt: string;
    by: string;
}): ProjectQueryListPattern;
/** 解锁：整体与全部字段解除锁定（字段保持已确认状态；再次修改将回到候选） */
export declare function unlockQueryListPattern(pattern: ProjectQueryListPattern): ProjectQueryListPattern;
/** 修改单个字段（锁定时拒绝；保持候选状态与来源链） */
export declare function setPatternField(pattern: ProjectQueryListPattern, group: 'layout' | 'filter' | 'results', key: string, value: number | string | boolean, sourceType: PatternFieldSourceType, sourceRef: string): {
    ok: true;
    pattern: ProjectQueryListPattern;
} | {
    ok: false;
    error: string;
};
export interface PatternFieldStats {
    total: number;
    confirmed: number;
    candidate: number;
    bySource: Record<string, number>;
}
/** 收集全部字段（含嵌套 responsive）用于统计 / 确认判断 */
export declare function collectPatternFields(pattern: ProjectQueryListPattern): Array<{
    path: string;
    f: PatternFieldValue;
}>;
export declare function isPatternFullyConfirmed(pattern: ProjectQueryListPattern): boolean;
export declare function patternFieldStats(pattern: ProjectQueryListPattern): PatternFieldStats;
/** Pattern 配置确定性 checksum（排序字段值序列化；改间距 → 变化） */
export declare function queryListPatternChecksum(pattern: ProjectQueryListPattern): string;
/** 从 Scheme 读取项目 Pattern（未配置 → null，不自动应用候选） */
export declare function projectQueryListPatternOf(scheme: Scheme): ProjectQueryListPattern | null;
