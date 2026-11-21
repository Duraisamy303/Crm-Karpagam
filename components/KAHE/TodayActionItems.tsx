import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';

export type ActionItemBadgeVariant = 'danger' | 'warning' | 'success';

export interface ActionItem {
    id?: string | number;
    title: string;
    badgeCount: number | string;
    badgeVariant?: ActionItemBadgeVariant;
    description: string;
    actionText: string;
    linkUrl?: string;
    onAction?: () => void;
}

export interface TodayActionItemsProps {
    title?: string;
    badgeText?: string;
    items?: ActionItem[];
    className?: string;
}

const badgeClassMap: Record<ActionItemBadgeVariant, string> = {
    danger: 'badge-soft-danger',
    warning: 'badge-soft-warning',
    success: 'badge-soft-success',
};

const TodayActionItems: React.FC<TodayActionItemsProps> = ({
    title = "Today's Work & Action Items",
    badgeText = 'Priority Operations',
    items,
    className = '',
}) => {
    const router = useRouter();

    // Default action items matching the design mock
    const defaultItems: ActionItem[] = [
        {
            id: 'overdue_calls',
            title: 'Overdue Calls',
            badgeCount: 3,
            badgeVariant: 'danger',
            description: 'Scheduled callbacks delayed beyond designated time slot.',
            actionText: 'Resolve: M. Rajesh',
            linkUrl: '/my_tasks',
        },
        {
            id: 'transfer_requests',
            title: 'Transfer Requests',
            badgeCount: 1,
            badgeVariant: 'warning',
            description: 'Telecallers unavailable due to leave or language preference.',
            actionText: 'Approve: S. Ramesh Kumar',
            linkUrl: '/tasks',
        },
        {
            id: 'pending_counselling',
            title: 'Pending Counselling',
            badgeCount: 1,
            badgeVariant: 'success',
            description: 'High merit & complex enquiries referred to Senior Counsellors.',
            actionText: 'Review: K. Vignesh',
            linkUrl: '/assign-lead',
        },
    ];

    const displayItems = items && items.length > 0 ? items : defaultItems;

    const handleActionClick = (item: ActionItem) => {
        if (item.onAction) {
            item.onAction();
        } else if (item.linkUrl) {
            router.push(item.linkUrl);
        }
    };

    return (
        <div className={`overview-panel ${className}`}>
            {/* Header: Title with Clock Icon & Priority Operations Tag */}
            <div className="flex items-center justify-between">
                <div className="section-header-title">
                    <Clock className="h-5 w-5 text-[#39854a]" />
                    <span>{title}</span>
                </div>
                {badgeText && (
                    <span className="section-header-badge">{badgeText}</span>
                )}
            </div>

            {/* 3 Action Item Cards Grid */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                {displayItems.map((item, index) => {
                    const badgeClass = badgeClassMap[item.badgeVariant || 'danger'] || 'badge-soft-danger';
                    return (
                        <div key={item.id || index} className="action-item-card">
                            <div>
                                {/* Card Title & Soft Badge */}
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="action-item-title">{item.title}</h4>
                                    <span className={badgeClass}>{item.badgeCount}</span>
                                </div>

                                {/* Description */}
                                <p className="action-item-desc">{item.description}</p>
                            </div>

                            {/* Bottom Action Link */}
                            <div
                                onClick={() => handleActionClick(item)}
                                className="action-item-link group"
                            >
                                <span className="group-hover:underline">{item.actionText}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TodayActionItems;

