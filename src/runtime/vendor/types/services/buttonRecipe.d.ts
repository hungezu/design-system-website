import type { ButtonRecipeMeta, ButtonRecipeRecord, ButtonSecondaryStyle, Scheme, VisualConfig } from '../types';
/** 默认 Recipe：跟随视觉变量（radius 取 radiusSm；图标尺寸取控件高度） */
export declare function defaultButtonRecipe(v: VisualConfig): ButtonRecipeMeta;
/** 测试方案 A：secondary = 线框 · 小圆角 · 紧凑间距（明确标注：非正式规范） */
export declare const TEST_RECIPE_A: ButtonRecipeMeta;
/** 测试方案 B：secondary = 浅色填充 · 大圆角 · 宽松间距（明确标注：非正式规范） */
export declare const TEST_RECIPE_B: ButtonRecipeMeta;
export declare const RECIPE_TEST_LABELS: Record<string, string>;
export type ButtonSemanticVariant = 'primary' | 'secondary' | 'tertiary';
/**
 * 解析业务传入的 variant：
 * - 语义值直接通过；
 * - 旧视觉值（secondary-outline / secondary-soft）映射为 secondary，
 *   并返回 legacyStyle 供渲染层保持其显式视觉（旧数据 / 旧调用不失效）。
 */
export declare function resolveButtonVariant(variant: string): {
    variant: ButtonSemanticVariant;
    legacyStyle: ButtonSecondaryStyle | null;
};
/**
 * 把 Recipe 翻译为按钮造型 CSS 变量。
 * 颜色一律以 var() 引用既有色彩 Token（色彩系统 / 视觉变量），
 * Recipe 中不出现任何 HEX（soft 系背景沿用色彩系统派生 Token）。
 *
 * secondary 状态变量按风格完全分离（outLined 与 soft 互不影响）：
 * - outlined：背景三态恒为表面色；Hover / Pressed 只改文字与边框
 *   （品牌交互色 / 品牌 pressed 色；danger 用 error 状态色），
 *   不使用浅色填充、soft 背景 Token 或 error light；
 * - soft：边框透明；Hover / Pressed 只改背景（subtle → subtleHover → 更明确浅色）。
 */
export declare function recipeToCssVars(recipe: ButtonRecipeMeta): Record<string, string>;
export interface RecipeMigrateResult {
    changed: boolean;
    fixes: string[];
}
/**
 * 旧方案数据迁移：
 * - 页面/布局树中 button 绑定的 sampleProps.variant 旧视觉值 → 语义值 secondary
 *   （外观改由 Recipe 决定；默认 Recipe 的 secondary 为线框，与旧默认一致）；
 * - button 组件决策的组合键 secondary-outline/-soft+X → secondary+X
 *   （同语义冲突时 allowed 任一为 true 则 true，保持迁移后组合可用，并提示复核）。
 * 只改写可靠识别的旧值，不动其他数据。
 */
export declare function migrateButtonVariants(scheme: Scheme): RecipeMigrateResult;
export declare function makeRecipeRecord(value: ButtonRecipeMeta, opts?: {
    source?: string;
    confirmedFields?: string[];
    status?: ButtonRecipeRecord['status'];
    locked?: boolean;
    now?: string;
}): ButtonRecipeRecord;
