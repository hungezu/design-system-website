export type ConfirmStatus = 'confirmed' | 'tentative' | 'undecided';
export type InfoSource = 'user' | 'reference' | 'system';
export declare const STATUS_LABEL: Record<ConfirmStatus, string>;
export declare const SOURCE_LABEL: Record<InfoSource, string>;
export interface TrackedInfo {
    id: string;
    text: string;
    status: ConfirmStatus;
    source: InfoSource;
    /** 锁定是独立属性：已确认不等于自动锁定 */
    locked: boolean;
    note?: string;
    createdAt: string;
}
export type NodeKind = 'column' | 'row' | 'grid' | 'generic' | 'page-content' | 'component' | 'custom';
export declare const KIND_LABEL: Record<NodeKind, string>;
export declare const CONTAINER_KINDS: NodeKind[];
export declare function isContainerKind(k: NodeKind): boolean;
/**
 * 语义角色：区域的「作用」与「所在位置」分开记录。
 * 角色只说明这个区域承担什么职责；它位于哪一层容器、如何对齐，由当前方案的布局树决定。
 */
export type NodeRole = 'none' | 'brand' | 'nav' | 'message' | 'account' | 'title' | 'tab' | 'toolbar' | 'content' | 'auxiliary';
export declare const ROLE_LABEL: Record<NodeRole, string>;
export declare const ROLE_PURPOSE: Record<NodeRole, string>;
export type SizeMode = 'auto' | 'fixed' | 'flex';
export interface SizeSpec {
    mode: SizeMode;
    /** fixed 模式下的像素值 */
    value?: number;
    min?: number;
    max?: number;
    /** flex 模式下的伸缩系数 */
    grow?: number;
    shrink?: number;
}
export interface CustomAreaInfo {
    purpose: string;
    contentNote: string;
}
export interface ComponentBinding {
    /** 引用的组件契约 ID（如 button / input / table） */
    ref: string;
    /** 预览时使用的示例属性 */
    sampleProps?: Record<string, unknown>;
}
export interface LayoutNode {
    id: string;
    name: string;
    kind: NodeKind;
    role: NodeRole;
    status: ConfirmStatus;
    source: InfoSource;
    locked: boolean;
    width: SizeSpec;
    height: SizeSpec;
    gap?: number;
    padding?: number;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between';
    /** grid 容器列数 */
    columns?: number;
    /** 区域内部是否滚动 */
    scroll?: boolean;
    custom?: CustomAreaInfo;
    component?: ComponentBinding;
    children: LayoutNode[];
}
export interface PageOverride {
    id: string;
    /** 引用的系统布局节点 ID */
    targetNodeId: string;
    description: string;
    status: ConfirmStatus;
    /**
     * 生效方式：hide = 在本页面隐藏该公共区域。
     * 仅对未锁定区域（且父容器未锁定、非系统根区域）生效；
     * 无 effect 或被锁定规则阻止时仅为记录，不改变实际布局。
     */
    effect?: 'hide';
}
export interface PageDef {
    id: string;
    name: string;
    status: ConfirmStatus;
    source: InfoSource;
    locked: boolean;
    tasks: TrackedInfo[];
    infoNeeds: TrackedInfo[];
    constraints: TrackedInfo[];
    /** 页面级例外：显式记录，不静默修改系统布局 */
    overrides: PageOverride[];
    /** 页面自己的内容结构，渲染进系统布局的页面内容区域 */
    content: LayoutNode;
}
export type Density = 'compact' | 'regular' | 'comfortable';
export declare const DENSITY_LABEL: Record<Density, string>;
export interface VisualConfig {
    brandColor: string;
    onBrandColor: string;
    textColor: string;
    textSecondaryColor: string;
    textDisabledColor: string;
    pageBg: string;
    surfaceBg: string;
    surfaceAltBg: string;
    hoverBg: string;
    borderColor: string;
    borderStrongColor: string;
    dangerColor: string;
    successColor: string;
    fontFamily: string;
    fontSizeH1: number;
    fontSizeH2: number;
    fontSizeH3: number;
    fontSizeBody: number;
    fontSizeCaption: number;
    /** 展示标题字号（TDesign 字阶 28px）；旧方案数据缺失时由平台基线回退 */
    fontSizeDisplay?: number;
    fontWeightBold: number;
    radiusSm: number;
    radiusMd: number;
    radiusLg: number;
    shadowCard: string;
    spaceXs: number;
    spaceSm: number;
    spaceMd: number;
    spaceLg: number;
    spaceXl: number;
    controlHeightSm: number;
    controlHeightMd: number;
    controlHeightLg: number;
    density: Density;
    /** 已由用户确认的变量 key 列表；未确认的值在规范中标注「待确认（演示初始值）」 */
    confirmedVars: string[];
    /** 已锁定的视觉变量 key 列表：锁定后样式提取应用与手动修改均被阻止 */
    lockedVars: string[];
}
export interface PropDef {
    name: string;
    type: string;
    values?: string[];
    required: boolean;
    description: string;
}
export interface ComponentState {
    name: string;
    status: 'implemented' | 'todo';
}
export interface ComponentNote {
    text: string;
    status: 'implemented' | 'todo';
}
export interface ComponentContract {
    id: string;
    name: string;
    /** 是否有真实 React 实现 */
    implemented: boolean;
    sourcePath: string;
    description: string;
    usage: string;
    props: PropDef[];
    states: ComponentState[];
    notes: ComponentNote[];
    sampleCode: string;
}
/** 属性组合约束：从数据读取，由当前方案确认，不硬编码为唯一标准 */
export interface ComboRule {
    key: string;
    label: string;
    allowed: boolean;
}
export interface ComponentDecision {
    componentId: string;
    combos: ComboRule[];
    usageNotes: TrackedInfo[];
}
export interface Scheme {
    formatVersion: number;
    id: string;
    name: string;
    revision: number;
    description: string;
    knownRequirements: TrackedInfo[];
    openQuestions: TrackedInfo[];
    systemLayout: LayoutNode;
    pages: PageDef[];
    visual: VisualConfig;
    componentDecisions: ComponentDecision[];
    /** 样式提取应用记录（追溯：来自哪次导入 / 画板 / 读取方式 / 确认时间） */
    styleSources: StyleApplicationRecord[];
    /**
     * 色彩系统（TDesign HCT 色板 + 三层 Token）：
     * 可选字段——旧方案数据没有该字段时正常打开，界面显示「未生成」；
     * 生成与确认由「色彩系统」界面完成，不在加载时自动补写。
     */
    colorSystem?: ColorSystem;
    /**
     * 按钮造型 Recipe：同一 DSButton API 与业务代码在不同 Recipe 下
     * 呈现不同风格（组件源码不含项目判断，造型全部来自该配置）。
     * 可选字段——旧方案没有时使用默认 Recipe（跟随视觉变量），不自动补写。
     */
    buttonRecipe?: ButtonRecipeRecord;
    /**
     * 下拉选择 Recipe（DSSelect，React Aria Components 底座）：
     * 只保存系统性造型参数；高度继续读取共享 controlHeightSm/Md/Lg，
     * 颜色全部引用 Color Contract 语义 Token（不出现 HEX）。
     */
    selectRecipe?: SelectRecipeRecord;
    /**
     * 第一批核心组件 Recipe（可选字段——旧方案没有时使用默认值，
     * 跟随视觉变量，不自动补写；发布时如实标注 source=default）。
     */
    inputRecipe?: InputRecipeRecord;
    tableRecipe?: TableRecipeRecord;
    paginationRecipe?: PaginationRecipeRecord;
    dialogRecipe?: DialogRecipeRecord;
    /**
     * 项目级区域外观（Region Appearance）：确认后的页面/卡片/分组背景、
     * 边框与圆角。可选字段——旧方案没有时正常打开（显示「尚未确认区域外观」），
     * 首次确认后才创建；只影响「页面效果模式」预览，不改变布局树。
     */
    regionAppearance?: ProjectRegionAppearance;
    /**
     * 项目级图标配置（Icon 系统，可选字段——旧方案没有时使用默认
     * Profile / 空 Pack，不自动补写；发布时未确认则 icons.json 如实
     * 标注 source=default 并回退全量 published 图标集）。
     */
    iconProfile?: import('./icons/iconGrammar').ProjectIconProfile;
    iconPack?: ProjectIconPackRecord;
    /**
     * 项目级 Query List Pattern（查询列表页排版，可选字段——旧方案没有
     * 时不自动补写候选；发布 schema v3 起，发布前必须确认并锁定，
     * patterns.json 只输出已确认值，每字段带来源与状态）。
     */
    queryListPattern?: import('./patterns/queryListPattern').ProjectQueryListPattern;
    /**
     * 项目级 Typography 角色覆盖（可选——未配置用平台默认角色）。
     * 覆盖值只能引用基础字体 Token（--bds-fs-*）与语义颜色 Token，
     * 发布编译时校验；组件源码不变。
     */
    typography?: ProjectTypographyRecord;
    updatedAt: string;
}
/** 项目 Typography 角色映射（覆盖记录；不修改组件源码） */
export interface ProjectTypographyRecord {
    /** 角色覆盖（只允许 Token 引用；编译期校验） */
    roles: Partial<Record<import('./typography/typographyRoles').TypographyRoleName, Partial<import('./typography/typographyRoles').TypographyRole>>>;
    status: 'candidate' | 'confirmed';
    source: string;
    confirmedAt: string | null;
    locked: boolean;
    /** 严格模式下必须通过 TDesign 最终解析值校验才能发布 */
    strictMode?: boolean;
    /** 旧项目字体迁移记录（不静默覆盖） */
    migrationHistory?: Array<{
        migratedAt: string;
        source: string;
        changes: Array<{
            key: string;
            from: number | string | undefined;
            to: number | string;
        }>;
    }>;
}
/** 项目 Icon Pack（项目选定的 published 图标子集 + 统一默认变体） */
export interface ProjectIconPackRecord {
    /** 选定的图标语义 id（必须全部来自全局 Registry published 集合） */
    iconIds: string[];
    /** 单图标例外：id → 权重（记录在 exceptions，含来源说明） */
    overrides: {
        id: string;
        weight: 'outline' | 'filled';
        reason: string;
    }[];
    status: 'candidate' | 'review' | 'confirmed';
    version: number;
    confirmedAt: string | null;
    locked: boolean;
    /** 已发布自定义图标的不可变项目快照；运行时从 icons.json 读取，不访问工作台存储 */
    customIcons?: Array<{
        id: string;
        registryVersion: string;
        nameZh: string;
        nameEn: string;
        source: string;
        sourceVersion: string;
        license: string;
        copyrightNote: string;
        variants: {
            outline: string;
            filled: string;
        };
    }>;
}
export declare const SCHEME_FORMAT_VERSION = 1;
export declare const SPEC_FORMAT_VERSION = "bds-spec/1";
export declare const WORKSPACE_FORMAT_VERSION = 2;
export type ProjectStatus = 'draft' | 'active' | 'archived';
export interface ProjectRecord {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    createdAt: string;
    updatedAt: string;
    lastOpenedAt: string;
    /** 项目内完整方案（迁移自旧单方案或新建） */
    scheme: Scheme;
    /** 项目级 UI 状态（当前页面 / 工作位置），随项目保存与恢复 */
    ui: {
        currentPageId?: string;
    };
}
export interface WorkspaceState {
    formatVersion: number;
    currentProjectId: string | null;
    projects: ProjectRecord[];
    archivedProjects: ProjectRecord[];
    updatedAt: string;
}
export type ScopeType = 'scheme' | 'system' | 'page';
export interface DeliveryScope {
    type: ScopeType;
    pageId?: string;
}
export type Audience = 'pm' | 'designer' | 'frontend' | 'ai';
export declare const AUDIENCE_LABEL: Record<Audience, string>;
/** 本轮明确未接入 / 未支持的能力（如实标注，不做虚假按钮） */
export declare const UNSUPPORTED_CAPABILITIES: string[];
export type ExtractCategory = 'color' | 'text' | 'spacing' | 'size' | 'radius' | 'border' | 'shadow';
export declare const CATEGORY_LABEL: Record<ExtractCategory, string>;
/** 读取方式：原值读取 = 结构化属性；几何测量 = 由节点位置计算得出 */
export type ReadMethod = '原值读取' | '原值读取（自动布局）' | '原值读取（节点尺寸）' | '原值读取（文字分段）' | '几何测量';
export interface CandidateSourceRef {
    nodeId: string;
    nodeName: string;
    nodePath: string;
    /** 相对画板的定位与尺寸（方案像素，与预览缩放无关） */
    rect?: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    /** 原稿中绑定的变量 / 样式（保留关联，不自动改名或展开） */
    variableId?: string;
    variableName?: string;
    styleId?: string;
    styleName?: string;
}
/** 候选确认状态：pending 未处理 / adopt 映射到已有变量 / keep-new 保留为新候选 / skip 暂不采用 */
export type CandidateStatus = 'pending' | 'adopt' | 'keep-new' | 'skip';
export interface StyleCandidate {
    id: string;
    importId: string;
    category: ExtractCategory;
    /** 读取方式：原值读取 / 自动布局 / 节点尺寸 / 文字分段 / 几何测量 */
    readMethod: string;
    /** 原始值与单位（含透明度、行高单位等原始含义），如 "#2563EB @ 100%"、"16px / 行高 AUTO" */
    rawValue: string;
    /** 结构化原值（单位、alpha、行高单位、四角圆角等，保持原始含义） */
    rawDetail?: Record<string, unknown>;
    /** 规范建议：名称 / 用途 / 建议映射的视觉变量（仅建议，需确认） */
    suggestion: {
        name: string;
        usage: string;
        mappedVarKey?: string | null;
    };
    sources: CandidateSourceRef[];
    /** 观察到的使用次数 —— 仅限本次导入范围，不代表系统占比 */
    count: number;
    status: CandidateStatus;
    /** 相近值提示（不自动合并） */
    similarityNote?: string;
    firstSeenAt: string;
    lastSeenAt: string;
}
/** 一次导入的元信息（持久化部分；预览图仅内存保存，不写入 localStorage） */
export interface ImportMeta {
    id: string;
    formatVersion: string;
    boardId: string;
    boardName: string;
    width: number;
    height: number;
    importedAt: string;
    nodeCount: number;
    candidateCount: number;
    unsupported: string[];
    /** 导入时的视觉字段基线，用于应用前检测「导入后已被修改」 */
    visualBaseline: Record<string, string | number>;
    /** 由旧全局候选库迁移而来（来源标记 legacy-global-migration） */
    migratedFrom?: 'legacy-global-migration';
    /** Figma 导入的节点紧凑快照（供区域背景识别二次分析；旧导入可能没有） */
    regionNodes?: FigmaRegionNode[];
}
export interface CandidateLibrary {
    formatVersion: number;
    /** 归属项目（候选库按项目隔离存储） */
    projectId: string;
    imports: ImportMeta[];
    candidates: StyleCandidate[];
    /** 区域外观识别候选（RegionAppearanceCandidate；旧库没有时视为空） */
    regionCandidates?: RegionAppearanceCandidate[];
}
/** 应用记录：进入方案，供规范与交付追溯 */
export interface StyleApplicationRecord {
    id: string;
    importId: string;
    candidateId: string;
    boardName: string;
    category: ExtractCategory;
    /** 应用的视觉变量 key（保留为新候选但未映射时为 null） */
    variableKey: string | null;
    variableName: string;
    /** 原稿读取值（原始观察，不变） */
    rawValue: string;
    /** 实际采用值 */
    appliedValue: string | number;
    readMethod: ReadMethod | string;
    sourceCount: number;
    nodeIds: string[];
    appliedAt: string;
    /** 应用范围：本轮仅视觉字段 */
    scope: 'visual';
}
export type RegionAppearanceRole = 'surface.page' | 'surface.card' | 'surface.subtle' | 'surface.inverse' | 'border.default' | 'border.strong' | 'radius.control' | 'radius.container';
export declare const REGION_ROLE_LABEL: Record<RegionAppearanceRole, string>;
/** 角色 → 预览 CSS 变量（Resolved 应用点；仅页面效果模式使用） */
export declare const REGION_ROLE_CSS_VAR: Record<RegionAppearanceRole, string>;
/**
 * 候选值类型：角色映射约束（颜色候选不得映射圆角，反之亦然）。
 * - surface-color：图片 / Figma 的表面填充色 → 仅 4 个 surface 角色
 * - border-color：细线扫描 / stroke 原值 → 仅 2 个 border 角色
 * - radius-number：cornerRadius 原值（仅 Figma）→ 仅 2 个 radius 角色
 * - elevation / unknown：暂无可映射角色（不出现在角色下拉中）
 */
