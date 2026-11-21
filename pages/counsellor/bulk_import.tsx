import React, { useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
    UploadCloud,
    FileSpreadsheet,
    FileText,
    CheckCircle2,
    AlertTriangle,
    X,
    XCircle,
    ArrowRight,
    ArrowLeft,
    Copy,
    Users,
    Eye,
    ExternalLink,
    RefreshCw,
    Check,
    RotateCcw,
    UserCheck,
    AlertCircle,
    PhoneCall,
} from 'lucide-react';
import { useSetState } from '@/utils/functions.utils';

// ============================================================================
// DATA INTERFACES
// ============================================================================
export interface ValidationRecord {
    id: string;
    student_name: string;
    city: string;
    course: string;
    college: string;
    student_phone: string;
    parent_name?: string;
    parent_phone?: string;
    academic_year: string;
    issue_type: 'Exact Duplicate' | 'Duplicate Found' | 'Possible Sibling' | 'Previous Year Record Found' | 'Invalid Contact' | 'Clean Lead';
    issue_desc: string;
    status: 'Excluded' | 'Under Review' | 'Ready';
    existing_match_name?: string;
    existing_match_id?: string;
    existing_match_ay?: string;
    review_id?: string;
}

export interface ReviewRequest {
    id: string; // "REV-001"
    student_name: string;
    student_phone: string;
    city: string;
    parent_name: string;
    parent_phone: string;
    academic_year: string;
    course: string;
    college: string;
    issue_type: 'Exact Duplicate' | 'Possible Sibling' | 'Previous Year Match';
    existing_match_name: string;
    existing_match_id: string;
    existing_match_ay: string;
    existing_parent_name: string;
    existing_parent_phone: string;
    existing_city: string;
    existing_course: string;
    existing_college: string;
    submitted_by: string;
    submitted_on: string;
    reviewed_by?: string;
    reviewed_on?: string;
    status: 'Pending Decision' | 'Approved' | 'Rejected' | 'Linked Sibling';
    decision_reason?: string;
    internal_notes?: string;
    is_verified?: boolean;
}

// ============================================================================
// INITIAL SAMPLE DATA MATCHING ATTACHED SCREENSHOTS
// ============================================================================
const initialValidationRows: ValidationRecord[] = [
    {
        id: 'ROW-1',
        student_name: 'M. Naveen Kumar',
        city: 'Coimbatore',
        course: 'Computer Science & Engineering',
        college: 'Karpagam Academy of Higher Education (KAHE)',
        student_phone: '+91 98425 61122',
        parent_name: 'M. Mohan',
        parent_phone: '+91 98425 00911',
        academic_year: '2026–27',
        issue_type: 'Exact Duplicate',
        issue_desc: 'This student already exists.',
        status: 'Excluded',
        existing_match_name: 'M. Naveen Kumar',
        existing_match_id: 'ENQ-2026-0094',
        existing_match_ay: '2026-27',
        review_id: 'REV-004',
    },
    {
        id: 'ROW-2',
        student_name: 'K. Vignesh',
        city: 'Coimbatore',
        course: 'Computer Science & Engineering',
        college: 'Karpagam Academy of Higher Education (KAHE)',
        student_phone: '+91 98421 98210',
        parent_name: 'R. Krishnan',
        parent_phone: '+91 98420 11990',
        academic_year: '2026–27',
        issue_type: 'Exact Duplicate',
        issue_desc: 'This student already exists.',
        status: 'Excluded',
        existing_match_name: 'K. Vignesh',
        existing_match_id: 'ENQ-2026-0101',
        existing_match_ay: '2026-27',
        review_id: 'REV-001',
    },
    {
        id: 'ROW-3',
        student_name: 'S. Nithya Devi',
        city: 'Tiruppur',
        course: 'B.Sc Nursing',
        college: 'Karpagam College of Nursing (KCN)',
        student_phone: '+91 97890 55123',
        parent_name: 'S. Subramaniam',
        parent_phone: '+91 98421 44552',
        academic_year: '2026–27',
        issue_type: 'Possible Sibling',
        issue_desc: 'Similar parent details found. Please verify.',
        status: 'Under Review',
        existing_match_name: 'S. Priya (Sibling)',
        existing_match_id: 'ENQ-2026-0102',
        existing_match_ay: '2026-27',
        review_id: 'REV-002',
    },
    {
        id: 'ROW-4',
        student_name: 'S. Karthi',
        city: 'Tiruppur',
        course: 'B.Tech Artificial Intelligence & Data Science',
        college: 'Karpagam Institute of Technology (KIT)',
        student_phone: '+91 98428 33410',
        parent_name: 'S. Sundaram',
        parent_phone: '+91 98428 11099',
        academic_year: '2026–27',
        issue_type: 'Previous Year Record Found',
        issue_desc: 'Previous Year Record Found (2025–26). Verify if returning candidate.',
        status: 'Under Review',
        existing_match_name: 'S. Karthi (AY 2025–26 Applicant)',
        existing_match_id: 'ENQ-2025-0842',
        existing_match_ay: '2025-26 (Archived)',
        review_id: 'REV-003',
    },
    {
        id: 'ROW-5',
        student_name: 'A. Subhashini',
        city: 'Pollachi',
        course: 'Biomedical Engineering',
        college: 'Karpagam College of Engineering (KCE)',
        student_phone: 'Invalid Number',
        parent_name: 'A. Anandan',
        parent_phone: 'Not provided',
        academic_year: '2026–27',
        issue_type: 'Invalid Contact',
        issue_desc: 'Malformed phone number. Contact cannot be dialed.',
        status: 'Excluded',
    },
    {
        id: 'ROW-6',
        student_name: 'G. Gokulraj',
        city: 'Erode',
        course: 'Master of Business Administration (MBA)',
        college: 'Karpagam Academy of Higher Education (KAHE)',
        student_phone: '+91 99432 77011',
        parent_name: 'G. Gunasekaran',
        parent_phone: '+91 99432 00114',
        academic_year: '2026–27',
        issue_type: 'Duplicate Found',
        issue_desc: 'This student already exists.',
        status: 'Excluded',
        existing_match_name: 'G. Gokulraj',
        existing_match_id: 'ENQ-2026-0105',
        existing_match_ay: '2026-27',
        review_id: 'REV-005',
    },
];

