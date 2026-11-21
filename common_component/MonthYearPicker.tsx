import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface MonthYearPickerProps {
    value?: string | null;
    onChange: (value: string) => void;
    required?: boolean;
    error?: string;
    title?: string;
    disabled?: boolean;
    className?: string;
    minDate?: Date;
    maxDate?: Date;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, onChange, required, error, title, disabled, className = '', minDate, maxDate }) => {
    const [startDate, setStartDate] = useState<Date | null>(value ? new Date(value) : null);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (date: Date | null) => {
        setStartDate(date);
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            onChange(`${year}-${month}`);
        } else {
            onChange('');
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    // Custom input component with proper TypeScript types
    const CustomInput = React.forwardRef<
        HTMLInputElement,
        React.InputHTMLAttributes<HTMLInputElement> & {
            value?: string;
            onClick?: () => void;
        }
    >(({ value, onClick, placeholder, disabled }, ref) => (
        <div className="relative">
            <input
                ref={ref}
                type="text"
                value={value}
                onClick={onClick}
                placeholder={placeholder}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={disabled}
                readOnly
                className={`
                    h-10 w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder-gray-400
                    transition-all duration-200 ease-in-out
                    ${error ? 'border-red-500  ring-red-500' : ''}
                    ${disabled ? 'cursor-not-allowed bg-gray-100 opacity-60' : 'cursor-pointer hover:border-gray-500'}
                    focus:border-transparent focus:outline-none 
                    ${className}
                `}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className={`h-5 w-5 text-gray-400 transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
    ));

    CustomInput.displayName = 'CustomInput';

    return (
        <div className="w-full ">
            {title && (
                <label className="block text-sm font-bold text-gray-700">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <DatePicker
                selected={startDate}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                dateFormat="MMMM yyyy"
                showMonthYearPicker
                showFullMonthYearPicker
                customInput={<CustomInput />}
                placeholderText="Select month"
                required={required}
                disabled={disabled}
                minDate={minDate}
                maxDate={maxDate}
                popperClassName="month-year-picker-popper"
                wrapperClassName="w-full"
                renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
                    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
                        <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            type="button"
                            className={`
                                rounded-lg p-2 transition-all duration-200
                                ${prevMonthButtonDisabled ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}
                            `}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-1 text-lg font-bold text-gray-900">{date.getFullYear()}</div>

                        <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            type="button"
                            className={`
                                rounded-lg p-2 transition-all duration-200
                                ${nextMonthButtonDisabled ? 'cursor-not-allowed text-gray-300' : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'}
                            `}
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            />

            {error && (
                <div className="mt-2 flex items-center space-x-1">
                    <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm  text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
};

export default MonthYearPicker;
