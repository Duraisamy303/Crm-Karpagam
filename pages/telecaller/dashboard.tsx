import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Phone,
    PhoneCall,
    Clock,
    Calendar,
    Users,
    Search,
    AlertCircle,
    RotateCcw,
    Sparkles,
    Eye,
    MessageSquare,
    Check,
    X,
    Send,
    Edit,
    CheckCircle2,
    Share2,
    CalendarClock,
    UserCheck,
    Save,
} from 'lucide-react';
import Modal from '@/common_component/modal';
import Pagination from '@/components/Pagination';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface QueueItem {
    id: string;
    contact_id: string;
    priority: string;
    priority_type: string;
    student_name: string;
    sibling?: boolean;
    enquiry_id: string;
    city: string;
    course_interest: string;
    institution: string;
    phone: string;
    parent_phone?: string;
    last_outcome: string;
    last_outcome_date?: string;
    next_action: string;
    last_note?: string;
    scheduled_time: string;
    scheduled_date?: string;
    stage: string;
    date_of_birth?: string;
    father_name?: string;
    mother_name?: string;
}

const CALL_OUTCOMES = [
    { label: 'Interested', value: 'Interested', color: 'emerald' },
    { label: 'Call Later', value: 'Call Later', color: 'blue' },
    { label: 'No Answer', value: 'No Answer', color: 'amber' },
    { label: 'Busy', value: 'Busy', color: 'purple' },
    { label: 'Not Interested', value: 'Not Interested', color: 'rose' },
    { label: 'Wrong Number', value: 'Wrong Number', color: 'gray' },
    { label: 'Counselling Needed', value: 'Counselling Needed', color: 'indigo' },
];

