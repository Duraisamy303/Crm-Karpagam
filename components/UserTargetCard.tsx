import { capitalizeFLetter } from '@/utils/functions.utils';
import { Loader } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';

const UserTargetCard = (props) => {
    const { data, className = '', handleClick, selectedUserCard, loading } = props;

    const { title, subtitle, target, achieved, percentage, trend, status, type } = data;

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        })
            .format(amount)
            .replace('₹', '₹ ');
    };

    const getCardColors = () => {
        switch (type) {
            case 'prevMonth':
                return {
                    border: 'border-l-blue-500',
                    headerBg: 'bg-blue-50 dark:bg-blue-900/20',
                    percentageBg: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
                };
            case 'currentMonth':
                return {
                    border: 'border-l-green-500',
                    headerBg: 'bg-green-50 dark:bg-green-900/20',
                    percentageBg: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
                };
            case 'nextMonth':
                return {
                    border: 'border-l-purple-500',
                    headerBg: 'bg-purple-50 dark:bg-purple-900/20',
                    percentageBg: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
                };
            case 'annual':
                return {
                    border: 'border-l-orange-500',
                    headerBg: 'bg-orange-50 dark:bg-orange-900/20',
                    percentageBg: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
                };
            default:
                return {
                    border: 'border-l-gray-500',
                    headerBg: 'bg-gray-50 dark:bg-gray-900/20',
                    percentageBg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                };
        }
    };

    const colors = getCardColors();

    return  (
        <div
            onClick={() => handleClick && handleClick()}
            // className={`cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${className}`}
            className={`
                                panel cursor-pointer border-l-4 transition-all duration-300 hover:shadow-lg
                                
                                ${selectedUserCard == title ? 'bg-blue-100 shadow-lg dark:bg-gray-800' : 'bg-white'}
                            `}
        >
            <div className={`${colors.headerBg} border-b border-gray-200 px-4 py-3 dark:border-gray-600`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{capitalizeFLetter(title)}</h3>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>
                    </div>
                    <div className={`rounded px-2 py-1 text-xs font-medium ${colors.percentageBg}`}>{percentage}%</div>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Target:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(target)}</span>
                </div>
                {type == 'nextMonth' && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">{'Upcoming'}</span>
                    </div>
                )}

                {achieved !== undefined && type !== 'nextMonth' && (
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Achieved:</span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(achieved)}</span>
                    </div>
                )}

                {trend !== undefined && type !== 'nextMonth' && (
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Trend:</span>
                        <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
                        </span>
                    </div>
                )}

                {/* Progress Bar - Only for periods with progress */}
                {/* {type !== 'nextMonth' ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Progress</span>
              <span>{percentage}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor()} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Starts Next Cycle</div>
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
              {status || 'Upcoming'}
            </div>
          </div>
        )} */}

                {/* Status */}
                {/* {type !== 'nextMonth' && (
          <div className={`text-xs font-medium mt-3 text-center ${getStatusColor()}`}>
            {percentage >= 80 ? 'On Track' : 
             percentage >= 60 ? 'Good Progress' : 
             percentage >= 40 ? 'Needs Attention' : 'Behind Schedule'}
          </div>
        )} */}
            </div>
        </div>
    );
};

export default UserTargetCard;
