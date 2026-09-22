import type { InteractionColorPreset, InteractionColorKind, InteractionStateLevels } from '../../types';
export declare const TDESIGN_REFERENCE_VERSION = "tdesign-react@1.18.3\uFF08Token \u57FA\u51C6\uFF1A_light.less \u4E0E\u7EC4\u4EF6 CSS\uFF09";
export declare const TDESIGN_SOURCE_URLS: readonly ["https://tdesign.tencent.com/design/color", "https://github.com/Tencent/tdesign", "https://www.npmjs.com/package/tdesign-react/v/1.18.3"];
/**
 * TDesign Web 官方浅色主题色板（tdesign-react@1.18.3 _light.less 逐值抄录）。
 * 用于「官方值 vs 项目值」对照与测试逐值断言；自定义种子时项目色阶由
 * tvision-color 重新生成，官方值仍作为对照基准展示。
 */
export declare const OFFICIAL_SCALES: Record<InteractionColorKind, string[]>;
/** 官方全局语义 Token 名（级位 → --td-xxx-color-N） */
export declare function officialTokenName(kind: InteractionColorKind, level: number): string;
/** 官方状态语义 Token 名（--td-xxx-color-hover / -active / -focus / -disabled / -light / -light-hover） */
export declare function officialStateTokenName(kind: InteractionColorKind, state: keyof InteractionStateLevels): string;
/**
 * TDesign Web 交互颜色预设：全部状态为「固定级位」映射（与官方
 * _light.less 中的语义定义逐条一致）。对比度不足时不自动换向、
 * 不自动改色，由 a11y 报告如实标记，设计师确认覆盖后留档。
 */
export declare const TDESIGN_WEB_PRESET: InteractionColorPreset;
/** 平台当前启用的交互颜色预设（版本化；未来接入其他预设时在此切换，不允许混用） */
export declare const ACTIVE_INTERACTION_PRESET: InteractionColorPreset;
/** 平台语义 Token key：brand → action.primary.* / surface.brand.*；功能色 → feedback.<kind>.* */
export declare function platformSemanticKey(kind: InteractionColorKind, state: keyof InteractionStateLevels): string;
export interface ComponentColorMapping {
    /** 组件分组（Button / Input 与 Select / Menu 与 Tabs / Table / Alert 与 Tag） */
    group: string;
    /** 组件与部位（如「Button · primary 背景」） */
    part: string;
    /** 官方 Token（名称与值语义，如 --td-brand-color-hover → brand-6） */
    officialToken: string;
    /** 官方来源（文件 + 选择器，可复核） */
    officialSource: string;
    /** 平台 Token（语义 / 组件 Token key） */
    platformToken: string;
    state: string;
    /** 映射关系是否与官方完全一致（级位 / 引用同源） */
    identical: boolean;
    /** 有意差异与原因（identical=false 时必填） */
    differenceNote?: string;
}
export declare const COMPONENT_COLOR_ADAPTERS: ComponentColorMapping[];
/** 适配表分组顺序（UI 展示用） */
export declare const ADAPTER_GROUPS: readonly ["Button", "Input / Select", "Menu / Tabs", "Table", "Alert / Tag"];
