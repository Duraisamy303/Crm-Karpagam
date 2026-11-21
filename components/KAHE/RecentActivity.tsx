import React from 'react';

export interface RecentActivityItem {
    id?: string | number;
    title: string;
    time: string;
    targetName: string;
    performedBy: string;
}

export interface RecentActivityProps {
    title?: string;
    subtitle?: string;
    activities?: RecentActivityItem[];
    className?: string;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
    title = 'Recent Activity',
    subtitle = 'Live audit log',
    activities,
    className = '',
}) => {
    const defaultActivities: RecentActivityItem[] = [
        {
            id: 'act-1',
            title: 'Bulk Imported',
            time: '06:07',
            targetName: 'M. Naveen Kumar',
            performedBy: 'Prof. R. Natarajan',
        },
        {
            id: 'act-2',
            title: 'Bulk Imported',
            time: '06:07',
            targetName: 'G. Gokulraj',
            performedBy: 'Prof. R. Natarajan',
        },
        {
            id: 'act-3',
            title: 'Morning Call Attempt',
            time: '11:00',
            targetName: 'G. Harini',
            performedBy: 'P. Malathi',
        },
        {
            id: 'act-4',
            title: 'Enquiry Added via Bulk Import',
            time: '10:30',
            targetName: 'G. Arvind',
            performedBy: 'Admin',
        },
        {
            id: 'act-5',
            title: 'Morning Call Attempt',
            time: '10:15',
            targetName: 'A. Dinesh',
            performedBy: 'P. Malathi',
        },
    ];

    const displayActivities = activities && activities.length > 0 ? activities : defaultActivities;

    return (
        <div className={`overview-panel flex flex-col justify-between h-full min-h-[380px] ${className}`}>
            {/* Header: Title & Live audit log tag */}
            <div className="flex items-center justify-between pb-3 shrink-0 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-bold tracking-tight text-gray-900 sm:text-lg dark:text-white">
                    {title}
                </h3>
                {subtitle && (
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                        {subtitle}
                    </span>
                )}
            </div>

            {/* Scrollable Activity List Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1 custom-scroll">
                {displayActivities.map((item, index) => (
                    <div key={item.id || index} className="activity-card-item">
                        {/* Top row: Title and Time */}
                        <div className="flex items-center justify-between gap-2">
                            <h5 className="text-xs font-bold text-gray-900 sm:text-sm dark:text-white">
                                {item.title}
                            </h5>
                            <span className="font-mono text-xs font-medium text-gray-400 dark:text-gray-500">
                                {item.time}
                            </span>
                        </div>

                        {/* Bottom row: Target Name and Performed By */}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-semibold text-gray-800 dark:text-gray-300">
                                {item.targetName}
                            </span>
                            {' · by '}
                            <span className="text-gray-600 dark:text-gray-400">
                                {item.performedBy}
                            </span>
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;

