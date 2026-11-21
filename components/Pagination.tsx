import React from 'react';
import IconArrowBackward from './Icon/IconArrowBackward';
import IconArrowForward from './Icon/IconArrowForward';

export interface PaginationProps {
    currentPage: number;
    totalRecords: number;
    recordsPerPage?: number;
    onPageChange: (page: number) => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalRecords,
    recordsPerPage = 10,
    onPageChange,
    hasNext = true,
    hasPrevious = true,
    className = '',
    size = 'sm',
}) => {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
    };

    const visiblePages = totalPages > 1 ? getVisiblePages() : [1];

    if (totalRecords === 0) {
        return null;
    }

    // Size dimensions: default 'sm' is compact (32px / 28px)
    const sizeClasses =
        size === 'lg'
            ? 'w-10 h-10 text-sm'
            : size === 'md'
            ? 'w-9 h-9 text-xs'
            : 'w-7 h-7 sm:w-8 sm:h-8 text-xs';

    const iconSizeClasses = size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

    return (
        <div className={`flex items-center justify-center gap-1 sm:gap-1.5 ${className}`}>
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrevious || currentPage === 1}
                className={`flex items-center justify-center ${sizeClasses} rounded-lg border transition ${
                    !hasPrevious || currentPage === 1
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#39854a]/40 hover:bg-[#39854a]/10 hover:text-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Previous Page"
            >
                <IconArrowBackward className={iconSizeClasses} />
            </button>

            {visiblePages.map((page, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`flex items-center justify-center ${sizeClasses} rounded-lg border font-semibold transition ${
                        page === currentPage
                            ? 'border-[#39854a] bg-[#39854a] text-white shadow-sm font-bold'
                            : page === '...'
                            ? 'cursor-default border-transparent bg-transparent text-gray-400'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#39854a]/40 hover:bg-[#39854a]/10 hover:text-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-gray-200 dark:hover:bg-gray-800'
                    }`}
                >
                    {page}
                </button>
            ))}

            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext || currentPage === totalPages}
                className={`flex items-center justify-center ${sizeClasses} rounded-lg border transition ${
                    !hasNext || currentPage === totalPages
                        ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-600'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-[#39854a]/40 hover:bg-[#39854a]/10 hover:text-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-gray-200 dark:hover:bg-gray-800'
                }`}
                title="Next Page"
            >
                <IconArrowForward className={iconSizeClasses} />
            </button>
        </div>
    );
};

export default Pagination;