import { capitalizeFLetter, formatIndianRupees } from '@/utils/functions.utils';
import { SimpleGrid } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';

export default function DashboardCard(props) {
    const router = useRouter();
    const { cardData, handleClick, selectedCard } = props;
    const redirectPage = (data) => {
        if (data?.type == 'financialYear') {
            router.push(`/targetYear?type=${'financial'}`);
        } else if (data?.type == 'PhysicalYear') {
            router.push(`/targetYear?type=${'physical'}`);
        }
    };

    return (
        <div className=" flex w-full gap-4 lg:flex-row">
            <div className="w-full pb-2 pt-2">
                <SimpleGrid
                    cols={4}
                    spacing="sm"
                    breakpoints={[
                        { maxWidth: 768, cols: 2 },
                        { maxWidth: 576, cols: 1 },
                    ]}
                >
                    {cardData?.map((card: any, index: any) => (
                        <div
                            key={index}
                            className={`
                                panel cursor-pointer border-l-4 transition-all duration-300 hover:shadow-lg
                                ${card.colorScheme?.border || 'border-l-blue-500'}
                                ${selectedCard == card.title ? 'bg-blue-100 shadow-lg dark:bg-gray-800' : 'bg-white'}
                            `}
                            onClick={() => (handleClick ? handleClick(card) : redirectPage(card))}
                        >
                            <div className="mb-4 flex justify-between">
                                <div className="mb-4 flex items-center">
                                    <div className={`grid h-8 w-8 shrink-0 place-content-center rounded-full ${card.colorScheme?.iconBg || 'bg-blue-100 dark:bg-blue-900'}`}>
                                        {card.icon || (
                                            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIconPath(card.type ? card.type : card.title)} />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="ltr:ml-2 rtl:mr-2">
                                        <h6 className="text-sm font-bold text-dark dark:text-white-light">{capitalizeFLetter(card.title)}</h6>
                                        <p className="text-xs text-gray-500">{card.subtitle}</p>
                                    </div>
                                </div>

                                <div className={`grid h-8 w-8 shrink-0 place-content-center rounded-full ${card.increase ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                                    <svg className={`h-4 w-4 ${card.increase ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.increase ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'} />
                                    </svg>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Target:</span>
                                    <span className={`font-bold ${getTargetColor(card.type)}`}>{formatIndianRupees(card.target)}</span>
                                </div>

                                {card.achieved !== undefined ? (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Achieved:</span>
                                        <span className="font-bold text-green-600">{formatIndianRupees(card.achieved)}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">{card.status || 'Upcoming'}</span>
                                    </div>
                                )}

                                <div className="h-2 w-full rounded-full bg-gray-200">
                                    <div className={`h-2 rounded-full ${getProgressBarColor(card.percentage, card.type)}`} style={{ width: `${Math.min(card.percentage, 100)}%` }}></div>
                                </div>

                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">{card.type === 'nextMonth' ? 'Starts Soon' : card.type === 'annual' ? 'Annual Progress' : 'Completion'}</span>
                                    <span className={`font-bold ${getProgressTextColor(card.percentage, card.type)}`}>{card.percentage}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </SimpleGrid>
            </div>
        </div>
    );
}

// Helper functions
const getIconPath = (type) => {
    switch (type) {
        case 'prevMonth':
            return 'M11 19l-7-7 7-7m8 14l-7-7 7-7';
        case 'currentMonth':
            return 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2';
        case 'financialYear':
            return 'M12 5v0m0 7v0m0 7v0m0-13a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z';
        case 'PhysicalYear':
            return 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z';
        case 'monthly':
            return 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z';
        case 'quarterly':
            return 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
        case 'half yearly':
            return 'M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5';
        case 'annually':
            return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
        default:
            return 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
    }
};

const getTargetColor = (type) => {
    switch (type) {
        case 'prevMonth':
            return 'text-blue-600';
        case 'currentMonth':
            return 'text-green-600';
        case 'financialYear':
            return 'text-purple-600';
        case 'PhysicalYear':
            return 'text-orange-600';
        default:
            return 'text-blue-600';
    }
};

const getProgressBarColor = (percentage, type) => {
    if (type === 'nextMonth') return 'bg-purple-300';

    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};

const getProgressTextColor = (percentage, type) => {
    if (type === 'nextMonth') return 'text-purple-600';

    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
};
