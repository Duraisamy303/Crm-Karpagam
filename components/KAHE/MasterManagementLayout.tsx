import React from 'react';
import Head from 'next/head';
import { UserPlus, Search, ChevronDown, X, RotateCcw, Edit, Power, PowerOff } from 'lucide-react';
import Pagination from '@/components/Pagination';

export interface MasterColumn<T = any> {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T) => React.ReactNode;
}

export interface MasterManagementLayoutProps<T extends { id: string; status: string; [key: string]: any }> {
    // Header
    pageTitle: string;
    pageSubtitle: string;
    addButtonLabel?: string;
    onAddClick: () => void;

    // Search & Filter (Controlled by Page)
    searchPlaceholder?: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;

    categoryFilterLabel?: string;
    categoryOptions?: string[];
    categoryFilter?: string;
    onCategoryFilterChange?: (value: string) => void;

    statusFilter: string;
    onStatusFilterChange: (value: string) => void;

    hasActiveFilters?: boolean;
    onResetFilters: () => void;

    // Table Data (Controlled by Page)
    columns: MasterColumn<T>[];
    data: T[];
    isLoading?: boolean;
    onToggleStatus: (id: string, currentItem: T) => void;
    onEdit?: (item: T) => void;

    // Pagination (Controlled by Page)
    totalRecords: number;
    currentPage: number;
    recordsPerPage: number;
    onPageChange: (page: number) => void;
    onRecordsPerPageChange?: (limit: number) => void;

    // Modal or Children rendered by Page
    children?: React.ReactNode;
}