const initialReviewRequests: ReviewRequest[] = [
    {
        id: 'REV-001',
        student_name: 'K. Vignesh',
        student_phone: '+91 98421 98210',
        city: 'Coimbatore',
        parent_name: 'R. Krishnan',
        parent_phone: '+91 98420 11990',
        academic_year: '2026–27 (Current Cycle)',
        course: 'Computer Science & Engineering',
        college: 'Karpagam Academy of Higher Education (KAHE)',
        issue_type: 'Exact Duplicate',
        existing_match_name: 'K. Vignesh',
        existing_match_id: 'ENQ-2026-0101',
        existing_match_ay: '2026-27',
        existing_parent_name: 'Uncollected',
        existing_parent_phone: 'Not recorded',
        existing_city: 'Coimbatore',
        existing_course: 'Computer Science & Engineering',
        existing_college: 'Karpagam Academy of Higher Education (KAHE)',
        submitted_by: 'Prof. R. Natarajan (Admin)',
        submitted_on: '2026-05-05 11:20',
        reviewed_by: 'Prof. R. Natarajan (ADMIN)',
        reviewed_on: '2026-11-13 06:36',
        status: 'Pending Decision',
        internal_notes: 'Sheet row from Coimbatore Education Fair leads list. Needs verification if this is re-enquiry or duplicate entry.',
        decision_reason: 'Kept pending further document / identity verification.',
        is_verified: false,
    },
    {
        id: 'REV-002',
        student_name: 'S. Nithya Devi',
        student_phone: '+91 97890 55123',
        city: 'Tiruppur',
        parent_name: 'S. Subramaniam',
        parent_phone: '+91 98421 44552',
        academic_year: '2026–27 (Current Cycle)',
        course: 'B.Sc Nursing',
        college: 'Karpagam College of Nursing (KCN)',
        issue_type: 'Possible Sibling',
        existing_match_name: 'S. Priya (Sibling)',
        existing_match_id: 'ENQ-2026-0102',
        existing_match_ay: '2026-27',
        existing_parent_name: 'S. Subramaniam (Father)',
        existing_parent_phone: '+91 98421 44552',
        existing_city: 'Tiruppur',
        existing_course: 'B.Pharm',
        existing_college: 'Karpagam College of Pharmacy (KCP)',
        submitted_by: 'Prof. R. Natarajan (Admin)',
        submitted_on: '2026-05-05 11:25',
        status: 'Pending Decision',
        internal_notes: 'Parent mobile number matches enrolled student Priya. High likelihood of genuine sibling enrollment.',
        decision_reason: 'Verify parent Aadhaar / family ration card copy before linking.',
        is_verified: false,
    },
    {
        id: 'REV-003',
        student_name: 'S. Karthi',
        student_phone: '+91 98428 33410',
        city: 'Tiruppur',
        parent_name: 'S. Sundaram',
        parent_phone: '+91 98428 11099',
        academic_year: '2026–27 (Current Cycle)',
        course: 'B.Tech Artificial Intelligence & Data Science',
        college: 'Karpagam Institute of Technology (KIT)',
        issue_type: 'Previous Year Match',
        existing_match_name: 'S. Karthi (AY 2025–26 Applicant)',
        existing_match_id: 'ENQ-2025-0842',
        existing_match_ay: '2025-26 (Archived)',
        existing_parent_name: 'S. Sundaram',
        existing_parent_phone: '+91 98428 11099',
        existing_city: 'Tiruppur',
        existing_course: 'B.E. Mechanical Engineering',
        existing_college: 'Karpagam College of Engineering (KCE)',
        submitted_by: 'Prof. R. Natarajan (Admin)',
        submitted_on: '2026-05-05 11:30',
        status: 'Pending Decision',
        internal_notes: 'Student previously enquired in AY 2025–26 but did not confirm admission. Re-applying for AI & DS in 2026-27.',
        decision_reason: 'Previous year non-admitted candidate re-enquiring. Re-activate profile.',
        is_verified: false,
    },
];

