'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Student,
  User,
  UserRole,
  AcademicYear,
  WhatsAppCampaign,
  WhatsAppTemplate,
  InstitutionMaster,
  CourseMaster,
  CallOutcome,
  AdmissionStage,
  ActivityLog,
  ReviewRequest,
  ReviewDecision,
  AssignmentRecord,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_USERS,
  INITIAL_ACADEMIC_YEARS,
  INITIAL_CAMPAIGNS,
  INITIAL_WHATSAPP_TEMPLATES,
  INITIAL_INSTITUTIONS,
  INITIAL_COURSES,
  INITIAL_REVIEW_REQUESTS,
  INITIAL_ASSIGNMENT_HISTORY,
} from '../data/mockData';

interface CrmContextType {
  // Role & Session
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  toggleUserStatus: (userId: string) => void;
  addUser: (user: Omit<User, 'id' | 'assignedContactsCount' | 'callsToday'>) => void;

  // Academic Year
  academicYears: AcademicYear[];
  activeAcademicYear: string;
  setActiveAcademicYear: (yearId: string) => void;
  addAcademicYear: (yearName: string, startDate: string, endDate: string) => void;

  // Students & Contacts
  students: Student[];
  filteredStudents: Student[];
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student | null) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  addStudent: (studentData: Omit<Student, 'id' | 'enquiryNo' | 'activityHistory'>) => Student;
  bulkImportStudents: (newStudents: Partial<Student>[]) => { imported: number; siblingsDetected: number };

  // Assignment & Workload
  assignmentHistory: AssignmentRecord[];
  assignContacts: (
    studentIds: string[],
    telecallerId: string,
    mode?: 'direct' | 'equal_split'
  ) => void;
  batchAssignEqualSplit: (studentIds: string[], telecallerIds: string[]) => void;
  reassignContacts: (
    studentIds: string[],
    newTelecallerId: string,
    reason: string
  ) => void;

  // Calling & Activity
  logCall: (
    studentId: string,
    outcome: CallOutcome,
    notes: string,
    scheduleFollowUp?: { date: string; time: string; notes?: string },
    referral?: { reason: string; priority: 'High' | 'Medium' | 'Urgent' }
  ) => void;

  // Follow-ups & Transfers
  scheduleFollowUp: (studentId: string, date: string, time: string, notes: string) => void;
  completeFollowUp: (studentId: string, notes?: string) => void;
  requestTransfer: (studentId: string, reason: string) => void;
  approveTransfer: (studentId: string, replacementTelecallerId: string) => void;
  rejectTransfer: (studentId: string) => void;

  // Counselling
  referToCounsellor: (
    studentId: string,
    reason: string,
    priority: 'High' | 'Medium' | 'Urgent',
    scheduledVisitDate?: string
  ) => void;
  updateCounsellingSession: (
    studentId: string,
    notes: string,
    outcome: string,
    newStage?: AdmissionStage
  ) => void;

  // Admission Stages
  updateAdmissionStage: (studentId: string, stage: AdmissionStage, reason?: string) => void;

  // WhatsApp Campaigns
  campaigns: WhatsAppCampaign[];
  templates: WhatsAppTemplate[];
  createCampaign: (
    campaign: Omit<WhatsAppCampaign, 'id' | 'metrics' | 'status' | 'academicYear'> & {
      status?: 'Draft' | 'Sent';
    }
  ) => void;

  // Masters
  institutions: InstitutionMaster[];
  courses: CourseMaster[];
  toggleInstitutionStatus: (id: string) => void;
  toggleCourseStatus: (id: string) => void;
  addCourse: (course: Omit<CourseMaster, 'id'>) => void;
  addInstitution: (inst: Omit<InstitutionMaster, 'id' | 'coursesCount'>) => void;

  // Internal Review Requests & Approval
  reviewRequests: ReviewRequest[];
  submitReviewRequest: (request: Omit<ReviewRequest, 'id' | 'status' | 'submittedBy' | 'submittedAt'>) => void;
  resolveReviewRequest: (
    requestId: string,
    decision: ReviewDecision,
    reason: string,
    discussionNotes?: string
  ) => void;

  // Active Modals & Views
  activeTab: string;
  setActiveTab: (tab: string) => void;
  callModalStudent: Student | null;
  setCallModalStudent: (student: Student | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(INITIAL_ACADEMIC_YEARS);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('2026–27');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(INITIAL_REVIEW_REQUESTS);
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentRecord[]>(INITIAL_ASSIGNMENT_HISTORY);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [callModalStudent, setCallModalStudent] = useState<Student | null>(null);
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>(INITIAL_CAMPAIGNS);
  const [templates] = useState<WhatsAppTemplate[]>(INITIAL_WHATSAPP_TEMPLATES);
  const [institutions, setInstitutions] = useState<InstitutionMaster[]>(INITIAL_INSTITUTIONS);
  const [courses, setCourses] = useState<CourseMaster[]>(INITIAL_COURSES);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync current user based on current role
  const currentUser = useMemo(() => {
    if (currentRole === 'ADMIN') {
      return users.find((u) => u.role === 'ADMIN') || users[0];
    }
    if (currentRole === 'TELECALLER') {
      return users.find((u) => u.role === 'TELECALLER') || users[1];
    }
    return users.find((u) => u.role === 'COUNSELLOR') || users[4];
  }, [currentRole, users]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Filter students by active academic year
  const filteredStudents = useMemo(() => {
    return students.filter((s) => s.academicYear === activeAcademicYear);
  }, [students, activeAcademicYear]);

  const setCurrentUser = (user: User) => {
    setCurrentRole(user.role);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
    showToast('User status updated');
  };

  const addUser = (userData: Omit<User, 'id' | 'assignedContactsCount' | 'callsToday'>) => {
    const newUser: User = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-4)}`,
      assignedContactsCount: 0,
      callsToday: 0,
    };
    setUsers((prev) => [...prev, newUser]);
    showToast(`Added new user: ${newUser.name}`);
  };

  const addAcademicYear = (yearName: string, startDate: string, endDate: string) => {
    const newYear: AcademicYear = {
      id: `AY-${yearName.replace('–', '-')}`,
      name: yearName,
      status: 'UPCOMING',
      startDate,
      endDate,
      totalEnquiries: 0,
    };
    setAcademicYears((prev) => [...prev, newYear]);
    showToast(`Academic Year ${yearName} created successfully`);
  };

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
    );
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) => (prev ? { ...prev, ...updates } : null));
    }
    showToast('Student profile details updated');
  };

  const addStudent = (
    studentData: Omit<Student, 'id' | 'enquiryNo' | 'activityHistory'>
  ): Student => {
    const newId = `STU-${(students.length + 1).toString().padStart(3, '0')}`;
    const newEnquiryNo = `ENQ-2026-0${100 + students.length + 1}`;

    // Sibling detection by parent phone
    const siblings = students.filter(
      (s) => s.parentMobile && s.parentMobile.trim() === studentData.parentMobile.trim()
    );

    const initialHistory: ActivityLog = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      actor: currentUser.name,
      role: currentRole,
      actionType: 'NOTE',
      title: 'Enquiry Registered',
      details: siblings.length > 0
        ? `Linked with family sibling: ${siblings.map((sib) => sib.name).join(', ')}`
        : 'New student profile created in CRM.',
    };

    const newStudent: Student = {
      ...studentData,
      id: newId,
      enquiryNo: newEnquiryNo,
      linkedSiblingIds: siblings.map((s) => s.id),
      activityHistory: [initialHistory],
    };

    setStudents((prev) => {
      // Also link the existing siblings to this new student
      const updated = prev.map((s) => {
        if (siblings.some((sib) => sib.id === s.id)) {
          return {
            ...s,
            linkedSiblingIds: [...s.linkedSiblingIds, newId],
          };
        }
        return s;
      });
      return [...updated, newStudent];
    });

    showToast(`Registered enquiry for ${newStudent.name}`);
    return newStudent;
  };

  const bulkImportStudents = (newRecords: Partial<Student>[]) => {
    let imported = 0;
    let siblingsDetected = 0;

    const createdList: Student[] = [];

    newRecords.forEach((record, index) => {
      const newId = `STU-${(students.length + imported + 1).toString().padStart(3, '0')}`;
      const newEnquiryNo = `ENQ-2026-0${100 + students.length + imported + 1}`;

      const parentMobile = record.parentMobile || record.mobile || '';
      const existingSiblings = students.filter(
        (s) => s.parentMobile && s.parentMobile.trim() === parentMobile.trim()
      );

      if (existingSiblings.length > 0) {
        siblingsDetected++;
      }

      const newStudent: Student = {
        id: newId,
        enquiryNo: newEnquiryNo,
        name: record.name || 'Candidate',
        dob: record.dob || '2008-05-15',
        age: record.age || 18,
        mobile: record.mobile || '+91 90000 00000',
        city: record.city || 'Coimbatore',
        area: record.area || 'Central',
        fatherName: record.fatherName || 'Parent',
        motherName: record.motherName || '',
        parentMobile,
        linkedSiblingIds: existingSiblings.map((s) => s.id),
        qualification: record.qualification || '12th Standard',
        schoolOrCollege: record.schoolOrCollege || 'School / College',
        tenthMarks: record.tenthMarks,
        twelfthGroup: record.twelfthGroup || 'Science Group',
        twelfthResultStatus: record.twelfthResultStatus || 'Declared',
        twelfthMarks: record.twelfthMarks,
        preferredInstitution:
          record.preferredInstitution || 'Karpagam Academy of Higher Education (KAHE)',
        preferredDegree: record.preferredDegree || 'B.Tech',
        preferredCourse: record.preferredCourse || 'Artificial Intelligence & Data Science',
        interestStatus: record.interestStatus || 'High',
        admissionStage: 'New',
        referenceType: record.referenceType || 'School',
        referenceDetails: record.referenceDetails || {},
        academicYear: activeAcademicYear,
        activityHistory: [
          {
            id: `ACT-IMP-${Date.now()}-${index}`,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            actor: currentUser.name,
            role: currentRole,
            actionType: 'NOTE',
            title: 'Bulk Imported',
            details:
              existingSiblings.length > 0
                ? `Sibling profile matched under family parent mobile ${parentMobile}.`
                : 'Imported from verified spreadsheet.',
          },
        ],
      };

      createdList.push(newStudent);
      imported++;
    });

    setStudents((prev) => [...prev, ...createdList]);
    showToast(`Bulk imported ${imported} contacts (${siblingsDetected} linked siblings)`);
    return { imported, siblingsDetected };
  };

  const submitReviewRequest = (
    reqData: Omit<ReviewRequest, 'id' | 'status' | 'submittedBy' | 'submittedAt'>
  ) => {
    const newReq: ReviewRequest = {
      ...reqData,
      id: `REV-${(reviewRequests.length + 1).toString().padStart(3, '0')}`,
      status: 'PENDING',
      submittedBy: `${currentUser.name} (${currentRole})`,
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setReviewRequests((prev) => [newReq, ...prev]);
    showToast(`Contact "${reqData.studentName}" submitted for Admin Review.`);
  };

  const resolveReviewRequest = (
    requestId: string,
    decision: ReviewDecision,
    reason: string,
    discussionNotes?: string
  ) => {
    const target = reviewRequests.find((r) => r.id === requestId);
    if (!target) return;

    const reviewerTag = `${currentUser.name} (${currentRole})`;
    const reviewTime = new Date().toISOString().slice(0, 16).replace('T', ' ');

    let nextStatus: 'APPROVED' | 'REJECTED' | 'PENDING' = 'PENDING';
    if (decision === 'APPROVE_NEW' || decision === 'LINK_SIBLING') {
      nextStatus = 'APPROVED';
    } else if (decision === 'CONFIRM_DUPLICATE' || decision === 'REJECT_IMPORT') {
      nextStatus = 'REJECTED';
    } else {
      nextStatus = 'PENDING';
    }

    // If APPROVE_NEW, create a separate student entry
    if (decision === 'APPROVE_NEW') {
      const newId = `STU-${(students.length + 1).toString().padStart(3, '0')}`;
      const newEnquiryNo = `ENQ-2026-0${100 + students.length + 1}`;
      const newStudent: Student = {
        id: newId,
        enquiryNo: newEnquiryNo,
        name: target.studentName,
        dob: '2008-05-15',
        age: 18,
        mobile: target.mobile,
        city: target.city,
        area: 'Central',
        fatherName: target.parentName || 'Parent',
        motherName: '',
        parentMobile: target.parentMobile,
        linkedSiblingIds: [],
        qualification: target.qualification,
        schoolOrCollege: 'Verified Candidate School',
        preferredInstitution: target.preferredInstitution,
        preferredDegree: target.preferredCourse.includes('B.Tech') ? 'B.Tech' : 'B.Sc',
        preferredCourse: target.preferredCourse,
        interestStatus: 'High',
        admissionStage: 'New',
        referenceType: 'School',
        referenceDetails: {},
        academicYear: activeAcademicYear,
        activityHistory: [
          {
            id: `ACT-REV-${Date.now()}`,
            timestamp: reviewTime,
            actor: reviewerTag,
            role: currentRole,
            actionType: 'NOTE',
            title: 'Approved as New Student after Identity Review',
            details: `Identity confirmed as distinct person. Reason: ${reason}. Notes: ${discussionNotes || 'None'}`,
          },
        ],
      };
      setStudents((prev) => [...prev, newStudent]);
      showToast(`Approved & created new student profile for ${target.studentName}`);
    } else if (decision === 'LINK_SIBLING') {
      // Create separate student profile connected to existing family
      const newId = `STU-${(students.length + 1).toString().padStart(3, '0')}`;
      const newEnquiryNo = `ENQ-2026-0${100 + students.length + 1}`;
      const existingMatch = students.find((s) => s.id === target.existingMatchStudentId);
      const siblingIds = existingMatch ? [existingMatch.id, ...(existingMatch.linkedSiblingIds || [])] : [];

      const newStudent: Student = {
        id: newId,
        enquiryNo: newEnquiryNo,
        name: target.studentName,
        dob: '2008-08-20',
        age: 17,
        mobile: target.mobile,
        city: target.city,
        area: 'Central',
        fatherName: target.parentName || existingMatch?.fatherName || 'Parent',
        motherName: existingMatch?.motherName || '',
        parentMobile: target.parentMobile,
        linkedSiblingIds: siblingIds,
        qualification: target.qualification,
        schoolOrCollege: 'School / College',
        preferredInstitution: target.preferredInstitution,
        preferredDegree: target.preferredCourse.includes('B.Tech') ? 'B.Tech' : 'B.Sc',
        preferredCourse: target.preferredCourse,
        interestStatus: 'High',
        admissionStage: 'New',
        referenceType: 'Sibling',
        referenceDetails: {
          siblingName: target.existingMatchStudentName,
        },
        academicYear: activeAcademicYear,
        activityHistory: [
          {
            id: `ACT-SIB-${Date.now()}`,
            timestamp: reviewTime,
            actor: reviewerTag,
            role: currentRole,
            actionType: 'NOTE',
            title: 'Verified Sibling Profile Created & Linked to Family',
            details: `Linked to family of ${target.existingMatchStudentName} (Enquiry: ${target.existingMatchEnquiryNo}). Reason: ${reason}`,
          },
        ],
      };

      setStudents((prev) => {
        const updated = prev.map((s) => {
          if (siblingIds.includes(s.id)) {
            return {
              ...s,
              linkedSiblingIds: Array.from(new Set([...(s.linkedSiblingIds || []), newId])),
            };
          }
          return s;
        });
        return [...updated, newStudent];
      });
      showToast(`Verified sibling "${target.studentName}" linked to family of ${target.existingMatchStudentName}`);
    } else if (decision === 'CONFIRM_DUPLICATE') {
      showToast(`Confirmed duplicate. Skipped import for "${target.studentName}" to avoid duplicate profile.`);
    } else if (decision === 'REJECT_IMPORT') {
      showToast(`Rejected import for "${target.studentName}". Record excluded from active CRM contacts.`);
    } else {
      showToast(`Review request for "${target.studentName}" kept Pending.`);
    }

    setReviewRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: nextStatus,
              decision,
              decisionReason: reason,
              discussionNotes: discussionNotes || r.discussionNotes,
              reviewedBy: reviewerTag,
              reviewedAt: reviewTime,
            }
          : r
      )
    );
  };

  const assignContacts = (
    studentIds: string[],
    telecallerId: string,
    mode: 'direct' | 'equal_split' = 'direct'
  ) => {
    const telecaller = users.find((u) => u.id === telecallerId);
    const telecallerName = telecaller?.name || 'Assigned Telecaller';
    const assignedStudents = students.filter((s) => studentIds.includes(s.id));
    const today = new Date().toISOString().slice(0, 10);

    setStudents((prev) =>
      prev.map((s) => {
        if (studentIds.includes(s.id)) {
          const log: ActivityLog = {
            id: `ACT-ASG-${Date.now()}-${s.id}`,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            actor: currentUser.name,
            role: currentRole,
            actionType: 'ASSIGNMENT',
            title: `Assigned to ${telecallerName}`,
            details: `Assignment Mode: ${mode === 'equal_split' ? 'Equal Batch Split' : 'Direct Allocation'}`,
          };
          return {
            ...s,
            assignedTelecallerId: telecallerId,
            assignedTelecallerName: telecallerName,
            activityHistory: [log, ...s.activityHistory],
          };
        }
        return s;
      })
    );

    // Record in Assignment History
    const newRecord: AssignmentRecord = {
      id: `ASN-${Date.now().toString().slice(-4)}`,
      assignmentDate: today,
      telecallerId,
      telecallerName,
      contactsAssignedCount: studentIds.length,
      studentIds,
      studentNames: assignedStudents.map((s) => s.name),
      assignedBy: `${currentUser.name} (${currentRole})`,
      actionType: 'New Assignment',
      academicYear: activeAcademicYear,
      reason: mode === 'equal_split' ? 'Equal batch split allocation' : 'Direct lead allocation',
    };
    setAssignmentHistory((prev) => [newRecord, ...prev]);

    // Update workload counters on users
    setUsers((prev) =>
      prev.map((u) =>
        u.id === telecallerId
          ? { ...u, assignedContactsCount: u.assignedContactsCount + studentIds.length }
          : u
      )
    );

    showToast(`Assigned ${studentIds.length} contact(s) to ${telecallerName}`);
  };

  const batchAssignEqualSplit = (studentIds: string[], telecallerIds: string[]) => {
    if (telecallerIds.length === 0 || studentIds.length === 0) return;

    const assignmentMap: { [studentId: string]: string } = {};
    const today = new Date().toISOString().slice(0, 10);

    studentIds.forEach((id, index) => {
      const tcId = telecallerIds[index % telecallerIds.length];
      assignmentMap[id] = tcId;
    });

    setStudents((prev) =>
      prev.map((s) => {
        if (assignmentMap[s.id]) {
          const tcId = assignmentMap[s.id];
          const tc = users.find((u) => u.id === tcId);
          const tcName = tc?.name || 'Telecaller';
          const log: ActivityLog = {
            id: `ACT-SPLIT-${Date.now()}-${s.id}`,
            timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
            actor: currentUser.name,
            role: currentRole,
            actionType: 'ASSIGNMENT',
            title: `Assigned to ${tcName}`,
            details: `Automated equal split among ${telecallerIds.length} telecallers.`,
          };
          return {
            ...s,
            assignedTelecallerId: tcId,
            assignedTelecallerName: tcName,
            activityHistory: [log, ...s.activityHistory],
          };
        }
        return s;
      })
    );

    // Record separate history records per telecaller
    const newRecords: AssignmentRecord[] = telecallerIds.map((tcId) => {
      const tc = users.find((u) => u.id === tcId);
      const tcName = tc?.name || 'Telecaller';
      const tcStudentIds = studentIds.filter((id) => assignmentMap[id] === tcId);
      const tcStudents = students.filter((s) => tcStudentIds.includes(s.id));
      return {
        id: `ASN-${Date.now().toString().slice(-4)}-${tcId}`,
        assignmentDate: today,
        telecallerId: tcId,
        telecallerName: tcName,
        contactsAssignedCount: tcStudentIds.length,
        studentIds: tcStudentIds,
        studentNames: tcStudents.map((s) => s.name),
        assignedBy: `${currentUser.name} (${currentRole})`,
        actionType: 'New Assignment',
        academicYear: activeAcademicYear,
        reason: `Equal split among ${telecallerIds.length} telecallers`,
      };
    });
    setAssignmentHistory((prev) => [...newRecords, ...prev]);

    // Update workloads
    setUsers((prev) =>
      prev.map((u) => {
        const assignedCount = Object.values(assignmentMap).filter((id) => id === u.id).length;
        return {
          ...u,
          assignedContactsCount: u.assignedContactsCount + assignedCount,
        };
      })
    );

    showToast(
      `Evenly distributed ${studentIds.length} contacts across ${telecallerIds.length} telecallers.`
    );
  };

  const reassignContacts = (
    studentIds: string[],
    newTelecallerId: string,
    reason: string
  ) => {
    const newTc = users.find((u) => u.id === newTelecallerId);
    const newTcName = newTc?.name || 'Telecaller';
    const today = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const affectedStudents = students.filter((s) => studentIds.includes(s.id));
    const previousTcMap: { [tcId: string]: number } = {};

    setStudents((prev) =>
      prev.map((s) => {
        if (studentIds.includes(s.id)) {
          const oldTcName = s.assignedTelecallerName || 'Unassigned';
          if (s.assignedTelecallerId) {
            previousTcMap[s.assignedTelecallerId] = (previousTcMap[s.assignedTelecallerId] || 0) + 1;
          }
          const log: ActivityLog = {
            id: `ACT-REASG-${Date.now()}-${s.id}`,
            timestamp: timeStr,
            actor: currentUser.name,
            role: currentRole,
            actionType: 'ASSIGNMENT',
            title: `Reassigned from ${oldTcName} to ${newTcName}`,
            details: `Reassignment Reason: ${reason}`,
          };
          return {
            ...s,
            assignedTelecallerId: newTelecallerId,
            assignedTelecallerName: newTcName,
            activityHistory: [log, ...s.activityHistory],
          };
        }
        return s;
      })
    );

    // Record Reassignment in Assignment History
    const reassignRecord: AssignmentRecord = {
      id: `ASN-RE-${Date.now().toString().slice(-4)}`,
      assignmentDate: today,
      telecallerId: newTelecallerId,
      telecallerName: newTcName,
      contactsAssignedCount: studentIds.length,
      studentIds,
      studentNames: affectedStudents.map((s) => s.name),
      assignedBy: `${currentUser.name} (${currentRole})`,
      actionType: 'Reassignment',
      academicYear: activeAcademicYear,
      previousTelecallerName: affectedStudents[0]?.assignedTelecallerName || 'Previous Telecaller',
      reason,
    };
    setAssignmentHistory((prev) => [reassignRecord, ...prev]);

    // Update workload numbers correctly without double-counting
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === newTelecallerId) {
          return {
            ...u,
            assignedContactsCount: u.assignedContactsCount + studentIds.length,
          };
        }
        if (previousTcMap[u.id]) {
          return {
            ...u,
            assignedContactsCount: Math.max(0, u.assignedContactsCount - previousTcMap[u.id]),
          };
        }
        return u;
      })
    );

    showToast(`Successfully reassigned ${studentIds.length} contact(s) to ${newTcName}`);
  };

  const logCall = (
    studentId: string,
    outcome: CallOutcome,
    notes: string,
    scheduleFollowUpData?: { date: string; time: string; notes?: string },
    referralData?: { reason: string; priority: 'High' | 'Medium' | 'Urgent' }
  ) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;

        const newLogs: ActivityLog[] = [
          {
            id: `ACT-CALL-${Date.now()}`,
            timestamp,
            actor: currentUser.name,
            role: currentRole,
            actionType: 'CALL',
            title: `Call Completed: ${outcome}`,
            details: notes,
            outcome,
          },
        ];

        let updatedFollowUp = s.followUpStatus;
        let followUpDate = s.followUpDate;
        let followUpTime = s.followUpTime;
        let followUpNotes = s.followUpNotes;
        let nextAction = s.nextAction || 'Follow-up';
        let retryCount = s.retryCount || 0;
        const todayDate = timestamp.slice(0, 10);

        if (outcome === 'Call Later' || outcome === 'Callback') {
          updatedFollowUp = 'Scheduled';
          followUpDate = scheduleFollowUpData?.date || '2026-05-06';
          followUpTime = scheduleFollowUpData?.time || '14:00';
          followUpNotes = scheduleFollowUpData?.notes || notes || 'Student requested callback later.';
          nextAction = `Scheduled callback on ${followUpDate} at ${followUpTime}`;
          newLogs.push({
            id: `ACT-FUP-${Date.now()}`,
            timestamp,
            actor: currentUser.name,
            role: currentRole,
            actionType: 'FOLLOWUP',
            title: `Callback Scheduled: ${followUpDate} at ${followUpTime}`,
            details: followUpNotes,
          });
        } else if (outcome === 'No Answer') {
          retryCount += 1;
          updatedFollowUp = 'Scheduled';
          followUpDate = '2026-05-06';
          followUpTime = '15:30';
          followUpNotes = 'No answer on first ring. Retrying in afternoon.';
          nextAction = `Retry call attempt #${retryCount + 1} (Scheduled 3:30 PM)`;
          newLogs.push({
            id: `ACT-RETRY-${Date.now()}`,
            timestamp,
            actor: currentUser.name,
            role: currentRole,
            actionType: 'FOLLOWUP',
            title: `Added to Retry Queue (Attempt #${retryCount + 1})`,
            details: 'Suggested retry time: 3:30 PM',
          });
        } else if (outcome === 'Busy') {
          retryCount += 1;
          updatedFollowUp = 'Scheduled';
          followUpDate = '2026-05-06';
          followUpTime = '16:00';
          followUpNotes = 'Line busy. Re-dialing in 1 hour.';
          nextAction = `Busy line retry (Scheduled 4:00 PM)`;
        } else if (outcome === 'Interested') {
          if (scheduleFollowUpData) {
            updatedFollowUp = 'Scheduled';
            followUpDate = scheduleFollowUpData.date;
            followUpTime = scheduleFollowUpData.time;
            followUpNotes = scheduleFollowUpData.notes || notes;
            nextAction = `Campus visit / application review on ${followUpDate}`;
          } else {
            updatedFollowUp = 'Completed';
            nextAction = 'Course details sent via WhatsApp; awaiting application form';
          }
        } else if (outcome === 'Not Interested') {
          updatedFollowUp = 'Completed';
          nextAction = 'Closed - Candidate chose alternative institution';
        } else if (outcome === 'Wrong Number') {
          updatedFollowUp = 'Completed';
          nextAction = 'Closed - Invalid/wrong number, stopped calling';
        } else if (outcome === 'Counselling Needed') {
          updatedFollowUp = 'Completed';
          nextAction = 'Referred to Senior Counsellor for in-depth guidance';
        }

        let counsellingReferral = s.counsellingReferral;
        let admissionStage = s.admissionStage;

        if (outcome === 'Interested' && admissionStage === 'New') {
          admissionStage = 'Interested';
        } else if (outcome === 'Not Interested') {
          admissionStage = 'Not Interested';
        }

        if (referralData || outcome === 'Counselling Needed') {
          counsellingReferral = {
            referralId: `REF-${Date.now()}`,
            referredBy: currentUser.name,
            referredDate: timestamp,
            reason: referralData?.reason || notes || 'Student requested in-depth academic counselling.',
            priority: referralData?.priority || 'High',
            status: 'Pending',
          };
          admissionStage = 'Counselling';
          newLogs.push({
            id: `ACT-REF-${Date.now()}`,
            timestamp,
            actor: currentUser.name,
            role: currentRole,
            actionType: 'COUNSELLING',
            title: `Referred to Senior Counsellor (${referralData?.priority || 'High'} Priority)`,
            details: counsellingReferral.reason,
          });
        }

        return {
          ...s,
          lastCallOutcome: outcome,
          lastContactedDate: todayDate,
          nextAction,
          retryCount,
          followUpStatus: updatedFollowUp,
          followUpDate,
          followUpTime,
          followUpNotes,
          counsellingReferral,
          admissionStage,
          activityHistory: [...newLogs, ...s.activityHistory],
        };
      })
    );

    // Increment callsToday for current user
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, callsToday: u.callsToday + 1 } : u))
    );

    showToast(`Call logged as ${outcome}`);
    setCallModalStudent(null);
  };

  const scheduleFollowUp = (
    studentId: string,
    date: string,
    time: string,
    notes: string
  ) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-FUP-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'FOLLOWUP',
          title: `Follow-up Scheduled for ${date} at ${time}`,
          details: notes,
        };
        return {
          ...s,
          followUpDate: date,
          followUpTime: time,
          followUpNotes: notes,
          followUpStatus: 'Scheduled',
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast(`Follow-up set for ${date} at ${time}`);
  };

  const completeFollowUp = (studentId: string, notes?: string) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-CMP-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'FOLLOWUP',
          title: 'Follow-up Marked Completed',
          details: notes || 'Callback finalized by telecaller.',
        };
        return {
          ...s,
          followUpStatus: 'Completed',
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast('Follow-up marked as completed');
  };

  const requestTransfer = (studentId: string, reason: string) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-TRF-REQ-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'TRANSFER',
          title: 'Callback Transfer Requested',
          details: `Reason: ${reason}. Awaiting Admin approval.`,
        };
        return {
          ...s,
          followUpStatus: 'Transfer Requested',
          transferRequest: {
            requestId: `TRQ-${Date.now().toString().slice(-4)}`,
            requestedBy: currentUser.name,
            requestDate: timestamp,
            reason,
            status: 'Pending',
          },
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast('Transfer request sent to Admin for approval');
  };

  const approveTransfer = (studentId: string, replacementTelecallerId: string) => {
    const replacement = users.find((u) => u.id === replacementTelecallerId);
    const replacementName = replacement?.name || 'Replacement Telecaller';
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-TRF-APP-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'TRANSFER',
          title: `Callback Transfer Approved -> ${replacementName}`,
          details: `Admin assigned scheduled callback to ${replacementName}. Student contact ownership preserved.`,
        };
        return {
          ...s,
          followUpStatus: 'Scheduled',
          transferRequest: s.transferRequest
            ? {
                ...s.transferRequest,
                status: 'Approved',
                replacementTelecallerId,
              }
            : undefined,
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast(`Transfer approved. Callback assigned to ${replacementName}`);
  };

  const rejectTransfer = (studentId: string) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-TRF-REJ-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'TRANSFER',
          title: 'Transfer Request Declined',
          details: 'Admin advised original telecaller to fulfill the follow-up.',
        };
        return {
          ...s,
          followUpStatus: 'Scheduled',
          transferRequest: s.transferRequest
            ? { ...s.transferRequest, status: 'Rejected' }
            : undefined,
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast('Transfer request declined');
  };

  const referToCounsellor = (
    studentId: string,
    reason: string,
    priority: 'High' | 'Medium' | 'Urgent',
    scheduledVisitDate?: string
  ) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-REF-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'COUNSELLING',
          title: `Referred to Senior Counsellor (${priority} Priority)`,
          details: `${reason}${scheduledVisitDate ? ` · Campus Visit: ${scheduledVisitDate}` : ''}`,
        };
        return {
          ...s,
          admissionStage: 'Counselling',
          counsellingReferral: {
            referralId: `REF-${Date.now().toString().slice(-4)}`,
            referredBy: currentUser.name,
            referredDate: timestamp,
            reason,
            priority,
            status: 'Pending',
            scheduledVisitDate,
          },
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast(`Student referred to Senior Counsellor with ${priority} priority`);
  };

  const updateCounsellingSession = (
    studentId: string,
    notes: string,
    outcome: string,
    newStage?: AdmissionStage
  ) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-CNS-SES-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'COUNSELLING',
          title: `Counselling Update: ${outcome}`,
          details: notes,
          outcome,
        };
        return {
          ...s,
          admissionStage: newStage || s.admissionStage,
          counsellingReferral: s.counsellingReferral
            ? {
                ...s.counsellingReferral,
                status: 'Completed',
                counsellorNotes: notes,
                counsellorOutcome: outcome,
              }
            : undefined,
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast(`Counselling session recorded: ${outcome}`);
  };

  const updateAdmissionStage = (
    studentId: string,
    stage: AdmissionStage,
    reason?: string
  ) => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const log: ActivityLog = {
          id: `ACT-STG-${Date.now()}`,
          timestamp,
          actor: currentUser.name,
          role: currentRole,
          actionType: 'STATUS_CHANGE',
          title: `Admission Stage Updated to: ${stage}`,
          details: reason || `Updated by ${currentUser.name} (${currentRole})`,
        };
        return {
          ...s,
          admissionStage: stage,
          activityHistory: [log, ...s.activityHistory],
        };
      })
    );
    showToast(`Student status moved to: ${stage}`);
  };

  const createCampaign = (
    campaignData: Omit<WhatsAppCampaign, 'id' | 'metrics' | 'status' | 'academicYear'> & { status?: 'Draft' | 'Sent' }
  ) => {
    const isDraft = campaignData.status === 'Draft';
    const newCampaign: WhatsAppCampaign = {
      ...campaignData,
      id: `CMP-${(campaigns.length + 1).toString().padStart(2, '0')}`,
      status: isDraft ? 'Draft' : 'Sent',
      sentDate: isDraft ? undefined : new Date().toISOString().slice(0, 10),
      academicYear: activeAcademicYear,
      metrics: {
        sent: isDraft ? 0 : campaignData.targetCount,
        delivered: isDraft ? 0 : Math.floor(campaignData.targetCount * 0.98),
        read: isDraft ? 0 : Math.floor(campaignData.targetCount * 0.82),
        replied: isDraft ? 0 : Math.floor(campaignData.targetCount * 0.18),
        failed: isDraft ? 0 : Math.ceil(campaignData.targetCount * 0.02),
      },
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    showToast(
      isDraft
        ? `Campaign "${newCampaign.name}" saved as Draft.`
        : `Campaign "${newCampaign.name}" scheduled for ${campaignData.targetCount} contacts in ${campaignData.location} (Prototype Preview)`
    );
  };

  const toggleInstitutionStatus = (id: string) => {
    setInstitutions((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === 'Active' ? 'Inactive' : 'Active' } : i
      )
    );
    showToast('Institution status updated');
  };

  const toggleCourseStatus = (id: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
      )
    );
    showToast('Course status updated');
  };

  const addCourse = (courseData: Omit<CourseMaster, 'id'>) => {
    const newCourse: CourseMaster = {
      ...courseData,
      id: `C-${(courses.length + 1).toString().padStart(2, '0')}`,
    };
    setCourses((prev) => [...prev, newCourse]);
    showToast(`Added course: ${newCourse.courseName}`);
  };

  const addInstitution = (instData: Omit<InstitutionMaster, 'id' | 'coursesCount'>) => {
    const newInst: InstitutionMaster = {
      ...instData,
      id: `INST-${instData.code}`,
      coursesCount: 0,
    };
    setInstitutions((prev) => [...prev, newInst]);
    showToast(`Added institution: ${newInst.name}`);
  };

  return (
    <CrmContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        setCurrentUser,
        users,
        toggleUserStatus,
        addUser,
        academicYears,
        activeAcademicYear,
        setActiveAcademicYear,
        addAcademicYear,
        students,
        filteredStudents,
        selectedStudent,
        setSelectedStudent,
        updateStudent,
        addStudent,
        bulkImportStudents,
        assignmentHistory,
        assignContacts,
        batchAssignEqualSplit,
        reassignContacts,
        logCall,
        scheduleFollowUp,
        completeFollowUp,
        requestTransfer,
        approveTransfer,
        rejectTransfer,
        referToCounsellor,
        updateCounsellingSession,
        updateAdmissionStage,
        campaigns,
        templates,
        createCampaign,
        institutions,
        courses,
        toggleInstitutionStatus,
        toggleCourseStatus,
        addCourse,
        addInstitution,
        reviewRequests,
        submitReviewRequest,
        resolveReviewRequest,
        activeTab,
        setActiveTab,
        callModalStudent,
        setCallModalStudent,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
