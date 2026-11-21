import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Users,
    Clock,
    Calendar,
    Heart,
    GraduationCap,
    UploadCloud,
    UserPlus,
    ArrowRight,
    MapPin,
    Building2,
    Send,
    CheckCircle2,
    BookOpen,
    Eye,
} from 'lucide-react';
import Modal from '@/common_component/modal';
import TextInput from '@/components/TextInput';
import TextArea from '@/components/TextArea';
import CustomSelect from '@/components/Select';
import StudentDetailsModal from '@/components/KAHE/StudentDetailsModal';
import { AdmissionContact } from '@/components/KAHE/AdmissionsContactsTable';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';

export default function CounsellorDashboard() {
    const router = useRouter();

    const [state, setState] = useSetState({
        loading: true,
        counsellor: null,
        urgentReferrals: [],
        scheduledVisits: [],

        // Review Modal State (Image 4)
        isReviewModalOpen: false,
        selectedCandidate: null as any,
        reviewOutcome: 'Campus Visit Scheduled',
        admissionStage: 'Applied',
        consultationNotes: '',
        reviewSubmitting: false,
        reviewErrors: {} as Record<string, string>,

        // Full Student Profile Drawer State
        isProfileDrawerOpen: false,
        profileDrawerContact: null as AdmissionContact | null,

        // Add Contact Modal State
        isAddModalOpen: false,
        addForm: {
            student_name: '',
            mobile: '',
            city: 'Coimbatore',
            qualification: '12th Standard',
            target_programme: 'Computer Science & Engineering',
            marks: '',
            priority: 'Normal',
            notes: '',
        },
        addErrors: {} as Record<string, string>,
        addSubmitting: false,
    });

    const loadDashboardData = async () => {
        try {
            setState({ loading: true });
            const res: any = await (Models.contact as any).counsellor.dashboard();
            if (res?.success) {
                setState({
                    counsellor: res.counsellor,
                    urgentReferrals: res.urgent_referrals || [],
                    scheduledVisits: res.scheduled_campus_visits || [],
                    loading: false,
                });
            } else {
                setState({ loading: false });
            }
        } catch (error) {
            console.error('Failed to load counsellor dashboard data', error);
            setState({ loading: false });
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Open Review Modal (Matching Image 4)
    const handleStartSession = (candidate: any) => {
        setState({
            selectedCandidate: candidate,
            isReviewModalOpen: true,
            reviewOutcome: 'Campus Visit Scheduled',
            admissionStage: candidate.stage || 'Applied',
            consultationNotes: candidate.notes || '',
            reviewErrors: {},
        });
    };

    // Open Full Student Profile Drawer using existing StudentDetailsModal component
    const handleOpenFullProfile = (candidate: any) => {
        if (!candidate) return;
        const mappedContact: AdmissionContact = {
            id: candidate.student_id || candidate.id || 'ENQ-2026-0101',
            enquiry_id: candidate.student_id || candidate.enquiry_id || 'ENQ-2026-0101',
            student_name: candidate.student_name,
            phone_number: candidate.mobile || '+91 98421 98210',
            parent_phone: candidate.parent_phone || '+91 98420 11990',
            city: candidate.city || 'Coimbatore',
            area: candidate.area || 'Eachanari',
            qualification: candidate.qualification || '12th Standard',
            target_course: candidate.target_course || candidate.preferred_course || 'Computer Science & Engineering',
            institution: candidate.institution || 'KAHE',
            assigned_to: counsellorData.name,
            assigned_role: 'Senior Counsellor',
            status: state.admissionStage || 'Applied',
        };

        setState({
            profileDrawerContact: mappedContact,
            isProfileDrawerOpen: true,
        });
    };

    // Finalize Counselling Review
    const handleFinalizeReview = async () => {
        const errors: Record<string, string> = {};
        if (!state.reviewOutcome) {
            errors.reviewOutcome = 'Please select a session outcome decision';
        }
        if (!state.consultationNotes || state.consultationNotes.trim().length < 5) {
            errors.consultationNotes = 'Senior counsellor consultation notes are required (min 5 chars)';
        }

        if (Object.keys(errors).length > 0) {
            setState({ reviewErrors: errors });
            return;
        }

        try {
            setState({ reviewSubmitting: true });
            const candidateId = state.selectedCandidate?.student_id || state.selectedCandidate?.id;
            await (Models.contact as any).counsellor.update_session(candidateId, {
                session_outcome: state.reviewOutcome,
                stage: state.admissionStage,
                notes: state.consultationNotes,
            });

            setState({
                isReviewModalOpen: false,
                reviewSubmitting: false,
                selectedCandidate: null,
            });
            await loadDashboardData();
        } catch (error) {
            console.error('Error finalizing counselling session:', error);
            setState({ reviewSubmitting: false });
        }
    };

    // Quick Add Contact Submission
    const handleAddContactSubmit = async () => {
        const errors: Record<string, string> = {};
        if (!state.addForm.student_name.trim()) errors.student_name = 'Student Name is required';
        if (!state.addForm.mobile.trim()) {
            errors.mobile = 'Mobile number is required';
        } else if (!/^\+?[0-9\s-]{10,14}$/.test(state.addForm.mobile.trim())) {
            errors.mobile = 'Enter a valid 10-digit mobile number';
        }

        if (Object.keys(errors).length > 0) {
            setState({ addErrors: errors });
            return;
        }

        try {
            setState({ addSubmitting: true });
            await (Models.contact as any).counsellor.add_contact(state.addForm);
            setState({
                isAddModalOpen: false,
                addSubmitting: false,
                addForm: {
                    student_name: '',
                    mobile: '',
                    city: 'Coimbatore',
                    qualification: '12th Standard',
                    target_programme: 'Computer Science & Engineering',
                    marks: '',
                    priority: 'Normal',
                    notes: '',
                },
                addErrors: {},
            });
            await loadDashboardData();
        } catch (error) {
            console.error('Error adding contact:', error);
            setState({ addSubmitting: false });
        }
    };

    const counsellorData = state.counsellor || {
        name: 'Dr. K. Swaminathan',
        role: 'Senior Academic Counsellor',
        academic_year: '2026–27',
        stats: {
            referred_students: 2,
            pending_counselling: 1,
            today_appointments: 1,
            interested_students: 15,
        },
    };

    const sessionOutcomeOptions = [
        { value: 'Campus Visit Scheduled', label: 'Campus Visit Scheduled' },
        { value: 'Spot Provisional Admission Offered', label: 'Spot Provisional Admission Offered' },
        { value: 'Document Verification Pending', label: 'Document Verification Pending' },
        { value: 'Transferred to Telecaller for Routine Follow-up', label: 'Transferred to Telecaller for Routine Follow-up' },
        { value: 'Student Seeking Other Courses', label: 'Student Seeking Other Courses' },
        { value: 'Declined / Enrolled Elsewhere', label: 'Declined / Enrolled Elsewhere' },
    ];

    const targetProgrammeOptions = [
        { value: 'Computer Science & Engineering', label: 'Computer Science & Engineering (KAHE)' },
        { value: 'B.Sc Nursing', label: 'B.Sc Nursing (KAHE)' },
        { value: 'Bachelor of Pharmacy', label: 'Bachelor of Pharmacy (KAHE)' },
        { value: 'Artificial Intelligence & Data Science', label: 'Artificial Intelligence & Data Science (KAHE)' },
        { value: 'Information Technology', label: 'Information Technology (KAHE)' },
        { value: 'MCA / MBA', label: 'MCA / MBA (KAHE)' },
    ];

    const priorityOptions = [
        { value: 'High', label: 'High' },
        { value: 'Urgent', label: 'Urgent' },
        { value: 'Normal', label: 'Normal' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060818] p-4 lg:p-6 space-y-6">
            <Head>
                <title>Academic Counselling Desk: {counsellorData.name} · KAHE Admissions</title>
            </Head>

            {/* Header Section (Using Common CSS: page-title, page-subtitle, btn-action-solid, btn-action-outline) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title text-2xl lg:text-3xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                        Academic Counselling Desk: {counsellorData.name}
                    </h1>
                    <p className="page-subtitle mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        Senior Academic Consultations, Merit Evaluations & Direct Spot Admissions · AY {counsellorData.academic_year || '2026–27'}
                    </p>
                </div>

                {/* Header Action Buttons using common CSS */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setState({ isAddModalOpen: true })}
                        className="btn-action-solid"
                    >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Add Contact</span>
                    </button>

                    <Link
                        href="/counsellor/bulk_import"
                        className="btn-action-outline"
                    >
                        <UploadCloud className="w-4 h-4 text-[#39854a]" />
                        <span>Import Contacts</span>
                    </Link>

                    <Link
                        href="/counsellor/queue"
                        className="btn-action-solid"
                    >
                        <GraduationCap className="w-4 h-4" />
                        <span>Open Full Counselling Queue</span>
                    </Link>
                </div>
            </div>

            {/* 4 Stat Metric Cards (Using Common CSS: stat-card, stat-card-title, stat-card-value, stat-card-subtitle) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {/* 1. Referred Students */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-title uppercase tracking-wider text-xs">
                            Referred Students
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#39854a]">
                            <Users className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="stat-card-value mt-2 text-gray-900 dark:text-white">
                        {counsellorData.stats.referred_students}
                    </div>
                    <p className="stat-card-subtitle">
                        Total referred by telecallers
                    </p>
                </div>

                {/* 2. Pending Counselling */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-title uppercase tracking-wider text-xs">
                            Pending Counselling
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="stat-card-value mt-2 text-amber-600 dark:text-amber-400">
                        {counsellorData.stats.pending_counselling}
                    </div>
                    <p className="stat-card-subtitle">
                        Awaiting preliminary review
                    </p>
                </div>

                {/* 3. Today's Appointments */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-title uppercase tracking-wider text-xs">
                            Today&apos;s Appointments
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#39854a]">
                            <Calendar className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="stat-card-value mt-2 text-gray-900 dark:text-white">
                        {counsellorData.stats.today_appointments}
                    </div>
                    <p className="stat-card-subtitle">
                        Campus visits & calls
                    </p>
                </div>

                {/* 4. Interested Students */}
                <div className="stat-card">
                    <div className="flex items-center justify-between">
                        <span className="stat-card-title uppercase tracking-wider text-xs">
                            Interested Students
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#39854a]">
                            <Heart className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="stat-card-value mt-2 text-[#39854a]">
                        {counsellorData.stats.interested_students}
                    </div>
                    <p className="stat-card-subtitle">
                        Ready for spot provisional admit
                    </p>
                </div>
            </div>

            {/* Main Content Grid: 2 Side-by-Side Cards (Using Common CSS: overview-panel) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Urgent Counselling Referrals */}
                <div className="overview-panel p-0 overflow-hidden flex flex-col justify-between">
                    <div>
                        {/* Header */}
                        <div className="p-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <GraduationCap className="w-5 h-5 text-[#39854a]" />
                                <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                                    Urgent Counselling Referrals
                                </h2>
                            </div>
                            <Link
                                href="/counsellor/queue"
                                className="text-xs font-bold text-[#39854a] hover:underline flex items-center gap-1"
                            >
                                <span>View Full Queue ({state.urgentReferrals.length})</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* List items */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {state.urgentReferrals.map((item: any) => (
                                <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                                    <div className="space-y-1.5 max-w-md">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-gray-900 dark:text-white text-base">
                                                {item.student_name}
                                            </span>
                                            {item.priority === 'Urgent' ? (
                                                <span className="badge-soft-danger text-[11px] font-bold">
                                                    Urgent
                                                </span>
                                            ) : (
                                                <span className="badge-soft-warning text-[11px] font-bold">
                                                    {item.priority}
                                                </span>
                                            )}
                                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                                Referred by {item.referred_by}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                            {item.notes}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleStartSession(item)}
                                        className="shrink-0 btn-action-solid !py-2 !px-4 !text-xs"
                                    >
                                        Start Session
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 px-5 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Verify marks cutoff & discuss department scholarships</span>
                        <Link href="/counsellor/queue" className="font-bold text-[#39854a] hover:underline flex items-center gap-1">
                            <span>Counselling Queue</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>

                {/* Right Card: Scheduled Campus Visits */}
                <div className="overview-panel p-0 overflow-hidden flex flex-col justify-between">
                    <div>
                        {/* Header */}
                        <div className="p-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <Calendar className="w-5 h-5 text-[#39854a]" />
                                <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                                    Scheduled Campus Visits
                                </h2>
                            </div>
                            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                                In-person appointments
                            </span>
                        </div>

                        {/* List items */}
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {state.scheduledVisits.map((visit: any) => (
                                <div key={visit.id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                                    <div className="space-y-1">
                                        <div className="font-bold text-gray-900 dark:text-white text-base">
                                            {visit.student_name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {visit.preferred_course}
                                        </div>
                                    </div>

                                    <div className="shrink-0 badge-soft-success !px-3 !py-1 text-xs font-bold">
                                        {visit.visit_date}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 px-5 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Direct campus admissions counter</span>
                        <span className="font-bold text-[#39854a]">Admin Block, Eachanari</span>
                    </div>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* COUNSELLING REVIEW MODAL (Matching Image 4, using TextInput, TextArea, CustomSelect) */}
            {/* ========================================================================= */}
            <Modal
                show={state.isReviewModalOpen}
                setShow={(val: boolean) => setState({ isReviewModalOpen: val })}
                title=""
                maxWidth="max-w-2xl"
                addHeader={
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-sm text-[#39854a]">
                            {state.selectedCandidate?.student_name?.slice(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {state.selectedCandidate?.student_name}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 font-mono">
                                    {state.selectedCandidate?.student_id || 'ENQ-2026-0101'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {state.selectedCandidate?.city || 'Coimbatore'} · Preferred:{' '}
                                <span className="text-[#39854a] font-semibold">
                                    {state.selectedCandidate?.target_course || 'Computer Science & Engineering'}
                                </span>
                            </p>
                        </div>
                    </div>
                }
            >
                <div className="space-y-4 pt-1">
                    {/* Candidate Details Card */}
                    <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Qualification</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {state.selectedCandidate?.qualification || '12th Standard'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Marks / Cutoff</span>
                            <span className="font-semibold text-[#39854a]">
                                {state.selectedCandidate?.marks || '570 / 600 (95.0%)'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Target Course</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {state.selectedCandidate?.target_course || 'Computer Science & Engineering'}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-400 block text-[11px] uppercase font-bold">Campus</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                                KAHE - Eachanari
                            </span>
                        </div>
                    </div>

                    {/* Referral Box */}
                    <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                            <span>
                                Referral from Telecaller {state.selectedCandidate?.referred_by || 'P. Malathi'}
                            </span>
                            <span className="badge-soft-warning text-[10px]">
                                Priority: {state.selectedCandidate?.priority || 'High'}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                            &quot;{state.selectedCandidate?.notes || 'Student waiting for 12th PCM results. Father enquired about 50% merit scholarship and AI Lab...'}&quot;
                        </p>
                    </div>

                    {/* Form Field 1: Session Outcome Decision using CustomSelect component */}
                    <div>
                        <CustomSelect
                            title="Session Outcome Decision"
                            required
                            options={sessionOutcomeOptions}
                            value={
                                state.reviewOutcome
                                    ? { value: state.reviewOutcome, label: state.reviewOutcome }
                                    : null
                            }
                            onChange={(opt: any) => setState({ reviewOutcome: opt?.value || '' })}
                            error={state.reviewErrors.reviewOutcome}
                        />
                    </div>

                    {/* Form Field 2: Update Candidate Admission Stage Pills */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                            Update Candidate Admission Stage
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['Counselling', 'Applied', 'Admitted', 'Not Interested'].map((stage) => {
                                const isSelected = state.admissionStage === stage;
                                return (
                                    <button
                                        key={stage}
                                        type="button"
                                        onClick={() => setState({ admissionStage: stage })}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${isSelected
                                            ? 'bg-[#39854a] text-white border-[#39854a] shadow-sm'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {stage}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form Field 3: Senior Counsellor Consultation Notes using TextArea component */}
                    <div>
                        <TextArea
                            title="Senior Counsellor Consultation Notes"
                            required
                            rows={3}
                            value={state.consultationNotes}
                            onChange={(val: string) => setState({ consultationNotes: val })}
                            placeholder="Enter detailed remarks on eligibility evaluation, fee concession agreed, parent interaction, next steps..."
                            error={state.reviewErrors.consultationNotes}
                        />
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => handleOpenFullProfile(state.selectedCandidate)}
                            className="text-xs font-bold text-[#39854a] hover:underline flex items-center gap-1.5"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Student Profile →</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setState({ isReviewModalOpen: false })}
                                className="btn-action-outline !py-2 !px-4 !text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={state.reviewSubmitting}
                                onClick={handleFinalizeReview}
                                className="btn-action-solid !py-2 !px-4 !text-xs disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{state.reviewSubmitting ? 'Finalizing...' : 'Finalize Counselling Session'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* ADD CONTACT MODAL (Using TextInput, TextArea, CustomSelect) */}
            {/* ========================================================================= */}
            <Modal
                show={state.isAddModalOpen}
                setShow={(val: boolean) => setState({ isAddModalOpen: val })}
                title="Add New Enquiry to Counselling Desk"
            >
                <div className="space-y-4 pt-2">
                    <TextInput
                        title="Student Full Name"
                        required
                        placeholder="e.g. S. Gokul"
                        value={state.addForm.student_name}
                        onChange={(val: string) =>
                            setState({ addForm: { ...state.addForm, student_name: val } })
                        }
                        error={state.addErrors.student_name}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <TextInput
                            title="Student Mobile"
                            required
                            placeholder="+91 98421 XXXXX"
                            value={state.addForm.mobile}
                            onChange={(val: string) =>
                                setState({ addForm: { ...state.addForm, mobile: val } })
                            }
                            error={state.addErrors.mobile}
                        />

                        <TextInput
                            title="City / Location"
                            placeholder="Coimbatore"
                            value={state.addForm.city}
                            onChange={(val: string) =>
                                setState({ addForm: { ...state.addForm, city: val } })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <CustomSelect
                            title="Target Programme"
                            options={targetProgrammeOptions}
                            value={{
                                value: state.addForm.target_programme,
                                label: state.addForm.target_programme,
                            }}
                            onChange={(opt: any) =>
                                setState({
                                    addForm: { ...state.addForm, target_programme: opt?.value },
                                })
                            }
                        />

                        <CustomSelect
                            title="Priority Level"
                            options={priorityOptions}
                            value={{
                                value: state.addForm.priority,
                                label: state.addForm.priority,
                            }}
                            onChange={(opt: any) =>
                                setState({
                                    addForm: { ...state.addForm, priority: opt?.value },
                                })
                            }
                        />
                    </div>

                    <TextArea
                        title="Consultation Remarks"
                        rows={2}
                        placeholder="Direct student interest, cutoff marks, concession requests..."
                        value={state.addForm.notes}
                        onChange={(val: string) =>
                            setState({ addForm: { ...state.addForm, notes: val } })
                        }
                    />

                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setState({ isAddModalOpen: false })}
                            className="btn-action-outline !py-2 !px-4 !text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={state.addSubmitting}
                            onClick={handleAddContactSubmit}
                            className="btn-action-solid !py-2 !px-4 !text-xs disabled:opacity-50"
                        >
                            {state.addSubmitting ? 'Saving...' : 'Add to Counselling Queue'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ========================================================================= */}
            {/* FULL STUDENT PROFILE DRAWER (Reusing existing StudentDetailsModal component) */}
            {/* ========================================================================= */}
            {state.isProfileDrawerOpen && state.profileDrawerContact && (
                <StudentDetailsModal
                    isOpen={state.isProfileDrawerOpen}
                    contact={state.profileDrawerContact}
                    onClose={() => setState({ isProfileDrawerOpen: false, profileDrawerContact: null })}
                    onLogCall={() => {}}
                    onWhatsApp={() => {}}
                />
            )}
        </div>
    );
}
