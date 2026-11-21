import { truncateText } from '@/utils/functions.utils';
import React, { useState, useRef, useEffect } from 'react';

const FileUpload = ({ onFileSelect, buttonText = 'Upload File', iconSrc, accept = '*/*', isImageAllowed = false, value }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file) {
            if (!isImageAllowed && file.type.startsWith('image/')) {
                alert('Only non-image files are allowed.');
                return;
            }
            onFileSelect && onFileSelect(file);
        }
    };

    const removeFile = () => {
        onFileSelect && onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex flex-col items-center">
            {value ? (
                <div className="flex w-full flex-col items-start  rounded-lg p-3">
                    <span className="text-md w-full break-words  font-bold text-gray-700">{truncateText(value?.name, 50)}</span>

                    <button onClick={removeFile} className="rounded bg-red-500 px-2 py-1 text-white hover:bg-red-600 mt-3 mx-0" style={{ backgroundColor: 'red' }}>
                        Remove
                    </button>
                </div>
            ) : (
                <div
                    className="flex h-[50px] w-[200px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-500 p-2 hover:border-gray-700"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                    {iconSrc && <img src={iconSrc} alt="Upload" height={30} width={30} className="mr-2" />}
                    <span className="text-gray-600">{buttonText}</span>
                </div>
            )}
            <input ref={fileInputRef} type="file" onChange={handleFileChange} style={{ display: 'none' }} accept={accept} />
        </div>
    );
};

export default FileUpload;
