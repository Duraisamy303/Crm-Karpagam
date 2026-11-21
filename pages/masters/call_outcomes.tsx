import React, { useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Power,
    PowerOff,
    X,
    RotateCcw,
    PhoneCall,
    CheckCircle2,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import CheckboxInput from '@/components/Checkbox';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import * as Validation from '@/utils/validation.utils';
import { Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';

// =============================================================================
// INTERFACES & CONSTANTS
// =============================================================================
export interface CallOutcomeItem {
    id: string;
    outcome_name: string;
    sentiment: string;
    suggested_next_action: string;
    requires_callback: boolean;
    priority: string;
    status: string;
}

const SENTIMENT_OPTIONS = [
    { value: 'All Sentiments', label: 'All Sentiments' },
    { value: 'Positive', label: 'Positive' },
    { value: 'Neutral', label: 'Neutral' },
    { value: 'Negative', label: 'Negative' },
    { value: 'Invalid', label: 'Invalid' },
];

const PRIORITY_OPTIONS = [
    { value: 'Urgent', label: 'Urgent Priority' },
    { value: 'High', label: 'High Priority' },
    { value: 'Normal', label: 'Normal Priority' },
];

const STATUS_FILTER_OPTIONS = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const DEFAULT_FORM = {
    outcome_name: '',
    sentiment: 'Positive',
    suggested_next_action: '',
    priority: 'Normal',
    requires_callback: true,
};

// =============================================================================
// MAIN COMPONENT: CallOutcomesPage
// =============================================================================
const CallOutcomesPage = () => {
    // ── Unified State ────────────────────────────────────────────────────────
    const [state, setState] = useSetState({
        data: [] as CallOutcomeItem[],
        totalRecords: 0,
        isLoading: false,

        // Filters
        search: '',
        categoryFilter: 'All Sentiments',
        statusFilter: 'All Status',

        // Table Pagination & Sorting
        currentPage: 1,
        recordsPerPage: 10,
        sortStatus: { columnAccessor: 'outcome_name', direction: 'asc' } as DataTableSortStatus,

        // Modal State
        isOpenModal: false,
        isEditMode: false,
        editingId: null as string | null,
        formData: DEFAULT_FORM,
        errors: {} as any,
        isSubmitting: false,
    });

    const debouncedSearch = useDebounce(state.search, 500);
    const prevDeps = useRef<string | null>(null);
    const isInitialLoad = useRef<boolean>(true);

    const deps = useMemo(
        () => ({
            search: debouncedSearch,
            categoryFilter: state.categoryFilter,
            statusFilter: state.statusFilter,
            sortStatus: state.sortStatus,
            recordsPerPage: state.recordsPerPage,
        }),
        [debouncedSearch, state.categoryFilter, state.statusFilter, state.sortStatus, state.recordsPerPage]
    );

    // ── Data Fetch Effect ────────────────────────────────────────────────────
    useEffect(() => {
        const currentDeps = JSON.stringify(deps);
        if (isInitialLoad.current) {
            getData(1);
            isInitialLoad.current = false;
        } else if (prevDeps.current !== currentDeps) {
            getData(1);
        }
        prevDeps.current = currentDeps;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps]);

    // =========================================================================
    // API FUNCTIONS & ACTION HANDLERS
    // =========================================================================
    const getData = async (pageNumber = state.currentPage) => {
        try {
            setState({ isLoading: true });
            const body: Record<string, any> = {
                page: pageNumber,
                page_size: state.recordsPerPage,
            };
            if (state.search.trim()) {
                body.search = state.search.trim();
            }
            if (state.categoryFilter && state.categoryFilter !== 'All Sentiments') {
                body.sentiment = state.categoryFilter;
            }
            if (state.statusFilter && state.statusFilter !== 'All Status') {
                body.status = state.statusFilter;
            }

            const res: any = await Models.call_outcomes.list(pageNumber, body);
            setState({
                data: res.data || res.results || [],
                totalRecords: res.total_records || res.count || (res.data || []).length,
                currentPage: pageNumber,
                isLoading: false,
            });
        } catch (error) {
            console.error('getData error:', error);
            setState({ isLoading: false });
        }
    };

    // ── Open Add Modal ───────────────────────────────────────────────────────
    const handleOpenAdd = () => {
        setState({
            isOpenModal: true,
            isEditMode: false,
            editingId: null,
            formData: {
                outcome_name: '',
                sentiment: 'Positive',
                suggested_next_action: '',
                priority: 'Normal',
                requires_callback: true,
            },
            errors: {},
        });
    };

    // ── Open Edit Modal ──────────────────────────────────────────────────────
    const handleOpenEdit = (item: CallOutcomeItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            formData: {
                outcome_name: item.outcome_name,
                sentiment: item.sentiment,
                suggested_next_action: item.suggested_next_action,
                priority: item.priority,
                requires_callback: item.requires_callback,
            },
            errors: {},
        });
    };

    // ── Close Modal ──────────────────────────────────────────────────────────
    const handleCloseModal = () => {
        setState({
            isOpenModal: false,
            isEditMode: false,
            editingId: null,
            errors: {},
        });
    };

    // ── Form Submit (Create or Update) ───────────────────────────────────────
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setState({ isSubmitting: true, errors: {} });
            await Validation.callOutcomeValidation.validate(state.formData, { abortEarly: false });

            if (state.isEditMode && state.editingId) {
                await Models.call_outcomes.update(state.editingId, {
                    outcome_name: state.formData.outcome_name.trim(),
                    sentiment: state.formData.sentiment,
                    suggested_next_action: state.formData.suggested_next_action.trim(),
                    requires_callback: Boolean(state.formData.requires_callback),
                    priority: state.formData.priority,
                });
                Success('Call outcome updated successfully');
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: CallOutcomeItem = {
                    id: `OUT-${randomNum}`,
                    outcome_name: state.formData.outcome_name.trim(),
                    sentiment: state.formData.sentiment,
                    suggested_next_action: state.formData.suggested_next_action.trim(),
                    requires_callback: Boolean(state.formData.requires_callback),
                    priority: state.formData.priority,
                    status: 'Active',
                };
                await Models.call_outcomes.create(payload);
                Success('New call outcome added successfully');
            }

            handleCloseModal();
            getData(1);
        } catch (error: any) {
            if (error?.inner) {
                const errs: any = {};
                error.inner.forEach((e: any) => {
                    if (e.path && !errs[e.path]) {
                        errs[e.path] = e?.message;
                    }
                });
                setState({ errors: errs });
                return;
            }
            console.error('handleFormSubmit error:', error);
            Failure(error?.message || 'Failed to save call outcome');
        } finally {
            setState({ isSubmitting: false });
        }
    };

    // ── Toggle Status ────────────────────────────────────────────────────────
    const handleToggleStatus = async (item: CallOutcomeItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.call_outcomes.active_deactive(item.id, nextStatus);
            Success(`Call outcome "${item.outcome_name}" marked as ${nextStatus}`);
            getData();
        } catch (error: any) {
            console.error('handleToggleStatus error:', error);
            Failure('Failed to update call outcome status');
        }
    };

    // ── Delete Record ────────────────────────────────────────────────────────
    const handleDelete = async (item: CallOutcomeItem) => {
        if (!window.confirm(`Are you sure you want to delete "${item.outcome_name}"?`)) return;
        try {
            await Models.call_outcomes.delete(item.id);
            Success(`Call outcome "${item.outcome_name}" deleted successfully`);
            getData();
        } catch (error: any) {
            console.error('handleDelete error:', error);
            Failure('Failed to delete call outcome');
        }
    };

    // ── Reset Filters ────────────────────────────────────────────────────────
    const handleResetFilters = () => {
        setState({
            search: '',
            categoryFilter: 'All Sentiments',
            statusFilter: 'All Status',
            currentPage: 1,
        });
        getData(1);
    };

    const hasActiveFilters =
        state.search.trim() !== '' ||
        state.categoryFilter !== 'All Sentiments' ||
        state.statusFilter !== 'All Status';

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    const currentCategoryOption =
        SENTIMENT_OPTIONS.find((o) => o.value === state.categoryFilter) || SENTIMENT_OPTIONS[0];
    const currentStatusOption =
        STATUS_FILTER_OPTIONS.find((o) => o.value === state.statusFilter) || STATUS_FILTER_OPTIONS[0];

    // =========================================================================
    // DATATABLE COLUMNS
    // =========================================================================
    const columns = [
        {
            accessor: 'outcome_name',
            title: 'Disposition Outcome & Tag',
            sortable: true,
            render: (row: CallOutcomeItem) => (
                <div className="space-y-0.5">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <PhoneCall className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{row.outcome_name}</span>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Priority: {row.priority} · ID: {row.id}
                    </div>
                </div>
            ),
        },
        {
            accessor: 'sentiment',
            title: 'Call Sentiment',
            sortable: true,
            render: (row: CallOutcomeItem) => {
                let badgeClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                if (row.sentiment === 'Positive') badgeClass = 'bg-emerald-50 text-[#39854a] border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300';
                else if (row.sentiment === 'Negative') badgeClass = 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300';
                else if (row.sentiment === 'Neutral') badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300';
                else if (row.sentiment === 'Invalid') badgeClass = 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
                return (
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-md ${badgeClass}`}>
                        {row.sentiment}
                    </span>
                );
            },
        },
        {
            accessor: 'suggested_next_action',
            title: 'Suggested Next Action',
            sortable: true,
            render: (row: CallOutcomeItem) => (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {row.suggested_next_action}
                </span>
            ),
        },
        {
            accessor: 'requires_callback',
            title: 'Callback Needed',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: CallOutcomeItem) => (
                <div className="text-center">
                    {row.requires_callback ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md dark:bg-amber-950/40">
                            Required
                        </span>
                    ) : (
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-0.5 rounded-md dark:bg-gray-800">
                            No Callback
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: CallOutcomeItem) => (
                <div className="text-center">
                    {row.status === 'Active' ? (
                        <span className="badge-soft-success font-bold">Active</span>
                    ) : (
                        <span className="badge-soft-danger font-bold">Inactive</span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-right',
            render: (row: CallOutcomeItem) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Status Toggle */}
                    <button
                        type="button"
                        onClick={() => handleToggleStatus(row)}
                        title={row.status === 'Active' ? 'Deactivate Outcome' : 'Activate Outcome'}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition active:scale-95 cursor-pointer ${
                            row.status === 'Active'
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40'
                        }`}
                    >
                        {row.status === 'Active' ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit Button */}
                    <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        title="Edit Outcome"
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition active:scale-95 cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Delete Outcome"
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 transition active:scale-95 cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    // =========================================================================
    // MAIN PAGE DOM (RETURN)
    // =========================================================================
    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060818] p-4 lg:p-6 space-y-5">
            <Head>
                <title>Call Dispositions & Outcomes Master · KAHE Admissions</title>
            </Head>

            {/* 1. PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        Call Dispositions & Outcomes Master
                    </h1>
                    <p className="page-subtitle mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Configure telecalling response tags, next-action rules, and callback schedules.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="btn-action-solid cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Outcome</span>
                    </button>
                </div>
            </div>

            {/* 2. OVERVIEW PANEL: SEARCH & FILTERS */}
            <div className="overview-panel space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 lg:gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={state.search}
                            onChange={(e) => setState({ search: e.target.value, currentPage: 1 })}
                            placeholder="Search outcome label, next action..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-9 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-white"
                        />
                        {state.search && (
                            <button
                                type="button"
                                onClick={() => setState({ search: '', currentPage: 1 })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Sentiment Filter */}
                    <div className="w-56">
                        <CustomSelect
                            options={SENTIMENT_OPTIONS}
                            value={currentCategoryOption}
                            onChange={(opt: any) =>
                                setState({ categoryFilter: opt?.value || 'All Sentiments', currentPage: 1 })
                            }
                            isSearchable={false}
                            placeholder="Filter by Sentiment"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="w-36">
                        <CustomSelect
                            options={STATUS_FILTER_OPTIONS}
                            value={currentStatusOption}
                            onChange={(opt: any) =>
                                setState({ statusFilter: opt?.value || 'All Status', currentPage: 1 })
                            }
                            isSearchable={false}
                            placeholder="Filter by Status"
                        />
                    </div>

                    {/* Reset Button */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 cursor-pointer shrink-0"
                            title="Reset Filters"
                        >
                            <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 3. MANTINE DATATABLE */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                <DataTable
                    highlightOnHover
                    className="table-hover whitespace-nowrap"
                    records={state.data}
                    fetching={state.isLoading}
                    minHeight={260}
                    sortStatus={state.sortStatus}
                    onSortStatusChange={(status) => setState({ sortStatus: status, currentPage: 1 })}
                    noRecordsText="No call outcomes found."
                    columns={columns}
                    customLoader={
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                            <span className="text-xs font-bold text-gray-500">Loading call outcomes...</span>
                        </div>
                    }
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mb-2" />
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                No records found
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Try adjusting your search query or filters.
                            </p>
                        </div>
                    }
                />

                {/* Pagination Footer */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                            Showing{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {state.totalRecords === 0 ? 0 : startIndex + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {Math.min(startIndex + state.data.length, state.totalRecords)}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {state.totalRecords}
                            </span>{' '}
                            entries
                        </span>
                    </div>

                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.totalRecords}
                        recordsPerPage={state.recordsPerPage}
                        onPageChange={(page) => getData(page)}
                    />
                </div>
            </div>

            {/* 4. ADD / EDIT CALL OUTCOME MODAL */}
            {state.isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#121e32]">
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {state.isEditMode ? 'Edit Call Outcome' : 'Add New Call Outcome'}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Specify sentiment classification, next-action rule, and callback requirements.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                            {/* Outcome Name */}
                            <TextInput
                                title="Outcome Label"
                                required
                                value={state.formData.outcome_name}
                                onChange={(val: any) =>
                                    setState({
                                        formData: { ...state.formData, outcome_name: typeof val === 'object' && val !== null ? val.target?.value : val },
                                        errors: { ...state.errors, outcome_name: '' },
                                    })
                                }
                                placeholder="e.g. Interested in Campus Visit"
                                error={state.errors?.outcome_name}
                            />

                            {/* Sentiment */}
                            <CustomSelect
                                title="Call Sentiment"
                                required
                                options={SENTIMENT_OPTIONS.filter((o) => o.value !== 'All Sentiments')}
                                value={
                                    SENTIMENT_OPTIONS.find((o) => o.value === state.formData.sentiment) || null
                                }
                                onChange={(opt: any) =>
                                    setState({
                                        formData: { ...state.formData, sentiment: opt?.value || '' },
                                        errors: { ...state.errors, sentiment: '' },
                                    })
                                }
                                isSearchable={false}
                                placeholder="Select Sentiment"
                                error={state.errors?.sentiment}
                            />

                            {/* Suggested Next Action */}
                            <TextInput
                                title="Suggested Mandatory Next Action"
                                required
                                value={state.formData.suggested_next_action}
                                onChange={(val: any) =>
                                    setState({
                                        formData: { ...state.formData, suggested_next_action: typeof val === 'object' && val !== null ? val.target?.value : val },
                                        errors: { ...state.errors, suggested_next_action: '' },
                                    })
                                }
                                placeholder="e.g. Schedule campus tour with senior counsellor"
                                error={state.errors?.suggested_next_action}
                            />

                            {/* Priority Level */}
                            <CustomSelect
                                title="Default Follow-up Priority"
                                options={PRIORITY_OPTIONS}
                                value={
                                    PRIORITY_OPTIONS.find((o) => o.value === state.formData.priority) || null
                                }
                                onChange={(opt: any) =>
                                    setState({
                                        formData: { ...state.formData, priority: opt?.value || 'Normal' },
                                    })
                                }
                                isSearchable={false}
                                placeholder="Select Priority"
                            />

                            {/* Requires Callback Checkbox */}
                            <div className="pt-1">
                                <CheckboxInput
                                    checked={state.formData.requires_callback}
                                    onChange={(checked: boolean) =>
                                        setState({
                                            formData: { ...state.formData, requires_callback: checked },
                                        })
                                    }
                                    label="Requires mandatory callback date & time schedule"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.isSubmitting}
                                    className="btn-action-solid cursor-pointer disabled:opacity-50"
                                >
                                    {state.isSubmitting
                                        ? 'Saving...'
                                        : state.isEditMode
                                        ? 'Update Outcome'
                                        : 'Add Outcome'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallOutcomesPage;
