'use client';

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Users,
  Copy,
  ArrowRight,
  Eye,
  Check,
  Send,
  HelpCircle,
  Calendar,
  XCircle,
  FileText,
} from 'lucide-react';
import { Student } from '../../types';
import { ReviewRequestsTab } from './ReviewRequestsTab';

interface BulkImportViewProps {
  onNavigate: (tab: string) => void;
}

interface StagedRow {
  rowId: string;
  name: string;
  mobile: string;
  parentName?: string;
  parentMobile: string;
  city: string;
  qualification: '12th Standard' | 'Diploma' | 'UG Completed' | 'UG Final Year' | '10th Standard';
  preferredInstitution: string;
  preferredCourse: string;
  statusType: 'NEW' | 'DUPLICATE' | 'POSSIBLE_SIBLING' | 'NEED_REVIEW' | 'INVALID';
  issueDescription: string;
  existingStudentMatch?: Student;
  matchedSiblingStudent?: Student;
  previousYearMatch?: Student;
  actionTaken?: 'IMPORT' | 'SKIP' | 'SENT_FOR_REVIEW';
}

export const BulkImportView: React.FC<BulkImportViewProps> = ({ onNavigate }) => {
  const { students, bulkImportStudents, setSelectedStudent, submitReviewRequest, reviewRequests } = useCrm();

  const [mainViewTab, setMainViewTab] = useState<'import' | 'reviews'>('import');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [fileName, setFileName] = useState<string>('');
  const [stagedRows, setStagedRows] = useState<StagedRow[]>([]);
  const [importSummary, setImportSummary] = useState<{
    newContacts: number;
    duplicates: number;
    siblings: number;
    needReview: number;
    invalid: number;
    actuallyImported: number;
  } | null>(null);

  // Pre-configured realistic sample batch representing a typical education fair list
  const loadSampleDataset = () => {
    setFileName('Coimbatore_Mega_Education_Fair_Leads_2026.xlsx');

    // 6 realistic sample rows demonstrating:
    // 1. Clean brand new student
    // 2. Exact duplicate of existing student (K. Vignesh STU-001)
    // 3. Possible sibling (shares parent phone with S. Priya & S. Hariharan: +91 98421 44552)
    // 4. Previous year match (S. Karthi from AY 2025-26 returning)
    // 5. Incomplete / Invalid contact (missing mobile number)
    // 6. Another clean new student from Erode
    const sampleBatch = [
      {
        rowId: 'ROW-1',
        name: 'M. Naveen Kumar',
        mobile: '+91 98425 61122',
        parentName: 'P. Muthusamy',
        parentMobile: '+91 98425 00911',
        city: 'Coimbatore',
        qualification: '12th Standard' as const,
        preferredInstitution: 'Karpagam College of Engineering (KCE)',
        preferredCourse: 'Computer Science & Engineering',
      },
      {
        rowId: 'ROW-2',
        name: 'K. Vignesh', // Matches STU-001 by phone +91 98421 98210
        mobile: '+91 98421 98210',
        parentName: 'R. Krishnan',
        parentMobile: '+91 98420 11990',
        city: 'Coimbatore',
        qualification: '12th Standard' as const,
        preferredInstitution: 'Karpagam Academy of Higher Education (KAHE)',
        preferredCourse: 'Computer Science & Engineering',
      },
      {
        rowId: 'ROW-3',
        name: 'S. Nithya Devi', // SIBLING CASE: Uses S. Priya & Hariharan's parent phone +91 98421 44552!
        mobile: '+91 97890 55123',
        parentName: 'V. Senthil Kumar',
        parentMobile: '+91 98421 44552',
        city: 'Tiruppur',
        qualification: '12th Standard' as const,
        preferredInstitution: 'Karpagam Nursing College',
        preferredCourse: 'B.Sc Nursing',
      },
      {
        rowId: 'ROW-4',
        name: 'S. Karthi', // PREVIOUS YEAR MATCH: Exists in AY 2025-26 (ENQ-2025-0842)
        mobile: '+91 98428 33410',
        parentName: 'M. Shanmugam',
        parentMobile: '+91 98428 11099',
        city: 'Tiruppur',
        qualification: '12th Standard' as const,
        preferredInstitution: 'Karpagam Academy of Higher Education (KAHE)',
        preferredCourse: 'B.Tech Artificial Intelligence & Data Science',
      },
      {
        rowId: 'ROW-5',
        name: 'A. Subhashini', // INVALID CONTACT: Malformed / incomplete phone
        mobile: 'Invalid Number',
        parentName: 'M. Anand',
        parentMobile: '',
        city: 'Pollachi',
        qualification: '12th Standard' as const,
        preferredInstitution: 'Karpagam Institute of Technology (KIT)',
        preferredCourse: 'Biomedical Engineering',
      },
      {
        rowId: 'ROW-6',
        name: 'G. Gokulraj',
        mobile: '+91 99432 77011',
        parentName: 'V. Gurusamy',
        parentMobile: '+91 99432 00114',
        city: 'Erode',
        qualification: 'UG Completed' as const,
        preferredInstitution: 'Karpagam Academy of Higher Education (KAHE)',
        preferredCourse: 'Master of Business Administration (MBA)',
      },
    ];

    // Analyze each row against existing CRM database
    const analyzed: StagedRow[] = sampleBatch.map((row) => {
      // 0. Invalid check
      if (!row.mobile || row.mobile.length < 10 || row.mobile.toLowerCase().includes('invalid')) {
        return {
          ...row,
          statusType: 'INVALID',
          issueDescription: 'Malformed phone number. Contact cannot be dialed.',
          actionTaken: 'SKIP',
        };
      }

      // 1. Exact duplicate check in current academic year
      const exactDuplicate = students.find(
        (s) =>
          s.academicYear === '2026–27' &&
          s.mobile.replace(/\s+/g, '') === row.mobile.replace(/\s+/g, '')
      );

      if (exactDuplicate) {
        return {
          ...row,
          statusType: 'DUPLICATE',
          issueDescription: 'This student already exists.',
          existingStudentMatch: exactDuplicate,
          actionTaken: 'SKIP',
        };
      }

      // 2. Previous Academic Year match check
      const previousYearMatch = students.find(
        (s) =>
          s.academicYear !== '2026–27' &&
          s.mobile.replace(/\s+/g, '') === row.mobile.replace(/\s+/g, '')
      );

      if (previousYearMatch) {
        return {
          ...row,
          statusType: 'NEED_REVIEW',
          issueDescription: `Previous Year Record Found (${previousYearMatch.academicYear}). Verify if returning candidate.`,
          previousYearMatch,
          actionTaken: 'SENT_FOR_REVIEW',
        };
      }

      // 3. Sibling check: Parent phone matches an existing student, but candidate mobile is different
      const matchedSibling = students.find(
        (s) =>
          s.parentMobile &&
          s.parentMobile.replace(/\s+/g, '') === row.parentMobile.replace(/\s+/g, '') &&
          s.name.toLowerCase() !== row.name.toLowerCase()
      );

      if (matchedSibling) {
        return {
          ...row,
          statusType: 'POSSIBLE_SIBLING',
          issueDescription: 'Similar parent details found. Please verify.',
          matchedSiblingStudent: matchedSibling,
          actionTaken: 'SENT_FOR_REVIEW',
        };
      }

      // 4. Clean new contact
      return {
        ...row,
        statusType: 'NEW',
        issueDescription: 'No conflicts detected. Ready for import.',
        actionTaken: 'IMPORT',
      };
    });

    setStagedRows(analyzed);
    setCurrentStep(2);
  };

  const handleSendRowForReview = (row: StagedRow) => {
    let issueType: 'EXACT_DUPLICATE' | 'POSSIBLE_SIBLING' | 'PREVIOUS_YEAR_MATCH' = 'EXACT_DUPLICATE';
    let matchReason = '';
    let matchId = '';
    let matchName = '';
    let matchEnquiry = '';
    let matchYear = '2026–27';
    let matchParent = '';
    let matchParentPhone = '';
    let matchCourse = '';

    if (row.statusType === 'DUPLICATE' && row.existingStudentMatch) {
      issueType = 'EXACT_DUPLICATE';
      matchReason = `Student phone ${row.mobile} matches existing student ${row.existingStudentMatch.name} (${row.existingStudentMatch.enquiryNo}).`;
      matchId = row.existingStudentMatch.id;
      matchName = row.existingStudentMatch.name;
      matchEnquiry = row.existingStudentMatch.enquiryNo;
      matchYear = row.existingStudentMatch.academicYear;
      matchParent = row.existingStudentMatch.fatherName;
      matchParentPhone = row.existingStudentMatch.parentMobile;
      matchCourse = row.existingStudentMatch.preferredCourse;
    } else if (row.statusType === 'POSSIBLE_SIBLING' && row.matchedSiblingStudent) {
      issueType = 'POSSIBLE_SIBLING';
      matchReason = `Parent phone ${row.parentMobile} matches existing student ${row.matchedSiblingStudent.name} (${row.matchedSiblingStudent.enquiryNo}).`;
      matchId = row.matchedSiblingStudent.id;
      matchName = row.matchedSiblingStudent.name;
      matchEnquiry = row.matchedSiblingStudent.enquiryNo;
      matchYear = row.matchedSiblingStudent.academicYear;
      matchParent = row.matchedSiblingStudent.fatherName;
      matchParentPhone = row.matchedSiblingStudent.parentMobile;
      matchCourse = row.matchedSiblingStudent.preferredCourse;
    } else if (row.previousYearMatch) {
      issueType = 'PREVIOUS_YEAR_MATCH';
      matchReason = `Student record found in previous cycle (${row.previousYearMatch.academicYear}) under enquiry ${row.previousYearMatch.enquiryNo}.`;
      matchId = row.previousYearMatch.id;
      matchName = row.previousYearMatch.name;
      matchEnquiry = row.previousYearMatch.enquiryNo;
      matchYear = row.previousYearMatch.academicYear;
      matchParent = row.previousYearMatch.fatherName;
      matchParentPhone = row.previousYearMatch.parentMobile;
      matchCourse = row.previousYearMatch.preferredCourse;
    }

    submitReviewRequest({
      studentName: row.name,
      mobile: row.mobile,
      parentName: row.parentName,
      parentMobile: row.parentMobile,
      city: row.city,
      qualification: row.qualification,
      preferredInstitution: row.preferredInstitution,
      preferredCourse: row.preferredCourse,
      issueType,
      matchReason,
      existingMatchStudentId: matchId,
      existingMatchStudentName: matchName,
      existingMatchEnquiryNo: matchEnquiry,
      existingMatchAcademicYear: matchYear,
      existingMatchParentName: matchParent,
      existingMatchParentMobile: matchParentPhone,
      existingMatchCourse: matchCourse,
      discussionNotes: `Sent from bulk upload review table for investigation.`,
    });

    setStagedRows((prev) =>
      prev.map((r) =>
        r.rowId === row.rowId
          ? { ...r, actionTaken: 'SENT_FOR_REVIEW' }
          : r
      )
    );
  };

  const handleExecuteImport = () => {
    // Only import rows that are NEW and marked for IMPORT
    // Duplicates, Sibling candidates under review, and Invalid contacts are excluded from immediate telecaller assignment
    const validRowsToImport = stagedRows.filter(
      (r) => r.statusType === 'NEW' && r.actionTaken === 'IMPORT'
    );

    const formattedPayload: Partial<Student>[] = validRowsToImport.map((row) => ({
      name: row.name,
      mobile: row.mobile,
      parentName: row.parentName,
      parentMobile: row.parentMobile,
      city: row.city,
      area: 'Central',
      qualification: row.qualification,
      preferredInstitution: row.preferredInstitution,
      preferredCourse: row.preferredCourse,
      preferredDegree: row.preferredCourse.includes('B.Tech') ? 'B.Tech' : 'B.Sc',
      interestStatus: 'High',
      referenceType: 'School',
      referenceDetails: {},
    }));

    const result = bulkImportStudents(formattedPayload);

    setImportSummary({
      newContacts: newCount,
      duplicates: duplicateCount,
      siblings: siblingCount,
      needReview: reviewCount,
      invalid: invalidCount,
      actuallyImported: result.imported,
    });
    setCurrentStep(4);
  };

  const newCount = stagedRows.filter((r) => r.statusType === 'NEW').length;
  const duplicateCount = stagedRows.filter((r) => r.statusType === 'DUPLICATE').length;
  const siblingCount = stagedRows.filter((r) => r.statusType === 'POSSIBLE_SIBLING').length;
  const reviewCount = stagedRows.filter((r) => r.statusType === 'NEED_REVIEW').length;
  const invalidCount = stagedRows.filter((r) => r.statusType === 'INVALID').length;
  const pendingReviewsTotal = reviewRequests.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Title & Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Contact Import & Duplicate Approval
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Validate uploaded files, automatically flag duplicates & siblings, and manage internal approval decisions.
          </p>
        </div>

        {/* Tab Toggle: Import Wizard vs Review Requests Queue */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#DCE7DF] rounded-xl shadow-xs">
          <button
            onClick={() => setMainViewTab('import')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              mainViewTab === 'import'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload & Validate</span>
          </button>

          <button
            onClick={() => setMainViewTab('reviews')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              mainViewTab === 'reviews'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Review Requests</span>
            {pendingReviewsTotal > 0 && (
              <span className="text-[10px] bg-amber-500 text-white font-mono px-1.5 py-0.2 rounded-full font-bold">
                {pendingReviewsTotal}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW 1: Review Requests Queue */}
      {mainViewTab === 'reviews' && <ReviewRequestsTab />}

      {/* VIEW 2: Import & Validation Wizard */}
      {mainViewTab === 'import' && (
        <div className="space-y-6">
          {/* Step Progress Tracker */}
          <div className="bg-white p-3.5 rounded-xl border border-[#DCE7DF] shadow-xs">
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, label: '1. Upload File' },
                { step: 2, label: '2. Validation Summary' },
                { step: 3, label: '3. Duplicate & Sibling Review' },
                { step: 4, label: '4. Import Summary' },
              ].map((s) => (
                <div
                  key={s.step}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-between ${
                    currentStep === s.step
                      ? 'bg-[#39854A] text-white border-[#39854A]'
                      : currentStep > s.step
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-[#F7FAF8] text-gray-400 border-[#DCE7DF]'
                  }`}
                >
                  <span>{s.label}</span>
                  {currentStep > s.step && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1: Upload */}
          {currentStep === 1 && (
            <div className="bg-white p-8 rounded-xl border border-[#DCE7DF] shadow-xs space-y-6 text-center">
              <div className="border-2 border-dashed border-[#DCE7DF] rounded-2xl p-10 hover:border-[#39854A] transition-colors flex flex-col items-center justify-center gap-3 bg-[#F7FAF8]">
                <div className="w-14 h-14 rounded-full bg-[#39854A]/10 text-[#39854A] flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#172B20]">
                    Drag and drop your enquiry Excel or CSV file
                  </h3>
                  <p className="text-xs text-[#36473C] mt-1 max-w-lg mx-auto">
                    Uploaded records will be automatically cross-checked for exact duplicates, possible siblings sharing parent mobile numbers, and previous academic year enquiries.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-left flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#39854A]" />
                  <div>
                    <div className="text-xs font-bold text-[#172B20]">
                      Load Ready-to-Test Lead Batch (6 Tamil Nadu Candidates)
                    </div>
                    <div className="text-[11px] text-[#36473C]">
                      Includes clean new contacts, exact duplicate, possible sibling, previous year match, and invalid contact.
                    </div>
                  </div>
                </div>

                <button
                  onClick={loadSampleDataset}
                  className="px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  Load Sample Batch & Validate
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 & 3: Validation Summary & Contact Resolution */}
          {(currentStep === 2 || currentStep === 3) && (
            <div className="space-y-6">
              {/* Mandatory 5 Import Review Metric Cards */}
              <div className="grid grid-cols-5 gap-3">
                {/* 1. New Contacts */}
                <div className="bg-white p-3.5 rounded-xl border border-[#DCE7DF] shadow-xs">
                  <div className="text-xs font-bold text-[#39854A]">New Contacts</div>
                  <div className="text-2xl font-bold font-mono text-[#39854A] mt-1">{newCount}</div>
                  <div className="text-[10px] text-[#36473C] mt-0.5">Ready for import</div>
                </div>

                {/* 2. Duplicates */}
                <div className="bg-white p-3.5 rounded-xl border border-red-200 shadow-xs bg-red-50/30">
                  <div className="text-xs font-bold text-red-700">Duplicates</div>
                  <div className="text-2xl font-bold font-mono text-red-700 mt-1">{duplicateCount}</div>
                  <div className="text-[10px] text-red-600 mt-0.5">Clones prevented</div>
                </div>

                {/* 3. Possible Siblings */}
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/30">
                  <div className="text-xs font-bold text-amber-800">Possible Siblings</div>
                  <div className="text-2xl font-bold font-mono text-amber-800 mt-1">{siblingCount}</div>
                  <div className="text-[10px] text-amber-700 mt-0.5">Family shared phone</div>
                </div>

                {/* 4. Need Review */}
                <div className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-xs bg-blue-50/30">
                  <div className="text-xs font-bold text-blue-800">Need Review</div>
                  <div className="text-2xl font-bold font-mono text-blue-800 mt-1">{reviewCount}</div>
                  <div className="text-[10px] text-blue-700 mt-0.5">Prior year / uncertain</div>
                </div>

                {/* 5. Invalid Contacts */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs bg-gray-50/50">
                  <div className="text-xs font-bold text-gray-600">Invalid Contacts</div>
                  <div className="text-2xl font-bold font-mono text-gray-700 mt-1">{invalidCount}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Missing phone</div>
                </div>
              </div>

              {/* Validation Table: Student Name | Mobile | Issue | Status | Action */}
              <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
                <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#172B20]">
                      Import Validation Table ({stagedRows.length} rows)
                    </span>
                    <span className="text-[11px] text-[#36473C] font-mono">({fileName})</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#36473C]">
                    Never create duplicate records, but preserve verified siblings
                  </span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/60">
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-3">Mobile</th>
                      <th className="py-2.5 px-4">Issue</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE7DF]/60">
                    {stagedRows.map((row) => (
                      <tr key={row.rowId} className="hover:bg-[#F7FAF8] transition-colors">
                        {/* Student Name */}
                        <td className="py-3 px-4 font-bold text-[#172B20]">
                          <div>{row.name}</div>
                          <div className="text-[10px] text-[#36473C] font-normal">
                            {row.city} · {row.preferredCourse}
                          </div>
                        </td>

                        {/* Mobile */}
                        <td className="py-3 px-3 font-mono text-[11px] text-[#172B20]">
                          <div>{row.mobile}</div>
                          {row.parentMobile && (
                            <div className="text-[10px] text-[#36473C]">
                              Parent: {row.parentMobile}
                            </div>
                          )}
                        </td>

                        {/* Issue */}
                        <td className="py-3 px-4">
                          {row.statusType === 'DUPLICATE' && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1">
                                <Copy className="w-3 h-3 text-red-600" />
                                Duplicate Found
                              </span>
                              <div className="text-[11px] text-red-700 font-medium">
                                {row.issueDescription}
                              </div>
                            </div>
                          )}

                          {row.statusType === 'POSSIBLE_SIBLING' && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                                <Users className="w-3 h-3 text-amber-600" />
                                Possible Sibling
                              </span>
                              <div className="text-[11px] text-amber-800 font-medium">
                                {row.issueDescription}
                              </div>
                            </div>
                          )}

                          {row.statusType === 'NEED_REVIEW' && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-blue-600" />
                                Previous Year Record Found
                              </span>
                              <div className="text-[11px] text-blue-800 font-medium">
                                {row.issueDescription}
                              </div>
                            </div>
                          )}

                          {row.statusType === 'INVALID' && (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-300 inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-gray-500" />
                                Invalid Contact
                              </span>
                              <div className="text-[11px] text-gray-600 font-medium">
                                {row.issueDescription}
                              </div>
                            </div>
                          )}

                          {row.statusType === 'NEW' && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              ✓ Clean Contact
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {row.actionTaken === 'IMPORT' && (
                            <span className="text-[11px] font-semibold text-emerald-700">
                              Will Import ({newCount})
                            </span>
                          )}
                          {row.actionTaken === 'SKIP' && (
                            <span className="text-[11px] font-semibold text-red-600">
                              Excluded
                            </span>
                          )}
                          {row.actionTaken === 'SENT_FOR_REVIEW' && (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Under Review
                            </span>
                          )}
                        </td>

                        {/* Action buttons (View Existing, Skip, Send for Review) */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {row.statusType === 'DUPLICATE' && (
                              <>
                                <button
                                  onClick={() => setSelectedStudent(row.existingStudentMatch!)}
                                  className="text-xs text-[#39854A] font-bold hover:underline"
                                >
                                  View Existing Student
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleSendRowForReview(row)}
                                  disabled={row.actionTaken === 'SENT_FOR_REVIEW'}
                                  className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${
                                    row.actionTaken === 'SENT_FOR_REVIEW'
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                      : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                                  }`}
                                >
                                  {row.actionTaken === 'SENT_FOR_REVIEW'
                                    ? 'Sent to Review'
                                    : 'Send for Review'}
                                </button>
                              </>
                            )}

                            {row.statusType === 'POSSIBLE_SIBLING' && (
                              <>
                                <button
                                  onClick={() => setSelectedStudent(row.matchedSiblingStudent!)}
                                  className="text-xs text-blue-700 font-bold hover:underline"
                                >
                                  View Matching Student
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleSendRowForReview(row)}
                                  disabled={row.actionTaken === 'SENT_FOR_REVIEW'}
                                  className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${
                                    row.actionTaken === 'SENT_FOR_REVIEW'
                                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                      : 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                                  }`}
                                >
                                  {row.actionTaken === 'SENT_FOR_REVIEW'
                                    ? 'In Review Queue'
                                    : 'Send for Review'}
                                </button>
                              </>
                            )}

                            {row.statusType === 'NEED_REVIEW' && (
                              <button
                                onClick={() => handleSendRowForReview(row)}
                                disabled={row.actionTaken === 'SENT_FOR_REVIEW'}
                                className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${
                                  row.actionTaken === 'SENT_FOR_REVIEW'
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {row.actionTaken === 'SENT_FOR_REVIEW'
                                  ? 'In Review Queue'
                                  : 'Send for Review'}
                              </button>
                            )}

                            {row.statusType === 'INVALID' && (
                              <span className="text-[11px] text-gray-400 italic">
                                Fix phone before upload
                              </span>
                            )}

                            {row.statusType === 'NEW' && (
                              <span className="text-[11px] font-semibold text-emerald-700">
                                ✓ Verified New
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#DCE7DF] shadow-xs">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  ← Reset & Upload Different File
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMainViewTab('reviews')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Open Review Requests ({pendingReviewsTotal})</span>
                  </button>

                  <button
                    onClick={handleExecuteImport}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    <span>Import Valid New Contacts ({newCount})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Import Complete & Navigation */}
          {currentStep === 4 && importSummary && (
            <div className="bg-white p-8 rounded-xl border border-[#DCE7DF] shadow-xs text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#172B20]">Import Validation Completed!</h2>
                <p className="text-xs text-[#36473C] mt-2">
                  Successfully imported{' '}
                  <span className="font-bold text-[#172B20]">{importSummary.actuallyImported}</span> clean
                  new student contact(s) into current Academic Year 2026–27. Questionable records are held in review.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#F7FAF8] border border-[#DCE7DF] text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-[#36473C]">New Student Records Created:</span>
                  <span className="font-bold text-[#172B20]">{importSummary.actuallyImported}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#36473C]">Exact Duplicates Prevented:</span>
                  <span className="font-bold text-red-600">{importSummary.duplicates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#36473C]">Possible Siblings Sent to Review:</span>
                  <span className="font-bold text-amber-700">{importSummary.siblings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#36473C]">Prior Year Matches Held for Review:</span>
                  <span className="font-bold text-blue-700">{importSummary.needReview}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#36473C]">Invalid Contacts Excluded:</span>
                  <span className="font-bold text-gray-500">{importSummary.invalid}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setMainViewTab('reviews')}
                  className="px-4 py-2 border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold rounded-lg hover:bg-amber-100"
                >
                  Manage Review Requests ({pendingReviewsTotal})
                </button>
                <button
                  onClick={() => onNavigate('contacts')}
                  className="px-4 py-2 border border-[#DCE7DF] bg-white text-xs font-bold rounded-lg hover:bg-[#F7FAF8] text-[#172B20]"
                >
                  View All Contacts
                </button>
                <button
                  onClick={() => onNavigate('assign')}
                  className="flex items-center gap-2 px-5 py-2 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
                >
                  <span>Assign Imported Contacts to Telecallers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
