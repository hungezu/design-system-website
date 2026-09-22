import React from 'react';
export type InputSize = 'sm' | 'md' | 'lg';
export interface DSInputProps {
    /** 字段标签（与输入框自动关联） */
    label: string;
    /** 受控值；传 undefined 表示非受控 */
    value?: string;
    /** 非受控初始值 */
    defaultValue?: string;
    /** 值变化回调（中文组合输入过程中不触发业务侧截断） */
    onChange?: (value: string) => void;
    /** 占位文字 */
    placeholder?: string;
    /** 辅助说明（关联 aria-describedby） */
    description?: string;
    /** 错误提示（invalid 时显示并关联控件） */
    errorMessage?: string;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    invalid?: boolean;
    size?: InputSize;
    /** 前缀槽位（图标 / 文字） */
    prefix?: React.ReactNode;
    /** 后缀槽位（图标 / 文字） */
    suffix?: React.ReactNode;
    /** 显示清空按钮（有值且可编辑时出现） */
    clearable?: boolean;
    /** 最大字符数（计数与截断由 React Aria Input 原生 maxLength 保证） */
    maxLength?: number;
    /** 表单提交名 */
    name?: string;
    className?: string;
}
export declare function DSInput({ label, value, defaultValue, onChange, placeholder, description, errorMessage, required, disabled, readOnly, invalid, size, prefix, suffix, clearable, maxLength, name, className, }: DSInputProps): React.JSX.Element;
