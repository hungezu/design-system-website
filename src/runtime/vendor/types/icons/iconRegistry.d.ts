import type { IconWeight } from './iconGrammar';
import { type IconCategory } from './iconRegistryExpansion';
import { type CandidateApprovalDisposition } from './iconCandidateDecisionPolicy';
export type { IconCategory } from './iconRegistryExpansion';
export type IconStatus = 'candidate' | 'review' | 'published' | 'deprecated';
export interface IconRegistryItem {
    id: string;
    /** Reicon 组件名（来源记录；映射权威在 reiconAdapter） */
    reiconName: string;
    nameZh: string;
    nameEn: string;
    aliases: string[];
    /** 语义意图（AI 检索主依据） */
    intent: string;
    category: IconCategory;
    recommendedContexts: string[];
    forbiddenContexts: string[];
    supportedWeights: IconWeight[];
    defaultWeight: IconWeight;
    source: 'reicon';
    sourceVersion: string;
    license: string;
    status: IconStatus;
    approvedBy: string | null;
    approvedAt: string | null;
    /** deprecated 条目迁移到的新稳定语义 id */
    replacementFor: string | null;
    /** 默认表达方式；cancel-action 默认文字，不由 AI 自动添加图标 */
    defaultRepresentation: 'icon' | 'text-only';
    /** 首批候选内容审查结论；不等同于项目 Pack 选择。 */
    reviewDisposition?: CandidateApprovalDisposition;
    governanceNote?: string;
    mergeInto?: string | null;
}
export declare const ICON_REGISTRY_VERSION: "1.1.0";
export declare const ICON_REGISTRY: readonly IconRegistryItem[];
export declare function getIcon(id: string): IconRegistryItem | undefined;
/** 全部 published 图标（页面与组件唯一可调用集合；含 deprecated=false） */
export declare function publishedIcons(): IconRegistryItem[];
export declare function publishedIconIds(): string[];
/** id 是否可供页面 / 组件调用（只有 published） */
export declare function isIconCallable(id: string): boolean;
export declare function iconsByCategory(): Record<IconCategory, IconRegistryItem[]>;
export declare function iconsByStatus(status: IconStatus): IconRegistryItem[];
/** published 图标总数与分类统计（发布 icons.json / 报告用） */
export declare function iconRegistryStats(): {
    total: number;
    published: number;
    callable: number;
    textOnly: number;
    review: number;
    candidate: number;
    deprecated: number;
    byCategory: Record<IconCategory, number>;
};
/** 同一语义默认图标唯一性：同 id 天然唯一；此函数校验 recommendedContexts 默认指向不冲突（保留治理钩子） */
export declare function defaultIconForContext(context: string): IconRegistryItem | undefined;
