import React from 'react';
export interface DSTabItem {
    id: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
}
export interface DSTabsProps {
    label: string;
    items: DSTabItem[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
}
export declare function DSTabs({ label, items, value, defaultValue, onChange, disabled, orientation }: DSTabsProps): React.JSX.Element;
export interface DSDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    dismissible?: boolean;
    closeOnEscape?: boolean;
}
export declare function DSDrawer({ open, onOpenChange, title, description, children, footer, size, loading, dismissible, closeOnEscape }: DSDrawerProps): React.JSX.Element;
