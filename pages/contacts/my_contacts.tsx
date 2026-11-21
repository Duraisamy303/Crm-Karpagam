import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
import {
    UserPlus,
    CloudUpload,
    Users,
    Search,
    Phone,
    Eye,
    Pencil,
    X,
    RotateCcw,
    MessageCircle,
    Calendar,
    Clock,
    Send,
    GraduationCap,
    BookOpen,
    Building,
    Award,
    Star,
    Mail,
    MapPin,
    Loader2,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import { capitalizeFLetter, Dropdown, Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';
import admissionsData from '@/data/admissionsSampleData.json';
import assignmentData from '@/data/assignmentSampleData.json';

// =============================================================================
// TYPES & DATA INTERFACES
// =============================================================================
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
    [key: string]: any;
}

type StudentDetailsTab = 'personal' | 'academic' | 'preferences' | 'assessment';

// =============================================================================
// CONSTANTS, BADGE MAPS & OPTION HELPERS
// =============================================================================
const toOpt = (v: string) => ({ value: v, label: v });

const statusBadgeClasses: Record<string, string> = {
    contacted: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    interested: 'bg-[#dcfce7] text-[#16a34a] dark:bg-green-950/40 dark:text-green-400',
    applied: 'bg-[#dbeafe] text-[#2563eb] dark:bg-blue-950/40 dark:text-blue-400',
    admitted: 'bg-[#d1fae5] text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-400',
    new: 'bg-[#fef3c7] text-[#d97706] dark:bg-amber-950/40 dark:text-amber-400',
    'not interested': 'bg-[#fee2e2] text-[#dc2626] dark:bg-red-950/40 dark:text-red-400',
    'no response': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    'no answer': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    busy: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
    'call later': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
};

const outcomeActions: Record<string, string> = {
    Interested: 'Save admission interest & follow-up',
    'Call Later': 'Schedule callback at student requested time',
    'No Answer': 'Retry call in afternoon slot',
    Busy: 'Schedule callback in evening slot',
    'Not Interested': 'Archive enquiry & update pipeline',
    'Wrong Number': 'Flag number for verification with master lead list',
    'Counselling Needed': 'Escalate to Senior Academic Counsellor',
};

const CALL_OUTCOMES = [
    'Interested',
    'Call Later',
    'No Answer',
    'Busy',
    'Not Interested',
    'Wrong Number',
    'Counselling Needed',
];

const DEFAULT_ADD_FORM = {
    student_name: '',
    phone_number: '',
    parent_phone: '',
    city: 'Coimbatore',
    area: '',
    qualification: toOpt('12th Standard'),
    target_course: 'Computer Science & Engineering',
    institution: toOpt('KAHE'),
    assigned_to: toOpt('P. Malathi'),
};

const INSTITUTION_OPTIONS = [
    'KAHE',
    'KCE',
    'KIT',
    'Karpagam College of Pharmacy',
    'Karpagam Nursing College',
    'Karpagam Faculty of Medical Sciences',
].map(toOpt);

const TELECALLER_OPTIONS = ['P. Malathi', 'S. Ramesh Kumar', 'K. Kavitha', 'Unassigned'].map(toOpt);
const QUALIFICATION_OPTIONS = ['12th Standard', '10th Standard', 'Diploma', 'Graduate'].map(toOpt);

// =============================================================================
// MAIN COMPONENT: AllContactsPage
// =============================================================================
const AllContactsPage = () => {
    const router = useRouter();

    // ── Unified State ────────────────────────────────────────────────────────
    const [state, setState] = useSetState({
        // Contact View Toggle: 'created' vs 'assigned'
        contactType: 'created' as 'created' | 'assigned',

        // Contacts Table Data & API Loading
        contactList: [] as AdmissionContact[],
        allData: null as any,
        isLoading: false,
        totalRecords: 0,
        count: 0,
        next: null as string | null,
        previous: null as string | null,

        // Filters & Search
        search: '',
        cityFilter: 'All Cities',
        institutionFilter: 'All Institutions',
        qualificationFilter: 'All Qualifications',
        telecallerFilter: 'All Telecallers',
        stageFilter: 'All Stages',

        // Dropdown Lists & Pagination
        cityOptions: [toOpt('All Cities')],
        cityPage: 1,
        cityHasNext: false,
        cityLoading: false,

        institutionOptions: [toOpt('All Institutions')],
        institutionPage: 1,
        institutionHasNext: false,
        institutionLoading: false,

        qualificationOptions: [toOpt('All Qualifications')],
        qualificationPage: 1,
        qualificationHasNext: false,
        qualificationLoading: false,

        telecallerOptions: [toOpt('All Telecallers')],
        telecallerPage: 1,
        telecallerHasNext: false,
        telecallerLoading: false,

        stageOptions: [toOpt('All Stages')],
        stageHasNext: false,

        // Table Pagination & Sorting
        currentPage: 1,
        recordsPerPage: 10,
        sortStatus: { columnAccessor: 'student_name', direction: 'asc' } as DataTableSortStatus,

        // Add Contact Modal State
        isOpenAddContact: false,
        formData: DEFAULT_ADD_FORM,
        formErrors: {} as Record<string, any>,
        submitLoading: false,
        importLoading: false,

        // Student Details Modal State
        viewingContact: null as AdmissionContact | null,
        loadingDetails: false,
        detailsActiveTab: 'personal' as StudentDetailsTab,

        // Log Call Modal State
        callingContact: null as AdmissionContact | null,
        callOutcome: 'Interested',
        callNotes: 'Student enquired about B.Tech CSE fee concessions and AI lab facilities. Parents willing to visit campus this Saturday.',
        callScheduleFollowUp: true,
        callCallbackDate: '2026-05-08',
        callCallbackTime: '11:00 AM',
        callReferCounsellor: true,
        callPriority: 'High' as 'Medium' | 'High' | 'Urgent',
        callReferralReason: 'Student waiting for 12th PCM results. Father enquired about merit scholarship cutoff.',
    });

    const debouncedSearch = useDebounce(state.search, 500);
    const prevDeps = useRef<string | null>(null);
    const isInitialLoad = useRef<boolean>(true);

    const deps = useMemo(
        () => ({
            search: debouncedSearch,
            contactType: state.contactType,
            cityFilter: state.cityFilter,
            institutionFilter: state.institutionFilter,
            qualificationFilter: state.qualificationFilter,
            telecallerFilter: state.telecallerFilter,
            stageFilter: state.stageFilter,
            sortStatus: state.sortStatus,
            recordsPerPage: state.recordsPerPage,
        }),
        [
            debouncedSearch,
            state.contactType,
            state.cityFilter,
            state.institutionFilter,
            state.qualificationFilter,
            state.telecallerFilter,
            state.stageFilter,
            state.sortStatus,
            state.recordsPerPage,
        ]
    );

    useEffect(() => {
        const currentDeps = JSON.stringify(deps);

        if (isInitialLoad.current) {
            getContactList(1);
            isInitialLoad.current = false;
        } else if (prevDeps.current !== currentDeps) {
            getContactList(1);
        }

        prevDeps.current = currentDeps;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deps]);

    // ── Mount: Load Master Dropdowns ─────────────────────────────────────────
    useEffect(() => {
        loadCityList();
        loadInstitutionList();
        loadQualificationList();
        loadTelecallerList();
        loadStageList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Body Scroll Lock for Modals ──────────────────────────────────────────
    useEffect(() => {
        const isAnyModalOpen =
            state.isOpenAddContact || Boolean(state.viewingContact) || Boolean(state.callingContact);
        document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [state.isOpenAddContact, state.viewingContact, state.callingContact]);

    // =========================================================================
    // ALL API FUNCTIONS & FUNCTIONALITY FUNCTIONS (TOGETHER AT TOP BEFORE DOM)
    // =========================================================================

    // ── 1. City Dropdown API Functions ───────────────────────────────────────
    const loadCityList = async () => {
        try {
            setState({ cityLoading: true });
            const res: any = await Models.contact.dropdowns('city');
            const opts = [toOpt('All Cities'), ...Dropdown(res?.results ?? res, 'name')];
            setState({ cityOptions: opts, cityPage: 1, cityHasNext: !!res?.next, cityLoading: false });
        } catch (error) {
            setState({ cityLoading: false });
            console.error('loadCityList error:', error);
        }
    };

    const loadMoreCityList = async () => {
        try {
            setState({ cityLoading: true });
            const res: any = await Models.contact.dropdowns('city');
            const opts = Dropdown(res?.results ?? res, 'name');
            setState({
                cityOptions: [...state.cityOptions, ...opts],
                cityPage: state.cityPage + 1,
                cityHasNext: !!res?.next,
                cityLoading: false,
            });
        } catch (error) {
            setState({ cityLoading: false });
            console.error('loadMoreCityList error:', error);
        }
    };

    // ── 2. Institution Dropdown API Functions ────────────────────────────────
    const loadInstitutionList = async () => {
        try {
            setState({ institutionLoading: true });
            const res: any = await Models.contact.dropdowns('institution');
            const opts = [toOpt('All Institutions'), ...Dropdown(res?.results ?? res, 'name')];
            setState({ institutionOptions: opts, institutionPage: 1, institutionHasNext: !!res?.next, institutionLoading: false });
        } catch (error) {
            setState({ institutionLoading: false });
            console.error('loadInstitutionList error:', error);
        }
    };

    const loadMoreInstitutionList = async () => {
        try {
            setState({ institutionLoading: true });
            const res: any = await Models.contact.dropdowns('institution');
            const opts = Dropdown(res?.results ?? res, 'name');
            setState({
                institutionOptions: [...state.institutionOptions, ...opts],
                institutionPage: state.institutionPage + 1,
                institutionHasNext: !!res?.next,
                institutionLoading: false,
            });
        } catch (error) {
            setState({ institutionLoading: false });
            console.error('loadMoreInstitutionList error:', error);
        }
    };

    // ── 3. Qualification Dropdown API Functions ──────────────────────────────
    const loadQualificationList = async () => {
        try {
            setState({ qualificationLoading: true });
            const res: any = await Models.contact.dropdowns('qualification');
            const opts = [toOpt('All Qualifications'), ...Dropdown(res?.results ?? res, 'name')];
            setState({ qualificationOptions: opts, qualificationPage: 1, qualificationHasNext: !!res?.next, qualificationLoading: false });
        } catch (error) {
            setState({ qualificationLoading: false });
            console.error('loadQualificationList error:', error);
        }
    };

    const loadMoreQualificationList = async () => {
        try {
            setState({ qualificationLoading: true });
            const res: any = await Models.contact.dropdowns('qualification');
            const opts = Dropdown(res?.results ?? res, 'name');
            setState({
                qualificationOptions: [...state.qualificationOptions, ...opts],
                qualificationPage: state.qualificationPage + 1,
                qualificationHasNext: !!res?.next,
                qualificationLoading: false,
            });
        } catch (error) {
            setState({ qualificationLoading: false });
            console.error('loadMoreQualificationList error:', error);
        }
    };

    // ── 4. Telecaller Dropdown API Functions ─────────────────────────────────
    const loadTelecallerList = async () => {
        try {
            setState({ telecallerLoading: true });
            const res: any = await Models.contact.dropdowns('telecaller');
            const opts = [toOpt('All Telecallers'), ...Dropdown(res?.results ?? res, 'name')];
            setState({ telecallerOptions: opts, telecallerPage: 1, telecallerHasNext: !!res?.next, telecallerLoading: false });
        } catch (error) {
            setState({ telecallerLoading: false });
            console.error('loadTelecallerList error:', error);
        }
    };

    const loadMoreTelecallerList = async () => {
        try {
            setState({ telecallerLoading: true });
            const res: any = await Models.contact.dropdowns('telecaller');
            const opts = Dropdown(res?.results ?? res, 'name');
            setState({
                telecallerOptions: [...state.telecallerOptions, ...opts],
                telecallerPage: state.telecallerPage + 1,
                telecallerHasNext: !!res?.next,
                telecallerLoading: false,
            });
        } catch (error) {
            setState({ telecallerLoading: false });
            console.error('loadMoreTelecallerList error:', error);
        }
    };

    // ── 5. Admission Stage Dropdown API Function ─────────────────────────────
    const loadStageList = async () => {
        try {
            const res: any = await Models.contact.status();
            const opts = [
                toOpt('All Stages'),
                ...(res ?? []).map((item: any) => ({
                    value: item?.name ?? item?.id,
                    label: capitalizeFLetter(item?.name ?? item?.label ?? ''),
                })),
            ];
            setState({ stageOptions: opts, stageHasNext: false });
        } catch (error) {
            console.error('loadStageList error:', error);
        }
    };

    
    // ── 6. Filter Body Builder (Same pattern as /leads bodyData) ────────────
    const bodyData = () => {
        const body: any = {};

        // Toggle Filter: Created Contacts vs Assigned Contacts
        body.contact_type = state.contactType;
        body.filter_type = state.contactType;

        if (state.contactType === 'created') {
            body.created_contacts = 'Yes';
            body.my_contacts = 'Yes';
            body.my_leads = 'Yes';
            try {
                const userString = typeof window !== 'undefined' ? localStorage.getItem('crmUser') : null;
                const user = userString ? JSON.parse(userString) : null;
                if (user?.id) {
                    body.created_by = user.id;
                }
            } catch (e) {
                // Ignore parse errors
            }
        } else if (state.contactType === 'assigned') {
            body.assigned_contacts = 'Yes';
            body.assigned_leads = 'Yes';
            try {
                const userString = typeof window !== 'undefined' ? localStorage.getItem('crmUser') : null;
                const user = userString ? JSON.parse(userString) : null;
                if (user?.id) {
                    body.assigned_to_user = user.id;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }

        if (state.search?.trim()) {
            body.search = state.search.trim();
        }

        if (state.stageFilter && state.stageFilter !== 'All Stages') {
            body.status = state.stageFilter;
        }

        if (state.cityFilter && state.cityFilter !== 'All Cities') {
            body.city = state.cityFilter;
        }

        if (state.telecallerFilter && state.telecallerFilter !== 'All Telecallers') {
            body.userId = state.telecallerFilter;
            body.assigned_to = state.telecallerFilter;
        }

        if (state.sortStatus?.columnAccessor && state.sortStatus?.direction) {
            const prefix = state.sortStatus.direction === 'desc' ? '-' : '';
            const columnMapping: Record<string, string> = {
                student_name: 'student_name',
                phone_number: 'phone_number',
                city: 'city__city_name',
                target_course: 'target_course',
                assigned_to: 'assigned_to__first_name',
                status: 'status__status',
            };
            const field = columnMapping[state.sortStatus.columnAccessor] || state.sortStatus.columnAccessor;
            body.ordering = `${prefix}${field}`;
        }

        return body;
    };

    // ── 7. Table Data Mapper (Same pattern as /leads tableData) ──────────────
    const tableData = (res: any) => {
        const rawList = res?.results || res?.data || (Array.isArray(res) ? res : []);
        const data = rawList.map((item: any) => {
            return {
                ...item,
                allData: item,
                student_name: capitalizeFLetter(item?.student_name) || '',
                badge: item?.siblings_count && Number(item?.siblings_count) > 0 ? 'Sibling' : item?.badge || '',
                enquiry_id: item?.enquiry_id || (item?.id ? `ENQ-${String(item?.id).padStart(4, '0')}` : '—'),
                qualification: capitalizeFLetter(item?.education_qualification?.qualification) || capitalizeFLetter(item?.qualification) || '—',
                phone_number: item?.phone_number || '',
                parent_phone: item?.secondary_phone_number || item?.parent_phone || '-',
                parent_name: capitalizeFLetter(item?.parent_name) || capitalizeFLetter(item?.father_name) || capitalizeFLetter(item?.mother_name) || '',
                parent: item?.parent_name ? (item?.secondary_phone_number ? capitalizeFLetter(item?.parent_name) + ' (' + item?.secondary_phone_number + ')' : capitalizeFLetter(item?.parent_name)) : (item?.secondary_phone_number || '-'),
                city: capitalizeFLetter(item?.city?.city_name) || capitalizeFLetter(item?.city) || '—',
                area: capitalizeFLetter(item?.preferred_location) || capitalizeFLetter(item?.address) || capitalizeFLetter(item?.location) || '',
                target_course: capitalizeFLetter(item?.target_course) || capitalizeFLetter(item?.education_qualification?.qualification) || '—',
                institution: capitalizeFLetter(item?.preferred_institution?.name) || capitalizeFLetter(item?.school_name) || capitalizeFLetter(item?.institution) || 'KAHE',
                assigned_to: item?.assigned_to ? (capitalizeFLetter(item?.assigned_to?.first_name) + ' ' + capitalizeFLetter(item?.assigned_to?.last_name)).trim() || capitalizeFLetter(item?.assigned_to?.username) || 'Unassigned' : 'Unassigned',
                assigned_role: item?.assigned_to?.groups?.includes(1) ? 'Admin' : item?.assigned_to?.groups?.includes(2) ? 'Telecaller' : (item?.assigned_role || 'Telecaller'),
                status: capitalizeFLetter(item?.status?.status) || capitalizeFLetter(item?.status) || 'Contacted',
                date: item?.created_at ? moment(item?.created_at).format('DD-MM-YYYY') : '',
                updated_on: item?.updated_at ? moment(item?.updated_at).format('DD-MM-YYYY') : '',
                created_by: item?.created_by ? capitalizeFLetter(item?.created_by?.first_name) + ' ' + capitalizeFLetter(item?.created_by?.last_name) : (item?.created_by || ''),
                updated_by: item?.updated_by ? capitalizeFLetter(item?.updated_by?.first_name) + ' ' + capitalizeFLetter(item?.updated_by?.last_name) : '',
                remark: capitalizeFLetter(item?.remark) || '',
                personal_remarks: capitalizeFLetter(item?.personal_remarks) || '',
            };
        });
        console.log('✌️data --->', data);

        setState({ contactList: data, allData: res });
    };

    // ── 8. Get Contact List API Function (Filtered by Created vs Assigned) ───
    const getContactList = async (page = 1) => {
        try {
            setState({ isLoading: true });
            const body = bodyData();
            let res: any = await Models.contact.list(page, body).catch(() => null);
            if (!res || (!res.results && !res.data && !Array.isArray(res))) {
                res = await Models.lead.list(body, page, null).catch(() => null);
            }
            if (!res || (!res.results && !res.data && !Array.isArray(res))) {
                // Offline fallback based on contactType:
                if (state.contactType === 'created') {
                    const createdList = (assignmentData.unassignedQueue || []).map((item: any, idx: number) => ({
                        id: item.id || `ENQ-2026-CR${idx + 1}`,
                        student_name: item.student_name,
                        enquiry_id: item.enquiry_id || item.id,
                        qualification: '12th Standard',
                        phone_number: item.phone_number,
                        parent_phone: '-',
                        city: item.city,
                        area: item.batch || 'Campus Walk-In',
                        target_course: item.target_course,
                        institution: 'KAHE',
                        assigned_to: 'Unassigned',
                        assigned_role: 'Admissions Desk',
                        status: item.status || 'New',
                        created_by: 'Staff Portal',
                        created_at: item.imported_date || '2026-05-05',
                    }));
                    res = { results: createdList, count: createdList.length };
                } else {
                    const assignedList = (admissionsData as any[]) || [];
                    res = { results: assignedList, count: assignedList.length };
                }
            }
            console.log('contact list API response:', res);
            tableData(res);
            setState({
                isLoading: false,
                count: res?.count ?? (res?.results?.length || 0),
                next: res?.next ?? null,
                previous: res?.previous ?? null,
                currentPage: page,
                totalRecords: res?.count ?? (res?.results?.length || 0),
            });
        } catch (error) {
            setState({ isLoading: false });
            console.error('getContactList error:', error);
        }
    };

    // ── 8b. Toggle Handler for Created vs Assigned Contacts ──────────────────
    const handleToggleContactType = (type: 'created' | 'assigned') => {
        if (state.contactType === type) return;
        setState({ contactType: type, currentPage: 1 });
    };



    // ── 8. View Contact Details API & Action Function ────────────────────────
    const handleViewContact = async (contact: AdmissionContact) => {
        setState({
            viewingContact: contact,
            loadingDetails: true,
            detailsActiveTab: 'personal',
        });

        const contactId = contact.id || contact.enquiry_id;
        if (contactId) {
            try {
                const res: any = await Models.contact.details(contactId);
                if (res) {
                    setState({
                        viewingContact: { ...contact, ...res },
                        loadingDetails: false,
                    });
                } else {
                    setState({ loadingDetails: false });
                }
            } catch (err) {
                console.error('Details fetch error:', err);
                setState({ loadingDetails: false });
            }
        } else {
            setState({ loadingDetails: false });
        }
    };

    const handleCloseViewContact = () => {
        setState({ viewingContact: null });
    };

    // ── 9. WhatsApp Direct Action ────────────────────────────────────────────
    const handleWhatsAppClick = (phoneNum?: string) => {
        const cleanPhone = String(phoneNum || state.viewingContact?.phone_number || '').replace(
            /[^0-9]/g,
            ''
        );
        if (cleanPhone) {
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else {
            Failure('No valid phone number found for WhatsApp');
        }
    };

    // ── 10. Log Call API & Action Functions ──────────────────────────────────
    const handleOpenLogCall = (contact: AdmissionContact) => {
        setState({
            callingContact: contact,
            viewingContact: null,
            callOutcome: 'Interested',
            callNotes:
                'Student enquired about B.Tech CSE fee concessions and AI lab facilities. Parents willing to visit campus this Saturday.',
            callScheduleFollowUp: true,
            callCallbackDate: '2026-05-08',
            callCallbackTime: '11:00 AM',
            callReferCounsellor: true,
            callPriority: 'High',
            callReferralReason:
                'Student waiting for 12th PCM results. Father enquired about merit scholarship cutoff.',
        });
    };

    const handleCloseLogCall = () => {
        setState({ callingContact: null });
    };

    const handleSaveCallSubmit = () => {
        if (!state.callingContact) return;
        const payload = {
            contactId: state.callingContact.id || state.callingContact.enquiry_id,
            outcome: state.callOutcome,
            notes: state.callNotes,
            scheduleFollowUp: state.callScheduleFollowUp,
            callbackDate: state.callScheduleFollowUp ? state.callCallbackDate : null,
            callbackTime: state.callScheduleFollowUp ? state.callCallbackTime : null,
            referCounsellor: state.callReferCounsellor,
            priority: state.callReferCounsellor ? state.callPriority : null,
            referralReason: state.callReferCounsellor ? state.callReferralReason : null,
        };
        console.log('Call update payload:', payload);
        Success('Call update logged & CRM updated successfully');
        setState({ callingContact: null });
    };

    // ── 11. Filter Reset Function ────────────────────────────────────────────
    const handleResetAllFilters = () => {
        setState({
            search: '',
            cityFilter: 'All Cities',
            institutionFilter: 'All Institutions',
            qualificationFilter: 'All Qualifications',
            telecallerFilter: 'All Telecallers',
            stageFilter: 'All Stages',
            currentPage: 1,
        });
        getContactList(1);
    };

    // =========================================================================
    // DATA PROCESSING: FILTERING, SORTING & PAGINATION
    // =========================================================================
    const staticCities = useMemo(
        () => ['All Cities', 'Coimbatore', 'Chennai', 'Tiruppur', 'Salem', 'Erode', 'Madurai'].map(toOpt),
        []
    );
    const staticInstitutions = useMemo(
        () =>
            [
                'All Institutions',
                'KAHE',
                'KCE',
                'KIT',
                'Karpagam College of Pharmacy',
                'Karpagam Nursing College',
                'Karpagam Faculty of Medical Sciences',
            ].map(toOpt),
        []
    );
    const staticQualifications = useMemo(
        () => ['All Qualifications', '12th Standard', '10th Standard', 'B.Tech / B.E', 'Diploma', 'Graduate'].map(toOpt),
        []
    );
    const staticTelecallers = useMemo(
        () => ['All Telecallers', 'Unassigned'].map(toOpt),
        []
    );
    const staticStages = useMemo(
        () => ['All Stages', 'No Response', 'Contacted', 'Interested', 'Applied', 'Admitted', 'New', 'Not Interested'].map(toOpt),
        []
    );

    const citySelectOptions = state.cityOptions.length > 1 ? state.cityOptions : staticCities;
    const institutionSelectOptions =
        state.institutionOptions.length > 1 ? state.institutionOptions : staticInstitutions;
    const qualificationSelectOptions =
        state.qualificationOptions.length > 1 ? state.qualificationOptions : staticQualifications;
    const telecallerSelectOptions =
        state.telecallerOptions.length > 1 ? state.telecallerOptions : staticTelecallers;
    const stageSelectOptions = state.stageOptions.length > 1 ? state.stageOptions : staticStages;

    const totalRecords = state.totalRecords ?? state.contactList?.length ?? 0;
    const totalPages = Math.ceil(totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;
    const endIndex = Math.min(startIndex + (state.contactList?.length || 0), totalRecords);

    const hasActiveFilters =
        state.search.trim() !== '' ||
        state.cityFilter !== 'All Cities' ||
        state.institutionFilter !== 'All Institutions' ||
        state.qualificationFilter !== 'All Qualifications' ||
        state.telecallerFilter !== 'All Telecallers' ||
        state.stageFilter !== 'All Stages';

    // ── DataTable Columns ────────────────────────────────────────────────────
    const columns = [
        {
            accessor: 'student_name',
            title: 'Student Name',
            sortable: true,
            render: (row: AdmissionContact) => {
                const qualStr =
                    typeof (row as any).education_qualification === 'object' && (row as any).education_qualification
                        ? (row as any).education_qualification?.qualification ||
                          (row as any).education_qualification?.name
                        : row.qualification || '12th Standard';
                const enqId = row.enquiry_id || (row.id ? `ENQ-${String(row.id).padStart(4, '0')}` : '—');
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {row.student_name}
                            </span>
                            {row.badge && (
                                <span className="rounded-full bg-[#dcfce7] px-2 py-0.5 text-[10px] font-bold text-[#16a34a]">
                                    {row.badge}
                                </span>
                            )}
                        </div>
                        <span className="mt-0.5 text-xs text-gray-400">
                            {enqId} · {qualStr}
                        </span>
                    </div>
                );
            },
        },
        {
            accessor: 'phone_number',
            title: 'Mobile & Parent',
            render: (row: AdmissionContact) => {
                const parentText =
                    row.parent ||
                    (row.parent_name && row.parent_phone && row.parent_phone !== '-'
                        ? `${row.parent_name} (${row.parent_phone})`
                        : row.parent_name || (row.parent_phone !== '-' ? row.parent_phone : ''));
                return (
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                            <span>{row.phone_number}</span>
                        </div>
                        {parentText && (
                            <span className="mt-0.5 text-xs text-gray-400">Parent: {parentText}</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessor: 'city',
            title: 'City / Area',
            sortable: true,
            render: (row: AdmissionContact) => {
                const cityStr =
                    typeof row.city === 'object' && row.city
                        ? (row.city as any).city_name || (row.city as any).name
                        : row.city;
                const areaStr = row.area || (row as any).preferred_location || (row as any).address || '';
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white">{cityStr}</span>
                        {areaStr && <span className="mt-0.5 text-xs text-gray-400">{areaStr}</span>}
                    </div>
                );
            },
        },
        {
            accessor: 'target_course',
            title: 'Target Course',
            sortable: true,
            render: (row: AdmissionContact) => {
                const courseStr =
                    row.target_course && row.target_course !== '—'
                        ? row.target_course
                        : typeof (row as any).education_qualification === 'object'
                        ? (row as any).education_qualification?.qualification
                        : row.qualification || '—';
                const instStr =
                    typeof (row as any).preferred_institution === 'object'
                        ? (row as any).preferred_institution?.name
                        : row.institution || (row as any).school_name || 'KAHE';
                return (
                    <div className="flex max-w-[220px] flex-col">
                        <span className="truncate font-semibold text-gray-900 dark:text-white">
                            {courseStr}
                        </span>
                        <span className="mt-0.5 truncate text-xs text-gray-400">{instStr}</span>
                    </div>
                );
            },
        },
        {
            accessor: 'assigned_to',
            title: state.contactType === 'created' ? 'Created By / Assigned' : 'Assigned To',
            sortable: true,
            render: (row: AdmissionContact) => {
                let nameStr = row.assigned_to;
                if (typeof row.assigned_to === 'object' && row.assigned_to) {
                    const a = row.assigned_to as any;
                    nameStr =
                        `${a.first_name || ''} ${a.last_name || ''}`.trim() ||
                        a.username ||
                        a.email ||
                        'Unassigned';
                }
                const createdByStr = row.created_by || (row as any).created_by_name || '';
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-gray-200">
                            {nameStr}
                        </span>
                        {createdByStr && (
                            <span className="mt-0.5 text-xs text-gray-400">
                                Created: {createdByStr}
                            </span>
                        )}
                        {row.assigned_role && (
                            <span
                                className={`mt-0.5 inline-block w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                    row.assigned_role === 'Counsellor'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                                        : 'bg-emerald-100 text-[#39854a] dark:bg-emerald-950/50 dark:text-emerald-300'
                                }`}
                            >
                                {row.assigned_role}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            titleClassName: '!text-center',
            render: (row: AdmissionContact) => {
                const statusStr =
                    typeof row.status === 'object' && row.status
                        ? (row.status as any).status || (row.status as any).name || 'Contacted'
                        : row.status || 'Contacted';
                const cls =
                    statusBadgeClasses[String(statusStr).toLowerCase()] ??
                    'bg-gray-100 text-gray-700';
                return (
                    <div className="flex justify-center">
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${cls}`}>
                            {statusStr}
                        </span>
                    </div>
                );
            },
        },
        {
            accessor: 'actions',
            title: 'Actions',
            titleClassName: '!text-center',
            render: (row: AdmissionContact) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => handleOpenLogCall(row)}
                        title="Call Student"
                        className="rounded-lg border border-gray-200 p-1.5 text-[#39854a] transition hover:bg-green-50 dark:border-gray-700 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        <Phone className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleViewContact(row)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            router.push(`/contacts/edit_contact/${row.id || row.enquiry_id}`)
                        }
                        title="Edit Contact"
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-green-50 hover:text-[#39854a] dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                    </button>
                </div>
            ),
        },
    ];

    // =========================================================================
    // MAIN PAGE DOM (RETURN)
    // =========================================================================
    return (
        <div className="min-h-screen space-y-6 bg-[#f7faf8] p-4 sm:p-6 dark:bg-[#060818]">
            <Head>
                <title>My Contacts Directory - KAHE CRM</title>
            </Head>

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                        My Contacts Directory
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 dark:text-gray-400 sm:text-sm">
                        My Contacts · Academic Year 2026–27
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.push('/contacts/create_contact')}
                        className="btn-action-solid flex items-center gap-2 cursor-pointer"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>+ Add Contact</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/contacts/bulk_import')}
                        disabled={state.importLoading}
                        className="btn-action-outline flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                        <CloudUpload className="h-4 w-4 text-[#39854a]" />
                        <span>{state.importLoading ? 'Importing...' : 'Import Contacts'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/contacts/assign_contact')}
                        className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/50 px-4 py-2.5 text-xs font-bold text-[#39854a] shadow-sm transition hover:bg-green-100 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400 sm:text-sm cursor-pointer"
                    >
                        <Users className="h-4 w-4 text-[#39854a]" />
                        <span>Assign Contacts</span>
                    </button>
                </div>
            </div>

            {/* SEARCH & FILTERS BAR */}
            <div className="overview-panel space-y-3">
                {/* Search Bar & Compact View Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    {/* Small Compact Toggle Button */}
                    <div className="inline-flex shrink-0 self-start sm:self-auto rounded-xl bg-gray-100 p-0.5 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => handleToggleContactType('created')}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                state.contactType === 'created'
                                    ? 'bg-white text-[#39854a] shadow-xs dark:bg-[#1a2942] dark:text-emerald-400 font-bold'
                                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>Created</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleToggleContactType('assigned')}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                                state.contactType === 'assigned'
                                    ? 'bg-white text-[#39854a] shadow-xs dark:bg-[#1a2942] dark:text-emerald-400 font-bold'
                                    : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            <Users className="h-3.5 w-3.5" />
                            <span>Assigned</span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 flex items-center">
                        <Search className="absolute left-3.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={state.search}
                            onChange={(e) => {
                                setState({ search: e.target.value, currentPage: 1 });
                            }}
                            placeholder="Search student name, phone number, enquiry ID, city, or course..."
                            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs font-semibold text-gray-800 placeholder-gray-400 shadow-sm transition focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-800 dark:bg-[#121e32] dark:text-white dark:placeholder-gray-500 sm:text-sm"
                        />
                        {state.search && (
                            <button
                                type="button"
                                onClick={() => setState({ search: '', currentPage: 1 })}
                                className="absolute right-3 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Dropdowns using CustomSelect */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {/* City */}
                    <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            CITY / AREA
                        </label>
                        <CustomSelect
                            options={citySelectOptions.filter((o) => o.value !== 'All Cities')}
                            value={
                                state.cityFilter !== 'All Cities'
                                    ? citySelectOptions.find((o) => o.value === state.cityFilter) ?? null
                                    : null
                            }
                            placeholder="All Cities"
                            isClearable={true}
                            isSearchable
                            loadMore={state.cityHasNext ? loadMoreCityList : undefined}
                            onChange={(opt) => {
                                setState({
                                    cityFilter: opt ? String(opt.value) : 'All Cities',
                                    currentPage: 1,
                                });
                            }}
                        />
                    </div>

                    {/* Institution */}
                    <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            COLLEGE / INSTITUTION
                        </label>
                        <CustomSelect
                            options={institutionSelectOptions.filter((o) => o.value !== 'All Institutions')}
                            value={
                                state.institutionFilter !== 'All Institutions'
                                    ? institutionSelectOptions.find((o) => o.value === state.institutionFilter) ?? null
                                    : null
                            }
                            placeholder="All Institutions"
                            isClearable={true}
                            isSearchable
                            loadMore={state.institutionHasNext ? loadMoreInstitutionList : undefined}
                            onChange={(opt) => {
                                setState({
                                    institutionFilter: opt ? String(opt.value) : 'All Institutions',
                                    currentPage: 1,
                                });
                            }}
                        />
                    </div>

                    {/* Qualification */}
                    <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            QUALIFICATION
                        </label>
                        <CustomSelect
                            options={qualificationSelectOptions.filter((o) => o.value !== 'All Qualifications')}
                            value={
                                state.qualificationFilter !== 'All Qualifications'
                                    ? qualificationSelectOptions.find((o) => o.value === state.qualificationFilter) ?? null
                                    : null
                            }
                            placeholder="All Qualifications"
                            isClearable={true}
                            isSearchable
                            loadMore={state.qualificationHasNext ? loadMoreQualificationList : undefined}
                            onChange={(opt) => {
                                setState({
                                    qualificationFilter: opt ? String(opt.value) : 'All Qualifications',
                                    currentPage: 1,
                                });
                            }}
                        />
                    </div>

                    {/* Telecaller */}
                    {/* <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            TELECALLER
                        </label>
                        <CustomSelect
                            options={telecallerSelectOptions.filter((o) => o.value !== 'All Telecallers')}
                            value={
                                state.telecallerFilter !== 'All Telecallers'
                                    ? telecallerSelectOptions.find((o) => o.value === state.telecallerFilter) ?? null
                                    : null
                            }
                            placeholder="All Telecallers"
                            isClearable={true}
                            isSearchable
                            loadMore={state.telecallerHasNext ? loadMoreTelecallerList : undefined}
                            onChange={(opt) => {
                                setState({
                                    telecallerFilter: opt ? String(opt.value) : 'All Telecallers',
                                    currentPage: 1,
                                });
                            }}
                        />
                    </div> */}

                    {/* Admission Stage */}
                    <div>
                        <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            ADMISSION STAGE
                        </label>
                        <CustomSelect
                            options={stageSelectOptions.filter((o) => o.value !== 'All Stages')}
                            value={
                                state.stageFilter !== 'All Stages'
                                    ? stageSelectOptions.find((o) => o.value === state.stageFilter) ?? null
                                    : null
                            }
                            placeholder="All Stages"
                            isClearable={true}
                            isSearchable={false}
                            onChange={(opt) => {
                                setState({
                                    stageFilter: opt ? String(opt.value) : 'All Stages',
                                    currentPage: 1,
                                });
                            }}
                        />
                    </div>
                </div>

                {/* Active Filter Chips */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 text-xs dark:border-gray-800">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Filtered By:</span>
                        {state.search.trim() && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                Search: &ldquo;{state.search.trim()}&rdquo;
                                <button
                                    type="button"
                                    onClick={() => setState({ search: '', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {state.cityFilter !== 'All Cities' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                City: {state.cityFilter}
                                <button
                                    type="button"
                                    onClick={() => setState({ cityFilter: 'All Cities', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {state.institutionFilter !== 'All Institutions' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                College: {state.institutionFilter}
                                <button
                                    type="button"
                                    onClick={() => setState({ institutionFilter: 'All Institutions', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {state.qualificationFilter !== 'All Qualifications' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                Qualification: {state.qualificationFilter}
                                <button
                                    type="button"
                                    onClick={() => setState({ qualificationFilter: 'All Qualifications', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {state.telecallerFilter !== 'All Telecallers' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                Telecaller: {state.telecallerFilter}
                                <button
                                    type="button"
                                    onClick={() => setState({ telecallerFilter: 'All Telecallers', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {state.stageFilter !== 'All Stages' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf5ed] px-3 py-1 font-semibold text-[#39854a]">
                                Stage: {state.stageFilter}
                                <button
                                    type="button"
                                    onClick={() => setState({ stageFilter: 'All Stages', currentPage: 1 })}
                                    className="hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={handleResetAllFilters}
                            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400"
                        >
                            <RotateCcw className="h-3 w-3" />
                            <span>Clear All</span>
                        </button>
                    </div>
                )}
            </div>

            {/* MANTINE DATATABLE */}
            <div className="overview-panel overflow-hidden p-0 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                <DataTable
                    className="table-responsive"
                    records={state.contactList}
                    columns={columns}
                    fetching={state.isLoading}
                    minHeight={240}
                    withBorder={false}
                    highlightOnHover
                    noRecordsText="No contacts found matching criteria."
                    sortStatus={state.sortStatus}
                    onSortStatusChange={(s) => setState({ sortStatus: s })}
                    totalRecords={totalRecords}
                    recordsPerPage={state.recordsPerPage}
                    page={state.currentPage}
                    onPageChange={(page) => getContactList(page)}
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
                                {endIndex}
                            </span>{' '}
                            of{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {totalRecords}
                            </span>{' '}
                            contacts
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
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>

                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={totalRecords}
                        recordsPerPage={state.recordsPerPage}
                        onPageChange={(page) => getContactList(page)}
                        hasNext={state.next !== null}
                        hasPrevious={state.previous !== null}
                    />
                </div>
            </div>

            {/* DETAILS & MODALS (RENDERED VIA BOTTOM HELPER FUNCTIONS) */}
            {renderStudentDetailsModal({
                contact: state.viewingContact,
                loadingDetails: state.loadingDetails,
                activeTab: state.detailsActiveTab,
                onTabChange: (tab) => setState({ detailsActiveTab: tab }),
                onClose: handleCloseViewContact,
                onLogCall: handleOpenLogCall,
                onWhatsApp: handleWhatsAppClick,
                onEditContact: (id) => router.push(`/contacts/edit_contact/${id}`),
            })}

            {renderLogCallModal({
                contact: state.callingContact,
                outcome: state.callOutcome,
                notes: state.callNotes,
                scheduleFollowUp: state.callScheduleFollowUp,
                callbackDate: state.callCallbackDate,
                callbackTime: state.callCallbackTime,
                referCounsellor: state.callReferCounsellor,
                priority: state.callPriority,
                referralReason: state.callReferralReason,
                onOutcomeChange: (val) => setState({ callOutcome: val }),
                onNotesChange: (val) => setState({ callNotes: val }),
                onScheduleFollowUpChange: (val) => setState({ callScheduleFollowUp: val }),
                onCallbackDateChange: (val) => setState({ callCallbackDate: val }),
                onCallbackTimeChange: (val) => setState({ callCallbackTime: val }),
                onReferCounsellorChange: (val) => setState({ callReferCounsellor: val }),
                onPriorityChange: (val) => setState({ callPriority: val }),
                onReferralReasonChange: (val) => setState({ callReferralReason: val }),
                onClose: handleCloseLogCall,
                onSave: handleSaveCallSubmit,
            })}

           
        </div>
    );
};

export default AllContactsPage;

// =============================================================================
// SEPARATE MODAL & HELPER DOM FUNCTIONS (BELOW AFTER AllContactsPage)
// =============================================================================

// ── 1. Student Details Modal DOM Function ─────────────────────────────────────
interface StudentDetailsModalRenderProps {
    contact: AdmissionContact | any | null;
    loadingDetails: boolean;
    activeTab: StudentDetailsTab;
    onTabChange: (tab: StudentDetailsTab) => void;
    onClose: () => void;
    onLogCall: (contact: AdmissionContact) => void;
    onWhatsApp: (phone?: string) => void;
    onEditContact: (id: string) => void;
}

const renderStudentDetailsModal = ({
    contact,
    loadingDetails,
    activeTab,
    onTabChange,
    onClose,
    onLogCall,
    onWhatsApp,
    onEditContact,
}: StudentDetailsModalRenderProps) => {
    if (!contact) return null;

    const c = contact as any;
    const studentName = c.student_name || 'Student';
    const enquiryId = c.enquiry_id || c.id || '—';
    const phone = c.phone_number || '';
    const city = c.city?.city_name || c.city || '—';
    const area = c.area || c.address || '';
    const targetCourse =
        c.course_specialization?.name || c.target_course || 'Academic Course';
    const currentStage = c.status?.status || c.status || 'Contacted';
    const assignedStaff =
        typeof c.assigned_to === 'object' && c.assigned_to
            ? `${c.assigned_to.first_name || ''} ${c.assigned_to.last_name || ''}`.trim() ||
              c.assigned_to.username
            : c.assigned_to || 'Unassigned';

    const initials = studentName
        .split(' ')
        .map((w: string) => w.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

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
                                onClick={() => onLogCall(contact)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-[#39854a] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#2e6d3c]"
                            >
                                <Phone className="h-3.5 w-3.5" />
                                <span>Log Call</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onWhatsApp(phone)}
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
                                <span className="mt-1 inline-block truncate text-sm font-bold text-gray-900 dark:text-white">
                                    {contact.email || '—'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    QUALIFICATION
                                </span>
                                <span className="mt-1 inline-block text-sm font-bold text-gray-900 dark:text-white">
                                    {contact.qualification || '12th Standard'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                    INTEREST LEVEL
                                </span>
                                <span className="mt-1 inline-block text-sm font-bold text-[#16a34a] dark:text-emerald-400">
                                    {contact.student_interest_level || 'High'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                        {(
                            [
                                { key: 'personal', label: 'Personal Information', icon: Users },
                                { key: 'academic', label: 'Academic Background', icon: BookOpen },
                                { key: 'preferences', label: 'Admission Preferences', icon: GraduationCap },
                                { key: 'assessment', label: 'Internal Assessment', icon: Award },
                            ] as const
                        ).map(({ key, label, icon: Icon }) => {
                            const isSelected = activeTab === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => onTabChange(key)}
                                    className={`relative flex items-center gap-2 pb-3 pt-2 text-xs font-bold transition sm:text-sm ${
                                        isSelected
                                            ? 'text-[#39854a] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#39854a]'
                                            : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Body */}
                <div className="custom-scroll max-h-[55vh] overflow-y-auto p-5 sm:p-6">
                    {activeTab === 'personal' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InfoItem label="Enquiry ID" value={enquiryId} icon={Award} />
                            <InfoItem label="Full Name" value={studentName} icon={Users} />
                            <InfoItem label="Mobile Number" value={phone} icon={Phone} />
                            <InfoItem label="Parent Mobile" value={c.parent_mobile || c.parent_phone} icon={Phone} />
                            <InfoItem label="Email" value={c.email} icon={Mail} />
                            <InfoItem label="Alternate Email" value={c.alternate_email} icon={Mail} />
                            <InfoItem label="Date of Birth" value={c.dob} icon={Calendar} />
                            <InfoItem label="Gender" value={c.gender || '—'} icon={Users} />
                            <InfoItem label="City / District" value={city} icon={MapPin} />
                            <InfoItem label="Area / Locality" value={area} icon={MapPin} />
                            <InfoItem label="Address" value={c.address} icon={MapPin} />
                            <InfoItem label="Pincode" value={c.pincode} icon={MapPin} />
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InfoItem label="Current Qualification" value={c.qualification} icon={GraduationCap} />
                            <InfoItem label="12th School Name" value={c.twelfth_school_name} icon={Building} />
                            <InfoItem label="12th Group" value={c.twelfth_group} icon={BookOpen} />
                            <InfoItem label="12th Board Result" value={c.twelfth_board_result} icon={Award} />
                            <InfoItem label="12th Percentage / Marks" value={c.twelfth_marks ? `${c.twelfth_marks}%` : ''} icon={Star} />
                            <InfoItem label="10th School Name" value={c.tenth_school_name} icon={Building} />
                            <InfoItem label="10th Board Result" value={c.tenth_board_result} icon={Award} />
                            <InfoItem label="10th Percentage / Marks" value={c.tenth_marks ? `${c.tenth_marks}%` : ''} icon={Star} />
                            <InfoItem label="UG College Name" value={c.school_name} icon={Building} />
                            <InfoItem label="UG Marks / CGPA" value={c.ug_marks} icon={Star} />
                            <InfoItem label="Entrance Exam Score" value={c.entrance_exam_score} icon={Award} />
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InfoItem label="Preferred Institution" value={c.preferred_institution?.name || c.institution} icon={Building} />
                            <InfoItem label="Target Course" value={targetCourse} icon={GraduationCap} />
                            <InfoItem label="Degree Type" value={c.degree_type || 'B.Tech'} icon={Award} />
                            <InfoItem label="Student Interest Level" value={c.student_interest_level || 'High'} icon={Star} />
                            <InfoItem label="Preferred Location" value={c.preferred_location} icon={MapPin} />
                            <InfoItem label="Best Time to Contact" value={c.best_time_to_contact} icon={Clock} />
                            <InfoItem label="Lead Source Category" value={c.lead_source_category?.name || c.lead_source_category} icon={Building} />
                        </div>
                    )}

                    {activeTab === 'assessment' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <InfoItem label="Assigned Staff" value={assignedStaff} icon={Users} />
                            <InfoItem label="Interview Rating" value={c.interview_rating ? `${c.interview_rating} / 5` : ''} icon={Star} />
                            <InfoItem label="Internal Rating" value={c.internal_rating ? `${c.internal_rating} / 5` : ''} icon={Star} />
                            <InfoItem label="Reference Type" value={c.reference_type?.name || c.reference_type} icon={Building} />
                            <InfoItem label="Internal Remark" value={c.remark} icon={Award} />
                            <InfoItem label="Personal Remarks" value={c.personal_remarks} icon={Award} />
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
                            onClick={() => onEditContact(contact.id || contact.enquiry_id)}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#39854a]/40 bg-white px-4 py-2 text-xs font-bold text-[#2e743e] shadow-sm transition hover:bg-[#39854a]/10 dark:border-[#39854a]/60 dark:bg-gray-800 dark:text-emerald-400 sm:text-sm"
                        >
                            <Pencil className="h-4 w-4" />
                            <span>Edit Contact</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-300 bg-white px-5 py-2 text-xs font-bold text-gray-800 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 sm:text-sm"
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

// ── 2. Log Call Modal DOM Function ────────────────────────────────────────────
interface LogCallModalRenderProps {
    contact: AdmissionContact | null;
    outcome: string;
    notes: string;
    scheduleFollowUp: boolean;
    callbackDate: string;
    callbackTime: string;
    referCounsellor: boolean;
    priority: 'Medium' | 'High' | 'Urgent';
    referralReason: string;
    onOutcomeChange: (val: string) => void;
    onNotesChange: (val: string) => void;
    onScheduleFollowUpChange: (val: boolean) => void;
    onCallbackDateChange: (val: string) => void;
    onCallbackTimeChange: (val: string) => void;
    onReferCounsellorChange: (val: boolean) => void;
    onPriorityChange: (val: 'Medium' | 'High' | 'Urgent') => void;
    onReferralReasonChange: (val: string) => void;
    onClose: () => void;
    onSave: () => void;
}

const renderLogCallModal = ({
    contact,
    outcome,
    notes,
    scheduleFollowUp,
    callbackDate,
    callbackTime,
    referCounsellor,
    priority,
    referralReason,
    onOutcomeChange,
    onNotesChange,
    onScheduleFollowUpChange,
    onCallbackDateChange,
    onCallbackTimeChange,
    onReferCounsellorChange,
    onPriorityChange,
    onReferralReasonChange,
    onClose,
    onSave,
}: LogCallModalRenderProps) => {
    if (!contact) return null;

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
                                {contact.phone_number} · {contact.city} · {contact.target_course}
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
                                        onClick={() => onOutcomeChange(item)}
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
                            {outcomeActions[outcome] || 'Follow-up as required'}
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
                            onChange={(e) => onNotesChange(e.target.value)}
                            placeholder="e.g. Student enquired about B.Tech CSE fee concessions and hostel facilities."
                            className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-800 placeholder-gray-400 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:text-sm"
                        />
                    </div>

                    {/* Follow-up Section */}
                    <div className="space-y-3 rounded-xl border border-gray-200 p-3.5 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                                <input
                                    type="checkbox"
                                    checked={scheduleFollowUp}
                                    onChange={(e) => onScheduleFollowUpChange(e.target.checked)}
                                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#39854a] accent-[#39854a] focus:ring-[#39854a]"
                                />
                                <span>Schedule Next Follow-up Callback</span>
                            </label>
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
                                            onChange={(e) => onCallbackDateChange(e.target.value)}
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
                                            onChange={(e) => onCallbackTimeChange(e.target.value)}
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
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                                <input
                                    type="checkbox"
                                    checked={referCounsellor}
                                    onChange={(e) => onReferCounsellorChange(e.target.checked)}
                                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-[#39854a] accent-[#39854a] focus:ring-[#39854a]"
                                />
                                <span className="flex items-center gap-1.5">
                                    <GraduationCap className="h-4 w-4 text-[#39854a]" />
                                    Refer to Senior Academic Counsellor
                                </span>
                            </label>
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
                                                    onClick={() => onPriorityChange(p)}
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
                                        onChange={(e) => onReferralReasonChange(e.target.value)}
                                        placeholder="e.g. Student enquired about merit scholarship cutoff..."
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
                        onClick={onSave}
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

// ── 3. Add Contact Modal DOM Function ─────────────────────────────────────────
interface AddContactModalRenderProps {
    isOpen: boolean;
    formData: typeof DEFAULT_ADD_FORM;
    formErrors: Record<string, any>;
    submitLoading: boolean;
    onFieldChange: (key: keyof typeof DEFAULT_ADD_FORM) => (val: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    institutionOptions: { value: string; label: string }[];
    telecallerOptions: { value: string; label: string }[];
    qualificationOptions: { value: string; label: string }[];
}



// ── 4. InfoItem Helper Component ──────────────────────────────────────────────
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
