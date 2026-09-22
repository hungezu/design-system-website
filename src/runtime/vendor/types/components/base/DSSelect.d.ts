import React from 'react';
export interface DSSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}
export type SelectSize = 'sm' | 'md' | 'lg';
export interface DSSelectProps {
    /** 字段标签（与控件自动关联） */
    label: string;
    /** 未选择时的占位文字 */
    placeholder?: string;
    /** 受控选中值（option.value）；传 undefined 表示非受控 */
    value?: string | null;
    /** 非受控初始值 */
    defaultValue?: string;
    /** 选中变化回调（受控必须提供） */
    onChange?: (value: string) => void;
    options: DSSelectOption[];
    size?: SelectSize;
    disabled?: boolean;
    /** 只读：保留当前值与下拉语义，但禁止修改和清空 */
    readOnly?: boolean;
    required?: boolean;
    invalid?: boolean;
    /** 辅助说明（关联到控件，辅助技术可读） */
    description?: string;
    /** 错误提示（invalid 时显示并关联控件） */
    errorMessage?: string;
    /** 表单提交name（原生表单序列化） */
    name?: string;
    /** Label 视觉隐藏（保留可访问名称与 label 关联）：分页每页条数等内联场景 */
    labelVisuallyHidden?: boolean;
    /** 显示清空按钮；只清空当前 Select 的值 */
    clearable?: boolean;
    onClear?: () => void;
    className?: string;
}
export declare function DSSelect({ label, placeholder, value, defaultValue, onChange, options, size, disabled, readOnly, required, invalid, description, errorMessage, name, labelVisuallyHidden, clearable, onClear, className, }: DSSelectProps): React.JSX.Element;
