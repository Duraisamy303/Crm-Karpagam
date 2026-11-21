import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    Phone,
    PhoneCall,
    UserPlus,
    UploadCloud,
    Clock,
    Search,
    Eye,
    MessageSquare,
    Send,
    Edit,
    Check,
    X,
    User,
    CheckCircle2,
    Calendar,
    Users,
} from 'lucide-react';
import Modal from '@/common_component/modal';
import Pagination from '@/components/Pagination';
import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

interface ContactRecord {
    id: string;
    student_name: string;
    sibling?: boolean;
    enquiry_id: string;
    city: string;
    mobile: string;
    parent_phone?: string;
    course_interest: string;
    institution: string;
    stage: string;
    last_outcome: string;
    next_action: string;
    scheduled_time: string;
    category?: string;
    date_of_birth?: string;
    father_name?: string;
    mother_name?: string;
}

const CALL_OUTCOMES = [
    { label: 'Interested', value: 'Interested' },
    { label: 'Call Later', value: 'Call Later' },
    { label: 'No Answer', value: 'No Answer' },
    { label: 'Busy', value: 'Busy' },
    { label: 'Not Interested', value: 'Not Interested' },
    { label: 'Wrong Number', value: 'Wrong Number' },
    { label: 'Counselling Needed', value: 'Counselling Needed' },
];

