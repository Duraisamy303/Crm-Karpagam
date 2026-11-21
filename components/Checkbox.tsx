import React from 'react';

interface CheckboxInputProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    name?: string;
    className?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ checked, onChange, label, name, className = '', error, required, disabled }) => {
    return (
        <div className={` ${className}`}>
            <label className="flex cursor-pointer items-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    name={name}
                    required={required}
                    disabled={disabled}
                    className={`form-checkbox accent-[#39854a] text-[#39854a] ${error ? 'border-red-500' : ''}`}
                />
                {label ? <span className="ml-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span> : null}
            </label>
            {error && (
                <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default CheckboxInput;
