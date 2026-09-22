import React from 'react';
export interface DSFormProps {
    children: React.ReactNode;
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    label?: string;
}
export declare function DSForm({ children, onSubmit, disabled, loading, error, label }: DSFormProps): React.JSX.Element;
export interface DSFieldControlProps {
    id: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
    'aria-required'?: boolean;
}
export interface DSFieldProps {
    label: string;
    children: (props: DSFieldControlProps) => React.ReactNode;
    description?: string;
    error?: string;
    required?: boolean;
}
export declare function DSField({ label, children, description, error, required }: DSFieldProps): React.JSX.Element;
export interface DSCheckboxProps {
    label: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
    errorMessage?: string;
    indeterminate?: boolean;
    name?: string;
    value?: string;
    required?: boolean;
}
export declare function DSCheckbox({ label, checked, defaultChecked, onChange, disabled, loading, invalid, errorMessage, indeterminate, name, value, required }: DSCheckboxProps): React.JSX.Element;
export interface DSSwitchProps extends Omit<DSCheckboxProps, 'indeterminate' | 'required' | 'invalid' | 'errorMessage' | 'value'> {
}
export declare function DSSwitch({ label, checked, defaultChecked, onChange, disabled, loading, name }: DSSwitchProps): React.JSX.Element;
export interface DSRadioProps {
    label: string;
    options: {
        value: string;
        label: string;
        disabled?: boolean;
    }[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    loading?: boolean;
    required?: boolean;
    invalid?: boolean;
    errorMessage?: string;
    description?: string;
    name?: string;
}
export declare function DSRadio({ label, options, value, defaultValue, onChange, disabled, loading, required, invalid, errorMessage, description, name }: DSRadioProps): React.JSX.Element;
export interface DSUploadProps {
    label: string;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    maxBytes?: number;
    onFiles: (files: File[]) => void;
    onError?: (message: string) => void;
}
export declare function DSUpload({ label, accept, multiple, disabled, loading, error, maxBytes, onFiles, onError }: DSUploadProps): React.JSX.Element;
