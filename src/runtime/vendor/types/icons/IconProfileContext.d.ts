import React from 'react';
import type { IconSizeToken, IconWeight } from './iconGrammar';
export interface IconProfileContextValue {
    /** 项目默认变体（发布 Profile 确认值） */
    defaultWeight: IconWeight;
    /** 项目默认尺寸 Token */
    defaultSize: IconSizeToken;
    /** Outline 线宽；Filled 不应用 */
    strokeWidth?: 1.5 | 2 | 2.5;
    /** 本发布范围内可用的 published 图标语义 id（icons.json publishedIcons） */
    allowedIconIds: readonly string[];
    /** 项目 Icon Pack 版本（manifest.iconPack.version） */
    iconPackVersion: string;
    /** Profile 来源：manifest.iconPack（schema v2）或回退默认（schema v1 无 iconPack） */
    source: 'manifest' | 'fallback';
    customIcons?: Record<string, {
        outline: string;
        filled: string;
    }>;
}
/** 回退 Profile（schema v1 / 无 iconPack / Provider 未注入） */
export declare const FALLBACK_ICON_PROFILE: IconProfileContextValue;
export declare const IconProfileProvider: React.Provider<IconProfileContextValue>;
/** 读取当前项目 Icon Profile（未注入时返回回退默认 outline/md） */
export declare function useIconProfile(): IconProfileContextValue;
