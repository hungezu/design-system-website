import React from 'react';
export type FeedbackTone = 'info' | 'success' | 'warning' | 'error';
export type FeedbackSize = 'sm' | 'md' | 'lg';
export interface DSLoadingProps {
    label?: string;
    size?: FeedbackSize;
}
export declare function DSLoading({ label, size }: DSLoadingProps): React.JSX.Element;
export interface DSEmptyProps {
    title?: string;
    description?: string;
    action?: React.ReactNode;
}
export declare function DSEmpty({ title, description, action }: DSEmptyProps): React.JSX.Element;
export interface DSAlertProps {
    title: string;
    children?: React.ReactNode;
    tone?: FeedbackTone;
    onClose?: () => void;
}
export declare function DSAlert({ title, children, tone, onClose }: DSAlertProps): React.JSX.Element;
export interface DSToastProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
    tone?: FeedbackTone; /** 0 = persistent. Timer pauses on focus/hover. */
    duration?: number; /** Explicit protected-focus notification. Default is non-modal. */
    modal?: boolean;
}
export declare function DSToast({ open, onOpenChange, message, tone, duration, modal }: DSToastProps): React.JSX.Element;
export interface DSTagProps {
    children: React.ReactNode;
    onRemove?: () => void;
    disabled?: boolean;
    label?: string;
}
export declare function DSTag({ children, onRemove, disabled, label }: DSTagProps): React.JSX.Element;
export interface DSBadgeProps {
    children: React.ReactNode;
    tone?: FeedbackTone;
}
export declare function DSBadge({ children, tone }: DSBadgeProps): React.JSX.Element;
