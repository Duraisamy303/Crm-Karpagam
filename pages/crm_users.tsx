import React, { useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import {
    UserPlus,
    Search,
    X,
    Edit,
    Power,
    PowerOff,
    Trash2,
    Users,
    Phone,
    Mail,
    CheckCircle2,
    RotateCcw,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import * as Validation from '@/utils/validation.utils';
import { capitalizeFLetter, Failure, Success, useSetState } from '@/utils/functions.utils';
import crmStaffData from '@/data/crmStaffSampleData.json';

export interface StaffMember {
    id: string;
    name: string;
    role: string;
    mobile: string;
    email: string;
    workload: number;
    calls_today: number;
    status: string;
}

const toOpt = (v: string) => ({ value: v, label: v });

const ROLE_OPTIONS = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'TELECALLER', label: 'Telecaller' },
    { value: 'COUNSELLOR', label: 'Counsellor' },
];

const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const CRMUsersPage = () => {
    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState
    // =========================================================================
    const [state, setState] = useSetState({
        staffList: (crmStaffData as StaffMember[]) || [],
        isLoading: false,
        isOpenAddStaff: false,
        isEditMode: false,
        editingId: null as string | null,
        isSubmitting: false,
        errors: {} as Record<string, string>,

        // Search & Filters
        searchQuery: '',
        roleFilter: 'All Roles',
        statusFilter: 'All Status',

        // Pagination & Sorting
        currentPage: 1,
        recordsPerPage: 10,
        sortStatus: { columnAccessor: 'name', direction: 'asc' } as DataTableSortStatus,

        // Modal Form Fields
        fullName: '',
        assignedRole: 'TELECALLER',
        mobileNumber: '',
        institutionalEmail: '',
    });

    // ── Body scroll lock when modal is open ──────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = state.isOpenAddStaff ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [state.isOpenAddStaff]);

    // ── Load CRM Users on mount ──────────────────────────────────────────────
    useEffect(() => {
        getStaffList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================================================================
    // API FUNCTIONS — With fallback to static JSON data
    // =========================================================================
    const getStaffList = async () => {
        try {
            setState({ isLoading: true });
            // Attempt to fetch from backend API
            const body: any = {
                search: state.searchQuery || undefined,
                role: state.roleFilter !== 'All Roles' ? state.roleFilter : undefined,
                status: state.statusFilter !== 'All Status' ? state.statusFilter : undefined,
            };

            const res: any = await Models.user.userList(1, body).catch(() => null);

            if (res && res.results && Array.isArray(res.results) && res.results.length > 0) {
                const formattedUsers: StaffMember[] = res.results.map((u: any) => ({
                    id: u.username || u.id || `USR-${u.id}`,
                    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
                    role: u.groups?.[0]?.name?.toUpperCase() || (u.is_superuser ? 'ADMIN' : 'TELECALLER'),
                    mobile: u.phone_number || u.mobile || '—',
                    email: u.email || '—',
                    workload: u.workload || 0,
                    calls_today: u.calls_today || 0,
                    status: u.is_active ? 'Active' : 'Inactive',
                }));
                setState({ staffList: formattedUsers, isLoading: false });
            } else {
                // Display static data for now as requested
                setState({ staffList: crmStaffData as StaffMember[], isLoading: false });
            }
        } catch (error) {
            console.error('getStaffList error:', error);
            setState({ staffList: crmStaffData as StaffMember[], isLoading: false });
        }
    };

    // Toggle staff status (Active <-> Inactive)
    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            // Attempt API call if available
            await Models.user.updateUser({ is_active: nextStatus === 'Active' }, id).catch(() => null);

            // Update in-memory state
            const updated = state.staffList.map((s: StaffMember) =>
                s.id === id ? { ...s, status: nextStatus } : s
            );
            setState({ staffList: updated });
            Success(`Staff member status changed to ${nextStatus}`);
        } catch (error) {
            console.error('handleToggleStatus error:', error);
            Failure('Failed to update status');
        }
    };

    // Delete staff member
    const handleDeleteStaff = async (id: string) => {
        try {
            await Models.user.deleteUser(id).catch(() => null);
            const updated = state.staffList.filter((s: StaffMember) => s.id !== id);
            setState({ staffList: updated });
            Success('Staff member deleted successfully');
        } catch (error) {
            console.error('handleDeleteStaff error:', error);
            Failure('Failed to delete staff member');
        }
    };

    // Open Edit Staff Modal
    const handleEditStaff = (staff: StaffMember) => {
        const roleNormalized = staff.role.toUpperCase();

        setState({
            isEditMode: true,
            editingId: staff.id,
            fullName: staff.name,
            assignedRole: roleNormalized,
            mobileNumber: staff.mobile.replace(/^\+91\s*/, ''),
            institutionalEmail: staff.email,
            errors: {},
            isOpenAddStaff: true,
        });
    };

    // Handle Add / Update Submit via Yup Validation
    const handleAddStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setState({ isSubmitting: true, errors: {} });

            await Validation.crmUserValidation.validate(
                {
                    fullName: state.fullName,
                    assignedRole: state.assignedRole,
                    mobileNumber: state.mobileNumber,
                    institutionalEmail: state.institutionalEmail,
                },
                { abortEarly: false }
            );

            const formattedMobile = state.mobileNumber.trim().startsWith('+91')
                ? state.mobileNumber.trim()
                : `+91 ${state.mobileNumber.trim()}`;

            if (state.isEditMode && state.editingId) {
                // Update Staff Member
                const updatedPayload = {
                    name: state.fullName.trim(),
                    role: state.assignedRole.toUpperCase(),
                    mobile: formattedMobile,
                    email: state.institutionalEmail.trim().toLowerCase(),
                };

                await Models.user.updateUser(updatedPayload, state.editingId).catch(() => null);

                const updatedList = state.staffList.map((s: StaffMember) =>
                    s.id === state.editingId ? { ...s, ...updatedPayload } : s
                );

                setState({
                    staffList: updatedList,
                    isOpenAddStaff: false,
                    isSubmitting: false,
                    isEditMode: false,
                    editingId: null,
                    fullName: '',
                    assignedRole: 'TELECALLER',
                    mobileNumber: '',
                    institutionalEmail: '',
                    errors: {},
                });
                Success('Staff member updated successfully');
            } else {
                // Add New Staff Member
                const rolePrefix =
                    state.assignedRole.toUpperCase() === 'ADMIN'
                        ? 'USR-ADM'
                        : state.assignedRole.toUpperCase() === 'COUNSELLOR'
                        ? 'USR-CNS'
                        : 'USR-TC';
                const randomNum = Math.floor(100 + Math.random() * 900);
                const newId = `${rolePrefix}-${randomNum}`;

                const newStaff: StaffMember = {
                    id: newId,
                    name: state.fullName.trim(),
                    role: state.assignedRole.toUpperCase(),
                    mobile: formattedMobile,
                    email: state.institutionalEmail.trim().toLowerCase(),
                    workload: 0,
                    calls_today: 0,
                    status: 'Active',
                };

                await Models.user.addUser(newStaff).catch(() => null);

                setState({
                    staffList: [newStaff, ...state.staffList],
                    isOpenAddStaff: false,
                    isSubmitting: false,
                    currentPage: 1,
                    fullName: '',
                    assignedRole: 'TELECALLER',
                    mobileNumber: '',
                    institutionalEmail: '',
                    errors: {},
                });
                Success('Staff member added successfully');
            }
        } catch (error: any) {
            if (error?.inner) {
                const validationErrors: Record<string, string> = {};
                error.inner.forEach((err: any) => {
                    if (err.path && !validationErrors[err.path]) {
                        validationErrors[err.path] = err.message;
                    }
                });
                setState({ errors: validationErrors, isSubmitting: false });
                return;
            }
            console.error('handleAddStaffSubmit error:', error);
            setState({ isSubmitting: false });
            Failure(error?.message || 'An error occurred while saving');
        }
    };

    // Reset Filters
    const handleResetFilters = () => {
        setState({
            searchQuery: '',
            roleFilter: 'All Roles',
            statusFilter: 'All Status',
            currentPage: 1,
        });
    };

    // Helper for role pill styling
    const getRoleBadgeClass = (role: string) => {
        const normalized = (role || '').toUpperCase();
        if (normalized === 'ADMIN') {
            return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300';
        }
        if (normalized === 'COUNSELLOR') {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300';
        }
        return 'bg-green-100 text-[#16a34a] dark:bg-green-950/50 dark:text-green-400';
    };

    // =========================================================================
    // FILTERING, SORTING & PAGINATION (STATIC DATA FOR NOW)
    // =========================================================================
    const filteredRecords = useMemo(() => {
        return state.staffList.filter((item: StaffMember) => {
            // Search query filter
            if (state.searchQuery) {
                const q = state.searchQuery.toLowerCase().trim();
                const matchName = item.name.toLowerCase().includes(q);
                const matchId = item.id.toLowerCase().includes(q);
                const matchEmail = item.email.toLowerCase().includes(q);
                const matchMobile = item.mobile.toLowerCase().includes(q);
                if (!matchName && !matchId && !matchEmail && !matchMobile) {
                    return false;
                }
            }

            // Role filter
            if (state.roleFilter !== 'All Roles') {
                if (item.role.toUpperCase() !== state.roleFilter.toUpperCase()) {
                    return false;
                }
            }

            // Status filter
            if (state.statusFilter !== 'All Status') {
                if (item.status.toLowerCase() !== state.statusFilter.toLowerCase()) {
                    return false;
                }
            }

            return true;
        });
    }, [state.staffList, state.searchQuery, state.roleFilter, state.statusFilter]);

    // Sorting
    const sortedRecords = useMemo(() => {
        const records = [...filteredRecords];
        const { columnAccessor, direction } = state.sortStatus;

        return records.sort((a: any, b: any) => {
            const aVal = a[columnAccessor] ?? '';
            const bVal = b[columnAccessor] ?? '';

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return direction === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const comp = String(aVal).localeCompare(String(bVal));
            return direction === 'asc' ? comp : -comp;
        });
    }, [filteredRecords, state.sortStatus]);

    // Paginated slice
    const totalRecords = sortedRecords.length;
    const totalPages = Math.ceil(totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;
    const paginatedRecords = useMemo(() => {
        return sortedRecords.slice(startIndex, startIndex + state.recordsPerPage);
    }, [sortedRecords, startIndex, state.recordsPerPage]);

    const hasActiveFilters =
        state.searchQuery !== '' || state.roleFilter !== 'All Roles' || state.statusFilter !== 'All Status';

    // =========================================================================
    // DATATABLE COLUMNS
    // =========================================================================
    const columns = [
        {
            accessor: 'name',
            title: 'Staff Member',
            sortable: true,
            render: (row: StaffMember) => {
                const initial =
                    row.name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').charAt(0) || 'U';
                return (
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-[#39854a] border border-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-800">
                            {initial}
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {row.name}
                            </div>
                            <div className="text-xs font-semibold text-gray-400">
                                {row.id}
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessor: 'role',
            title: 'Role',
            sortable: true,
            render: (row: StaffMember) => (
                <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${getRoleBadgeClass(
                        row.role
                    )}`}
                >
                    {capitalizeFLetter(row.role.toLowerCase())}
                </span>
            ),
        },
        {
            accessor: 'contact',
            title: 'Contact Details',
            render: (row: StaffMember) => (
                <div>
                    <div className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-gray-200">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{row.mobile}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{row.email}</span>
                    </div>
                </div>
            ),
        },
        {
            accessor: 'workload',
            title: 'Active Workload',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: StaffMember) => (
                <div className="text-center">
                    <span className="font-semibold text-gray-900 dark:text-white">{row.workload}</span>{' '}
                    <span className="text-xs text-gray-400">contacts</span>
                </div>
            ),
        },
        {
            accessor: 'calls_today',
            title: 'Calls Today',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: StaffMember) => (
                <div className="text-center">
                    <span className="font-bold text-[#39854a]">{row.calls_today}</span>
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: StaffMember) => (
                <div className="flex justify-center">
                    <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            row.status === 'Active'
                                ? 'bg-emerald-50 text-[#39854a] border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800'
                                : 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                        }`}
                    >
                        {row.status}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (row: StaffMember) => (
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleEditStaff(row)}
                        title="Edit Staff Member"
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-500 transition hover:border-gray-300 hover:bg-emerald-50 hover:text-[#39854a] dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-green-400 cursor-pointer"
                    >
                        <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggleStatus(row.id, row.status)}
                        title={row.status === 'Active' ? 'Deactivate Staff' : 'Activate Staff'}
                        className={`rounded-lg border p-1.5 transition cursor-pointer ${
                            row.status === 'Active'
                                ? 'border-gray-200 text-emerald-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-emerald-400 dark:hover:border-red-800 dark:hover:bg-gray-800 dark:hover:text-red-400'
                                : 'border-gray-200 text-gray-400 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-gray-700 dark:text-gray-500 dark:hover:border-emerald-800 dark:hover:bg-gray-800 dark:hover:text-emerald-400'
                        }`}
                    >
                        {row.status === 'Active' ? (
                            <Power className="h-3.5 w-3.5" />
                        ) : (
                            <PowerOff className="h-3.5 w-3.5" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteStaff(row.id)}
                        title="Delete Staff Member"
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:hover:border-red-800 dark:hover:bg-gray-800 dark:hover:text-red-400 cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            ),
        },
    ];

    // =========================================================================
    // ADD / EDIT STAFF MODAL (WITH TextInput & CustomSelect)
    // =========================================================================
    const modalContent = state.isOpenAddStaff && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => setState({ isOpenAddStaff: false, errors: {} })}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {state.isEditMode ? 'Edit Staff Member' : 'Add New CRM Staff Member'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            Academic Year 2026–27 · Karpagam Group Admissions
                        </p>
                    </div>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs" noValidate>
                    {/* Full Name via TextInput */}
                    <TextInput
                        title="Full Name"
                        required
                        type="text"
                        value={state.fullName}
                        onChange={(val: string) => {
                            setState({ fullName: val });
                            if (state.errors?.fullName) {
                                const updated = { ...state.errors };
                                delete updated.fullName;
                                setState({ errors: updated });
                            }
                        }}
                        placeholder="e.g. S. Saravanan"
                        error={state.errors?.fullName}
                    />

                    {/* Assigned Role via CustomSelect */}
                    <CustomSelect
                        title="Assigned Role"
                        required
                        options={ROLE_OPTIONS}
                        value={ROLE_OPTIONS.find((r) => r.value === state.assignedRole) || null}
                        onChange={(opt) => {
                            setState({ assignedRole: opt?.value ? String(opt.value) : 'TELECALLER' });
                            if (state.errors?.assignedRole) {
                                const updated = { ...state.errors };
                                delete updated.assignedRole;
                                setState({ errors: updated });
                            }
                        }}
                        placeholder="Select Role"
                        isSearchable={false}
                        isClearable={false}
                        error={state.errors?.assignedRole}
                    />

                    {/* Mobile Number via TextInput */}
                    <TextInput
                        title="Mobile Number"
                        required
                        type="tel"
                        value={state.mobileNumber}
                        onChange={(val: string) => {
                            setState({ mobileNumber: val });
                            if (state.errors?.mobileNumber) {
                                const updated = { ...state.errors };
                                delete updated.mobileNumber;
                                setState({ errors: updated });
                            }
                        }}
                        placeholder="+91 9842X XXXXX"
                        error={state.errors?.mobileNumber}
                    />

                    {/* Institutional Email via TextInput */}
                    <TextInput
                        title="Institutional Email"
                        required
                        type="email"
                        value={state.institutionalEmail}
                        onChange={(val: string) => {
                            setState({ institutionalEmail: val });
                            if (state.errors?.institutionalEmail) {
                                const updated = { ...state.errors };
                                delete updated.institutionalEmail;
                                setState({ errors: updated });
                            }
                        }}
                        placeholder="saravanan.s@karpagam.edu.in"
                        error={state.errors?.institutionalEmail}
                    />

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setState({ isOpenAddStaff: false, errors: {} })}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={state.isSubmitting}
                            className="btn-action-solid flex items-center gap-2 px-4 py-2 text-xs font-bold disabled:opacity-60"
                        >
                            {state.isSubmitting ? (
                                <>
                                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{state.isEditMode ? 'Update Staff Member' : 'Add Staff Member'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // =========================================================================
    // PAGE RENDER
    // =========================================================================
    return (
        <div className="min-h-screen space-y-6 bg-[#f7faf8] p-4 sm:p-6 dark:bg-[#060818]">
            <Head>
                <title>CRM Staff & User Roles - KAHE Admissions</title>
            </Head>

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        CRM Staff & User Roles
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 dark:text-gray-400 sm:text-sm">
                        Manage authorized admission staff across Admin, Inbound Telecalling, and Senior Counselling desks.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            setState({
                                isOpenAddStaff: true,
                                isEditMode: false,
                                editingId: null,
                                fullName: '',
                                assignedRole: 'TELECALLER',
                                mobileNumber: '',
                                institutionalEmail: '',
                                errors: {},
                            })
                        }
                        className="btn-action-solid flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>+ Add Staff Member</span>
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="overview-panel space-y-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
                    {/* Search Input */}
                    <div className="md:col-span-6">
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Search Staff
                        </label>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={state.searchQuery}
                                onChange={(e) =>
                                    setState({ searchQuery: e.target.value, currentPage: 1 })
                                }
                                placeholder="Search staff name, ID, email, or mobile..."
                                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-9 text-xs font-semibold text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-white dark:placeholder-gray-500 sm:text-sm"
                            />
                            {state.searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setState({ searchQuery: '', currentPage: 1 })}
                                    className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Role Filter via CustomSelect */}
                    <div className="md:col-span-3">
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Role
                        </label>
                        <CustomSelect
                            options={[{ value: 'All Roles', label: 'All Roles' }, ...ROLE_OPTIONS]}
                            value={
                                state.roleFilter !== 'All Roles'
                                    ? ROLE_OPTIONS.find((r) => r.value === state.roleFilter) || null
                                    : toOpt('All Roles')
                            }
                            onChange={(opt) => {
                                setState({ roleFilter: opt?.value ? String(opt.value) : 'All Roles', currentPage: 1 });
                            }}
                            placeholder="All Roles"
                            isSearchable={false}
                            isClearable={false}
                        />
                    </div>

                    {/* Status Filter via CustomSelect */}
                    <div className="md:col-span-3">
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Status
                        </label>
                        <CustomSelect
                            options={[{ value: 'All Status', label: 'All Status' }, ...STATUS_OPTIONS]}
                            value={
                                state.statusFilter !== 'All Status'
                                    ? STATUS_OPTIONS.find((s) => s.value === state.statusFilter) || null
                                    : toOpt('All Status')
                            }
                            onChange={(opt) => {
                                setState({ statusFilter: opt?.value ? String(opt.value) : 'All Status', currentPage: 1 });
                            }}
                            placeholder="All Status"
                            isSearchable={false}
                            isClearable={false}
                        />
                    </div>
                </div>

                {/* Active Filter Chips */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 text-xs dark:border-gray-800">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Filtered By:</span>
                        {state.searchQuery && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                Search: &ldquo;{state.searchQuery}&rdquo;
                                <button
                                    type="button"
                                    onClick={() => setState({ searchQuery: '', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {state.roleFilter !== 'All Roles' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                Role: {capitalizeFLetter(state.roleFilter.toLowerCase())}
                                <button
                                    type="button"
                                    onClick={() => setState({ roleFilter: 'All Roles', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {state.statusFilter !== 'All Status' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                Status: {state.statusFilter}
                                <button
                                    type="button"
                                    onClick={() => setState({ statusFilter: 'All Status', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset Filters</span>
                        </button>
                    </div>
                )}
            </div>

            {/* MANTINE DATATABLE CONTAINER */}
            <div className="overview-panel overflow-hidden p-0 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                <DataTable
                    className="table-responsive"
                    records={paginatedRecords}
                    columns={columns}
                    fetching={state.isLoading}
                    minHeight={240}
                    withBorder={false}
                    highlightOnHover
                    noRecordsText="No staff members found matching criteria."
                    sortStatus={state.sortStatus}
                    onSortStatusChange={(s) => setState({ sortStatus: s })}
                    totalRecords={totalRecords}
                    recordsPerPage={state.recordsPerPage}
                    page={null}
                    onPageChange={() => {}}
                    styles={{
                        header: {
                            background: '#fafafa',
                            borderBottom: '1px solid #f3f4f6',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#374151',
                        },
                        pagination: { display: 'none' },
                    }}
                />

                {/* TABLE FOOTER & PAGINATION */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>
                            Showing{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {totalRecords === 0 ? 0 : startIndex + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {Math.min(startIndex + state.recordsPerPage, totalRecords)}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {totalRecords}
                            </span>{' '}
                            staff members
                        </span>

                        {/* Records per page selector */}
                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[11px] text-gray-400">Rows:</span>
                            <select
                                value={state.recordsPerPage}
                                onChange={(e) => {
                                    setState({ recordsPerPage: Number(e.target.value), currentPage: 1 });
                                }}
                                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={totalRecords}
                        recordsPerPage={state.recordsPerPage}
                        onPageChange={(page) => setState({ currentPage: page })}
                        hasNext={state.currentPage < totalPages}
                        hasPrevious={state.currentPage > 1}
                    />
                </div>
            </div>

            {/* ADD / EDIT STAFF MODAL PORTAL */}
            {typeof window !== 'undefined' &&
                ReactDOM.createPortal(modalContent, document.getElementById('modal-portal') || document.body)}
        </div>
    );
};

export default CRMUsersPage;