export default function MasterManagementLayout<T extends { id: string; status: string; [key: string]: any }>({
    pageTitle,
    pageSubtitle,
    addButtonLabel = '+ Add New',
    onAddClick,

    searchPlaceholder = 'Search records...',
    searchQuery,
    onSearchChange,

    categoryFilterLabel = 'All Categories',
    categoryOptions = [],
    categoryFilter,
    onCategoryFilterChange,

    statusFilter,
    onStatusFilterChange,

    hasActiveFilters = false,
    onResetFilters,

    columns,
    data,
    isLoading = false,
    onToggleStatus,
    onEdit,

    totalRecords,
    currentPage,
    recordsPerPage,
    onPageChange,
    onRecordsPerPageChange,

    children,
}: MasterManagementLayoutProps<T>) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage) || 1;
    const startIndex = (currentPage - 1) * recordsPerPage;

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen dark:bg-[#060818]">
            <Head>
                <title>{pageTitle} - KAHE Masters</title>
            </Head>

            {/* ============================================================== */}
            {/* PAGE HEADER: TITLE, SUBTITLE & ADD BUTTON */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        {pageTitle}
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        {pageSubtitle}
                    </p>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={onAddClick}
                        className="btn-action-solid flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>{addButtonLabel}</span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* SEARCH & FILTERS PANEL */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-white dark:placeholder-gray-500"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Optional Category Filter */}
                        {categoryOptions && categoryOptions.length > 0 && onCategoryFilterChange && (
                            <div className="relative min-w-[150px] sm:min-w-[170px]">
                                <select
                                    value={categoryFilter || categoryFilterLabel}
                                    onChange={(e) => onCategoryFilterChange(e.target.value)}
                                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                                >
                                    <option value={categoryFilterLabel}>{categoryFilterLabel}</option>
                                    {categoryOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                        )}

                        {/* Status Filter */}
                        <div className="relative min-w-[130px] sm:min-w-[150px]">
                            <select
                                value={statusFilter}
                                onChange={(e) => onStatusFilterChange(e.target.value)}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-8 text-xs sm:text-sm font-semibold text-gray-700 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-200"
                            >
                                <option value="All Status">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        {/* Reset Filters */}
                        {hasActiveFilters && (
                            <button
                                type="button"
                                onClick={onResetFilters}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer"
                                title="Reset Filters"
                            >
                                <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
                                <span>Reset</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* TABLE CONTAINER */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-[#0e1726]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-[#0e1726]">
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={`table-th py-4 px-6 text-sm font-bold text-gray-800 dark:text-gray-200 ${
                                            col.align === 'center'
                                                ? 'text-center'
                                                : col.align === 'right'
                                                ? 'text-right'
                                                : 'text-left'
                                        }`}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                                <th className="table-th py-4 px-6 text-sm font-bold text-gray-800 dark:text-gray-200 text-center">
                                    Status
                                </th>
                                <th className="table-th py-4 px-6 text-sm font-bold text-gray-800 dark:text-gray-200 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs sm:text-sm dark:divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                                            <span className="text-sm font-semibold">Loading master records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 2} className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <Search className="h-8 w-8 mb-2 stroke-1" />
                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                No records found
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Try adjusting your search query or filters.
                                            </p>
                                            {hasActiveFilters && (
                                                <button
                                                    type="button"
                                                    onClick={onResetFilters}
                                                    className="mt-3 text-xs font-bold text-[#39854a] hover:underline cursor-pointer"
                                                >
                                                    Clear all filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => {
                                    const isActive = item.status === 'Active';

                                    return (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                                        >
                                            {columns.map((col) => (
                                                <td
                                                    key={col.key}
                                                    className={`py-4 px-6 ${
                                                        col.align === 'center'
                                                            ? 'text-center'
                                                            : col.align === 'right'
                                                            ? 'text-right'
                                                            : 'text-left'
                                                    }`}
                                                >
                                                    {col.render ? col.render(item) : item[col.key]}
                                                </td>
                                            ))}

                                            {/* Status Badge */}
                                            <td className="py-4 px-6 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        isActive
                                                            ? 'bg-[#dcfce7] text-[#16a34a] dark:bg-green-950/40 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* Action Icons */}
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {onEdit && (
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(item)}
                                                            title="Edit Record"
                                                            className="p-1.5 rounded-lg border border-transparent text-gray-500 hover:border-gray-200 hover:text-[#39854a] hover:bg-emerald-50 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-green-400 dark:hover:bg-gray-800 transition cursor-pointer"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => onToggleStatus(item.id, item)}
                                                        title={isActive ? 'Deactivate Record' : 'Activate Record'}
                                                        className={`p-1.5 rounded-lg border border-transparent transition cursor-pointer ${
                                                            isActive
                                                                ? 'text-emerald-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50 dark:text-emerald-400 dark:hover:border-red-800 dark:hover:text-red-400 dark:hover:bg-gray-800'
                                                                : 'text-gray-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-500 dark:hover:border-emerald-800 dark:hover:text-emerald-400 dark:hover:bg-gray-800'
                                                        }`}
                                                    >
                                                        {isActive ? (
                                                            <Power className="h-4 w-4" />
                                                        ) : (
                                                            <PowerOff className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ============================================================== */}
                {/* PAGINATION FOOTER */}
                {/* ============================================================== */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                            Showing{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {totalRecords === 0 ? 0 : startIndex + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {Math.min(startIndex + recordsPerPage, totalRecords)}
                            </span>{' '}
                            of <span className="font-bold text-gray-800 dark:text-gray-200">{totalRecords}</span> items
                        </span>

                        {onRecordsPerPageChange && (
                            <div className="flex items-center gap-1.5 ml-2">
                                <span className="text-[11px] text-gray-400">Rows:</span>
                                <select
                                    value={recordsPerPage}
                                    onChange={(e) => onRecordsPerPageChange(Number(e.target.value))}
                                    className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalRecords={totalRecords}
                        recordsPerPage={recordsPerPage}
                        onPageChange={onPageChange}
                        hasNext={currentPage < totalPages}
                        hasPrevious={currentPage > 1}
                    />
                </div>
            </div>

            {/* Page-Controlled Modal Slot */}
            {children}
        </div>
    );
}
