export declare const ICON_CATEGORY_IDS: readonly ["actions", "navigation", "data", "filtering", "files", "users", "status", "time", "editing", "media", "system", "layout"];
export type IconCategory = (typeof ICON_CATEGORY_IDS)[number];
export interface IconRegistryExpansionSeed {
    id: string;
    reiconName: string;
    nameZh: string;
    nameEn: string;
    category: IconCategory;
}
/**
 * 首批 B 端扩充候选：真实图形均来自 reicon-react，进入 Registry 时保持
 * candidate，等待人工审批后才允许业务调用或加入项目 Icon Pack。
 */
export declare const ICON_REGISTRY_EXPANSION_SEEDS: readonly IconRegistryExpansionSeed[];
export declare const ICON_CATEGORY_COPY: Record<IconCategory, {
    label: string;
    intent: string;
    contexts: string[];
    forbidden: string[];
}>;
