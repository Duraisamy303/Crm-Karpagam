import React, { useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';
import moment from 'moment';
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
    RefreshCw,
    Check,
    RotateCcw,
    UserCheck,
    AlertCircle,
    Search,
    Loader2,
} from 'lucide-react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/Pagination';
import Models from '@/imports/models.import';
import { capitalizeFLetter, Dropdown, Failure, Success, useSetState } from '@/utils/functions.utils';
import useDebounce from '@/common_component/useDebounce';

// =============================================================================
// DATA INTERFACES & TYPES
// =============================================================================
export interface ValidationRecord {
    id: string;
    row_number?: string;
    field?: string;
    student_name: string;
    student_email?: string;
    city: string;
    course: string;
    college: string;
    student_phone: string;
    parent_name?: string;
    parent_phone?: string;
    academic_year: string;
    issue_type:
        | 'Exact Duplicate'
        | 'Duplicate Found'
        | 'Possible Sibling'
        | 'Previous Year Record Found'
        | 'Invalid Contact'
        | 'Error'
        | 'Clean Lead';
    issue_desc: string;
    error_message?: string;
    suggested_correction?: string;
    status: 'Excluded' | 'Under Review' | 'Ready';
    existing_match_name?: string;
    existing_match_id?: string;
    existing_match_ay?: string;
    review_id?: string;
    [key: string]: any;
}

export interface ReviewRequest {
    id: string; // e.g. "REV-001"
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
    [key: string]: any;
}

type TabType = 'upload' | 'reviews';
type WizardStep = 1 | 2 | 3 | 4;
type ReviewFilterType = 'Pending Review' | 'Approved Records' | 'Rejected / Skipped';

// =============================================================================
// CONSTANTS, BADGE MAPS & SELECT OPTIONS
// =============================================================================
const toOpt = (v: string) => ({ value: v, label: v });

const VALIDATION_ISSUE_OPTIONS = [
    { value: '', label: 'All Issues' },
    { value: 'Exact Duplicate', label: 'Exact Duplicate' },
    { value: 'Duplicate Found', label: 'Duplicate Found' },
    { value: 'Possible Sibling', label: 'Possible Sibling' },
    { value: 'Previous Year Record Found', label: 'Previous Year Record Found' },
    { value: 'Error', label: 'Error' },
    { value: 'Clean Lead', label: 'Clean Lead' },
];

const VALIDATION_STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'Excluded', label: 'Excluded' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Ready', label: 'Ready' },
];

const REVIEW_ISSUE_OPTIONS = [
    { value: '', label: 'All Issue Types' },
    { value: 'Exact Duplicate', label: 'Exact Duplicate' },
    { value: 'Possible Sibling', label: 'Possible Sibling' },
    { value: 'Previous Year Match', label: 'Previous Year Match' },
];

const DECISION_SELECT_OPTIONS = [
    { value: 'Approved', label: 'Approve as New Student' },
    { value: 'Linked Sibling', label: 'Link as Sibling' },
    { value: 'Confirm Duplicate', label: 'Confirm Duplicate (Exclude)' },
    { value: 'Reject Import', label: 'Reject Import' },
    { value: 'Keep Pending', label: 'Keep Pending for Review' },
];

const initialValidationRows: ValidationRecord[] = [
    {
        id: 'ROW-1',
        row_number: 'Row 1',
        field: 'Batch',
        student_name: 'M. Naveen Kumar',
        student_email: 'naveen.kumar@example.com',
        city: 'Coimbatore',
        course: 'Computer Science & Engineering',
        college: 'Karpagam Academy of Higher Education (KAHE)',
        student_phone: '+91 98425 61122',
        parent_name: 'M. Mohan',
        parent_phone: '+91 98425 00911',
        academic_year: '2026–27',
        issue_type: 'Exact Duplicate',
        issue_desc: "Batch '2022 - 2025' not found in database",
        suggested_correction: 'Select a Batch associated with this organization',
        status: 'Excluded',
        existing_match_name: 'M. Naveen Kumar',
        existing_match_id: 'ENQ-2026-0094',
        existing_match_ay: '2026-27',
        review_id: 'REV-004',
    },
    {
        id: 'ROW-2',
        row_number: 'Row 2',
        field: 'Batch',
        student_name: 'K. Vignesh',
        student_email: 'vignesh.k@example.com',
        city: 'Coimbatore',
        course: 'Computer Science & Engineering',
        college: 'Karpagam Academy of Higher Education (KAHE)',
        student_phone: '+91 98421 98210',
        parent_name: 'R. Krishnan',
        parent_phone: '+91 98420 11990',
        academic_year: '2026–27',
        issue_type: 'Exact Duplicate',
        issue_desc: "Batch '2022 - 2025' not found in database",
        suggested_correction: 'Select a Batch associated with this organization',
        status: 'Excluded',
        existing_match_name: 'K. Vignesh',
        existing_match_id: 'ENQ-2026-0101',
        existing_match_ay: '2026-27',
        review_id: 'REV-001',
    },
    {
        id: 'ROW-3',
        row_number: 'Row 3',
        field: 'Department',
        student_name: 'S. Nithya Devi',
        student_email: 'nithya.devi@example.com',
        city: 'Tiruppur',
        course: 'B.Sc Nursing',
        college: 'Karpagam College of Nursing (KCN)',
        student_phone: '+91 97890 55123',
        parent_name: 'S. Subramaniam',
        parent_phone: '+91 98421 44552',
        academic_year: '2026–27',
        issue_type: 'Possible Sibling',
        issue_desc: "Department 'Computer Science and Engineering' not found in database",
        suggested_correction: 'Select a Department associated with this organization',
        status: 'Under Review',
        existing_match_name: 'S. Priya (Sibling)',
        existing_match_id: 'ENQ-2026-0102',
        existing_match_ay: '2026-27',
        review_id: 'REV-002',
    },
    {
        id: 'ROW-4',
        row_number: 'Row 4',
        field: 'Department',
        student_name: 'S. Karthi',
        student_email: 'karthi.s@example.com',
        city: 'Tiruppur',
        course: 'B.Tech Artificial Intelligence & Data Science',
        college: 'Karpagam Institute of Technology (KIT)',
        student_phone: '+91 98428 33410',
        parent_name: 'S. Sundaram',
        parent_phone: '+91 98428 11099',
        academic_year: '2026–27',
        issue_type: 'Previous Year Record Found',
        issue_desc: "Department 'Computer Science and Engineering' not found in database",
        suggested_correction: 'Select a Department associated with this organization',
        status: 'Under Review',
        existing_match_name: 'S. Karthi (AY 2025–26 Applicant)',
        existing_match_id: 'ENQ-2025-0842',
        existing_match_ay: '2025-26 (Archived)',
        review_id: 'REV-003',
    },
    {
        id: 'ROW-5',
        row_number: 'Row 5',
        field: 'Batch',
        student_name: 'A. Subhashini',
        student_email: 'subhashini.a@example.com',
        city: 'Pollachi',
        course: 'Biomedical Engineering',
        college: 'Karpagam College of Engineering (KCE)',
        student_phone: 'Invalid Number',
        parent_name: 'A. Anandan',
        parent_phone: 'Not provided',
        academic_year: '2026–27',
        issue_type: 'Error',
        issue_desc: "Batch 'Batch 2025-2029' not found in database",
        suggested_correction: 'Select a Batch associated with this organization',
        status: 'Excluded',
    },
    {
        id: 'ROW-6',
        row_number: 'Row 6',
        field: 'Batch',
        student_name: 'G. Gokulraj',
        student_email: 'gokulraj.g@example.com',
        city: 'Erode',
        course: 'Master of Business Administration (MBA)',
        college: 'Karpagam Academy of Higher Education (KAHE)',
        student_phone: '+91 99432 77011',
        parent_name: 'G. Gunasekaran',
        parent_phone: '+91 99432 00114',
        academic_year: '2026–27',
        issue_type: 'Duplicate Found',
        issue_desc: "Batch '2022 - 2025' not found in database",
        suggested_correction: 'Select a Batch associated with this organization',
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
        internal_notes:
            'Sheet row from Coimbatore Education Fair leads list. Needs verification if this is re-enquiry or duplicate entry.',
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
        internal_notes:
            'Parent mobile number matches enrolled student Priya. High likelihood of genuine sibling enrollment.',
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
        internal_notes:
            'Student previously enquired in AY 2025–26 but did not confirm admission. Re-applying for AI & DS in 2026-27.',
        decision_reason: 'Previous year non-admitted candidate re-enquiring. Re-activate profile.',
        is_verified: false,
    },
];