const TelecallerContactsPage = () => {
    const router = useRouter();

    const [state, setState] = useSetState({
        contactsList: [] as ContactRecord[],
        totalRecords: 0,
        isLoading: false,
        activeTab: 'all', // 'all' | 'new' | 'follow_ups' | 'retry' | 'closed'
        searchQuery: '',
        currentPage: 1,
        recordsPerPage: 5,
        counts: {
            all: 5,
            new: 0,
            follow_ups: 4,
            retry: 0,
            closed: 2,
        },

        // Add Contact Modal
        isOpenAddContact: false,
        addName: '',
        addMobile: '',
        addParentMobile: '',
        addCity: 'Coimbatore',
        addCourse: 'Computer Science & Engineering',
        addInstitution: 'KAHE',
        addStage: 'New Enquiry',
        addSibling: false,
        addErrors: {} as Record<string, string>,
        isSubmittingAdd: false,

        // Quick Call Update Modal
        isOpenCallUpdate: false,
        selectedContact: null as ContactRecord | null,
        callOutcome: 'Interested',
        callNotes: '',
        scheduleCallback: false,
        callbackDate: '2026-05-06',
        callbackTime: '11:00 AM',
        referToCounsellor: false,
        updateErrors: {} as Record<string, string>,
        isSubmittingUpdate: false,

        // Full View Details Drawer
        isOpenViewDrawer: false,
        viewContact: null as ContactRecord | null,
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

    // Fetch My Contacts Data from Contact Model Telecaller API
    const getData = async () => {
        try {
            setState({ isLoading: true });
            const body = body_data();
            const res: any = await Models.contact.telecaller.contacts(body);
            setState({
                contactsList: res?.data || [],
                totalRecords: res?.total_records || 0,
                counts: res?.counts || state.counts,
                isLoading: false,
            });
        } catch (error) {
            console.error('Telecaller contacts error:', error);
            setState({ isLoading: false });
        }
    };

    useEffect(() => {
        getData();
    }, [search, state.activeTab, state.currentPage, state.recordsPerPage]);

    // Validate Add Contact Form
    const validateAddContact = () => {
        const errs: Record<string, string> = {};
        if (!state.addName || !state.addName.trim()) {
            errs.name = 'Please enter candidate full name';
        }
        if (!state.addMobile || !state.addMobile.trim()) {
            errs.mobile = 'Please enter student mobile number';
        } else if (state.addMobile.replace(/[^0-9]/g, '').length < 10) {
            errs.mobile = 'Please enter a valid 10-digit mobile number';
        }
        if (!state.addCity || !state.addCity.trim()) {
            errs.city = 'Please enter city or district';
        }
        setState({ addErrors: errs });
        return Object.keys(errs).length === 0;
    };

    // Handle Submit Add Contact
    const handleSubmitAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateAddContact()) return;

        try {
            setState({ isSubmittingAdd: true });
            const formattedMobile = state.addMobile.trim().startsWith('+91')
                ? state.addMobile.trim()
                : `+91 ${state.addMobile.trim()}`;

            const payload = {
                student_name: state.addName.trim(),
                mobile: formattedMobile,
                parent_phone: state.addParentMobile.trim() || '-',
                city: state.addCity.trim(),
                course_interest: state.addCourse,
                institution: state.addInstitution,
                stage: state.addStage,
                sibling: state.addSibling,
                next_action: 'Initial reachout call scheduled',
            };

            await Models.contact.telecaller.add_contact(payload);
            setState({
                isOpenAddContact: false,
                isSubmittingAdd: false,
                addName: '',
                addMobile: '',
                addParentMobile: '',
                addCity: 'Coimbatore',
                addCourse: 'Computer Science & Engineering',
                addInstitution: 'KAHE',
                addSibling: false,
                addErrors: {},
                currentPage: 1,
            });
            getData();
        } catch (error) {
            console.error('Add contact error:', error);
            setState({ isSubmittingAdd: false });
        }
    };

    // Open Quick Call Update Modal
    const handleOpenCallUpdate = (contact: ContactRecord) => {
        setState({
            selectedContact: contact,
            callOutcome: contact.last_outcome !== 'No outcome' ? contact.last_outcome : 'Interested',
            callNotes: '',
            scheduleCallback: false,
            callbackDate: '2026-05-06',
            callbackTime: '11:00 AM',
            referToCounsellor: false,
            updateErrors: {},
            isOpenCallUpdate: true,
        });
    };

    // Submit Call Update
    const handleSubmitCallUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.selectedContact) return;

        if (!state.callNotes || !state.callNotes.trim()) {
            setState({ updateErrors: { notes: 'Please enter call notes / feedback' } });
            return;
        }

        try {
            setState({ isSubmittingUpdate: true });
            const payload = {
                outcome: state.callOutcome,
                notes: state.callNotes.trim(),
                next_action: `Follow-up commitment for ${state.callOutcome}`,
                schedule_callback: state.scheduleCallback,
                callback_date: state.scheduleCallback ? state.callbackDate : null,
                callback_time: state.scheduleCallback ? state.callbackTime : null,
                refer_to_counsellor: state.referToCounsellor,
                stage: state.referToCounsellor ? 'Counselling Needed' : 'Contacted',
            };

            await Models.contact.telecaller.update_call(state.selectedContact.id, payload);
            setState({
                isOpenCallUpdate: false,
                isSubmittingUpdate: false,
                selectedContact: null,
            });
            getData();
        } catch (error) {
            console.error('Call update error:', error);
            setState({ isSubmittingUpdate: false });
        }
    };

    const totalPages = Math.ceil(state.totalRecords / state.recordsPerPage) || 1;
    const startIndex = (state.currentPage - 1) * state.recordsPerPage;

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen dark:bg-[#060818]">
            <Head>
                <title>My Contacts Directory - Telecaller Desk</title>
            </Head>

            {/* ============================================================== */}
            {/* PAGE HEADER (Matching Image 5) */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        My Contacts Directory
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Assigned student leads for{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">P. Malathi</span> · Academic
                        Year 2026–27
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                        type="button"
                        onClick={() => setState({ isOpenAddContact: true, addErrors: {} })}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>+ Add Contact</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/contacts/bulk_import')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 transition cursor-pointer"
                    >
                        <UploadCloud className="h-4 w-4 text-gray-500" />
                        <span>Import Contacts</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push('/telecaller/dashboard')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 transition cursor-pointer"
                    >
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Back to Today's Calls</span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* FILTER PILLS / TABS & SEARCH BAR (Matching Image 5) */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        {[
                            { key: 'all', label: 'All Contacts', count: state.counts.all },
                            { key: 'new', label: 'New Leads', count: state.counts.new },
                            { key: 'follow_ups', label: 'Follow-ups', count: state.counts.follow_ups },
                            { key: 'retry', label: 'Retry Queue', count: state.counts.retry },
                            { key: 'closed', label: 'Closed / Completed', count: state.counts.closed },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setState({ activeTab: tab.key, currentPage: 1 })}
                                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${state.activeTab === tab.key
                                        ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                    }`}
                            >
                                <span>{tab.label}</span>
                                <span
                                    className={`inline-block px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${state.activeTab === tab.key
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[260px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={state.searchQuery}
                            onChange={(e) => setState({ searchQuery: e.target.value, currentPage: 1 })}
                            placeholder="Search by student name or mobile..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#39854a] focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* ============================================================== */}
            {/* CONTACTS TABLE CONTAINER (Matching Image 5) */}
            {/* ============================================================== */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                {/* Subheader Line */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 text-xs">
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                        Showing {state.totalRecords} contacts (Tab:{' '}
                        <span className="capitalize text-[#39854a]">
                            {state.activeTab.replace('_', ' ')}
                        </span>
                        )
                    </span>
                    <span className="font-semibold text-gray-400">
                        Click Call & Update to enter details directly
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/30 dark:border-gray-800 dark:bg-gray-900/20 text-xs font-bold text-gray-600 dark:text-gray-300">
                                <th className="py-4 px-6">Student Name</th>
                                <th className="py-4 px-6">Mobile</th>
                                <th className="py-4 px-6">Course Interest</th>
                                <th className="py-4 px-6 text-center">Stage</th>
                                <th className="py-4 px-6 text-center">Last Outcome</th>
                                <th className="py-4 px-6">Next Action</th>
                                <th className="py-4 px-6 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
                            {state.isLoading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#39854a] border-t-transparent" />
                                            <span className="text-sm font-semibold">Loading assigned contacts...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : state.contactsList.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-gray-400">
                                        <p className="font-semibold text-gray-600 dark:text-gray-300">
                                            No assigned contacts found
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Try adjusting your search query or tab filter.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                state.contactsList.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className="transition hover:bg-gray-50/70 dark:hover:bg-gray-800/40"
                                    >
                                        {/* Student Name */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                                    {contact.student_name}
                                                </span>
                                                {contact.sibling && (
                                                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300">
                                                        Sibling
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] font-medium text-gray-400 mt-0.5">
                                                {contact.enquiry_id} · {contact.city}
                                            </div>
                                        </td>

                                        {/* Mobile */}
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="font-bold text-gray-900 dark:text-white">
                                                {contact.mobile}
                                            </div>
                                        </td>

                                        {/* Course Interest */}
                                        <td className="py-4 px-6 max-w-xs">
                                            <div className="font-bold text-gray-900 dark:text-white text-xs truncate">
                                                {contact.course_interest}
                                            </div>
                                            <div className="text-[11px] font-semibold text-gray-400">
                                                {contact.institution}
                                            </div>
                                        </td>

                                        {/* Stage Badge */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${contact.stage === 'Admitted'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : contact.stage === 'Not Interested'
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                                    }`}
                                            >
                                                {contact.stage}
                                            </span>
                                        </td>

                                        {/* Last Outcome Badge */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${contact.last_outcome === 'Interested'
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        : contact.last_outcome === 'Call Later'
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                            >
                                                {contact.last_outcome}
                                            </span>
                                        </td>

                                        {/* Next Action */}
                                        <td className="py-4 px-6 max-w-xs text-xs text-gray-800 dark:text-gray-200">
                                            <div className="font-medium truncate">{contact.next_action}</div>
                                        </td>

                                        {/* Actions (Matching Image 5) */}
                                        <td className="py-4 px-6 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCallUpdate(contact)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs font-bold shadow-sm transition cursor-pointer"
                                                >
                                                    <Phone className="h-3.5 w-3.5" />
                                                    <Edit className="h-3.5 w-3.5" />
                                                    <span>Call & Update</span>
                                                </button>
                                                <a
                                                    href={`https://wa.me/${contact.mobile.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Open WhatsApp Chat"
                                                    className="p-1.5 rounded-lg border border-gray-200 text-emerald-600 hover:bg-emerald-50 dark:border-gray-700 dark:hover:bg-gray-800 transition"
                                                >
                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setState({ viewContact: contact, isOpenViewDrawer: true })
                                                    }
                                                    title="View Profile Details"
                                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition cursor-pointer"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
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
                            contacts
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
            {/* ADD NEW CONTACT MODAL */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenAddContact}
                close={() => setState({ isOpenAddContact: false, addErrors: {} })}
                addHeader="Add New Student Contact"
                renderComponent={() => (
                    <form onSubmit={handleSubmitAddContact} className="p-5 space-y-4" noValidate>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                Student Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={state.addName}
                                onChange={(e) => setState({ addName: e.target.value })}
                                placeholder="e.g. M. Vijay"
                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm font-medium focus:border-[#39854a] focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                            {state.addErrors.name && (
                                <p className="text-red-500 text-xs mt-1 font-semibold">
                                    ⚠ {state.addErrors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                    Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={state.addMobile}
                                    onChange={(e) => setState({ addMobile: e.target.value })}
                                    placeholder="+91 9842X XXXXX"
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm font-medium focus:border-[#39854a] focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                                {state.addErrors.mobile && (
                                    <p className="text-red-500 text-xs mt-1 font-semibold">
                                        ⚠ {state.addErrors.mobile}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                    Parent Mobile
                                </label>
                                <input
                                    type="text"
                                    value={state.addParentMobile}
                                    onChange={(e) => setState({ addParentMobile: e.target.value })}
                                    placeholder="+91 9443X XXXXX"
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm font-medium focus:border-[#39854a] focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                    City / District <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={state.addCity}
                                    onChange={(e) => setState({ addCity: e.target.value })}
                                    placeholder="Coimbatore"
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm font-medium focus:border-[#39854a] focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                    Preferred Institution
                                </label>
                                <select
                                    value={state.addInstitution}
                                    onChange={(e) => setState({ addInstitution: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                                >
                                    <option value="KAHE">KAHE (Deemed University)</option>
                                    <option value="KCE">Karpagam College of Engineering</option>
                                    <option value="KIT">KIT (Karpagam Institute of Technology)</option>
                                    <option value="Karpagam College of Pharmacy">
                                        Karpagam College of Pharmacy
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">
                                Target Degree & Course
                            </label>
                            <input
                                type="text"
                                value={state.addCourse}
                                onChange={(e) => setState({ addCourse: e.target.value })}
                                placeholder="Computer Science & Engineering"
                                className="w-full rounded-xl border border-gray-200 p-2.5 text-xs sm:text-sm font-medium focus:border-[#39854a] focus:outline-none dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                            />
                        </div>

                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer pt-1">
                            <input
                                type="checkbox"
                                checked={state.addSibling}
                                onChange={(e) => setState({ addSibling: e.target.checked })}
                                className="h-4 w-4 rounded accent-[#39854a]"
                            />
                            <span>Flag as Sibling (Shares family mobile with existing enrolled student)</span>
                        </label>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setState({ isOpenAddContact: false, addErrors: {} })}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:text-gray-900 transition dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={state.isSubmittingAdd}
                                className="px-5 py-2.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                                {state.isSubmittingAdd ? 'Saving...' : 'Add Contact & Assign to Me'}
                            </button>
                        </div>
                    </form>
                )}
            />

            {/* ============================================================== */}
            {/* QUICK CALL UPDATE MODAL */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenCallUpdate}
                close={() => setState({ isOpenCallUpdate: false, selectedContact: null })}
                addHeader={
                    state.selectedContact
                        ? `Call Update: ${state.selectedContact.student_name}`
                        : 'Call Update'
                }
                renderComponent={() =>
                    state.selectedContact && (
                        <form onSubmit={handleSubmitCallUpdate} className="p-5 space-y-4" noValidate>
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                                <Phone className="h-4 w-4 text-[#39854a]" />
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {state.selectedContact.mobile}
                                </span>
                                <span>·</span>
                                <span>{state.selectedContact.city}</span>
                                <span>·</span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {state.selectedContact.course_interest}
                                </span>
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
                                            onClick={() => setState({ callOutcome: oc.value })}
                                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${state.callOutcome === oc.value
                                                    ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200'
                                                }`}
                                        >
                                            {oc.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Call Notes / Student Feedback */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1.5">
                                    Call Notes / Student Feedback <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={state.callNotes}
                                    onChange={(e) => setState({ callNotes: e.target.value })}
                                    placeholder="Enter conversation summary, student queries, course interest details..."
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs sm:text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#39854a] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                {state.updateErrors.notes && (
                                    <p className="text-red-500 text-xs mt-1 font-semibold">
                                        ⚠ {state.updateErrors.notes}
                                    </p>
                                )}
                            </div>

                            {/* Checkbox 1: Schedule Next Callback */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 cursor-pointer dark:border-gray-700 dark:bg-gray-800/40">
                                    <input
                                        type="checkbox"
                                        checked={state.scheduleCallback}
                                        onChange={(e) => setState({ scheduleCallback: e.target.checked })}
                                        className="h-4 w-4 rounded accent-[#39854a]"
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
                                                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
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
                                                className="w-full rounded-xl border border-gray-200 bg-white p-2 text-xs font-medium dark:bg-gray-900 dark:border-gray-700 dark:text-white"
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
                                    className="h-4 w-4 rounded accent-[#39854a]"
                                />
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                    Refer to Senior Academic Counsellor
                                </span>
                            </label>

                            {/* Footer Buttons */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenCallUpdate: false, selectedContact: null })}
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
            {/* VIEW PROFILE DETAILS MODAL */}
            {/* ============================================================== */}
            <Modal
                open={state.isOpenViewDrawer}
                close={() => setState({ isOpenViewDrawer: false, viewContact: null })}
                addHeader={
                    state.viewContact ? `Candidate Profile: ${state.viewContact.student_name}` : 'Candidate Profile'
                }
                renderComponent={() =>
                    state.viewContact && (
                        <div className="p-5 space-y-4 text-xs sm:text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">Enquiry ID</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {state.viewContact.enquiry_id}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">Admission Stage</span>
                                    <span className="font-bold text-[#39854a] dark:text-green-400">
                                        {state.viewContact.stage}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">Student Mobile</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {state.viewContact.mobile}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">City / District</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {state.viewContact.city}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">Course Interest</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {state.viewContact.course_interest}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">Institution</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {state.viewContact.institution}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">Last Outcome</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {state.viewContact.last_outcome}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block text-[11px] font-semibold">Sibling Flag</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        {state.viewContact.sibling ? 'Yes (Verified Sibling)' : 'No'}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenViewDrawer: false, viewContact: null })}
                                    className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold dark:bg-gray-800 dark:text-gray-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )
                }
            />
        </div>
    );
};

export default TelecallerContactsPage;

