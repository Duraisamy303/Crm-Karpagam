import React from 'react';
import { useRouter } from 'next/router';

export interface TelecallerStaff {
    id?: string | number;
    name: string;
    avatarLetter?: string;
    assignedCount: number;
    callsTodayCount: number;
    status: 'Active' | 'Inactive' | string;
    statusVariant?: 'success' | 'warning' | 'danger';
}

export interface TelecallerTeamActivityProps {
    title?: string;
    manageStaffText?: string;
    onManageStaff?: () => void;
    staffList?: TelecallerStaff[];
    footerNote?: string;
    footerActionText?: string;
    onFooterAction?: () => void;
    className?: string;
}

const TelecallerTeamActivity: React.FC<TelecallerTeamActivityProps> = ({
    title = 'Telecaller Team Activity',
    manageStaffText = 'Manage Staff →',
    onManageStaff,
    staffList,
    footerNote = 'Workload is monitored for equal distribution',
    footerActionText = 'Rebalance Workload',
    onFooterAction,
    className = '',
}) => {
    const router = useRouter();

    const defaultStaffList: TelecallerStaff[] = [
        {
            id: 'staff-1',
            name: 'P. Malathi',
            avatarLetter: 'P',
            assignedCount: 5,
            callsTodayCount: 8,
            status: 'Active',
            statusVariant: 'success',
        },
        {
            id: 'staff-2',
            name: 'S. Ramesh Kumar',
            avatarLetter: 'S',
            assignedCount: 9,
            callsTodayCount: 5,
            status: 'Active',
            statusVariant: 'success',
        },
        {
            id: 'staff-3',
            name: 'K. Kavitha',
            avatarLetter: 'K',
            assignedCount: 5,
            callsTodayCount: 4,
            status: 'Active',
            statusVariant: 'success',
        },
    ];

    const displayStaff = staffList && staffList.length > 0 ? staffList : defaultStaffList;

    const handleManageStaff = () => {
        if (onManageStaff) {
            onManageStaff();
        } else {
            router.push('/crm_users');
        }
    };

    const handleFooterAction = () => {
        if (onFooterAction) {
            onFooterAction();
        } else {
            router.push('/contacts/assign_contact');
        }
    };

    return (
        <div className={`overview-panel flex flex-col justify-between h-full min-h-[380px] ${className}`}>
            {/* Header: Title & Manage Staff action */}
            <div className="flex items-center justify-between pb-3 shrink-0 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-bold tracking-tight text-gray-900 sm:text-lg dark:text-white">
                    {title}
                </h3>
                {manageStaffText && (
                    <button
                        type="button"
                        onClick={handleManageStaff}
                        className="text-xs font-semibold text-[#39854a] transition hover:text-[#2f6f3e] sm:text-sm"
                    >
                        {manageStaffText}
                    </button>
                )}
            </div>

            {/* Scrollable Table Area */}
            <div className="flex-1 overflow-y-auto overflow-x-auto my-2 pr-1 custom-scroll">
                <table className="w-full text-left text-sm">
                    <thead className="sticky top-0 bg-white dark:bg-[#0e1726] z-10">
                        <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 dark:border-gray-800 dark:text-gray-400">
                            <th className="py-2.5 font-semibold">Telecaller</th>
                            <th className="py-2.5 text-center font-semibold">Assigned</th>
                            <th className="py-2.5 text-center font-semibold">Calls Today</th>
                            <th className="py-2.5 text-right font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                        {displayStaff.map((staff, index) => {
                            const letter = staff.avatarLetter || staff.name.charAt(0) || 'U';
                            return (
                                <tr key={staff.id || index} className="group hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                                    <td className="py-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="avatar-circle-green">
                                                {letter}
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {staff.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-center font-bold text-gray-900 dark:text-white">
                                        {staff.assignedCount}
                                    </td>
                                    <td className="py-3 text-center font-bold text-[#39854a]">
                                        {staff.callsTodayCount}
                                    </td>
                                    <td className="py-3 text-right">
                                        <span className="badge-soft-success">
                                            {staff.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer with note & Rebalance Workload link */}
            <div className="mt-2 shrink-0 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                    {footerNote}
                </span>
                {footerActionText && (
                    <button
                        type="button"
                        onClick={handleFooterAction}
                        className="self-start text-xs font-bold text-[#39854a] transition hover:text-[#2f6f3e] sm:self-auto sm:text-sm"
                    >
                        {footerActionText}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TelecallerTeamActivity;

