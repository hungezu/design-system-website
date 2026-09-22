import React from 'react';
import { type IconSizeToken, type IconWeight } from '../../icons/iconGrammar';
/** 可调用图标语义 id（只有 Registry published 集合内的 id 有效） */
export type IconName = string;
export type { IconWeight };
export type IconSize = IconSizeToken | number;
export interface DSIconProps {
    /** 图标语义 id（Icon Registry published 集合） */
    name: IconName;
    /** 视觉重量：Reicon 真实双变体（项目 Profile 可统一默认） */
    weight?: IconWeight;
    /** 尺寸：Token（xs12/sm16/md20/lg24）或显式 px */
    size?: IconSize;
    /** 颜色（默认 currentColor；规范不使用其他取值） */
    color?: 'currentColor';
    /** 装饰图标：aria-hidden，不朗读（按钮内图标请配文本或 aria-label） */
    decorative?: boolean;
    /** 非装饰图标的可访问名称（decorative=false 时必填） */
    label?: string;
    className?: string;
}
export declare function DSIcon({ name, weight, size, color, decorative, label, className }: DSIconProps): React.JSX.Element;
