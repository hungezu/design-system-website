export interface IconGrammar {
    /** SVG 画布（Reicon viewBox 0 0 24 24） */
    canvas: 24;
    /** 安全区（B 端控件内建议留白） */
    safeArea: number;
    /** 支持的视觉重量：Reicon 真实双变体（人工绘制，非算法填充） */
    supportedWeights: ['outline', 'filled'];
    /** 默认尺寸 Token 名 */
    defaultSize: 'md';
    /** 允许的语义尺寸 Token */
    allowedSizes: ['xs', 'sm', 'md', 'lg'];
    /** 光学对齐说明（Reicon 资产内建 cap/join=round，按 24 网格居中） */
    opticalAlignment: string;
    /** 颜色模式：全部 path 使用 currentColor（随文本色继承） */
    colorMode: 'currentColor';
    /** 线宽策略：项目 Profile 可在 1.5 / 2 / 2.5 中选择，仅作用于 Outline */
    strokeWidthPolicy: string;
}
/** 平台 Icon Grammar（唯一实例，随核验记录冻结） */
export declare const ICON_GRAMMAR: IconGrammar;
export type IconWeight = 'outline' | 'filled';
export type IconSizeToken = 'xs' | 'sm' | 'md' | 'lg';
/** 图标尺寸 Token（CSS 变量名 → 默认 px；发布 tokens.css 注入） */
export declare const ICON_SIZE_TOKENS: Record<IconSizeToken, string>;
export declare const ICON_SIZE_DEFAULTS: Record<IconSizeToken, number>;
/** 项目级 Icon Profile（随发布确认冻结；允许单图标语义例外并记录来源） */
export interface ProjectIconProfile {
    family: 'reicon';
    /** 项目统一默认变体（页面未显式指定 weight 时使用） */
    defaultWeight: IconWeight;
    /** 项目默认尺寸 Token */
    defaultSize: IconSizeToken;
    /** 固定尺寸表；项目只能选择默认档，不改各档数值 */
    sizes?: {
        xs: 12;
        sm: 16;
        md: 20;
        lg: 24;
    };
    /** defaultWeight 的新命名；旧资产继续读取 defaultWeight */
    defaultVariant?: IconWeight;
    /** 仅作用于 Outline */
    strokeWidth?: 1.5 | 2 | 2.5;
    strokeLinecap?: 'round';
    strokeLinejoin?: 'round';
    colorMode?: 'currentColor';
    opticalCorrection?: boolean;
    registryVersion?: string;
    /** 线宽偏好说明（只作记录：不改变资产线宽） */
    strokePreference: string;
    status: 'candidate' | 'review' | 'confirmed';
    source: string;
    confirmedAt: string | null;
    locked: boolean;
}
/** 默认 Profile（未确认时发布回退，来源如实标注） */
export declare function defaultIconProfile(): ProjectIconProfile;
