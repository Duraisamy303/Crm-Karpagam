import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SelectProps {
    onChange: (year: number) => void;
    placeholder?: string;
    title?: string;
    isSearchable?: boolean;
    className?: string;
    error?: string;
    isMulti?: boolean;
    required?: boolean;
    loadMore?: any;
    value: any;
}

const YearPicker = (props: SelectProps) => {
    const { value, onChange, placeholder = 'Select...', title, className, error, required } = props;

    const [selectedYear, setSelectedYear] = useState<Date | null>(null);

    useEffect(() => {
        if (value) {
            setSelectedYear(new Date(value, 0, 1));
        }
    }, [value]);

    const handleChange = (date: Date) => {
        setSelectedYear(date);
        if (onChange) {
            const year = date?.getFullYear();
            onChange(year);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {title && (
                <label className="block text-sm font-bold">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <DatePicker
                selected={selectedYear}
                onChange={handleChange}
                showYearPicker
                dateFormat="yyyy"
                placeholderText={placeholder}
                yearItemNumber={12}
                scrollableYearDropdown
                className={`form-input ${className} ${error ? 'border-red-500' : ''}`}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default YearPicker;
