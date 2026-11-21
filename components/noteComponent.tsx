import React from 'react';
import IconCalendar from './Icon/IconCalendar';
import IconGlobe from './Icon/IconGlobe';
import IconEdit from './Icon/IconEdit';
import IconTrash from './Icon/IconTrash';
import IconEye from './Icon/IconEye';

export default function NoteComponent(props: any) {
    const { data, onEdit, onView } = props;
    const DummyUserIcon = () => (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" fill="none" />
            <path d="M4 20C4 16.6863 7.13401 14 11 14H13C16.866 14 20 16.6863 20 20" stroke="white" strokeWidth="2" />
        </svg>
    );
    return (
        <div className="flex items-start gap-4 rounded-lg border bg-white p-2 shadow-md">
            <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                    <DummyUserIcon />
                </div>
            </div>

            <div className="flex-1">
                <div className="mb-1 font-semibold text-gray-800">{data?.note}</div>

                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <IconCalendar className="" />
                    <span>{data?.note_on}</span>
                    <span>|</span>
                    <IconGlobe className="h-5 w-5" />

                    <span>Created by: {data?.note_by?.username}</span>
                </div>

                <div className="flex justify-end space-x-3 text-gray-400">
                    <button className="hover:text-blue-500" onClick={onView}>
                        <IconEye />
                    </button>
                    <button className="hover:text-blue-500" onClick={onEdit}>
                        <IconEdit />
                    </button>
                </div>
            </div>
        </div>
    );
}
