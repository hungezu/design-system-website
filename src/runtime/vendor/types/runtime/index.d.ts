import React from 'react';
import { DSButton } from '../components/base/DSButton';
import { DSSelect } from '../components/base/DSSelect';
import type { DSSelectOption } from '../components/base/DSSelect';
import { DSInput } from '../components/base/DSInput';
import { DSTable } from '../components/base/DSTable';
import { DSPagination } from '../components/base/DSPagination';
import { DSDialog } from '../components/base/DSDialog';
import { DSIcon } from '../components/base/DSIcon';
import { DSEmpty, DSLoading, DSAlert, DSToast, DSTag, DSBadge } from '../components/base/DSFeedback';
import { DSTabs, DSDrawer } from '../components/base/DSNavigation';
import { DSForm, DSField, DSUpload, DSCheckbox, DSSwitch, DSRadio } from '../components/base/DSForms';
import type { DSInputProps, InputSize } from '../components/base/DSInput';
import type { DSTableProps, DSTableColumn, DSTablePagination, TableDensity } from '../components/base/DSTable';
import type { DSPaginationProps } from '../components/base/DSPagination';
import type { DSDialogProps, DialogSize } from '../components/base/DSDialog';
import type { DSIconProps, IconName, IconSize, IconWeight } from '../components/base/DSIcon';
import '../styles/preview.css';
export { DSButton, DSSelect, DSInput, DSTable, DSPagination, DSDialog, DSIcon, DSEmpty, DSLoading, DSAlert, DSToast, DSTabs, DSDrawer, DSForm, DSField, DSUpload, DSCheckbox, DSSwitch, DSRadio, DSTag, DSBadge };
export type { DSEmptyProps, DSLoadingProps, DSAlertProps, DSToastProps, FeedbackTone, FeedbackSize, DSTagProps, DSBadgeProps } from '../components/base/DSFeedback';
export type { DSTabsProps, DSTabItem, DSDrawerProps } from '../components/base/DSNavigation';
export type { DSFormProps, DSFieldProps, DSUploadProps, DSCheckboxProps, DSSwitchProps, DSRadioProps } from '../components/base/DSForms';
export type { DSSelectOption };
export type { DSButtonProps, ButtonVariant, ButtonSemantic, ControlSize } from '../components/base/DSButton';
export type { DSInputProps, InputSize };
export type { DSTableProps, DSTableColumn, DSTablePagination, TableDensity };
export type { DSPaginationProps };
export type { DSDialogProps, DialogSize };
export type { DSIconProps, IconName, IconSize, IconWeight };
export { ICON_REGISTRY, getIcon } from '../../icons/iconRegistry';
export { RUNTIME_COMPONENT_REGISTRY, RUNTIME_EXTENSION_REGISTRY, listRuntimeComponents, getRuntimeComponent, isRuntimeComponentExport } from './registry';
export type { RuntimeComponentEntry, RuntimeComponentId, RuntimeExtensionExport } from './registry';
/** manifest.json 的正式类型（发布资产清单） */
export interface ReleaseManifest {
    schemaVersion: string;
    projectId: string;
    projectName: string;
    releaseVersion: string;
    status: string;
    publishedAt: string | null;
    approvedBy: string;
    checksum: string;
    runtimeCompatibility: {
        runtime: string;
        entry: string;
        minReact: string;
        styleStrategy: string;
        componentRuntimeVersion: string;
    };
    colorSystemVersion: string | null;
    interactionColorPreset: string | null;
    componentRuntimeVersion: string;
    availableComponents: {
        id: string;
        name: string;
        runtimeExport: string | null;
        sourcePath: string;
    }[];
    /** schema v2（bds-release/2）起为结构化 Icon Pack；schema v1 为 null（回退 outline/md） */
    iconPack: IconPackManifest | null;
    figmaLibrary: string;
    artifactFiles: {
        path: string;
        bytes: number;
        checksum: string;
        mediaType: string;
    }[];
    missingCapabilities: string[];
    sourceSummary: Record<string, unknown>;
}
/** manifest.iconPack（schema v2；defaultSize 自 v1.3.1 起提供，旧 v2 资产缺失时回退 md） */
export interface IconPackManifest {
    status: string;
    version: string;
    count: number;
    defaultWeight: string;
    defaultSize?: string;
    strokeWidth?: number;
    source: string;
    checksum: string;
}
export interface DesignSystemProviderProps {
    /** 发布资产 manifest（用于作用域 projectId、版本标注与 Icon Profile） */
    manifest: ReleaseManifest | null;
    /** tokens.css 的文本内容（发布资产原样注入，不在运行时改写） */
    tokens: string;
    /** recipes.json（当前仅用于标注版本；造型经 CSS 变量生效） */
    recipes?: unknown;
    /** icons.json 文本（可选；提供时 published 图标范围进入 Icon Profile Context） */
    icons?: string | null;
    /** patterns.json 的 patternCss 文本（可选；schema v3 起提供：--bds-pattern-* 变量 + 响应式断点） */
    patternCss?: string | null;
    children: React.ReactNode;
}
/**
 * 发布资产作用域：
 * - 注入 tokens.css（<style data-bds-release>，按 projectId 幂等替换）；
 * - 渲染 [data-ds-project] 容器（tokens.css 中的选择器作用于该子树）；
 * - 不读取工作台状态；切换发布版本 = 换一份资产重新挂载。
 */
export declare function DesignSystemProvider({ manifest, tokens, recipes, icons, patternCss, children }: DesignSystemProviderProps): React.JSX.Element;