export type RegionValueKind = 'surface-color' | 'border-color' | 'radius-number' | 'elevation' | 'unknown';
export declare const REGION_VALUE_KIND_LABEL: Record<RegionValueKind, string>;
/** 每种值类型允许映射的角色（角色下拉按此过滤；不合法角色不出现在下拉中） */
export declare const REGION_ROLES_BY_KIND: Record<RegionValueKind, RegionAppearanceRole[]>;
/** 区域外观候选（识别结果 → 待确认；保存在当前项目候选库） */
export interface RegionAppearanceCandidate {
    id: string;
    projectId: string;
    importId: string;
    type: 'region-appearance';
    /** 值类型（角色映射约束；旧候选缺省时按 observedValue 形态归为 unknown） */
    valueKind: RegionValueKind;
    suggestedRole: RegionAppearanceRole;
    /** 原稿观察值（如 "#F2F3F5"、"6px"）；不因确认而改写 */
    observedValue: string;
    evidence: {
        /** 原稿矩形（原图 / 画板坐标系） */
        rect: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        samplePoints?: Array<{
            x: number;
            y: number;
            value: string;
        }>;
        nodeIds?: string[];
        nodePath?: string;
        /** 区域面积 / 画板面积（0–1） */
        areaRatio: number;
        /** 同类区域出现次数（仅统计本次导入） */
        occurrenceCount: number;
        /**
         * 识别特征指标（page：edgeSampleRatio/cornerAgreement/backgroundCoverage/
         * containedRegionCount；区域：uniformityRatio/holeRatio/rectangularity/
         * edgeContinuity；聚类：clusterDeltaE/mergedRange 等）。
         */
        metrics?: Record<string, number | string>;
    };
    /** 0–1，来自实际特征（面积 / 边缘接触 / 矩形完整度 / 重复 / 语义命名 / 变量绑定） */
    confidence: number;
    confidenceReason: string;
    sourceType: 'image' | 'figma';
    readMethod: string;
    status: 'pending' | 'adopt' | 'keep-new' | 'skip';
    confirmedBy?: string;
    confirmedAt?: string;
    note?: string;
}
/** 确认后写入角色的记录（原始观察与最终采用值都保留） */
export interface RegionRoleRecord {
    role: RegionAppearanceRole;
    /** 采用值（默认 = 观察值；设计师可改） */
    value: string;
    /** 原稿观察值（不变） */
    observedValue: string;
    candidateId: string;
    importId: string;
    sourceType: 'image' | 'figma';
    readMethod: string;
    confidence: number;
    confirmedAt: string;
}
/** 项目级 Region Appearance：确认后首次创建；只写入当前项目 */
export interface ProjectRegionAppearance {
    projectId: string;
    roles: Partial<Record<RegionAppearanceRole, RegionRoleRecord>>;
    source: string;
    status: ConfirmStatus;
    locked: boolean;
    updatedAt: string;
}
/** Figma 导入包节点的紧凑快照（供区域背景识别二次分析；导入时生成） */
export interface FigmaRegionNode {
    id: string;
    name: string;
    type: string;
    x: number;
    y: number;
    w: number;
    h: number;
    fills?: {
        kind: string;
        hex?: string;
        opacity?: number;
    }[];
    strokes?: {
        kind: string;
        hex?: string;
        opacity?: number;
    }[];
    strokeWeight?: number;
    cornerRadius?: number | null;
    variableBindings?: Record<string, {
        id: string;
        name: string;
    }>;
    styleRefs?: {
        kind: string;
        id: string;
        name: string;
    }[];
    layout?: {
        mode: string;
        itemSpacing?: number;
    } | null;
}
export type ReleaseStatus = 'review' | 'published' | 'deprecated';
/** 发布资产文件条目（编译产物清单） */
export interface ReleaseArtifactFile {
    path: string;
    bytes: number;
    checksum: string;
    mediaType: string;
}
/** 发布就绪检查条目：blocking 阻止发布 / warning 需明确确认 / passed 通过 */
export interface ReleaseCheckItem {
    code: string;
    message: string;
}
/** 冻结机制迁移状态：
 *  - frozen：发布时已冻结 artifacts（现行机制）；
 *  - legacy-unfrozen：发布于冻结机制上线之前，只有 checksum 清单、没有冻结内容，
 *    下载被阻止，必须先执行迁移（migrateLegacyRelease）；
 *  - migrated：legacy 记录已按发布快照补齐冻结内容，可正常下载。 */
