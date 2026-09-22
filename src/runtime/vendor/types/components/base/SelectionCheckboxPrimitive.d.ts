import React from 'react';
export interface SelectionCheckboxPrimitiveProps {
    /** 可访问名称（必填：无可见 Label，aria-label 提供给辅助技术） */
    'aria-label': string;
    /** 受控选中态 */
    isSelected: boolean;
    /** 半选（全选场景：部分行选中） */
    isIndeterminate?: boolean;
    /** 禁用（不可选行 / 无可选行） */
    isDisabled?: boolean;
    /** 选中变化 */
    onChange: (isSelected: boolean) => void;
    className?: string;
}
export declare function SelectionCheckboxPrimitive({ 'aria-label': ariaLabel, isSelected, isIndeterminate, isDisabled, onChange, className, }: SelectionCheckboxPrimitiveProps): React.JSX.Element;
