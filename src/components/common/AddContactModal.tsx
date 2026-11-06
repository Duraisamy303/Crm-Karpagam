'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  UserPlus,
  AlertTriangle,
  Users,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRightLeft,
  Eye,
  Send,
  Building,
  GraduationCap,
  Phone,
  MapPin,
  FileText,
} from 'lucide-react';
import { Student, AdmissionStage, ReferenceType } from '../../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentCreated?: (student: Student) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onStudentCreated,
}) => {
  const {
    students,
    institutions,
    courses,
    users,
    currentUser,
    currentRole,
    addStudent,
    scheduleFollowUp,
    requestTransfer,
    assignContacts,
    submitReviewRequest,
    setSelectedStudent,
    showToast,
    activeAcademicYear,
  } = useCrm();

  // Form Fields
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [city, setCity] = useState('Coimbatore');
  const [area, setArea] = useState('');
  const [qualification, setQualification] = useState<Student['qualification']>('12th Standard');
  const [preferredInstitution, setPreferredInstitution] = useState(
    'Karpagam Academy of Higher Education (KAHE)'
  );
  const [preferredCourse, setPreferredCourse] = useState('Artificial Intelligence & Data Science');
  const [source, setSource] = useState<ReferenceType>('School');
  const [notes, setNotes] = useState('');

  // Post-save step: 'FORM' | 'POST_SAVE'
  const [currentStep, setCurrentStep] = useState<'FORM' | 'POST_SAVE'>('FORM');
  const [createdStudent, setCreatedStudent] = useState<Student | null>(null);

  // Post-save options state
  const [selectedAction, setSelectedAction] = useState<
    'KEEP' | 'FOLLOWUP' | 'ASSIGN'
  >(currentRole === 'ADMIN' ? 'ASSIGN' : 'KEEP');
  const [followUpDate, setFollowUpDate] = useState('2026-05-05');
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [assignedTelecallerId, setAssignedTelecallerId] = useState(
    users.find((u) => u.role === 'TELECALLER')?.id || ''
  );
  const [transferReason, setTransferReason] = useState('');

  // Clean and check mobile
  const cleanMobile = mobile.replace(/\s+/g, '');
  const cleanParentMobile = parentMobile.replace(/\s+/g, '');

  // 1. Real-time Duplicate Check: Does a student already exist with this mobile?
  const duplicateMatch = useMemo(() => {
    if (!cleanMobile || cleanMobile.length < 8) return null;
    return students.find((s) => s.mobile.replace(/\s+/g, '') === cleanMobile);
  }, [students, cleanMobile]);

  // 2. Real-time Sibling Check: Does another student share this parent mobile?
  const siblingMatches = useMemo(() => {
    if (!cleanParentMobile || cleanParentMobile.length < 8) return [];
    return students.filter(
      (s) =>
        s.parentMobile &&
        s.parentMobile.replace(/\s+/g, '') === cleanParentMobile &&
        s.id !== duplicateMatch?.id
    );
  }, [students, cleanParentMobile, duplicateMatch]);

  if (!isOpen) return null;

  const handleReset = () => {
    setName('');
    setMobile('');
    setParentMobile('');
    setCity('Coimbatore');
    setArea('');
    setQualification('12th Standard');
    setPreferredCourse('Artificial Intelligence & Data Science');
    setSource('School');
    setNotes('');
    setCurrentStep('FORM');
    setCreatedStudent(null);
    setSelectedAction(currentRole === 'ADMIN' ? 'ASSIGN' : 'KEEP');
    setFollowUpNotes('');
    setTransferReason('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicateMatch) {
      alert('Cannot create contact: This mobile number is already registered to an existing student.');
      return;
    }

    if (!name.trim()) {
      alert('Please enter student name.');
      return;
    }

    if (!mobile.trim() || cleanMobile.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Default initial assignment based on role
    let initialTelecallerId: string | undefined = undefined;
    let initialTelecallerName: string | undefined = undefined;
    let initialStage: AdmissionStage = 'New';

    if (currentRole === 'TELECALLER') {
      initialTelecallerId = currentUser.id;
      initialTelecallerName = currentUser.name;
    } else if (currentRole === 'COUNSELLOR') {
      initialStage = 'Counselling';
      initialTelecallerName = currentUser.name;
    }

    const newStudentData: Omit<Student, 'id' | 'enquiryNo' | 'activityHistory'> = {
      name: name.trim(),
      mobile: mobile.trim(),
      parentMobile: parentMobile.trim() || mobile.trim(),
      fatherName: '',
      motherName: '',
      dob: '2008-05-15',
      age: 18,
      city,
      area: area.trim() || 'Central',
      qualification,
      schoolOrCollege: 'Registered via CRM Add Contact',
      preferredInstitution,
      preferredDegree: qualification === 'Diploma' ? 'B.Tech' : 'B.Tech',
      preferredCourse,
      interestStatus: 'High',
      admissionStage: initialStage,
      referenceType: source,
      referenceDetails: { otherNote: notes.trim() },
      assignedTelecallerId: initialTelecallerId,
      assignedTelecallerName: initialTelecallerName,
      academicYear: activeAcademicYear,
      linkedSiblingIds: siblingMatches.map((s) => s.id),
      isNewImport: false,
    };

    const created = addStudent(newStudentData);
    setCreatedStudent(created);
    setCurrentStep('POST_SAVE');

    if (onStudentCreated) {
      onStudentCreated(created);
    }
  };

  const handlePostSaveComplete = () => {
    if (!createdStudent) {
      handleClose();
      return;
    }

    if (selectedAction === 'FOLLOWUP') {
      scheduleFollowUp(
        createdStudent.id,
        followUpDate,
        followUpTime,
        followUpNotes || 'Initial callback commitment created during enquiry registration'
      );
      showToast(`Follow-up scheduled for ${createdStudent.name} on ${followUpDate}`);
    } else if (selectedAction === 'ASSIGN') {
      if (currentRole === 'ADMIN') {
        if (assignedTelecallerId) {
          assignContacts([createdStudent.id], assignedTelecallerId);
        }
      } else {
        // Telecaller or Counsellor requesting assignment/reassignment
        requestTransfer(
          createdStudent.id,
          transferReason || 'Reassignment requested for newly created enquiry'
        );
      }
    } else if (selectedAction === 'KEEP') {
      showToast(`Enquiry ${createdStudent.name} retained in your active workspace.`);
    }

    handleClose();
  };

  const handleSendForAdminReview = () => {
    if (!mobile.trim() || !name.trim()) {
      alert('Please enter student name and mobile before requesting review.');
      return;
    }

    submitReviewRequest({
      studentName: name.trim(),
      mobile: mobile.trim(),
      parentName: '',
      parentMobile: parentMobile.trim(),
      city,
      qualification,
      preferredInstitution,
      preferredCourse,
      issueType: duplicateMatch ? 'EXACT_DUPLICATE' : 'POSSIBLE_SIBLING',
      matchReason: duplicateMatch
        ? `Conflict: Duplicate student enquiry with existing record ${duplicateMatch.enquiryNo} (${duplicateMatch.name}).`
        : 'Uncertain enquiry match submitted for administrative resolution.',
      existingMatchStudentId: duplicateMatch?.id,
      existingMatchStudentName: duplicateMatch?.name,
      existingMatchEnquiryNo: duplicateMatch?.enquiryNo,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#F7FAF8] border-b border-[#DCE7DF] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39854A]/10 text-[#39854A] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172B20]">
                {currentStep === 'FORM' ? 'Add New Student Contact' : 'Enquiry Saved — Next Action'}
              </h2>
              <p className="text-[11px] text-[#36473C]">
                {currentStep === 'FORM'
                  ? `Direct enquiry registration · Role: ${currentRole} (${currentUser.name})`
                  : `Select routing for ${createdStudent?.name} (${createdStudent?.enquiryNo})`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {currentStep === 'FORM' ? (
            <form id="add-contact-form" onSubmit={handleFormSubmit} className="space-y-4">
              {/* DUPLICATE WARNING BANNER */}
              {duplicateMatch && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-red-800 font-bold">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Confirmed Duplicate Student Detected
                    </span>
                    <span className="text-[10px] bg-red-200/80 px-2 py-0.5 rounded font-mono">
                      {duplicateMatch.enquiryNo}
                    </span>
                  </div>
                  <p className="text-red-700 text-[11px] leading-relaxed">
                    A student record for <strong>{duplicateMatch.name}</strong> ({duplicateMatch.city})
                    with mobile <strong>{duplicateMatch.mobile}</strong> already exists in the CRM
                    (Assigned to: {duplicateMatch.assignedTelecallerName || 'Unassigned'}).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudent(duplicateMatch);
                        handleClose();
                      }}
                      className="px-2.5 py-1 bg-white border border-red-300 text-red-800 hover:bg-red-100 rounded text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      View Existing Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleSendForAdminReview}
                      className="px-2.5 py-1 bg-red-700 text-white rounded text-xs font-bold hover:bg-red-800 transition-colors flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Send to Admin Review
                    </button>
                  </div>
                </div>
              )}

              {/* SIBLING NOTICE BANNER */}
              {siblingMatches.length > 0 && !duplicateMatch && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Family Sibling Detected ({siblingMatches.length} existing student{siblingMatches.length > 1 ? 's' : ''})
                  </div>
                  <p className="text-[#28663B] text-[11px]">
                    Shares parent number <strong>{parentMobile}</strong> with{' '}
                    <strong>{siblingMatches.map((s) => s.name).join(', ')}</strong>. This new enquiry
                    will be linked as a separate family record.
                  </p>
                </div>
              )}

              {/* 1. Student Name & Mobile */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Student Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. R. Koushik"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Student Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 9842X XXXXX"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white font-mono focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                  />
                </div>
              </div>

              {/* 2. Parent Mobile & Location */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Parent Mobile (Sibling Key)
                  </label>
                  <input
                    type="text"
                    value={parentMobile}
                    onChange={(e) => setParentMobile(e.target.value)}
                    placeholder="Same family number if sibling"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white font-mono focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                  />
                  <span className="text-[10px] text-[#36473C] mt-0.5 block">
                    Shared family numbers create linked sibling profiles without duplicate block.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#172B20] mb-1">
                      City / District <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    >
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Tiruppur">Tiruppur</option>
                      <option value="Erode">Erode</option>
                      <option value="Pollachi">Pollachi</option>
                      <option value="Salem">Salem</option>
                      <option value="Namakkal">Namakkal</option>
                      <option value="Karur">Karur</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#172B20] mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Gandhipuram"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Academic Details (Optional) */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Qualification (Optional)
                  </label>
                  <select
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value as Student['qualification'])}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                  >
                    <option value="12th Standard">12th Standard</option>
                    <option value="Diploma">Diploma (Lateral Entry)</option>
                    <option value="UG Completed">UG Completed (PG Admission)</option>
                    <option value="UG Final Year">UG Final Year</option>
                    <option value="10th Standard">10th Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Course Interest (Optional)
                  </label>
                  <select
                    value={preferredCourse}
                    onChange={(e) => setPreferredCourse(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                  >
                    {courses.slice(0, 8).map((c) => (
                      <option key={c.id} value={c.courseName}>
                        {c.degree} {c.courseName}
                      </option>
                    ))}
                    <option value="Bachelor of Pharmacy">B.Pharm (Pharmacy)</option>
                    <option value="B.Sc Nursing">B.Sc Nursing</option>
                    <option value="Professional Accounting">B.Com (Professional Accounting)</option>
                  </select>
                </div>
              </div>

              {/* 4. Enquiry Source & Short Notes */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Enquiry Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as ReferenceType)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                  >
                    <option value="School">School Outreach Visit</option>
                    <option value="Teacher">Teacher / Faculty Reference</option>
                    <option value="Sibling">Sibling / Family Member</option>
                    <option value="Alumni">Alumni Reference</option>
                    <option value="Existing Student">Current Student Referral</option>
                    <option value="Other">Walk-in / Phone Inbound / Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B20] mb-1">
                    Short Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Inquired about merit scholarship & hostel"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                  />
                </div>
              </div>
            </form>
          ) : (
            /* POST-SAVE ROUTING STEP */
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-[#172B20]">
                      Enquiry Created Successfully!
                    </div>
                    <div className="text-[11px] text-[#36473C]">
                      {createdStudent?.name} · {createdStudent?.enquiryNo} · {createdStudent?.preferredCourse}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-white border border-emerald-300 rounded font-bold text-[#28663B]">
                  AY {activeAcademicYear}
                </span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#172B20]">
                  What would you like to do next with this contact?
                </label>

                {/* Option 1: Keep With Me */}
                <div
                  onClick={() => setSelectedAction('KEEP')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedAction === 'KEEP'
                      ? 'border-[#39854A] bg-[#39854A]/5 ring-1 ring-[#39854A]'
                      : 'border-[#DCE7DF] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#172B20]">1. Keep With Me</span>
                    <span className="text-[10px] text-[#39854A] font-semibold">
                      {currentRole === 'TELECALLER'
                        ? 'Added to My Contacts'
                        : currentRole === 'COUNSELLOR'
                        ? 'Added to Counselling Desk'
                        : 'Retained in Active Directory'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#36473C] mt-0.5">
                    Contact remains under your direct ownership for immediate calling or review.
                  </p>
                </div>

                {/* Option 2: Schedule Follow-up */}
                <div
                  onClick={() => setSelectedAction('FOLLOWUP')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedAction === 'FOLLOWUP'
                      ? 'border-[#39854A] bg-[#39854A]/5 ring-1 ring-[#39854A]'
                      : 'border-[#DCE7DF] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#172B20]">2. Schedule Follow-up</span>
                    <span className="text-[10px] text-amber-700 font-semibold">Immediate Callback Slot</span>
                  </div>
                  <p className="text-[11px] text-[#36473C] mt-0.5">
                    Lock in an appointment or callback reminder for today or upcoming days.
                  </p>

                  {selectedAction === 'FOLLOWUP' && (
                    <div className="mt-3 pt-3 border-t border-[#DCE7DF] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full text-xs p-1.5 rounded border border-[#DCE7DF] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                          Time Slot
                        </label>
                        <input
                          type="time"
                          value={followUpTime}
                          onChange={(e) => setFollowUpTime(e.target.value)}
                          className="w-full text-xs p-1.5 rounded border border-[#DCE7DF] bg-white font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={followUpNotes}
                          onChange={(e) => setFollowUpNotes(e.target.value)}
                          placeholder="Follow-up notes (e.g. Call father in evening after work)"
                          className="w-full text-xs p-1.5 rounded border border-[#DCE7DF] bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Request Assignment / Direct Assign */}
                <div
                  onClick={() => setSelectedAction('ASSIGN')}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedAction === 'ASSIGN'
                      ? 'border-[#39854A] bg-[#39854A]/5 ring-1 ring-[#39854A]'
                      : 'border-[#DCE7DF] hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#172B20]">
                      {currentRole === 'ADMIN' ? '3. Direct Assign Telecaller' : '3. Request Assignment / Transfer'}
                    </span>
                    <span className="text-[10px] text-purple-700 font-semibold">
                      {currentRole === 'ADMIN' ? 'Immediate Assignment' : 'Admin Routing'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#36473C] mt-0.5">
                    {currentRole === 'ADMIN'
                      ? 'Select an active telecaller to take charge of this new enquiry immediately.'
                      : 'Submit request to Admin to assign this enquiry to another telecaller or team member.'}
                  </p>

                  {selectedAction === 'ASSIGN' && (
                    <div className="mt-3 pt-3 border-t border-[#DCE7DF] space-y-2 text-xs">
                      {currentRole === 'ADMIN' ? (
                        <div>
                          <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                            Select Telecaller:
                          </label>
                          <select
                            value={assignedTelecallerId}
                            onChange={(e) => setAssignedTelecallerId(e.target.value)}
                            className="w-full text-xs p-2 rounded border border-[#DCE7DF] bg-white"
                          >
                            {users
                              .filter((u) => u.role === 'TELECALLER')
                              .map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name} ({u.assignedContactsCount} active contacts)
                                </option>
                              ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                            Reason for Reassignment Request:
                          </label>
                          <input
                            type="text"
                            value={transferReason}
                            onChange={(e) => setTransferReason(e.target.value)}
                            placeholder="e.g. Student requested Malayalam-speaking telecaller / Pharmacy specialist"
                            className="w-full text-xs p-2 rounded border border-[#DCE7DF] bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F7FAF8] border-t border-[#DCE7DF] flex items-center justify-between shrink-0">
          {currentStep === 'FORM' ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  form="add-contact-form"
                  disabled={Boolean(duplicateMatch)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#39854A] hover:bg-[#28663B] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Save Contact</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('FORM')}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                ← Back to Details
              </button>
              <button
                type="button"
                onClick={handlePostSaveComplete}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Continue</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
