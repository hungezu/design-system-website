import type { SelectRecipeMeta, SelectRecipeRecord, VisualConfig } from '../types';
/** 默认 Recipe：跟随视觉变量（圆角取 radiusSm；弹层取 radiusMd） */
export declare function defaultSelectRecipe(v: VisualConfig): SelectRecipeMeta;
/** 双主题验证 · 方案 A：小圆角 / 线框触发器 / 紧凑选项（线性视觉） */
export declare const TEST_SELECT_RECIPE_A: SelectRecipeMeta;
/** 双主题验证 · 方案 B：大圆角 / 浅底触发器 / 宽松选项（面性视觉倾向） */
export declare const TEST_SELECT_RECIPE_B: SelectRecipeMeta;
/**
 * Recipe → CSS 变量（造型层；颜色不在此出现，由组件 CSS 引用语义 Token）。
 * 高度不在 Recipe 中：trigger 高度读 --bds-ctrl-sm/md/lg（共享控件尺寸 Token）。
 */
export declare function selectRecipeToCssVars(recipe: SelectRecipeMeta): Record<string, string>;
export declare function makeSelectRecipeRecord(value: SelectRecipeMeta, opts?: {
    source?: string;
    confirmedFields?: string[];
    status?: SelectRecipeRecord['status'];
    locked?: boolean;
    now?: string;
}): SelectRecipeRecord;