const TelecallerDashboardPage = () => {
    const router = useRouter();

    const [state, setState] = useSetState({
        // Data & Loading
        queueList: [] as QueueItem[],
        totalRecords: 0,
        isLoading: false,
        stats: {
            due_today: 1,
            overdue: 2,
            retry_queue: 0,
            new_calls: 0,
            my_contacts_count: 5,
            follow_ups_count: 4,
        },
        counts: {
            all: 3,
            overdue: 2,
            today: 1,
            retry: 0,
            new: 0,
        },

        // Filters
        activeTab: 'all',
        searchQuery: '',
        currentPage: 1,
        recordsPerPage: 5,

        // Quick Call Update Modal
        isOpenCallUpdate: false,
        selectedItem: null as QueueItem | null,
        callOutcome: 'Interested',
        callNotes: '',
        nextActionText: 'Save admission interest & follow-up',
        scheduleCallback: false,
        callbackDate: '2026-05-06',
        callbackTime: '11:00 AM',
        referToCounsellor: false,
        updateErrors: {} as Record<string, string>,
        isSubmittingUpdate: false,

        // Reschedule Modal
        isOpenReschedule: false,
        rescheduleItem: null as QueueItem | null,
        newRescheduleDate: '2026-05-06',
        newRescheduleTime: '11:30 AM',
        rescheduleReason: '',
        isSubmittingReschedule: false,

        // Full Student Drawer Modal (Image 2)
        isOpenFullDrawer: false,
        drawerActiveTab: 'personal', // 'personal' | 'education' | 'interest' | 'reference'
        fullStudent: null as QueueItem | null,
        fullStudentName: '',
        fullStudentMobile: '',
        fullDob: '2008-09-22',
        fullCity: 'Erode',
        fullFatherName: '',
        fullMotherName: '',
        fullParentMobile: '',
        fullScheduleCallback: true,
        fullCallbackDate: '2026-05-06',
        fullCallbackTime: '11:30 AM',
        fullNotes: '',
        fullOutcome: 'Interested',
        fullSchool10th: 'Govt Higher Secondary School',
        fullMarks10th: '88%',
        fullSchool12th: 'Kongu Matriculation School',
        fullMarks12th: '86%',
        fullPreferredInstitution: 'Karpagam College of Engineering (KCE)',
        fullPreferredCourse: 'Information Technology',
        fullHostelNeeded: 'Yes, Hostel Accommodation Required',
        fullLeadSource: 'Coimbatore Mega Education Fair',
    });

    const search = useDebounce(state.searchQuery, 400);

    // Build API query params / body containing all active keys with values (zero frontend filtering)
    const body_data = () => {
        const body: Record<string, any> = {
            page: state.currentPage,
            page_size: state.recordsPerPage,
            tab: state.activeTab,
        };
        if (search && search.trim()) {
            body.search = search.trim();
        }
        return body;
    };

    // Fetch Work Queue Data from Contact Model Telecaller API
    const getData = async () => {
        try {
            setState({ isLoading: true });
            const body = body_data();
            const res: any = await Models.contact.telecaller.dashboard(body);
            setState({
                queueList: res?.data || [],
                totalRecords: res?.total_records || 0,
                stats: res?.stats || state.stats,
                counts: res?.counts || state.counts,
                isLoading: false,
            });
        } catch (error) {
            console.error('Telecaller dashboard error:', error);
            setState({ isLoading: false });
        }
    };

    useEffect(() => {
        getData();
    }, [search, state.activeTab, state.currentPage, state.recordsPerPage]);

    // Helper to calculate student age from DOB string
    const getAgeText = (dob?: string) => {
        if (!dob) return '18 Yrs';
        try {
            const yr = parseInt(dob.split('-')[0] || dob.split('/')[2] || '2008');
            if (!isNaN(yr)) {
                return `${2026 - yr} Yrs`;
            }
        } catch (e) {}
        return '18 Yrs';
    };

    // Open Quick Call Modal ("call thaniya")
    const handleOpenCallOnly = (item: QueueItem) => {
        setState({
            selectedItem: item,
            callOutcome: item.last_outcome || 'Interested',
            callNotes: item.last_note || '',
            nextActionText: 'Save admission interest & follow-up',
            scheduleCallback: false,
            callbackDate: '2026-05-06',
            callbackTime: '11:00 AM',
            referToCounsellor: false,
            updateErrors: {},
            isOpenCallUpdate: true,
        });
    };
    const handleOpenCallUpdate = handleOpenCallOnly;

    // Submit Quick Call Update
    const handleSubmitCallUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.selectedItem) return;

        if (!state.callNotes || !state.callNotes.trim()) {
            setState({ updateErrors: { notes: 'Please enter call notes / student feedback' } });
            return;
        }

        try {
            setState({ isSubmittingUpdate: true });
            const payload = {
                outcome: state.callOutcome,
                notes: state.callNotes.trim(),
                next_action: state.nextActionText,
                schedule_callback: state.scheduleCallback,
                callback_date: state.scheduleCallback ? state.callbackDate : null,
                callback_time: state.scheduleCallback ? state.callbackTime : null,
                refer_to_counsellor: state.referToCounsellor,
                stage: state.referToCounsellor ? 'Counselling Needed' : 'Contacted',
            };

            await Models.contact.telecaller.update_call(state.selectedItem.id, payload);
            setState({
                isOpenCallUpdate: false,
                isSubmittingUpdate: false,
                selectedItem: null,
            });
            getData();
        } catch (error) {
            console.error('Call update error:', error);
            setState({ isSubmittingUpdate: false });
        }
    };

    // Open Reschedule Modal (Image 3)
    const handleOpenReschedule = (item: QueueItem) => {
        setState({
            rescheduleItem: item,
            newRescheduleDate: item.scheduled_date || '2026-05-06',
            newRescheduleTime: '11:30 AM',
            rescheduleReason: item.last_note || '',
            isOpenReschedule: true,
        });
    };

    // Submit Reschedule
    const handleSubmitReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.rescheduleItem) return;

        try {
            setState({ isSubmittingReschedule: true });
            const payload = {
                date: state.newRescheduleDate,
                time: state.newRescheduleTime,
                reason: state.rescheduleReason.trim(),
            };

            await Models.contact.telecaller.reschedule_call(state.rescheduleItem.id, payload);
            setState({
                isOpenReschedule: false,
                isSubmittingReschedule: false,
                rescheduleItem: null,
            });
            getData();
        } catch (error) {
            console.error('Reschedule error:', error);
            setState({ isSubmittingReschedule: false });
        }
    };

    // Open Full Student Detail & Call Update Modal (Matching user screenshot)
    const handleOpenFullDrawer = (item: QueueItem) => {
        setState({
            fullStudent: item,
            fullStudentName: item.student_name,
            fullStudentMobile: item.phone,
            fullDob: item.date_of_birth || (item.student_name.includes('Vignesh') ? '2008-04-12' : '2008-09-22'),
            fullCity: item.city,
            fullFatherName: item.father_name || '',
            fullMotherName: item.mother_name || '',
            fullParentMobile: item.parent_phone || (item.student_name.includes('Vignesh') ? '+91 98420 11990' : ''),
            fullScheduleCallback: true,
            fullCallbackDate: '2026-05-06',
            fullCallbackTime: '11:30 AM',
            fullNotes: item.last_note || (item.student_name.includes('Vignesh') ? 'Interested in B.Tech AI & DS, father requested hostel fee concession...' : ''),
            fullOutcome: item.last_outcome || 'Interested',
            fullPreferredCourse: item.course_interest,
            fullPreferredInstitution: item.institution || 'KAHE',
            drawerActiveTab: 'personal',
            isOpenFullDrawer: true,
        });
    };

    // Save Full Student Detail Drawer
    const handleSaveFullDrawer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.fullStudent) return;

        try {
            const payload = {
                student_name: state.fullStudentName,
                phone: state.fullStudentMobile,
                outcome: state.fullOutcome,
                notes: state.fullNotes,
                city: state.fullCity,
                parent_phone: state.fullParentMobile,
                schedule_callback: state.fullScheduleCallback,
                callback_date: state.fullCallbackDate,
                callback_time: state.fullCallbackTime,
                next_action: `Follow-up with ${state.fullStudentName} on ${state.fullPreferredCourse}`,
                stage: 'Contacted',
            };

            await Models.contact.telecaller.update_call(state.fullStudent.id, payload);
            setState({ isOpenFullDrawer: false, fullStudent: null });
            getData();
        } catch (error) {
            console.error('Save full drawer error:', error);
        }
    };

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen dark:bg-[#060818]">
            <Head>
                <title>Telecaller Dashboard - Karpagam Admissions CRM</title>
            </Head>

            {/* ============================================================== */}
            {/* PAGE HEADER (Matching Image 1) */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Telecaller Dashboard
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Logged in as{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">P. Malathi</span> · Academic
                        Year 2026–27 · Karpagam Admissions CRM
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => router.push('/telecaller/contacts')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-750 transition cursor-pointer"
                    >
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>My Contacts ({state.stats.my_contacts_count || 5})</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/telecaller/follow_ups')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                    >
                        <Clock className="h-4 w-4 text-white" />
                        <span>Scheduled Follow-ups</span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* TOP 4 STAT CARDS (Matching Image 1 & 4 with Dynamic Active Filter) */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1. Due Today */}
                <div
                    onClick={() =>
                        setState({
                            activeTab: state.activeTab === 'today' ? 'all' : 'today',
                            currentPage: 1,
                        })
                    }
                    className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 select-none ${
                        state.activeTab === 'today'
                            ? 'border-2 border-[#39854a] bg-emerald-50/40 shadow-md ring-2 ring-[#39854a]/25 dark:border-[#39854a] dark:bg-emerald-950/20 dark:ring-[#39854a]/30'
                            : 'border border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:bg-[#0e1726] dark:hover:border-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                            <Calendar className="h-4 w-4 text-[#39854a]" />
                            <span>Due Today</span>
                        </div>
                        <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                state.activeTab === 'today'
                                    ? 'text-[#39854a] font-bold'
                                    : 'text-gray-400'
                            }`}
                        >
                            {state.activeTab === 'today' && (
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#39854a]" />
                            )}
                            {state.activeTab === 'today' ? 'Active • 2026-05-05' : '2026-05-05'}
                        </span>
                    </div>
                    <div
                        className={`mt-3 text-3xl font-black ${
                            state.activeTab === 'today'
                                ? 'text-[#39854a]'
                                : 'text-gray-900 dark:text-white'
                        }`}
                    >
                        {state.stats.due_today}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Callback commitments scheduled for today
                    </p>
                </div>

                {/* 2. Overdue (High Priority Highlight) */}
                <div
                    onClick={() =>
                        setState({
                            activeTab: state.activeTab === 'overdue' ? 'all' : 'overdue',
                            currentPage: 1,
                        })
                    }
                    className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 select-none ${
                        state.activeTab === 'overdue'
                            ? 'border-2 border-rose-500 bg-rose-50/40 shadow-md ring-2 ring-rose-400/25 dark:border-rose-500 dark:bg-rose-950/30 dark:ring-rose-500/30'
                            : 'border border-rose-200/70 bg-rose-50/15 shadow-sm hover:border-rose-300 hover:shadow-md dark:border-rose-900/40 dark:bg-rose-950/10 dark:hover:border-rose-800'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
                            <AlertCircle className="h-4 w-4 text-rose-500" />
                            <span>Overdue</span>
                        </div>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide transition ${
                                state.activeTab === 'overdue'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                        >
                            {state.activeTab === 'overdue' ? 'Active • High Priority' : 'High Priority'}
                        </span>
                    </div>
                    <div className="mt-3 text-3xl font-black text-rose-600 dark:text-rose-400">
                        {state.stats.overdue}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Calls delayed past designated callback slot
                    </p>
                </div>

                {/* 3. Retry Queue */}
                <div
                    onClick={() =>
                        setState({
                            activeTab: state.activeTab === 'retry' ? 'all' : 'retry',
                            currentPage: 1,
                        })
                    }
                    className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 select-none ${
                        state.activeTab === 'retry'
                            ? 'border-2 border-purple-500 bg-purple-50/40 shadow-md ring-2 ring-purple-400/25 dark:border-purple-500 dark:bg-purple-950/30 dark:ring-purple-500/30'
                            : 'border border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:bg-[#0e1726] dark:hover:border-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                            <RotateCcw className="h-4 w-4 text-purple-600" />
                            <span>Retry Queue</span>
                        </div>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold transition ${
                                state.activeTab === 'retry'
                                    ? 'bg-purple-600 text-white shadow-xs'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            }`}
                        >
                            {state.activeTab === 'retry' ? 'Active • Busy / No Answer' : 'Busy / No Answer'}
                        </span>
                    </div>
                    <div
                        className={`mt-3 text-3xl font-black ${
                            state.activeTab === 'retry'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-900 dark:text-white'
                        }`}
                    >
                        {state.stats.retry_queue}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Prior attempts requiring second touchpoint
                    </p>
                </div>

                {/* 4. New Calls */}
                <div
                    onClick={() =>
                        setState({
                            activeTab: state.activeTab === 'new' ? 'all' : 'new',
                            currentPage: 1,
                        })
                    }
                    className={`cursor-pointer rounded-2xl p-5 transition-all duration-200 select-none ${
                        state.activeTab === 'new'
                            ? 'border-2 border-blue-500 bg-blue-50/40 shadow-md ring-2 ring-blue-400/25 dark:border-blue-500 dark:bg-blue-950/30 dark:ring-blue-500/30'
                            : 'border border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md dark:border-gray-800 dark:bg-[#0e1726] dark:hover:border-gray-700'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-200">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span>New Calls</span>
                        </div>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold transition ${
                                state.activeTab === 'new'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                        >
                            {state.activeTab === 'new' ? 'Active • Uncontacted' : 'Uncontacted'}
                        </span>
                    </div>
                    <div
                        className={`mt-3 text-3xl font-black ${
                            state.activeTab === 'new'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-900 dark:text-white'
                        }`}
                    >
                        {state.stats.new_calls}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Fresh assigned contacts awaiting initial reachout
                    </p>
                </div>
            </div>

            {/* ============================================================== */}
            {/* TODAY'S CALLS WORK QUEUE TABLE CONTAINER */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                {/* Header & Tabs */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <PhoneCall className="h-5 w-5 text-[#39854a]" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Today's Calls Work Queue
                                </h2>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dcfce7] text-[#16a34a] dark:bg-green-950/40 dark:text-green-400">
                                    {state.totalRecords} Pending
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                                Priority order:{' '}
                                <span className="font-semibold text-rose-500">Overdue</span> →{' '}
                                <span className="font-semibold text-amber-600">Due Today</span> →{' '}
                                <span className="font-semibold text-purple-600">Retry</span> →{' '}
                                <span className="font-semibold text-emerald-600">New Calls</span>
                            </p>
                        </div>

                        {/* Queue Filter Tabs & Search */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <div className="flex items-center gap-1.5 p-1 bg-gray-100/70 rounded-xl dark:bg-gray-800/60 overflow-x-auto">
                                {[
                                    { key: 'all', label: `All (${state.counts.all})` },
                                    { key: 'overdue', label: `Overdue (${state.counts.overdue})` },
                                    { key: 'today', label: `Today (${state.counts.today})` },
                                    { key: 'retry', label: `Retry (${state.counts.retry})` },
                                    { key: 'new', label: `New (${state.counts.new})` },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setState({ activeTab: tab.key, currentPage: 1 })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                            state.activeTab === tab.key
                                                ? 'bg-[#39854a] text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Search Box */}
                            <div className="relative min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={state.searchQuery}
                                    onChange={(e) => setState({ searchQuery: e.target.value, currentPage: 1 })}
                                    placeholder="Search queue..."
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#39854a] focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Queue Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-900/40 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                                <th className="py-4 px-6">Priority / Student Name</th>
                                <th className="py-4 px-6">Phone</th>
                                <th className="py-4 px-6">Last Outcome</th>
                                <th className="py-4 px-6">Next Action</th>
                                <th className="py-4 px-6">Scheduled Time</th>
                                <th className="py-4 px-6 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
                            {state.isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                                            <span className="text-sm font-semibold">Loading queue contacts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : state.queueList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-400">
                                        <p className="font-semibold text-gray-600 dark:text-gray-300">
                                            No call tasks found
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            You are all caught up for this queue tab.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                state.queueList.map((item) => {
                                    const isOverdue = item.priority_type === 'overdue';

                                    return (
                                        <tr
                                            key={item.id}
                                            className="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                                        >
                                            {/* Priority & Student Name */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span
                                                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                                                                isOverdue
                                                                    ? 'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                                                                    : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                                                            }`}
                                                        >
                                                            {item.priority}
                                                        </span>
                                                        {item.sibling && (
                                                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-300">
                                                                Sibling
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                                            {item.student_name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenFullDrawer(item)}
                                                            title="View Full Profile Details"
                                                            className="text-gray-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer p-0.5"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="text-[11px] font-medium text-gray-400 truncate max-w-xs">
                                                        {item.enquiry_id} · {item.city} · {item.course_interest}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Phone Numbers */}
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="font-bold text-gray-900 dark:text-white">
                                                    {item.phone}
                                                </div>
                                                {item.parent_phone && item.parent_phone !== '-' && (
                                                    <div className="text-xs font-semibold text-gray-400 mt-0.5">
                                                        P: {item.parent_phone}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Last Outcome */}
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <span
                                                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                        item.last_outcome === 'Interested'
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                            : item.last_outcome === 'Call Later'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}
                                                >
                                                    {item.last_outcome}
                                                </span>
                                                {item.last_outcome_date && (
                                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                                        {item.last_outcome_date}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Next Action */}
                                            <td className="py-4 px-6 max-w-xs">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100 text-xs">
                                                    {item.next_action}
                                                </div>
                                                {item.last_note && (
                                                    <div className="text-[11px] italic text-gray-400 mt-1 line-clamp-1">
                                                        "{item.last_note}"
                                                    </div>
                                                )}
                                            </td>

                                            {/* Scheduled Time */}
                                            <td className="py-4 px-6 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                    <span>{item.scheduled_time}</span>
                                                </div>
                                            </td>

                                            {/* Action Buttons: Call (thaniya) + Call & Update (modal from screenshot) + Reschedule */}
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* 1. Call (thaniya) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenCallOnly(item)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-[#39854a] hover:bg-emerald-100 text-xs font-bold transition cursor-pointer dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-sm"
                                                        title={`Quick Call & Log: ${item.student_name}`}
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <span>Call</span>
                                                    </button>

                                                    {/* 2. Call & Update (thaniya modal from screenshot) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenFullDrawer(item)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                                                        title={`Complete Student Details & Call Update: ${item.student_name}`}
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                        <Edit className="h-3.5 w-3.5" />
                                                        <span>Call & Update</span>
                                                    </button>

                                                    {/* 3. Reschedule */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenReschedule(item)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold transition cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                                                        title={`Reschedule Callback: ${item.student_name}`}
                                                    >
                                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>Reschedule</span>
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

                {/* Table Footer & Pagination */}
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
                            calls in queue
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
            {/* QUICK CALL MODAL (Matching Image 4 / call thaniya) */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenCallUpdate}
                close={() => setState({ isOpenCallUpdate: false, selectedItem: null })}
                addHeader={
                    state.selectedItem ? (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-[#39854a]" />
                            <span>Call: {state.selectedItem.student_name}</span>
                        </div>
                    ) : (
                        'Call'
                    )
                }
                renderComponent={() =>
                    state.selectedItem && (
                        <form onSubmit={handleSubmitCallUpdate} className="p-5 space-y-4" noValidate>
                            {/* Candidate Summary Line with Direct Dial & WhatsApp buttons */}
                            <div className="flex items-center justify-between gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800">
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`tel:${state.selectedItem.phone}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#39854a] text-white text-xs font-bold hover:bg-[#2f6f3e] transition shadow-sm"
                                    >
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>Call {state.selectedItem.phone}</span>
                                    </a>
                                    <a
                                        href={`https://wa.me/${state.selectedItem.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 text-[#39854a] bg-white text-xs font-bold hover:bg-emerald-50 transition dark:bg-gray-800"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>WhatsApp</span>
                                    </a>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Current Stage</span>
                                    <span className="text-xs font-extrabold text-[#39854a]">{state.selectedItem.stage || 'Contacted'}</span>
                                </div>
                            </div>

                            {/* Call Outcome * (Selector Pills) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                                    Call Outcome <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CALL_OUTCOMES.map((oc) => (
                                        <button
                                            key={oc.value}
                                            type="button"
                                            onClick={() =>
                                                setState({
                                                    callOutcome: oc.value,
                                                    nextActionText:
                                                        oc.value === 'Interested'
                                                            ? 'Save admission interest & follow-up'
                                                            : oc.value === 'Call Later'
                                                            ? 'Scheduled next callback commitment'
                                                            : oc.value === 'Counselling Needed'
                                                            ? 'Refer to senior academic counsellor'
                                                            : 'Update status notes',
                                                })
                                            }
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                state.callOutcome === oc.value
                                                    ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            {oc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Next Action */}
                            <div className="flex items-center justify-between text-xs py-1">
                                <span className="font-bold text-gray-600 dark:text-gray-400">Next Action:</span>
                                <span className="font-semibold text-[#39854a] dark:text-green-400">
                                    {state.nextActionText}
                                </span>
                            </div>

                            {/* Call Notes / Student Feedback * */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                    Call Notes / Student Feedback <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={state.callNotes}
                                    onChange={(e) => {
                                        setState({ callNotes: e.target.value });
                                        if (state.updateErrors.notes) {
                                            const u = { ...state.updateErrors };
                                            delete u.notes;
                                            setState({ updateErrors: u });
                                        }
                                    }}
                                    placeholder="e.g. Student enquired about B.Tech CSE fee concessions and hostel facilities. Parents willing to visit campus this Saturday."
                                    className={`w-full rounded-xl border p-3 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none dark:bg-gray-900 dark:text-white ${
                                        state.updateErrors.notes
                                            ? 'border-red-400 bg-red-50/20'
                                            : 'border-gray-200 bg-white focus:border-[#39854a] focus:ring-1 focus:ring-[#39854a] dark:border-gray-700'
                                    }`}
                                />
                                {state.updateErrors.notes && (
                                    <p className="text-red-500 text-xs mt-1 font-semibold">
                                        ⚠ {state.updateErrors.notes}
                                    </p>
                                )}
                            </div>

                            {/* Checkbox 1: Schedule Next Follow-up Callback */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:bg-gray-800/40">
                                    <input
                                        type="checkbox"
                                        checked={state.scheduleCallback}
                                        onChange={(e) => setState({ scheduleCallback: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                        Schedule Next Follow-up Callback
                                    </span>
                                </label>

                                {state.scheduleCallback && (
                                    <div className="grid grid-cols-2 gap-3 pl-6 pt-1">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                                Callback Date
                                            </label>
                                            <input
                                                type="date"
                                                value={state.callbackDate}
                                                onChange={(e) => setState({ callbackDate: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                                Callback Time
                                            </label>
                                            <input
                                                type="text"
                                                value={state.callbackTime}
                                                onChange={(e) => setState({ callbackTime: e.target.value })}
                                                placeholder="11:00 AM"
                                                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Checkbox 2: Refer to Senior Academic Counsellor */}
                            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:bg-gray-800/40">
                                <input
                                    type="checkbox"
                                    checked={state.referToCounsellor}
                                    onChange={(e) => setState({ referToCounsellor: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] cursor-pointer"
                                />
                                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
                                    <UserCheck className="h-4 w-4 text-[#39854a]" />
                                    <span>Refer to Senior Academic Counsellor</span>
                                </div>
                            </label>

                            {/* Footer Buttons */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenCallUpdate: false, selectedItem: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.isSubmittingUpdate}
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4 text-white" />
                                    <span>
                                        {state.isSubmittingUpdate ? 'Saving...' : 'Save Call & Update CRM'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    )
                }
            />

            {/* ============================================================== */}
            {/* RESCHEDULE CALLBACK MODAL (Matching Image 3) */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenReschedule}
                close={() => setState({ isOpenReschedule: false, rescheduleItem: null })}
                addHeader={
                    state.rescheduleItem
                        ? `Reschedule Callback: ${state.rescheduleItem.student_name}`
                        : 'Reschedule Callback'
                }
                renderComponent={() =>
                    state.rescheduleItem && (
                        <form onSubmit={handleSubmitReschedule} className="p-5 space-y-4" noValidate>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                        New Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={state.newRescheduleDate}
                                            onChange={(e) => setState({ newRescheduleDate: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                        New Time <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={state.newRescheduleTime}
                                            onChange={(e) => setState({ newRescheduleTime: e.target.value })}
                                            placeholder="11:30 AM"
                                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reason / Note */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                    Reason / Note
                                </label>
                                <textarea
                                    rows={3}
                                    value={state.rescheduleReason}
                                    onChange={(e) => setState({ rescheduleReason: e.target.value })}
                                    placeholder="Enter reason for rescheduling callback..."
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm font-medium text-gray-800 focus:outline-none focus:border-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Footer Buttons */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenReschedule: false, rescheduleItem: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.isSubmittingReschedule}
                                    className="px-5 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                                >
                                    {state.isSubmittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
                                </button>
                            </div>
                        </form>
                    )
                }
            />

            {/* ============================================================== */}
            {/* FULL STUDENT DETAILS & CALL UPDATE MODAL (Matching Image 2 / New Screenshot) */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenFullDrawer}
                close={() => setState({ isOpenFullDrawer: false, fullStudent: null })}
                maxWidth="max-w-2xl"
                addHeader={
                    state.fullStudent ? (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                                {state.fullStudent.student_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-base text-gray-900 dark:text-white">
                                        {state.fullStudent.student_name}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                        {state.fullStudent.enquiry_id}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400 mt-0.5">
                                    {state.fullStudent.city} · Preferred:{' '}
                                    <span className="text-emerald-700 font-semibold dark:text-emerald-400">
                                        {state.fullStudent.course_interest}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        'Student Details'
                    )
                }
                renderComponent={() =>
                    state.fullStudent && (
                        <form onSubmit={handleSaveFullDrawer} className="p-5 space-y-4" noValidate>
                            {/* Call & WhatsApp Quick Buttons */}
                            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`tel:${state.fullStudent.phone}`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#39854a] text-white text-xs font-bold hover:bg-[#2f6f3e] transition"
                                    >
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>Call {state.fullStudent.phone}</span>
                                    </a>
                                    <a
                                        href={`https://wa.me/${state.fullStudent.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 text-[#39854a] bg-emerald-50 text-xs font-bold hover:bg-emerald-100 transition"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span>WhatsApp</span>
                                    </a>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                                        Admission Stage
                                    </span>
                                    <span className="text-xs font-extrabold text-[#39854a] dark:text-green-400">
                                        {state.fullStudent.stage || 'Contacted'}
                                    </span>
                                </div>
                            </div>

                            {/* Call Outcome * Pills */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-2">
                                    Call Outcome <span className="text-red-500">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CALL_OUTCOMES.map((oc) => (
                                        <button
                                            key={oc.value}
                                            type="button"
                                            onClick={() => setState({ fullOutcome: oc.value })}
                                            className={`px-3 py-1 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                                state.fullOutcome === oc.value
                                                    ? 'bg-[#39854a] text-white border-[#39854a]'
                                                    : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                            }`}
                                        >
                                            {oc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Call Notes input */}
                            <div>
                                <input
                                    type="text"
                                    value={state.fullNotes}
                                    onChange={(e) => setState({ fullNotes: e.target.value })}
                                    placeholder="Call Notes: e.g. Interested in B.Tech AI & DS, father requested hostel fee concession..."
                                    className="w-full rounded-xl border border-gray-200 bg-white p-2.5 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            {/* 4 Tabs Bar (Matching Image 2) */}
                            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pt-2">
                                {[
                                    { key: 'personal', label: '1. Personal & Family' },
                                    { key: 'education', label: '2. Education' },
                                    { key: 'interest', label: '3. Admission Interest' },
                                    { key: 'reference', label: '4. Reference' },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setState({ drawerActiveTab: tab.key })}
                                        className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition cursor-pointer ${
                                            state.drawerActiveTab === tab.key
                                                ? 'border-[#39854a] text-[#39854a] dark:text-green-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab 1: Personal & Family */}
                            {state.drawerActiveTab === 'personal' && (
                                <div className="space-y-3 pt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                Student Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullStudentName}
                                                onChange={(e) => setState({ fullStudentName: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                Student Mobile <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullStudentMobile}
                                                onChange={(e) => setState({ fullStudentMobile: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                Date of Birth (Age: {getAgeText(state.fullDob)})
                                            </label>
                                            <input
                                                type="date"
                                                value={state.fullDob}
                                                onChange={(e) => setState({ fullDob: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                City / District <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullCity}
                                                onChange={(e) => setState({ fullCity: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                Father's Name
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullFatherName}
                                                onChange={(e) => setState({ fullFatherName: e.target.value })}
                                                placeholder="Enter father name"
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                Mother's Name
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullMotherName}
                                                onChange={(e) => setState({ fullMotherName: e.target.value })}
                                                placeholder="Enter mother name"
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                            Parent / Guardian Mobile (Shared Sibling Key)
                                        </label>
                                        <input
                                            type="text"
                                            value={state.fullParentMobile}
                                            onChange={(e) => setState({ fullParentMobile: e.target.value })}
                                            placeholder="Enter parent mobile (e.g. +91 9842X XXXXX)"
                                            className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                        <p className="text-[11px] text-gray-400 mt-1">
                                            Siblings sharing this number are recognized as family without being
                                            rejected as duplicates.
                                        </p>
                                    </div>

                                    {/* Callback Schedule */}
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 dark:bg-gray-800/40 dark:border-gray-700 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={state.fullScheduleCallback}
                                                    onChange={(e) =>
                                                        setState({ fullScheduleCallback: e.target.checked })
                                                    }
                                                    className="h-4 w-4 rounded accent-[#39854a]"
                                                />
                                                <span>Schedule Next Callback</span>
                                            </label>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                                Callback Active
                                            </span>
                                        </div>

                                        {state.fullScheduleCallback && (
                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                                        Callback Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={state.fullCallbackDate}
                                                        onChange={(e) =>
                                                            setState({ fullCallbackDate: e.target.value })
                                                        }
                                                        className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                                                        Callback Time
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={state.fullCallbackTime}
                                                        onChange={(e) =>
                                                            setState({ fullCallbackTime: e.target.value })
                                                        }
                                                        className="w-full rounded-xl border border-gray-200 p-2 text-xs dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Education */}
                            {state.drawerActiveTab === 'education' && (
                                <div className="space-y-3 pt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                10th School / Board
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullSchool10th}
                                                onChange={(e) => setState({ fullSchool10th: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                10th Aggregate %
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullMarks10th}
                                                onChange={(e) => setState({ fullMarks10th: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                12th Higher Sec School
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullSchool12th}
                                                onChange={(e) => setState({ fullSchool12th: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                                12th Aggregate Marks %
                                            </label>
                                            <input
                                                type="text"
                                                value={state.fullMarks12th}
                                                onChange={(e) => setState({ fullMarks12th: e.target.value })}
                                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Admission Interest */}
                            {state.drawerActiveTab === 'interest' && (
                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                            Target Institution
                                        </label>
                                        <input
                                            type="text"
                                            value={state.fullPreferredInstitution}
                                            onChange={(e) => setState({ fullPreferredInstitution: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                            Preferred Degree & Course
                                        </label>
                                        <input
                                            type="text"
                                            value={state.fullPreferredCourse}
                                            onChange={(e) => setState({ fullPreferredCourse: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                            Accommodation Requirement
                                        </label>
                                        <input
                                            type="text"
                                            value={state.fullHostelNeeded}
                                            onChange={(e) => setState({ fullHostelNeeded: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 4: Reference */}
                            {state.drawerActiveTab === 'reference' && (
                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                            Lead Source Channel
                                        </label>
                                        <input
                                            type="text"
                                            value={state.fullLeadSource}
                                            onChange={(e) => setState({ fullLeadSource: e.target.value })}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                            Assigned Telecaller
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value="P. Malathi (Telecalling Desk)"
                                            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Drawer Footer Buttons */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenFullDrawer: false, fullStudent: null })}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                                >
                                    <Save className="h-4 w-4 text-white" />
                                    <span>Save Details & Update CRM</span>
                                </button>
                            </div>
                        </form>
                    )
                }
            />
        </div>
    );
};

export default TelecallerDashboardPage;

