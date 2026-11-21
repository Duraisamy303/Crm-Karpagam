import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
import {
    Clock,
    Calendar,
    Phone,
    PhoneCall,
    Search,
    CheckCircle2,
    User,
    UserCheck,
    Send,
    Edit,
    AlertCircle,
    ArrowRight,
    ArrowLeftRight,
    X,
    MessageCircle,
    RotateCcw,
    Check,
    Share2,
    CalendarClock,
    GraduationCap,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import TextInput from '@/components/TextInput';
import CheckboxInput from '@/components/Checkbox';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import { capitalizeFLetter, Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';

// =============================================================================
// TYPES & DATA INTERFACES
// =============================================================================
export interface FollowUpRecord {
    id: string;
    contact_id: string;
    student_name: string;
    enquiry_id: string;
    city: string;
    contact_number: string;
    last_call_notes: string;
    outcome: string;
    scheduled_date_time: string;
    scheduled_date: string;
    scheduled_time: string;
    assigned_telecaller: string;
    status: string; // 'today' | 'upcoming' | 'overdue'
    target_course?: string;
    user_id?: string | number;
    allData?: any;
}

type TabType = 'today' | 'upcoming' | 'overdue';

// =============================================================================
// CONSTANTS & SELECTION OPTIONS
// =============================================================================
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

const TRANSFER_STAFF_OPTIONS = [
    { value: 'S. Saravanan (Senior Counsellor)', label: 'S. Saravanan (Senior Counsellor)' },
    { value: 'K. Mohan (Telecaller)', label: 'K. Mohan (Telecaller)' },
    { value: 'R. Natarajan (Admissions Head)', label: 'R. Natarajan (Admissions Head)' },
    { value: 'Dr. K. Swaminathan (Dean)', label: 'Dr. K. Swaminathan (Dean)' },
    { value: 'B. Priyadarshini (Senior Counsellor)', label: 'B. Priyadarshini (Senior Counsellor)' },
    { value: 'K. Kavitha (Telecaller)', label: 'K. Kavitha (Telecaller)' },
];

// =============================================================================
// MAIN COMPONENT: FollowUpsPage
// =============================================================================
const FollowUpsPage = () => {
    const router = useRouter();

    // ── Unified Reactive State (Matching contacts/my_contacts structure) ─────
    const [state, setState] = useSetState({
        // Data & API Loading States
        followupsList: [] as FollowUpRecord[],
        allData: null as any,
        totalRecords: 0,
        isLoading: false,

        // Tab & Search States
        activeTab: 'today' as TabType,
        search: '',
        currentPage: 1,
        recordsPerPage: 10,
        sortStatus: { columnAccessor: 'scheduled_date_time', direction: 'asc' } as DataTableSortStatus,

        // Telecaller Filter State
        selectedTelecaller: null as { value: string | number; label: string } | null,
        telecallerOptions: [] as Array<{ value: string | number; label: string }>,
        telecallerLoading: false,

        // Tab Badge Counts
        counts: {
            today: 2,
            upcoming: 0,
            overdue: 2,
        },

        // Modal 1: Call & Update State
        isOpenCallUpdate: false,
        selectedFollowUp: null as FollowUpRecord | null,
        callOutcome: 'Interested',
        callNotes: '',
        scheduleCallback: false,
        callbackDate: moment().format('YYYY-MM-DD'),
        callbackTime: '11:00 AM',
        referToCounsellor: false,
        isSubmittingUpdate: false,

        // Modal 2: Reschedule Modal State
        isOpenReschedule: false,
        rescheduleFollowUp: null as FollowUpRecord | null,
        newDate: moment().add(1, 'day').format('YYYY-MM-DD'),
        newTime: '11:30 AM',
        rescheduleReason: '',
        isSubmittingReschedule: false,

        // Modal 3: Transfer Modal State
        isOpenTransfer: false,
        transferFollowUp: null as FollowUpRecord | null,
        transferToStaff: 'S. Saravanan (Senior Counsellor)',
        transferReason: '',
        isSubmittingTransfer: false,

        // Modal 4: Complete Confirmation Modal State
        isOpenComplete: false,
        completeFollowUp: null as FollowUpRecord | null,
        isSubmittingComplete: false,
    });

    const debouncedSearch = useDebounce(state.search, 400);
    const prevDeps = useRef<string | null>(null);
    const isInitialLoad = useRef<boolean>(true);

    // ── Reactive Dependency Bundle ───────────────────────────────────────────
    const deps = useMemo(
        () => ({
            search: debouncedSearch,
            activeTab: state.activeTab,
            sortStatus: state.sortStatus,
            recordsPerPage: state.recordsPerPage,
            selectedTelecaller: state.selectedTelecaller?.value || null,
        }),
        [debouncedSearch, state.activeTab, state.sortStatus, state.recordsPerPage, state.selectedTelecaller]
    );

    // ── Initial Telecaller Options Fetch on Mount ─────────────────────────────
    useEffect(() => {
        fetchTelecallers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Re-fetch Trigger on Dependency Changes ────────────────────────────────
    useEffect(() => {
        const currentDeps = JSON.stringify(deps);

        if (isInitialLoad.current) {
            getFollowUpsList(1);
            isInitialLoad.current = false;
        } else if (prevDeps.current !== currentDeps) {
            getFollowUpsList(1);
        }

        prevDeps.current = currentDeps;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps]);

    // ── Body Scroll Lock for Modals ──────────────────────────────────────────
    useEffect(() => {
        const isAnyModalOpen =
            state.isOpenCallUpdate ||
            state.isOpenReschedule ||
            state.isOpenTransfer ||
            state.isOpenComplete;
        document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [
        state.isOpenCallUpdate,
        state.isOpenReschedule,
        state.isOpenTransfer,
        state.isOpenComplete,
    ]);

    // =========================================================================
    // ALL API & FUNCTIONALITY FUNCTIONS (Separately declared before DOM)
    // =========================================================================

    // ── 0. Staff Options & Filter Handlers ──────────────────────────────────
    const DEFAULT_TELECALLER_OPTIONS = [
        { value: 'P. Malathi', label: 'P. Malathi' },
        { value: 'S. Ramesh Kumar', label: 'S. Ramesh Kumar' },
        { value: 'K. Kavitha', label: 'K. Kavitha' },
        { value: 'K. Mohan', label: 'K. Mohan' },
    ];

    const fetchTelecallers = async () => {
        try {
            setState({ telecallerLoading: true });
            const res: any = await Models.user
                .includeAdminuserList(1, { group: 'telecaller', exclude_admin: 'Yes' })
                .catch(() => null);
            const rawUsers = res?.results || (Array.isArray(res) ? res : []);
            if (rawUsers && rawUsers.length > 0) {
                const apiList = rawUsers.map((u: any) => {
                    const fullName = `${capitalizeFLetter(u?.first_name || '')} ${capitalizeFLetter(u?.last_name || '')}`.trim();
                    return {
                        value: u?.id ? String(u.id) : fullName || u?.username || u?.email,
                        label: fullName || u?.username || u?.email || 'Telecaller',
                    };
                });
                const merged = [...apiList];
                DEFAULT_TELECALLER_OPTIONS.forEach((def) => {
                    if (
                        !merged.some(
                            (m) =>
                                m.label.toLowerCase() === def.label.toLowerCase() ||
                                String(m.value) === String(def.value)
                        )
                    ) {
                        merged.push(def);
                    }
                });
                setState({ telecallerOptions: merged, telecallerLoading: false });
            } else {
                setState({ telecallerOptions: DEFAULT_TELECALLER_OPTIONS, telecallerLoading: false });
            }
        } catch {
            setState({ telecallerOptions: DEFAULT_TELECALLER_OPTIONS, telecallerLoading: false });
        }
    };

    const handleClearAllFilters = () => {
        setState({
            selectedTelecaller: null,
            search: '',
            currentPage: 1,
        });
    };

    // ── 1. Query Payload Builder ─────────────────────────────────────────────
    const bodyData = () => {
        const body: Record<string, any> = {
            tab: state.activeTab,
            page: state.currentPage,
            page_size: state.recordsPerPage,
        };

        if (debouncedSearch && debouncedSearch.trim()) {
            body.search = debouncedSearch.trim();
        }

        if (state.selectedTelecaller?.value) {
            body.user_id = state.selectedTelecaller.value;
            body.telecaller_id = state.selectedTelecaller.value;
            body.telecaller = state.selectedTelecaller.label || state.selectedTelecaller.value;
        }

        if (state.sortStatus?.columnAccessor && state.sortStatus?.direction) {
            const prefix = state.sortStatus.direction === 'desc' ? '-' : '';
            body.ordering = `${prefix}${state.sortStatus.columnAccessor}`;
        }

        return body;
    };

    // ── 2. Table Data Mapper ─────────────────────────────────────────────────
    const tableData = (res: any) => {
        const rawList = res?.data || res?.results || (Array.isArray(res) ? res : []);
        const data: FollowUpRecord[] = rawList.map((item: any, idx: number) => ({
            id: item.id || `FLW-${String(idx + 1).padStart(3, '0')}`,
            contact_id: item.contact_id || item.enquiry_id || item.id,
            student_name: capitalizeFLetter(item.student_name) || item.student_name || 'Candidate',
            enquiry_id: item.enquiry_id || item.contact_id || item.id,
            city: capitalizeFLetter(item.city) || 'Coimbatore',
            contact_number: item.contact_number || item.phone || item.mobile || '-',
            last_call_notes:
                item.last_call_notes || item.notes || item.last_note || 'Callback scheduled.',
            outcome: item.outcome || item.last_outcome || 'Call Later',
            scheduled_date_time:
                item.scheduled_date_time ||
                `${item.scheduled_date || 'Today'} @ ${item.scheduled_time || '10:00 AM'}`,
            scheduled_date:
                item.scheduled_date ||
                (item.scheduled_date_time ? item.scheduled_date_time.split('@')[0].trim() : '2026-05-06'),
            scheduled_time:
                item.scheduled_time ||
                (item.scheduled_date_time ? item.scheduled_date_time.split('@')[1]?.trim() : '11:00 AM'),
            assigned_telecaller: item.assigned_telecaller || 'P. Malathi',
            user_id: item.user_id,
            status: item.status || state.activeTab,
            target_course: item.target_course || item.course_interest || 'Academic Course',
            allData: item,
        }));

        setState({ followupsList: data, allData: res });
    };

    // ── 3. Fetch Followups List API Function ─────────────────────────────────
    const getFollowUpsList = async (page = 1) => {
        try {
            setState({ isLoading: true });
            const body = bodyData();
            body.page = page;

            const res: any = await Models.contact.telecaller.followups(body).catch(() => null);
            console.log('telecaller followups response:', res);
            if (res) {
                tableData(res);
                setState({
                    isLoading: false,
                    totalRecords: res?.total_records ?? (res?.data?.length || 0),
                    counts: res?.counts || state.counts,
                    currentPage: page,
                });
            } else {
                setState({ isLoading: false });
            }
        } catch (error) {
            setState({ isLoading: false });
            console.error('getFollowUpsList error:', error);
        }
    };

    // ── 4. Save Call Update API Function ─────────────────────────────────────
    const saveCallUpdateAPI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.selectedFollowUp) return;

        if (!state.callNotes || !state.callNotes.trim()) {
            Failure('Please enter conversation notes / feedback');
            return;
        }

        try {
            setState({ isSubmittingUpdate: true });
            const payload = {
                outcome: state.callOutcome,
                notes: state.callNotes.trim(),
                next_action:
                    OUTCOME_ACTIONS[state.callOutcome] || `Follow-up commitment for ${state.callOutcome}`,
                schedule_callback: state.scheduleCallback,
                callback_date: state.scheduleCallback ? state.callbackDate : null,
                callback_time: state.scheduleCallback ? state.callbackTime : null,
                refer_to_counsellor: state.referToCounsellor,
                student_name: state.selectedFollowUp.student_name,
                phone: state.selectedFollowUp.contact_number,
                city: state.selectedFollowUp.city,
            };

            const res: any = await Models.contact.telecaller.update_call(
                state.selectedFollowUp.contact_id || state.selectedFollowUp.id,
                payload
            );
            Success(res?.message || 'Call update saved & follow-up updated successfully!');
            setState({ isOpenCallUpdate: false, isSubmittingUpdate: false, selectedFollowUp: null });
            getFollowUpsList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to save call update');
            setState({ isSubmittingUpdate: false });
        }
    };

    // ── 5. Reschedule Callback API Function ──────────────────────────────────
    const rescheduleFollowUpAPI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.rescheduleFollowUp) return;

        if (!state.newDate) {
            Failure('Please select a valid callback date');
            return;
        }

        try {
            setState({ isSubmittingReschedule: true });
            const payload = {
                date: state.newDate,
                time: state.newTime || '11:00 AM',
                reason: state.rescheduleReason.trim(),
            };

            const res: any = await Models.contact.telecaller.reschedule_call(
                state.rescheduleFollowUp.id,
                payload
            );
            Success(res?.message || 'Callback rescheduled successfully!');
            setState({ isOpenReschedule: false, isSubmittingReschedule: false, rescheduleFollowUp: null });
            getFollowUpsList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to reschedule callback');
            setState({ isSubmittingReschedule: false });
        }
    };

    // ── 6. Complete Callback API Function ────────────────────────────────────
    const completeCallbackAPI = async () => {
        if (!state.completeFollowUp) return;
        try {
            setState({ isSubmittingComplete: true });
            const res: any = await Models.contact.telecaller.complete_callback(
                state.completeFollowUp.id
            );
            Success(res?.message || 'Callback marked as completed!');
            setState({ isOpenComplete: false, isSubmittingComplete: false, completeFollowUp: null });
            getFollowUpsList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to complete callback');
            setState({ isSubmittingComplete: false });
        }
    };

    // ── 7. Transfer Callback API Function ────────────────────────────────────
    const transferCallbackAPI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.transferFollowUp) return;

        if (!state.transferToStaff) {
            Failure('Please select a staff member or counsellor');
            return;
        }

        try {
            setState({ isSubmittingTransfer: true });
            const payload = {
                assigned_to: state.transferToStaff,
                reason: state.transferReason.trim(),
            };

            const res: any = await Models.contact.telecaller.transfer_callback(
                state.transferFollowUp.id,
                payload
            );
            Success(res?.message || `Callback transferred to ${state.transferToStaff}!`);
            setState({ isOpenTransfer: false, isSubmittingTransfer: false, transferFollowUp: null });
            getFollowUpsList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to transfer callback');
            setState({ isSubmittingTransfer: false });
        }
    };

    // ── 8. WhatsApp Direct Action ────────────────────────────────────────────
    const whatsappAction = (phoneNum?: string) => {
        const cleanPhone = String(phoneNum || '').replace(/[^0-9]/g, '');
        if (cleanPhone) {
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else {
            Failure('No valid mobile number found for WhatsApp');
        }
    };

    // ── 9. Tab Change Action ─────────────────────────────────────────────────
    const handleTabChange = (tab: TabType) => {
        if (state.activeTab === tab) return;
        setState({ activeTab: tab, currentPage: 1 });
    };

    // ── 10. Open Action Handlers ─────────────────────────────────────────────
    const handleOpenCallUpdate = (item: FollowUpRecord) => {
        setState({
            selectedFollowUp: item,
            callOutcome: item.outcome || 'Interested',
            callNotes: item.last_call_notes || '',
            scheduleCallback: false,
            callbackDate: moment().format('YYYY-MM-DD'),
            callbackTime: '11:00 AM',
            referToCounsellor: false,
            isOpenCallUpdate: true,
        });
    };

    const handleOpenReschedule = (item: FollowUpRecord) => {
        setState({
            rescheduleFollowUp: item,
            newDate: item.scheduled_date || moment().add(1, 'day').format('YYYY-MM-DD'),
            newTime: item.scheduled_time || '11:30 AM',
            rescheduleReason: item.last_call_notes || '',
            isOpenReschedule: true,
        });
    };

    const handleOpenTransfer = (item: FollowUpRecord) => {
        setState({
            transferFollowUp: item,
            transferToStaff: 'S. Saravanan (Senior Counsellor)',
            transferReason: 'Candidate requested in-depth scholarship counselling.',
            isOpenTransfer: true,
        });
    };

    const handleOpenComplete = (item: FollowUpRecord) => {
        setState({
            completeFollowUp: item,
            isOpenComplete: true,
        });
    };

    // =========================================================================
    // DATATABLE COLUMNS DEFINITION
    // =========================================================================
    const columns = [
        {
            accessor: 'student_name',
            title: 'Student Name',
            sortable: true,
            render: (row: FollowUpRecord) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {row.student_name}
                    </span>
                    <span className="mt-0.5 text-xs text-gray-400">
                        {row.enquiry_id} · {row.city}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'contact_number',
            title: 'Contact Number',
            sortable: true,
            render: (row: FollowUpRecord) => (
                <div className="flex items-center gap-2">
                    <a
                        href={`tel:${row.contact_number}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-[#39854a] transition"
                    >
                        {row.contact_number}
                    </a>
                    <button
                        type="button"
                        onClick={() => whatsappAction(row.contact_number)}
                        title="Chat on WhatsApp"
                        className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                    >
                        <MessageCircle className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
        {
            accessor: 'last_call_notes',
            title: 'Last Call Notes',
            width: "w-fit",
            render: (row: FollowUpRecord) => (
                <Tippy content={row.last_call_notes || 'No call notes recorded'}>
                    <div className="max-w-[155px] space-y-1 cursor-pointer">
                        <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-[#39854a] transition">
                            {row.last_call_notes}
                        </p>
                        <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#39854a] border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300">
                            Outcome: {row.outcome}
                        </span>
                    </div>
                </Tippy>
            ),
        },
        {
            accessor: 'scheduled_date_time',
            title: 'Scheduled Date & Time',
            sortable: true,
            render: (row: FollowUpRecord) => {
                const datePart =
                    row.scheduled_date ||
                    (row.scheduled_date_time?.includes('@')
                        ? row.scheduled_date_time.split('@')[0].trim()
                        : row.scheduled_date_time);
                const timePart =
                    row.scheduled_time ||
                    (row.scheduled_date_time?.includes('@')
                        ? row.scheduled_date_time.split('@')[1]?.trim()
                        : '');

                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-gray-100">
                            <Calendar className="h-3.5 w-3.5 text-[#39854a] shrink-0" />
                            <span>{datePart}</span>
                        </div>
                        {timePart && (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 pl-5">
                                <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                                <span>{timePart}</span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            accessor: 'assigned_telecaller',
            title: 'Assigned Telecaller',
            titleClassName: '!text-center',
            render: (row: FollowUpRecord) => (
                <div className="text-center">
                    <span className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {row.assigned_telecaller}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-right',
            render: (row: FollowUpRecord) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Action 1: WhatsApp */}
                    <Tippy content="Chat on WhatsApp">
                        <button
                            type="button"
                            title="Chat on WhatsApp"
                            onClick={() => whatsappAction(row.contact_number)}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                    </Tippy>

                    {/* Action 2: Reschedule (Clock) */}
                    <Tippy content="Reschedule Follow-up">
                        <button
                            type="button"
                            title="Reschedule Follow-up"
                            onClick={() => handleOpenReschedule(row)}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                        >
                            <Clock className="w-3.5 h-3.5" />
                        </button>
                    </Tippy>

                    {/* Action 3: Transfer (ArrowLeftRight) */}
                    <Tippy content="Transfer Follow-up">
                        <button
                            type="button"
                            title="Transfer Follow-up"
                            onClick={() => handleOpenTransfer(row)}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition active:scale-95 cursor-pointer"
                        >
                            <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                    </Tippy>

                    {/* Action 4: Complete (CheckCircle2) */}
                    <Tippy content="Mark as Completed">
                        <button
                            type="button"
                            title="Mark Follow-up as Completed"
                            onClick={() => handleOpenComplete(row)}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-teal-600 hover:bg-teal-100 transition active:scale-95 cursor-pointer"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                    </Tippy>

                    {/* Action 5: Call & Update -> Solid Green Button */}
                    <button
                        type="button"
                        onClick={() => handleOpenCallUpdate(row)}
                        className="btn-action-solid !py-1 !px-2.5 !text-[11px] !rounded-lg flex items-center gap-1 active:scale-95 cursor-pointer font-bold"
                    >
                        <Phone className="w-3 h-3" />
                        <span>Call & Update</span>
                    </button>
                </div>
            ),
        },
    ];

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    // =========================================================================
    // MAIN PAGE DOM (RETURN)
    // =========================================================================
    return (
        <div className="min-h-screen space-y-6 bg-[#f7faf8] p-4 sm:p-6 dark:bg-[#060818]">
            <Head>
                <title>Follow-ups & Scheduled Callbacks - Telecaller Desk</title>
            </Head>

            {/* ============================================================== */}
            {/* 1. PAGE HEADER */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        Follow-ups & Scheduled Callbacks
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 dark:text-gray-400 sm:text-sm">
                        Maintain callback commitments and request administrative transfers when unavailable.
                    </p>
                </div>
            </div>

            {/* ============================================================== */}
            {/* 2. FILTER TABS & SEARCH BAR (Compact and aligned) */}
            {/* ============================================================== */}
            <div className="overview-panel space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 sm:gap-3">
                    {/* Small Compact Filter Tabs */}
                    <div className="inline-flex shrink-0 self-start sm:self-auto rounded-xl bg-gray-100 p-0.5 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => handleTabChange('today')}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition cursor-pointer ${
                                state.activeTab === 'today'
                                    ? 'bg-[#39854a] text-white shadow-xs font-bold'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                            }`}
                        >
                            <span>Today&apos;s Callbacks</span>
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    state.activeTab === 'today'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {state.counts.today}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('upcoming')}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition cursor-pointer ${
                                state.activeTab === 'upcoming'
                                    ? 'bg-[#39854a] text-white shadow-xs font-bold'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                            }`}
                        >
                            <span>Upcoming Schedule</span>
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    state.activeTab === 'upcoming'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                            >
                                {state.counts.upcoming}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTabChange('overdue')}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition cursor-pointer ${
                                state.activeTab === 'overdue'
                                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                                    : 'text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300'
                            }`}
                        >
                            <AlertCircle className="h-3 w-3" />
                            <span>Overdue Callbacks</span>
                            <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    state.activeTab === 'overdue'
                                        ? 'bg-white/20 text-white'
                                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                }`}
                            >
                                {state.counts.overdue}
                            </span>
                        </button>
                    </div>

                    {/* Big Expanded Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={state.search}
                            onChange={(e) => setState({ search: e.target.value, currentPage: 1 })}
                            placeholder="Search candidate name, phone, enquiry ID..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-9 text-xs sm:text-sm font-semibold text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-white"
                        />
                        {state.search && (
                            <button
                                type="button"
                                onClick={() => setState({ search: '', currentPage: 1 })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Telecaller Filter via CustomSelect */}
                    <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            Telecaller:
                        </span>
                        <div className="w-48 sm:w-56">
                            <CustomSelect
                                options={state.telecallerOptions}
                                value={state.selectedTelecaller}
                                onChange={(opt: any) =>
                                    setState({ selectedTelecaller: opt, currentPage: 1 })
                                }
                                isSearchable
                                isClearable
                                placeholder="All Telecallers"
                                loading={state.telecallerLoading}
                            />
                        </div>
                    </div>
                </div>

                {/* Active Filters Row */}
                {(Boolean(state.selectedTelecaller) || Boolean(state.search)) && (
                    <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            Active Filters:
                        </span>
                        {state.selectedTelecaller && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                <span>Telecaller: {state.selectedTelecaller.label}</span>
                                <button
                                    type="button"
                                    onClick={() => setState({ selectedTelecaller: null, currentPage: 1 })}
                                    className="hover:text-emerald-900 dark:hover:text-emerald-100 cursor-pointer"
                                    title="Clear telecaller filter"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        )}
                        {state.search && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                <span>Search: &quot;{state.search}&quot;</span>
                                <button
                                    type="button"
                                    onClick={() => setState({ search: '', currentPage: 1 })}
                                    className="hover:text-gray-900 dark:hover:text-white cursor-pointer"
                                    title="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleClearAllFilters}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 ml-auto cursor-pointer transition hover:underline"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* ============================================================== */}
            {/* 3. CALLBACKS DATATABLE (Mantine DataTable) */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                <DataTable
                    highlightOnHover
                    className="table-hover whitespace-nowrap"
                    records={state.followupsList}
                    fetching={state.isLoading}
                    minHeight={240}
                    sortStatus={state.sortStatus}
                    onSortStatusChange={(status) => setState({ sortStatus: status, currentPage: 1 })}
                    noRecordsText="No callbacks scheduled for this tab."
                    columns={columns}
                    customLoader={
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                            <span className="text-xs font-bold text-gray-500">Loading callback records...</span>
                        </div>
                    }
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mb-2" />
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                No callbacks scheduled
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                All callback commitments have been fulfilled for this filter.
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
                                {Math.min(startIndex + state.recordsPerPage, state.totalRecords)}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">{state.totalRecords}</span>{' '}
                            callbacks
                        </span>

                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[11px] text-gray-400">Rows:</span>
                            <select
                                value={state.recordsPerPage}
                                onChange={(e) =>
                                    setState({ recordsPerPage: Number(e.target.value), currentPage: 1 })
                                }
                                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>
                    </div>

                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.totalRecords}
                        recordsPerPage={state.recordsPerPage}
                        onPageChange={(page) => setState({ currentPage: page })}
                        hasNext={state.currentPage < totalPages}
                        hasPrevious={state.currentPage > 1}
                    />
                </div>
            </div>

            {/* ============================================================== */}
            {/* 4. MODALS (Portaled for stability & z-index cleanliness) */}
            {/* ============================================================== */}

            {/* Modal 1: Call & Update Modal */}
            {renderCallUpdateModal({
                isOpen: state.isOpenCallUpdate,
                followUp: state.selectedFollowUp,
                outcome: state.callOutcome,
                notes: state.callNotes,
                scheduleCallback: state.scheduleCallback,
                callbackDate: state.callbackDate,
                callbackTime: state.callbackTime,
                referToCounsellor: state.referToCounsellor,
                isSubmitting: state.isSubmittingUpdate,
                onOutcomeChange: (val) => setState({ callOutcome: val }),
                onNotesChange: (val) => setState({ callNotes: val }),
                onScheduleCallbackChange: (val) => setState({ scheduleCallback: val }),
                onCallbackDateChange: (val) => setState({ callbackDate: val }),
                onCallbackTimeChange: (val) => setState({ callbackTime: val }),
                onReferToCounsellorChange: (val) => setState({ referToCounsellor: val }),
                onClose: () => setState({ isOpenCallUpdate: false, selectedFollowUp: null }),
                onSubmit: saveCallUpdateAPI,
            })}

            {/* Modal 2: Reschedule Callback Modal */}
            {renderRescheduleModal({
                isOpen: state.isOpenReschedule,
                followUp: state.rescheduleFollowUp,
                newDate: state.newDate,
                newTime: state.newTime,
                reason: state.rescheduleReason,
                isSubmitting: state.isSubmittingReschedule,
                onDateChange: (val) => setState({ newDate: val }),
                onTimeChange: (val) => setState({ newTime: val }),
                onReasonChange: (val) => setState({ rescheduleReason: val }),
                onClose: () => setState({ isOpenReschedule: false, rescheduleFollowUp: null }),
                onSubmit: rescheduleFollowUpAPI,
            })}

            {/* Modal 3: Transfer Callback Modal */}
            {renderTransferModal({
                isOpen: state.isOpenTransfer,
                followUp: state.transferFollowUp,
                transferToStaff: state.transferToStaff,
                reason: state.transferReason,
                isSubmitting: state.isSubmittingTransfer,
                onStaffChange: (val) => setState({ transferToStaff: val }),
                onReasonChange: (val) => setState({ transferReason: val }),
                onClose: () => setState({ isOpenTransfer: false, transferFollowUp: null }),
                onSubmit: transferCallbackAPI,
            })}

            {/* Modal 4: Complete Callback Modal */}
            {renderCompleteModal({
                isOpen: state.isOpenComplete,
                followUp: state.completeFollowUp,
                isSubmitting: state.isSubmittingComplete,
                onClose: () => setState({ isOpenComplete: false, completeFollowUp: null }),
                onConfirm: completeCallbackAPI,
            })}
        </div>
    );
};

export default FollowUpsPage;

// =============================================================================
// MODAL RENDER FUNCTIONS (Modeled after contacts/my_contacts & all_contacts)
// =============================================================================

// ── Modal 1: Call & Update Modal ─────────────────────────────────────────────
interface CallUpdateModalProps {
    isOpen: boolean;
    followUp: FollowUpRecord | null;
    outcome: string;
    notes: string;
    scheduleCallback: boolean;
    callbackDate: string;
    callbackTime: string;
    referToCounsellor: boolean;
    isSubmitting: boolean;
    onOutcomeChange: (val: string) => void;
    onNotesChange: (val: string) => void;
    onScheduleCallbackChange: (val: boolean) => void;
    onCallbackDateChange: (val: string) => void;
    onCallbackTimeChange: (val: string) => void;
    onReferToCounsellorChange: (val: boolean) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const renderCallUpdateModal = ({
    isOpen,
    followUp,
    outcome,
    notes,
    scheduleCallback,
    callbackDate,
    callbackTime,
    referToCounsellor,
    isSubmitting,
    onOutcomeChange,
    onNotesChange,
    onScheduleCallbackChange,
    onCallbackDateChange,
    onCallbackTimeChange,
    onReferToCounsellorChange,
    onClose,
    onSubmit,
}: CallUpdateModalProps) => {
    if (!isOpen || !followUp) return null;

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
                                Call Update: {followUp.student_name}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {followUp.contact_number} · {followUp.city} · {followUp.enquiry_id}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={onSubmit} className="custom-scroll max-h-[75vh] space-y-4 overflow-y-auto p-5">
                    {/* Call Outcome Pills */}
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
                                        onClick={() => onOutcomeChange(item)}
                                        className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition cursor-pointer ${
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
                            Call Notes / Feedback <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            placeholder="Enter call outcome summary, parent requirements, campus visit schedules..."
                            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                        />
                    </div>

                    {/* Checkbox: Keep Callback Active */}
                    <div className="space-y-3 rounded-xl border border-gray-200 p-3.5 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <CheckboxInput
                                checked={scheduleCallback}
                                onChange={(val) => onScheduleCallbackChange(val)}
                                label="Keep Callback Active for Further Follow-up"
                            />
                            {scheduleCallback && (
                                <span className="rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-bold text-[#39854a] dark:bg-green-950/40">
                                    Callback Required
                                </span>
                            )}
                        </div>

                        {scheduleCallback && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <div>
                                    <TextInput
                                        type="date"
                                        label="New Callback Date"
                                        value={callbackDate}
                                        onChange={(e: any) => onCallbackDateChange(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <TextInput
                                        type="text"
                                        label="New Callback Time"
                                        value={callbackTime}
                                        onChange={(e: any) => onCallbackTimeChange(e.target.value)}
                                        placeholder="11:00 AM"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Checkbox: Refer to Senior Academic Counsellor */}
                    <div className="rounded-xl border border-gray-200 p-3.5 dark:border-gray-800">
                        <CheckboxInput
                            checked={referToCounsellor}
                            onChange={(val) => onReferToCounsellorChange(val)}
                            label="Refer to Senior Academic Counsellor"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-[#121e32]/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-action-solid flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                            <Send className="h-3.5 w-3.5" />
                            <span>{isSubmitting ? 'Saving...' : 'Save & Update'}</span>
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

// ── Modal 2: Reschedule Callback Modal ────────────────────────────────────────
interface RescheduleModalProps {
    isOpen: boolean;
    followUp: FollowUpRecord | null;
    newDate: string;
    newTime: string;
    reason: string;
    isSubmitting: boolean;
    onDateChange: (val: string) => void;
    onTimeChange: (val: string) => void;
    onReasonChange: (val: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const renderRescheduleModal = ({
    isOpen,
    followUp,
    newDate,
    newTime,
    reason,
    isSubmitting,
    onDateChange,
    onTimeChange,
    onReasonChange,
    onClose,
    onSubmit,
}: RescheduleModalProps) => {
    if (!isOpen || !followUp) return null;

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                            <CalendarClock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Reschedule Callback: {followUp.student_name}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Current: {followUp.scheduled_date_time}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={onSubmit} className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            type="date"
                            label="New Date"
                            required
                            value={newDate}
                            onChange={(e: any) => onDateChange(e.target.value)}
                        />
                        <TextInput
                            type="text"
                            label="New Time"
                            required
                            value={newTime}
                            onChange={(e: any) => onTimeChange(e.target.value)}
                            placeholder="11:30 AM"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-800 dark:text-gray-200">
                            Reason for Rescheduling
                        </label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="e.g. Student requested callback after 12th board exams."
                            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-action-solid flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                        >
                            <CalendarClock className="h-4 w-4" />
                            <span>{isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}</span>
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

// ── Modal 3: Transfer Callback Modal ─────────────────────────────────────────
interface TransferModalProps {
    isOpen: boolean;
    followUp: FollowUpRecord | null;
    transferToStaff: string;
    reason: string;
    isSubmitting: boolean;
    onStaffChange: (val: string) => void;
    onReasonChange: (val: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const renderTransferModal = ({
    isOpen,
    followUp,
    transferToStaff,
    reason,
    isSubmitting,
    onStaffChange,
    onReasonChange,
    onClose,
    onSubmit,
}: TransferModalProps) => {
    if (!isOpen || !followUp) return null;

    const currentStaffOption =
        TRANSFER_STAFF_OPTIONS.find((o) => o.value === transferToStaff) || {
            value: transferToStaff,
            label: transferToStaff,
        };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                            <Share2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Transfer Lead: {followUp.student_name}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Current Assigned: {followUp.assigned_telecaller}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={onSubmit} className="space-y-4 p-5">
                    <div>
                        <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-gray-300">
                            Transfer To Staff / Counsellor <span className="text-red-500">*</span>
                        </label>
                        <CustomSelect
                            options={TRANSFER_STAFF_OPTIONS}
                            value={currentStaffOption}
                            onChange={(opt: any) => onStaffChange(opt?.value || '')}
                            placeholder="Select active staff / counsellor"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-bold text-gray-800 dark:text-gray-200">
                            Reason for Transfer
                        </label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="e.g. Candidate requested on-campus lab tour and scholarship waiver counselling."
                            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? 'Transferring...' : 'Confirm Transfer'}
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

// ── Modal 4: Complete Confirmation Modal ─────────────────────────────────────
interface CompleteModalProps {
    isOpen: boolean;
    followUp: FollowUpRecord | null;
    isSubmitting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const renderCompleteModal = ({
    isOpen,
    followUp,
    isSubmitting,
    onClose,
    onConfirm,
}: CompleteModalProps) => {
    if (!isOpen || !followUp) return null;

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Mark Callback Completed
                        </h3>
                        <p className="text-xs text-gray-400">
                            Confirm fulfillment of scheduled follow-up
                        </p>
                    </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 mb-4 leading-relaxed">
                    Are you sure you want to mark the scheduled callback for{' '}
                    <span className="font-bold text-gray-900 dark:text-white">
                        {followUp.student_name}
                    </span>{' '}
                    ({followUp.enquiry_id}) as fulfilled and completed?
                </p>

                <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-800/40 dark:text-gray-300 mb-5">
                    <div className="font-medium">Scheduled: {followUp.scheduled_date_time}</div>
                    <div className="mt-1 text-gray-500">Notes: {followUp.last_call_notes}</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={onConfirm}
                        className="btn-action-solid flex items-center gap-1.5 px-4 py-2 text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                        <Check className="h-3.5 w-3.5" />
                        <span>{isSubmitting ? 'Completing...' : 'Yes, Mark Completed'}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal') || document.body)
        : null;
};
