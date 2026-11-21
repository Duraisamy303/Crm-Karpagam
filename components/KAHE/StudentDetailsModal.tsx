import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/router';
import {
    Phone,
    MessageCircle,
    X,
    GraduationCap,
    Clock,
    Pencil,
    User,
    BookOpen,
    Award,
    Building,
    Star,
    Mail,
    MapPin,
    Calendar,
    Loader2,
} from 'lucide-react';
import Models from '@/imports/models.import';
import moment from 'moment';
import { useSetState } from '@/utils/functions.utils';
import { AdmissionContact } from './AdmissionsContactsTable';

export interface StudentDetailsModalProps {
    contact: AdmissionContact | any | null;
    isOpen: boolean;
    onClose: () => void;
    onLogCall: (contact: AdmissionContact) => void;
    onWhatsApp?: (contact: AdmissionContact) => void;
}

type TabType = 'personal' | 'academic' | 'preferences' | 'assessment';

const InfoItem = ({
    label,
    value,
    icon: Icon,
    badge,
}: {
    label: string;
    value?: React.ReactNode;
    icon?: any;
    badge?: React.ReactNode;
}) => (
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

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
    contact,
    isOpen,
    onClose,
    onLogCall,
    onWhatsApp,
}) => {
    const router = useRouter();
    const [state, setState] = useSetState({
        activeTab: 'personal' as TabType,
        fullContact: contact || null,
        loadingDetails: false,
    });

    const { activeTab, fullContact, loadingDetails } = state;

    // Sync prop contact and fetch enriched details if available
    useEffect(() => {
        if (contact) {
            setState({ fullContact: contact });
            const contactId = contact.id || contact.enquiry_id;
            if (contactId) {
                setState({ loadingDetails: true });
                Models.contact
                    .details(contactId)
                    .then((res: any) => {
                        if (res) {
                            setState({
                                fullContact: { ...contact, ...res },
                            });
                        }
                    })
                    .catch((err) => {
                        console.log('Details fetch error in modal:', err);
                    })
                    .finally(() => {
                        setState({ loadingDetails: false });
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
                {/* PINNED CLOSE BUTTON (ALWAYS TOP-RIGHT ON ALL SCREEN SIZES) */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 shadow-sm transition hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* MODAL HEADER */}
                <div className="flex flex-col gap-4 border-b border-gray-200 p-5 pr-14 dark:border-gray-800 sm:p-6 sm:pr-16">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0f4f1] text-sm font-bold tracking-wider text-[#39854a] dark:bg-green-950/40">
                                {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">
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

                {/* NAVIGATION TABS */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 dark:border-gray-800">
                    <div className="flex items-center gap-7 overflow-x-auto">
                        {(['personal', 'academic', 'preferences', 'assessment'] as TabType[]).map((tab) => {
                            const labels: Record<TabType, string> = {
                                personal: 'Personal & Family',
                                academic: 'Academic Qualifications',
                                preferences: 'Admission Preferences',
                                assessment: 'Assessment & Remarks',
                            };
                            return (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setState({ activeTab: tab })}
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

                {/* TAB CONTENTS — VIEW DETAILS */}
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

                {/* MODAL FOOTER */}
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

    return typeof window !== 'undefined' ? ReactDOM.createPortal(modal, document.getElementById('modal-portal')!) : null;
};

export default StudentDetailsModal;
