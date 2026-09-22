import type { A11yCheckResult, ColorSystem, InteractionColorKind, InteractionStateLevels, PaletteToken, StateOverrideRecord, VisualConfig } from '../../types';
export declare const PALETTE_ENGINE = "tvision-color";
export declare const PALETTE_ENGINE_VERSION = "1.6.0";
export declare const PALETTE_STRATEGY_NAME: "tdesign-hct";
export declare const PALETTE_ALGORITHM_NOTE = "HCT \u8272\u5F69\u7A7A\u95F4\u6309\u8272\u76F8\u5206\u6BB5\u66F2\u7EBF\u751F\u6210\uFF08\u5F15\u64CE\u4E0E TDesign \u5B98\u65B9\u4E3B\u9898\u751F\u6210\u5668\u4E00\u81F4\uFF09\uFF1B\u4E2D\u6027\u8272\u4F7F\u7528\u56FA\u5B9A\u611F\u77E5\u4EAE\u5EA6\u5C42\u7EA7\uFF1B\u54C1\u724C\u503E\u5411\u7070\u4E3A\u54C1\u724C\u8272\u4E0E\u540C\u7EA7\u666E\u901A\u7070\u7684 RGB \u6DF7\u5408\u3002";
/** 中性色固定感知亮度层级（HCT tone，TDesign 官方） */
export declare const NEUTRAL_TONES: number[];
/** 功能色语义种子（TDesign 官方；不从品牌色推导，允许未来更换） */
export declare const DEFAULT_FUNCTIONAL_SEEDS: {
    success: string;
    warning: string;
    error: string;
};
export declare const BRAND_NEUTRAL_RATIO_OPTIONS: {
    value: number | 'auto';
    label: string;
}[];
export declare function normalizeHex(input: string): string | null;
export declare function hexToRgb(hex: string): [number, number, number];
export declare function rgbToHex(r: number, g: number, b: number): string;
/** RGB 逐通道加权混合（与引擎 chroma.average('rgb') 同口径） */
export declare function mixHex(a: string, b: string, weightOfA: number): string;
export interface BrandScale {
    colors: string[];
    primaryLevel: number;
}
/** 品牌色阶：HCT 引擎，remainInput 保留用户确认的原始主色并返回其位置 */
export declare function generateBrandScale(seed: string): BrandScale;
/** 普通 14 级中性色：零彩度 + 固定亮度层级（黑色基准，与官方 Gray1–14 一致） */
export declare function generateNeutralScale(): string[];
/** 品牌倾向基准色（品牌 Hue/Chroma 全彩度，同亮度层级；尚未混灰） */
export declare function generateBrandNeutralBase(seed: string): string[];
/**
 * 品牌倾向中性色：基准色与同级普通灰 RGB 混合。
 * - 'auto'：直接采用引擎官方实现 getNeutralColor（逐级按 HCT 色相判断：
 *   绿（102–210）8%、其他 12%），保证与官方 BlueGray 一致；
 * - 固定比例：所有层级统一使用该比例（0 = 纯灰）。
 */
export declare function generateBrandNeutralScale(seed: string, ratio: number | 'auto'): string[];
/** 功能色 10 级（种子原样保留于其所在级） */
export declare function generateFunctionalScale(seed: string): {
    colors: string[];
    primaryLevel: number;
};
export declare const SEMANTIC_RULES: {
    key: string;
    label: string;
    rule: string;
    officialToken: string;
}[];
/** 状态文字对比阈值（WCAG AA，仅用于 a11y 报告；不影响状态色选择） */
export declare const STATE_TEXT_CONTRAST = 4.5;
/**
 * 按预设固定级位取状态色（唯一的状态色来源）：
 * - 级位来自 TDesign Web 预设，不依据对比度换向；
 * - 官方种子（如 #0052D9）逐值复现官方色板；自定义种子时
 *   同一级位取项目色阶值（官方值在界面 / 测试中并排对照）。
 */
