export interface RuntimeComponentEntry {
    /** 组件契约 id（与工作台组件契约一致） */
    id: 'button' | 'select' | 'input' | 'table' | 'pagination' | 'dialog' | 'icon';
    /** 展示名 */
    name: string;
    /** runtime 公开导出名（业务方 import 用的标识符） */
    runtimeExport: 'DSButton' | 'DSSelect' | 'DSInput' | 'DSTable' | 'DSPagination' | 'DSDialog' | 'DSIcon';
    /** 实现源码路径 */
    sourcePath: string;
}
export declare const RUNTIME_COMPONENT_REGISTRY: Readonly<Record<'button' | 'select' | 'input' | 'table' | 'pagination' | 'dialog' | 'icon', RuntimeComponentEntry>>;
export type RuntimeComponentId = keyof typeof RUNTIME_COMPONENT_REGISTRY;
/** 全部已注册组件（顺序稳定：注册表键序） */
export declare function listRuntimeComponents(): RuntimeComponentEntry[];
/** 按 id 查询注册组件 */
export declare function getRuntimeComponent(id: string): RuntimeComponentEntry | null;
/** 名称是否为 runtime 公开导出的组件（用于入口导出面校验） */
export declare function isRuntimeComponentExport(exportName: string): boolean;
/** 增量 Runtime 扩展清单：可直接从入口消费；不改变 Frozen 资产的 7 件套声明。 */
export declare const RUNTIME_EXTENSION_REGISTRY: readonly ["DSToast", "DSTabs", "DSDrawer", "DSEmpty", "DSLoading", "DSAlert", "DSForm", "DSField", "DSUpload", "DSTag", "DSBadge", "DSRadio", "DSSwitch", "DSCheckbox"];
export type RuntimeExtensionExport = typeof RUNTIME_EXTENSION_REGISTRY[number];
