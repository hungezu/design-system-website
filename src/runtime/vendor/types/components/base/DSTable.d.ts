import React from 'react';
export type TableDensity = 'compact' | 'default' | 'comfortable';
export interface DSTableColumn<Row> {
    key: string;
    title: string;
    /** 单元格取值（row → 文本）；省略时渲染 row[key] */
    render?: (row: Row) => React.ReactNode;
    /** 该列可排序（单列排序，受控 sort） */
    sortable?: boolean;
    /** 列宽（px；缺省自适应） */
    width?: number;
    /** 长文本溢出省略（默认开启） */
    ellipsis?: boolean;
}
export interface DSTablePagination {
    /** 受控页码（从 1 开始） */
    page: number;
    pageSize: number;
    onPageChange?: (page: number) => void;
}
export interface DSTableProps<Row> {
    columns: DSTableColumn<Row>[];
    data: Row[];
    /** 行唯一键（row → string） */
    rowKey: (row: Row) => string;
    loading?: boolean;
    /** 空状态内容（默认「暂无数据」） */
    emptyState?: React.ReactNode;
    /** 行选择（受控 keys 集合） */
    selectable?: boolean;
    selectedRowKeys?: string[];
    onSelectionChange?: (keys: string[]) => void;
    /** 某行是否禁止选择 */
    isRowSelectable?: (row: Row) => boolean;
    /** 单列排序（受控：{ key, dir }） */
    sort?: {
        key: string;
        dir: 'asc' | 'desc';
    } | null;
    onSortChange?: (sort: {
        key: string;
        dir: 'asc' | 'desc';
    } | null) => void;
    /** 内置分页（受控；与外部 DSPagination 组合时同样适用） */
    pagination?: DSTablePagination;
    density?: TableDensity;
    /** 固定表头（容器内滚动时表头粘性） */
    stickyHeader?: boolean;
    className?: string;
}
export declare function DSTable<Row>(props: DSTableProps<Row>): React.JSX.Element;
