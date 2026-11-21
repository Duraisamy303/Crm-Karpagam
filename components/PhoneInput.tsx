import React from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
    title?: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    className?: string;
    onValidationChange?: (isValid: boolean) => void;
}

const CustomPhoneInput: React.FC<PhoneInputProps> = ({ title, placeholder = 'Enter phone number', value, onChange, error, required = false, className = '', onValidationChange }) => {
    return (
        <div className="w-full">
            {title && (
                <label className="block text-sm font-bold text-gray-700">
                    {title} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <PhoneInput
                country={'in'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disableDropdown={false}
                inputProps={{
                    name: 'phone',
                    required: required,
                    className: `form-input ${className} ${error ? 'border-red-500' : ''}`,
                }}
                containerStyle={{
                    width: '100%',
                }}
                inputStyle={{
                    width: '100%',
                    paddingLeft: '48px',
                    fontSize: '15px',
                    fontWeight: '400',
                }}
                buttonStyle={{
                    borderRight: 'none',
                    backgroundColor: 'transparent',
                    width: '46px',
                }}
                isValid={(inputNumber, country, countries:any) => {
                    if (!inputNumber) {
                        onValidationChange?.(true);
                        return true;
                    }
                    // Global validation: check if number matches any country's format
                    const isValid = countries.some((c) => {
                        return inputNumber.startsWith(c.dialCode) || c.dialCode.startsWith(inputNumber);
                    });
                    onValidationChange?.(isValid);
                    return isValid;
                }}
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default CustomPhoneInput;
