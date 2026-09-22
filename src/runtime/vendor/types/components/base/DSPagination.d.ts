import React from 'react';
/** 总页数计算 */
export declare function getTotalPages(total: number, pageSize: number): number;
/** 越界安全回退：数据减少导致当前页超出时回退到最后一页 */
export declare function getEffectivePage(page: number, total: number, pageSize: number): number;
/** 页码窗口（当前页居中，边界收敛），用于渲染页码按钮 */
export declare function getPageWindow(page: number, totalPages: number, maxVisible?: number): number[];
/**
 * 页容量必须能被选择器真实回显。调用方遗漏当前值时，开发期告警，
 * 同时把当前值补入安全选项，避免 DSSelect 回退到无关占位文案。
 */
export declare function normalizePageSizeOptions(pageSize: number, options: number[]): {
    options: number[];
    matched: boolean;
};
export interface DSPaginationProps {
    /** 当前页（从 1 开始；越界时由 getEffectivePage 安全回退展示） */
    page: number;
    pageSize: number;
    /** 数据总数 */
    total: number;
    /** 每页条数选项（默认 [10, 20, 50]） */
    pageSizeOptions?: number[];
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    disabled?: boolean;
    /** 显示总数说明 */
    showTotal?: boolean;
    className?: string;
}
export declare function DSPagination({ page, pageSize, total, pageSizeOptions, onPageChange, onPageSizeChange, disabled, showTotal, className, }: DSPaginationProps): React.JSX.Element;
