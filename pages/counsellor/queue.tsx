import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import moment from 'moment';
import {
    Search,
    Clock,
    Calendar,
    Send,
    UserPlus,
    UploadCloud,
    ArrowRight,
    MessageCircle,
    ArrowLeftRight,
    CheckCircle2,
    Check,
    AlertCircle,
    Building2,
    CalendarClock,
    FileText,
    Eye,
    X,
    Phone,
    GraduationCap,
    BookOpen,
    Award,
    Building,
    Star,
    Mail,
    MapPin,
    Loader2,
    Pencil,
    User,
    RotateCcw,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import TextInput from '@/components/TextInput';
import CheckboxInput from '@/components/Checkbox';
import CustomSelect from '@/components/Select';
import TextArea from '@/components/TextArea';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import { capitalizeFLetter, Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';
import { AdmissionContact } from '@/components/KAHE/AdmissionsContactsTable';

// =============================================================================
// DATA INTERFACES & TYPES
// =============================================================================
export interface QueueItem {
    id: string;
    enquiry_id: string;
    student_name: string;
    mobile: string;
    city: string;
    qualification: string;
    target_programme: string;
    institution: string;
    referred_by: string;
    referred_by_role?: string;
    referral_date: string;
    referral_reason: string;
    priority: string;
    status: string;
    tab: string;
    marks?: string;
    campus?: string;
    current_stage?: string;
    notes?: string;
    session_outcome?: string | null;
    allData?: any;
}

type TabType = 'pending' | 'in_progress' | 'completed' | 'direct';

// =============================================================================
// CONSTANTS & SELECTION OPTIONS
// =============================================================================
const SESSION_OUTCOME_OPTIONS = [
    { value: 'Campus Visit Scheduled', label: 'Campus Visit Scheduled' },
    { value: 'Spot Provisional Admission Offered', label: 'Spot Provisional Admission Offered' },
    { value: 'Document Verification Pending', label: 'Document Verification Pending' },
    { value: 'Transferred to Telecaller for Routine Follow-up', label: 'Transferred to Telecaller for Routine Follow-up' },
    { value: 'Student Seeking Other Courses', label: 'Student Seeking Other Courses' },
    { value: 'Declined / Enrolled Elsewhere', label: 'Declined / Enrolled Elsewhere' },
];

const TELECALLER_OPTIONS = [
    { value: 'P. Malathi', label: 'P. Malathi (Senior Telecaller)' },
    { value: 'K. Kavitha', label: 'K. Kavitha (Admissions Counsellor)' },
    { value: 'R. Suresh', label: 'R. Suresh (Outreach Caller)' },
    { value: 'Any Available', label: 'Central Admin Pool (Auto Assign)' },
];

const TARGET_PROGRAMME_OPTIONS = [
    { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (KAHE)' },
    { value: 'B.Sc Nursing', label: 'B.Sc Nursing (KAHE)' },
    { value: 'Bachelor of Pharmacy', label: 'Bachelor of Pharmacy (KAHE)' },
    { value: 'Artificial Intelligence & Data Science', label: 'Artificial Intelligence & Data Science (KAHE)' },
    { value: 'Information Technology', label: 'Information Technology (KAHE)' },
    { value: 'MCA / MBA', label: 'MCA / MBA (KAHE)' },
];

const PRIORITY_OPTIONS = [
    { value: 'High', label: 'High Priority' },
    { value: 'Urgent', label: 'Urgent Priority' },
    { value: 'Normal', label: 'Normal Priority' },
];

const PRIORITY_FILTER_OPTIONS = [
    { value: 'all', label: 'All Priorities' },
    { value: 'High', label: 'High Priority' },
    { value: 'Urgent', label: 'Urgent Priority' },
    { value: 'Normal', label: 'Normal Priority' },
];

// =============================================================================
// MAIN COMPONENT: CounsellorQueuePage
// =============================================================================
const CounsellorQueuePage = () => {
    const router = useRouter();

    // ── Unified State Architecture (Matching assign_contact & my_contacts) ──
    const [state, setState] = useSetState({
        // Data & Loading States
        loading: false,
        activeTab: 'pending' as TabType,
        queueItems: [] as QueueItem[],
        allData: null as any,
        totalRecords: 0,
        currentPage: 1,
        recordsPerPage: 10,
        sortStatus: { columnAccessor: 'student_name', direction: 'asc' } as DataTableSortStatus,

        // Filters & Search
        search: '',
        priorityFilter: 'all',

        // Tab Badge Counts
        counts: {
            pending: 1,
            in_progress: 1,
            completed: 0,
            direct: 1,
        },

        // Modal 1: Counselling Review Modal
        isReviewModalOpen: false,
        selectedCandidate: null as QueueItem | null,
        reviewOutcome: 'Campus Visit Scheduled',
        admissionStage: 'Applied',
        consultationNotes: '',
        scheduleFollowupActive: false,
        reviewSubmitting: false,
        reviewErrors: {} as Record<string, string>,

        // Modal 2: Request Assignment to Telecaller Modal
        isTransferModalOpen: false,
        transferCandidate: null as QueueItem | null,
        selectedTelecaller: 'P. Malathi',
        transferReason: '',
        transferSubmitting: false,
        transferErrors: {} as Record<string, string>,

        // Modal 3: Schedule Consultation Follow-up Modal
        isScheduleModalOpen: false,
        scheduleCandidate: null as QueueItem | null,
        scheduleDate: moment().add(1, 'day').format('YYYY-MM-DD'),
        scheduleTime: '11:00 AM',
        scheduleAgenda: '',
        scheduleSubmitting: false,
        scheduleErrors: {} as Record<string, string>,

        // Modal 4: Add Contact Modal
        isAddModalOpen: false,
        addStudentName: '',
        addMobile: '',
        addCity: 'Coimbatore',
        addQualification: '12th Standard',
        addTargetProgramme: 'Computer Science & Engineering',
        addPriority: 'Normal',
        addNotes: '',
        addImmediateConsultation: false,
        addSubmitting: false,
        addErrors: {} as Record<string, string>,

        // Modal 5: Student Details Modal State
        viewingContact: null as AdmissionContact | null,
        loadingDetails: false,
        detailsActiveTab: 'personal' as StudentDetailsTab,
    });

    const debouncedSearch = useDebounce(state.search, 400);
    const prevDeps = useRef<string | null>(null);
    const isInitialLoad = useRef<boolean>(true);

    // ── Reactive Dependency Bundle ───────────────────────────────────────────
    const deps = useMemo(
        () => ({
            search: debouncedSearch,
            activeTab: state.activeTab,
            priorityFilter: state.priorityFilter,
            sortStatus: state.sortStatus,
            recordsPerPage: state.recordsPerPage,
        }),
        [
            debouncedSearch,
            state.activeTab,
            state.priorityFilter,
            state.sortStatus,
            state.recordsPerPage,
        ]
    );

    // ── Re-fetch Trigger on Dependency Changes ────────────────────────────────
    useEffect(() => {
        const currentDeps = JSON.stringify(deps);

        if (isInitialLoad.current) {
            getQueueList(1);
            isInitialLoad.current = false;
        } else if (prevDeps.current !== currentDeps) {
            getQueueList(1);
        }

        prevDeps.current = currentDeps;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps]);

    // ── Body Scroll Lock for Modals ──────────────────────────────────────────
    useEffect(() => {
        const isAnyModalOpen =
            state.isReviewModalOpen ||
            state.isTransferModalOpen ||
            state.isScheduleModalOpen ||
            state.isAddModalOpen ||
            Boolean(state.viewingContact);
        document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [
        state.isReviewModalOpen,
        state.isTransferModalOpen,
        state.isScheduleModalOpen,
        state.isAddModalOpen,
        state.viewingContact,
    ]);

    // =========================================================================
    // DEDICATED SEPARATE API FUNCTIONS (Declared before DOM)
    // =========================================================================

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

        if (state.priorityFilter && state.priorityFilter !== 'all') {
            body.priority = state.priorityFilter;
        }

        if (state.sortStatus?.columnAccessor && state.sortStatus?.direction) {
            const prefix = state.sortStatus.direction === 'desc' ? '-' : '';
            body.ordering = `${prefix}${state.sortStatus.columnAccessor}`;
        }

        return body;
    };

    // ── 2. Table Data Mapper ─────────────────────────────────────────────────
    const tableData = (res: any) => {
        const rawList = res?.results || res?.data || (Array.isArray(res) ? res : []);
        const data: QueueItem[] = rawList.map((item: any, idx: number) => ({
            id: item.id || `CQ-${String(idx + 1).padStart(3, '0')}`,
            enquiry_id: item.enquiry_id || item.contact_id || item.id,
            student_name: capitalizeFLetter(item.student_name) || item.student_name || 'Candidate',
            mobile: item.mobile || item.contact_number || item.phone || '-',
            city: capitalizeFLetter(item.city) || 'Coimbatore',
            qualification: item.qualification || '12th Standard',
            target_programme: item.target_programme || item.target_course || 'Computer Science & Engineering',
            institution: item.institution || 'KAHE',
            referred_by: item.referred_by || 'P. Malathi',
            referred_by_role: item.referred_by_role || 'Senior Telecaller',
            referral_date: item.referral_date || moment().format('YYYY-MM-DD'),
            referral_reason: item.referral_reason || item.notes || 'Academic guidance & scholarship review requested.',
            priority: item.priority || 'Normal',
            status: item.status || 'Pending',
            tab: item.tab || state.activeTab,
            marks: item.marks || '570 / 600 (95.0%)',
            campus: item.campus || 'KAHE - Main Campus, Eachanari',
            current_stage: item.current_stage || item.status || 'Counselling',
            notes: item.notes || '',
            session_outcome: item.session_outcome || null,
            allData: item,
        }));

        setState({ queueItems: data, allData: res });
    };

    // ── 3. Fetch Counselling Queue List API Function ──────────────────────────
    const getQueueList = async (page = 1) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            body.page = page;

            const res: any = await (Models.contact as any).counsellor.queue(body).catch(() => null);
            console.log('counsellor queue response:', res);
            if (res) {
                tableData(res);
                setState({
                    loading: false,
                    totalRecords: res?.total ?? (res?.results?.length || 0),
                    counts: res?.counts || state.counts,
                    currentPage: page,
                });
            } else {
                setState({ loading: false });
            }
        } catch (error) {
            setState({ loading: false });
            console.error('getQueueList error:', error);
        }
    };

    // ── 4. Finalize Counselling Review API Function ───────────────────────────
    const finalizeReviewAPI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.selectedCandidate) return;

        const errors: Record<string, string> = {};
        if (!state.reviewOutcome) {
            errors.reviewOutcome = 'Please select a session outcome decision';
        }
        if (!state.consultationNotes || state.consultationNotes.trim().length < 5) {
            errors.consultationNotes = 'Senior counsellor consultation notes are required (min 5 chars)';
        }

        if (Object.keys(errors).length > 0) {
            setState({ reviewErrors: errors });
            Failure('Please provide valid consultation notes and session outcome');
            return;
        }

        try {
            setState({ reviewSubmitting: true });
            const candidateId = state.selectedCandidate.enquiry_id || state.selectedCandidate.id;
            const payload = {
                session_outcome: state.reviewOutcome,
                stage: state.admissionStage,
                notes: state.consultationNotes.trim(),
                schedule_followup: state.scheduleFollowupActive,
            };

            const res: any = await (Models.contact as any).counsellor.update_session(candidateId, payload);
            Success(res?.message || 'Counselling session finalized successfully!');
            setState({
                isReviewModalOpen: false,
                reviewSubmitting: false,
                selectedCandidate: null,
                reviewErrors: {},
            });
            getQueueList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to finalize counselling session');
            setState({ reviewSubmitting: false });
        }
    };

    // ── 5. Request Assignment to Telecaller API Function ───────────────────────
    const requestAssignmentAPI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.transferCandidate) return;

        const errors: Record<string, string> = {};
        if (!state.transferReason.trim()) {
            errors.transferReason = 'Reason for assignment request is required';
        }

        if (Object.keys(errors).length > 0) {
            setState({ transferErrors: errors });
            Failure('Please enter a reason for telecaller assignment');
            return;
        }

        try {
            setState({ transferSubmitting: true });
            const candidateId = state.transferCandidate.enquiry_id || state.transferCandidate.id;
            const payload = {
                telecaller: state.selectedTelecaller,
                reason: state.transferReason.trim(),
            };

            const res: any = await (Models.contact as any).counsellor.request_assignment(candidateId, payload);
            Success(res?.message || 'Request submitted to central Admin queue for telecaller assignment!');
            setState({
                isTransferModalOpen: false,
                transferSubmitting: false,
                transferCandidate: null,
                transferErrors: {},
            });
            getQueueList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to submit telecaller assignment request');
            setState({ transferSubmitting: false });
        }
    };

    // ── 6. Schedule Follow-up Consultation API Function ───────────────────────
    const scheduleFollowupAPI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.scheduleCandidate) return;

        const errors: Record<string, string> = {};
        if (!state.scheduleDate) errors.scheduleDate = 'Follow-up date is required';
        if (!state.scheduleTime) errors.scheduleTime = 'Scheduled time is required';
        if (!state.scheduleAgenda.trim()) errors.scheduleAgenda = 'Agenda / consultation notes are required';

        if (Object.keys(errors).length > 0) {
            setState({ scheduleErrors: errors });
            Failure('Please fill in date, time, and agenda notes');
            return;
        }

        try {
            setState({ scheduleSubmitting: true });
            const candidateId = state.scheduleCandidate.enquiry_id || state.scheduleCandidate.id;
            const payload = {
                followup_date: state.scheduleDate,
                followup_time: state.scheduleTime,
                agenda_notes: state.scheduleAgenda.trim(),
                student_name: state.scheduleCandidate.student_name,
                target_programme: state.scheduleCandidate.target_programme,
            };

            const res: any = await (Models.contact as any).counsellor.schedule_followup(candidateId, payload);
            Success(res?.message || 'Follow-up consultation confirmed & added to campus visits!');
            setState({
                isScheduleModalOpen: false,
                scheduleSubmitting: false,
                scheduleCandidate: null,
                scheduleErrors: {},
            });
            getQueueList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to schedule follow-up');
            setState({ scheduleSubmitting: false });
        }
    };

    // ── 7. Add Contact Direct API Function ───────────────────────────────────
    const addContactAPI = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};
        if (!state.addStudentName.trim()) errors.addStudentName = 'Student Name is required';
        if (!state.addMobile.trim()) {
            errors.addMobile = 'Mobile number is required';
        } else if (!/^\+?[0-9\s-]{10,14}$/.test(state.addMobile.trim())) {
            errors.addMobile = 'Enter a valid 10-digit mobile number';
        }

        if (Object.keys(errors).length > 0) {
            setState({ addErrors: errors });
            Failure('Please enter student name and a valid mobile number');
            return;
        }

        try {
            setState({ addSubmitting: true });
            const payload = {
                student_name: state.addStudentName.trim(),
                mobile: state.addMobile.trim(),
                city: state.addCity || 'Coimbatore',
                qualification: state.addQualification || '12th Standard',
                target_programme: state.addTargetProgramme || 'Computer Science & Engineering',
                priority: state.addImmediateConsultation ? 'Urgent' : state.addPriority,
                notes: state.addNotes.trim(),
                current_stage: 'Counselling',
            };

            const res: any = await (Models.contact as any).counsellor.add_contact(payload);
            Success(res?.message || 'Direct enquiry added to counselling queue!');
            setState({
                isAddModalOpen: false,
                addSubmitting: false,
                addStudentName: '',
                addMobile: '',
                addCity: 'Coimbatore',
                addQualification: '12th Standard',
                addTargetProgramme: 'Computer Science & Engineering',
                addPriority: 'Normal',
                addNotes: '',
                addImmediateConsultation: false,
                addErrors: {},
            });
            getQueueList(state.currentPage);
        } catch (error: any) {
            Failure(error?.message || 'Failed to add direct contact');
            setState({ addSubmitting: false });
        }
    };

    // ── 8. WhatsApp Direct Action ────────────────────────────────────────────
    const whatsappAction = (item: QueueItem) => {
        const cleanNumber = String(item.mobile || '').replace(/[^0-9]/g, '');
        if (cleanNumber) {
            const message = encodeURIComponent(
                `Hello ${item.student_name}, greetings from Karpagam Academy of Higher Education (KAHE). We are following up regarding your academic counselling for ${item.target_programme}.`
            );
            window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
        } else {
            Failure('No valid mobile number found for WhatsApp');
        }
    };

    // ── 9. Open Student Details Profile Handler (Async Details Fetch) ────────
    const handleOpenFullProfile = async (item: QueueItem | null) => {
        if (!item) return;
        const mappedContact: AdmissionContact = {
            id: item.enquiry_id || item.id,
            enquiry_id: item.enquiry_id || item.id,
            student_name: item.student_name,
            phone_number: item.mobile || '+91 98421 98210',
            parent_phone: '+91 98420 11990',
            city: item.city || 'Coimbatore',
            area: 'Eachanari',
            qualification: item.qualification || '12th Standard',
            target_course: item.target_programme || 'Computer Science & Engineering',
            institution: item.institution || 'KAHE',
            assigned_to: 'Dr. K. Swaminathan',
            assigned_role: 'Senior Counsellor',
            status: item.current_stage || item.status || 'Counselling',
        };

        setState({
            viewingContact: mappedContact,
            loadingDetails: true,
            detailsActiveTab: 'personal',
        });

        const contactId = item.enquiry_id || item.id;
        if (contactId) {
            try {
                const res: any = await Models.contact.details(contactId);
                if (res) {
                    setState({
                        viewingContact: { ...mappedContact, ...res },
                        loadingDetails: false,
                    });
                } else {
                    setState({ loadingDetails: false });
                }
            } catch (err) {
                console.error('Details fetch error in queue:', err);
                setState({ loadingDetails: false });
            }
        } else {
            setState({ loadingDetails: false });
        }
    };

    const handleCloseViewContact = () => {
        setState({ viewingContact: null });
    };

    const handleStudentWhatsApp = (phoneNum?: string) => {
        const cleanPhone = String(phoneNum || state.viewingContact?.phone_number || '').replace(
            /[^0-9]/g,
            ''
        );
        if (cleanPhone) {
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else {
            Failure('No valid mobile number found for WhatsApp');
        }
    };

    const handleEditContact = (id: string) => {
        setState({ viewingContact: null });
        router.push(`/contacts/edit_contact/${id}`);
    };

    // ── 10. Open Action Handlers ─────────────────────────────────────────────
    const openReviewModal = (item: QueueItem) => {
        setState({
            selectedCandidate: item,
            isReviewModalOpen: true,
            reviewOutcome: item.session_outcome || 'Campus Visit Scheduled',
            admissionStage: item.current_stage || 'Applied',
            consultationNotes: item.notes || '',
            scheduleFollowupActive: false,
            reviewErrors: {},
        });
    };

    const openTransferModal = (item: QueueItem) => {
        setState({
            transferCandidate: item,
            isTransferModalOpen: true,
            selectedTelecaller: 'P. Malathi',
            transferReason: '',
            transferErrors: {},
        });
    };

    const openScheduleModal = (item: QueueItem) => {
        setState({
            scheduleCandidate: item,
            isScheduleModalOpen: true,
            scheduleDate: moment().add(1, 'day').format('YYYY-MM-DD'),
            scheduleTime: '11:00 AM',
            scheduleAgenda: item.referral_reason || '',
            scheduleErrors: {},
        });
    };

    // =========================================================================
    // DATATABLE COLUMNS DEFINITIONS PER TAB (SELF-CONTAINED)
    // =========================================================================

    // 1. Pending Tab Columns (New referrals awaiting counselling)
    const pendingColumns = [
        {
            accessor: 'student_name',
            title: 'Student Name',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenFullProfile(row)}
                            className="font-semibold text-sm text-gray-900 dark:text-white hover:text-[#39854a] transition text-left cursor-pointer"
                        >
                            {row.student_name}
                        </button>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {row.enquiry_id}
                        </span>
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {row.mobile} ·
                         {/* {row.city} ·  */}
                         {row.qualification}
                    </div>
                </div>
            ),
        },
        {
            accessor: 'target_programme',
            title: 'Target Programme',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 block">
                        {row.target_programme}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                        {row.institution}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'referred_by',
            title: 'Referred By',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold  text-gray-800 dark:text-gray-200 block">
                        {row.referred_by}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                        {row.referral_date}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'referral_reason',
            title: 'Referral Reason',
            width: 200,
            render: (row: QueueItem) => (
                <Tippy content={row.referral_reason || 'No referral reason provided'}>
                    <div className="max-w-[185px] cursor-pointer">
                        <p className="truncate text-xs text-gray-700 dark:text-gray-300 font-medium hover:text-[#39854a] transition">
                            {row.referral_reason || 'No referral reason provided'}
                        </p>
                    </div>
                </Tippy>
            ),
        },
        {
            accessor: 'priority',
            title: 'Priority',
            sortable: true,
            render: (row: QueueItem) => (
                <div>
                    {row.priority === 'High' && (
                        <span className="badge-soft-warning font-bold">
                            High
                        </span>
                    )}
                    {row.priority === 'Urgent' && (
                        <span className="badge-soft-danger font-bold">
                            Urgent
                        </span>
                    )}
                    {row.priority !== 'High' && row.priority !== 'Urgent' && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            {row.priority || 'Normal'}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: (row: QueueItem) => (
                <div>
                    {row.status === 'Pending' && (
                        <span className="badge-soft-warning font-bold">
                            Pending
                        </span>
                    )}
                    {row.status === 'In Progress' && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            In Progress
                        </span>
                    )}
                    {row.status === 'Completed' && (
                        <span className="badge-soft-success font-bold">
                            Completed
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-right',
            render: (row: QueueItem) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Action 1: WhatsApp */}
                    <button
                        type="button"
                        title="Chat on WhatsApp"
                        onClick={() => whatsappAction(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 2: Schedule Follow-up (Clock) */}
                    <button
                        type="button"
                        title="Schedule Consultation Follow-up"
                        onClick={() => openScheduleModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                    >
                        <Clock className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 3: Request Assignment to Telecaller (Transfer) */}
                    <button
                        type="button"
                        title="Request Assignment to Telecaller"
                        onClick={() => openTransferModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition active:scale-95 cursor-pointer"
                    >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 4: Counselling -> Solid Green Button */}
                    <button
                        type="button"
                        onClick={() => openReviewModal(row)}
                        className="btn-action-solid !py-1 !px-2.5 !text-[11px] !rounded-lg flex items-center gap-1 active:scale-95 cursor-pointer font-bold"
                    >
                        <span>Counselling</span>
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            ),
        },
    ];

    // 2. In Progress Tab Columns (Candidates undergoing consultations)
    const inProgressColumns = [
        {
            accessor: 'student_name',
            title: 'Student Name',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenFullProfile(row)}
                            className="font-semibold text-sm text-gray-900 dark:text-white hover:text-[#39854a] transition text-left cursor-pointer"
                        >
                            {row.student_name}
                        </button>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {row.enquiry_id}
                        </span>
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {row.mobile} · 
                        {/* {row.city} ·  */}
                        {row.qualification}
                    </div>
                </div>
            ),
        },
        {
            accessor: 'target_programme',
            title: 'Target Programme',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 block">
                        {row.target_programme}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                        {row.institution}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'referred_by',
            title: 'Referred By',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold  text-gray-800 dark:text-gray-200 block">
                        {row.referred_by}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                        {row.referral_date}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'current_stage',
            title: 'Current Stage',
            sortable: true,
            render: (row: QueueItem) => (
                <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                    {row.current_stage || row.session_outcome || 'In Consultation'}
                </span>
            ),
        },
        {
            accessor: 'referral_reason',
            title: 'Referral Reason',
            width: 200,
            render: (row: QueueItem) => (
                <Tippy content={row.referral_reason || 'No referral reason provided'}>
                    <div className="max-w-[185px] cursor-pointer">
                        <p className="truncate text-xs text-gray-700 dark:text-gray-300 font-medium hover:text-[#39854a] transition">
                            {row.referral_reason || 'No referral reason provided'}
                        </p>
                    </div>
                </Tippy>
            ),
        },
        {
            accessor: 'priority',
            title: 'Priority',
            sortable: true,
            render: (row: QueueItem) => (
                <div>
                    {row.priority === 'High' && (
                        <span className="badge-soft-warning font-bold">
                            High
                        </span>
                    )}
                    {row.priority === 'Urgent' && (
                        <span className="badge-soft-danger font-bold">
                            Urgent
                        </span>
                    )}
                    {row.priority !== 'High' && row.priority !== 'Urgent' && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            {row.priority || 'Normal'}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: (row: QueueItem) => (
                <div>
                    {row.status === 'Pending' && (
                        <span className="badge-soft-warning font-bold">
                            Pending
                        </span>
                    )}
                    {row.status === 'In Progress' && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            In Progress
                        </span>
                    )}
                    {row.status === 'Completed' && (
                        <span className="badge-soft-success font-bold">
                            Completed
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-right',
            render: (row: QueueItem) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Action 1: WhatsApp */}
                    <button
                        type="button"
                        title="Chat on WhatsApp"
                        onClick={() => whatsappAction(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 2: Schedule Follow-up (Clock) */}
                    <button
                        type="button"
                        title="Schedule Consultation Follow-up"
                        onClick={() => openScheduleModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                    >
                        <Clock className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 3: Request Assignment to Telecaller (Transfer) */}
                    <button
                        type="button"
                        title="Request Assignment to Telecaller"
                        onClick={() => openTransferModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition active:scale-95 cursor-pointer"
                    >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 4: Counselling -> Solid Green Button */}
                    <button
                        type="button"
                        onClick={() => openReviewModal(row)}
                        className="btn-action-solid !py-1 !px-2.5 !text-[11px] !rounded-lg flex items-center gap-1 active:scale-95 cursor-pointer font-bold"
                    >
                        <span>Counselling</span>
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            ),
        },
    ];

    // 3. Completed Tab Columns (Admitted / Resolved candidates)
    const completedColumns = [
        {
            accessor: 'student_name',
            title: 'Student Name',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenFullProfile(row)}
                            className="font-semibold text-sm text-gray-900 dark:text-white hover:text-[#39854a] transition text-left cursor-pointer"
                        >
                            {row.student_name}
                        </button>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {row.enquiry_id}
                        </span>
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {row.mobile} ·
                         {/* {row.city} ·  */}
                         {row.qualification}
                    </div>
                </div>
            ),
        },
        {
            accessor: 'target_programme',
            title: 'Target Programme',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold  text-gray-900 dark:text-gray-100 block">
                        {row.target_programme}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                        {row.institution}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'referred_by',
            title: 'Referred By',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold  text-gray-800 dark:text-gray-200 block">
                        {row.referred_by}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                        {row.referral_date}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'session_outcome',
            title: 'Session Outcome',
            sortable: true,
            render: (row: QueueItem) => (
                <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-[#39854a] border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300">
                    {row.session_outcome || 'Spot Provisional Admission Offered'}
                </span>
            ),
        },
        {
            accessor: 'referral_reason',
            title: 'Referral Reason',
            width: 200,
            render: (row: QueueItem) => (
                <Tippy content={row.referral_reason || 'No referral reason provided'}>
                    <div className="max-w-[185px] cursor-pointer">
                        <p className="truncate text-xs text-gray-700 dark:text-gray-300 font-medium hover:text-[#39854a] transition">
                            {row.referral_reason || 'No referral reason provided'}
                        </p>
                    </div>
                </Tippy>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: (row: QueueItem) => (
                <div>
                    {row.status === 'Completed' && (
                        <span className="badge-soft-success font-bold">
                            Completed
                        </span>
                    )}
                    {row.status !== 'Completed' && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            {row.status}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-right',
            render: (row: QueueItem) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Action 1: WhatsApp */}
                    <button
                        type="button"
                        title="Chat on WhatsApp"
                        onClick={() => whatsappAction(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 2: Schedule Follow-up (Clock) */}
                    <button
                        type="button"
                        title="Schedule Consultation Follow-up"
                        onClick={() => openScheduleModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                    >
                        <Clock className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 3: Request Assignment to Telecaller (Transfer) */}
                    <button
                        type="button"
                        title="Request Assignment to Telecaller"
                        onClick={() => openTransferModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition active:scale-95 cursor-pointer"
                    >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 4: Review -> Solid Green Button */}
                    <button
                        type="button"
                        onClick={() => openReviewModal(row)}
                        className="btn-action-solid !py-1 !px-2.5 !text-[11px] !rounded-lg flex items-center gap-1 active:scale-95 cursor-pointer font-bold"
                    >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            ),
        },
    ];

    // 4. Direct Enquiries Tab Columns (Walk-in candidates)
    const directColumns = [
        {
            accessor: 'student_name',
            title: 'Student Name',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleOpenFullProfile(row)}
                            className="font-semibold text-sm text-gray-900 dark:text-white hover:text-[#39854a] transition text-left cursor-pointer"
                        >
                            {row.student_name}
                        </button>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {row.enquiry_id}
                        </span>
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500">
                        {row.mobile} ·
                         {/* {row.city} ·  */}
                         {row.qualification}
                    </div>
                </div>
            ),
        },
        {
            accessor: 'target_programme',
            title: 'Target Programme',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold  text-gray-900 dark:text-gray-100 block">
                        {row.target_programme}
                    </span>
                    <span className="text-[11px] text-gray-400 font-semibold">
                        {row.institution}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'referred_by',
            title: 'Enquiry Source',
            sortable: true,
            render: (row: QueueItem) => (
                <div className="space-y-0.5">
                    <span className="font-semibold  text-gray-800 dark:text-gray-200 block">
                        {row.referred_by || 'Direct Walk-in'}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                        {row.referral_date}
                    </span>
                </div>
            ),
        },
        {
            accessor: 'current_stage',
            title: 'Current Stage',
            sortable: true,
            render: (row: QueueItem) => (
                <span className="inline-block px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900">
                    {row.current_stage || 'Direct Enquiry'}
                </span>
            ),
        },
        {
            accessor: 'referral_reason',
            title: 'Referral Reason',
            width: 200,
            render: (row: QueueItem) => (
                <Tippy content={row.referral_reason || row.notes || 'Direct enquiry - no referral reason recorded'}>
                    <div className="max-w-[185px] cursor-pointer">
                        <p className="truncate text-xs text-gray-700 dark:text-gray-300 font-medium hover:text-[#39854a] transition">
                            {row.referral_reason || row.notes || 'Direct enquiry - no referral reason'}
                        </p>
                    </div>
                </Tippy>
            ),
        },
        {
            accessor: 'priority',
            title: 'Priority',
            sortable: true,
            render: (row: QueueItem) => (
                <div>
                    {row.priority === 'High' && (
                        <span className="badge-soft-warning font-bold">
                            High
                        </span>
                    )}
                    {row.priority === 'Urgent' && (
                        <span className="badge-soft-danger font-bold">
                            Urgent
                        </span>
                    )}
                    {row.priority !== 'High' && row.priority !== 'Urgent' && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            {row.priority || 'Normal'}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: (row: QueueItem) => (
                <div>
                    {row.status === 'Pending' && (
                        <span className="badge-soft-warning font-bold">
                            Pending
                        </span>
                    )}
                    {row.status === 'In Progress' && (
                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            In Progress
                        </span>
                    )}
                    {row.status === 'Completed' && (
                        <span className="badge-soft-success font-bold">
                            Completed
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-right',
            render: (row: QueueItem) => (
                <div className="flex items-center justify-end gap-1 flex-wrap">
                    {/* Action 1: WhatsApp */}
                    <button
                        type="button"
                        title="Chat on WhatsApp"
                        onClick={() => whatsappAction(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 2: Schedule Follow-up (Clock) */}
                    <button
                        type="button"
                        title="Schedule Consultation Follow-up"
                        onClick={() => openScheduleModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-blue-50 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-100 transition active:scale-95 cursor-pointer"
                    >
                        <Clock className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 3: Request Assignment to Telecaller (Transfer) */}
                    <button
                        type="button"
                        title="Request Assignment to Telecaller"
                        onClick={() => openTransferModal(row)}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-100 transition active:scale-95 cursor-pointer"
                    >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Action 4: Counselling -> Solid Green Button */}
                    <button
                        type="button"
                        onClick={() => openReviewModal(row)}
                        className="btn-action-solid !py-1 !px-2.5 !text-[11px] !rounded-lg flex items-center gap-1 active:scale-95 cursor-pointer font-bold"
                    >
                        <span>Counselling</span>
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            ),
        },
    ];

    // Dynamic Columns Selector based on Active Tab
    const getColumns = () => {
        switch (state.activeTab) {
            case 'pending':
                return pendingColumns;
            case 'in_progress':
                return inProgressColumns;
            case 'completed':
                return completedColumns;
            case 'direct':
                return directColumns;
            default:
                return pendingColumns;
        }
    };

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    const currentPriorityOption =
        PRIORITY_FILTER_OPTIONS.find((o) => o.value === state.priorityFilter) || PRIORITY_FILTER_OPTIONS[0];

    // =========================================================================
    // MAIN PAGE DOM (RETURN)
    // =========================================================================
    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060818] p-4 lg:p-6 space-y-5">
            <Head>
                <title>Senior Academic Counselling Queue · KAHE Admissions</title>
            </Head>

            {/* ============================================================== */}
            {/* 1. PAGE HEADER */}
            {/* ============================================================== */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        Senior Academic Counselling Queue
                    </h1>
                    <p className="page-subtitle mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Conduct high-level academic consultations, verify eligibility cut-offs, and authorize spot provisional admissions.
                    </p>
                </div>

                {/* Header Action Buttons */}
                {/* <div className="flex items-center gap-3">
                    <Link
                        href="/counsellor/bulk_import"
                        className="btn-action-outline cursor-pointer"
                    >
                        <UploadCloud className="w-4 h-4 text-[#39854a]" />
                        <span>Import Contacts</span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setState({ isAddModalOpen: true })}
                        className="btn-action-solid cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Add Contact</span>
                    </button>
                </div> */}
            </div>

            {/* ============================================================== */}
            {/* 2. FILTER TABS & SEARCH BAR (Compact and aligned) */}
            {/* ============================================================== */}
            <div className="overview-panel space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center gap-2.5 lg:gap-3">
                    {/* Small Compact Filter Tabs */}
                    <div className="inline-flex shrink-0 self-start lg:self-auto rounded-xl bg-gray-100 p-0.5 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 overflow-x-auto max-w-full">
                        {[
                            { id: 'pending' as TabType, label: 'Pending Enquiries', count: state.counts.pending },
                            { id: 'in_progress' as TabType, label: 'In Progress Enquiries', count: state.counts.in_progress },
                            { id: 'completed' as TabType, label: 'Completed Enquiries', count: state.counts.completed },
                            { id: 'direct' as TabType, label: 'Direct Enquiries', count: state.counts.direct },
                        ].map((tab) => {
                            const isActive = state.activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setState({ activeTab: tab.id, currentPage: 1 })}
                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                                        isActive
                                            ? 'bg-[#39854a] text-white shadow-xs font-bold'
                                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Big Expanded Search Input */}
                    <div className="relative flex-1 min-w-[240px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={state.search}
                            onChange={(e) => setState({ search: e.target.value, currentPage: 1 })}
                            placeholder="Search student name, programme, city, enquiry ID..."
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

                    {/* Priority Filter via CustomSelect */}
                    <div className="flex items-center gap-2 self-start lg:self-auto shrink-0">
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                            Priority:
                        </span>
                        <div className="w-40">
                            <CustomSelect
                                options={PRIORITY_FILTER_OPTIONS}
                                value={currentPriorityOption}
                                onChange={(opt: any) =>
                                    setState({ priorityFilter: opt?.value || 'all', currentPage: 1 })
                                }
                                isSearchable={false}
                                placeholder="Select priority"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* 3. COUNSELLING QUEUE DATATABLE (Mantine DataTable) */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                <DataTable
                    highlightOnHover
                    className="table-hover whitespace-nowrap"
                    records={state.queueItems}
                    fetching={state.loading}
                    minHeight={260}
                    sortStatus={state.sortStatus}
                    onSortStatusChange={(status) => setState({ sortStatus: status, currentPage: 1 })}
                    noRecordsText="No enquiries found in this queue tab."
                    columns={getColumns()}
                    customLoader={
                        <div className="flex flex-col items-center justify-center gap-2 py-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                            <span className="text-xs font-bold text-gray-500">Loading academic counselling queue...</span>
                        </div>
                    }
                    emptyState={
                        <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500/60 mb-2" />
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                No enquiries found
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                No candidate records match the active filter criteria.
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
                            entries
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
            {/* 4. MODALS (Portaled inside the same page) */}
            {/* ============================================================== */}

            {/* Modal 1: Counselling Review Modal */}
            <CounsellingReviewModal
                isOpen={state.isReviewModalOpen}
                candidate={state.selectedCandidate}
                outcome={state.reviewOutcome}
                stage={state.admissionStage}
                notes={state.consultationNotes}
                scheduleFollowup={state.scheduleFollowupActive}
                isSubmitting={state.reviewSubmitting}
                errors={state.reviewErrors}
                onOutcomeChange={(val) => setState({ reviewOutcome: val })}
                onStageChange={(val) => setState({ admissionStage: val })}
                onNotesChange={(val) => setState({ consultationNotes: val })}
                onScheduleFollowupChange={(checked) => setState({ scheduleFollowupActive: checked })}
                onOpenFullProfile={() => handleOpenFullProfile(state.selectedCandidate)}
                onClose={() => setState({ isReviewModalOpen: false, selectedCandidate: null })}
                onSubmit={finalizeReviewAPI}
            />

            {/* Modal 2: Request Assignment to Telecaller Modal */}
            <RequestAssignmentModal
                isOpen={state.isTransferModalOpen}
                candidate={state.transferCandidate}
                selectedTelecaller={state.selectedTelecaller}
                reason={state.transferReason}
                isSubmitting={state.transferSubmitting}
                errors={state.transferErrors}
                onTelecallerChange={(val) => setState({ selectedTelecaller: val })}
                onReasonChange={(val) => setState({ transferReason: val })}
                onClose={() => setState({ isTransferModalOpen: false, transferCandidate: null })}
                onSubmit={requestAssignmentAPI}
            />

            {/* Modal 3: Schedule Consultation Follow-up Modal */}
            <ScheduleFollowupModal
                isOpen={state.isScheduleModalOpen}
                candidate={state.scheduleCandidate}
                date={state.scheduleDate}
                time={state.scheduleTime}
                agenda={state.scheduleAgenda}
                isSubmitting={state.scheduleSubmitting}
                errors={state.scheduleErrors}
                onDateChange={(val) => setState({ scheduleDate: val })}
                onTimeChange={(val) => setState({ scheduleTime: val })}
                onAgendaChange={(val) => setState({ scheduleAgenda: val })}
                onClose={() => setState({ isScheduleModalOpen: false, scheduleCandidate: null })}
                onSubmit={scheduleFollowupAPI}
            />

            {/* Modal 4: Add Contact Modal */}
            <AddContactModal
                isOpen={state.isAddModalOpen}
                studentName={state.addStudentName}
                mobile={state.addMobile}
                city={state.addCity}
                qualification={state.addQualification}
                targetProgramme={state.addTargetProgramme}
                priority={state.addPriority}
                notes={state.addNotes}
                immediateConsultation={state.addImmediateConsultation}
                isSubmitting={state.addSubmitting}
                errors={state.addErrors}
                onStudentNameChange={(val) => setState({ addStudentName: val })}
                onMobileChange={(val) => setState({ addMobile: val })}
                onCityChange={(val) => setState({ addCity: val })}
                onQualificationChange={(val) => setState({ addQualification: val })}
                onTargetProgrammeChange={(val) => setState({ addTargetProgramme: val })}
                onPriorityChange={(val) => setState({ addPriority: val })}
                onNotesChange={(val) => setState({ addNotes: val })}
                onImmediateConsultationChange={(checked) => setState({ addImmediateConsultation: checked })}
                onClose={() => setState({ isAddModalOpen: false })}
                onSubmit={addContactAPI}
            />

            {/* Modal 5: Student Details Modal (DOM Only) */}
            <StudentDetailsModal
                contact={state.viewingContact}
                loadingDetails={state.loadingDetails}
                activeTab={state.detailsActiveTab}
                onTabChange={(tab) => setState({ detailsActiveTab: tab })}
                onClose={handleCloseViewContact}
                onWhatsApp={handleStudentWhatsApp}
                onEditContact={handleEditContact}
            />
        </div>
    );
};

export default CounsellorQueuePage;

// =============================================================================
// MODAL COMPONENTS (Written inside the page itself, portaled to #modal-portal)
// =============================================================================

// ── 1. Counselling Review Modal ──────────────────────────────────────────────
interface CounsellingReviewModalProps {
    isOpen: boolean;
    candidate: QueueItem | null;
    outcome: string;
    stage: string;
    notes: string;
    scheduleFollowup: boolean;
    isSubmitting: boolean;
    errors: Record<string, string>;
    onOutcomeChange: (val: string) => void;
    onStageChange: (val: string) => void;
    onNotesChange: (val: string) => void;
    onScheduleFollowupChange: (checked: boolean) => void;
    onOpenFullProfile: () => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const CounsellingReviewModal: React.FC<CounsellingReviewModalProps> = ({
    isOpen,
    candidate,
    outcome,
    stage,
    notes,
    scheduleFollowup,
    isSubmitting,
    errors,
    onOutcomeChange,
    onStageChange,
    onNotesChange,
    onScheduleFollowupChange,
    onOpenFullProfile,
    onClose,
    onSubmit,
}) => {
    if (!isOpen || !candidate) return null;

    const currentOutcomeOption =
        SESSION_OUTCOME_OPTIONS.find((o) => o.value === outcome) || { value: outcome, label: outcome };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#39854a] dark:bg-emerald-950/40 font-bold text-sm">
                            {candidate.student_name?.slice(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {candidate.student_name}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 font-mono">
                                    {candidate.enquiry_id}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {candidate.city} · Preferred:{' '}
                                <span className="text-[#39854a] font-semibold">
                                    {candidate.target_programme}
                                </span>
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
                    {/* Candidate Details Summary Card */}
                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Qualification</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {candidate.qualification}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Marks / Cutoff</span>
                            <span className="font-semibold text-[#39854a]">
                                {candidate.marks || '570 / 600 (95.0%)'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Target Course</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {candidate.target_programme}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Campus</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {candidate.campus || 'KAHE - Main Campus, Eachanari'}
                            </span>
                        </div>
                    </div>

                    {/* Telecaller Referral Info Banner */}
                    <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                            <span>
                                Referral from Telecaller {candidate.referred_by || 'P. Malathi'}
                            </span>
                            <span className="badge-soft-warning text-[10px]">
                                Priority: {candidate.priority || 'High'}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                            &quot;{candidate.referral_reason}&quot;
                        </p>
                    </div>

                    {/* Field 1: Session Outcome Decision using CustomSelect */}
                    <div>
                        <CustomSelect
                            title="Session Outcome Decision"
                            required
                            options={SESSION_OUTCOME_OPTIONS}
                            value={currentOutcomeOption}
                            onChange={(opt: any) => onOutcomeChange(opt?.value || '')}
                            error={errors.reviewOutcome}
                            placeholder="Select session outcome"
                        />
                    </div>

                    {/* Field 2: Update Candidate Admission Stage Pills */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            Update Candidate Admission Stage
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Counselling', 'Applied', 'Admitted', 'Not Interested'].map((item) => {
                                const isSelected = stage === item;
                                return (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => onStageChange(item)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#39854a] text-white border-[#39854a] shadow-xs'
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {item}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Field 3: Schedule Follow-up CheckboxInput */}
                    <div className="rounded-xl border border-gray-200 p-3.5 dark:border-gray-800">
                        <CheckboxInput
                            checked={scheduleFollowup}
                            onChange={(checked) => onScheduleFollowupChange(checked)}
                            label="Schedule Follow-up Consultation / Campus Tour Confirmation"
                        />
                    </div>

                    {/* Field 4: Senior Counsellor Consultation Notes using TextArea */}
                    <div>
                        <TextArea
                            title="Senior Counsellor Consultation Notes"
                            required
                            rows={3}
                            value={notes}
                            onChange={(val: string) => onNotesChange(val)}
                            placeholder="Enter detailed remarks on eligibility evaluation, fee concession agreed, parent interaction, next steps..."
                            error={errors.consultationNotes}
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onOpenFullProfile}
                            className="text-xs font-bold text-[#39854a] hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Student Profile →</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-action-outline !py-2 !px-4 !text-xs cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-action-solid !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isSubmitting ? 'Finalizing...' : 'Finalize Counselling Session'}</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal') || document.body)
        : null;
};

// ── 2. Request Assignment to Telecaller Modal ────────────────────────────────
interface RequestAssignmentModalProps {
    isOpen: boolean;
    candidate: QueueItem | null;
    selectedTelecaller: string;
    reason: string;
    isSubmitting: boolean;
    errors: Record<string, string>;
    onTelecallerChange: (val: string) => void;
    onReasonChange: (val: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const RequestAssignmentModal: React.FC<RequestAssignmentModalProps> = ({
    isOpen,
    candidate,
    selectedTelecaller,
    reason,
    isSubmitting,
    errors,
    onTelecallerChange,
    onReasonChange,
    onClose,
    onSubmit,
}) => {
    if (!isOpen || !candidate) return null;

    const currentTelecallerOption =
        TELECALLER_OPTIONS.find((o) => o.value === selectedTelecaller) || {
            value: selectedTelecaller,
            label: selectedTelecaller,
        };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                            <ArrowLeftRight className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Request Assignment to Telecaller
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Central Admin Queue Transfer
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
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Send this enquiry to the central Admin queue to assign to a dedicated telecaller for documentation and status updates.
                    </p>

                    {/* Candidate Banner */}
                    <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-purple-950 dark:text-purple-200 flex items-center justify-between">
                            <span>Candidate: {candidate.student_name}</span>
                            <span className="font-mono text-[11px]">{candidate.enquiry_id}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                            Current Desk: Senior Academic Counselling · Target: {candidate.target_programme}
                        </div>
                    </div>

                    {/* Preferred Telecaller using CustomSelect */}
                    <div>
                        <CustomSelect
                            title="Preferred Telecaller (Optional)"
                            options={TELECALLER_OPTIONS}
                            value={currentTelecallerOption}
                            onChange={(opt: any) => onTelecallerChange(opt?.value || 'P. Malathi')}
                            placeholder="Select telecaller"
                        />
                    </div>

                    {/* Reason using TextArea */}
                    <div>
                        <TextArea
                            title="Reason for Assignment Request"
                            required
                            rows={3}
                            value={reason}
                            onChange={(val: string) => onReasonChange(val)}
                            placeholder="Specify reasons for assigning back (e.g., student requires document collection assistance, routine payment follow-up, out of state documentation)..."
                            error={errors.transferReason}
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-action-outline !py-2 !px-4 !text-xs cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Request to Admin'}
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

// ── 3. Schedule Consultation Follow-up Modal ─────────────────────────────────
interface ScheduleFollowupModalProps {
    isOpen: boolean;
    candidate: QueueItem | null;
    date: string;
    time: string;
    agenda: string;
    isSubmitting: boolean;
    errors: Record<string, string>;
    onDateChange: (val: string) => void;
    onTimeChange: (val: string) => void;
    onAgendaChange: (val: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const ScheduleFollowupModal: React.FC<ScheduleFollowupModalProps> = ({
    isOpen,
    candidate,
    date,
    time,
    agenda,
    isSubmitting,
    errors,
    onDateChange,
    onTimeChange,
    onAgendaChange,
    onClose,
    onSubmit,
}) => {
    if (!isOpen || !candidate) return null;

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Schedule Follow-up: {candidate.student_name}
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Consultation & Campus Visit Commitment
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TextInput
                            title="Follow-up Date"
                            required
                            type="date"
                            value={date}
                            onChange={(val: string) => onDateChange(val)}
                            error={errors.scheduleDate}
                        />

                        <TextInput
                            title="Scheduled Time"
                            required
                            placeholder="11:00 AM"
                            value={time}
                            onChange={(val: string) => onTimeChange(val)}
                            error={errors.scheduleTime}
                        />
                    </div>

                    <div>
                        <TextArea
                            title="Agenda / Consultation Notes"
                            required
                            rows={3}
                            value={agenda}
                            onChange={(val: string) => onAgendaChange(val)}
                            placeholder="e.g., Campus visit scheduled with parents at Eachanari admissions cell to verify original certificates..."
                            error={errors.scheduleAgenda}
                        />
                    </div>

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-action-outline !py-2 !px-4 !text-xs cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-action-solid !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isSubmitting ? 'Confirming...' : 'Confirm Follow-up'}</span>
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

// ── 4. Add Contact Modal ─────────────────────────────────────────────────────
interface AddContactModalProps {
    isOpen: boolean;
    studentName: string;
    mobile: string;
    city: string;
    qualification: string;
    targetProgramme: string;
    priority: string;
    notes: string;
    immediateConsultation: boolean;
    isSubmitting: boolean;
    errors: Record<string, string>;
    onStudentNameChange: (val: string) => void;
    onMobileChange: (val: string) => void;
    onCityChange: (val: string) => void;
    onQualificationChange: (val: string) => void;
    onTargetProgrammeChange: (val: string) => void;
    onPriorityChange: (val: string) => void;
    onNotesChange: (val: string) => void;
    onImmediateConsultationChange: (checked: boolean) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({
    isOpen,
    studentName,
    mobile,
    city,
    qualification,
    targetProgramme,
    priority,
    notes,
    immediateConsultation,
    isSubmitting,
    errors,
    onStudentNameChange,
    onMobileChange,
    onCityChange,
    onQualificationChange,
    onTargetProgrammeChange,
    onPriorityChange,
    onNotesChange,
    onImmediateConsultationChange,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    const currentProgrammeOption =
        TARGET_PROGRAMME_OPTIONS.find((o) => o.value === targetProgramme) || {
            value: targetProgramme,
            label: targetProgramme,
        };

    const currentPriorityOption =
        PRIORITY_OPTIONS.find((o) => o.value === priority) || {
            value: priority,
            label: priority,
        };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative my-8 w-full max-w-lg rounded-2xl border border-gray-100 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#39854a] dark:bg-emerald-950/40">
                            <UserPlus className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Add Direct Enquiry
                            </h3>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Senior Academic Counselling Desk
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
                    <TextInput
                        title="Student Full Name"
                        required
                        placeholder="e.g. S. Gokul"
                        value={studentName}
                        onChange={(val: string) => onStudentNameChange(val)}
                        error={errors.addStudentName}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TextInput
                            title="Student Mobile"
                            required
                            placeholder="+91 98421 XXXXX"
                            value={mobile}
                            onChange={(val: string) => onMobileChange(val)}
                            error={errors.addMobile}
                        />

                        <TextInput
                            title="City / Location"
                            placeholder="Coimbatore"
                            value={city}
                            onChange={(val: string) => onCityChange(val)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <CustomSelect
                                title="Target Programme"
                                options={TARGET_PROGRAMME_OPTIONS}
                                value={currentProgrammeOption}
                                onChange={(opt: any) => onTargetProgrammeChange(opt?.value || '')}
                                placeholder="Select target programme"
                            />
                        </div>

                        <div>
                            <CustomSelect
                                title="Priority Level"
                                options={PRIORITY_OPTIONS}
                                value={currentPriorityOption}
                                onChange={(opt: any) => onPriorityChange(opt?.value || 'Normal')}
                                placeholder="Select priority"
                            />
                        </div>
                    </div>

                    {/* Immediate Consultation CheckboxInput */}
                    <div className="rounded-xl border border-gray-200 p-3.5 dark:border-gray-800">
                        <CheckboxInput
                            checked={immediateConsultation}
                            onChange={(checked) => onImmediateConsultationChange(checked)}
                            label="Mark as Urgent for Immediate Counselling Consultation"
                        />
                    </div>

                    <TextArea
                        title="Consultation Remarks"
                        rows={2}
                        placeholder="Direct student interest, cutoff marks, concession requests..."
                        value={notes}
                        onChange={(val: string) => onNotesChange(val)}
                    />

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-action-outline !py-2 !px-4 !text-xs cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-action-solid !py-2 !px-4 !text-xs cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Add to Counselling Queue'}
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

// ── 5. InfoItem Helper Component ─────────────────────────────────────────────
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

// ── 6. Student Details Modal (Full Student Profile - Pure DOM Component) ─────
export interface StudentDetailsModalProps {
    contact: AdmissionContact | any | null;
    loadingDetails: boolean;
    activeTab: StudentDetailsTab;
    onTabChange: (tab: StudentDetailsTab) => void;
    onClose: () => void;
    onLogCall?: (contact: AdmissionContact) => void;
    onWhatsApp?: (phone?: string) => void;
    onEditContact: (id: string) => void;
}

type StudentDetailsTab = 'personal' | 'academic' | 'preferences' | 'assessment';

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
    contact,
    loadingDetails,
    activeTab,
    onTabChange,
    onClose,
    onLogCall,
    onWhatsApp,
    onEditContact,
}) => {
    if (!contact) return null;

    const fullContact = contact;
    const studentName = fullContact.student_name || 'Student';
    const enquiryId = fullContact.enquiry_id || fullContact.id || '—';
    const phone = fullContact.phone_number || fullContact.mobile || '';
    const city = fullContact.city?.city_name || fullContact.city || '—';
    const area = fullContact.area || fullContact.address || '';
    const targetCourse = fullContact.course_specialization?.name || fullContact.target_course || fullContact.target_programme || 'Academic Course';
    const institution =
        fullContact.preferred_institution?.name || fullContact.institution || 'Karpagam Academy of Higher Education';
    const currentStage = fullContact.status?.status || fullContact.status || fullContact.current_stage || 'Counselling';
    const assignedStaff =
        typeof fullContact.assigned_to === 'object' && fullContact.assigned_to
            ? `${fullContact.assigned_to.first_name || ''} ${fullContact.assigned_to.last_name || ''}`.trim() ||
              fullContact.assigned_to.username
            : fullContact.assigned_to || 'Dr. K. Swaminathan';

    const initials = studentName
        .split(' ')
        .map((w: string) => w.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

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
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow-sm transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 cursor-pointer"
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
                            {onLogCall && (
                                <button
                                    type="button"
                                    onClick={() => onLogCall(fullContact)}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#39854a] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2e6d3c] cursor-pointer"
                                >
                                    <Phone className="h-3.5 w-3.5" />
                                    <span>Log Call</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => onWhatsApp?.(phone)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#39854a]/30 bg-white px-3.5 py-2 text-xs font-bold text-[#39854a] shadow-sm transition hover:bg-[#39854a]/10 dark:bg-gray-800 cursor-pointer"
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
                                    onClick={() => onTabChange(tab)}
                                    className={`whitespace-nowrap border-b-2 py-4 text-sm font-bold transition cursor-pointer ${
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
                                            'Senior Counsellor'
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
                            onClick={() => onEditContact(enquiryId)}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#39854a]/40 bg-white px-4 py-2.5 text-xs font-bold text-[#2e743e] shadow-sm transition hover:bg-[#39854a]/10 dark:border-[#39854a]/60 dark:bg-gray-800 dark:text-emerald-400 sm:text-sm cursor-pointer"
                        >
                            <Pencil className="h-4 w-4" />
                            <span>Edit Contact</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:text-sm cursor-pointer"
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
