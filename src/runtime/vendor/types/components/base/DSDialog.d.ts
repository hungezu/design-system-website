import React from 'react';
export type DialogSize = 'sm' | 'md' | 'lg';
export interface DSDialogProps {
    /** 是否打开（受控） */
    open: boolean;
    /** 打开 / 关闭变化（Escape / 遮罩点击时由 React Aria 触发） */
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    /** 底部操作区（建议使用 DSButton） */
    footer?: React.ReactNode;
    size?: DialogSize;
    /** 点击遮罩是否关闭（默认 true；false = 禁止遮罩关闭） */
    dismissible?: boolean;
    /** Escape 是否关闭（默认 true） */
    closeOnEscape?: boolean;
    /** 无障碍名称前缀 */
    'aria-label'?: string;
}
export declare function DSDialog({ open, onOpenChange, title, description, children, footer, size, dismissible, closeOnEscape, ...rest }: DSDialogProps): React.JSX.Element;
