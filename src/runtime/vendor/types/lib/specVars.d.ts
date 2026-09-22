import type { ButtonRecipeMeta, ColorSystem, SelectRecipeMeta, VisualConfig } from '../types';
/** TDesign 字体栈（https://tdesign.tencent.com/design/fonts） */
export declare const TDESIGN_FONT_STACK = "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Hiragino Sans GB\", \"Microsoft YaHei UI\", \"Microsoft YaHei\", \"Source Han Sans CN\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\"";
/** TDesign 字体颜色（亮色固定规范值；暗色预留见 tdesignPalette） */
export declare const TDESIGN_TEXT_COLORS: {
    readonly primary: "rgba(0, 0, 0, 0.9)";
    readonly secondary: "rgba(0, 0, 0, 0.6)";
    readonly placeholder: "rgba(0, 0, 0, 0.4)";
    readonly disabled: "rgba(0, 0, 0, 0.26)";
};
export interface VarDef {
    key: string;
    name: string;
    value: string;
    group: string;
    usage: string;
    kind: 'color' | 'font' | 'number' | 'text';
}
export type FoundationMetricId = 'spacing' | 'radius' | 'shadow';
/**
 * Foundation 度量资源的唯一读取入口。
 * 数值直接取 cssVarMap（亦即 tokens.css 的编译来源），这里只维护展示名称与用途，
 * 避免资源中心另存一份 none/full 与 shadow level 的静态数值。
 */
export declare function foundationMetricCatalog(v: VisualConfig, id: FoundationMetricId): VarDef[];
/**
 * 按钮状态变量：优先读色彩系统 Token（Error 色阶 + 组件 Token，正式来源）；
 * 未生成时按同一预设级位从 Error 色阶确定性取值（error.6/5/7/3 等）。
 */
export declare function buttonStateVars(brandColor: string, cs?: ColorSystem | null, surfaceBg?: string, dangerSeed?: string): Record<string, string>;
export declare function cssVarMap(v: VisualConfig, cs?: ColorSystem | null, buttonRecipe?: ButtonRecipeMeta | null, selectRecipe?: SelectRecipeMeta | null, coreRecipes?: {
    input?: import('../types').InputRecipeMeta | null;
    table?: import('../types').TableRecipeMeta | null;
    pagination?: import('../types').PaginationRecipeMeta | null;
    dialog?: import('../types').DialogRecipeMeta | null;
} | null): Record<string, string>;
export declare function tableRowHeight(v: VisualConfig): number;
export declare function variableCatalog(v: VisualConfig): VarDef[];
