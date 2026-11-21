import React, { useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Search, Phone, Eye, X, Pencil } from 'lucide-react';
import Pagination from '@/components/Pagination';
import admissionsData from '@/data/admissionsSampleData.json';
import crmStaffData from '@/data/crmStaffSampleData.json';
import StudentDetailsModal from './StudentDetailsModal';
import LogCallModal from './LogCallModal';
import CustomSelect from '@/components/Select';
import { useSetState } from '@/utils/functions.utils';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';

const toOpt = (v: string) => ({ value: v, label: v });

// ── types ─────────────────────────────────────────────────────────────────────
export interface AdmissionContact {
    id: string;
    student_name: string;
    badge?: string;
    enquiry_id: string;
    qualification: string;
    phone_number: string;
    parent_phone: string;
    city: string;
    area: string;
    target_course: string;
    institution: string;
    assigned_to: string;
    assigned_role?: string;
    status: string;
    categories?: string[];
}

export interface AdmissionsContactsTableProps {
    activeCategory?: string;
    categoryTitle?: string;
    onResetCategory?: () => void;
    onClose?: () => void;
    showCardFilterTag?: boolean;
    className?: string;
    showRoleFilter?: boolean;
    onViewContact?: (contact: AdmissionContact) => void;
    // ── dropdown options injected from parent (falls back to static data) ─────
    cityOptions?: { value: string; label: string }[];
    institutionOptions?: { value: string; label: string }[];
    qualificationOptions?: { value: string; label: string }[];
    telecallerOptions?: { value: string; label: string }[];
    roleOptions?: { value: string; label: string }[];
    stageOptions?: { value: string; label: string }[];
    // loadMore callbacks for paginated dropdowns
    onCityLoadMore?: () => void;
    onInstitutionLoadMore?: () => void;
    onQualificationLoadMore?: () => void;
    onTelecallerLoadMore?: () => void;
    onStageLoadMore?: () => void;
}

// ── status badge colours ──────────────────────────────────────────────────────
const statusBadgeClasses: Record<string, string> = {
    contacted: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    interested: 'bg-[#dcfce7] text-[#16a34a] dark:bg-green-950/40 dark:text-green-400',
    applied: 'bg-[#dbeafe] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-400',
    admitted: 'bg-[#d1fae5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400',
    new: 'bg-[#fef3c7] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400',
    'not interested': 'bg-[#fee2e2] text-[#dc2626] dark:bg-red-950/40 dark:text-red-400',
};

