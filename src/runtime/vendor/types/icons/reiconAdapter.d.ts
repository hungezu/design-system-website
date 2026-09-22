import type { IconComponent } from 'reicon-react';
import type { IconWeight } from './iconGrammar';
export declare const REICON_SOURCE: "reicon";
export declare const REICON_SOURCE_VERSION = "reicon-react@1.2.5";
export declare const REICON_LICENSE = "MIT";
/** 经过批准的 missing 占位图标（未知 id 的兜底，不静默显示错误图形） */
export declare const MISSING_PLACEHOLDER_ICON = "help";
/** 平台 weight（小写）→ Reicon 官方 weight（首字母大写） */
export declare function toReiconWeight(weight: IconWeight): 'Outline' | 'Filled';
/** 语义 id 是否已接入 Adapter */
export declare function adapterHas(id: string): boolean;
/** 取得语义 id 对应的 Reicon 组件；未知 id 返回 missing 占位 */
export declare function adapterGet(id: string): IconComponent;
/** Adapter 全部已接入语义 id（供 Registry 完整性对账） */
export declare function adapterIds(): string[];
/** 反查（仅供资源中心展示来源，不用于业务调用） */
export declare function reiconNameOf(id: string): string | null;
