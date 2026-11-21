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
    Building2,
    CheckCircle2,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import * as Validation from '@/utils/validation.utils';
import { Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';

// =============================================================================
// INTERFACES & CONSTANTS
// =============================================================================
export interface InstitutionItem {
    id: string;
    name: string;
    short_code: string;
    type: string;
    campus: string;
    total_programs: number;
    status: string;
}

const TYPE_OPTIONS = [
    { value: 'All Types', label: 'All Types' },
    { value: 'Deemed-to-be University', label: 'Deemed-to-be University' },
    { value: 'Engineering College', label: 'Engineering College' },
    { value: 'Arts & Science College', label: 'Arts & Science College' },
    { value: 'Pharmacy College', label: 'Pharmacy College' },
    { value: 'Nursing College', label: 'Nursing College' },
    { value: 'Medical Sciences Faculty', label: 'Medical Sciences Faculty' },
];

const STATUS_FILTER_OPTIONS = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const DEFAULT_FORM = {
    name: '',
    short_code: '',
    type: 'Deemed-to-be University',
    campus: 'Pollachi Main Road, Coimbatore',
    total_programs: 10,
};

// =============================================================================
// MAIN COMPONENT: InstitutionsPage
// =============================================================================
const InstitutionsPage = () => {
    // ── Unified State ────────────────────────────────────────────────────────
    const [state, setState] = useSetState({
        data: [] as InstitutionItem[],
        totalRecords: 0,
        isLoading: false,

        // Filters
        search: '',
        categoryFilter: 'All Types',
        statusFilter: 'All Status',

        // Table Pagination & Sorting
        currentPage: 1,
        recordsPerPage: 10,
        sortStatus: { columnAccessor: 'short_code', direction: 'asc' } as DataTableSortStatus,

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
            if (state.categoryFilter && state.categoryFilter !== 'All Types') {
                body.type = state.categoryFilter;
            }
            if (state.statusFilter && state.statusFilter !== 'All Status') {
                body.status = state.statusFilter;
            }

            const res: any = await Models.institutions.list(pageNumber, body);
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
                name: '',
                short_code: '',
                type: 'Deemed-to-be University',
                campus: 'Pollachi Main Road, Coimbatore',
                total_programs: 10,
            },
            errors: {},
        });
    };

    // ── Open Edit Modal ──────────────────────────────────────────────────────
    const handleOpenEdit = (item: InstitutionItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            formData: {
                name: item.name,
                short_code: item.short_code,
                type: item.type,
                campus: item.campus,
                total_programs: item.total_programs,
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
            await Validation.institutionValidation.validate(state.formData, { abortEarly: false });

            if (state.isEditMode && state.editingId) {
                await Models.institutions.update(state.editingId, {
                    name: state.formData.name.trim(),
                    short_code: state.formData.short_code.trim().toUpperCase(),
                    type: state.formData.type,
                    campus: state.formData.campus.trim(),
                    total_programs: Number(state.formData.total_programs),
                });
                Success('Institution updated successfully');
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: InstitutionItem = {
                    id: `INST-${randomNum}`,
                    name: state.formData.name.trim(),
                    short_code: state.formData.short_code.trim().toUpperCase(),
                    type: state.formData.type,
                    campus: state.formData.campus.trim(),
                    total_programs: Number(state.formData.total_programs),
                    status: 'Active',
                };
                await Models.institutions.create(payload);
                Success('New institution added successfully');
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
            Failure(error?.message || 'Failed to save institution');
        } finally {
            setState({ isSubmitting: false });
        }
    };

    // ── Toggle Status ────────────────────────────────────────────────────────
    const handleToggleStatus = async (item: InstitutionItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.institutions.active_deactive(item.id, nextStatus);
            Success(`Institution "${item.short_code}" marked as ${nextStatus}`);
            getData();
        } catch (error: any) {
            console.error('handleToggleStatus error:', error);
            Failure('Failed to update institution status');
        }
    };

    // ── Delete Record ────────────────────────────────────────────────────────
    const handleDelete = async (item: InstitutionItem) => {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
        try {
            await Models.institutions.delete(item.id);
            Success(`Institution "${item.short_code}" deleted successfully`);
            getData();
        } catch (error: any) {
            console.error('handleDelete error:', error);
            Failure('Failed to delete institution');
        }
    };

    // ── Reset Filters ────────────────────────────────────────────────────────
    const handleResetFilters = () => {
        setState({
            search: '',
            categoryFilter: 'All Types',
            statusFilter: 'All Status',
            currentPage: 1,
        });
        getData(1);
    };

    const hasActiveFilters =
        state.search.trim() !== '' ||
        state.categoryFilter !== 'All Types' ||
        state.statusFilter !== 'All Status';

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    const currentCategoryOption =
        TYPE_OPTIONS.find((o) => o.value === state.categoryFilter) || TYPE_OPTIONS[0];
    const currentStatusOption =
        STATUS_FILTER_OPTIONS.find((o) => o.value === state.statusFilter) || STATUS_FILTER_OPTIONS[0];

    // =========================================================================
    // DATATABLE COLUMNS
    // =========================================================================
    const columns = [
        {
            accessor: 'name',
            title: 'Institution Name & Code',
            sortable: true,
            render: (row: InstitutionItem) => (
                <div className="space-y-0.5">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{row.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#39854a] dark:bg-emerald-950/40 dark:text-emerald-300">
                            {row.short_code}
                        </span>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        ID: {row.id}
                    </div>
                </div>
            ),
        },
        {
            accessor: 'type',
            title: 'Institution Type',
            sortable: true,
            render: (row: InstitutionItem) => (
                <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {row.type}
                </span>
            ),
        },
        {
            accessor: 'campus',
            title: 'Campus Location',
            sortable: true,
            render: (row: InstitutionItem) => (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{row.campus}</span>
                </div>
            ),
        },
        {
            accessor: 'total_programs',
            title: 'Approved Degrees',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: InstitutionItem) => (
                <div className="text-center">
                    <span className="font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md dark:bg-blue-950/40 dark:text-blue-300">
                        {row.total_programs} Programs
                    </span>
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: InstitutionItem) => (
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
            render: (row: InstitutionItem) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Status Toggle */}
                    <button
                        type="button"
                        onClick={() => handleToggleStatus(row)}
                        title={row.status === 'Active' ? 'Deactivate Institution' : 'Activate Institution'}
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
                        title="Edit Institution"
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition active:scale-95 cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Delete Institution"
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
                <title>Institutions & Colleges Master · KAHE Admissions</title>
            </Head>

            {/* 1. PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        Institutions & Colleges Master
                    </h1>
                    <p className="page-subtitle mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Manage constituent colleges, university faculties, and campus locations under Karpagam Group.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="btn-action-solid cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Institution</span>
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
                            placeholder="Search institution name, short code, campus..."
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

                    {/* Type Filter */}
                    <div className="w-56">
                        <CustomSelect
                            options={TYPE_OPTIONS}
                            value={currentCategoryOption}
                            onChange={(opt: any) =>
                                setState({ categoryFilter: opt?.value || 'All Types', currentPage: 1 })
                            }
                            isSearchable={false}
                            placeholder="Filter by Type"
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
                    noRecordsText="No institutions found."
                    columns={columns}
                    customLoader={
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                            <span className="text-xs font-bold text-gray-500">Loading institutions...</span>
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

            {/* 4. ADD / EDIT INSTITUTION MODAL */}
            {state.isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#121e32]">
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {state.isEditMode ? 'Edit Institution' : 'Add New Institution'}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Register constituent colleges, faculties, and campuses.
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
                            {/* Institution Name */}
                            <TextInput
                                title="Institution Name"
                                required
                                value={state.formData.name}
                                onChange={(val: any) =>
                                    setState({
                                        formData: { ...state.formData, name: typeof val === 'object' && val !== null ? val.target?.value : val },
                                        errors: { ...state.errors, name: '' },
                                    })
                                }
                                placeholder="e.g. Karpagam Academy of Higher Education"
                                error={state.errors?.name}
                            />

                            {/* Short Code */}
                            <TextInput
                                title="Institution Acronym / Short Code"
                                required
                                value={state.formData.short_code}
                                onChange={(val: any) =>
                                    setState({
                                        formData: { ...state.formData, short_code: typeof val === 'object' && val !== null ? val.target?.value : val },
                                        errors: { ...state.errors, short_code: '' },
                                    })
                                }
                                placeholder="e.g. KAHE"
                                error={state.errors?.short_code}
                            />

                            {/* Institution Type */}
                            <CustomSelect
                                title="Institution Type"
                                required
                                options={TYPE_OPTIONS.filter((o) => o.value !== 'All Types')}
                                value={
                                    TYPE_OPTIONS.find((o) => o.value === state.formData.type) || null
                                }
                                onChange={(opt: any) =>
                                    setState({
                                        formData: { ...state.formData, type: opt?.value || '' },
                                        errors: { ...state.errors, type: '' },
                                    })
                                }
                                isSearchable={false}
                                placeholder="Select Institution Type"
                                error={state.errors?.type}
                            />

                            {/* Campus Location */}
                            <TextInput
                                title="Campus Location / Locality"
                                required
                                value={state.formData.campus}
                                onChange={(val: any) =>
                                    setState({
                                        formData: { ...state.formData, campus: typeof val === 'object' && val !== null ? val.target?.value : val },
                                        errors: { ...state.errors, campus: '' },
                                    })
                                }
                                placeholder="e.g. Eachanari Campus, Coimbatore"
                                error={state.errors?.campus}
                            />

                            {/* Total Programs */}
                            <TextInput
                                title="Total Approved Degrees"
                                required
                                type="number"
                                value={state.formData.total_programs === '' ? '' : String(state.formData.total_programs)}
                                onChange={(val: any) => {
                                    const v = typeof val === 'object' && val !== null ? val.target?.value : val;
                                    setState({
                                        formData: { ...state.formData, total_programs: v === '' ? '' : Number(v) },
                                        errors: { ...state.errors, total_programs: '' },
                                    });
                                }}
                                placeholder="10"
                                error={state.errors?.total_programs}
                            />

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
                                        ? 'Update Institution'
                                        : 'Add Institution'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InstitutionsPage;
