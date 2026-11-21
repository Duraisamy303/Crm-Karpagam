import React from 'react';

const TextInput = (props: any) => {
    const { value, onChange, placeholder, type, title, name, required, className, error, ...rest } = props;

    return (
        <div className="w-full">
            {title && (
                <label className="mb-1 block font-bold text-gray-700 dark:text-gray-300">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type || 'text'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                name={name}
                required={required}
                className={`w-full rounded-xl border p-2.5 text-xs font-semibold text-gray-800 focus:outline-none dark:text-white ${
                    error
                        ? 'border-red-500 bg-white focus:border-red-500 dark:bg-gray-800'
                        : 'border-gray-200 bg-white focus:border-[#39854a] dark:border-gray-700 dark:bg-gray-800'
                } ${className ?? ''}`}
                {...rest}
            />
            {error && (
                <p className="mt-1.5 text-xs text-red-600" id={`${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
};

export default TextInput;