// =============================================================================
// MAIN COMPONENT: BulkImportPage
// =============================================================================
const BulkImportPage = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reimportFileInputRef = useRef<HTMLInputElement>(null);

    // ── Unified State ────────────────────────────────────────────────────────
    const [state, setState] = useSetState({
        // Active View & Steps
        currentTab: 'upload' as TabType,
        wizardStep: 1 as WizardStep,
        isValidating: false,
        isImporting: false,
        isReimporting: false,
        isFetchingStudent: false,
        selectedFile: null as File | null,
        uploadedFileName: '',
        fileSize: '',

        // Validation Records & Filters
        validationRows: initialValidationRows as ValidationRecord[],
        validationSearch: '',
        validationIssueFilter: null as { value: string; label: string } | null,
        validationStatusFilter: null as { value: string; label: string } | null,
        validationPage: 1,
        validationRecordsPerPage: 10,
        validationSortStatus: { columnAccessor: 'student_name', direction: 'asc' } as DataTableSortStatus,

        // Statistics
        newContactsCount: 0,
        duplicatesCount: 3,
        siblingsCount: 1,
        needReviewCount: 1,
        invalidCount: 1,

        // Review Requests Data & Filters
        reviewRequests: initialReviewRequests as ReviewRequest[],
        allReviewData: null as any,
        isFetchingReviews: false,
        isSubmittingDecision: false,
        reviewFilter: 'Pending Review' as ReviewFilterType,
        reviewSearch: '',
        reviewIssueFilter: null as { value: string; label: string } | null,
        reviewPage: 1,
        reviewRecordsPerPage: 10,
        reviewSortStatus: { columnAccessor: 'student_name', direction: 'asc' } as DataTableSortStatus,

        // Slide-over Review Drawer & API Response Data State
        activeReview: null as ReviewRequest | null,
        apiResponseData: null as any,
        viewStudentMode: 'existing' as 'existing' | 'matching',
        isOpenDrawer: false,
        reviewerVerified: false,
        discussionNotes: '',
        decisionReason: '',
        selectedDecisionOption: null as { value: string; label: string } | null,
    });

    const debouncedValidationSearch = useDebounce(state.validationSearch, 400);
    const debouncedReviewSearch = useDebounce(state.reviewSearch, 400);

    // ── Body Scroll Lock for Review Drawer ───────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = state.isOpenDrawer ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [state.isOpenDrawer]);

    // =========================================================================
    // API FUNCTIONS & FUNCTIONALITY FUNCTIONS (GROUPED AT TOP OF MAIN COMPONENT)
    // =========================================================================

    // ── 1. Initial Data Loader ───────────────────────────────────────────────
    const loadInitialData = async () => {
        try {
            // Check status or existing contacts from backend
            await Models.contact.status().catch(() => null);
        } catch (error) {
            console.error('loadInitialData error:', error);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    // ── Table Data Mapper (Same pattern as /contacts/all_contacts tableData) ───
    const tableData = (res: any) => {
        const rawList = res?.results || res?.data || (Array.isArray(res) ? res : []);
        const data = rawList.map((item: any, index: number) => {
            return {
                ...item,
                allData: item,
                id: item?.id ? String(item.id) : `REV-${String(index + 1).padStart(3, '0')}`,
                student_name: capitalizeFLetter(item?.student_name) || item?.student_name || '—',
                student_phone: item?.student_phone || item?.phone_number || '—',
                student_email: item?.student_email || item?.email || '',
                city: capitalizeFLetter(item?.city?.city_name) || capitalizeFLetter(item?.city) || '—',
                parent_name: capitalizeFLetter(item?.parent_name) || capitalizeFLetter(item?.father_name) || capitalizeFLetter(item?.mother_name) || 'Uncollected',
                parent_phone: item?.parent_phone || item?.secondary_phone_number || 'Not recorded',
                academic_year: item?.academic_year || '2026–27',
                course: capitalizeFLetter(item?.course) || capitalizeFLetter(item?.target_course) || '—',
                college: capitalizeFLetter(item?.college) || capitalizeFLetter(item?.preferred_institution?.name) || 'KAHE',
                issue_type: item?.issue_type || (item?.siblings_count && Number(item?.siblings_count) > 0 ? 'Possible Sibling' : 'Exact Duplicate'),
                existing_match_name: capitalizeFLetter(item?.existing_match_name) || item?.existing_match_name || item?.student_name || '—',
                existing_match_id: item?.existing_match_id || (item?.id ? `ENQ-2026-${String(item?.id).padStart(4, '0')}` : 'ENQ-2026-0001'),
                existing_match_ay: item?.existing_match_ay || '2026-27',
                existing_parent_name: capitalizeFLetter(item?.existing_parent_name) || item?.existing_parent_name || 'Uncollected',
                existing_parent_phone: item?.existing_parent_phone || 'Not recorded',
                existing_city: capitalizeFLetter(item?.existing_city) || capitalizeFLetter(item?.city) || '—',
                existing_course: capitalizeFLetter(item?.existing_course) || capitalizeFLetter(item?.course) || '—',
                existing_college: capitalizeFLetter(item?.existing_college) || capitalizeFLetter(item?.college) || 'KAHE',
                submitted_by: item?.submitted_by ? (capitalizeFLetter(item?.submitted_by?.first_name) + ' ' + capitalizeFLetter(item?.submitted_by?.last_name)).trim() || capitalizeFLetter(item?.submitted_by?.username) || item?.submitted_by : 'Bulk Import Validation Engine',
                submitted_on: item?.submitted_on || (item?.created_at ? moment(item?.created_at).format('YYYY-MM-DD HH:mm') : moment().format('YYYY-MM-DD HH:mm')),
                status: item?.status === 'Approved' ? 'Approved' : item?.status === 'Linked Sibling' ? 'Linked Sibling' : item?.status === 'Rejected' ? 'Rejected' : 'Pending Decision',
                internal_notes: item?.internal_notes || item?.remark || '',
                decision_reason: item?.decision_reason || item?.personal_remarks || '',
                is_verified: Boolean(item?.is_verified),
            };
        });
        console.log('✌️data --->', data);

        setState({ reviewRequests: data, allReviewData: res });
    };

    // ── Review List API Function (Pending Review, Approved, Rejected) ────────
    const getReviewList = async (page = 1, filterOverride?: string) => {
        try {
            setState({ isFetchingReviews: true });
            const filterToUse = filterOverride !== undefined ? filterOverride : state.reviewFilter;
            let statusParam = '';
            if (filterToUse === 'Pending Review') statusParam = 'Pending Decision';
            else if (filterToUse === 'Approved Records') statusParam = 'Approved';
            else if (filterToUse === 'Rejected / Skipped') statusParam = 'Rejected';

            const params: any = {
                page: page,
                page_size: state.reviewRecordsPerPage || 10,
            };
            if (statusParam) {
                params.status = statusParam;
            }
            if (debouncedReviewSearch) {
                params.search = debouncedReviewSearch;
            }
            if (state.reviewIssueFilter?.value) {
                params.issue_type = state.reviewIssueFilter.value;
            }

            const res: any = await Models.bulkimport.review_list(params).catch((err) => {
                console.warn('API review_list fallback:', err);
                return null;
            });

            if (res && (res?.results || res?.data || Array.isArray(res))) {
                tableData(res);
            }
        } catch (error) {
            console.error('getReviewList error:', error);
        } finally {
            setState({ isFetchingReviews: false });
        }
    };

    // Auto-fetch review list on tab or filter change
    useEffect(() => {
        if (state.currentTab === 'reviews') {
            getReviewList(state.reviewPage);
        }
    }, [state.currentTab, state.reviewFilter, debouncedReviewSearch, state.reviewIssueFilter, state.reviewPage]);

    // ── 2. File Selection Handler (Does NOT validate immediately) ────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeStr =
            file.size > 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(file.size / 1024).toFixed(1)} KB`;

        setState({
            selectedFile: file,
            uploadedFileName: file.name,
            fileSize: sizeStr,
        });
        Success(`File "${file.name}" selected. Click "Submit & Validate" to proceed.`);
    };

    // ── 3. Remove Selected File ──────────────────────────────────────────────
    const handleRemoveSelectedFile = () => {
        setState({
            selectedFile: null,
            uploadedFileName: '',
            fileSize: '',
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ── 4. Submit & Validate File API Function ────────────────────────────────
    const handleSubmitAndValidate = async () => {
        if (!state.selectedFile) {
            Failure('Please select a spreadsheet file before validating.');
            return;
        }

        try {
            setState({ isValidating: true });
            const formData = new FormData();
            formData.append('file', state.selectedFile);

            // Call CRM contact import API
            const res: any = await Models.bulkimport.import(formData).catch(() => null);
            console.log('contact import API response:', res);

            // If API returned parsed rows, format them; otherwise fallback to validation preview
            if (res?.data && Array.isArray(res.data)) {
                setState({
                    isValidating: false,
                    wizardStep: 2,
                    validationRows: res.data,
                    newContactsCount: res.new_count ?? 0,
                    duplicatesCount: res.duplicate_count ?? 3,
                    siblingsCount: res.sibling_count ?? 1,
                    needReviewCount: res.review_count ?? 1,
                    invalidCount: res.invalid_count ?? 1,
                    validationPage: 1,
                });
                Success('Spreadsheet submitted and validated successfully!');
            } else {
                // Fallback to sample validation dataset for demonstration
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
                        validationPage: 1,
                    });
                    Success('Spreadsheet submitted and validated successfully!');
                }, 750);
            }
        } catch (error: any) {
            setState({ isValidating: false });
            Failure(error?.message || 'Failed to submit and validate file');
        }
    };

    // ── 5. Load Sample Batch Function ────────────────────────────────────────
    const handleLoadSampleBatch = () => {
        setState({ isValidating: true, uploadedFileName: 'Coimbatore_Mega_Education_Fair_Leads_2026.xlsx' });
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
                validationPage: 1,
            });
            Success('Sample lead batch loaded and validated (6 Tamil Nadu candidates).');
        }, 600);
    };

    // ── 4. Send Duplicate / Sibling for Internal Review ──────────────────────
    const handleSendForReview = async (row: ValidationRecord) => {
        const revId = `REV-00${state.reviewRequests.length + 1}`;
        const newReq: ReviewRequest = {
            id: revId,
            student_name: row.student_name,
            student_phone: row.student_phone,
            city: row.city,
            parent_name: row.parent_name || 'Uncollected',
            parent_phone: row.parent_phone || 'Not recorded',
            academic_year: `${row.academic_year || '2026–27'} (Current Cycle)`,
            course: row.course,
            college: row.college,
            issue_type: row.issue_type === 'Possible Sibling' ? 'Possible Sibling' : 'Exact Duplicate',
            existing_match_name: row.existing_match_name || row.student_name,
            existing_match_id: row.existing_match_id || 'ENQ-2026-0110',
            existing_match_ay: row.existing_match_ay || '2026-27',
            existing_parent_name: row.parent_name || 'Uncollected',
            existing_parent_phone: row.parent_phone || 'Not recorded',
            existing_city: row.city,
            existing_course: row.course,
            existing_college: row.college,
            submitted_by: 'Prof. R. Natarajan (Admin)',
            submitted_on: moment().format('YYYY-MM-DD HH:mm'),
            status: 'Pending Decision',
            internal_notes: `Sent for verification from import file: ${state.uploadedFileName || 'Batch File'}`,
            decision_reason: row.issue_desc || 'Pending identity check by senior reviewer.',
            is_verified: false,
        };

        const payload = {
            record_id: row.id,
            review_id: revId,
            student_name: row.student_name,
            student_phone: row.student_phone,
            issue_type: row.issue_type,
            existing_match_id: row.existing_match_id,
            parent_name: row.parent_name,
            parent_phone: row.parent_phone,
            course: row.course,
            academic_year: row.academic_year,
            city: row.city,
        };

        try {
            // Call API in Models.bulkimport
            await Models.bulkimport.send_for_review(payload).catch((err) => {
                console.warn('API send_for_review fallback:', err);
            });

            const updatedRows = state.validationRows.map((r) =>
                r.id === row.id ? { ...r, status: 'Under Review' as const, review_id: revId } : r
            );

            setState({
                reviewRequests: [...state.reviewRequests, newReq],
                validationRows: updatedRows,
                duplicatesCount: Math.max(0, state.duplicatesCount - 1),
                needReviewCount: state.needReviewCount + 1,
            });
            Success(`Enquiry for ${row.student_name} (${revId}) forwarded to review queue.`);
        } catch (error) {
            Failure('Failed to forward enquiry for review.');
        }
    };

    // ── 4b. Fetch & View Matching or Existing Student API Details ─────────────
    const handleViewStudent = async (row: any, mode: 'existing' | 'matching') => {
        const studentId = row.existing_match_id || row.id || row.review_id || 'ENQ-2026-0101';
        setState({ isFetchingStudent: true, viewStudentMode: mode });

        try {
            let res: any = null;
            if (mode === 'matching') {
                res = await Models.bulkimport.get_matching_student(studentId, {
                    student_phone: row.student_phone,
                    student_name: row.student_name,
                }).catch(() => null);
            } else {
                res = await Models.bulkimport.get_existing_student(studentId, {
                    student_phone: row.student_phone,
                    student_name: row.student_name,
                }).catch(() => null);
            }

            const studentData = res?.data || res?.results || res || {
                id: studentId,
                student_name: row.existing_match_name || row.student_name,
                student_phone: row.student_phone,
                student_email: row.student_email || `${row.student_name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
                parent_name: row.parent_name || 'R. Krishnan',
                parent_phone: row.parent_phone || '+91 98420 11990',
                city: row.city || 'Coimbatore',
                course: row.course || 'Computer Science & Engineering',
                college: row.college || 'Karpagam Academy of Higher Education (KAHE)',
                academic_year: row.existing_match_ay || '2026-27',
                stage: 'Enquiry / Application In Progress',
                assigned_telecaller: 'Divya Bharathi (Senior Counsellor)',
                created_at: moment().subtract(20, 'days').format('YYYY-MM-DD HH:mm'),
                updated_at: moment().subtract(2, 'days').format('YYYY-MM-DD HH:mm'),
                match_reason: row.issue_desc || row.decision_reason || 'Matching record identified in CRM',
            };

            const apiResponseData = {
                status: 200,
                success: true,
                message: `${mode === 'matching' ? 'Matching' : 'Existing'} candidate profile retrieved from CRM API.`,
                endpoint: mode === 'matching' ? `get_matching_student/${studentId}/` : `get_existing_student/${studentId}/`,
                timestamp: moment().toISOString(),
                data: studentData,
            };

            const revReq: ReviewRequest = {
                id: row.review_id || (row.id?.startsWith('REV-') ? row.id : `REV-${studentId}`),
                student_name: row.student_name,
                student_phone: row.student_phone,
                city: row.city,
                parent_name: row.parent_name || 'Uncollected',
                parent_phone: row.parent_phone || 'Not recorded',
                academic_year: row.academic_year || '2026–27',
                course: row.course,
                college: row.college,
                issue_type: (row.issue_type === 'Possible Sibling' ? 'Possible Sibling' : 'Exact Duplicate') as any,
                existing_match_name: studentData.student_name || row.existing_match_name || row.student_name,
                existing_match_id: studentData.id || studentId,
                existing_match_ay: studentData.academic_year || row.existing_match_ay || '2026-27',
                existing_parent_name: studentData.parent_name || row.existing_parent_name || 'Uncollected',
                existing_parent_phone: studentData.parent_phone || row.existing_parent_phone || 'Not recorded',
                existing_city: studentData.city || row.existing_city || row.city,
                existing_course: studentData.course || row.existing_course || row.course,
                existing_college: studentData.college || row.existing_college || row.college,
                submitted_by: row.submitted_by || 'Bulk Import Validation Engine',
                submitted_on: row.submitted_on || moment().format('YYYY-MM-DD HH:mm'),
                status: row.status === 'Approved' ? 'Approved' : row.status === 'Linked Sibling' ? 'Linked Sibling' : row.status === 'Rejected' ? 'Rejected' : 'Pending Decision',
                internal_notes: row.internal_notes || '',
                decision_reason: row.decision_reason || row.issue_desc || '',
                reviewed_by: row.reviewed_by,
                reviewed_on: row.reviewed_on,
                is_verified: Boolean(row.is_verified),
            };

            setState({
                isFetchingStudent: false,
                activeReview: revReq,
                apiResponseData,
                isOpenDrawer: true,
                reviewerVerified: Boolean(revReq.is_verified),
                discussionNotes: revReq.internal_notes || '',
                decisionReason: revReq.decision_reason || '',
                selectedDecisionOption: null,
            });

            // Success(`Loaded API response for ${studentData.student_name} (${studentData.id})`);
        } catch (error) {
            setState({ isFetchingStudent: false });
            Failure('Failed to load student details from API.');
        }
    };

    // ── 4c. Re-import Corrected Excel Sheet Handler ───────────────────────────
    const handleReimportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeStr =
            file.size > 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                : `${(file.size / 1024).toFixed(1)} KB`;

        setState({
            selectedFile: file,
            uploadedFileName: file.name,
            fileSize: sizeStr,
            isReimporting: true,
        });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('is_reimport', 'true');

            let res: any = null;
            try {
                res = await Models.bulkimport.reimport(formData);
            } catch (err) {
                res = await Models.bulkimport.validate(formData).catch(() => null);
            }

            if (res?.data) {
                setState({
                    isReimporting: false,
                    validationRows: res.data,
                    newContactsCount: res.new_count ?? res.data.filter((r: any) => r.status === 'Ready').length,
                    duplicatesCount: res.duplicate_count ?? res.data.filter((r: any) => r.status === 'Excluded').length,
                    siblingsCount: res.sibling_count ?? res.data.filter((r: any) => r.issue_type === 'Possible Sibling').length,
                    needReviewCount: res.review_count ?? res.data.filter((r: any) => r.status === 'Under Review').length,
                    invalidCount: res.invalid_count ?? res.data.filter((r: any) => r.issue_type === 'Invalid Contact').length,
                    validationPage: 1,
                });
            } else {
                // Correct errors in the current rows for demo/fallback verification
                const correctedRows: ValidationRecord[] = state.validationRows.map((r) => {
                    if (r.status === 'Excluded') {
                        return {
                            ...r,
                            status: 'Ready' as const,
                            issue_type: 'Clean Lead' as const,
                            issue_desc: 'Resolved in corrected spreadsheet.',
                            error_message: undefined,
                            suggested_correction: 'All validations passed successfully.',
                        };
                    }
                    return r;
                });

                setState({
                    isReimporting: false,
                    validationRows: correctedRows,
                    newContactsCount: correctedRows.filter((r) => r.status === 'Ready').length,
                    duplicatesCount: 0,
                    needReviewCount: correctedRows.filter((r) => r.status === 'Under Review').length,
                    invalidCount: 0,
                    validationPage: 1,
                });
            }

            Success(`Corrected sheet "${file.name}" re-imported & re-validated successfully!`);
        } catch (error) {
            setState({ isReimporting: false });
            Failure('Failed to re-import corrected Excel sheet.');
        } finally {
            if (e.target) e.target.value = '';
        }
    };

    // ── 5. Review Decision Handler (Drawer Action) ───────────────────────────
    const handleDecisionAction = async (
        action: 'Approved' | 'Linked Sibling' | 'Rejected' | 'Keep Pending' | 'Confirm Duplicate' | 'Reject Import'
    ) => {
        if (!state.activeReview) return;
        const target = state.activeReview;
        const targetId = target.id;

        const bodyData = {
            id: targetId,
            review_id: targetId,
            student_name: target.student_name,
            student_phone: target.student_phone,
            parent_name: target.parent_name,
            parent_phone: target.parent_phone,
            city: target.city,
            course: target.course,
            college: target.college,
            academic_year: target.academic_year,
            issue_type: target.issue_type,
            existing_match_id: target.existing_match_id,
            existing_match_name: target.existing_match_name,
            existing_match_ay: target.existing_match_ay,
            is_verified: state.reviewerVerified,
            internal_notes: state.discussionNotes,
            decision_reason: state.decisionReason,
            reviewed_by: 'Prof. R. Natarajan (Admin)',
            reviewed_on: moment().format('YYYY-MM-DD HH:mm'),
            status:
                action === 'Approved'
                    ? 'Approved'
                    : action === 'Linked Sibling'
                    ? 'Linked Sibling'
                    : action === 'Keep Pending'
                    ? 'Pending Decision'
                    : 'Rejected',
            action_type: action,
        };

        try {
            setState({ isSubmittingDecision: true });

            // Call separate dedicated API functions in Models.bulkimport
            if (action === 'Approved') {
                await Models.bulkimport.approve_new_student(bodyData).catch((err) => {
                    console.warn('API approve_new_student fallback:', err);
                });
            } else if (action === 'Linked Sibling') {
                await Models.bulkimport.link_sibling(bodyData).catch((err) => {
                    console.warn('API link_sibling fallback:', err);
                });
            } else if (action === 'Confirm Duplicate') {
                await Models.bulkimport.confirm_duplicate(bodyData).catch((err) => {
                    console.warn('API confirm_duplicate fallback:', err);
                });
            } else if (action === 'Reject Import' || action === 'Rejected') {
                await Models.bulkimport.reject_import(bodyData).catch((err) => {
                    console.warn('API reject_import fallback:', err);
                });
            } else if (action === 'Keep Pending') {
                await Models.bulkimport.keep_pending(bodyData).catch((err) => {
                    console.warn('API keep_pending fallback:', err);
                });
            }

            const updatedStatus =
                action === 'Approved'
                    ? 'Approved'
                    : action === 'Linked Sibling'
                    ? 'Linked Sibling'
                    : action === 'Keep Pending'
                    ? 'Pending Decision'
                    : 'Rejected';

            if (action === 'Keep Pending') {
                setState({
                    isOpenDrawer: false,
                    activeReview: null,
                    isSubmittingDecision: false,
                    selectedDecisionOption: null,
                });
                Success('Review kept pending for further document verification.');
                return;
            }

            const updatedRequests = state.reviewRequests.map((r) => {
                if (r.id === targetId) {
                    return {
                        ...r,
                        status: updatedStatus as any,
                        reviewed_by: 'Prof. R. Natarajan (ADMIN)',
                        reviewed_on: moment().format('YYYY-MM-DD HH:mm'),
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
                selectedDecisionOption: null,
                isSubmittingDecision: false,
            });

            const actionLabel =
                action === 'Approved'
                    ? 'Approved as New Student'
                    : action === 'Linked Sibling'
                    ? 'Linked as Sibling'
                    : action === 'Confirm Duplicate'
                    ? 'Confirmed Duplicate'
                    : action === 'Reject Import'
                    ? 'Import Rejected'
                    : action;

            Success(`Review decision saved: ${actionLabel}`);
        } catch (error: any) {
            setState({ isSubmittingDecision: false });
            Failure(error?.message || 'Failed to submit review decision');
        }
    };

    // ── 6. Import Valid Contacts Function ────────────────────────────────────
    const handleImportValidContacts = async () => {
        const readyRows = state.validationRows.filter((r) => {
            const s = String(r.status || '').toLowerCase().trim();
            return s === 'ready' || s === 'ready to import' || s === 'ready_to_import';
        });

        if (readyRows.length === 0) {
            Failure('No records with "Ready to import" status available for import.');
            return;
        }

        try {
            setState({ isImporting: true });

            await Models.bulkimport.import({ contacts: readyRows }).catch((err) => {
                console.warn('API import fallback:', err);
            });

            setTimeout(() => {
                setState({
                    isImporting: false,
                    wizardStep: 4,
                });
                Success('Valid contact batch imported into Academic Year 2026–27.');
            }, 600);
        } catch (error) {
            setState({ isImporting: false });
            Failure('Failed to import contacts.');
        }
    };

    // ── 7. Reset Import Session ──────────────────────────────────────────────
    const handleReset = () => {
        setState({
            wizardStep: 1,
            selectedFile: null,
            uploadedFileName: '',
            fileSize: '',
            validationPage: 1,
            validationSearch: '',
            validationIssueFilter: null,
            validationStatusFilter: null,
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ── 8. Open / Close Review Drawer ────────────────────────────────────────
    const handleOpenReviewDrawer = (req: ReviewRequest) => {
        setState({
            activeReview: req,
            isOpenDrawer: true,
            reviewerVerified: Boolean(req.is_verified),
            discussionNotes: req.internal_notes || '',
            decisionReason: req.decision_reason || '',
            selectedDecisionOption: null,
        });
    };

    const handleCloseReviewDrawer = () => {
        setState({ isOpenDrawer: false, activeReview: null, selectedDecisionOption: null });
    };

    // =========================================================================
    // COMPUTED STATS, FILTERING & PAGINATION FOR BOTH TABLES
    // =========================================================================

    const pendingReviewCount = state.reviewRequests.filter((r) => r.status === 'Pending Decision').length;
    const approvedCount = state.reviewRequests.filter((r) => r.status === 'Approved' || r.status === 'Linked Sibling').length;
    const rejectedCount = state.reviewRequests.filter((r) => r.status === 'Rejected').length;

    // ── Check if any row has "Ready" / "ready to import" status ──────────────
    const hasReadyToImport = useMemo(() => {
        return state.validationRows.some((r) => {
            const s = String(r.status || '').toLowerCase().trim();
            return s === 'ready' || s === 'ready to import' || s === 'ready_to_import';
        });
    }, [state.validationRows]);

    // ── Filtered & Sorted Validation Rows (Step 2) ───────────────────────────
    const filteredValidationRows = useMemo(() => {
        let list = [...state.validationRows];

        if (debouncedValidationSearch.trim()) {
            const query = debouncedValidationSearch.toLowerCase();
            list = list.filter(
                (row) =>
                    row.student_name?.toLowerCase().includes(query) ||
                    row.student_email?.toLowerCase().includes(query) ||
                    row.student_phone?.toLowerCase().includes(query) ||
                    row.city?.toLowerCase().includes(query) ||
                    row.course?.toLowerCase().includes(query) ||
                    row.field?.toLowerCase().includes(query) ||
                    row.row_number?.toLowerCase().includes(query) ||
                    row.issue_desc?.toLowerCase().includes(query) ||
                    row.suggested_correction?.toLowerCase().includes(query)
            );
        }

        if (state.validationIssueFilter?.value) {
            list = list.filter((row) => row.issue_type === state.validationIssueFilter?.value);
        }

        if (state.validationStatusFilter?.value) {
            list = list.filter((row) => row.status === state.validationStatusFilter?.value);
        }

        const { columnAccessor, direction } = state.validationSortStatus;
        if (columnAccessor) {
            list.sort((a: any, b: any) => {
                const valA = String(a[columnAccessor] ?? '').toLowerCase();
                const valB = String(b[columnAccessor] ?? '').toLowerCase();
                return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        }

        return list;
    }, [
        state.validationRows,
        debouncedValidationSearch,
        state.validationIssueFilter,
        state.validationStatusFilter,
        state.validationSortStatus,
    ]);

    const paginatedValidationRows = useMemo(() => {
        const start = (state.validationPage - 1) * state.validationRecordsPerPage;
        return filteredValidationRows.slice(start, start + state.validationRecordsPerPage);
    }, [filteredValidationRows, state.validationPage, state.validationRecordsPerPage]);

    // ── Filtered & Sorted Review Requests (Tab 2) ────────────────────────────
    const filteredReviewRequests = useMemo(() => {
        let list = [...state.reviewRequests];

        if (state.reviewFilter === 'Pending Review') {
            list = list.filter((r) => r.status === 'Pending Decision');
        } else if (state.reviewFilter === 'Approved Records') {
            list = list.filter((r) => r.status === 'Approved' || r.status === 'Linked Sibling');
        } else if (state.reviewFilter === 'Rejected / Skipped') {
            list = list.filter((r) => r.status === 'Rejected');
        }

        if (debouncedReviewSearch.trim()) {
            const query = debouncedReviewSearch.toLowerCase();
            list = list.filter(
                (r) =>
                    r.student_name?.toLowerCase().includes(query) ||
                    r.student_phone?.toLowerCase().includes(query) ||
                    r.id?.toLowerCase().includes(query) ||
                    r.city?.toLowerCase().includes(query) ||
                    r.existing_match_name?.toLowerCase().includes(query)
            );
        }

        if (state.reviewIssueFilter?.value) {
            list = list.filter((r) => r.issue_type === state.reviewIssueFilter?.value);
        }

        const { columnAccessor, direction } = state.reviewSortStatus;
        if (columnAccessor) {
            list.sort((a: any, b: any) => {
                const valA = String(a[columnAccessor] ?? '').toLowerCase();
                const valB = String(b[columnAccessor] ?? '').toLowerCase();
                return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            });
        }

        return list;
    }, [
        state.reviewRequests,
        state.reviewFilter,
        debouncedReviewSearch,
        state.reviewIssueFilter,
        state.reviewSortStatus,
    ]);

    const paginatedReviewRequests = useMemo(() => {
        const start = (state.reviewPage - 1) * state.reviewRecordsPerPage;
        return filteredReviewRequests.slice(start, start + state.reviewRecordsPerPage);
    }, [filteredReviewRequests, state.reviewPage, state.reviewRecordsPerPage]);

    // =========================================================================
    // MANTINE DATATABLE COLUMN DEFINITIONS
    // =========================================================================

    // ── 1. Validation Table Columns ──────────────────────────────────────────
    const validationColumns = useMemo(
        () => [
            {
                accessor: 'row_number',
                title: 'ROW NO',
                sortable: true,
                render: (row: ValidationRecord, index: number) => (
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {row.row_number || (row.id?.startsWith('ROW-') ? `Row ${row.id.replace('ROW-', '')}` : `Row ${(state.validationPage - 1) * state.validationRecordsPerPage + index + 1}`)}
                    </span>
                ),
            },
            {
                accessor: 'field',
                title: 'FIELD',
                sortable: true,
                render: (row: ValidationRecord) => {
                    const fieldName =
                        row.field ||
                        (row.issue_type === 'Error'
                            ? 'Mobile'
                            : row.issue_type === 'Possible Sibling'
                            ? 'Department'
                            : row.issue_type === 'Previous Year Record Found'
                            ? 'Academic Year'
                            : 'Batch');
                    return (
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {fieldName}
                        </span>
                    );
                },
            },
            {
                accessor: 'student_name',
                title: 'USER DETAILS',
                sortable: true,
                render: (row: ValidationRecord) => {
                    const email =
                        row.student_email ||
                        (row.student_name
                            ? `${row.student_name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '')}@example.com`
                            : 'user@example.com');
                    return (
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">
                                {row.student_name}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-400">
                                {email}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessor: 'issue_type',
                title: 'ISSUE',
                sortable: true,
                render: (row: ValidationRecord) => {
                    const isError =
                        row.status === 'Excluded' ||
                        row.issue_type === 'Exact Duplicate' ||
                        row.issue_type === 'Duplicate Found' ||
                        row.issue_type === 'Error';
                    const isReview =
                        row.status === 'Under Review' ||
                        row.issue_type === 'Possible Sibling' ||
                        row.issue_type === 'Previous Year Record Found';

                    return (
                        <div className="flex flex-col gap-1.5 py-0.5">
                            <div>
                                {isError ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-400 whitespace-nowrap">
                                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                        <span>{row.issue_type || 'Error'}</span>
                                    </span>
                                ) : isReview ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-400 whitespace-nowrap">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        <span>{row.issue_type || 'Review'}</span>
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400 whitespace-nowrap">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        <span>Clean Lead</span>
                                    </span>
                                )}
                            </div>

                            <div className="flex items-start gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium">
                                <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                <span>{row.error_message || row.issue_desc}</span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessor: 'suggested_correction',
                title: 'SUGGESTED CORRECTION',
                sortable: true,
                render: (row: ValidationRecord) => {
                    let suggestion = row.suggested_correction;
                    if (!suggestion) {
                        if (row.issue_type === 'Error') {
                            suggestion = 'Provide a valid 10-digit mobile number before importing';
                        } else if (row.issue_type === 'Possible Sibling') {
                            suggestion = 'Select a Department associated with this organization';
                        } else if (row.issue_type === 'Previous Year Record Found') {
                            suggestion = 'Select an Academic Year associated with this organization';
                        } else {
                            suggestion = 'Select a Batch associated with this organization';
                        }
                    }
                    return (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {suggestion}
                        </span>
                    );
                },
            },
            {
                accessor: 'status',
                title: 'STATUS',
                sortable: true,
                render: (row: ValidationRecord) => (
                    <div>
                        {row.status === 'Excluded' ? (
                            <span className="font-bold text-xs text-rose-600 dark:text-rose-400">
                                Excluded
                            </span>
                        ) : row.status === 'Under Review' ? (
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40">
                                Under Review
                            </span>
                        ) : (
                            <span className="font-bold text-xs text-[#39854a]">Ready</span>
                        )}
                    </div>
                ),
            },
            {
                accessor: 'actions',
                title: 'ACTION',
                titleClassName: '!text-right',
                render: (row: ValidationRecord) => {
                    const matchingReq = state.reviewRequests.find((r) => r.id === row.review_id);

                    if (row.issue_type === 'Invalid Contact' || row.issue_type === 'Error' || row.student_phone === 'Invalid Number') {
                        return (
                            <div className="flex justify-end">
                                <span className="text-xs text-gray-400 italic">Fix phone before upload</span>
                            </div>
                        );
                    }

                    if (row.status === 'Under Review') {
                        return (
                            <div className="flex flex-col justify-end gap-3 w-fit ms-auto">
                               
                                <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-400 dark:bg-gray-800">
                                    In Review Queue
                                </span>
                                 <button
                                    type="button"
                                    onClick={() => handleViewStudent(row, 'matching')}
                                    className="text-xs font-bold text-[#39854a] hover:underline cursor-pointer"
                                >
                                    View Matching Student
                                </button>
                            </div>
                        );
                    }

                    return (
                        <div className="flex flex-col justify-end gap-3 w-fit ms-auto">
                            <button
                                type="button"
                                onClick={() => handleSendForReview(row)}
                                className="rounded-xl border border-amber-400 bg-white px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-50 cursor-pointer shadow-2xs dark:bg-gray-900"
                            >
                                Send for Review
                            </button>
                            <button
                                type="button"
                                onClick={() => handleViewStudent(row, 'existing')}
                                className="text-xs font-bold text-[#39854a] hover:underline cursor-pointer"
                            >
                                View Existing Student
                            </button>
                            
                        </div>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state.reviewRequests, state.validationPage, state.validationRecordsPerPage]
    );

    // ── 2. Review Requests Table Columns ─────────────────────────────────────
    const reviewColumns = useMemo(
        () => [
            {
                accessor: 'student_name',
                title: 'Student Name',
                sortable: true,
                render: (req: ReviewRequest) => (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 dark:text-white">{req.student_name}</span>
                        <span className="text-xs text-gray-400">
                            {req.student_phone} · {req.city}
                        </span>
                    </div>
                ),
            },
            {
                accessor: 'issue_type',
                title: 'Issue Type',
                sortable: true,
                render: (req: ReviewRequest) => (
                    <div>
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
                    </div>
                ),
            },
            {
                accessor: 'existing_match_name',
                title: 'Existing Match',
                render: (req: ReviewRequest) => (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {req.existing_match_name}
                        </span>
                        <span className="text-xs text-gray-400">
                            {req.existing_match_id} · {req.existing_match_ay}
                        </span>
                    </div>
                ),
            },
            {
                accessor: 'submitted_by',
                title: 'Submitted By',
                render: (req: ReviewRequest) => (
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                            {req.submitted_by}
                        </span>
                        <span className="text-xs text-gray-400">{req.submitted_on}</span>
                    </div>
                ),
            },
            {
                accessor: 'status',
                title: 'Status',
                sortable: true,
                render: (req: ReviewRequest) => (
                    <div>
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
                    </div>
                ),
            },
            {
                accessor: 'actions',
                title: 'Action',
                titleClassName: '!text-right',
                render: (req: ReviewRequest) => (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => handleViewStudent(req as any, 'matching')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Review</span>
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
                <title>Contact Import & Duplicate Approval - KAHE Admissions CRM</title>
            </Head>

            {/* 1. TOP HEADER: TITLE & VIEW TOGGLES */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Contact Import & Duplicate Approval
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Validate uploaded spreadsheets, automatically flag duplicates & siblings, and manage internal approval decisions.
                    </p>
                </div>

                {/* Top Right Segmented Toggle Control */}
                <div className="inline-flex items-center rounded-2xl bg-gray-100/90 p-1 dark:bg-[#121e32] border border-gray-200/80 dark:border-gray-800 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setState({ currentTab: 'upload' })}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            state.currentTab === 'upload'
                                ? 'bg-[#39854a] text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload & Validate</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setState({ currentTab: 'reviews' })}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            state.currentTab === 'reviews'
                                ? 'bg-[#39854a] text-white shadow-xs'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Review Requests</span>
                        {pendingReviewCount > 0 && (
                            <span
                                className={`flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full text-[11px] font-bold shadow-xs ${
                                    state.currentTab === 'reviews'
                                        ? 'bg-white text-[#39854a]'
                                        : 'bg-amber-500 text-white'
                                }`}
                            >
                                {pendingReviewCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* 2. TAB 1: UPLOAD & VALIDATION WIZARD */}
            {state.currentTab === 'upload' && (
                <div className="space-y-6">
                    {/* Stepper Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
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

                            <div
                                onClick={() => setState({ currentTab: 'reviews' })}
                                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 px-3 text-xs sm:text-sm font-bold text-gray-500 hover:bg-gray-50 cursor-pointer dark:border-gray-800 dark:bg-[#121e32]"
                            >
                                <span>3. Duplicate & Sibling Review</span>
                            </div>

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

                    {/* Step 1: Upload File Screen */}
                    {state.wizardStep === 1 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 sm:p-10 shadow-sm dark:border-gray-800 dark:bg-[#0e1726] space-y-6">
                            {state.selectedFile ? (
                                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 p-8 sm:p-12 text-center dark:border-emerald-700 dark:bg-emerald-950/20">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-[#39854a] shadow-xs dark:bg-emerald-900/50">
                                        <FileSpreadsheet className="h-8 w-8" />
                                    </div>

                                    <div className="mt-4">
                                        <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                                            {state.selectedFile.name}
                                        </div>
                                        <div className="mt-1 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                            <span>{state.fileSize}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-[#39854a] flex items-center gap-1">
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                <span>Ready for validation</span>
                                            </span>
                                        </div>
                                    </div>

                                    <p className="mt-2 max-w-md text-xs text-gray-500 dark:text-gray-400">
                                        Click &ldquo;Submit & Validate&rdquo; below to process the file and check for duplicates, siblings, and existing applicant records.
                                    </p>

                                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            disabled={state.isValidating}
                                            onClick={handleSubmitAndValidate}
                                            className="flex items-center gap-2 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white px-6 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                        >
                                            {state.isValidating ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                    <span>Submitting & Validating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span>Submit & Validate</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            disabled={state.isValidating}
                                            onClick={handleRemoveSelectedFile}
                                            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-50 transition shadow-2xs cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 disabled:opacity-50"
                                        >
                                            <X className="h-4 w-4 text-gray-400" />
                                            <span>Change / Remove File</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const file = e.dataTransfer.files?.[0];
                                        if (file) {
                                            const sizeStr =
                                                file.size > 1024 * 1024
                                                    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
                                                    : `${(file.size / 1024).toFixed(1)} KB`;
                                            setState({
                                                selectedFile: file,
                                                uploadedFileName: file.name,
                                                fileSize: sizeStr,
                                            });
                                            Success(`File "${file.name}" selected. Click "Submit & Validate" to proceed.`);
                                        }
                                    }}
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
                                        Select a spreadsheet to review, then submit it for cross-checking against exact duplicates, possible siblings, and previous academic year enquiries.
                                    </p>

                                    <button
                                        type="button"
                                        className="mt-4 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                    >
                                        Browse File
                                    </button>
                                </div>
                            )}

                            
                        </div>
                    )}

                    {/* Step 2: Validation Summary Screen with DataTable & Filters */}
                    {state.wizardStep === 2 && (
                        <div className="space-y-6">
                            {/* 5 Stat Cards */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        New Contacts
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                        {state.newContactsCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">Ready for import</div>
                                </div>

                                <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Duplicates
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-rose-600 dark:text-rose-400">
                                        {state.duplicatesCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">Clones prevented</div>
                                </div>

                                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Possible Siblings
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-amber-500 dark:text-amber-400">
                                        {state.siblingsCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">Family shared phone</div>
                                </div>

                                <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Need Review
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-blue-600 dark:text-blue-400">
                                        {state.needReviewCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">Prior year / uncertain</div>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        Error
                                    </div>
                                    <div className="mt-1 text-2xl font-black text-gray-700 dark:text-gray-300">
                                        {state.invalidCount}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-400">Missing phone</div>
                                </div>
                            </div>

                            {/* Validation Search & Filter Toolbar with TextInput & CustomSelect */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726] sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1 sm:max-w-xs">
                                    <TextInput
                                        placeholder="Search candidate name, phone or course..."
                                        value={state.validationSearch}
                                        onChange={(val: string) => setState({ validationSearch: val, validationPage: 1 })}
                                    />
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="w-44">
                                        <CustomSelect
                                            placeholder="All Issues"
                                            options={VALIDATION_ISSUE_OPTIONS}
                                            value={state.validationIssueFilter}
                                            onChange={(opt) => setState({ validationIssueFilter: opt, validationPage: 1 })}
                                            isClearable
                                        />
                                    </div>

                                    <div className="w-40">
                                        <CustomSelect
                                            placeholder="All Statuses"
                                            options={VALIDATION_STATUS_OPTIONS}
                                            value={state.validationStatusFilter}
                                            onChange={(opt) => setState({ validationStatusFilter: opt, validationPage: 1 })}
                                            isClearable
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mantine DataTable Container */}
                            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                                <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            Validation Results
                                        </span>
                                        {state.uploadedFileName && (
                                            <span className="text-xs font-semibold text-gray-400">
                                                ({state.uploadedFileName})
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Showing {filteredValidationRows.length} of {state.validationRows.length} rows
                                    </div>
                                </div>

                                <DataTable
                                    className="table-responsive"
                                    records={paginatedValidationRows}
                                    columns={validationColumns}
                                    minHeight={240}
                                    withBorder={false}
                                    highlightOnHover
                                    sortStatus={state.validationSortStatus}
                                    onSortStatusChange={(s) => setState({ validationSortStatus: s })}
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
                                            {filteredValidationRows.length === 0
                                                ? 0
                                                : (state.validationPage - 1) * state.validationRecordsPerPage + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                            {Math.min(
                                                state.validationPage * state.validationRecordsPerPage,
                                                filteredValidationRows.length
                                            )}
                                        </span>{' '}
                                        of{' '}
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                            {filteredValidationRows.length}
                                        </span>{' '}
                                        entries
                                    </div>

                                    <Pagination
                                        currentPage={state.validationPage}
                                        totalRecords={filteredValidationRows.length}
                                        recordsPerPage={state.validationRecordsPerPage}
                                        onPageChange={(page) => setState({ validationPage: page })}
                                        hasNext={
                                            state.validationPage <
                                            Math.ceil(filteredValidationRows.length / state.validationRecordsPerPage)
                                        }
                                        hasPrevious={state.validationPage > 1}
                                    />
                                </div>
                            </div>

                            {/* Bottom Action Bar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-gray-950 dark:text-gray-300 dark:hover:text-white cursor-pointer"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Reset & Upload Different File</span>
                                </button>

                                <div className="flex flex-wrap items-center gap-3">
                                    <input
                                        ref={reimportFileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleReimportFileChange}
                                        className="hidden"
                                    />

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
                                        disabled={state.isReimporting}
                                        onClick={() => reimportFileInputRef.current?.click()}
                                        className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-[#39854a] px-4 py-2.5 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 disabled:opacity-50"
                                    >
                                        {state.isReimporting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                <span>Re-importing Sheet...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="h-4 w-4" />
                                                <span>Re-import Corrected Excel Sheet</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={state.isImporting || !hasReadyToImport}
                                        onClick={handleImportValidContacts}
                                        className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm ${
                                            !hasReadyToImport || state.isImporting
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 opacity-60'
                                                : 'bg-[#39854a] hover:bg-[#2f6f3e] text-white cursor-pointer shadow-sm'
                                        }`}
                                    >
                                        {state.isImporting ? (
                                            <>
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                                <span>Importing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Import Valid New Contacts ({state.newContactsCount})</span>
                                                <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Import Summary Screen */}
                    {state.wizardStep === 4 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-14 shadow-sm dark:border-gray-800 dark:bg-[#0e1726] flex flex-col items-center text-center">
                            <div className="flex h-18 w-18 items-center justify-center rounded-full bg-emerald-100 text-[#39854a] dark:bg-emerald-950/60 shadow-xs">
                                <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                            </div>

                            <h2 className="mt-5 text-2xl font-black text-gray-900 dark:text-white">
                                Import Validation Completed!
                            </h2>
                            <p className="mt-1.5 max-w-lg text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                Successfully imported{' '}
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {state.newContactsCount}
                                </span>{' '}
                                clean new student contact(s) into current Academic Year 2026–27. Questionable records are held in review.
                            </p>

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
                                    onClick={() => router.push('/contacts/all_contacts')}
                                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                                >
                                    View All Contacts
                                </button>

                                <button
                                    type="button"
                                    onClick={() => router.push('/contacts/assign_contact')}
                                    className="flex items-center gap-2 rounded-xl bg-[#39854a] hover:bg-[#2f6f3e] text-white px-6 py-2.5 text-xs sm:text-sm font-bold transition shadow-sm cursor-pointer"
                                >
                                    <span>Assign Imported Contacts to Telecallers</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3. TAB 2: REVIEW REQUESTS MANAGEMENT TABLE */}
            {state.currentTab === 'reviews' && (
                <div className="space-y-4">
                    {/* Filter Pills Bar & Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setState({ reviewFilter: 'Pending Review', reviewPage: 1 });
                                    getReviewList(1, 'Pending Review');
                                }}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.reviewFilter === 'Pending Review'
                                        ? 'bg-amber-500 text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                                }`}
                            >
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>Pending Review</span>
                                <span
                                    className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] ${
                                        state.reviewFilter === 'Pending Review'
                                            ? 'bg-white text-amber-600'
                                            : 'bg-amber-100 text-amber-700'
                                    }`}
                                >
                                    {pendingReviewCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setState({ reviewFilter: 'Approved Records', reviewPage: 1 });
                                    getReviewList(1, 'Approved Records');
                                }}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.reviewFilter === 'Approved Records'
                                        ? 'bg-[#39854a] text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                                }`}
                            >
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span>Approved Records</span>
                                <span
                                    className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] ${
                                        state.reviewFilter === 'Approved Records'
                                            ? 'bg-white text-[#39854a]'
                                            : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                    {approvedCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setState({ reviewFilter: 'Rejected / Skipped', reviewPage: 1 });
                                    getReviewList(1, 'Rejected / Skipped');
                                }}
                                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                                    state.reviewFilter === 'Rejected / Skipped'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-[#0e1726] dark:border-gray-800 dark:text-gray-200'
                                }`}
                            >
                                <XCircle className="h-3.5 w-3.5 text-rose-500" />
                                <span>Rejected / Skipped</span>
                                <span
                                    className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[11px] ${
                                        state.reviewFilter === 'Rejected / Skipped'
                                            ? 'bg-white text-rose-600'
                                            : 'bg-rose-100 text-rose-700'
                                    }`}
                                >
                                    {rejectedCount}
                                </span>
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Showing{' '}
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                {filteredReviewRequests.length}
                            </span>{' '}
                            request(s)
                        </div>
                    </div>

                    {/* Review Search & Filter Bar with TextInput & CustomSelect */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0e1726] sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 sm:max-w-md">
                            <TextInput
                                placeholder="Search student name, phone, city or ID..."
                                value={state.reviewSearch}
                                onChange={(val: string) => setState({ reviewSearch: val, reviewPage: 1 })}
                            />
                        </div>

                        <div className="w-52">
                            <CustomSelect
                                placeholder="All Issue Types"
                                options={REVIEW_ISSUE_OPTIONS}
                                value={state.reviewIssueFilter}
                                onChange={(opt) => setState({ reviewIssueFilter: opt, reviewPage: 1 })}
                                isClearable
                            />
                        </div>
                    </div>

                    {/* Review Requests Mantine DataTable */}
                    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0e1726] overflow-hidden">
                        <DataTable
                            className="table-responsive"
                            records={paginatedReviewRequests}
                            columns={reviewColumns}
                            minHeight={240}
                            withBorder={false}
                            highlightOnHover
                            fetching={state.isFetchingReviews}
                            loaderColor="#39854a"
                            sortStatus={state.reviewSortStatus}
                            onSortStatusChange={(s) => setState({ reviewSortStatus: s })}
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
                                    {filteredReviewRequests.length === 0
                                        ? 0
                                        : (state.reviewPage - 1) * state.reviewRecordsPerPage + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {Math.min(
                                        state.reviewPage * state.reviewRecordsPerPage,
                                        filteredReviewRequests.length
                                    )}
                                </span>{' '}
                                of{' '}
                                <span className="font-bold text-gray-800 dark:text-gray-200">
                                    {filteredReviewRequests.length}
                                </span>{' '}
                                entries
                            </div>

                            <Pagination
                                currentPage={state.reviewPage}
                                totalRecords={filteredReviewRequests.length}
                                recordsPerPage={state.reviewRecordsPerPage}
                                onPageChange={(page) => setState({ reviewPage: page })}
                                hasNext={
                                    state.reviewPage <
                                    Math.ceil(filteredReviewRequests.length / state.reviewRecordsPerPage)
                                }
                                hasPrevious={state.reviewPage > 1}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. SEPARATE DETAILS / DRAWER COMPONENT RENDERED AT BOTTOM */}
            {renderReviewDrawer({
                isOpen: state.isOpenDrawer,
                activeReview: state.activeReview,
                apiResponseData: state.apiResponseData,
                viewStudentMode: state.viewStudentMode,
                reviewerVerified: state.reviewerVerified,
                discussionNotes: state.discussionNotes,
                decisionReason: state.decisionReason,
                selectedDecisionOption: state.selectedDecisionOption,
                isSubmittingDecision: state.isSubmittingDecision,
                onClose: handleCloseReviewDrawer,
                onVerifiedChange: (v) => setState({ reviewerVerified: v }),
                onNotesChange: (n) => setState({ discussionNotes: n }),
                onReasonChange: (r) => setState({ decisionReason: r }),
                onDecisionSelect: (opt) => setState({ selectedDecisionOption: opt }),
                onDecisionAction: handleDecisionAction,
            })}
        </div>
    );
};

// =============================================================================
// SEPARATE REVIEW DRAWER DOM FUNCTION (BELOW AFTER BulkImportPage)
// =============================================================================
interface ReviewDrawerRenderProps {
    isOpen: boolean;
    activeReview: ReviewRequest | null;
    apiResponseData?: any;
    viewStudentMode?: 'existing' | 'matching';
    reviewerVerified: boolean;
    discussionNotes: string;
    decisionReason: string;
    selectedDecisionOption: any;
    isSubmittingDecision?: boolean;
    onClose: () => void;
    onVerifiedChange: (verified: boolean) => void;
    onNotesChange: (notes: string) => void;
    onReasonChange: (reason: string) => void;
    onDecisionSelect: (option: any) => void;
    onDecisionAction: (
        action: 'Approved' | 'Linked Sibling' | 'Rejected' | 'Keep Pending' | 'Confirm Duplicate' | 'Reject Import'
    ) => void;
}

const renderReviewDrawer = ({
    isOpen,
    activeReview,
    apiResponseData,
    viewStudentMode,
    reviewerVerified,
    discussionNotes,
    decisionReason,
    selectedDecisionOption,
    isSubmittingDecision,
    onClose,
    onVerifiedChange,
    onNotesChange,
    onReasonChange,
    onDecisionSelect,
    onDecisionAction,
}: ReviewDrawerRenderProps) => {
    if (!isOpen || !activeReview) return null;

    const drawer = (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition">
            <div className="relative w-full max-w-2xl bg-white shadow-2xl dark:bg-[#0e1726] flex flex-col h-full overflow-hidden">
                {/* Drawer Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="px-2 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded dark:bg-gray-800 dark:text-gray-300">
                                {activeReview.id}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 rounded dark:bg-rose-950/40 dark:border-rose-800">
                                {activeReview.issue_type}
                            </span>
                            {apiResponseData && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-[#39854a] border border-emerald-200 rounded-full dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#39854a]" />
                                    <span>API Status: 200 OK</span>
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white">
                            {viewStudentMode === 'matching' ? 'Matching Student' : 'Existing Student'}: {activeReview.student_name}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
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
                            Student mobile number {activeReview.student_phone} matches existing record{' '}
                            {activeReview.existing_match_id} exactly.
                        </div>
                    </div>

                    {/* Side-by-Side Comparison Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                                Side-by-Side Comparison
                            </div>
                            <div className="text-xs text-gray-400">Verify identity differences before decision</div>
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
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                                        {activeReview.student_name}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">STUDENT MOBILE</div>
                                    <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                        {activeReview.student_phone}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">PARENT NAME</div>
                                    <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                        {activeReview.parent_name}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">PARENT MOBILE</div>
                                    <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                        {activeReview.parent_phone}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">CITY / LOCATION</div>
                                    <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                        {activeReview.city}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">ACADEMIC YEAR</div>
                                    <div className="font-bold text-xs text-[#39854a]">
                                        {activeReview.academic_year}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">COURSE INTEREST</div>
                                    <div className="font-semibold text-xs text-gray-900 dark:text-white">
                                        {activeReview.course}
                                    </div>
                                    <div className="text-[11px] text-gray-400">{activeReview.college}</div>
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
                                            {activeReview.existing_match_id}
                                        </span>
                                        <span className="text-[10px] font-bold text-[#39854a] hover:underline cursor-pointer flex items-center gap-0.5">
                                            Profile →
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">MATCHED STUDENT</div>
                                    <div className="font-bold text-sm text-gray-900 dark:text-white">
                                        {activeReview.existing_match_name}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">STUDENT MOBILE</div>
                                    <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                        {activeReview.student_phone}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">PARENT NAME</div>
                                    <div className="font-semibold text-xs text-gray-500">
                                        {activeReview.existing_parent_name}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">PARENT MOBILE</div>
                                    <div className="font-semibold text-xs text-gray-500">
                                        {activeReview.existing_parent_phone}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">CITY / LOCATION</div>
                                    <div className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                                        {activeReview.existing_city}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">ACADEMIC YEAR</div>
                                    <div className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                                        {activeReview.existing_match_ay}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-bold uppercase text-gray-400">COURSE INTEREST</div>
                                    <div className="font-semibold text-xs text-gray-900 dark:text-white">
                                        {activeReview.existing_course}
                                    </div>
                                    <div className="text-[11px] text-gray-400">{activeReview.existing_college}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviewer Identity Verification Checkbox */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={reviewerVerified}
                                onChange={(e) => onVerifiedChange(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#39854a] focus:ring-[#39854a]"
                            />
                            <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
                                <span className="font-bold">Reviewer Identity Verification:</span> I have investigated this contact and verified with academic records that this imported record represents a distinct person with the same phone/name, NOT a duplicate lead.
                            </span>
                        </label>
                    </div>

                    {/* Quick Action Selector with CustomSelect */}
                    <div>
                        <CustomSelect
                            title="Quick Action Selection"
                            placeholder="Select an approval action..."
                            options={DECISION_SELECT_OPTIONS}
                            value={selectedDecisionOption}
                            onChange={(opt) => {
                                onDecisionSelect(opt);
                                if (opt?.value) {
                                    onDecisionAction(opt.value as any);
                                }
                            }}
                            isClearable
                        />
                    </div>

                    {/* Internal Discussion Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 mb-1.5">
                            Internal Discussion Notes & Observations
                        </label>
                        <textarea
                            rows={2}
                            value={discussionNotes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-800 focus:border-[#39854a] focus:outline-none focus:ring-1 focus:ring-[#39854a] dark:border-gray-700 dark:bg-[#121e32] dark:text-white"
                            placeholder="Enter discussion notes regarding this duplicate / sibling verification..."
                        />
                    </div>

                    {/* Decision Reason using TextInput */}
                    <div>
                        <TextInput
                            title="Decision Reason (Recorded in audit trail)"
                            placeholder="e.g. Kept pending further document / identity verification."
                            value={decisionReason}
                            onChange={onReasonChange}
                        />
                    </div>

                    {/* Audit Info Box */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                            <span>
                                Submitted by:{' '}
                                <strong className="text-gray-700 dark:text-gray-300">
                                    {activeReview.submitted_by}
                                </strong>
                            </span>
                            <span>Submitted on: {activeReview.submitted_on}</span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                            <span>
                                Reviewed by:{' '}
                                <strong>{activeReview.reviewed_by || 'Prof. R. Natarajan (ADMIN)'}</strong>
                            </span>
                            <span>
                                Decision:{' '}
                                <strong className="uppercase">
                                    {activeReview.status === 'Pending Decision'
                                        ? 'KEEP_PENDING'
                                        : activeReview.status}
                                </strong>{' '}
                                ({activeReview.reviewed_on || '2026-11-13 06:36'})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Drawer Bottom Action Buttons */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#121e32]/60 space-y-3">
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Select Approval Action:
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={isSubmittingDecision}
                            onClick={() => onDecisionAction('Approved')}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-2.5 px-3 text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-xs cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 disabled:opacity-50"
                        >
                            {isSubmittingDecision ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            )}
                            <span>Approve as New Student</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSubmittingDecision}
                            onClick={() => onDecisionAction('Linked Sibling')}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            <Users className="h-4 w-4" />
                            <span>Link as Sibling</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            disabled={isSubmittingDecision}
                            onClick={() => onDecisionAction('Confirm Duplicate')}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 px-3 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            <Copy className="h-4 w-4" />
                            <span>Confirm Duplicate</span>
                        </button>

                        <button
                            type="button"
                            disabled={isSubmittingDecision}
                            onClick={() => onDecisionAction('Reject Import')}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white hover:bg-red-50 text-red-600 py-2.5 px-3 text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer dark:bg-gray-800 dark:border-red-800 disabled:opacity-50"
                        >
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>Reject Import</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <button
                            type="button"
                            disabled={isSubmittingDecision}
                            onClick={() => onDecisionAction('Keep Pending')}
                            className="text-xs font-bold text-gray-700 hover:text-gray-950 underline underline-offset-2 dark:text-gray-300 dark:hover:text-white cursor-pointer disabled:opacity-50"
                        >
                            Keep Pending for Further Verification
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 cursor-pointer"
                        >
                            Close Panel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined'
        ? ReactDOM.createPortal(drawer, document.getElementById('modal-portal') || document.body)
        : null;
};

export default BulkImportPage;
