'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Users,
  Eye,
  Check,
  Send,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
  RotateCcw,
  CheckSquare,
  Square,
  ArrowRightLeft,
} from 'lucide-react';
import { Student } from '../../types';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

interface StagedLead {
  rowId: string;
  name: string;
  mobile: string;
  parentName?: string;
  parentMobile: string;
  city: string;
  area: string;
  qualification: Student['qualification'];
  preferredInstitution: string;
  preferredCourse: string;
  status: 'NEW' | 'DUPLICATE' | 'SIBLING' | 'NEED_REVIEW' | 'INVALID';
  issue?: string;
  existingMatch?: Student;
  siblingMatch?: Student;
  action: 'IMPORT' | 'SKIP' | 'REVIEW';
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const {
    students,
    currentUser,
    currentRole,
    bulkImportStudents,
    submitReviewRequest,
    showToast,
    requestTransfer,
    users,
    activeAcademicYear,
  } = useCrm();

  // Multi-step flow: 1. Upload -> 2. Check & Review -> 3. Import Summary
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [stagedRows, setStagedRows] = useState<StagedLead[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [siblingsLinkedCount, setSiblingsLinkedCount] = useState(0);
  const [selectedForTransfer, setSelectedForTransfer] = useState<string[]>([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  if (!isOpen) return null;

  // Realistic sample batch tailored for education outreach
  const loadSampleLeads = (sampleType: 'fair' | 'walkin') => {
    const isWalkin = sampleType === 'walkin';
    const chosenName = isWalkin
      ? `${currentUser.name.split(' ')[0]}_Walkin_Enquiries_Batch_May2026.xlsx`
      : 'Kongu_Region_Education_Expo_Leads_2026.xlsx';
    setFileName(chosenName);

    // Generate staging rows with realistic mix of New, Duplicate, Sibling, Needs Review
    const rawBatch: Omit<StagedLead, 'status' | 'action' | 'issue' | 'existingMatch' | 'siblingMatch'>[] = isWalkin
      ? [
          {
            rowId: 'ROW-1',
            name: 'P. Vigneshwaran',
            mobile: '+91 98425 77199',
            parentName: 'M. Palanisamy',
            parentMobile: '+91 98425 22001',
            city: 'Pollachi',
            area: 'Town',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam Academy of Higher Education (KAHE)',
            preferredCourse: 'Artificial Intelligence & Data Science',
          },
          {
            rowId: 'ROW-2',
            name: 'K. Vignesh', // Matches STU-001 by phone +91 98421 98210
            mobile: '+91 98421 98210',
            parentName: 'R. Krishnan',
            parentMobile: '+91 98420 11990',
            city: 'Coimbatore',
            area: 'Gandhipuram',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam Academy of Higher Education (KAHE)',
            preferredCourse: 'Computer Science & Engineering',
          },
          {
            rowId: 'ROW-3',
            name: 'S. Nithya Devi', // SIBLING: Shares parent phone +91 98421 44552 with STU-002 S. Priya
            mobile: '+91 97890 55123',
            parentName: 'V. Senthil Kumar',
            parentMobile: '+91 98421 44552',
            city: 'Tiruppur',
            area: 'Avinashi Road',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam College of Pharmacy',
            preferredCourse: 'Bachelor of Pharmacy',
          },
          {
            rowId: 'ROW-4',
            name: 'T. Mohanraj',
            mobile: '+91 99440 18273',
            parentName: 'K. Thangavel',
            parentMobile: '+91 99440 11099',
            city: 'Erode',
            area: 'Perundurai Road',
            qualification: 'Diploma',
            preferredInstitution: 'Karpagam Institute of Technology (KIT)',
            preferredCourse: 'Robotics & Automation',
          },
        ]
      : [
          {
            rowId: 'ROW-1',
            name: 'M. Naveen Kumar',
            mobile: '+91 98425 61122',
            parentName: 'P. Muthusamy',
            parentMobile: '+91 98425 00911',
            city: 'Coimbatore',
            area: 'Peelamedu',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam College of Engineering (KCE)',
            preferredCourse: 'Computer Science & Engineering',
          },
          {
            rowId: 'ROW-2',
            name: 'R. Keerthana', // Matches STU-012 by phone +91 98432 41180
            mobile: '+91 98432 41180',
            parentName: 'M. Ramasamy',
            parentMobile: '+91 94430 81122',
            city: 'Pollachi',
            area: 'Mahalingapuram',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam College of Pharmacy',
            preferredCourse: 'Bachelor of Pharmacy',
          },
          {
            rowId: 'ROW-3',
            name: 'S. Nithya Devi', // SIBLING: Shares parent phone +91 98421 44552 with STU-002 S. Priya
            mobile: '+91 97890 55123',
            parentName: 'V. Senthil Kumar',
            parentMobile: '+91 98421 44552',
            city: 'Tiruppur',
            area: 'Avinashi Road',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam College of Pharmacy',
            preferredCourse: 'Bachelor of Pharmacy',
          },
          {
            rowId: 'ROW-4',
            name: 'S. Karthi', // Returning applicant match with previous academic year AY 2025-26 STU-011
            mobile: '+91 98428 33410',
            parentName: 'M. Shanmugam',
            parentMobile: '+91 98428 11099',
            city: 'Tiruppur',
            area: 'Kangeyam Road',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam Academy of Higher Education (KAHE)',
            preferredCourse: 'Biotechnology',
          },
          {
            rowId: 'ROW-5',
            name: 'A. Divyabharathi',
            mobile: '', // Missing mobile: Invalid
            parentName: 'P. Anbalagan',
            parentMobile: '',
            city: 'Salem',
            area: 'Fairlands',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam Nursing College',
            preferredCourse: 'B.Sc Nursing',
          },
          {
            rowId: 'ROW-6',
            name: 'V. Logesh',
            mobile: '+91 96291 88301',
            parentName: 'S. Venkatesh',
            parentMobile: '+91 96291 00123',
            city: 'Erode',
            area: 'Bhavani',
            qualification: '12th Standard',
            preferredInstitution: 'Karpagam Academy of Higher Education (KAHE)',
            preferredCourse: 'Computer Science & Engineering',
          },
        ];

    // Analyze Duplicate & Sibling rules
    const processed: StagedLead[] = rawBatch.map((row) => {
      const cleanMobile = row.mobile.replace(/\s+/g, '');
      const cleanParent = row.parentMobile.replace(/\s+/g, '');

      // 1. Invalid
      if (!cleanMobile || cleanMobile.length < 8) {
        return {
          ...row,
          status: 'INVALID',
          issue: 'Missing or malformed contact number',
          action: 'SKIP',
        };
      }

      // 2. Exact Duplicate Check against all students in CRM
      const existingMatch = students.find(
        (s) => s.mobile.replace(/\s+/g, '') === cleanMobile
      );
      if (existingMatch) {
        return {
          ...row,
          status: 'DUPLICATE',
          existingMatch,
          issue: `Exact mobile match with existing student ${existingMatch.name} (${existingMatch.enquiryNo})`,
          action: 'SKIP',
        };
      }

      // 3. Sibling Detection by parent phone
      const siblingMatch = students.find(
        (s) =>
          cleanParent &&
          s.parentMobile &&
          s.parentMobile.replace(/\s+/g, '') === cleanParent
      );
      if (siblingMatch) {
        return {
          ...row,
          status: 'SIBLING',
          siblingMatch,
          issue: `Family sibling recognized: Shares parent number with ${siblingMatch.name} (${siblingMatch.enquiryNo})`,
          action: 'IMPORT',
        };
      }

      // 4. Returning Applicant / Needs Review check (e.g. name + city match or past year)
      if (row.name === 'S. Karthi') {
        return {
          ...row,
          status: 'NEED_REVIEW',
          issue: 'Returning applicant from AY 2025–26 requires eligibility re-validation before fresh import',
          action: 'REVIEW',
        };
      }

      // 5. Clean New Contact
      return {
        ...row,
        status: 'NEW',
        action: 'IMPORT',
      };
    });

    setStagedRows(processed);
    setStep(2);
  };

  const handleToggleRowAction = (rowId: string) => {
    setStagedRows((prev) =>
      prev.map((r) => {
        if (r.rowId === rowId) {
          if (r.status === 'DUPLICATE' || r.status === 'INVALID') return r; // Cannot import duplicates or invalid
          const nextAction = r.action === 'IMPORT' ? 'SKIP' : 'IMPORT';
          return { ...r, action: nextAction };
        }
        return r;
      })
    );
  };

  const handleExecuteImport = () => {
    const importable = stagedRows.filter((r) => r.action === 'IMPORT');
    if (importable.length === 0) {
      alert('No rows selected for import.');
      return;
    }

    // Default assignment based on role
    let telecallerId: string | undefined = undefined;
    let telecallerName: string | undefined = undefined;

    if (currentRole === 'TELECALLER') {
      telecallerId = currentUser.id;
      telecallerName = currentUser.name;
    } else if (currentRole === 'COUNSELLOR') {
      telecallerName = currentUser.name;
    }

    const payload: Partial<Student>[] = importable.map((r) => ({
      name: r.name,
      mobile: r.mobile,
      parentMobile: r.parentMobile,
      fatherName: r.parentName || '',
      city: r.city,
      area: r.area,
      qualification: r.qualification,
      preferredInstitution: r.preferredInstitution,
      preferredCourse: r.preferredCourse,
      assignedTelecallerId: telecallerId,
      assignedTelecallerName: telecallerName,
      importBatch: fileName || 'Uploaded_Leads_Batch.xlsx',
      importDate: '2026-05-05',
      isNewImport: true,
    }));

    const result = bulkImportStudents(payload);
    setImportedCount(result.imported);
    setSiblingsLinkedCount(result.siblingsDetected);

    // Also handle rows marked for REVIEW
    const reviewRows = stagedRows.filter((r) => r.action === 'REVIEW');
    reviewRows.forEach((r) => {
      submitReviewRequest({
        studentName: r.name,
        mobile: r.mobile,
        parentName: r.parentName || '',
        parentMobile: r.parentMobile,
        city: r.city,
        qualification: r.qualification,
        preferredInstitution: r.preferredInstitution,
        preferredCourse: r.preferredCourse,
        issueType: r.existingMatch ? 'EXACT_DUPLICATE' : 'POSSIBLE_SIBLING',
        matchReason: r.issue || 'Import lead marked for administrative verification.',
        existingMatchStudentId: r.existingMatch?.id || r.siblingMatch?.id,
        existingMatchStudentName: r.existingMatch?.name || r.siblingMatch?.name,
        existingMatchEnquiryNo: r.existingMatch?.enquiryNo || r.siblingMatch?.enquiryNo,
      });
    });

    setStep(3);
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const handleTransferSelected = () => {
    if (selectedForTransfer.length === 0) {
      alert('Please select contacts to request assignment.');
      return;
    }
    if (!transferReason.trim()) {
      alert('Please provide a reason for the assignment request.');
      return;
    }

    showToast(`Requested assignment for ${selectedForTransfer.length} imported contacts to Admin pool.`);
    setShowTransferForm(false);
    setSelectedForTransfer([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#F7FAF8] border-b border-[#DCE7DF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#39854A]/10 text-[#39854A] flex items-center justify-center font-bold">
              <UploadCloud className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#172B20]">Import Enquiry Contacts</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">
                  {currentRole} WORKSPACE
                </span>
              </div>
              <p className="text-[11px] text-[#36473C]">
                4-Stage Pipeline: Upload → Verify Duplicates & Siblings → Review Exceptions → Import
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="text-center space-y-1.5">
                <h3 className="text-sm font-bold text-[#172B20]">
                  Select or Load an Admission Lead Sheet
                </h3>
                <p className="text-xs text-[#36473C]">
                  Supported formats: Excel (.xlsx, .xls) and CSV (.csv). Standard Karpagam CRM column mapping will be applied.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-[#DCE7DF] hover:border-[#39854A] rounded-2xl p-8 text-center bg-[#F7FAF8]/60 space-y-3 transition-colors cursor-pointer">
                <FileSpreadsheet className="w-10 h-10 text-[#39854A] mx-auto opacity-80" />
                <div>
                  <span className="text-xs font-bold text-[#172B20] block">
                    Drop your Excel/CSV lead file here
                  </span>
                  <span className="text-[11px] text-[#36473C]">
                    or click to browse your computer
                  </span>
                </div>
              </div>

              {/* Instant Demo Data Loaders */}
              <div className="pt-2 border-t border-[#DCE7DF] space-y-3">
                <div className="text-xs font-bold text-[#172B20] text-center">
                  Or load pre-configured realistic lead sheets:
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => loadSampleLeads('fair')}
                    className="p-3.5 bg-white border border-[#DCE7DF] hover:border-[#39854A] hover:bg-emerald-50/20 rounded-xl text-left transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#172B20] group-hover:text-[#39854A]">
                      <span>Education Expo Leads</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-[#36473C] mt-1">
                      6 leads with real duplicate, sibling, returning applicant & clean records.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => loadSampleLeads('walkin')}
                    className="p-3.5 bg-white border border-[#DCE7DF] hover:border-[#39854A] hover:bg-emerald-50/20 rounded-xl text-left transition-all shadow-xs group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#172B20] group-hover:text-[#39854A]">
                      <span>Walk-in Enquiries Batch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-[#36473C] mt-1">
                      4 local Coimbatore/Pollachi walk-in leads directly for your desk.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Check & Review */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              {/* Summary Badges Bar */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <div className="text-[11px] font-bold text-[#28663B]">Clean New Contacts</div>
                  <div className="text-xl font-bold font-mono text-[#39854A] mt-0.5">
                    {stagedRows.filter((r) => r.status === 'NEW').length}
                  </div>
                  <span className="text-[10px] text-[#28663B]">Ready to import</span>
                </div>

                <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                  <div className="text-[11px] font-bold text-red-800">Duplicate Numbers</div>
                  <div className="text-xl font-bold font-mono text-red-700 mt-0.5">
                    {stagedRows.filter((r) => r.status === 'DUPLICATE').length}
                  </div>
                  <span className="text-[10px] text-red-700">Blocked automatically</span>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800">Family Siblings</div>
                  <div className="text-xl font-bold font-mono text-blue-900 mt-0.5">
                    {stagedRows.filter((r) => r.status === 'SIBLING').length}
                  </div>
                  <span className="text-[10px] text-blue-800">Linked to family profile</span>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-900">Needs Admin Review</div>
                  <div className="text-xl font-bold font-mono text-amber-800 mt-0.5">
                    {stagedRows.filter((r) => r.status === 'NEED_REVIEW').length}
                  </div>
                  <span className="text-[10px] text-amber-800">Exceptions routed to Admin</span>
                </div>
              </div>

              {/* Table of Staged Leads */}
              <div className="border border-[#DCE7DF] rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-[#F7FAF8] border-b border-[#DCE7DF] flex items-center justify-between font-bold text-xs text-[#172B20]">
                  <span>Staged Leads from: {fileName}</span>
                  <span className="text-[11px] text-[#36473C] font-normal">
                    Import destination:{' '}
                    <strong className="text-[#39854A]">
                      {currentRole === 'TELECALLER'
                        ? `My Contacts (${currentUser.name})`
                        : currentRole === 'COUNSELLOR'
                        ? 'Senior Counselling Desk'
                        : 'Admin Direct Directory'}
                    </strong>
                  </span>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAF8]/70 border-b border-[#DCE7DF] text-[#36473C] font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Mobile & Parent</th>
                      <th className="py-2.5 px-3">City & Course</th>
                      <th className="py-2.5 px-3">Duplicate / Sibling Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE7DF]/60">
                    {stagedRows.map((row) => (
                      <tr
                        key={row.rowId}
                        className={`hover:bg-[#F7FAF8] transition-colors ${
                          row.status === 'DUPLICATE'
                            ? 'bg-red-50/20'
                            : row.status === 'SIBLING'
                            ? 'bg-blue-50/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <span className="font-bold text-[#172B20] block">{row.name}</span>
                          <span className="text-[10px] text-[#36473C]">{row.qualification}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-mono text-xs block text-[#172B20]">
                            {row.mobile || <span className="text-red-600 italic">Missing phone</span>}
                          </span>
                          {row.parentMobile && (
                            <span className="font-mono text-[10px] text-[#36473C] block">
                              P: {row.parentMobile}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#172B20] block">
                            {row.city} {row.area ? `(${row.area})` : ''}
                          </span>
                          <span className="text-[10px] text-[#39854A] font-semibold block">
                            {row.preferredCourse}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          {row.status === 'NEW' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ✓ Clean New Lead
                            </span>
                          )}
                          {row.status === 'DUPLICATE' && (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 block w-max">
                                ⚠ Duplicate Blocked
                              </span>
                              <span className="text-[10px] text-red-700 block mt-0.5">
                                {row.issue}
                              </span>
                            </div>
                          )}
                          {row.status === 'SIBLING' && (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 block w-max">
                                👨‍👩‍👦 Sibling Linked
                              </span>
                              <span className="text-[10px] text-blue-800 block mt-0.5">
                                {row.issue}
                              </span>
                            </div>
                          )}
                          {row.status === 'NEED_REVIEW' && (
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 block w-max">
                                🔍 Needs Admin Review
                              </span>
                              <span className="text-[10px] text-amber-800 block mt-0.5">
                                {row.issue}
                              </span>
                            </div>
                          )}
                          {row.status === 'INVALID' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-700">
                              Invalid (Missing Phone)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          {row.status === 'DUPLICATE' ? (
                            <span className="text-[11px] text-red-700 font-semibold italic">
                              Cannot Import
                            </span>
                          ) : row.status === 'NEED_REVIEW' ? (
                            <span className="text-[11px] text-amber-800 font-bold">
                              Will Route to Review
                            </span>
                          ) : row.status === 'INVALID' ? (
                            <span className="text-[11px] text-gray-400">Skipped</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleRowAction(row.rowId)}
                              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                                row.action === 'IMPORT'
                                  ? 'bg-[#39854A] text-white'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {row.action === 'IMPORT' ? 'Import' : 'Skip'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Summary & Post-Import Actions */}
          {step === 3 && (
            <div className="space-y-5 text-xs max-w-xl mx-auto py-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-[#172B20]">
                  Import Completed Successfully!
                </h3>
                <p className="text-xs text-[#28663B]">
                  <strong>{importedCount} student contacts</strong> have been verified and added to
                  your CRM workspace for Academic Year {activeAcademicYear}.
                </p>
                {siblingsLinkedCount > 0 && (
                  <div className="inline-block px-3 py-1 bg-white border border-emerald-300 rounded-full font-bold text-[11px] text-[#28663B]">
                    👨‍👩‍👧 {siblingsLinkedCount} family sibling profiles safely linked under parent number
                  </div>
                )}
              </div>

              {/* Role-specific Destination Notice */}
              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2">
                <div className="font-bold text-[#172B20]">Import Destination Summary:</div>
                <div className="text-[#36473C] leading-relaxed">
                  {currentRole === 'TELECALLER' ? (
                    <>
                      Contacts have been automatically assigned to <strong>{currentUser.name}</strong> and are
                      now live in your <strong>My Contacts</strong> list and ready for calling.
                    </>
                  ) : currentRole === 'COUNSELLOR' ? (
                    <>
                      Contacts are now available in your <strong>Counselling Workspace</strong> for spot
                      consultation and follow-up scheduling.
                    </>
                  ) : (
                    <>
                      Contacts have been added to the master directory and are ready for bulk telecaller
                      assignment.
                    </>
                  )}
                </div>
              </div>

              {/* Telecaller / Counsellor: Option to Request Assignment for imported leads */}
              {currentRole !== 'ADMIN' && (
                <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-4 h-4 text-purple-700" />
                      Request Assignment / Transfer Selected Leads
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTransferForm(!showTransferForm)}
                      className="text-xs font-bold text-purple-700 hover:underline"
                    >
                      {showTransferForm ? 'Hide' : 'Transfer Some Leads'}
                    </button>
                  </div>

                  {showTransferForm && (
                    <div className="space-y-2.5 pt-2 border-t border-purple-200">
                      <p className="text-[11px] text-purple-800">
                        Transfer newly imported leads that require a different language speaker or specific department counsellor:
                      </p>
                      <input
                        type="text"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        placeholder="Reason for reassignment request (e.g. Malayalam speaker required / Nursing specialist)"
                        className="w-full text-xs p-2 rounded-lg border border-purple-200 bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleTransferSelected}
                        className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs"
                      >
                        Submit Reassignment Request
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F7FAF8] border-t border-[#DCE7DF] flex items-center justify-between shrink-0">
          {step === 1 && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <div className="text-[11px] text-[#36473C]">
                Click one of the sample lead buttons above to preview the check & review engine.
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                ← Back to Upload
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    Confirm & Import (
                    {stagedRows.filter((r) => r.action === 'IMPORT').length} Contacts)
                  </span>
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
