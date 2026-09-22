export interface PatternSlot {
    id: string;
    name: string;
    description: string;
}
export interface PatternDefinition {
    /** 平台稳定模式 id */
    id: string;
    name: string;
    description: string;
    /** 适用的页面类型（PageGenerationRequest.pageType） */
    applicablePageTypes: string[];
    requiredSlots: PatternSlot[];
    optionalSlots: PatternSlot[];
    /** 依赖的 Runtime 组件 id（Registry 唯一权威） */
    requiredComponents: string[];
    /** 支持的区域语义角色（layoutRegions.role） */
    supportedRegions: string[];
    /** 组合引用的子 Pattern id（Query List → Filter/ActiveFilters/Toolbar/Bulk） */
    composes?: string[];
    status: 'published' | 'planned';
    /** 平台模式语义版本（与项目 Pattern 配置版本区分） */
    version: string;
}
export declare const QUERY_FILTER_PATTERN: PatternDefinition;
export declare const ACTIVE_FILTERS_PATTERN: PatternDefinition;
export declare const ADVANCED_FILTER_PATTERN: PatternDefinition;
export declare const TABLE_TOOLBAR_PATTERN: PatternDefinition;
export declare const BULK_ACTIONS_PATTERN: PatternDefinition;
/** 查询列表页槽位（10 项） */
export declare const QUERY_LIST_SLOTS: PatternSlot[];
export declare const QUERY_LIST_PATTERN: PatternDefinition;
/** 全量注册表（planned 条目不进入发布编译，只在资源中心展示） */
export declare const PATTERN_REGISTRY: readonly PatternDefinition[];
export declare function getPattern(id: string): PatternDefinition | null;
export declare function patternSlotIds(p: PatternDefinition): string[];
/** Pattern 双分组（资源中心导航 / Catalog 消费） */
export declare const PATTERN_GROUPS: {
    id: 'query-filter-group' | 'data-list-group';
    label: string;
    patternIds: string[];
}[];
