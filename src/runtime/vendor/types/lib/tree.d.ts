import type { LayoutNode, NodeKind, SizeSpec } from '../types';
export interface OpResult {
    ok: boolean;
    error?: string;
}
export interface TreeIssue {
    level: 'error' | 'info';
    code: string;
    message: string;
    nodeId?: string;
}
export declare function walk(root: LayoutNode, fn: (node: LayoutNode, parent: LayoutNode | null) => void): void;
export declare function findNode(root: LayoutNode, id: string): LayoutNode | null;
export declare function parentNode(root: LayoutNode, id: string): LayoutNode | null;
export declare function findPath(root: LayoutNode, id: string): LayoutNode[] | null;
export declare function pathLabel(root: LayoutNode, id: string): string;
/** id 是否位于 ancestorId 的子树内（不含 ancestorId 自身） */
export declare function isDescendant(root: LayoutNode, ancestorId: string, id: string): boolean;
export declare function collectIds(root: LayoutNode): string[];
export declare function hasLocked(node: LayoutNode): boolean;
/** 可作为「移动到」目标的容器：排除自身及其子树 */
export declare function containerTargets(root: LayoutNode, excludeId: string): {
    id: string;
    path: string;
}[];
export declare function insertNode(root: LayoutNode, parentId: string, node: LayoutNode, index?: number): OpResult;
export declare function removeNode(root: LayoutNode, id: string): OpResult;
export declare function moveNode(root: LayoutNode, id: string, targetParentId: string, index?: number): OpResult;
export declare function nudge(root: LayoutNode, id: string, delta: 1 | -1): OpResult;
export interface ValidateOptions {
    knownComponentRefs?: string[];
}
export declare function validateTree(root: LayoutNode, opts?: ValidateOptions): TreeIssue[];
/** 跨树重复 ID 检查（系统布局 + 各页面内容树） */
export declare function crossTreeDuplicateIds(root: LayoutNode, otherRoots: LayoutNode[]): string[];
export declare function sizeToText(s: SizeSpec): string;
export declare function newNodeTemplate(kind: NodeKind, name: string): LayoutNode;
