import React from 'react';
import { Users, UserCheck, Phone, HandHeart } from 'lucide-react';

export interface StatCardItem {
    id?: string | number;
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export interface OverviewStatCardsProps {

    count?: number | string;

    cols?: number | string;

    cards?: StatCardItem[];

    selectedCard?: string | number | null;

    onCardClick?: (card: StatCardItem, index: number) => void;

    data?: {
        total_contacts?: number;
        assigned?: number;
        pending_tasks?: number;
        total_leads?: number;
        [key: string]: any;
    };
    className?: string;
}

const gridColsClassMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

const OverviewStatCards: React.FC<OverviewStatCardsProps> = ({
    count,
    cols,
    cards,
    selectedCard,
    onCardClick,
    data,
    className = '',
}) => {
    const defaultCards: StatCardItem[] = [
        {
            id: 'total_contacts',
            title: 'Total Contacts',
            value: data?.total_contacts && data.total_contacts > 0 ? data.total_contacts : 23,
            subtitle: '4 unassigned contacts',
            icon: <Users className="h-5 w-5 text-[#39854a]" />,
        },
        {
            id: 'assigned',
            title: 'Assigned',
            value: data?.assigned && data.assigned > 0 ? data.assigned : 19,
            subtitle: '83% allocation rate',
            icon: <UserCheck className="h-5 w-5 text-[#39854a]" />,
        },
        {
            id: 'follow_ups',
            title: 'Follow-ups',
            value: data?.pending_tasks && data.pending_tasks > 0 ? data.pending_tasks : 11,
            subtitle: '3 requiring immediate attention',
            icon: <Phone className="h-5 w-5 text-[#39854a]" />,
        },
        {
            id: 'interested',
            title: 'Interested',
            value: data?.total_leads && data.total_leads > 0 ? data.total_leads : 17,
            subtitle: 'Qualified candidates in pipeline',
            icon: <HandHeart className="h-5 w-5 text-[#39854a]" />,
        },
    ];

    const sourceCards = cards && cards.length > 0 ? cards : defaultCards;

    const targetCount = count !== undefined ? Number(count) : (cols !== undefined ? Number(cols) : undefined);

    const displayCards = targetCount ? sourceCards.slice(0, targetCount) : sourceCards;

    const targetCols = cols !== undefined ? Number(cols) : (targetCount || displayCards.length);
    const activeCols = Math.min(Math.max(targetCols, 1), 6);
    const gridColsClass = gridColsClassMap[activeCols] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    return (
        <div className={`mt-6 grid ${gridColsClass} gap-4 ${className}`}>
            {displayCards.map((card, index) => {
                const isSelected =
                    selectedCard !== undefined &&
                    selectedCard !== null &&
                    (selectedCard === card.id || selectedCard === card.title);
                const isClickable = Boolean(card.onClick || onCardClick);

                return (
                    <div
                        key={card.id || index}
                        onClick={() => {
                            if (card.onClick) {
                                card.onClick();
                            }
                            if (onCardClick) {
                                onCardClick(card, index);
                            }
                        }}
                        className={`stat-card ${isSelected ? 'active' : ''} ${
                            isClickable ? 'cursor-pointer hover:border-[#39854a]/60 select-none' : ''
                        } ${card.className || ''}`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="stat-card-title">{card.title}</span>
                            {card.icon && <div className="text-[#39854a]">{card.icon}</div>}
                        </div>
                        <div className="stat-card-value">
                            {card.value}
                        </div>
                        {card.subtitle && (
                            <p className="stat-card-subtitle">
                                {card.subtitle}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default OverviewStatCards;

