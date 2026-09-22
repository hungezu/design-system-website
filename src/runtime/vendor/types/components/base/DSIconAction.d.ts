import React from 'react';
export type DismissIconSemantic = 'close' | 'clear-input' | 'remove-item';
export interface DSIconActionProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
    semantic: DismissIconSemantic;
    'aria-label': string;
    compact?: boolean;
    danger?: boolean;
}
/** 关闭 / 清空 / 单项移除的统一可访问按钮；图形只经 DSIcon 稳定语义 ID。 */
export declare function DSIconAction({ semantic, compact, danger, className, ...props }: DSIconActionProps): React.JSX.Element;