const BulkImportPage = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // =========================================================================
    // PAGE-LEVEL STATE VIA useSetState
    // =========================================================================
    const [state, setState] = useSetState({
        currentTab: 'upload' as 'upload' | 'reviews',
        wizardStep: 1 as 1 | 2 | 3 | 4,
        isValidating: false,
        uploadedFileName: 'Coimbatore_Mega_Education_Fair_Leads_2026.xlsx',

        // Validation rows & stats
        validationRows: initialValidationRows,
        newContactsCount: 0,
        duplicatesCount: 3,
        siblingsCount: 1,
        needReviewCount: 1,
        invalidCount: 1,

        // Review requests data
        reviewRequests: initialReviewRequests,
        reviewFilter: 'Pending Review' as 'Pending Review' | 'Approved Records' | 'Rejected / Skipped',

        // Selected review item for side drawer
        activeReview: null as ReviewRequest | null,
        isOpenDrawer: false,

        // Drawer edit state
        reviewerVerified: false,
        discussionNotes: '',
        decisionReason: '',
    });

    // Count pending review requests for badge
    const pendingReviewCount = state.reviewRequests.filter((r) => r.status === 'Pending Decision').length;
    const approvedCount = state.reviewRequests.filter((r) => r.status === 'Approved' || r.status === 'Linked Sibling').length;
    const rejectedCount = state.reviewRequests.filter((r) => r.status === 'Rejected').length;

    // Filtered reviews based on sub-filter tab
    const filteredReviews = state.reviewRequests.filter((req) => {
        if (state.reviewFilter === 'Pending Review') return req.status === 'Pending Decision';
        if (state.reviewFilter === 'Approved Records') return req.status === 'Approved' || req.status === 'Linked Sibling';
        if (state.reviewFilter === 'Rejected / Skipped') return req.status === 'Rejected';
        return true;
    });

    // Handle "Load Sample Batch & Validate"
    const handleLoadSampleBatch = () => {
        setState({ isValidating: true });
        setTimeout(() => {
            setState({
                isValidating: false,
                wizardStep: 2,
                uploadedFileName: 'Coimbatore_Mega_Education_Fair_Leads_2026.xlsx',
                validationRows: initialValidationRows,
                newContactsCount: 0,
                duplicatesCount: 3,
                siblingsCount: 1,
                needReviewCount: 1,
                invalidCount: 1,
            });
        }, 700);
    };

    // Handle Real File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setState({ isValidating: true, uploadedFileName: file.name });
        setTimeout(() => {
            setState({
                isValidating: false,
                wizardStep: 2,
                validationRows: initialValidationRows,
                newContactsCount: 0,
                duplicatesCount: 3,
                siblingsCount: 1,
                needReviewCount: 1,
                invalidCount: 1,
            });
        }, 800);
    };

    // Open Review Drawer for a specific Review Request
    const handleOpenReviewDrawer = (req: ReviewRequest) => {
        setState({
            activeReview: req,
            isOpenDrawer: true,
            reviewerVerified: Boolean(req.is_verified),
            discussionNotes: req.internal_notes || '',
            decisionReason: req.decision_reason || '',
        });
    };

    // Send a duplicate row for review from Step 2
    const handleSendForReview = (row: ValidationRecord) => {
        const revId = `REV-00${state.reviewRequests.length + 1}`;
        const newReq: ReviewRequest = {
            id: revId,
            student_name: row.student_name,
            student_phone: row.student_phone,
            city: row.city,
            parent_name: row.parent_name || 'Uncollected',
            parent_phone: row.parent_phone || 'Not recorded',
            academic_year: `${row.academic_year} (Current Cycle)`,
            course: row.course,
            college: row.college,
            issue_type: row.issue_type === 'Possible Sibling' ? 'Possible Sibling' : 'Exact Duplicate',
            existing_match_name: row.existing_match_name || row.student_name,
            existing_match_id: row.existing_match_id || 'ENQ-2026-0110',
            existing_match_ay: row.existing_match_ay || '2026-27',
            existing_parent_name: 'Uncollected',
            existing_parent_phone: 'Not recorded',
            existing_city: row.city,
            existing_course: row.course,
            existing_college: row.college,
            submitted_by: 'Prof. R. Natarajan (Admin)',
            submitted_on: new Date().toISOString().replace('T', ' ').slice(0, 16),
            status: 'Pending Decision',
            internal_notes: `Sent for verification from import file: ${state.uploadedFileName}`,
            decision_reason: 'Pending identity check by senior reviewer.',
            is_verified: false,
        };

        const updatedRows = state.validationRows.map((r) =>
            r.id === row.id ? { ...r, status: 'Under Review' as const, review_id: revId } : r
        );

        setState({
            reviewRequests: [...state.reviewRequests, newReq],
            validationRows: updatedRows,
            duplicatesCount: Math.max(0, state.duplicatesCount - 1),
            needReviewCount: state.needReviewCount + 1,
        });
    };

    // Decision Actions in Drawer
    const handleDecisionAction = (action: 'Approved' | 'Linked Sibling' | 'Rejected' | 'Keep Pending') => {
        if (!state.activeReview) return;
        const targetId = state.activeReview.id;

        if (action === 'Keep Pending') {
            setState({ isOpenDrawer: false, activeReview: null });
            return;
        }

        const updatedRequests = state.reviewRequests.map((r) => {
            if (r.id === targetId) {
                return {
                    ...r,
                    status: action,
                    reviewed_by: 'Prof. R. Natarajan (ADMIN)',
                    reviewed_on: new Date().toISOString().replace('T', ' ').slice(0, 16),
                    internal_notes: state.discussionNotes,
                    decision_reason: state.decisionReason,
                    is_verified: state.reviewerVerified,
                };
            }
            return r;
        });

        setState({
            reviewRequests: updatedRequests,
            isOpenDrawer: false,
            activeReview: null,
        });
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen dark:bg-[#060818]">
            <Head>
                <title>Contact Import & Duplicate Approval - KAHE Admissions CRM</title>
            </Head>

            {/* ============================================================== */}
            {/* 1. TOP HEADER: TITLE & TOP-RIGHT VIEW TOGGLES */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Contact Import & Duplicate Approval
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Validate uploaded files, automatically flag duplicates & siblings, and manage internal approval decisions.
                    </p>
                </div>

                {/* Top Right Toggle Buttons */}
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setState({ currentTab: 'upload' })}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer ${
                            state.currentTab === 'upload'
                                ? 'bg-[#39854a] text-white hover:bg-[#2f6f3e]'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                        }`}
                    >
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload & Validate</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setState({ currentTab: 'reviews' })}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer ${
                            state.currentTab === 'reviews'
                                ? 'bg-[#39854a] text-white hover:bg-[#2f6f3e]'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Review Requests</span>
                        {pendingReviewCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white shadow-xs">
                                {pendingReviewCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* 2. TAB 1: UPLOAD & VALIDATION WIZARD */}
            {/* ============================================================== */}
            {state.currentTab === 'upload' && (
                <div className="space-y-6">
                    {/* Stepper Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                            {/* Step 1 */}
                            <div
                                onClick={() => setState({ wizardStep: 1 })}
                                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.wizardStep === 1
                                        ? 'bg-[#39854a] text-white shadow-sm'
                                        : state.wizardStep > 1
                                        ? 'border border-emerald-200 bg-emerald-50 text-[#39854a] dark:bg-emerald-950/30 dark:border-emerald-800'
                                        : 'border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-[#121e32]'
                                }`}
                            >
                                {state.wizardStep > 1 && <Check className="h-4 w-4 stroke-[3]" />}
                                <span>1. Upload File</span>
                            </div>

                            {/* Step 2 */}
                            <div
                                onClick={() => state.wizardStep >= 2 && setState({ wizardStep: 2 })}
                                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-bold transition ${
                                    state.wizardStep === 2
                                        ? 'bg-[#39854a] text-white shadow-sm cursor-pointer'
                                        : state.wizardStep > 2
                                        ? 'border border-emerald-200 bg-emerald-50 text-[#39854a] cursor-pointer dark:bg-emerald-950/30 dark:border-emerald-800'
                                        : 'border border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-[#121e32]'
                                }`}
                            >
                                {state.wizardStep > 2 && <Check className="h-4 w-4 stroke-[3]" />}
                                <span>2. Validation Summary</span>
                            </div>

                            {/* Step 3 */}
                            <div
                                onClick={() => setState({ currentTab: 'reviews' })}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 px-3 text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-50 cursor-pointer dark:border-gray-800 dark:bg-[#121e32]"
                            >
                                <span>3. Duplicate & Sibling Review</span>
                            </div>

                            {/* Step 4 */}
                            <div
                                onClick={() => state.wizardStep === 4 && setState({ wizardStep: 4 })}
                                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-bold transition ${
                                    state.wizardStep === 4
                                        ? 'bg-[#39854a] text-white shadow-sm'
                                        : 'border border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-[#121e32]'
                                }`}
                            >
                                <span>4. Import Summary</span>
                            </div>
                        </div>
                    </div>

                    {/* -------------------------------------------------------- */}
                    {/* STEP 1: UPLOAD FILE SCREEN */}
                    {/* -------------------------------------------------------- */}
                    {state.wizardStep === 1 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm dark:border-gray-800 dark:bg-[#0e1726] space-y-6">
                            {/* Drag & Drop Zone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 p-10 sm:p-16 text-center transition hover:border-[#39854a] hover:bg-emerald-50/20 cursor-pointer dark:border-gray-700 dark:hover:border-emerald-500"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#39854a] transition group-hover:scale-110 dark:bg-emerald-950/40">
                                    <UploadCloud className="h-8 w-8" />
                                </div>

                                <h3 className="mt-5 text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                    Drag and drop your enquiry Excel or CSV file
                                </h3>
                                <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    Uploaded records will be automatically cross-checked for exact duplicates, possible siblings sharing parent mobile numbers, and previous academic year enquiries.
                                </p>
                            </div>

                            {/* Ready-to-Test Lead Batch Box */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 dark:border-emerald-800 dark:bg-emerald-950/20">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#39854a] shadow-xs dark:bg-gray-900">
                                        <FileSpreadsheet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                                            Load Ready-to-Test Lead Batch (6 Tamil Nadu Candidates)
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            Includes clean new contacts, exact duplicate, possible sibling, previous year match, and invalid contact.
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    disabled={state.isValidating}
                                    onClick={handleLoadSampleBatch}
                                    className="w-full sm:w-auto shrink-0 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {state.isValidating ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            <span>Validating...</span>
                                        </>
                                    ) : (
                                        <span>Load Sample Batch & Validate</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* -------------------------------------------------------- */}
                    {/* STEP 2: VALIDATION SUMMARY SCREEN */}
                    {/* -------------------------------------------------------- */}
                    {state.wizardStep === 2 && (
                        <div className="space-y-6">
                            {/* 5 Stat Cards */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                {/* New Contacts */}
                                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        New Contacts
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                        {state.newContactsCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">
                                        Ready for import
                                    </div>
                                </div>

                                {/* Duplicates */}
                                <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Duplicates
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                                        {state.duplicatesCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">
                                        Clones prevented
                                    </div>
                                </div>

                                {/* Possible Siblings */}
                                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Possible Siblings
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-amber-500 dark:text-amber-400">
                                        {state.siblingsCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">
                                        Family shared phone
                                    </div>
                                </div>

                                {/* Need Review */}
                                <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Need Review
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
                                        {state.needReviewCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">
                                        Prior year / uncertain
                                    </div>
                                </div>

                                {/* Invalid Contacts */}
                                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Invalid Contacts
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-gray-700 dark:text-gray-300">
                                        {state.invalidCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">
                                        Missing phone
                                    </div>
                                </div>
                            </div>

                            {/* Validation Table Container */}
                            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                                {/* Table Card Header */}
                                <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0e1726]">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            Import Validation Table ({state.validationRows.length} rows)
                                        </span>
                                        <span className="text-xs font-semibold text-gray-400">
                                            ({state.uploadedFileName})
                                        </span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Never create duplicate records, but preserve verified siblings
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-[#121e32]/40">
                                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                    Student Name
                                                </th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                    Mobile
                                                </th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                    Issue
                                                </th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                                    Status
                                                </th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap text-right">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                            {state.validationRows.map((row) => {
                                                const matchingReq = state.reviewRequests.find((r) => r.id === row.review_id);

                                                return (
                                                    <tr
                                                        key={row.id}
                                                        className="transition hover:bg-gray-50/70 dark:hover:bg-[#121e32]/50"
                                                    >
                                                        {/* Student Name */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-bold text-gray-900 dark:text-white">
                                                                {row.student_name}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                {row.city} · {row.course}
                                                            </div>
                                                        </td>

                                                        {/* Mobile */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                                {row.student_phone}
                                                            </div>
                                                            {row.parent_phone && row.parent_phone !== 'Not provided' && (
                                                                <div className="text-xs text-gray-400">
                                                                    Parent: {row.parent_phone}
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* Issue Badge */}
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                {row.issue_type === 'Duplicate Found' || row.issue_type === 'Exact Duplicate' ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800">
                                                                        <Copy className="h-3 w-3" />
                                                                        <span>Duplicate Found</span>
                                                                    </span>
                                                                ) : row.issue_type === 'Possible Sibling' ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
                                                                        <Users className="h-3 w-3" />
                                                                        <span>Possible Sibling</span>
                                                                    </span>
                                                                ) : row.issue_type === 'Previous Year Record Found' ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
                                                                        <FileText className="h-3 w-3" />
                                                                        <span>Previous Year Record Found</span>
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300">
                                                                        <XCircle className="h-3 w-3" />
                                                                        <span>Invalid Contact</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                                                                {row.issue_desc}
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {row.status === 'Excluded' ? (
                                                                <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
                                                                    Excluded
                                                                </span>
                                                            ) : row.status === 'Under Review' ? (
                                                                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40">
                                                                    Under Review
                                                                </span>
                                                            ) : (
                                                                <span className="font-bold text-xs text-[#39854a]">
                                                                    Ready
                                                                </span>
                                                            )}
                                                        </td>

                                                        {/* Action */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            {row.issue_type === 'Invalid Contact' ? (
                                                                <span className="text-xs text-gray-400 italic">
                                                                    Fix phone before upload
                                                                </span>
                                                            ) : row.status === 'Under Review' ? (
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (matchingReq) handleOpenReviewDrawer(matchingReq);
                                                                            else setState({ currentTab: 'reviews' });
                                                                        }}
                                                                        className="text-xs font-bold text-[#39854a] hover:underline cursor-pointer"
                                                                    >
                                                                        View Matching Student
                                                                    </button>
                                                                    <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-400 dark:bg-gray-800">
                                                                        In Review Queue
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            if (matchingReq) handleOpenReviewDrawer(matchingReq);
                                                                            else setState({ currentTab: 'reviews' });
                                                                        }}
                                                                        className="text-xs font-bold text-[#39854a] hover:underline cursor-pointer"
                                                                    >
                                                                        View Existing Student
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSendForReview(row)}
                                                                        className="rounded-xl border border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-50 cursor-pointer shadow-2xs dark:bg-gray-900"
                                                                    >
                                                                        Send for Review
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Bottom Action Bar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setState({ wizardStep: 1 })}
                                    className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Reset & Upload Different File</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setState({ currentTab: 'reviews' })}
                                        className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50/60 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs cursor-pointer dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800"
                                    >
                                        <FileText className="h-4 w-4 text-amber-600" />
                                        <span>Open Review Requests ({pendingReviewCount})</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setState({ wizardStep: 4 })}
                                        className="flex items-center gap-2 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
                                    >
                                        <span>Import Valid New Contacts ({state.newContactsCount})</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* -------------------------------------------------------- */}
                    {/* STEP 4: IMPORT SUMMARY SCREEN */}
                    {/* -------------------------------------------------------- */}
                    {state.wizardStep === 4 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-14 shadow-sm dark:border-gray-800 dark:bg-[#0e1726] flex flex-col items-center text-center">
                            {/* Center Checkmark */}
                            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100 text-[#39854a] dark:bg-emerald-950/60 shadow-xs">
                                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                            </div>

                            <h2 className="mt-5 text-2xl font-black text-gray-900 dark:text-white">
                                Import Validation Completed!
                            </h2>
                            <p className="mt-1.5 max-w-lg text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Successfully imported <span className="font-bold text-gray-900 dark:text-white">{state.newContactsCount}</span> clean new student contact(s) into current Academic Year 2026–27. Questionable records are held in review.
                            </p>

                            {/* Summary Breakdown Box */}
                            <div className="mt-8 w-full max-w-md rounded-2xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-[#121e32]/40 text-left space-y-2.5">
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">New Student Records Created:</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{state.newContactsCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Exact Duplicates Prevented:</span>
                                    <span className="font-bold text-rose-600 dark:text-rose-400">{state.duplicatesCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Possible Siblings Sent to Review:</span>
                                    <span className="font-bold text-amber-500">{state.siblingsCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Prior Year Matches Held for Review:</span>
                                    <span className="font-bold text-blue-600">{state.needReviewCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs sm:text-sm border-t border-gray-200/80 pt-2 dark:border-gray-700">
                                    <span className="text-gray-600 dark:text-gray-400">Invalid Contacts Excluded:</span>
                                    <span className="font-bold text-gray-700 dark:text-gray-300">{state.invalidCount}</span>
                                </div>
                            </div>

                            {/* Bottom 3 Navigation Buttons */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setState({ currentTab: 'reviews' })}
                                    className="rounded-xl border border-amber-300 bg-amber-50/60 px-5 py-2.5 text-xs sm:text-sm font-bold text-amber-800 hover:bg-amber-100 transition shadow-xs cursor-pointer dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800"
                                >
                                    Manage Review Requests ({pendingReviewCount})
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push('/counsellor/student_profiles')}
                                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                                >
                                    View Student Profiles
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push('/counsellor/queue')}
                                    className="flex items-center gap-2 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white px-6 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
                                >
                                    <span>Open Counselling Queue</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ============================================================== */}
            {/* 3. TAB 2: REVIEW REQUESTS MANAGEMENT TABLE */}
            {/* ============================================================== */}
            {state.currentTab === 'reviews' && (
                <div className="space-y-4">
                    {/* Filter Pills Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Pending Review Tab */}
                            <button
                                type="button"
                                onClick={() => setState({ reviewFilter: 'Pending Review' })}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.reviewFilter === 'Pending Review'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                                }`}
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Pending Review</span>
                                <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] ${
                                    state.reviewFilter === 'Pending Review' ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {pendingReviewCount}
                                </span>
                            </button>

                            {/* Approved Records Tab */}
                            <button
                                type="button"
                                onClick={() => setState({ reviewFilter: 'Approved Records' })}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.reviewFilter === 'Approved Records'
                                        ? 'bg-[#39854a] text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                                }`}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Approved Records</span>
                                <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] ${
                                    state.reviewFilter === 'Approved Records' ? 'bg-white text-[#39854a]' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    {approvedCount}
                                </span>
                            </button>

                            {/* Rejected / Skipped Tab */}
                            <button
                                type="button"
                                onClick={() => setState({ reviewFilter: 'Rejected / Skipped' })}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.reviewFilter === 'Rejected / Skipped'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                                }`}
                            >
                                <XCircle className="h-3.5 w-3.5 text-rose-500" />
                                <span>Rejected / Skipped</span>
                                <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] ${
                                    state.reviewFilter === 'Rejected / Skipped' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-700'
                                }`}>
                                    {rejectedCount}
                                </span>
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{filteredReviews.length}</span> request(s)
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-[#121e32]/40">
                                        <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                            Student Name
                                        </th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                            Issue Type
                                        </th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                            Existing Match
                                        </th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                            Submitted By
                                        </th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200 whitespace-nowrap text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                                    {filteredReviews.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-400">
                                                No review requests found for this filter tab.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReviews.map((req) => (
                                            <tr
                                                key={req.id}
                                                className="transition hover:bg-gray-50/70 dark:hover:bg-[#121e32]/50"
                                            >
                                                {/* Student Name */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                        {req.student_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {req.student_phone} · {req.city}
                                                    </div>
                                                </td>

                                                {/* Issue Type */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {req.issue_type === 'Exact Duplicate' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800">
                                                            <Copy className="h-3 w-3" />
                                                            <span>Exact Duplicate</span>
                                                        </span>
                                                    ) : req.issue_type === 'Possible Sibling' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
                                                            <Users className="h-3 w-3" />
                                                            <span>Possible Sibling</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-800">
                                                            <FileText className="h-3 w-3" />
                                                            <span>Previous Year Match</span>
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Existing Match */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {req.existing_match_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {req.existing_match_id} · {req.existing_match_ay}
                                                    </div>
                                                </td>

                                                {/* Submitted By */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">
                                                        {req.submitted_by}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {req.submitted_on}
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {req.status === 'Pending Decision' ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40">
                                                            Pending Decision
                                                        </span>
                                                    ) : req.status === 'Approved' ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-[#39854a] border border-emerald-200 dark:bg-emerald-950/40">
                                                            Approved
                                                        </span>
                                                    ) : req.status === 'Linked Sibling' ? (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40">
                                                            Linked Sibling
                                                        </span>
                                                    ) : (
                                                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40">
                                                            Rejected
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Action */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenReviewDrawer(req)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Review</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* 4. SLIDE-OVER REVIEW DRAWER / MODAL (MATCHING IMAGE 3 & 4) */}
            {/* ============================================================== */}
            {state.isOpenDrawer && state.activeReview && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition">
                    <div className="relative w-full max-w-2xl bg-white shadow-2xl dark:bg-[#0e1726] flex flex-col h-full overflow-hidden">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded dark:bg-gray-800 dark:text-gray-300">
                                        {state.activeReview.id}
                                    </span>
                                    <span className="px-2 py-0.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded dark:bg-rose-950/40 dark:border-rose-800">
                                        {state.activeReview.issue_type}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                                    Review: {state.activeReview.student_name}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={() => setState({ isOpenDrawer: false, activeReview: null })}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-1"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Drawer Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Alert Banner */}
                            <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900 dark:bg-rose-950/20">
                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide text-rose-700 dark:text-rose-400">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span>EXACT STUDENT MATCH DETECTED</span>
                                </div>
                                <div className="mt-1 text-xs text-rose-600 dark:text-rose-300 font-medium">
                                    Student mobile number {state.activeReview.student_phone} matches existing record {state.activeReview.existing_match_id} exactly.
                                </div>
                            </div>

                            {/* Side-by-Side Comparison Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                        Side-by-Side Comparison
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        Verify identity differences before decision
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                    {/* Card 1: Imported Candidate */}
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 space-y-3 dark:border-emerald-800 dark:bg-emerald-950/10">
                                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2 dark:border-emerald-900/50">
                                            <span className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                                                Imported Candidate
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                                New Lead
                                            </span>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">STUDENT NAME</div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{state.activeReview.student_name}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">STUDENT MOBILE</div>
                                            <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{state.activeReview.student_phone}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">PARENT NAME</div>
                                            <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{state.activeReview.parent_name}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">PARENT MOBILE</div>
                                            <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{state.activeReview.parent_phone}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">CITY / LOCATION</div>
                                            <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{state.activeReview.city}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">ACADEMIC YEAR</div>
                                            <div className="font-bold text-xs text-[#39854a]">{state.activeReview.academic_year}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">COURSE INTEREST</div>
                                            <div className="font-semibold text-xs text-gray-900 dark:text-white">{state.activeReview.course}</div>
                                            <div className="text-[11px] text-gray-400">{state.activeReview.college}</div>
                                        </div>
                                    </div>

                                    {/* Card 2: Existing CRM Record */}
                                    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 dark:border-gray-800 dark:bg-[#121e32]">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800">
                                            <span className="font-bold text-xs text-gray-700 dark:text-gray-300">
                                                Existing CRM Record
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                                    {state.activeReview.existing_match_id}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#39854a] hover:underline cursor-pointer flex items-center gap-0.5">
                                                    Profile →
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">MATCHED STUDENT</div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-white">{state.activeReview.existing_match_name}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">STUDENT MOBILE</div>
                                            <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{state.activeReview.student_phone}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">PARENT NAME</div>
                                            <div className="font-semibold text-xs text-gray-500">{state.activeReview.existing_parent_name}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">PARENT MOBILE</div>
                                            <div className="font-semibold text-xs text-gray-500">{state.activeReview.existing_parent_phone}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">CITY / LOCATION</div>
                                            <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">{state.activeReview.existing_city}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">ACADEMIC YEAR</div>
                                            <div className="font-semibold text-xs text-gray-700 dark:text-gray-300">{state.activeReview.existing_match_ay}</div>
                                        </div>

                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-gray-400">COURSE INTEREST</div>
                                            <div className="font-semibold text-xs text-gray-900 dark:text-white">{state.activeReview.existing_course}</div>
                                            <div className="text-[11px] text-gray-400">{state.activeReview.existing_college}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reviewer Identity Verification Checkbox Box */}
                            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={state.reviewerVerified}
                                        onChange={(e) => setState({ reviewerVerified: e.target.checked })}
                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#39854a] focus:ring-[#39854a]"
                                    />
                                    <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                                        <span className="font-bold">Reviewer Identity Verification:</span> I have investigated this contact and verified with academic records that this imported record represents a distinct person with the same phone/name, NOT a duplicate lead.
                                    </span>
                                </label>
                            </div>

                            {/* Internal Discussion Notes */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Internal Discussion Notes & Observations
                                </label>
                                <textarea
                                    rows={2}
                                    value={state.discussionNotes}
                                    onChange={(e) => setState({ discussionNotes: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-white"
                                    placeholder="Enter discussion notes regarding this duplicate / sibling verification..."
                                />
                            </div>

                            {/* Decision Reason */}
                            <div>
                                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                                    Decision Reason (Recorded in audit trail)
                                </label>
                                <input
                                    type="text"
                                    value={state.decisionReason}
                                    onChange={(e) => setState({ decisionReason: e.target.value })}
                                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-white"
                                    placeholder="e.g. Kept pending further document / identity verification."
                                />
                            </div>

                            {/* Audit Info Box */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                                    <span>Submitted by: <strong className="text-gray-700 dark:text-gray-300">{state.activeReview.submitted_by}</strong></span>
                                    <span>Submitted on: {state.activeReview.submitted_on}</span>
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                                    <span>Reviewed by: <strong>{state.activeReview.reviewed_by || 'Prof. R. Natarajan (ADMIN)'}</strong></span>
                                    <span>Decision: <strong className="uppercase">{state.activeReview.status === 'Pending Decision' ? 'KEEP_PENDING' : state.activeReview.status}</strong> ({state.activeReview.reviewed_on || '2026-11-13 06:36'})</span>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Bottom Action Buttons (Matching Image 4) */}
                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121e32]/60 space-y-3">
                            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                Select Approval Action:
                            </div>

                            {/* Row 1: Approve as New Student | Link as Sibling */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleDecisionAction('Approved')}
                                    className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                    <span>Approve as New Student</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDecisionAction('Linked Sibling')}
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
                                >
                                    <Users className="h-4 w-4" />
                                    <span>Link as Sibling</span>
                                </button>
                            </div>

                            {/* Row 2: Confirm Duplicate | Reject Import */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleDecisionAction('Rejected')}
                                    className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 px-3 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer"
                                >
                                    <Copy className="h-4 w-4" />
                                    <span>Confirm Duplicate</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDecisionAction('Rejected')}
                                    className="flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white hover:bg-red-50 text-red-600 py-2.5 px-3 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer dark:bg-gray-800 dark:border-red-800"
                                >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span>Reject Import</span>
                                </button>
                            </div>

                            {/* Row 3: Keep Pending | Close Panel */}
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleDecisionAction('Keep Pending')}
                                    className="text-xs font-bold text-gray-700 hover:text-gray-950 underline underline-offset-2 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                                >
                                    Keep Pending for Further Verification
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setState({ isOpenDrawer: false, activeReview: null })}
                                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 cursor-pointer"
                                >
                                    Close Panel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkImportPage;