// ── component ─────────────────────────────────────────────────────────────────
const AdmissionsContactsTable: React.FC<AdmissionsContactsTableProps> = ({
    activeCategory = 'total_contacts',
    categoryTitle = 'Total Contacts',
    onResetCategory,
    onClose,
    showCardFilterTag,
    className = '',
    showRoleFilter = false,
    onViewContact,
    // injected dropdown options (fall back to static data when absent)
    cityOptions,
    institutionOptions,
    qualificationOptions,
    telecallerOptions,
    roleOptions,
    stageOptions,
    onCityLoadMore,
    onInstitutionLoadMore,
    onQualificationLoadMore,
    onTelecallerLoadMore,
    onStageLoadMore,
}) => {
    const router = useRouter();
    const [state, setState] = useSetState({
        search: '',
        cityFilter: 'All Cities',
        institutionFilter: 'All Institutions',
        qualificationFilter: 'All Qualifications',
        telecallerFilter: 'All Telecallers',
        roleFilter: 'All Roles',
        userFilter: 'All Users',
        stageFilter: 'All Stages',
        currentPage: 1,
        sortStatus: null as DataTableSortStatus | null,
        viewingContact: null as AdmissionContact | null,
        callingContact: null as AdmissionContact | null,
    });

    const PAGE_SIZE = 10;

    useEffect(() => { setState({ currentPage: 1 }); }, [activeCategory]);

    const resetPage = () => setState({ currentPage: 1 });

    // ── dropdown option lists (injected props take priority over static data) ──
    const staticCities = useMemo(() => ['All Cities', ...Array.from(new Set(admissionsData.map((i) => i.city)))], []);
    const staticInstitutions = useMemo(() => ['All Institutions', ...Array.from(new Set(admissionsData.map((i) => i.institution)))], []);
    const staticQualifications = useMemo(() => ['All Qualifications', ...Array.from(new Set(admissionsData.map((i) => i.qualification)))], []);
    const staticTelecallers = useMemo(() => ['All Telecallers', ...Array.from(new Set(admissionsData.map((i) => i.assigned_to)))], []);
    const stages = useMemo(() => ['All Stages', 'Contacted', 'Interested', 'Applied', 'Admitted', 'New'], []);

    const cities = staticCities.map(toOpt) ?? cityOptions;
    const institutions = staticInstitutions.map(toOpt) ?? institutionOptions;
    const qualifications = staticQualifications.map(toOpt) ?? qualificationOptions;
    const telecallers = staticTelecallers.map(toOpt) ?? telecallerOptions;
    const stagesOpts = stages.map(toOpt) ?? stageOptions;
    const rolesOpts = ['All Roles', 'Telecaller', 'Counsellor'].map(toOpt) ?? roleOptions;

    const telecallerList = useMemo(() => {
        const a = crmStaffData.filter((s) => s.role === 'TELECALLER').map((s) => s.name);
        const b = (admissionsData as any[]).filter((d) => d.assigned_role === 'Telecaller').map((d) => d.assigned_to);
        return Array.from(new Set([...a, ...b])).filter(Boolean);
    }, []);

    const counsellorList = useMemo(() => {
        const a = crmStaffData.filter((s) => s.role === 'COUNSELLOR').map((s) => s.name);
        const b = (admissionsData as any[]).filter((d) => d.assigned_role === 'Counsellor').map((d) => d.assigned_to);
        return Array.from(new Set([...a, ...b])).filter(Boolean);
    }, []);

    const allTeamUsers = useMemo(() => Array.from(new Set([...telecallerList, ...counsellorList])), [telecallerList, counsellorList]);

    const userOptions = useMemo(() => {
        if (state.roleFilter === 'Telecaller') return ['All Telecallers', ...telecallerList];
        if (state.roleFilter === 'Counsellor') return ['All Counsellors', ...counsellorList];
        return ['All Users', ...allTeamUsers];
    }, [state.roleFilter, telecallerList, counsellorList, allTeamUsers]);

    const userDropdownTitle =
        state.roleFilter === 'Telecaller' ? 'TELECALLER'
            : state.roleFilter === 'Counsellor' ? 'COUNSELLOR'
                : 'USER LIST';

    // ── filter logic ──────────────────────────────────────────────────────────
    const filteredData = useMemo(() => {
        return (admissionsData as AdmissionContact[]).filter((item) => {
            // category
            if (activeCategory && activeCategory !== 'all') {
                if (activeCategory === 'assigned' && item.assigned_to === 'Unassigned') return false;
                if (activeCategory === 'follow_ups' && !item.categories?.includes('follow_ups')) return false;
                if (activeCategory === 'interested' && !item.categories?.includes('interested')) return false;
            }
            // text search
            if (state.search.trim()) {
                const q = state.search.toLowerCase();
                const hit = [item.student_name, item.enquiry_id, item.phone_number, item.parent_phone,
                item.city, item.area, item.target_course, item.institution, item.assigned_to]
                    .some((v) => v?.toLowerCase().includes(q));
                if (!hit) return false;
            }
            // dropdown filters
            if (state.cityFilter !== 'All Cities' && item.city !== state.cityFilter) return false;
            if (state.institutionFilter !== 'All Institutions' && item.institution !== state.institutionFilter) return false;
            if (state.qualificationFilter !== 'All Qualifications' && item.qualification !== state.qualificationFilter) return false;
            if (state.stageFilter !== 'All Stages' && String(item.status ?? '').toLowerCase() !== state.stageFilter.toLowerCase()) return false;

            if (showRoleFilter) {
                if (state.roleFilter !== 'All Roles') {
                    const isTC = item.assigned_role === 'Telecaller' || telecallerList.includes(item.assigned_to);
                    const isCns = item.assigned_role === 'Counsellor' || counsellorList.includes(item.assigned_to);
                    if (state.roleFilter === 'Telecaller' && !isTC) return false;
                    if (state.roleFilter === 'Counsellor' && !isCns) return false;
                }
                if (!['All Users', 'All Telecallers', 'All Counsellors'].includes(state.userFilter) && item.assigned_to !== state.userFilter) return false;
            } else {
                if (state.telecallerFilter !== 'All Telecallers' && item.assigned_to !== state.telecallerFilter) return false;
            }
            return true;
        });
    }, [activeCategory, state.search, state.cityFilter, state.institutionFilter, state.qualificationFilter,
        state.telecallerFilter, state.roleFilter, state.userFilter, state.stageFilter,
        showRoleFilter, telecallerList, counsellorList]);

    const totalRecords = filteredData.length;
    const startIndex = (state.currentPage - 1) * PAGE_SIZE;
    const paginatedRecords = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

    // ── DataTable column definitions ──────────────────────────────────────────
    const columns: any[] = [
        {
            accessor: 'student_name',
            title: 'Student Name',
            sortable: true,
            render: (row: any) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white">{row.student_name}</span>
                        {row.badge && (
                            <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#16a34a]">
                                {row.badge}
                            </span>
                        )}
                    </div>
                    <span className="mt-0.5 text-xs text-gray-400">{row.enquiry_id} · {row.qualification}</span>
                </div>
            ),
        },
        {
            accessor: 'phone_number',
            title: 'Mobile & Parent',
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">{row.phone_number}</span>
                    <span className="mt-0.5 text-xs text-gray-400">P: {row.parent_phone}</span>
                </div>
            ),
        },
        {
            accessor: 'city',
            title: 'City / Area',
            sortable: true,
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">{row.city}</span>
                    <span className="mt-0.5 text-xs text-gray-400">{row.area}</span>
                </div>
            ),
        },
        {
            accessor: 'target_course',
            title: 'Target Course',
            sortable: true,
            render: (row: any) => (
                <div className="flex max-w-[220px] flex-col">
                    <span className="truncate font-semibold text-gray-900 dark:text-white">{row.target_course}</span>
                    <span className="mt-0.5 truncate text-xs text-gray-400">{row.institution}</span>
                </div>
            ),
        },
        {
            accessor: 'assigned_to',
            title: 'Assigned To',
            sortable: true,
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-gray-200">{row.assigned_to}</span>
                    {row.assigned_role && (
                        <span className={`mt-0.5 inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${row.assigned_role === 'Counsellor'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                : 'bg-emerald-100 text-[#39854a] dark:bg-emerald-950/50 dark:text-emerald-300'
                            }`}>
                            {row.assigned_role}
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
            render: (row: any) => {
                const cls = statusBadgeClasses[String(row?.status ?? '').toLowerCase()] ?? 'bg-gray-100 text-gray-700';
                return (
                    <div className="flex justify-center">
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}>
                            {row.status}
                        </span>
                    </div>
                );
            },
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (row: any) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setState({ callingContact: row })}
                        title="Call Student"
                        className="rounded-lg border border-gray-200 p-1.5 text-[#39854a] transition hover:bg-green-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                        <Phone className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (onViewContact) {
                                onViewContact(row);
                            } else {
                                setState({ viewingContact: row });
                            }
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push(`/contacts/edit_contact/${row.id || row.enquiry_id}`)}
                        title="Edit Contact"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-green-50 hover:text-[#39854a] dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                    </button>
                </div>
            ),
        },
    ];

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className={`space-y-4 ${className}`}>

            {/* ── Search & Filters ─────────────────────────────────────────── */}
            <div className="overview-panel space-y-4">
                {/* Search bar */}
                <div className="relative flex items-center">
                    <Search className="absolute left-4 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => { setState({ search: e.target.value }); resetPage(); }}
                        placeholder="Search student name, phone number, enquiry ID, city, or course..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-xs text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-white dark:placeholder-gray-500 sm:text-sm"
                    />
                    {state.search && (
                        <button type="button" onClick={() => setState({ search: '' })} className="absolute right-3 text-gray-400 hover:text-gray-600">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter dropdowns */}
                <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${showRoleFilter ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
                    <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">CITY / AREA</label>
                        <CustomSelect
                            options={cities.filter((o) => o.value !== 'All Cities')}
                            value={state.cityFilter !== 'All Cities' ? (cities.find((o) => o.value === state.cityFilter) ?? null) : null}
                            placeholder="All Cities"
                            isClearable={true}
                            isSearchable
                            loadMore={onCityLoadMore}
                            onChange={(opt) => { setState({ cityFilter: opt ? String(opt.value) : 'All Cities' }); resetPage(); }} />
                    </div>
                    <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">INSTITUTION / COLLEGE</label>
                        <CustomSelect
                            options={institutions.filter((o) => o.value !== 'All Institutions')}
                            value={state.institutionFilter !== 'All Institutions' ? (institutions.find((o) => o.value === state.institutionFilter) ?? null) : null}
                            placeholder="All Institutions"
                            isClearable={true}
                            isSearchable
                            loadMore={onInstitutionLoadMore}
                            onChange={(opt) => { setState({ institutionFilter: opt ? String(opt.value) : 'All Institutions' }); resetPage(); }} />
                    </div>
                    <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">QUALIFICATION</label>
                        <CustomSelect
                            options={qualifications.filter((o) => o.value !== 'All Qualifications')}
                            value={state.qualificationFilter !== 'All Qualifications' ? (qualifications.find((o) => o.value === state.qualificationFilter) ?? null) : null}
                            placeholder="All Qualifications"
                            isClearable={true}
                            isSearchable
                            loadMore={onQualificationLoadMore}
                            onChange={(opt) => { setState({ qualificationFilter: opt ? String(opt.value) : 'All Qualifications' }); resetPage(); }} />
                    </div>

                    {!showRoleFilter && (
                        <div>
                            <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">TELECALLER</label>
                            <CustomSelect
                                options={telecallers.filter((o) => o.value !== 'All Telecallers')}
                                value={state.telecallerFilter !== 'All Telecallers' ? (telecallers.find((o) => o.value === state.telecallerFilter) ?? null) : null}
                                placeholder="All Telecallers"
                                isClearable={true}
                                isSearchable
                                loadMore={onTelecallerLoadMore}
                                onChange={(opt) => { setState({ telecallerFilter: opt ? String(opt.value) : 'All Telecallers' }); resetPage(); }} />
                        </div>
                    )}

                    {showRoleFilter && (
                        <>
                            <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">ROLE</label>
                                <CustomSelect
                                    options={rolesOpts.filter((o) => o.value !== 'All Roles')}
                                    value={state.roleFilter !== 'All Roles' ? (rolesOpts.find((o) => o.value === state.roleFilter) ?? null) : null}
                                    placeholder="All Roles"
                                    isClearable={true}
                                    isSearchable={false}
                                    onChange={(opt) => {
                                        const role = opt ? String(opt.value) : 'All Roles';
                                        setState({
                                            roleFilter: role,
                                            userFilter: role === 'Telecaller' ? 'All Telecallers' : role === 'Counsellor' ? 'All Counsellors' : 'All Users',
                                        });
                                        resetPage();
                                    }}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{userDropdownTitle}</label>
                                <CustomSelect
                                    options={userOptions.map(toOpt).filter((o) => !['All Users', 'All Telecallers', 'All Counsellors'].includes(String(o.value)))}
                                    value={!['All Users', 'All Telecallers', 'All Counsellors'].includes(state.userFilter) ? (userOptions.map(toOpt).find((o) => o.value === state.userFilter) ?? null) : null}
                                    placeholder="All Users"
                                    isClearable={true}
                                    isSearchable
                                    onChange={(opt) => { setState({ userFilter: opt ? String(opt.value) : 'All Users' }); resetPage(); }} />
                            </div>
                        </>
                    )}

                    <div className={showRoleFilter ? '' : 'col-span-2 sm:col-span-1'}>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">ADMISSION STAGE</label>
                        <CustomSelect
                            options={stagesOpts.filter((o) => o.value !== 'All Stages')}
                            value={state.stageFilter !== 'All Stages' ? (stagesOpts.find((o) => o.value === state.stageFilter) ?? null) : null}
                            placeholder="All Stages"
                            isClearable={true}
                            isSearchable={false}
                            loadMore={onStageLoadMore}
                            onChange={(opt) => { setState({ stageFilter: opt ? String(opt.value) : 'All Stages' }); resetPage(); }} />
                    </div>
                </div>

                {/* ── Active filter chips ───────────────────────────────── */}
                {(() => {
                    const activeFilters = [
                        state.search.trim() && 
                        { 
                        key: 'search', 
                        label: `Search: "${state.search.trim()}"`, 
                        clear: () => { setState({ search: '' }); resetPage(); } 
                        },
                        state.cityFilter !== 'All Cities' && { key: 'city', label: `City: ${state.cityFilter}`, clear: () => { setState({ cityFilter: 'All Cities' }); resetPage(); } },
                        state.institutionFilter !== 'All Institutions' && { key: 'institution', label: `Institution: ${state.institutionFilter}`, clear: () => { setState({ institutionFilter: 'All Institutions' }); resetPage(); } },
                        state.qualificationFilter !== 'All Qualifications' && { key: 'qualification', label: `Qualification: ${state.qualificationFilter}`, clear: () => { setState({ qualificationFilter: 'All Qualifications' }); resetPage(); } },
                        state.telecallerFilter !== 'All Telecallers' && !showRoleFilter && { key: 'telecaller', label: `Telecaller: ${state.telecallerFilter}`, clear: () => { setState({ telecallerFilter: 'All Telecallers' }); resetPage(); } },
                        state.roleFilter !== 'All Roles' && showRoleFilter && { key: 'role', label: `Role: ${state.roleFilter}`, clear: () => { setState({ roleFilter: 'All Roles', userFilter: 'All Users' }); resetPage(); } },
                        !['All Users', 'All Telecallers', 'All Counsellors'].includes(state.userFilter) && showRoleFilter && { key: 'user', label: `User: ${state.userFilter}`, clear: () => { setState({ userFilter: 'All Users' }); resetPage(); } },
                        state.stageFilter !== 'All Stages' && { key: 'stage', label: `Stage: ${state.stageFilter}`, clear: () => { setState({ stageFilter: 'All Stages' }); resetPage(); } },
                    ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

                    if (activeFilters.length === 0) return null;
                    return (
                        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Filters:</span>
                            {activeFilters.map((f) => (
                                <span
                                    key={f.key}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-[#39854a] dark:bg-green-950/30 dark:text-green-400"
                                >
                                    {f.label}
                                    <button type="button" onClick={f.clear} className="ml-0.5 rounded-full hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setState({
                                        search: '',
                                        cityFilter: 'All Cities',
                                        institutionFilter: 'All Institutions',
                                        qualificationFilter: 'All Qualifications',
                                        telecallerFilter: 'All Telecallers',
                                        roleFilter: 'All Roles',
                                        userFilter: 'All Users',
                                        stageFilter: 'All Stages',
                                        currentPage: 1,
                                    });
                                }}
                                className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                            >
                                Clear All
                            </button>
                        </div>
                    );
                })()}

                {/* Active filter tag */}
                {(showCardFilterTag ?? Boolean(onClose || (activeCategory && activeCategory !== 'all' && activeCategory !== 'total_contacts'))) && (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-500">Filtered By:</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 text-xs font-bold text-[#39854a]">
                                {categoryTitle || activeCategory} · {totalRecords} Records
                            </span>
                            {onResetCategory && activeCategory && (
                                <button type="button" onClick={onResetCategory} className="text-xs text-gray-400 underline hover:text-gray-700 dark:hover:text-gray-200">
                                    Show All
                                </button>
                            )}
                        </div>
                        {onClose && (
                            <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                <X className="h-3.5 w-3.5 text-red-500" />
                                <span>Close Table</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── DataTable ────────────────────────────────────────────────── */}
            <div className="overview-panel overflow-hidden p-0">
                <DataTable
                    className="table-responsive"
                    records={paginatedRecords}
                    columns={columns}
                    fetching={false}
                    minHeight={240}
                    withBorder={false}
                    highlightOnHover
                    noRecordsText="No contacts found matching criteria."
                    sortStatus={state.sortStatus}
                    onSortStatusChange={(s) => setState({ sortStatus: s })}
                    // hide mantine's built-in pagination — we use our own below
                    totalRecords={paginatedRecords.length}
                    recordsPerPage={PAGE_SIZE}
                    page={null}
                    onPageChange={() => { }}
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
                    paginationText={() => ''}
                />

                {/* Pagination row */}
                <div className="flex flex-col gap-3 border-t border-gray-100 p-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-gray-500">
                        Showing {totalRecords === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + PAGE_SIZE, totalRecords)} of {totalRecords} entries
                    </span>
                    <div className="self-center sm:self-auto">
                        <Pagination
                            currentPage={state.currentPage}
                            totalRecords={totalRecords}
                            onPageChange={(page) => setState({ currentPage: page })}
                            hasNext={startIndex + PAGE_SIZE < totalRecords}
                            hasPrevious={state.currentPage > 1}
                            recordsPerPage={PAGE_SIZE}
                        />
                    </div>
                </div>
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}
            <StudentDetailsModal
                contact={state.viewingContact}
                isOpen={Boolean(state.viewingContact)}
                onClose={() => setState({ viewingContact: null })}
                onLogCall={(contact) => setState({ callingContact: contact, viewingContact: null })}
            />
            <LogCallModal
                contact={state.callingContact}
                isOpen={Boolean(state.callingContact)}
                onClose={() => setState({ callingContact: null })}
                onSaveCall={(callData) => console.log('Call logged:', callData)}
            />
        </div>
    );
};

export default AdmissionsContactsTable;
