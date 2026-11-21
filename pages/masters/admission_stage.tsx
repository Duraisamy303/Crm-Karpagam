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
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import * as Validation from '@/utils/validation.utils';
import { capitalizeFLetter, Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';

// =============================================================================
// INTERFACES & CONSTANTS
// =============================================================================
export interface AdmissionStageItem {
    id: string;
    name: string;
    code: string;
    category: string;
    sequence: number;
    contacts_count: number;
    badge_color: string;
    status: string;
}

const DESK_OPTIONS = [
    { value: 'All Desks', label: 'All Desks' },
    { value: 'Inbound Queue', label: 'Inbound Queue' },
    { value: 'Telecalling Desk', label: 'Telecalling Desk' },
    { value: 'On-Campus Desk', label: 'On-Campus Desk' },
    { value: 'Senior Counselling Desk', label: 'Senior Counselling Desk' },
    { value: 'Application Processing', label: 'Application Processing' },
    { value: 'Admissions Finalized', label: 'Admissions Finalized' },
    { value: 'Closed / Disqualified', label: 'Closed / Disqualified' },
];

const STATUS_FILTER_OPTIONS = [
    { value: 'All Status', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const DEFAULT_FORM = {
    name: '',
    code: '',
    category: 'Telecalling Desk',
    sequence: 1,
};

// =============================================================================
// MAIN COMPONENT: AdmissionStagePage
// =============================================================================
const AdmissionStagePage = () => {
    // ── Unified State ────────────────────────────────────────────────────────
    const [state, setState] = useSetState({
        data: [] as AdmissionStageItem[],
        totalRecords: 0,
        isLoading: false,

        // Filters
        search: '',
        categoryFilter: 'All Desks',
        statusFilter: 'All Status',

        // Table Pagination & Sorting
        currentPage: 1,
        recordsPerPage: 10,
        sortStatus: { columnAccessor: 'sequence', direction: 'asc' } as DataTableSortStatus,

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
            if (state.categoryFilter && state.categoryFilter !== 'All Desks') {
                body.category = state.categoryFilter;
            }
            if (state.statusFilter && state.statusFilter !== 'All Status') {
                body.status = state.statusFilter;
            }

            const res: any = await Models.admission_stage.list(pageNumber, body);
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
                code: '',
                category: 'Telecalling Desk',
                sequence: (state.data?.length || 0) + 1,
            },
            errors: {},
        });
    };

    // ── Open Edit Modal ──────────────────────────────────────────────────────
    const handleOpenEdit = (item: AdmissionStageItem) => {
        setState({
            isOpenModal: true,
            isEditMode: true,
            editingId: item.id,
            formData: {
                name: item.name,
                code: item.code,
                category: item.category,
                sequence: item.sequence,
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
            await Validation.admissionStageValidation.validate(state.formData, { abortEarly: false });

            if (state.isEditMode && state.editingId) {
                await Models.admission_stage.update(state.editingId, {
                    name: state.formData.name.trim(),
                    code: state.formData.code.trim().toUpperCase(),
                    category: state.formData.category,
                    sequence: Number(state.formData.sequence),
                });
                Success('Admission stage updated successfully');
            } else {
                const randomNum = Math.floor(100 + Math.random() * 900);
                const payload: AdmissionStageItem = {
                    id: `STG-${randomNum}`,
                    name: state.formData.name.trim(),
                    code: state.formData.code.trim().toUpperCase(),
                    category: state.formData.category,
                    sequence: Number(state.formData.sequence),
                    contacts_count: 0,
                    badge_color: 'bg-teal-100 text-teal-700',
                    status: 'Active',
                };
                await Models.admission_stage.create(payload);
                Success('New admission stage added successfully');
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
            Failure(error?.message || 'Failed to save admission stage');
        } finally {
            setState({ isSubmitting: false });
        }
    };

    // ── Toggle Status ────────────────────────────────────────────────────────
    const handleToggleStatus = async (item: AdmissionStageItem) => {
        const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await Models.admission_stage.active_deactive(item.id, nextStatus);
            Success(`Stage "${item.name}" marked as ${nextStatus}`);
            getData();
        } catch (error: any) {
            console.error('handleToggleStatus error:', error);
            Failure('Failed to update stage status');
        }
    };

    // ── Delete Record ────────────────────────────────────────────────────────
    const handleDelete = async (item: AdmissionStageItem) => {
        if (!window.confirm(`Are you sure you want to delete stage "${item.name}"?`)) return;
        try {
            await Models.admission_stage.delete(item.id);
            Success(`Stage "${item.name}" deleted successfully`);
            getData();
        } catch (error: any) {
            console.error('handleDelete error:', error);
            Failure('Failed to delete admission stage');
        }
    };

    // ── Reset Filters ────────────────────────────────────────────────────────
    const handleResetFilters = () => {
        setState({
            search: '',
            categoryFilter: 'All Desks',
            statusFilter: 'All Status',
            currentPage: 1,
        });
        getData(1);
    };

    const hasActiveFilters =
        state.search.trim() !== '' ||
        state.categoryFilter !== 'All Desks' ||
        state.statusFilter !== 'All Status';

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    const currentCategoryOption =
        DESK_OPTIONS.find((o) => o.value === state.categoryFilter) || DESK_OPTIONS[0];
    const currentStatusOption =
        STATUS_FILTER_OPTIONS.find((o) => o.value === state.statusFilter) || STATUS_FILTER_OPTIONS[0];

    // =========================================================================
    // DATATABLE COLUMNS
    // =========================================================================
    const columns = [
        {
            accessor: 'name',
            title: 'Stage Name & Code',
            sortable: true,
            render: (row: AdmissionStageItem) => (
                <div className="space-y-0.5">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <span>{row.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {row.code}
                        </span>
                    </div>
                    <div className="text-[11px] font-medium text-gray-400">
                        Seq: {row.sequence} · ID: {row.id}
                    </div>
                </div>
            ),
        },
        {
            accessor: 'category',
            title: 'Desk / Pipeline Phase',
            sortable: true,
            render: (row: AdmissionStageItem) => (
                <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                    {row.category}
                </span>
            ),
        },
        {
            accessor: 'badge_color',
            title: 'Badge Preview',
            render: (row: AdmissionStageItem) => (
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${row.badge_color || 'bg-gray-100 text-gray-700'}`}>
                    {row.name}
                </span>
            ),
        },
        {
            accessor: 'contacts_count',
            title: 'Active Contacts',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: AdmissionStageItem) => (
                <div className="text-center">
                    <span className="font-bold text-xs text-[#39854a] bg-green-50 px-2 py-0.5 rounded-md dark:bg-green-950/40">
                        {row.contacts_count} Enquiries
                    </span>
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: AdmissionStageItem) => (
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
            render: (row: AdmissionStageItem) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Status Toggle */}
                    <button
                        type="button"
                        onClick={() => handleToggleStatus(row)}
                        title={row.status === 'Active' ? 'Deactivate Stage' : 'Activate Stage'}
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
                        title="Edit Stage"
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 transition active:scale-95 cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        title="Delete Stage"
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
                <title>Admission Stage Master · KAHE Admissions</title>
            </Head>

            {/* 1. PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        Admission Stage Master
                    </h1>
                    <p className="page-subtitle mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Configure admission lifecycle stages, pipeline desks, and progression workflow.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="btn-action-solid cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Stage</span>
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
                            placeholder="Search stage name, code, desk..."
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

                    {/* Desk / Category Filter */}
                    <div className="w-48">
                        <CustomSelect
                            options={DESK_OPTIONS}
                            value={currentCategoryOption}
                            onChange={(opt: any) =>
                                setState({ categoryFilter: opt?.value || 'All Desks', currentPage: 1 })
                            }
                            isSearchable={false}
                            placeholder="Filter by Desk"
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
                    noRecordsText="No admission stages found."
                    columns={columns}
                    customLoader={
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                            <span className="text-xs font-bold text-gray-500">Loading admission stages...</span>
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

            {/* 4. ADD / EDIT ADMISSION STAGE MODAL */}
            {state.isOpenModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#121e32]">
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                    {state.isEditMode ? 'Edit Admission Stage' : 'Add New Admission Stage'}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Configure stage metadata, progression key, and desk assignment.
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
                            {/* Stage Name */}
                            <TextInput
                                title="Stage Name"
                                required
                                value={state.formData.name}
                                onChange={(val: any) =>
                                    setState({
                                        formData: { ...state.formData, name: typeof val === 'object' && val !== null ? val.target?.value : val },
                                        errors: { ...state.errors, name: '' },
                                    })
                                }
                                placeholder="e.g. Document Verification"
                                error={state.errors?.name}
                            />

                            {/* Stage Code */}
                            <TextInput
                                title="Stage Code (Unique Key)"
                                required
                                value={state.formData.code}
                                onChange={(val: any) =>
                                    setState({
                                        formData: { ...state.formData, code: typeof val === 'object' && val !== null ? val.target?.value : val },
                                        errors: { ...state.errors, code: '' },
                                    })
                                }
                                placeholder="e.g. DOC_VERIF"
                                error={state.errors?.code}
                            />

                            {/* Desk / Category */}
                            <CustomSelect
                                title="Target Desk / Pipeline Phase"
                                required
                                options={DESK_OPTIONS.filter((o) => o.value !== 'All Desks')}
                                value={
                                    DESK_OPTIONS.find((o) => o.value === state.formData.category) || null
                                }
                                onChange={(opt: any) =>
                                    setState({
                                        formData: { ...state.formData, category: opt?.value || '' },
                                        errors: { ...state.errors, category: '' },
                                    })
                                }
                                isSearchable={false}
                                placeholder="Select Desk"
                                error={state.errors?.category}
                            />

                            {/* Sequence Number */}
                            <TextInput
                                title="Display Sequence Number"
                                required
                                type="number"
                                value={state.formData.sequence === '' ? '' : String(state.formData.sequence)}
                                onChange={(val: any) => {
                                    const v = typeof val === 'object' && val !== null ? val.target?.value : val;
                                    setState({
                                        formData: { ...state.formData, sequence: v === '' ? '' : Number(v) },
                                        errors: { ...state.errors, sequence: '' },
                                    });
                                }}
                                placeholder="1"
                                error={state.errors?.sequence}
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
                                        ? 'Update Stage'
                                        : 'Add Stage'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdmissionStagePage;
