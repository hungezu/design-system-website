import type { VisualConfig, InputRecipeMeta, TableRecipeMeta, PaginationRecipeMeta, DialogRecipeMeta, ComponentRecipeRecord } from '../types';
export declare function defaultInputRecipe(v: VisualConfig): InputRecipeMeta;
export declare function inputRecipeToCssVars(r: InputRecipeMeta): Record<string, string>;
export declare function defaultTableRecipe(v: VisualConfig): TableRecipeMeta;
export declare function tableRecipeToCssVars(r: TableRecipeMeta): Record<string, string>;
export declare function defaultPaginationRecipe(v: VisualConfig): PaginationRecipeMeta;
export declare function paginationRecipeToCssVars(r: PaginationRecipeMeta): Record<string, string>;
export declare function defaultDialogRecipe(v: VisualConfig): DialogRecipeMeta;
export declare function dialogRecipeToCssVars(r: DialogRecipeMeta): Record<string, string>;
/** 通用 Recipe 记录构造（与 Button/Select 同构） */
export declare function makeComponentRecipeRecord<T>(value: T, opts?: {
    source?: string;
    confirmedFields?: string[];
    status?: ComponentRecipeRecord<T>['status'];
    locked?: boolean;
    now?: string;
}): ComponentRecipeRecord<T>;
