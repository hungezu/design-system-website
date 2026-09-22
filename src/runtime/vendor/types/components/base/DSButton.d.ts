import React from 'react';
/** 业务语义 variant（新代码只使用这三个值） */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
/**
 * @deprecated 旧视觉值：仅保留在内部兼容层与数据迁移，新业务代码 / 文档 / 类型不得使用。
 * 传入时按其显式视觉渲染（不随 Recipe 切换）；方案数据加载时会被迁移为语义值。
 */
export type LegacyButtonVariant = 'secondary-outline' | 'secondary-soft';
export type ButtonSemantic = 'default' | 'danger';
export type ControlSize = 'sm' | 'md' | 'lg';
export interface DSButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** 操作层级（业务语义）。视觉形式由 Button Recipe 决定 */
    variant?: ButtonVariant | LegacyButtonVariant;
    semantic?: ButtonSemantic;
    size?: ControlSize;
    /** 图标槽位（统一插槽，非 Icon 系统；内容由调用方提供） */
    icon?: React.ReactNode;
    /** 图标位置：缺省跟随 Recipe（项目级默认） */
    iconPosition?: 'start' | 'end';
}
export declare function DSButton({ variant, semantic, size, icon, iconPosition, className, type, children, ...rest }: DSButtonProps): React.JSX.Element;
