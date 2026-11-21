import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomeDatePicker = (props: any) => {
    const { value, onChange, title, name, required, className, error, placeholder, minDate, ...rest } = props;

    const CustomInput = ({ value: inputValue, onClick }: any) => (
        <input
            className={`form-input w-full ${className} ${error ? 'border-red-500' : ''}`}
            onClick={onClick}
            value={inputValue || ""}
            readOnly
            style={{ width: '100%' }}
            placeholder={placeholder ? placeholder : 'Follow Up Date'}
        />
    );

    // Parse DD-MM-YYYY HH:mm:ss format
    const parseCustomDate = (dateString: string) => {
        if (!dateString) return null;
        
        // For DD-MM-YYYY HH:mm:ss format
        const match = dateString.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
        if (match) {
            const [, day, month, year, hours, minutes, seconds] = match;
            return new Date(
                parseInt(year),
                parseInt(month) - 1, // Months are 0-indexed in JavaScript
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                parseInt(seconds)
            );
        }
        
        // Try parsing as ISO format or let JavaScript handle it
        const parsedDate = new Date(dateString);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    const getValidDate = (date: any) => {
        if (!date) return null;
        
        if (typeof date === 'string') {
            return parseCustomDate(date);
        }
        
        if (date instanceof Date) {
            return isNaN(date.getTime()) ? null : date;
        }
        
        return null;
    };

    const handleChange = (date: Date | null) => {
        onChange(date || null);
    };

    return (
        <div className="w-full">
            {title && (
                <label className="block text-sm font-bold text-gray-700">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="w-full">
                <DatePicker
                    selected={getValidDate(value)}
                    onChange={handleChange}
                    showTimeSelect
                    dateFormat="Pp"
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    timeCaption="Time"
                    name={name}
                    isClearable={true}
                    shouldCloseOnSelect={true}
                    customInput={<CustomInput />}
                    required={required}
                    minDate={minDate || null}
                    popperClassName="z-9999"
                    portalId="root-portal"
                    {...rest}
                />
                {error && (
                    <p className="mt-2 text-sm text-red-600" id={`${name}-error`}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default CustomeDatePicker;