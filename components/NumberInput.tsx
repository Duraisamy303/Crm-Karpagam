import React from 'react';

const NumberInput = (props: any) => {
    const { value, onChange, placeholder, title, name, required, className, error, min, max, ...rest } = props;

    return (
        <div className="w-full">
            {title && (
                <label className="block text-sm font-bold text-gray-700">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type="number" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                name={name}
                className={`form-input ${className} ${error ? 'border-red-500' : ''}`} 
                required={required}
                min={min} 
                max={max}
                {...rest}
            />
            {error && (
                <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default NumberInput;
