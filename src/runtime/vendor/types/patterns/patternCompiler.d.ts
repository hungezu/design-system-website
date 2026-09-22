import type { ProjectRelease, Scheme } from '../types';
import type { ProjectQueryListPattern } from './queryListPattern';
import { platformDefaultQueryListPattern, queryListPatternChecksum } from './queryListPattern';
export type ResolvedQueryListLayout = {
    pageContentMaxWidth: number;
    pagePaddingX: number;
    pagePaddingY: number;
    sectionGap: number;
    headerGap: number;
    headerActionAlignment: 'start' | 'end' | 'space-between';
    contentContainerMode: 'card' | 'plain';
    contentPadding: number;
    contentRadiusRole: 'radius.container' | 'none';
};
export type ResolvedQueryListFilter = {
    displayMode: 'grid' | 'flow';
    columns: number;
    rowGap: number;
    columnGap: number;
    fieldWidthMode: 'fill' | 'fixed';
    fieldMinWidth: number;
    fieldMaxWidth: number;
    labelPlacement: 'top' | 'left';
    actionPlacement: 'inline' | 'row';
    actionAlignment: 'start' | 'end';
    collapsible: boolean;
    defaultVisibleRows: number;
    backgroundRole: 'surface.subtle' | 'surface.card' | 'none';
    padding: number;
    radiusRole: 'radius.container' | 'none';
    fieldLabelTypographyRole: 'formLabel';
};
export type ResolvedQueryListResults = {
    headerAlignment: 'space-between' | 'start';
    titleActionGap: number;
    tableGap: number;
    paginationAlignment: 'start' | 'center' | 'end' | 'space-between';
    paginationGap: number;
    paginationSingleLine: boolean;
    paginationCompactMode: 'window-shrink-then-hide-boundary' | 'wrap' | 'stack';
    minTableWidth: number;
    overflowStrategy: 'scroll' | 'wrap';
    backgroundRole: 'surface.card' | 'none';
    padding: number;
    sectionTitleTypographyRole: 'sectionTitle';
    sectionMetaTypographyRole: 'sectionMeta';
};
export interface ResolvedResponsiveRules {
    breakpoints: {
        tablet: number;
        compact: number;
    };
    desktop: {
        filterColumns: number;
        actionsWrap: boolean;
        paginationAlignment: string;
        contentMaxWidth: number;
    };
    tablet: {
        filterColumns: number;
        actionsWrap: boolean;
        tableOverflow: 'scroll' | 'wrap';
    };
    compact: {
        filterColumns: number;
        actionsFullWidth: boolean;
        tableMinWidth: number;
        paginationWrap: 'wrap' | 'stack';
    };
}
export interface PatternSlotMapping {
    slot: string;
    /** 渲染 DOM 锚点（data-pattern-slot 值；页面按此顺序输出） */
    domSelector: string;
    /** 承载区域（layoutRegions role 或 content-root） */
    region: string;
}
export interface CompiledQueryListPattern {
    patternId: 'query-list';
    patternVersion: string;
    projectId: string;
    releaseVersion: string;
    resolvedLayout: ResolvedQueryListLayout;
    resolvedFilter: ResolvedQueryListFilter;
    resolvedResults: ResolvedQueryListResults;
    responsiveRules: ResolvedResponsiveRules;
    slotMapping: PatternSlotMapping[];
    /** 组合的子 Pattern id（Query List v1.1 → query-filter / active-filters / table-toolbar / bulk-actions） */
    composes: string[];
    /** Typography 角色绑定（Pattern 只绑定角色；字号 / 字重 / 行高 / 颜色由 Typography 角色决定） */
    typographyBindings: {
        fieldLabel: 'formLabel';
        sectionTitle: 'sectionTitle';
        sectionMeta: 'sectionMeta';
    };
    source: string;
    fieldStatus: {
        total: number;
        confirmed: number;
        bySource: Record<string, number>;
    };
    locked: boolean;
    /** 未确认 / 缺失说明（正式发布必须为空） */
    missing: string[];
    /** CSS 变量 + 媒体查询（Consumer 注入 <style data-bds-pattern>） */
    patternCss: string;
    checksum: string;
}
/** 编译（工作台预览 / 测试可直接调用；未确认字段按 platform 值回退并计入 missing） */
export declare function compileQueryListPattern(pattern: ProjectQueryListPattern, projectId: string, releaseVersion: string): CompiledQueryListPattern;
/** Pattern 槽位顺序（页面 DOM 顺序必须一致） */
export declare function patternSlotOrder(): string[];
/** 由 resolved 值生成 CSS：变量 + tablet / compact 媒体查询（页面禁止自写断点） */
export declare function buildPatternCss(p: {
    resolvedLayout: ResolvedQueryListLayout;
    resolvedFilter: ResolvedQueryListFilter;
    resolvedResults: ResolvedQueryListResults;
    responsiveRules: ResolvedResponsiveRules;
}): string;
/** 发布编译入口：未确认 Pattern 拒绝（候选不得自动进入正式产物） */
export declare function compileQueryListPatternForRelease(scheme: Scheme, release: ProjectRelease): {
    ok: true;
    compiled: CompiledQueryListPattern;
} | {
    ok: false;
    error: string;
};
export { platformDefaultQueryListPattern, queryListPatternChecksum };
