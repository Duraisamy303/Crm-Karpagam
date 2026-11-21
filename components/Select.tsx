import React from 'react';
import Select, { components } from 'react-select';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: Option | null;
    onChange: (selectedOption: Option | null) => void;
    placeholder?: string;
    title?: string;
    isSearchable?: boolean;
    className?: string;
    error?: string;
    isMulti?: boolean;
    required?: boolean;
    loadMore?: any;
    menuOpen?: any;
    disabled?: boolean;
    isClearable?: boolean;
    loading?: boolean;
}

// Custom clear indicator — small X shown when a value is selected
const ClearIndicator = (props: any) => (
    <components.ClearIndicator {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    </components.ClearIndicator>
);

const CustomSelect = (props: SelectProps) => {
    const {
        disabled,
        options,
        value,
        onChange,
        placeholder = 'Select...',
        title,
        isSearchable = true,
        className,
        error,
        isMulti,
        required,
        loadMore,
        menuOpen,
        isClearable,
        loading,
    } = props;

    const customStyles = {
        control: (provided: any, state: any) => ({
            ...provided,
            borderRadius: '0.75rem', // rounded-xl
            borderWidth: '1px',
            borderColor: error ? '#ef4444' : state.isFocused ? '#39854a' : '#e5e7eb',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            fontSize: '0.75rem', // text-xs
            fontWeight: 600,
            color: '#1f2937', // gray-800
            minHeight: 'unset',
            paddingTop: '0.6rem',    // matches p-2.5 (10px) minus valueContainer padding
            paddingBottom: '0.6rem',
            paddingLeft: '0.5rem',
            paddingRight: '0.25rem',
            '&:hover': {
                borderColor: error ? '#ef4444' : '#39854a',
            },
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            padding: '0',
        }),
        input: (provided: any) => ({
            ...provided,
            margin: '0',
            padding: '0',
            fontSize: '0.75rem',
            fontWeight: 600,
        }),
        singleValue: (provided: any) => ({
            ...provided,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'inherit',
        }),
        placeholder: (provided: any) => ({
            ...provided,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#9ca3af', // gray-400
        }),
        indicatorSeparator: () => ({ display: 'none' }),
        dropdownIndicator: (provided: any, state: any) => ({
            ...provided,
            padding: '0 4px',
            color: '#6b7280',
            // hide the arrow entirely — we show a clear icon instead when value exists
            display: state.hasValue ? 'none' : 'flex',
        }),
        clearIndicator: (provided: any) => ({
            ...provided,
            padding: '0 4px',
            color: '#9ca3af',
            cursor: 'pointer',
            '&:hover': { color: '#ef4444' },
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            zIndex: 9999,
            overflow: 'hidden',
        }),
        menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
        option: (provided: any, state: any) => ({
            ...provided,
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: state.isSelected
                ? '#39854a'
                : state.isFocused
                  ? '#f0fdf4'
                  : 'transparent',
            color: state.isSelected ? '#fff' : '#1f2937',
            cursor: 'pointer',
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: '#f0fdf4',
            borderRadius: '0.5rem',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#39854a',
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: '#39854a',
            '&:hover': { backgroundColor: '#dcfce7', color: '#166534' },
        }),
    };

    return (
        <div className={`w-full ${className ?? ''}`}>
            {title && (
                <label className="mb-1 block font-bold text-gray-700 dark:text-gray-300">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <Select
                isDisabled={disabled}
                placeholder={placeholder}
                options={options}
                value={value}
                onChange={onChange}
                isSearchable={isSearchable}
                isMulti={isMulti}
                isClearable={isClearable ?? true}
                styles={customStyles}
                components={{ ClearIndicator }}
                onMenuOpen={() => menuOpen && menuOpen(true)}
                onMenuClose={() => menuOpen && menuOpen(false)}
                onMenuScrollToBottom={loadMore}
                isLoading={loading ?? false}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
            />
            {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default CustomSelect;
