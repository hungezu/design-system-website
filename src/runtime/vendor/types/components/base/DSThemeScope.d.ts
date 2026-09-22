import React from 'react';
/** 主题变量集合：key 为 --bds-* CSS 自定义属性名，value 为解析后的值 */
export type BdsScopeVars = Record<string, string>;
export declare const BdsScopeVarsContext: React.Context<BdsScopeVars>;
/** 读取当前主题作用域变量（Portal 弹层注入用） */
export declare function useBdsScopeVars(): BdsScopeVars;
/** 包裹子树并提供主题变量（供主题作用域容器使用；变量同时以 style 渲染到 DOM） */
export declare function BdsScopeVarsProvider({ vars, children }: {
    vars: BdsScopeVars;
    children: React.ReactNode;
}): React.JSX.Element;