export declare function presetStateColor(kind: InteractionColorKind, state: keyof InteractionStateLevels, colors: string[]): {
    level: number;
    value: string;
    officialToken: string;
};
/** 预设级位（展示用） */
export declare function presetLevel(kind: InteractionColorKind, state: keyof InteractionStateLevels): number;
export declare function levelOfBrand(_key: string, _primaryLevel: number): number;
export declare function contrastRatio(fg: string, bg: string): number;
export declare function checkA11y(cs: Omit<ColorSystem, 'a11y'>, visual: VisualConfig): A11yCheckResult[];
export interface BuildColorSystemOptions {
    seed: string;
    seedSource: string;
    brandNeutralRatio?: number | 'auto';
    functionalSeeds?: {
        success: string;
        warning: string;
        error: string;
    };
    /** 功能色种子来源描述（迁移追溯；缺省为 TDesign 语义种子） */
    functionalSeedSources?: {
        success?: string;
        warning?: string;
        error?: string;
    };
    /** 深色 onBrand 建议由 a11y 检查给出；初始默认白字 */
    onBrandValue?: string;
    /** 表面 / 文字 / 边框视觉值（outlined 状态与表单语义 Token 引用；缺省用演示初始值） */
    visual?: {
        surfaceBg?: string;
        textColor?: string;
        borderStrongColor?: string;
        borderColor?: string;
        pageBg?: string;
        surfaceAltBg?: string;
        hoverBg?: string;
    };
    now?: string;
}
/**
 * 危险相关组件 Token（primary / outlined / soft × 三态 + soft 文字）：
 * 全部按 TDesign Web 预设的 Error 固定级位映射
 * （--td-error-color=error-6 / hover=error-5 / active=error-7 / disabled=error-3 /
 *   light=error-1 / light-hover=error-2），
 * buildColorSystem 与 regenerateFunctionalSeeds 共用同一构建，
 * 保证「改 Error 种子 → 所有危险按钮 / 错误文字边框同步重算」。
 */
export declare function buildDangerComponentTokens(errorColors: string[], _errorPrimaryLevel: number, surfaceBg: string): Record<string, PaletteToken>;
/** 危险相关组件 Token 的 key 清单（regenerateFunctionalSeeds 的重算范围；与 buildDangerComponentTokens 保持一致） */
export declare const DANGER_COMPONENT_KEYS: readonly string[];
export declare function buildColorSystem(opts: BuildColorSystemOptions): ColorSystem;
/**
 * 应用设计师确认的状态覆盖：
 * - 将覆盖值写入对应语义 / 组件 Token（origin=designer），
 *   note 记录「官方值 / 覆盖值 / 原因 / 确认时间」完整留档；
 * - 不修改预设映射本身（interactionPreset 不变），导出时两者并存可追溯。
 */
export declare function applyStateOverrides(cs: Omit<ColorSystem, 'a11y'>, overrides: StateOverrideRecord[]): Omit<ColorSystem, 'a11y'>;
/**
 * 将旧项目 Color Contract 补齐到当前 Foundation schema。
 * 保留已有色阶、值、确认和锁定状态；只补缺失 Token，并把已知 Component
 * Token 的 ref 修正为当前 Semantic 引用。该迁移不改变已确认视觉值。
 */
export declare function upgradeColorSystemFoundationTokens(prev: ColorSystem, visual: VisualConfig): {
    next: ColorSystem;
    changes: string[];
};
export interface RegenerateResult {
    next: ColorSystem;
    /** 被保留（未覆盖）的已确认 / 已锁定 Token */
    conflicts: {
        key: string;
        kept: string;
        algorithm: string;
    }[];
}
export declare function regenerateColorSystem(prev: ColorSystem, opts: {
    seed?: string;
    brandNeutralRatio?: number | 'auto';
    seedSource?: string;
    visual: VisualConfig;
    now?: string;
}): RegenerateResult;
/** 全量重算无障碍检查（设计师改色后调用） */
export declare function recheckA11y(cs: ColorSystem, visual: VisualConfig): ColorSystem;
export type FunctionalKind = 'success' | 'warning' | 'error';
/**
 * 功能色种子重算：
 * - 只重建「种子发生变化」的功能色色阶与相关组件 Token（Error → 全部危险按钮状态）；
 * - 品牌色阶 / 中性色 / 品牌倾向灰 / 语义 Token / 其他功能色完全保留原数据（含设计师修改元数据）；
 * - 种子级 Token：未锁定时由新种子原样替换（这是「修改种子」操作本体，非静默覆盖派生色）；
 * - 已确认 / 已锁定的派生 Token 不被静默覆盖，列入 conflicts 由设计师处理；
 * - 危险组件 Token 中设计师已修改（origin=designer）的保留原值并报冲突。
 */
export declare function regenerateFunctionalSeeds(prev: ColorSystem, opts: {
    seeds: Partial<Record<FunctionalKind, string>>;
    /** 新种子的来源描述（导出追溯）；缺省为「设计师修改（色彩系统界面）」 */
    sources?: Partial<Record<FunctionalKind, string>>;
    visual: VisualConfig;
    now?: string;
}): RegenerateResult;
