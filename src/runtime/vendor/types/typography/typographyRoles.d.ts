import type { Scheme } from '../types';
export type TypographyRoleName = 'pageTitle' | 'pageDescription' | 'sectionTitle' | 'sectionMeta' | 'formLabel' | 'formValue' | 'formPlaceholder' | 'formDescription' | 'formError' | 'tableHeader' | 'tableCell' | 'paginationText';
export interface TypographyRole {
    /** 基础字体 Token（--bds-fs-*） */
    fontSize: string;
    /** 字重（TDesign：Regular 400 / Semibold 600） */
    fontWeight: string;
    /** 行高（px；TDesign 规则 line-height = font-size + 8px） */
    lineHeight: string;
    /** 语义颜色 Token 白名单（--bds-text-* 等；colorRef 的 CSS 变量形态） */
    colorToken: string;
    /** 语义颜色引用（Semantic Token 名，tokens.json 溯源用） */
    colorRef: string;
    /** 数值来源（规范引用） */
    source: string;
    /** 确认状态：TDesign 字体规范为平台确认基线 */
    status: 'platform-confirmed' | 'project-override';
    /** 平台基线角色锁定（项目只能覆盖映射，不能改变平台基线定义） */
    locked: boolean;
    /** 使用场景说明 */
    usage: string;
}
/** 基础字体 Token 白名单（角色只允许引用这些决定字号）：TDesign 字阶 12/14/16/20/24/28 */
export declare const TYPOGRAPHY_SIZE_TOKENS: readonly ["--bds-fs-caption", "--bds-fs-body", "--bds-fs-h3", "--bds-fs-h2", "--bds-fs-h1", "--bds-fs-display"];
/** 语义颜色 Token 白名单（TDesign 字体颜色：primary/secondary/placeholder/disabled + 组件语义） */
export declare const TYPOGRAPHY_COLOR_TOKENS: readonly ["--bds-text-primary", "--bds-text-secondary", "--bds-text-placeholder", "--bds-text-disabled", "--bds-danger", "--bds-field-text", "--bds-field-placeholder", "--bds-table-text"];
/** 平台默认角色（TDesign 字阶 × 语义颜色；不含项目数值；GKX 与测试项目共用同一基线） */
export declare const TYPOGRAPHY_ROLES: Record<TypographyRoleName, TypographyRole>;
export declare const TYPOGRAPHY_ROLE_NAMES: TypographyRoleName[];
export declare const TDESIGN_TYPOGRAPHY_BASELINE: {
    readonly fontSizeCaption: 12;
    readonly fontSizeBody: 14;
    readonly fontSizeH3: 16;
    readonly fontSizeH2: 20;
    readonly fontSizeH1: 24;
    readonly fontSizeDisplay: 28;
    readonly fontWeightBold: 600;
};
export type TypographyValidationStatus = 'platform-default' | 'project-override' | 'legacy-mismatch' | 'invalid';
export interface TypographyValidationItem {
    key: keyof typeof TDESIGN_TYPOGRAPHY_BASELINE;
    current: number | undefined;
    target: number;
    status: TypographyValidationStatus;
    pass: boolean;
}
/** 验证 Scheme 的最终解析值，不只检查 Token 名称。 */
export declare function validateTypographySystem(scheme: Scheme): {
    ok: boolean;
    strictMode: boolean;
    items: {
        key: "fontSizeH1" | "fontSizeH2" | "fontSizeH3" | "fontSizeBody" | "fontSizeCaption" | "fontSizeDisplay" | "fontWeightBold";
        current: number;
        target: number;
        status: TypographyValidationStatus;
        pass: boolean;
    }[];
    roleErrors: any[];
    resolved: {
        [k: string]: {
            fontSize: string;
            lineHeight: string;
            fontWeight: string;
            color: string;
            colorToken: string;
            status: "platform-confirmed" | "project-override";
        };
    };
};
/** 角色 → kebab（变量 / class 后缀） */
export declare function roleKebab(name: string): string;
/** 合并项目覆盖（值仍须通过 Token 白名单校验；覆盖即 project-override） */
export declare function resolveTypographyRoles(overrides?: Partial<Record<TypographyRoleName, Partial<TypographyRole>>> | null): {
    ok: true;
    roles: Record<TypographyRoleName, TypographyRole>;
} | {
    ok: false;
    error: string;
};
/** 校验平台默认角色（测试用：无 HEX / 引用白名单 Token / TDesign 行高规则） */
export declare function typographyRolesValid(roles?: Record<TypographyRoleName, TypographyRole>): string[];
/**
 * 角色编译为 CSS 片段（tokens.css 追加）：
 * - 每角色 4 个变量（--bds-typo-{role}-{size|weight|lh|color}，
 *   供伪元素 / 组件引用）；
 * - 每角色一个语义类 .bds-typo-{role}（页面 / 组件直接挂类）。
 */
export declare function typographyRolesCss(roles: Record<TypographyRoleName, TypographyRole>): string;
