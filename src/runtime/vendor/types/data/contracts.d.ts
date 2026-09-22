import type { ComponentContract } from '../types';
export declare const COMPONENT_CONTRACTS: ComponentContract[];
export declare function findContract(id: string): ComponentContract | undefined;
export interface SampleColumn {
    key: string;
    title: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
}
export declare const SAMPLE_TABLE_COLUMNS: SampleColumn[];
export declare const SAMPLE_TABLE_ROWS: Record<string, string>[];
