import type { ButtonRecipeMeta, ProjectRelease, Scheme, SelectRecipeMeta } from '../types';
export declare const RELEASE_SCHEMA_VERSION = "bds-release/3";
export declare const COMPONENT_RUNTIME_VERSION = "bds-components/1.1.0";
/**
 * 发布文件集合按 schemaVersion 选择（历史版本不可破坏）：
 * - bds-release/1（旧）：固定 9 文件（无 icons.json / patterns.json）；
 * - bds-release/2（Icon Pack 起）：10 文件（+ icons.json）；
 * - bds-release/3（Page Pattern 起）：11 文件（+ patterns.json）。
 * 完整性校验（getFrozenArtifacts / loader / verify 脚本）全部按
 * 发布记录自身的 schemaVersion 取集合，旧版本校验不受影响。
 */
export declare const RELEASE_ARTIFACT_PATHS_V1: readonly string[];
export declare const RELEASE_ARTIFACT_PATHS_V2: readonly string[];
export declare const RELEASE_ARTIFACT_PATHS_V3: readonly string[];
/** 当前编译使用的文件集合（schema v3：11 文件，patterns.json 位于 icons.json 之后） */
export declare const RELEASE_ARTIFACT_PATHS: readonly string[];
/** 按 schemaVersion 选择正式文件集合（未知版本按 v1，从严） */
export declare function releaseArtifactPaths(schemaVersion: string | undefined): readonly string[];
/** 非 manifest 文件数（manifest.artifactFiles 项数）：v1=8 / v2=9 / v3=10 */
export declare function artifactFilesCount(schemaVersion: string | undefined): number;
/**
 * 唯一的整包 checksum 算法：
 * 取 8 个非 manifest 文件，按 path 排序后以 `path + "\n" + fileChecksum`
 * 逐行拼接，对拼接结果做 FNV-1a 128 哈希。
 * 编译（compileRelease）与冻结校验（getFrozenArtifacts）共用本函数，
 * 禁止出现第二套整包算法。
 */
export declare function computePackageChecksum(files: {
    path: string;
    checksum: string;
}[]): string;
export interface CompiledArtifact {
    path: string;
    content: string;
    bytes: number;
    checksum: string;
    mediaType: string;
}
export interface CompileResult {
    files: CompiledArtifact[];
    /** 除 manifest.json 外全部文件（排序路径 + 内容）的整包哈希 */
    checksum: string;
    manifestJson: string;
}
export declare function hashContent(content: string): string;
/** manifest.iconPack（schema v2：不再为 null；defaultSize 供 Provider 注入 Icon Profile Context） */
export declare function manifestIconPack(scheme: Scheme, release: ProjectRelease): {
    status: string;
    version: string;
    count: number;
    defaultWeight: string;
    defaultSize: string;
    strokeWidth: number;
    registryVersion: string;
    source: string;
    checksum: string;
};
/**
 * patterns.json（schema v3：页面内容排版模式）：
 * - 项目 Pattern 已确认 → 正式产物（resolved 值 + 响应式三档 +
 *   slotMapping + patternCss + 字段来源统计 + checksum）；
 * - 项目未配置 → platform-default 回退并如实标注（fallback，
 *   missing 说明；submit 阶段已阻止「未确认候选」进入发布）。
 */
export declare function compilePatterns(scheme: Scheme, release: ProjectRelease): string;
/** manifest.patternPack（schema v3：结构化摘要；v3 前资产为 null） */
export declare function manifestPatternPack(scheme: Scheme, release: ProjectRelease): {
    patternId: string;
    status: string;
    version: string;
    checksum: string;
    fieldStatus: {
        confirmed: number;
        total: number;
    };
} | null;
/** 编译发布资产（唯一入口；输入为完整 ProjectRelease，只读其 snapshot 与元信息） */
export declare function compileRelease(release: ProjectRelease): CompileResult;
/** 校验已存储发布的资产完整性（重编译一致 = 未被篡改且确定） */
export declare function verifyReleaseChecksum(release: ProjectRelease, compiled: CompileResult): boolean;
export type { ButtonRecipeMeta, SelectRecipeMeta };
