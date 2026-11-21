import React from 'react';
import IconEdit from './Icon/IconEdit';
import IconTrash from './Icon/IconTrash';

const DummyUserIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="none" />
        <path d="M4 20C4 16.6863 7.13401 14 11 14H13C16.866 14 20 16.6863 20 20" stroke="white" strokeWidth="2" />
    </svg>
);
const OppCard = (props: any) => {
    const { data, onPress, onEdit, onDelete } = props;
    const borderColor = data?.is_active ? 'border-l-green-500' : 'border-l-red-500';

    return (
        <div
            className={`w-100 cursor-pointer rounded-lg border border-l-4 ${borderColor} border-gray-300 bg-white p-4 shadow-md flex`}
        >
            <div className="mr-4 flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-3xl bg-yellow-500 p-3">
                <DummyUserIcon />
            </div>

            <div className="flex flex-col gap-1 flex-grow" onClick={onPress}>
                <h3 className="text-lg font-semibold text-gray-800">{data?.name}</h3>
                <div className="flex gap-2">
                    <p className="font-bold">Designation:</p>
                    <p className="text-gray-600">{data.designation}</p>
                </div>
                <div className="flex gap-2">
                    <p className="font-bold">Email:</p>
                    <p className="text-gray-600">{data.email_id}</p>
                </div>
                <div className="flex gap-2">
                    <p className="font-bold">Phone Number:</p>
                    <p className="text-gray-600">{data?.phone_number}</p>
                </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <button
                    className="flex items-center text-blue-500 hover:text-blue-700"
                    onClick={onEdit}
                >
                    <IconEdit />
                </button>
                
            </div>
        </div>
    );
};

export default OppCard;
