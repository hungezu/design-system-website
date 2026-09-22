import type { ProjectIconPackRecord } from '../types';
/**
 * Registry 1.0.0 发布时的项目默认图标快照。
 * 未配置或仍在编辑中的 Pack 只能回退到这份固定集合，不能随着平台
 * Registry 新增 published 图标而静默扩容。
 */
export declare const LEGACY_DEFAULT_ICON_PACK_IDS: readonly ["add", "edit", "delete", "search", "refresh", "close", "clear-input", "remove-item", "confirm", "more", "chevron-up", "chevron-down", "chevron-left", "chevron-right", "arrow-left", "arrow-right", "menu", "home", "sort", "sort-ascending", "sort-descending", "filter", "column-settings", "pagination-first", "pagination-previous", "pagination-next", "pagination-last", "success", "warning", "error", "info", "loading", "user", "users", "role", "permission", "settings", "notification", "help", "lock", "unlock", "calendar", "upload", "download", "eye", "eye-off"];
export interface PackValidation {
    ok: boolean;
    errors: string[];
    /** Pack 中实际可用的 published id（过滤掉历史中已降级的图标） */
    validIds: string[];
}
export declare function emptyIconPack(): ProjectIconPackRecord;
/** 校验 Pack：全部 id 必须 published（deprecated 条目提示替换，非 published 报错） */
export declare function validateIconPack(pack: ProjectIconPackRecord): PackValidation;
export declare function addCustomIconToPack(pack: ProjectIconPackRecord, icon: NonNullable<ProjectIconPackRecord['customIcons']>[number]): {
    pack: ProjectIconPackRecord;
    error?: string;
};
/** 加入图标（锁定时拒绝；非 published 拒绝；重复幂等） */
export declare function addIconToPack(pack: ProjectIconPackRecord, id: string): {
    pack: ProjectIconPackRecord;
    error?: string;
};
/** 从项目移除图标（同步清理例外记录） */
export declare function removeIconFromPack(pack: ProjectIconPackRecord, id: string): {
    pack: ProjectIconPackRecord;
    error?: string;
};
/** 确认 Pack（校验通过才允许；confirmed + 锁定可选） */
export declare function confirmIconPack(pack: ProjectIconPackRecord, opts?: {
    locked?: boolean;
    now?: string;
}): {
    pack: ProjectIconPackRecord;
    error?: string;
};
/** 项目默认 Pack：未配置/未确认时回退到 Registry 1.0.0 固定快照，不随平台发布静默扩容。 */
export declare function packIconIdsOrFallback(pack: ProjectIconPackRecord | undefined): {
    ids: string[];
    fallback: boolean;
    source: 'project-confirmed' | 'registry-1.0.0-baseline';
};
