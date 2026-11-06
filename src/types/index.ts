export type UserRole = 'ADMIN' | 'TELECALLER' | 'COUNSELLOR';

export type AdmissionStage =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Counselling'
  | 'Applied'
  | 'Admitted'
  | 'Not Interested';

export type CallOutcome =
  | 'Interested'
  | 'Call Later'
  | 'Callback'
  | 'No Answer'
  | 'Busy'
  | 'Not Interested'
  | 'Wrong Number'
  | 'Counselling Needed';

export type InterestLevel = 'High' | 'Medium' | 'Low' | 'Undecided';

export type ReferenceType =
  | 'School'
  | 'Teacher'
  | 'Sibling'
  | 'Alumni'
  | 'Existing Student'
  | 'Other';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  mobile: string;
  status: 'Active' | 'Inactive';
  assignedContactsCount: number;
  callsToday: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  actionType: 'CALL' | 'NOTE' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'FOLLOWUP' | 'COUNSELLING' | 'TRANSFER';
  title: string;
  details?: string;
  outcome?: string;
}

export interface Student {
  id: string;
  enquiryNo: string;
  name: string;
  dob: string; // YYYY-MM-DD
  age: number;
  mobile: string;
  city: string;
  area: string;
  fatherName: string;
  motherName: string;
  parentMobile: string;
  linkedSiblingIds: string[]; // references other student ids

  // Education
  qualification: '12th Standard' | 'Diploma' | 'UG Completed' | 'UG Final Year' | '10th Standard';
  schoolOrCollege: string;
  // 12th specific
  tenthMarks?: string;
  twelfthGroup?: string;
  twelfthResultStatus?: 'Declared' | 'Result Pending';
  twelfthMarks?: string;
  // UG specific
  ugDegree?: string;
  ugSpecialization?: string;
  ugCompletionYear?: string;
  ugMarksCgpa?: string;
  ugResultStatus?: 'Declared' | 'Result Pending';

  // Admission Preference
  preferredInstitution: string;
  preferredDegree: string;
  preferredCourse: string;
  interestStatus: InterestLevel;
  admissionStage: AdmissionStage;

  // Reference Details
  referenceType: ReferenceType;
  referenceDetails: {
    schoolName?: string;
    teacherName?: string;
    siblingName?: string;
    alumniRegNo?: string;
    alumniCollege?: string;
    alumniPassoutYear?: string;
    existingStudentRegNo?: string;
    otherNote?: string;
  };

  // Telecaller & Follow-up
  assignedTelecallerId?: string;
  assignedTelecallerName?: string;
  academicYear: string;
  lastCallOutcome?: CallOutcome;
  lastContactedDate?: string;
  nextAction?: string;
  retryCount?: number;
  followUpDate?: string; // YYYY-MM-DD
  followUpTime?: string; // HH:MM
  followUpNotes?: string;
  followUpStatus?: 'Scheduled' | 'Completed' | 'Overdue' | 'Transfer Requested';

  // Transfer Request
  transferRequest?: {
    requestId: string;
    requestedBy: string;
    requestDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    replacementTelecallerId?: string;
  };

  // Senior Counselling Referral
  counsellingReferral?: {
    referralId: string;
    referredBy: string;
    referredDate: string;
    reason: string;
    priority: 'High' | 'Medium' | 'Urgent';
    status: 'Pending' | 'In Progress' | 'Completed';
    counsellorNotes?: string;
    counsellorOutcome?: string;
    scheduledVisitDate?: string;
  };

  // Import tracking
  importBatch?: string;
  importDate?: string; // YYYY-MM-DD
  isNewImport?: boolean;

  activityHistory: ActivityLog[];
}

export interface AssignmentRecord {
  id: string;
  assignmentDate: string; // YYYY-MM-DD
  telecallerId: string;
  telecallerName: string;
  contactsAssignedCount: number;
  studentIds: string[];
  studentNames: string[];
  assignedBy: string;
  actionType: 'New Assignment' | 'Reassignment';
  academicYear: string;
  previousTelecallerName?: string;
  reason?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026–27"
  status: 'ACTIVE' | 'ARCHIVED' | 'UPCOMING';
  startDate: string;
  endDate: string;
  totalEnquiries: number;
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  category: 'Admissions' | 'Scholarship' | 'Counselling' | 'Open House' | 'Campus Visit' | 'Follow-up' | 'Information';
  body: string;
  status: 'Active' | 'Inactive';
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  location: string;
  targetCount: number;
  templateId: string;
  templateTitle: string;
  status: 'Draft' | 'Sent';
  sentDate?: string;
  academicYear: string;
  metrics: {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    failed: number;
  };
}

export interface InstitutionMaster {
  id: string;
  name: string;
  code: string;
  category: 'University' | 'Engineering' | 'Medical' | 'Pharmacy' | 'Nursing';
  status: 'Active' | 'Inactive';
  coursesCount: number;
}

export interface CourseMaster {
  id: string;
  institutionId: string;
  institutionName: string;
  degreeType: 'UG' | 'PG' | 'Diploma' | 'Doctoral';
  degree: string;
  courseName: string;
  specialization?: string;
  durationYears: number;
  status: 'Active' | 'Inactive';
}

export type ReviewIssueType = 'EXACT_DUPLICATE' | 'POSSIBLE_SIBLING' | 'PREVIOUS_YEAR_MATCH';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReviewDecision =
  | 'APPROVE_NEW'
  | 'LINK_SIBLING'
  | 'CONFIRM_DUPLICATE'
  | 'REJECT_IMPORT'
  | 'KEEP_PENDING';

export interface ReviewRequest {
  id: string;
  studentName: string;
  mobile: string;
  parentName?: string;
  parentMobile: string;
  city: string;
  qualification: '12th Standard' | 'Diploma' | 'UG Completed' | 'UG Final Year' | '10th Standard';
  preferredInstitution: string;
  preferredCourse: string;
  issueType: ReviewIssueType;
  matchReason: string;
  existingMatchStudentId?: string;
  existingMatchStudentName?: string;
  existingMatchEnquiryNo?: string;
  existingMatchAcademicYear?: string;
  existingMatchParentName?: string;
  existingMatchParentMobile?: string;
  existingMatchCourse?: string;
  submittedBy: string;
  submittedAt: string;
  status: ReviewStatus;
  decision?: ReviewDecision;
  decisionReason?: string;
  discussionNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