export type ReleaseMigrationStatus = 'frozen' | 'legacy-unfrozen' | 'migrated';
export interface ReleaseValidation {
    blocking: ReleaseCheckItem[];
    warnings: ReleaseCheckItem[];
    passed: ReleaseCheckItem[];
    /** 组件覆盖：引用到的组件契约与实现状态 */
    componentCoverage: {
        id: string;
        name: string;
        implemented: boolean;
        referenced: boolean;
    }[];
    /** Token 引用完整性：语义/组件 Token 的 ref 是否可解析 */
    tokenReferenceIntegrity: {
        total: number;
        unresolved: string[];
    };
    /** 对比度检查结论（来自色彩系统 a11y） */
    contrast: {
        checked: number;
        failed: {
            key: string;
            label: string;
            ratio: number;
            required: number;
        }[];
    };
    /** 缺失能力（不进入 availableComponents） */
    missingCapabilities: string[];
    checkedAt: string;
}
/** 发布快照：发布时刻方案的完整不可变深拷贝（编译资产只读它） */
export interface ReleaseSnapshot {
    formatVersion: 'bds-release-snapshot/1';
    projectId: string;
    projectName: string;
    schemeRevision: number;
    capturedAt: string;
    scheme: Scheme;
}
export interface ProjectRelease {
    id: string;
    projectId: string;
    /** Semantic Version，如 1.0.0 */
    version: string;
    /** 真实状态机：review（已提交待审批）→ published（审批通过，不可变）→ deprecated（仅标记，可读） */
    status: ReleaseStatus;
    projectName: string;
    schemeRevision: number;
    /** 资产 schema 版本（与编译器输出一致） */
    schemaVersion: string;
    createdAt: string;
    publishedAt: string | null;
    approvedBy: string;
    releaseNotes: string;
    /** 冻结文件内容（path → 文件文本）。审批通过时编译一次并随发布记录冻结；
     *  之后所有下载 / 校验只读本字段，禁止现场重编译。
     *  旧记录可能没有该字段（migrationStatus = legacy-unfrozen）。 */
    artifacts?: Record<string, string>;
    /** 冻结机制迁移状态：frozen / legacy-unfrozen / migrated */
    migrationStatus?: ReleaseMigrationStatus;
    /** 提交审核（Draft → Review）的责任人与时间 */
    submittedBy: string;
    submittedAt: string | null;
    /** 审批（Review → Published / 驳回）记录 */
    reviewedBy: string | null;
    reviewedAt: string | null;
    /** 审批结论：pending（待审批）/ approved / rejected；未提交过审批时为 null */
    reviewDecision: 'pending' | 'approved' | 'rejected' | null;
    /** 审批意见（随发布记录留档；驳回时必填原因） */
    reviewComment: string;
    /** 标记 deprecated 的时间（Published → Deprecated 时写入；其余状态为 null） */
    deprecatedAt?: string | null;
    snapshot: ReleaseSnapshot;
    validation: ReleaseValidation;
    artifactManifest: ReleaseArtifactFile[];
    /** 整包确定性校验和（FNV-1a 128-bit，见 releaseCompiler） */
    checksum: string;
}
export type PaletteTokenOrigin = 'seed' | 'algorithm' | 'designer';
export interface PaletteToken {
    /** 如 'brand.7'、'action.primary.hover'、'button.primary.background' */
    key: string;
    /** 解析后的最终值：基础色板 Token = 实际 HEX；语义 / 组件 Token = ref 解析结果或设计师覆盖值 */
    value: string;
    /**
     * 真实引用关系（单一数据源）：
     * - 语义 Token → 基础色板（如 'brand.7' / 'error.6'）；
     * - 组件 Token → 语义 Token（如 'action.primary.default'）或视觉变量（如 'visual.surfaceBg'）；
     * - 基础色板 Token 与纯派生值（如种子混合浅底）无 ref。
     * 设计师直接覆盖时 value 与 ref 目标不同步（origin=designer 记录 override）。
     */
    ref?: string;
    origin: PaletteTokenOrigin;
    status: ConfirmStatus;
    locked: boolean;
    /** 来源 / 映射规则说明（导出与界面展示用） */
    note?: string;
    /** 算法原始值：设计师改色后仍可「恢复算法值」，且不被静默覆盖时留档 */
    algorithmValue?: string;
}
export interface A11yCheckResult {
    key: string;
    label: string;
    fg: string;
    bg: string;
    ratio: number;
    required: number;
    pass: boolean;
    /** 未通过时的确定性建议（如深色文字候选值） */
    suggestion?: string;
}
export interface PaletteStrategy {
    name: 'tdesign-hct';
    engine: 'tvision-color';
    engineVersion: string;
    algorithmNote: string;
    /** 中性色固定感知亮度层级（HCT tone） */
    neutralTones: number[];
    /** 品牌倾向中性色的品牌混合比例；'auto' = 绿/青绿 8%，其他色相 12%（引擎规则） */
    brandNeutralRatio: number | 'auto';
    generatedAt: string;
}
/** 交互状态在 10 级色阶中的固定级位（1-based，与 TDesign _light.less 语义一致） */
export interface InteractionStateLevels {
    light: number;
    lightHover: number;
    focus: number;
    disabled: number;
    hover: number;
    default: number;
    active: number;
}
export type InteractionColorKind = 'brand' | 'error' | 'warning' | 'success';
export interface InteractionColorPreset {
    /** 预设 ID（第一版仅 'tdesign-web'，不与其他组件库混用） */
    id: string;
    /** 参考的组件库版本（官方 Token 基准） */
    version: string;
    /** 色板引擎（与官方主题生成器同源） */
    paletteEngine: string;
    sourceUrls: string[];
    mappings: Record<InteractionColorKind, InteractionStateLevels>;
}
/** 设计师确认的状态覆盖（与预设官方值并存的留档，不静默改色） */
export interface StateOverrideRecord {
    /** 被覆盖的语义 / 组件 Token key */
    tokenKey: string;
    /** 预设官方值（覆盖前） */
    officialValue: string;
    /** 设计师覆盖值 */
    overrideValue: string;
    /** 覆盖原因 */
    reason: string;
    confirmedAt: string;
}
export interface ColorSystem {
    strategy: PaletteStrategy;
    /** 品牌种子色与其来源（如「图片取色 → 设计师确认」） */
    seed: {
        value: string;
        source: string;
    };
    /** 品牌主色在色阶中的实际位置（1-based，不强制第 7 级） */
    primaryLevel: number;
    brand: PaletteToken[];
    neutral: PaletteToken[];
    brandNeutral: PaletteToken[];
    success: PaletteToken[];
    warning: PaletteToken[];
    error: PaletteToken[];
    /** 功能色种子（不从品牌色推导；允许未来更换）。Error 种子是危险 / 错误色的唯一正式来源 */
    functionalSeeds: {
        success: string;
        warning: string;
        error: string;
    };
    /** 功能色种子来源描述（迁移追溯：如「旧视觉配置 dangerColor 迁移候选」「设计师修改（色彩系统界面）」） */
    functionalSeedSources?: {
        success?: string;
        warning?: string;
        error?: string;
    };
    /** 全局语义 Token（action.primary.* / surface.brand.* / text.onBrand / focus.ring） */
    semantic: Record<string, PaletteToken>;
    /** 组件 Token（button.primary.*），仅引用语义 Token，不直接读色阶编号 */
    component: Record<string, PaletteToken>;
    /** 交互颜色预设（版本化适配器；平台不自研状态规则） */
    interactionPreset?: InteractionColorPreset;
    /** 设计师确认的状态覆盖留档（官方值 + 覆盖值 + 原因 + 确认时间） */
    stateOverrides?: StateOverrideRecord[];
    a11y: A11yCheckResult[];
}
/** 次要操作的视觉形式（由 Recipe 决定，业务代码不感知） */
export type ButtonSecondaryStyle = 'outlined' | 'soft';
/** Recipe 图标槽位默认位置（单按钮可用 iconPosition 覆盖） */
export type ButtonIconPosition = 'start' | 'end';
export interface ButtonRecipeMeta {
    /** 主要操作形式（当前实现仅 filled） */
    primaryStyle: 'filled';
    /** 次要操作形式：线框 / 浅色填充 */
    secondaryStyle: ButtonSecondaryStyle;
    /** 第三级操作形式（文本按钮） */
    tertiaryStyle: 'text';
    /** 圆角 px（默认取自视觉变量 radiusSm） */
    radius: number;
    /** 边框宽度 px */
    borderWidth: number;
    /** 文字字重 */
    fontWeight: number;
    /** 水平内边距 px（按尺寸） */
    horizontalPaddingSm: number;
    horizontalPaddingMd: number;
    horizontalPaddingLg: number;
    /** 图标与文字间距 px */
    iconGap: number;
    /** 图标默认槽位 */
    iconPosition: ButtonIconPosition;
    /** 纯图标按钮尺寸 px（按尺寸） */
    iconOnlySizeSm: number;
    iconOnlySizeMd: number;
    iconOnlySizeLg: number;
    /** 过渡时长 ms */
    transitionDuration: number;
    /** 焦点环宽度 px */
    focusRingWidth: number;
    /** 焦点环偏移 px */
    focusRingOffset: number;
}
/** Recipe 的方案级记录：来源 / 确认状态 / 锁定与配置值 */
export interface ButtonRecipeRecord {
    value: ButtonRecipeMeta;
    status: ConfirmStatus;
    locked: boolean;
    /** 来源描述（如「设计师确认」「测试方案 A（明确标注：非正式规范）」） */
    source: string;
    /** 设计师调整过的字段 key（导出与追溯用） */
    confirmedFields: string[];
    updatedAt: string;
}
/** 触发器视觉形式（由 Recipe 决定，业务 API 不感知） */
export type SelectTriggerStyle = 'outlined' | 'soft';
export interface SelectRecipeMeta {
    /** 触发器形式：线框（表面背景 + 实色边框）/ 浅色填充（弱底 + 透明边框） */
    triggerStyle: SelectTriggerStyle;
    /** 触发器圆角 px */
    radius: number;
    /** 触发器边框宽度 px */
    borderWidth: number;
    /** 触发器水平内边距 px */
    horizontalPadding: number;
    /** 值文字与下拉指示图标的间距 px */
    triggerIconGap: number;
    /** 弹层圆角 px */
    popoverRadius: number;
    /** 弹层阴影（造型参数；不含主题色） */
    popoverShadow: string;
    /** 选项行高 px */
    optionHeight: number;
    /** 选项水平内边距 px */
    optionPaddingX: number;
    /** 选项之间间距 px */
    optionGap: number;
    /** 可见选项数上限（超出滚动；高度 = optionHeight × N + gap × (N-1)） */
    maxVisibleOptions: number;
    /** 过渡时长 ms */
    transitionDuration: number;
}
export interface SelectRecipeRecord {
    value: SelectRecipeMeta;
    status: ConfirmStatus;
    locked: boolean;
    source: string;
    confirmedFields: string[];
    updatedAt: string;
}
export interface InputRecipeMeta {
    /** 输入框圆角 px */
    radius: number;
    /** 边框宽度 px */
    borderWidth: number;
    /** 水平内边距 px */
    horizontalPadding: number;
    /** 前后缀槽位与文字间距 px */
    affixGap: number;
    /** 字数统计与说明文字与输入框间距 px */
    hintGap: number;
    /** 说明 / 错误文字字号 px */
    hintFontSize: number;
    /** 过渡时长 ms */
    transitionDuration: number;
    /** 焦点环宽度 px */
    focusRingWidth: number;
}
export interface TableRecipeMeta {
    /** 表格外圆角 px */
    radius: number;
    /** 边框宽度 px */
    borderWidth: number;
    /** 单元格水平内边距 px */
    cellPaddingX: number;
    /** 单元格垂直内边距 px */
    cellPaddingY: number;
    /** 表头行高 px（含密度缩放前的基准） */
    headerHeight: number;
    /** 数据行高 px（基准；density 影响缩放） */
    rowHeight: number;
    /** 紧凑密度行高偏移 px */
    densityCompactOffset: number;
    /** 宽松密度行高偏移 px */
    densityComfortableOffset: number;
    /** 斑马纹（偶数行次表面背景）开关 */
    striped: boolean;
    /** 排序图标与列名间距 px */
    sortIconGap: number;
    /** 行过渡时长 ms */
    transitionDuration: number;
}
export interface PaginationRecipeMeta {
    /** 页码项圆角 px */
    itemRadius: number;
    /** 页码项尺寸（宽=高）px */
    itemSize: number;
    /** 页码项间距 px */
    itemGap: number;
    /** 页码项边框宽度 px */
    itemBorderWidth: number;
    /** 每页条数选择器宽度 px */
    pageSizeSelectWidth: number;
    /** 与总数说明的间距 px */
    totalGap: number;
    /** 过渡时长 ms */
    transitionDuration: number;
}
export interface DialogRecipeMeta {
    /** 内容区宽度 sm / md / lg px */
    widthSm: number;
    widthMd: number;
    widthLg: number;
    /** 圆角 px */
    radius: number;
    /** 边框宽度 px */
    borderWidth: number;
    /** 内边距 px */
    padding: number;
    /** 标题与内容间距 px */
    titleGap: number;
    /** 内容与底栏间距 px */
    footerGap: number;
    /** 遮罩透明度（0-1） */
    overlayOpacity: number;
    /** 遮罩模糊 px */
    overlayBlur: number;
    /** 阴影（造型参数；不含主题色） */
    shadow: string;
    /** 打开 / 关闭动效时长 ms */
    transitionDuration: number;
}
/** 通用 Recipe 方案级记录（与 Button/Select Recipe 同构） */
export interface ComponentRecipeRecord<T> {
    value: T;
    status: ConfirmStatus;
    locked: boolean;
    source: string;
    confirmedFields: string[];
    updatedAt: string;
}
export type InputRecipeRecord = ComponentRecipeRecord<InputRecipeMeta>;
export type TableRecipeRecord = ComponentRecipeRecord<TableRecipeMeta>;
export type PaginationRecipeRecord = ComponentRecipeRecord<PaginationRecipeMeta>;
export type DialogRecipeRecord = ComponentRecipeRecord<DialogRecipeMeta>;
