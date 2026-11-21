import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import {
    Users,
    RotateCcw,
    Calendar,
    Eye,
    Clock,
    Sparkles,
    UserPlus,
    Search,
    CheckCircle2,
    SlidersHorizontal,
    PhoneCall,
    RefreshCw,
    X,
    Phone,
    MessageCircle,
    GraduationCap,
    Pencil,
    User,
    BookOpen,
    Award,
    Building,
    Star,
    Mail,
    MapPin,
    ArrowRight,
    Send,
    Loader2,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import TextInput from '@/components/TextInput';
import CheckboxInput from '@/components/Checkbox';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import { capitalizeFLetter, Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';

import assignmentData from '@/data/assignmentSampleData.json';
import admissionsData from '@/data/admissionsSampleData.json';
import { AdmissionContact } from '@/components/KAHE/AdmissionsContactsTable';

// =============================================================================
// DATA INTERFACES & TYPES
// =============================================================================
type TabKey = 'assignment' | 'workload' | 'history';
type QueueFilter = 'unassigned' | 'new_imports' | 'all';
type DistributionMode = 'manual' | 'equal';
type DateFilter = 'all' | 'day' | 'month' | 'year' | 'custom';

export interface UnassignedQueueItem {
    id: string;
    student_name: string;
    enquiry_id: string;
    phone_number: string;
    city: string;
    target_course: string;
    batch?: string;
    imported_date?: string;
    is_new?: boolean;
    status: string;
    allData?: any;
}

export interface TelecallerWorkloadItem {
    id: string;
    name: string;
    phone: string;
    status: string;
    assigned: number;
    called: number;
    pending: number;
    allData?: any;
}

export interface AssignmentLogItem {
    id: string;
    date: string;
    telecaller: string;
    count: number;
    assigned_by: string;
    academic_year: string;
    action_type: string;
    allData?: any;
}

// =============================================================================
// SELECT OPTIONS & CONSTANTS
// =============================================================================
const TELECALLER_OPTIONS = [
    { value: '', label: 'All Telecallers' },
    { value: 'P. Malathi', label: 'P. Malathi' },
    { value: 'S. Ramesh Kumar', label: 'S. Ramesh Kumar' },
    { value: 'K. Kavitha', label: 'K. Kavitha' },
];

const ACADEMIC_YEAR_OPTIONS = [
    { value: 'AY 2026–27', label: 'AY 2026–27' },
    { value: 'AY 2025–26', label: 'AY 2025–26' },
];

const DATE_FILTER_LABELS: Record<DateFilter, string> = {
    all: 'All Dates',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    custom: 'Custom Range',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const AssignContactPage = () => {
    const router = useRouter();

    // ── Unified State Architecture ───────────────────────────────────────────
    const [state, setState] = useSetState({
        // Navigation Tab
        activeTab: 'assignment' as TabKey,

        // Statistics Cards Data
        stats: assignmentData.stats,

        // Tab 1: Contact Assignment States
        unassignedQueue: assignmentData.unassignedQueue as UnassignedQueueItem[],
        allQueueData: null as any,
        queueFilter: 'unassigned' as QueueFilter,
        queueSearch: '',
        selectedContactIds: [] as string[],
        distributionMode: 'manual' as DistributionMode,
        selectedTelecallersForEqual: ['P. Malathi', 'S. Ramesh Kumar', 'K. Kavitha'] as string[],
        manualQuantities: {
            'P. Malathi': 0,
            'S. Ramesh Kumar': 0,
            'K. Kavitha': 0,
        } as Record<string, number>,
        singleSelectedTelecaller: '',
        isLoadingQueue: false,
        isAssigning: false,
        queuePage: 1,
        queueTotalRecords: assignmentData.unassignedQueue.length,

        // Tab 2: Workload Table States
        telecallerWorkloads: assignmentData.telecallerWorkloads as TelecallerWorkloadItem[],
        allWorkloadData: null as any,
        workloadSearch: '',
        workloadPage: 1,
        workloadRecordsPerPage: 10,
        workloadSortStatus: { columnAccessor: 'name', direction: 'asc' } as DataTableSortStatus,
        isLoadingWorkload: false,
        workloadTotalRecords: assignmentData.telecallerWorkloads.length,

        // Tab 3: History Table & Filter States
        assignmentLogs: assignmentData.assignmentLogs as AssignmentLogItem[],
        allHistoryData: null as any,
        historySearch: '',
        dateFilter: 'custom' as DateFilter,
        fromDate: '01/05/2026',
        toDate: '31/05/2026',
        telecallerFilter: null as { value: string; label: string } | null,
        academicYearFilter: { value: 'AY 2026–27', label: 'AY 2026–27' } as { value: string; label: string } | null,
        historyPage: 1,
        historyRecordsPerPage: 10,
        historySortStatus: { columnAccessor: 'date', direction: 'desc' } as DataTableSortStatus,
        isLoadingHistory: false,
        historyTotalRecords: assignmentData.assignmentLogs.length,

        // Modals
        assignedModalTelecaller: null as string | null,
        isReassignModalOpen: false,
        reassignConfig: {
            contactsSummary: '',
            totalCount: 0,
            currentOwner: '',
        },

        // Profile View & Log Call Modals
        viewingStudent: null as AdmissionContact | null,
        callingContact: null as AdmissionContact | null,
    });

    const debouncedQueueSearch = useDebounce(state.queueSearch, 300);
    const debouncedWorkloadSearch = useDebounce(state.workloadSearch, 300);
    const debouncedHistorySearch = useDebounce(state.historySearch, 300);

    // =========================================================================
    // SEPARATE API FUNCTIONS (Modeled after all_contacts.tsx)
    // =========================================================================

    // ── 1. Assignment Stats API Function ─────────────────────────────────────
    const getAssignmentStats = async () => {
        try {
            const res: any = await Models.contact.assignment.stats().catch(() => null);
            if (res?.data || res?.stats) {
                setState({ stats: res.data || res.stats });
            }
        } catch (error) {
            console.error('getAssignmentStats error:', error);
        }
    };

    // ── 2. Tab 1: Queue Body Data & Table Data Mapper ────────────────────────
    const queueBodyData = () => {
        const body: any = {};
        if (state.queueFilter && state.queueFilter !== 'all') {
            body.filter = state.queueFilter;
        }
        if (debouncedQueueSearch) {
            body.search = debouncedQueueSearch;
        }
        return body;
    };

    const queueTableData = (res: any) => {
        const rawList = res?.results || res?.data || (Array.isArray(res) ? res : []);
        const data: UnassignedQueueItem[] = rawList.map((item: any, index: number) => {
            return {
                ...item,
                allData: item,
                id: item?.id || `ENQ-2026-${String(index + 109).padStart(4, '0')}`,
                student_name: capitalizeFLetter(item?.student_name) || item?.student_name || '—',
                enquiry_id: item?.enquiry_id || item?.id || `ENQ-2026-${String(index + 109).padStart(4, '0')}`,
                phone_number: item?.phone_number || item?.mobile || '—',
                city: capitalizeFLetter(item?.city?.city_name) || capitalizeFLetter(item?.city) || '—',
                target_course: capitalizeFLetter(item?.target_course) || capitalizeFLetter(item?.course) || '—',
                batch: item?.batch || 'General Batch',
                imported_date: item?.imported_date || (item?.created_at ? moment(item.created_at).format('YYYY-MM-DD') : '2026-05-05'),
                is_new: Boolean(item?.is_new),
                status: item?.status || 'Unassigned',
            };
        });
        console.log('✌️queue data --->', data);
        setState({ unassignedQueue: data, allQueueData: res });
    };

    // ── 2b. Tab 1: Get Assignment Queue API Function ─────────────────────────
    const getAssignmentQueue = async (page = 1) => {
        try {
            setState({ isLoadingQueue: true });
            const body = queueBodyData();
            const res: any = await Models.contact.assignment.queue(page, body).catch(() => null);
            console.log('assignment queue API response:', res);
            if (res) {
                queueTableData(res);
            }
            setState({
                isLoadingQueue: false,
                queuePage: page,
                queueTotalRecords: res?.count ?? (res?.results?.length || state.unassignedQueue.length),
            });
        } catch (error) {
            setState({ isLoadingQueue: false });
            console.error('getAssignmentQueue error:', error);
        }
    };

    // ── 3. Tab 2: Workload Body Data & Table Data Mapper ─────────────────────
    const workloadBodyData = () => {
        const body: any = {};
        if (debouncedWorkloadSearch) {
            body.search = debouncedWorkloadSearch;
        }
        if (state.workloadSortStatus?.columnAccessor) {
            const prefix = state.workloadSortStatus.direction === 'desc' ? '-' : '';
            body.ordering = `${prefix}${state.workloadSortStatus.columnAccessor}`;
        }
        return body;
    };

    const workloadTableData = (res: any) => {
        const rawList = res?.results || res?.data || (Array.isArray(res) ? res : []);
        const data: TelecallerWorkloadItem[] = rawList.map((item: any, index: number) => {
            return {
                ...item,
                allData: item,
                id: item?.id ? String(item.id) : String(index + 1),
                name: capitalizeFLetter(item?.name) || item?.name || '—',
                phone: item?.phone || item?.mobile || '—',
                status: capitalizeFLetter(item?.status) || 'Active',
                assigned: Number(item?.assigned ?? 0),
                called: Number(item?.called ?? 0),
                pending: Number(item?.pending ?? 0),
            };
        });
        console.log('✌️workload data --->', data);
        setState({ telecallerWorkloads: data, allWorkloadData: res });
    };

    // ── 3b. Tab 2: Get Workload List API Function ────────────────────────────
    const getWorkloadList = async (page = 1) => {
        try {
            setState({ isLoadingWorkload: true });
            const body = workloadBodyData();
            const res: any = await Models.contact.assignment.workloads(page, body).catch(() => null);
            console.log('team workloads API response:', res);
            if (res) {
                workloadTableData(res);
            }
            setState({
                isLoadingWorkload: false,
                workloadPage: page,
                workloadTotalRecords: res?.count ?? (res?.results?.length || state.telecallerWorkloads.length),
            });
        } catch (error) {
            setState({ isLoadingWorkload: false });
            console.error('getWorkloadList error:', error);
        }
    };

    // ── 4. Tab 3: History Body Data & Table Data Mapper ──────────────────────
    const historyBodyData = () => {
        const body: any = {};
        if (debouncedHistorySearch) {
            body.search = debouncedHistorySearch;
        }
        if (state.telecallerFilter?.value) {
            body.telecaller = state.telecallerFilter.value;
        }
        if (state.academicYearFilter?.value) {
            body.academic_year = state.academicYearFilter.value;
        }
        if (state.dateFilter === 'custom') {
            body.from_date = state.fromDate;
            body.to_date = state.toDate;
        } else if (state.dateFilter !== 'all') {
            body.date_range = state.dateFilter;
        }
        if (state.historySortStatus?.columnAccessor) {
            const prefix = state.historySortStatus.direction === 'desc' ? '-' : '';
            body.ordering = `${prefix}${state.historySortStatus.columnAccessor}`;
        }
        return body;
    };

    const historyTableData = (res: any) => {
        const rawList = res?.results || res?.data || (Array.isArray(res) ? res : []);
        const data: AssignmentLogItem[] = rawList.map((item: any, index: number) => {
            return {
                ...item,
                allData: item,
                id: item?.id ? String(item.id) : `LOG-${index + 1}`,
                date: item?.date || (item?.created_at ? moment(item.created_at).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')),
                telecaller: capitalizeFLetter(item?.telecaller) || item?.telecaller || '—',
                count: Number(item?.count ?? 1),
                assigned_by: item?.assigned_by || 'Prof. R. Natarajan (Admin)',
                academic_year: item?.academic_year || 'AY 2026–27',
                action_type: capitalizeFLetter(item?.action_type) || 'New Assignment',
            };
        });
        console.log('✌️history data --->', data);
        setState({ assignmentLogs: data, allHistoryData: res });
    };

    // ── 4b. Tab 3: Get History List API Function ─────────────────────────────
    const getHistoryList = async (page = 1) => {
        try {
            setState({ isLoadingHistory: true });
            const body = historyBodyData();
            const res: any = await Models.contact.assignment.history(page, body).catch(() => null);
            console.log('assignment history API response:', res);
            if (res) {
                historyTableData(res);
            }
            setState({
                isLoadingHistory: false,
                historyPage: page,
                historyTotalRecords: res?.count ?? (res?.results?.length || state.assignmentLogs.length),
            });
        } catch (error) {
            setState({ isLoadingHistory: false });
            console.error('getHistoryList error:', error);
        }
    };

    // =========================================================================
    // TAB PILL CHANGE HANDLER (TRIGGERS API PER TAB)
    // =========================================================================
    const handleTabChange = (newTab: TabKey) => {
        setState({ activeTab: newTab });

        if (newTab === 'assignment') {
            getAssignmentQueue(1);
            getAssignmentStats();
        } else if (newTab === 'workload') {
            getWorkloadList(1);
        } else if (newTab === 'history') {
            getHistoryList(1);
        }
    };

    // Initial load on component mount
    useEffect(() => {
        getAssignmentStats();
        getAssignmentQueue(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Tab 1 filters / search change listener
    useEffect(() => {
        if (state.activeTab === 'assignment') {
            getAssignmentQueue(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.queueFilter, debouncedQueueSearch]);

    // Tab 2 search / sorting change listener
    useEffect(() => {
        if (state.activeTab === 'workload') {
            getWorkloadList(state.workloadPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedWorkloadSearch, state.workloadSortStatus, state.workloadPage]);

    // Tab 3 filters / search / date / sorting change listener
    useEffect(() => {
        if (state.activeTab === 'history') {
            getHistoryList(state.historyPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        state.dateFilter,
        state.fromDate,
        state.toDate,
        state.telecallerFilter,
        state.academicYearFilter,
        debouncedHistorySearch,
        state.historySortStatus,
        state.historyPage,
    ]);

    // =========================================================================
    // TAB 1 ACTIONS & ALLOCATION LOGIC
    // =========================================================================
    const filteredQueue = useMemo(() => {
        let list = [...state.unassignedQueue];

        if (state.queueFilter === 'unassigned') {
            list = list.filter((item) => item.status === 'Unassigned');
        } else if (state.queueFilter === 'new_imports') {
            list = list.filter((item) => item.is_new);
        }

        if (debouncedQueueSearch.trim()) {
            const query = debouncedQueueSearch.toLowerCase();
            list = list.filter(
                (item) =>
                    item.student_name?.toLowerCase().includes(query) ||
                    item.phone_number?.toLowerCase().includes(query) ||
                    item.city?.toLowerCase().includes(query) ||
                    item.target_course?.toLowerCase().includes(query) ||
                    item.enquiry_id?.toLowerCase().includes(query) ||
                    item.batch?.toLowerCase().includes(query)
            );
        }

        return list;
    }, [state.unassignedQueue, state.queueFilter, debouncedQueueSearch]);

    const isAllQueueSelected =
        filteredQueue.length > 0 &&
        filteredQueue.every((item) => state.selectedContactIds.includes(item.id));

    const handleSelectAllQueue = (checked: boolean) => {
        if (checked) {
            const allIds = Array.from(new Set([...state.selectedContactIds, ...filteredQueue.map((c) => c.id)]));
            setState({ selectedContactIds: allIds });
        } else {
            const filteredIds = filteredQueue.map((c) => c.id);
            setState({
                selectedContactIds: state.selectedContactIds.filter((id) => !filteredIds.includes(id)),
            });
        }
    };

    const handleToggleQueueContact = (id: string, checked: boolean) => {
        if (checked) {
            setState({ selectedContactIds: [...state.selectedContactIds, id] });
        } else {
            setState({ selectedContactIds: state.selectedContactIds.filter((i) => i !== id) });
        }
    };

    // ── Confirm Assignment API Action ────────────────────────────────────────
    const handleConfirmAssignment = async () => {
        if (state.selectedContactIds.length === 0) {
            Failure('Please select at least one contact to assign.');
            return;
        }

        if (state.distributionMode === 'equal' && state.selectedTelecallersForEqual.length === 0) {
            Failure('Please select at least one telecaller for equal distribution.');
            return;
        }

        try {
            setState({ isAssigning: true });

            const payload = {
                mode: state.distributionMode,
                selected_contact_ids: state.selectedContactIds,
                telecallers:
                    state.distributionMode === 'equal'
                        ? state.selectedTelecallersForEqual
                        : [state.singleSelectedTelecaller || 'P. Malathi'],
                manual_quantities: state.manualQuantities,
                total_count: state.selectedContactIds.length,
            };

            await Models.contact.assignment.assign(payload).catch((err) => {
                console.warn('API assign fallback:', err);
            });

            Success(
                state.distributionMode === 'equal'
                    ? `Successfully split ${state.selectedContactIds.length} contact(s) equally among ${state.selectedTelecallersForEqual.join(', ')}!`
                    : `Successfully assigned ${state.selectedContactIds.length} contact(s) via manual distribution!`
            );

            setState({ selectedContactIds: [], isAssigning: false });
            getAssignmentQueue(1);
            getAssignmentStats();
        } catch (error: any) {
            setState({ isAssigning: false });
            Failure(error?.message || 'Failed to complete assignment.');
        }
    };

    // =========================================================================
    // TAB 2 & 3 TABLE COLUMNS
    // =========================================================================

    const handleOpenReassignForTelecaller = (telecallerName: string, count: number) => {
        const contactsForTelecaller =
            assignmentData.telecallerAssignedContacts[
                telecallerName as keyof typeof assignmentData.telecallerAssignedContacts
            ] || [];
        const summary = contactsForTelecaller.map((c) => c.student_name).slice(0, 3).join(', ');
        const remainder = count > 3 ? ` and ${count - 3} others` : '';

        setState({
            reassignConfig: {
                contactsSummary: summary ? `${summary}${remainder}` : `${count} contacts`,
                totalCount: count,
                currentOwner: telecallerName,
            },
            isReassignModalOpen: true,
        });
    };

    const handleOpenAssignedContacts = (telecallerName: string) => {
        setState({ assignedModalTelecaller: telecallerName });
    };

    const handleViewProfile = (studentId: string) => {
        const fullStudent = (admissionsData as AdmissionContact[]).find((s) => s.id === studentId);
        if (fullStudent) {
            setState({ viewingStudent: fullStudent });
        } else {
            setState({
                viewingStudent: {
                    id: studentId,
                    student_name: 'Student ' + studentId,
                    enquiry_id: studentId,
                    qualification: '12th Standard',
                    phone_number: '+91 98421 98210',
                    parent_phone: '-',
                    city: 'Coimbatore',
                    area: 'Gandhipuram',
                    target_course: 'Computer Science & Engineering',
                    institution: 'KAHE',
                    assigned_to: state.assignedModalTelecaller || 'P. Malathi',
                    status: 'Called',
                },
            });
        }
    };

    // ── Workload Table Columns ───────────────────────────────────────────────
    const workloadColumns = useMemo(
        () => [
            {
                accessor: 'name',
                title: 'Telecaller Name',
                sortable: true,
                render: (row: TelecallerWorkloadItem) => (
                    <div className="flex flex-col py-1">
                        <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                            {row.name}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">{row.phone}</span>
                    </div>
                ),
            },
            {
                accessor: 'status',
                title: 'Status',
                sortable: true,
                render: (row: TelecallerWorkloadItem) => (
                    <span className="inline-block rounded-full bg-[#dcfce7] px-3 py-0.5 text-xs font-bold text-[#16a34a] dark:bg-green-950/40 border border-green-200 dark:border-green-900/60">
                        {row.status}
                    </span>
                ),
            },
            {
                accessor: 'assigned',
                title: 'Current Assigned',
                sortable: true,
                render: (row: TelecallerWorkloadItem) => (
                    <span className="inline-block rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 font-bold text-xs text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {row.assigned} contacts
                    </span>
                ),
            },
            {
                accessor: 'called',
                title: 'Called Contacts',
                sortable: true,
                render: (row: TelecallerWorkloadItem) => (
                    <span className="inline-block rounded-lg border border-green-200 bg-green-50/60 px-3 py-1 font-bold text-xs text-[#39854a] dark:border-green-900/60 dark:bg-green-950/30">
                        {row.called}
                    </span>
                ),
            },
            {
                accessor: 'pending',
                title: 'Pending Calls',
                sortable: true,
                render: (row: TelecallerWorkloadItem) => (
                    <span
                        className={`inline-block rounded-lg px-3 py-1 font-bold text-xs ${
                            row.pending === 0
                                ? 'border border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800'
                                : 'border border-amber-200 bg-amber-50 text-[#ea580c] dark:border-amber-900/60 dark:bg-amber-950/30'
                        }`}
                    >
                        {row.pending}
                    </span>
                ),
            },
            {
                accessor: 'actions',
                title: 'Actions',
                titleClassName: '!text-right',
                render: (row: TelecallerWorkloadItem) => (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenAssignedContacts(row.name)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
                            <span>View ({row.assigned})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOpenReassignForTelecaller(row.name, row.assigned)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/60 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs cursor-pointer dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reassign</span>
                        </button>
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // ── History Table Columns ────────────────────────────────────────────────
    const historyColumns = useMemo(
        () => [
            {
                accessor: 'date',
                title: 'Assignment Date',
                sortable: true,
                render: (log: AssignmentLogItem) => (
                    <div className="flex items-center gap-2 py-1 font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{log.date}</span>
                    </div>
                ),
            },
            {
                accessor: 'telecaller',
                title: 'Telecaller',
                sortable: true,
                render: (log: AssignmentLogItem) => (
                    <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                        {log.telecaller}
                    </span>
                ),
            },
            {
                accessor: 'count',
                title: 'Contacts Assigned',
                sortable: true,
                render: (log: AssignmentLogItem) => (
                    <span className="inline-block rounded-md bg-[#dcfce7] px-2.5 py-0.5 text-xs font-bold text-[#16a34a] dark:bg-green-950/40 border border-green-200 dark:border-green-900/60">
                        {log.count} {log.count === 1 ? 'contact' : 'contacts'}
                    </span>
                ),
            },
            {
                accessor: 'assigned_by',
                title: 'Assigned By',
                sortable: true,
                render: (log: AssignmentLogItem) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                            {log.assigned_by}
                        </span>
                        <span className="text-[11px] text-gray-400">{log.academic_year}</span>
                    </div>
                ),
            },
            {
                accessor: 'action_type',
                title: 'Action Type',
                sortable: true,
                render: (log: AssignmentLogItem) => (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-0.5 text-xs font-bold text-[#39854a] border border-green-200 dark:bg-green-950/40 dark:border-green-900/60">
                        <UserPlus className="h-3 w-3" />
                        <span>{log.action_type}</span>
                    </span>
                ),
            },
            {
                accessor: 'actions',
                title: 'Action',
                titleClassName: '!text-right',
                render: (log: AssignmentLogItem) => (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleOpenAssignedContacts(log.telecaller)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        >
                            <Eye className="h-3.5 w-3.5 text-gray-500" />
                            <span>View Contacts</span>
                        </button>
                    </div>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // =========================================================================
    // MAIN PAGE JSX DOM
    // =========================================================================
    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen dark:bg-[#060818]">
            <Head>
                <title>Contact Assignment Management - KAHE CRM</title>
            </Head>

            {/* 1. TOP HEADER & TAB SWITCHER (Calls API on Tab Switch) */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Contact Assignment Management
                    </h1>
                    <p className="page-subtitle max-w-lg mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Allocate imported student contacts to telecallers, monitor team workload, and track distribution audit history.
                    </p>
                </div>

                {/* 3-Tab Pill Segmented Control */}
                <div className="inline-flex items-center rounded-2xl bg-gray-100/90 p-1 dark:bg-[#121e32] border border-gray-200/80 dark:border-gray-800 shadow-inner">
                    <button
                        type="button"
                        onClick={() => handleTabChange('assignment')}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            state.activeTab === 'assignment'
                                ? 'bg-[#39854a] text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>Contact Assignment</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('workload')}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            state.activeTab === 'workload'
                                ? 'bg-[#39854a] text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>Team Workload</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabChange('history')}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            state.activeTab === 'history'
                                ? 'bg-[#39854a] text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        <span>Assignment History</span>
                    </button>
                </div>
            </div>

            {/* 2. OVERVIEW STAT CARDS (POPULATED FROM STATS API) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="stat-card rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#0e1726]">
                    <span className="stat-card-title text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Total Telecallers
                    </span>
                    <div className="stat-card-value text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {state.stats.total_telecallers}
                    </div>
                    <p className="mt-1 text-xs font-bold text-[#39854a]">Active staff members</p>
                </div>

                <div className="stat-card rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#0e1726]">
                    <span className="stat-card-title text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Total Contacts (AY 2026–27)
                    </span>
                    <div className="stat-card-value text-2xl font-black text-gray-900 dark:text-white mt-1">
                        {state.stats.total_contacts}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">All valid student enquiries</p>
                </div>

                <div className="stat-card rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#0e1726]">
                    <span className="stat-card-title text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Assigned
                    </span>
                    <div className="stat-card-value text-2xl font-black text-[#39854a] mt-1">
                        {state.stats.assigned}
                    </div>
                    <p className="mt-1 text-xs text-gray-400">Allocated to telecallers</p>
                </div>

                <div className="stat-card rounded-2xl border border-amber-200 bg-white p-5 shadow-xs dark:border-amber-900/60 dark:bg-[#0e1726]">
                    <span className="stat-card-title text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        Unassigned
                    </span>
                    <div className="stat-card-value text-2xl font-black text-[#ea580c] mt-1">
                        {state.stats.unassigned}
                    </div>
                    <p className="mt-1 text-xs font-bold text-[#ea580c]">Ready for allocation</p>
                </div>
            </div>

            {/* ============================================================== */}
            {/* 3. TAB 1: CONTACT ASSIGNMENT */}
            {/* ============================================================== */}
            {state.activeTab === 'assignment' && (
                <div className="space-y-4">
                    {/* Sub-filter Badges & Selected Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setState({ queueFilter: 'unassigned' })}
                                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.queueFilter === 'unassigned'
                                        ? 'bg-[#ea580c] text-white shadow-xs'
                                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#0e1726] dark:text-gray-200'
                                }`}
                            >
                                Unassigned Contacts{' '}
                                <span className="ml-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                                    {state.unassignedQueue.filter((q) => q.status === 'Unassigned').length}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setState({ queueFilter: 'new_imports' })}
                                className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                    state.queueFilter === 'new_imports'
                                        ? 'border-[#39854a] bg-emerald-50 text-[#39854a] dark:bg-emerald-950/40 dark:border-emerald-700 font-bold'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#0e1726] dark:text-gray-200'
                                }`}
                            >
                                <Sparkles className="h-3.5 w-3.5 text-[#39854a]" />
                                <span>New Imports</span>
                                <span className="ml-1.5 rounded-full bg-green-100 dark:bg-green-950/60 px-2 py-0.5 text-[10px] font-bold text-[#39854a]">
                                    {state.unassignedQueue.filter((q) => q.is_new).length}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setState({ queueFilter: 'all' })}
                                className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                                    state.queueFilter === 'all'
                                        ? 'border-[#39854a] bg-emerald-50 text-[#39854a] dark:bg-emerald-950/40 dark:border-emerald-700 font-bold'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-[#0e1726] dark:text-gray-200'
                                }`}
                            >
                                All Queue Contacts{' '}
                                <span className="ml-1.5 text-[11px] text-gray-400">
                                    {state.unassignedQueue.length}
                                </span>
                            </button>
                        </div>

                        {state.selectedContactIds.length > 0 && (
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {state.selectedContactIds.length} contact(s) selected
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setState({
                                            reassignConfig: {
                                                contactsSummary: `${state.selectedContactIds.length} contacts selected from queue`,
                                                totalCount: state.selectedContactIds.length,
                                                currentOwner: 'Unassigned',
                                            },
                                            isReassignModalOpen: true,
                                        });
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition shadow-2xs cursor-pointer dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Reassign Selected</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2-Column Main Section */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* LEFT COLUMN: Queue Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden lg:col-span-7 flex flex-col justify-between">
                            <div>
                                {/* Queue Header with CheckboxInput & Search TextInput */}
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <CheckboxInput
                                            checked={isAllQueueSelected}
                                            onChange={handleSelectAllQueue}
                                            label={`Select Queue (${state.selectedContactIds.length} of ${filteredQueue.length} in view)`}
                                            className="font-bold text-sm text-gray-900 dark:text-white"
                                        />
                                        <span className="text-xs text-gray-400 font-medium">
                                            Awaiting Telecaller Assignment
                                        </span>
                                    </div>

                                    {/* Queue Search with TextInput */}
                                    <div className="pt-1">
                                        <TextInput
                                            placeholder="Search candidate name, phone, city or ID..."
                                            value={state.queueSearch}
                                            onChange={(val: string) => setState({ queueSearch: val })}
                                        />
                                    </div>
                                </div>

                                {/* Queue Items List */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[520px] overflow-y-auto">
                                    {state.isLoadingQueue ? (
                                        <div className="p-10 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                                            <RefreshCw className="h-5 w-5 animate-spin text-[#39854a]" />
                                            <span>Loading unassigned contact queue from API...</span>
                                        </div>
                                    ) : filteredQueue.length === 0 ? (
                                        <div className="p-8 text-center text-xs text-gray-400">
                                            No unassigned contacts match the search or filter.
                                        </div>
                                    ) : (
                                        filteredQueue.map((item) => {
                                            const isChecked = state.selectedContactIds.includes(item.id);
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => handleToggleQueueContact(item.id, !isChecked)}
                                                    className={`flex items-start justify-between p-4 transition cursor-pointer ${
                                                        isChecked
                                                            ? 'bg-green-50/50 dark:bg-green-950/20'
                                                            : 'hover:bg-gray-50/70 dark:hover:bg-gray-800/40'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="mt-0.5"
                                                        >
                                                            <CheckboxInput
                                                                checked={isChecked}
                                                                onChange={(val) => handleToggleQueueContact(item.id, val)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                                                    {item.student_name}
                                                                </span>
                                                                <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                    {item.enquiry_id}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                                                                {item.phone_number} · {item.city} ·{' '}
                                                                {item.target_course}
                                                            </p>
                                                            {item.batch && (
                                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                                    Batch: {item.batch} · Imported:{' '}
                                                                    {item.imported_date}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {item.is_new && (
                                                            <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-[#39854a] border border-green-200 dark:bg-green-950/40 dark:border-green-900/60">
                                                                NEW
                                                            </span>
                                                        )}
                                                        <span className="rounded bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-[#ea580c] border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60">
                                                            Unassigned
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Queue Footer */}
                            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 bg-[#fafafa]/50 dark:bg-[#101b2e]/50 text-xs">
                                <span className="text-gray-400">
                                    Single-owner constraint enforced: 1 student contact = 1 telecaller
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleSelectAllQueue(!isAllQueueSelected)}
                                    className="font-bold text-[#39854a] hover:underline cursor-pointer"
                                >
                                    {isAllQueueSelected
                                        ? 'Deselect All'
                                        : `Select All (${filteredQueue.length})`}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Distribution Strategy Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#0e1726] lg:col-span-5 flex flex-col justify-between space-y-5">
                            <div>
                                {/* Header & Strategy Switcher */}
                                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                        <SlidersHorizontal className="h-4 w-4 text-[#39854a]" />
                                        <span>Distribution Strategy</span>
                                    </h3>
                                    <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
                                        <button
                                            type="button"
                                            onClick={() => setState({ distributionMode: 'equal' })}
                                            className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                                state.distributionMode === 'equal'
                                                    ? 'bg-[#39854a] text-white shadow-xs'
                                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300'
                                            }`}
                                        >
                                            Equal Split
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setState({ distributionMode: 'manual' })}
                                            className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                                                state.distributionMode === 'manual'
                                                    ? 'bg-[#39854a] text-white shadow-xs'
                                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300'
                                            }`}
                                        >
                                            Manual / Direct
                                        </button>
                                    </div>
                                </div>

                                {/* Strategy Description */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                    {state.distributionMode === 'manual'
                                        ? `Specify exact allocation counts or assign all ${state.selectedContactIds.length} contacts to a single Telecaller:`
                                        : `Select Telecallers to evenly share the ${state.selectedContactIds.length} selected contacts:`}
                                </p>

                                {/* Telecaller Allocation Cards */}
                                <div className="mt-4 space-y-3">
                                    {state.telecallerWorkloads.map((telecaller) => {
                                        if (state.distributionMode === 'manual') {
                                            const isSelectedRadio =
                                                state.singleSelectedTelecaller === telecaller.name;
                                            return (
                                                <div
                                                    key={telecaller.id}
                                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                                                        isSelectedRadio
                                                            ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'
                                                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                        <input
                                                            type="radio"
                                                            name="telecallerRadio"
                                                            checked={isSelectedRadio}
                                                            onChange={() => {
                                                                setState({
                                                                    singleSelectedTelecaller: telecaller.name,
                                                                    manualQuantities: {
                                                                        'P. Malathi': 0,
                                                                        'S. Ramesh Kumar': 0,
                                                                        'K. Kavitha': 0,
                                                                        [telecaller.name]:
                                                                            state.selectedContactIds.length,
                                                                    },
                                                                });
                                                            }}
                                                            className="h-4 w-4 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                                        />
                                                        <div>
                                                            <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                                                {telecaller.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                Current load: {telecaller.assigned} contacts
                                                            </span>
                                                        </div>
                                                    </label>

                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 w-24">
                                                        <span className="shrink-0 font-medium">Qty:</span>
                                                        <TextInput
                                                            type="number"
                                                            min={0}
                                                            max={state.unassignedQueue.length}
                                                            value={state.manualQuantities[telecaller.name] ?? 0}
                                                            onChange={(val: string) => {
                                                                const num = Math.max(0, parseInt(val, 10) || 0);
                                                                setState({
                                                                    manualQuantities: {
                                                                        ...state.manualQuantities,
                                                                        [telecaller.name]: num,
                                                                    },
                                                                });
                                                            }}
                                                            className="text-center font-bold !p-1.5"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // equal split mode with CheckboxInput
                                            const isChecked = state.selectedTelecallersForEqual.includes(
                                                telecaller.name
                                            );
                                            return (
                                                <div
                                                    key={telecaller.id}
                                                    onClick={() => {
                                                        const updated = isChecked
                                                            ? state.selectedTelecallersForEqual.filter(
                                                                  (n) => n !== telecaller.name
                                                              )
                                                            : [...state.selectedTelecallersForEqual, telecaller.name];
                                                        setState({ selectedTelecallersForEqual: updated });
                                                    }}
                                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${
                                                        isChecked
                                                            ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
                                                            : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <CheckboxInput
                                                                checked={isChecked}
                                                                onChange={(val) => {
                                                                    const updated = val
                                                                        ? [...state.selectedTelecallersForEqual, telecaller.name]
                                                                        : state.selectedTelecallersForEqual.filter(
                                                                              (n) => n !== telecaller.name
                                                                          );
                                                                    setState({ selectedTelecallersForEqual: updated });
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                                                {telecaller.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                {telecaller.phone}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                                            {telecaller.assigned} contacts
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            current load
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                type="button"
                                disabled={state.selectedContactIds.length === 0 || state.isAssigning}
                                onClick={handleConfirmAssignment}
                                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition ${
                                    state.selectedContactIds.length > 0 && !state.isAssigning
                                        ? 'bg-[#39854a] hover:bg-[#2e6d3c] text-white cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500'
                                }`}
                            >
                                {state.isAssigning ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Assigning Contacts...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" />
                                        <span>
                                            Confirm Assignment ({state.selectedContactIds.length} Contacts)
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* 4. TAB 2: TEAM WORKLOAD */}
            {/* ============================================================== */}
            {state.activeTab === 'workload' && (
                <div className="space-y-4">
                    {/* Workload Search Bar with TextInput */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs dark:border-gray-800 dark:bg-[#0e1726] sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 sm:max-w-md">
                            <TextInput
                                placeholder="Search telecaller name, phone or status..."
                                value={state.workloadSearch}
                                onChange={(val: string) => setState({ workloadSearch: val, workloadPage: 1 })}
                            />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{state.telecallerWorkloads.length}</span> telecaller(s)
                        </div>
                    </div>

                    {/* Team Workload Mantine DataTable */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-[#fafafa] dark:bg-[#101b2e]">
                            <div>
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    Active Telecaller Workloads ({state.telecallerWorkloads.length})
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                    · Unique student contacts per telecaller in current cycle
                                </span>
                            </div>
                            <span className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                                Called = At least 1 call attempt completed
                            </span>
                        </div>

                        <DataTable
                            className="table-responsive"
                            records={state.telecallerWorkloads}
                            columns={workloadColumns}
                            minHeight={200}
                            withBorder={false}
                            highlightOnHover
                            fetching={state.isLoadingWorkload}
                            loaderColor="#39854a"
                            sortStatus={state.workloadSortStatus}
                            onSortStatusChange={(s) => setState({ workloadSortStatus: s })}
                            styles={{
                                header: {
                                    background: '#fafafa',
                                    borderBottom: '1px solid #f0f0f0',
                                },
                                pagination: { display: 'none' },
                            }}
                        />

                        {/* Pagination Footer */}
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Showing{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {state.telecallerWorkloads.length === 0
                                        ? 0
                                        : (state.workloadPage - 1) * state.workloadRecordsPerPage + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {Math.min(
                                        state.workloadPage * state.workloadRecordsPerPage,
                                        state.workloadTotalRecords || state.telecallerWorkloads.length
                                    )}
                                </span>{' '}
                                of{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {state.workloadTotalRecords || state.telecallerWorkloads.length}
                                </span>{' '}
                                entries
                            </div>

                            <Pagination
                                currentPage={state.workloadPage}
                                totalRecords={state.workloadTotalRecords || state.telecallerWorkloads.length}
                                recordsPerPage={state.workloadRecordsPerPage}
                                onPageChange={(page) => setState({ workloadPage: page })}
                                hasNext={
                                    state.workloadPage <
                                    Math.ceil((state.workloadTotalRecords || state.telecallerWorkloads.length) / state.workloadRecordsPerPage)
                                }
                                hasPrevious={state.workloadPage > 1}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* 5. TAB 3: ASSIGNMENT HISTORY */}
            {/* ============================================================== */}
            {state.activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Filters Row Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-[#0e1726] space-y-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Quick Date Filters */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {(['all', 'day', 'month', 'year', 'custom'] as const).map((filterKey) => {
                                    const isActive = state.dateFilter === filterKey;
                                    return (
                                        <button
                                            key={filterKey}
                                            type="button"
                                            onClick={() => setState({ dateFilter: filterKey })}
                                            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                                isActive
                                                    ? 'bg-[#39854a] text-white shadow-xs font-bold border border-[#39854a]'
                                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                            }`}
                                        >
                                            {DATE_FILTER_LABELS[filterKey]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Dropdown Filters using CustomSelect */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="w-48 sm:w-56">
                                    <CustomSelect
                                        placeholder="All Telecallers"
                                        options={TELECALLER_OPTIONS}
                                        value={state.telecallerFilter}
                                        onChange={(opt) => setState({ telecallerFilter: opt, historyPage: 1 })}
                                        isClearable
                                    />
                                </div>

                                <div className="w-44 sm:w-48">
                                    <CustomSelect
                                        placeholder="Academic Year"
                                        options={ACADEMIC_YEAR_OPTIONS}
                                        value={state.academicYearFilter}
                                        onChange={(opt) => setState({ academicYearFilter: opt, historyPage: 1 })}
                                        isClearable
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Custom Date Range Pickers (Flatpickr) */}
                        {state.dateFilter === 'custom' && (
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-600 dark:text-gray-400">From:</span>
                                    <div className="relative flex items-center">
                                        <Flatpickr
                                            value={state.fromDate}
                                            options={{ dateFormat: 'd/m/Y' }}
                                            className="form-input rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-9 text-xs sm:text-sm font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer w-36 sm:w-44"
                                            onChange={(dates) => {
                                                if (dates[0]) {
                                                    const d = dates[0];
                                                    setState({
                                                        fromDate: `${String(d.getDate()).padStart(2, '0')}/${String(
                                                            d.getMonth() + 1
                                                        ).padStart(2, '0')}/${d.getFullYear()}`,
                                                    });
                                                }
                                            }}
                                        />
                                        <Calendar className="pointer-events-none absolute right-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-600 dark:text-gray-400">To:</span>
                                    <div className="relative flex items-center">
                                        <Flatpickr
                                            value={state.toDate}
                                            options={{ dateFormat: 'd/m/Y' }}
                                            className="form-input rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-9 text-xs sm:text-sm font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer w-36 sm:w-44"
                                            onChange={(dates) => {
                                                if (dates[0]) {
                                                    const d = dates[0];
                                                    setState({
                                                        toDate: `${String(d.getDate()).padStart(2, '0')}/${String(
                                                            d.getMonth() + 1
                                                        ).padStart(2, '0')}/${d.getFullYear()}`,
                                                    });
                                                }
                                            }}
                                        />
                                        <Calendar className="pointer-events-none absolute right-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search & History Mantine DataTable */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                        {/* Table Search Bar with TextInput */}
                        <div className="flex flex-col gap-3 p-4 border-b border-gray-100 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#0e1726]">
                            <div className="flex-1 sm:max-w-md">
                                <TextInput
                                    placeholder="Search by telecaller name, assigned by or action..."
                                    value={state.historySearch}
                                    onChange={(val: string) => setState({ historySearch: val, historyPage: 1 })}
                                />
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Showing{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {state.assignmentLogs.length}
                                </span>{' '}
                                log(s)
                            </div>
                        </div>

                        <DataTable
                            className="table-responsive"
                            records={state.assignmentLogs}
                            columns={historyColumns}
                            minHeight={200}
                            withBorder={false}
                            highlightOnHover
                            fetching={state.isLoadingHistory}
                            loaderColor="#39854a"
                            sortStatus={state.historySortStatus}
                            onSortStatusChange={(s) => setState({ historySortStatus: s })}
                            styles={{
                                header: {
                                    background: '#fafafa',
                                    borderBottom: '1px solid #f0f0f0',
                                },
                                pagination: { display: 'none' },
                            }}
                        />

                        {/* Pagination Footer */}
                        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-100 dark:border-gray-800">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Showing{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {state.assignmentLogs.length === 0
                                        ? 0
                                        : (state.historyPage - 1) * state.historyRecordsPerPage + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {Math.min(
                                        state.historyPage * state.historyRecordsPerPage,
                                        state.historyTotalRecords || state.assignmentLogs.length
                                    )}
                                </span>{' '}
                                of{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {state.historyTotalRecords || state.assignmentLogs.length}
                                </span>{' '}
                                entries
                            </div>

                            <Pagination
                                currentPage={state.historyPage}
                                totalRecords={state.historyTotalRecords || state.assignmentLogs.length}
                                recordsPerPage={state.historyRecordsPerPage}
                                onPageChange={(page) => setState({ historyPage: page })}
                                hasNext={
                                    state.historyPage <
                                    Math.ceil((state.historyTotalRecords || state.assignmentLogs.length) / state.historyRecordsPerPage)
                                }
                                hasPrevious={state.historyPage > 1}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* 6. MODALS */}
            {/* ============================================================== */}

            {/* Telecaller Assigned Contacts Modal */}
            <TelecallerAssignedContactsModal
                telecallerName={state.assignedModalTelecaller || ''}
                isOpen={Boolean(state.assignedModalTelecaller)}
                contacts={
                    state.assignedModalTelecaller
                        ? (assignmentData.telecallerAssignedContacts[
                              state.assignedModalTelecaller as keyof typeof assignmentData.telecallerAssignedContacts
                          ] as AssignedStudentItem[]) || []
                        : []
                }
                onClose={() => setState({ assignedModalTelecaller: null })}
                onReassignAll={(telecallerName, contacts) => {
                    setState({ assignedModalTelecaller: null });
                    handleOpenReassignForTelecaller(telecallerName, contacts.length);
                }}
                onViewProfile={handleViewProfile}
            />

            {/* Reassign Contacts Modal */}
            <ReassignContactsModal
                isOpen={state.isReassignModalOpen}
                onClose={() => setState({ isReassignModalOpen: false })}
                contactsSummary={state.reassignConfig.contactsSummary}
                totalCount={state.reassignConfig.totalCount}
                currentOwner={state.reassignConfig.currentOwner}
                onConfirmReassign={async (newTelecaller, reason) => {
                    try {
                        await Models.contact.assignment.reassign({
                            current_owner: state.reassignConfig.currentOwner,
                            new_telecaller: newTelecaller,
                            count: state.reassignConfig.totalCount,
                            reason: reason,
                        });
                        Success(
                            `Successfully reassigned ${state.reassignConfig.totalCount} contact(s) to ${newTelecaller}!`
                        );
                        setState({ isReassignModalOpen: false });
                        getWorkloadList(1);
                        getAssignmentStats();
                    } catch (err: any) {
                        Failure(err?.message || 'Failed to reassign contacts.');
                    }
                }}
            />

            {/* Student Details Full Profile Modal */}
            <StudentDetailsModal
                contact={state.viewingStudent}
                isOpen={Boolean(state.viewingStudent)}
                onClose={() => setState({ viewingStudent: null })}
                onLogCall={(contact) => {
                    setState({ viewingStudent: null, callingContact: contact });
                }}
            />

            {/* Log Call Modal */}
            <LogCallModal
                contact={state.callingContact}
                isOpen={Boolean(state.callingContact)}
                onClose={() => setState({ callingContact: null })}
            />
        </div>
    );
};

export default AssignContactPage;

// =============================================================================
// SEPARATE MODAL & HELPER DOM COMPONENTS (Modeled after all_contacts.tsx)
// =============================================================================

// ── 1. Telecaller Assigned Contacts Modal ─────────────────────────────────────
export interface AssignedStudentItem {
    id: string;
    student_name: string;
    enquiry_id: string;
    city: string;
    target_course: string;
    status: string;
}

export interface TelecallerAssignedContactsModalProps {
    telecallerName: string;
    contacts: AssignedStudentItem[];
    isOpen: boolean;
    onClose: () => void;
    onReassignAll: (telecallerName: string, contacts: AssignedStudentItem[]) => void;
    onViewProfile?: (studentId: string) => void;
}

const TelecallerAssignedContactsModal: React.FC<TelecallerAssignedContactsModalProps> = ({
    telecallerName,
    contacts,
    isOpen,
    onClose,
    onReassignAll,
    onViewProfile,
}) => {
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const total = contacts.length;
    const called = contacts.filter((c) => c.status?.toLowerCase() === 'called').length;
    const pending = total - called;

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {telecallerName}&apos;s Assigned Contacts
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                            {total} Total ({called} Called · {pending} Pending)
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Contacts List */}
                <div className="custom-scroll max-h-[55vh] divide-y divide-gray-100 overflow-y-auto py-2 dark:divide-gray-800">
                    {contacts.length === 0 ? (
                        <p className="py-6 text-center text-xs text-gray-400">
                            No assigned contacts found.
                        </p>
                    ) : (
                        contacts.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl px-1 py-3.5 transition hover:bg-gray-50/60 dark:hover:bg-gray-800/40"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900 dark:text-white sm:text-sm">
                                            {item.student_name}
                                        </span>
                                        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            {item.enquiry_id}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        {item.city} · {item.target_course}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-bold text-[#16a34a] dark:bg-green-950/40">
                                        {item.status || 'Called'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onViewProfile && onViewProfile(item.id)}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#39854a] hover:underline"
                                    >
                                        <span>Profile</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => onReassignAll(telecallerName, contacts)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 transition hover:text-purple-900 dark:text-purple-400"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reassign All {total} Contacts</span>
                    </button>
                    <button type="button" onClick={onClose} className="btn-action-solid px-5 py-2 text-xs font-bold">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal') || document.body)
        : null;
};

// ── 2. Reassign Contacts Modal ────────────────────────────────────────────────
export interface ReassignContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactsSummary: string;
    totalCount: number;
    currentOwner: string;
    availableTelecallers?: string[];
    onConfirmReassign: (newTelecaller: string, reason: string) => void;
}

const ReassignContactsModal: React.FC<ReassignContactsModalProps> = ({
    isOpen,
    onClose,
    contactsSummary,
    totalCount,
    currentOwner,
    availableTelecallers = ['S. Ramesh Kumar', 'K. Kavitha', 'P. Malathi'],
    onConfirmReassign,
}) => {
    const [selectedTelecaller, setSelectedTelecaller] = useState('');
    const [reason, setReason] = useState('Workload rebalancing and priority callback');

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const targetTelecallers = availableTelecallers
        .filter((t) => t !== currentOwner)
        .map((t) => ({ value: t, label: t }));

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTelecaller) {
            Failure('Please choose an active Telecaller');
            return;
        }
        onConfirmReassign(selectedTelecaller, reason);
        onClose();
    };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 pb-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                            <RotateCcw className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Reassign Selected Contacts
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Transfer ownership to another active Telecaller
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleConfirm} className="space-y-4 pt-4 text-xs">
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label className="font-bold text-gray-700 dark:text-gray-300">
                                Contacts to Reassign:
                            </label>
                            <span className="font-bold text-[#39854a]">{totalCount} contacts</span>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            {contactsSummary || `${totalCount} contacts selected`}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block font-bold text-gray-700 dark:text-gray-300">
                            Current Assigned Owner
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={currentOwner || 'Unassigned'}
                            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 p-2.5 font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-bold text-gray-700 dark:text-gray-300">
                            Select New Telecaller <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                            options={targetTelecallers}
                            value={
                                selectedTelecaller
                                    ? targetTelecallers.find((t) => t.value === selectedTelecaller) || {
                                          value: selectedTelecaller,
                                          label: selectedTelecaller,
                                      }
                                    : null
                            }
                            onChange={(opt: any) => setSelectedTelecaller(opt?.value || '')}
                            placeholder="-- Choose active Telecaller --"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block font-bold text-gray-700 dark:text-gray-300">
                            Reassignment Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={2}
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 p-2.5 font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50/70 p-3 text-xs leading-relaxed text-[#1e612f] dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300">
                        <span className="font-bold">Preservation Policy:</span> Prior calling history, notes, and scheduled follow-up dates are fully preserved for the new telecaller.
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-action-solid flex items-center gap-1.5 px-4 py-2 font-bold">
                            <UserPlus className="h-4 w-4" />
                            <span>Confirm Reassignment</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal') || document.body)
        : null;
};

// ── 3. InfoItem Helper Component ──────────────────────────────────────────────
interface InfoItemProps {
    label: string;
    value?: React.ReactNode;
    icon?: any;
    badge?: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon: Icon, badge }) => (
    <div className="rounded-xl border border-gray-200/90 bg-[#f8faf9] p-3.5 transition dark:border-gray-700/80 dark:bg-[#152033]">
        <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {Icon && <Icon className="h-3.5 w-3.5 text-[#39854a]" />}
                {label}
            </span>
            {badge}
        </div>
        <div className="break-words text-sm font-bold text-gray-900 dark:text-white">
            {value != null && value !== '' ? (
                value
            ) : (
                <span className="font-medium text-gray-400 dark:text-gray-500">Not specified</span>
            )}
        </div>
    </div>
);

// ── 4. Student Details Modal ──────────────────────────────────────────────────
export interface StudentDetailsModalProps {
    contact: AdmissionContact | any | null;
    isOpen: boolean;
    onClose: () => void;
    onLogCall: (contact: AdmissionContact) => void;
    onWhatsApp?: (contact: AdmissionContact) => void;
}

type StudentDetailsTab = 'personal' | 'academic' | 'preferences' | 'assessment';

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
    contact,
    isOpen,
    onClose,
    onLogCall,
    onWhatsApp,
}) => {
    const router = useRouter();
    const [modalState, setModalState] = useSetState({
        activeTab: 'personal' as StudentDetailsTab,
        fullContact: contact || null,
        loadingDetails: false,
    });

    const { activeTab, fullContact, loadingDetails } = modalState;

    // Sync prop contact and fetch enriched details if available
    useEffect(() => {
        if (contact) {
            setModalState({ fullContact: contact });
            const contactId = contact.id || contact.enquiry_id;
            if (contactId) {
                setModalState({ loadingDetails: true });
                Models.contact
                    .details(contactId)
                    .then((res: any) => {
                        if (res) {
                            setModalState({
                                fullContact: { ...contact, ...res },
                            });
                        }
                    })
                    .catch((err) => {
                        console.log('Details fetch error in modal:', err);
                    })
                    .finally(() => {
                        setModalState({ loadingDetails: false });
                    });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contact]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !fullContact) return null;

    const studentName = fullContact.student_name || 'Student';
    const enquiryId = fullContact.enquiry_id || fullContact.id || '—';
    const phone = fullContact.phone_number || '';
    const city = fullContact.city?.city_name || fullContact.city || '—';
    const area = fullContact.area || fullContact.address || '';
    const targetCourse = fullContact.course_specialization?.name || fullContact.target_course || 'Academic Course';
    const institution =
        fullContact.preferred_institution?.name || fullContact.institution || 'Karpagam Academy of Higher Education';
    const currentStage = fullContact.status?.status || fullContact.status || 'Contacted';
    const assignedStaff =
        typeof fullContact.assigned_to === 'object' && fullContact.assigned_to
            ? `${fullContact.assigned_to.first_name || ''} ${fullContact.assigned_to.last_name || ''}`.trim() ||
              fullContact.assigned_to.username
            : fullContact.assigned_to || 'Unassigned';

    const initials = studentName
        .split(' ')
        .map((w: string) => w.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const handleWhatsAppClick = () => {
        if (onWhatsApp) {
            onWhatsApp(fullContact);
        } else {
            const cleanPhone = String(phone).replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        }
    };

    const getDegreeType = (course: string) => {
        const lower = String(course).toLowerCase();
        if (lower.includes('pharmacy')) return 'B.Pharm';
        if (lower.includes('nursing')) return 'B.Sc';
        if (lower.includes('business') || lower.includes('bba')) return 'BBA';
        if (lower.includes('medicine') || lower.includes('mbbs')) return 'MBBS';
        return 'B.Tech';
    };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6">
            <div className="relative my-6 w-full max-w-4xl rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow-sm transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Modal Header */}
                <div className="flex flex-col gap-4 border-b border-gray-200 p-5 pr-14 dark:border-gray-800 sm:p-6 sm:pr-16">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0f4f1] text-sm font-bold tracking-wider text-[#39854a] dark:bg-green-950/40">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="truncate text-xl font-black text-gray-900 dark:text-white sm:text-2xl">
                                        {studentName}
                                    </h2>
                                    <span className="rounded-md border border-gray-300 bg-gray-100 px-2.5 py-1 font-mono text-xs font-bold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
                                        {enquiryId}
                                    </span>
                                    {loadingDetails && (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#39854a]" /> Loading details...
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {city}
                                    {area ? `, ${area}` : ''} · Preferred:{' '}
                                    <span className="font-bold text-[#2e743e] dark:text-emerald-400">{targetCourse}</span> · AY 2026–27
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center">
                            <button
                                type="button"
                                onClick={() => onLogCall(fullContact)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#39854a] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2e6d3c]"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                <span>Log Call</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleWhatsAppClick}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#39854a]/30 bg-white px-3.5 py-2 text-xs font-bold text-[#39854a] shadow-sm transition hover:bg-[#39854a]/10 dark:bg-gray-800"
                            >
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>WhatsApp</span>
                            </button>
                        </div>
                    </div>

                    {/* Status & Staff Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3.5 dark:border-gray-800">
                        <div className="flex items-center gap-2.5">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Admission Stage:</span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcfce7] px-3.5 py-1 text-xs font-bold text-[#15803d] dark:bg-green-950/60 dark:text-green-300">
                                <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                                {currentStage}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Assigned Staff:</span>
                            <span className="rounded-lg border border-gray-300 bg-white px-3.5 py-1 text-xs font-bold text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 sm:text-sm">
                                {assignedStaff}
                            </span>
                        </div>
                    </div>

                    {/* Summary Strip */}
                    <div className="rounded-2xl border border-gray-200 bg-[#f3f7f4] p-4 dark:border-gray-700 dark:bg-[#132238]">
                        <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    PHONE NUMBER
                                </span>
                                <span className="mt-1 inline-block text-sm font-bold text-gray-900 dark:text-white">
                                    {phone || '—'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    EMAIL ID
                                </span>
                                <span className="mt-1 inline-block max-w-[190px] truncate text-sm font-bold text-gray-900 dark:text-white">
                                    {fullContact.email || '—'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    TARGET INSTITUTION
                                </span>
                                <span className="mt-1 inline-block max-w-[190px] truncate text-sm font-bold text-[#2e743e] dark:text-emerald-400">
                                    {institution}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    CURRENT STATUS
                                </span>
                                <span className="mt-1 inline-block rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-bold text-[#15803d] dark:bg-green-950/70 dark:text-green-300">
                                    {currentStage}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
                    <div className="flex items-center gap-7 overflow-x-auto">
                        {(['personal', 'academic', 'preferences', 'assessment'] as StudentDetailsTab[]).map((tab) => {
                            const labels: Record<StudentDetailsTab, string> = {
                                personal: 'Personal & Family',
                                academic: 'Academic Qualifications',
                                preferences: 'Admission Preferences',
                                assessment: 'Assessment & Remarks',
                            };
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setModalState({ activeTab: tab })}
                                    className={`whitespace-nowrap border-b-2 py-4 text-sm font-bold transition ${
                                        activeTab === tab
                                            ? 'border-[#39854a] text-[#39854a]'
                                            : 'border-transparent text-gray-600 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white'
                                    }`}
                                >
                                    {labels[tab]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Contents */}
                <div className="custom-scroll max-h-[45vh] overflow-y-auto p-6">
                    {/* TAB 1: PERSONAL & FAMILY */}
                    {activeTab === 'personal' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Personal Information
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                                    <InfoItem label="Student Name" value={studentName} icon={User} />
                                    <InfoItem label="Student Mobile" value={phone} icon={Phone} />
                                    <InfoItem label="Email ID" value={fullContact.email} icon={Mail} />
                                    <InfoItem label="Alternate Email" value={fullContact.alternate_email} icon={Mail} />
                                    <InfoItem
                                        label="Date of Birth"
                                        value={
                                            fullContact.dob
                                                ? `${moment(fullContact.dob).format('DD MMM YYYY')} (${moment().diff(
                                                      moment(fullContact.dob),
                                                      'years'
                                                  )} yrs)`
                                                : null
                                        }
                                        icon={Calendar}
                                    />
                                    <InfoItem
                                        label="Contact Status"
                                        value={
                                            <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-[#39854a] dark:bg-emerald-950/40 dark:text-emerald-300">
                                                {currentStage}
                                            </span>
                                        }
                                    />
                                    <InfoItem label="City / District" value={city} icon={MapPin} />
                                    <InfoItem
                                        label="State"
                                        value={fullContact.state?.state_name || fullContact.state}
                                        icon={MapPin}
                                    />
                                    <InfoItem
                                        label="Country"
                                        value={fullContact.country?.country_name || fullContact.country}
                                        icon={MapPin}
                                    />
                                    <InfoItem label="Address / Area" value={area} icon={MapPin} />
                                    <InfoItem label="Pincode" value={fullContact.pincode} />
                                    <InfoItem
                                        label="Archived"
                                        value={fullContact.achieved || fullContact.is_archive ? 'Yes' : 'No'}
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Family Details
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                                    <InfoItem
                                        label="Father's Name"
                                        value={fullContact.father_name || fullContact.parent_name}
                                    />
                                    <InfoItem label="Mother's Name" value={fullContact.mother_name} />
                                    <InfoItem
                                        label="Parent / Guardian Mobile"
                                        value={
                                            fullContact.secondary_phone_number ||
                                            fullContact.parent_phone ||
                                            fullContact.parent_mobile
                                        }
                                        icon={Phone}
                                    />
                                    <InfoItem label="Parent Designation" value={fullContact.parent_designation} />
                                    <InfoItem
                                        label="Annual Family Income"
                                        value={
                                            fullContact.annual_income
                                                ? `₹ ${Number(fullContact.annual_income).toLocaleString('en-IN')}`
                                                : null
                                        }
                                    />
                                    <InfoItem label="Siblings Count" value={fullContact.siblings_count} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: ACADEMIC QUALIFICATIONS */}
                    {activeTab === 'academic' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Current Qualification
                                </h4>
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                        Highest Education Level
                                    </span>
                                    <p className="text-lg font-black text-[#2e743e] dark:text-emerald-300">
                                        {fullContact.education_qualification?.qualification ||
                                            fullContact.qualification ||
                                            '12th Standard'}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    12th Higher Secondary Details
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                                    <InfoItem
                                        label="School Name (12th)"
                                        value={fullContact.twelfth_school_name || fullContact.school_name}
                                        icon={Building}
                                    />
                                    <InfoItem
                                        label="12th Group / Major"
                                        value={fullContact.twelfth_group}
                                        icon={BookOpen}
                                    />
                                    <InfoItem
                                        label="Board Result Status"
                                        value={fullContact.twelfth_board_result}
                                    />
                                    <InfoItem
                                        label="12th Marks / %"
                                        value={fullContact.twelfth_marks ? `${fullContact.twelfth_marks}%` : null}
                                        icon={Award}
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    10th Secondary Schooling Details
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                                    <InfoItem
                                        label="School Name (10th)"
                                        value={fullContact.tenth_school_name}
                                        icon={Building}
                                    />
                                    <InfoItem label="Board Result (10th)" value={fullContact.tenth_board_result} />
                                    <InfoItem
                                        label="10th Marks / %"
                                        value={fullContact.tenth_marks ? `${fullContact.tenth_marks}%` : null}
                                        icon={Award}
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Other Academic Records
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                                    <InfoItem label="Board Name" value={fullContact.board_name} />
                                    <InfoItem label="Graduation Year" value={fullContact.graduation_year} />
                                    <InfoItem
                                        label="UG Marks / CGPA"
                                        value={fullContact.ug_marks ? `${fullContact.ug_marks}%` : null}
                                    />
                                    <InfoItem
                                        label="Entrance Exam Score"
                                        value={fullContact.entrance_exam_score}
                                    />
                                    <InfoItem
                                        label="Score in Core Subjects"
                                        value={fullContact.score_in_subjects}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: ADMISSION PREFERENCES */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Institution & Programme Selection
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                                    <InfoItem
                                        label="Preferred Institution"
                                        value={institution}
                                        icon={Building}
                                    />
                                    <InfoItem
                                        label="Target Course / Specialization"
                                        value={targetCourse}
                                        icon={BookOpen}
                                    />
                                    <InfoItem
                                        label="Degree Type"
                                        value={
                                            fullContact.degree_type ||
                                            getDegreeType(targetCourse)
                                        }
                                        icon={GraduationCap}
                                    />
                                    <InfoItem
                                        label="Student Interest Level"
                                        value={
                                            <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#39854a] dark:bg-emerald-950/40 dark:text-emerald-300">
                                                {fullContact.student_interest_level || 'High'}
                                            </span>
                                        }
                                    />
                                    <InfoItem
                                        label="Preferred Campus Location"
                                        value={fullContact.preferred_location || city}
                                        icon={MapPin}
                                    />
                                    <InfoItem
                                        label="Best Time to Contact"
                                        value={fullContact.best_time_to_contact}
                                        icon={Clock}
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Lead Attribution & Reference
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <InfoItem
                                        label="Reference Type"
                                        value={fullContact.reference_type || 'Education Fair / Walk-In'}
                                    />
                                    <InfoItem
                                        label="Source Details"
                                        value={fullContact.source_details || 'Direct admissions desk enquiry'}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: ASSESSMENT & REMARKS */}
                    {activeTab === 'assessment' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Assignment & Desk Operations
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <InfoItem
                                        label="Assigned Role"
                                        value={
                                            fullContact.assigned_role ||
                                            fullContact.contact_assign_role?.label ||
                                            'Telecaller'
                                        }
                                    />
                                    <InfoItem
                                        label="Assigned Staff Member"
                                        value={assignedStaff}
                                        icon={User}
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Internal Ratings
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <InfoItem
                                        label="Interview Rating"
                                        value={
                                            fullContact.interview_rating != null ? (
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-[#2e743e] dark:text-emerald-400">
                                                    <Star className="h-4 w-4 fill-[#39854a] text-[#39854a]" />
                                                    <span>{fullContact.interview_rating} / 5</span>
                                                </div>
                                            ) : null
                                        }
                                    />
                                    <InfoItem
                                        label="Internal Rating"
                                        value={
                                            fullContact.internal_rating != null ? (
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-[#2e743e] dark:text-emerald-400">
                                                    <Star className="h-4 w-4 fill-[#39854a] text-[#39854a]" />
                                                    <span>{fullContact.internal_rating} / 5</span>
                                                </div>
                                            ) : null
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3.5 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100">
                                    <span className="h-3 w-1 rounded-full bg-[#39854a]" />
                                    Counselor & Staff Remarks
                                </h4>
                                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                    <div className="rounded-xl border border-gray-200/90 bg-[#f8faf9] p-4 dark:border-gray-700/80 dark:bg-[#152033]">
                                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                            General Remark
                                        </span>
                                        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                                            {fullContact.remark || 'No general remark logged.'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200/90 bg-[#f8faf9] p-4 dark:border-gray-700/80 dark:bg-[#152033]">
                                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                            Personal Remarks
                                        </span>
                                        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-100">
                                            {fullContact.personal_remarks || 'No personal remarks logged.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between rounded-b-3xl border-t border-gray-200 bg-gray-50/80 p-4 px-6 dark:border-gray-800 dark:bg-[#121e32]">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                        Contact Record · Academic Year 2026–27
                    </span>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                router.push(`/contacts/edit_contact/${fullContact.id || fullContact.enquiry_id}`);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#39854a]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#2e743e] shadow-sm transition hover:bg-[#39854a]/10 dark:border-[#39854a]/60 dark:bg-gray-800 dark:text-emerald-400 sm:text-sm"
                        >
                            <Pencil className="h-4 w-4" />
                            <span>Edit Contact</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal') || document.body)
        : null;
};

// ── 5. Log Call Modal ─────────────────────────────────────────────────────────
export interface LogCallModalProps {
    contact: AdmissionContact | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveCall?: (callData: any) => void;
}

const CALL_OUTCOMES = [
    'Interested',
    'Call Later',
    'No Answer',
    'Busy',
    'Not Interested',
    'Wrong Number',
    'Counselling Needed',
];

const OUTCOME_ACTIONS: Record<string, string> = {
    Interested: 'Save admission interest & follow-up',
    'Call Later': 'Schedule callback at student requested time',
    'No Answer': 'Retry call in afternoon slot',
    Busy: 'Schedule callback in evening slot',
    'Not Interested': 'Archive enquiry & update pipeline',
    'Wrong Number': 'Flag number for verification with master lead list',
    'Counselling Needed': 'Escalate to Senior Academic Counsellor',
};

const LogCallModal: React.FC<LogCallModalProps> = ({ contact, isOpen, onClose, onSaveCall }) => {
    const [callState, setCallState] = useSetState({
        outcome: 'Interested',
        notes: 'Student enquired about B.Tech CSE fee concessions and AI lab facilities. Parents willing to visit campus this Saturday.',
        scheduleFollowUp: true,
        callbackDate: '2026-05-08',
        callbackTime: '11:00 AM',
        referCounsellor: true,
        priority: 'High' as 'Medium' | 'High' | 'Urgent',
        referralReason: 'Student waiting for 12th PCM results. Father enquired about 50% merit scholarship cutoff.',
    });

    const {
        outcome,
        notes,
        scheduleFollowUp,
        callbackDate,
        callbackTime,
        referCounsellor,
        priority,
        referralReason,
    } = callState;

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !contact) return null;

    const handleSave = () => {
        const payload = {
            contactId: contact.id,
            outcome,
            notes,
            scheduleFollowUp,
            callbackDate: scheduleFollowUp ? callbackDate : null,
            callbackTime: scheduleFollowUp ? callbackTime : null,
            referCounsellor,
            priority: referCounsellor ? priority : null,
            referralReason: referCounsellor ? referralReason : null,
        };
        if (onSaveCall) {
            onSaveCall(payload);
        } else {
            Success(`Call logged as '${outcome}' for ${contact.student_name}`);
        }
        onClose();
    };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Call Update: {contact.student_name}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {contact.phone_number} · {(contact.city as any)?.city_name || contact.city || '—'} · {contact.target_course}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="custom-scroll max-h-[75vh] space-y-4 overflow-y-auto p-5">
                    {/* Call Outcome */}
                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-800 dark:text-gray-200">
                            Call Outcome <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {CALL_OUTCOMES.map((item) => {
                                const isSelected = outcome === item;
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setCallState({ outcome: item })}
                                        className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition ${
                                            isSelected
                                                ? 'border-[#39854a] bg-[#39854a] font-bold text-white shadow-sm'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Next Action Banner */}
                    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 text-xs dark:bg-gray-800/50">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Next Action:</span>
                        <span className="font-bold text-[#39854a]">
                            {OUTCOME_ACTIONS[outcome] || 'Follow-up as required'}
                        </span>
                    </div>

                    {/* Call Notes */}
                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-800 dark:text-gray-200">
                            Call Notes / Student Feedback <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => setCallState({ notes: e.target.value })}
                            placeholder="e.g. Student enquired about B.Tech CSE fee concessions and hostel facilities."
                            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                        />
                    </div>

                    {/* Follow-up Section */}
                    <div className="space-y-3 rounded-xl border border-gray-200 p-3.5 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <CheckboxInput
                                checked={scheduleFollowUp}
                                onChange={(val: boolean) => setCallState({ scheduleFollowUp: val })}
                                label="Schedule Next Follow-up Callback"
                            />
                            {scheduleFollowUp && (
                                <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-[#39854a] dark:bg-green-950/40">
                                    Callback Required
                                </span>
                            )}
                        </div>
                        {scheduleFollowUp && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                        Callback Date
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={callbackDate}
                                            onChange={(e) => setCallState({ callbackDate: e.target.value })}
                                            placeholder="DD/MM/YYYY"
                                            className="w-full rounded-xl border border-gray-200 py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <Calendar className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                        Callback Time
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={callbackTime}
                                            onChange={(e) => setCallState({ callbackTime: e.target.value })}
                                            placeholder="HH:MM AM/PM"
                                            className="w-full rounded-xl border border-gray-200 py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                        <Clock className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Refer to Senior Counsellor Section */}
                    <div className="space-y-3 rounded-xl border border-gray-200 p-3.5 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <CheckboxInput
                                checked={referCounsellor}
                                onChange={(val: boolean) => setCallState({ referCounsellor: val })}
                                label="Refer to Senior Academic Counsellor"
                            />
                            {referCounsellor && (
                                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40">
                                    Escalation
                                </span>
                            )}
                        </div>
                        {referCounsellor && (
                            <div className="space-y-3 pt-1">
                                <div>
                                    <label className="mb-1.5 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                        Referral Priority
                                    </label>
                                    <div className="flex items-center gap-2">
                                        {(['Medium', 'High', 'Urgent'] as const).map((p) => {
                                            const isSelected = priority === p;
                                            return (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setCallState({ priority: p })}
                                                    className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                                                        isSelected
                                                            ? 'border-gray-900 bg-gray-900 font-bold text-white dark:border-white dark:bg-white dark:text-gray-900'
                                                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-medium text-gray-500 dark:text-gray-400">
                                        Specific Reason for Referral
                                    </label>
                                    <input
                                        type="text"
                                        value={referralReason}
                                        onChange={(e) => setCallState({ referralReason: e.target.value })}
                                        placeholder="e.g. Student enquired about 50% merit scholarship cutoff..."
                                        className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-[#121e32]/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn-action-solid flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                    >
                        <Send className="h-3.5 w-3.5" />
                        <span>Save Call & Update CRM</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal') || document.body)
        : null;
};
