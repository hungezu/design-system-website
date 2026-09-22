export type CandidateApprovalDisposition = 'approve' | 'modify' | 'merge' | 'reject';
export declare const CANDIDATE_MODIFY_IDS: readonly ["favorite", "alert", "question", "check", "online-status", "search-zoom-in", "search-zoom-out", "filter-applied", "data-grid", "grid-layout", "layout", "text", "window", "link", "redo", "undo", "unlink", "list-view", "sort-alpha", "maximize", "minimize", "code", "history"];
export declare const CANDIDATE_MERGE_TARGETS: Readonly<Record<string, string>>;
export declare const CANDIDATE_REJECT_REASONS: Readonly<Record<string, string>>;
export declare function candidateApprovalDisposition(id: string): CandidateApprovalDisposition;
export declare const ICON_CANDIDATE_BATCH_APPROVAL: {
    readonly registryVersion: "1.1.0";
    readonly approvedBy: "设计师确认 · 首批 Icon 候选内容审查";
    readonly approvedAt: "2026-09-14T10:09:09+08:00";
    readonly note: "仅批准审批清单中的建议批准项；修改、合并、驳回项保持不可调用。";
};
