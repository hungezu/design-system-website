import type { FigmaRegionNode, ProjectRegionAppearance, RegionAppearanceCandidate, RegionAppearanceRole, Scheme } from '../types';
export declare const IMAGE_READ_METHOD = "\u56FE\u7247\u8FDE\u7EED\u533A\u57DF\u50CF\u7D20\u5206\u6790\uFF08OKLab \u805A\u7C7B\uFF09";
export declare const IMAGE_BORDER_READ_METHOD = "\u56FE\u7247\u7EC6\u7EBF\u626B\u63CF\uFF08\u539F\u59CB\u5206\u8FA8\u7387\uFF09";
export declare const IMAGE_NOTE = "\u53D6\u503C\u4E3A\u5408\u6210\u663E\u793A\u8272\uFF0C\u539F\u59CB\u900F\u660E\u5EA6\u3001\u53D8\u91CF\u7ED1\u5B9A\u548C\u56FE\u5C42\u5173\u7CFB\u672A\u77E5";
export declare const FIGMA_READ_METHOD = "Figma \u539F\u503C\u8BFB\u53D6\uFF08\u7ED3\u6784\u5316\u8282\u70B9\uFF09";
export interface RecognitionThresholds {
    /** OKLab 聚类 ΔE 阈值（0.015 ≈ 抗锯齿/JPEG 噪声级，仍能区分 #F5F6F7 与 #F2F3F5） */
    clusterDeltaE: number;
    /** 进入区域分析的最小簇占比（更小的簇视为内容细节 / 噪声） */
    minClusterRatio: number;
    /** 表面候选要求的中性 Chroma 上限（高于此视为状态 / 品牌色，默认过滤） */
    neutralChromaMax: number;
    /** card 与 page 的最小可见色差（OKLab ΔE） */
    cardPageContrastMin: number;
    /** card 组件的最小包围盒占比 */
    cardMinAreaRatio: number;
    /** card 允许内容孔洞后的矩形完整度下限 */
    cardMinRectangularity: number;
}
export declare const DEFAULT_THRESHOLDS: RecognitionThresholds;
export declare function rgbToHexStr(r: number, g: number, b: number): string;
/** 相对亮度（WCAG）：0 黑 – 1 白 */
export declare function luminance(r: number, g: number, b: number): number;
export declare function hexLuminance(hex: string): number;
export interface OkLab {
    L: number;
    a: number;
    b: number;
}
/** sRGB → OKLab（感知均匀：同 ΔE ≈ 同感知差异） */
export declare function rgbToOklab(r: number, g: number, b: number): OkLab;
/** OKLab 欧氏距离（感知 ΔE） */
export declare function deltaEok(c1: OkLab, c2: OkLab): number;
export declare function oklabChroma(c: OkLab): number;
export declare function hexToOklab(hex: string): OkLab;
export declare function hexDeltaE(a: string, b: string): number;
export interface RgbaImage {
    width: number;
    height: number;
    /** RGBA，长度 = width × height × 4 */
    data: Uint8ClampedArray | number[];
}
export interface SampleGrid {
    gw: number;
    gh: number;
    /** 每格平均显示色（RGB 三通道） */
    avg: Uint8ClampedArray;
    /** 网格 → 原图的缩放因子（原图像素 / 格） */
    factor: number;
}
/** 降采样到分析尺寸（最长边 ≤ maxSide），保留 factor 倍原图坐标映射 */
export declare function downsampleImage(image: RgbaImage, maxSide?: number): SampleGrid;
export interface ClusterInfo {
    label: number;
    /** 成员平均显示色（observedValue 来源；聚类只用于连接，不替换原稿值） */
    hex: string;
    oklab: OkLab;
    chroma: number;
    luminance: number;
    cells: number;
    /** 合并前后的颜色范围（明度最低 / 最高成员色，追溯用） */
    rangeHex: [string, string];
    /** 网格包围盒 */
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export interface ClusterGridResult {
    /** 每格所属簇 label（-1 = 未进入分析的细小簇） */
    labels: Int32Array;
    clusters: ClusterInfo[];
    deltaE: number;
}
/**
 * OKLab leader 聚类（确定性：按首次出现顺序建立中心）。
 * 先对「去重颜色」聚类，再映射回网格，避免逐格比较的平方开销。
 */
export declare function clusterGrid(grid: SampleGrid, opts?: {
    deltaE?: number;
    minClusterRatio?: number;
}): ClusterGridResult;
export interface GridComponent {
    cluster: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    cells: number;
    touchesLeft: boolean;
    touchesRight: boolean;
    touchesTop: boolean;
    touchesBottom: boolean;
}
/** 某簇内部的连通组件（4 鼠邻接，同簇 label） */
export declare function componentsOfCluster(labels: Int32Array, gw: number, gh: number, cluster: number): GridComponent[];
/**
 * 内容孔洞（形态学闭合的等效实现）：从画板边缘对「非本簇」格子洪泛，
 * 未被触达的非本簇格子 = 被本簇包围的内容（文字 / 图标 / 表格 / 内部分区）。
 * 页面与卡片因此允许包含内容，而不要求像素完全连通。
 */
export declare function enclosedHoles(labels: Int32Array, gw: number, gh: number, cluster: number): Uint8Array;
export interface LineSeg {
    hex: string;
    horizontal: boolean;
    x: number;
    y: number;
    length: number;
}
/** 原始分辨率细线扫描（长度 ≥ 10% 边长、邻近行不同色的行程）；OKLab 缓存避免逐像素色空间换算 */
export declare function scanThinLines(image: RgbaImage): LineSeg[];
export interface RecognitionResult {
    candidates: RegionAppearanceCandidate[];
    notes: string[];
}
/** 图片区域背景识别（确定性；只产出候选，不修改方案） */
export declare function recognizeImageRegionAppearance(args: {
    projectId: string;
    importId: string;
    image: RgbaImage;
    now: string;
    thresholds?: Partial<RecognitionThresholds>;
}): RecognitionResult;
/** Figma 结构化识别：读取 fill / stroke / cornerRadius / 变量与样式绑定原值 */
export declare function recognizeFigmaRegionAppearance(args: {
    projectId: string;
    importId: string;
    nodes: FigmaRegionNode[];
    board: {
        width: number;
        height: number;
    };
    now: string;
}): RecognitionResult;
export declare function confidenceLevel(c: number): '高' | '中' | '低';
export interface RoleConflict {
    role: RegionAppearanceRole;
    candidates: RegionAppearanceCandidate[];
}
export type BuildRegionResult = {
    ok: true;
    record: ProjectRegionAppearance;
} | {
    ok: false;
    error: string;
    conflicts?: RoleConflict[];
};
/**
 * 由已确认（adopt / keep-new）的候选构建项目级 Region Appearance。
 * - valueKind 与角色不匹配 → 拒绝（颜色候选不得映射圆角等）；
 * - 同一角色多个候选 → 返回冲突清单并拒绝构建（禁止 last-write-wins 静默覆盖；
 *   第一版未实现页面特例，要求设计师只保留一个）。
 */
export declare function buildProjectRegionAppearance(args: {
    projectId: string;
    adopted: {
        candidate: RegionAppearanceCandidate;
        value?: string;
    }[];
    confirmedBy: string;
    now: string;
    sourceLabel: string;
}): BuildRegionResult;
/** 把构建好的 Region Appearance 写入方案草稿（只改 regionAppearance 字段，不动布局） */
export declare function applyRegionAppearanceToScheme(draft: Scheme, record: ProjectRegionAppearance, prev?: ProjectRegionAppearance | null): {
    changedRoles: string[];
};
/** 页面效果模式的 Resolved CSS 变量（结构检查模式不应用） */
export declare function regionAppearanceCssVars(ra: ProjectRegionAppearance | null | undefined): Record<string, string>;
