import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Student,
  CallOutcome,
  AdmissionStage,
  InterestLevel,
  ReferenceType,
} from '../../types';
import {
  X,
  PhoneCall,
  MessageCircle,
  Save,
  Calendar,
  Clock,
  GraduationCap,
  AlertTriangle,
  Users,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  BookOpen,
  Building,
  Tag,
  PhoneOff,
} from 'lucide-react';

interface StudentDataEntryPanelProps {
  student: Student;
  onClose: () => void;
  onSaved?: () => void;
}

export const StudentDataEntryPanel: React.FC<StudentDataEntryPanelProps> = ({
  student,
  onClose,
  onSaved,
}) => {
  const {
    students,
    institutions,
    courses,
    updateStudent,
    logCall,
    showToast,
    currentUser,
  } = useCrm();

  // Active form section tab: 'personal' | 'education' | 'interest' | 'reference'
  const [activeSection, setActiveSection] = useState<
    'personal' | 'education' | 'interest' | 'reference'
  >('personal');

  // Call simulation state
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState<boolean>(false);

  // Form state initialized with student record
  const [formData, setFormData] = useState<Student>({ ...student });

  // Call action state
  const [callOutcome, setCallOutcome] = useState<CallOutcome>('Interested');
  const [callNotes, setCallNotes] = useState<string>('');

  // Follow-up toggle & state
  const [willScheduleFollowUp, setWillScheduleFollowUp] = useState<boolean>(
    student.followUpStatus === 'Scheduled' || student.followUpStatus === 'Overdue'
  );
  const [followUpDate, setFollowUpDate] = useState<string>(
    student.followUpDate || '2026-05-08'
  );
  const [followUpTime, setFollowUpTime] = useState<string>(
    student.followUpTime || '11:00'
  );
  const [followUpNotes, setFollowUpNotes] = useState<string>(
    student.followUpNotes || ''
  );

  // Counsellor referral toggle & state
  const [willReferToCounsellor, setWillReferToCounsellor] = useState<boolean>(
    !!student.counsellingReferral
  );
  const [referralReason, setReferralReason] = useState<string>(
    student.counsellingReferral?.reason ||
      'Student scored high marks and requested merit fee scholarship evaluation and campus lab visit.'
  );
  const [referralPriority, setReferralPriority] = useState<'High' | 'Medium' | 'Urgent'>(
    student.counsellingReferral?.priority || 'High'
  );

  // Timer for simulated call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCalling) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCalling]);

  // Sync state if student prop changes
  useEffect(() => {
    setFormData({ ...student });
    setCallNotes('');
    setIsCalling(false);
  }, [student]);

  // Dynamic age calculation from DOB
  const calculatedAge = useMemo(() => {
    if (!formData.dob) return formData.age || 18;
    const birthDate = new Date(formData.dob);
    const today = new Date('2026-05-05');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? 18 : age;
  }, [formData.dob, formData.age]);

  const isUnderage = calculatedAge < 17;

  // Sibling check: find any other student sharing the parent mobile
  const siblings = useMemo(() => {
    return students.filter(
      (s) =>
        s.id !== student.id &&
        formData.parentMobile &&
        s.parentMobile &&
        s.parentMobile.replace(/\s+/g, '') === formData.parentMobile.replace(/\s+/g, '')
    );
  }, [students, student.id, formData.parentMobile]);

  // Dynamic course list based on selected institution and degree type
  const is12thStudent =
    formData.qualification === '12th Standard' ||
    formData.qualification === 'Diploma' ||
    formData.qualification === '10th Standard';

  const relevantDegreeType = is12thStudent ? 'UG' : 'PG';

  // Cascading courses from Masters
  const availableCourses = useMemo(() => {
    const selectedInst = institutions.find(
      (i) => i.name === formData.preferredInstitution
    );
    let list = courses;
    if (selectedInst) {
      list = list.filter((c) => c.institutionId === selectedInst.id);
    }
    // Filter by UG or PG degree preference
    return list.filter((c) => c.degreeType === relevantDegreeType);
  }, [institutions, courses, formData.preferredInstitution, relevantDegreeType]);

  // When qualification changes, default the degree type
  const handleQualificationChange = (qual: any) => {
    const nextIs12th =
      qual === '12th Standard' || qual === 'Diploma' || qual === '10th Standard';
    const nextDegree = nextIs12th ? 'B.Tech' : 'MBA';
    setFormData((prev) => ({
      ...prev,
      qualification: qual,
      preferredDegree: nextDegree,
    }));
  };

  const handleStartCall = () => {
    setIsCalling(true);
    showToast(`Connecting call to ${formData.name} (${formData.mobile})...`);
  };

  const handleEndCall = () => {
    setIsCalling(false);
    showToast(`Call ended. Duration: ${formatTime(callDuration)}`);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveDetails = () => {
    // 1. Update the student profile details
    updateStudent(student.id, {
      ...formData,
      age: calculatedAge,
    });

    // 2. Log call if notes or outcome is recorded
    if (callNotes.trim() || isCalling || callOutcome) {
      logCall(
        student.id,
        callOutcome,
        callNotes || `Call completed with outcome: ${callOutcome}. Student details verified.`,
        willScheduleFollowUp
          ? {
              date: followUpDate,
              time: followUpTime,
              notes: followUpNotes || callNotes || 'Callback scheduled.',
            }
          : undefined,
        willReferToCounsellor
          ? {
              reason: referralReason,
              priority: referralPriority,
            }
          : undefined
      );
    }

    setIsCalling(false);
    showToast(`Student details for ${formData.name} saved successfully!`);
    if (onSaved) onSaved();
    onClose();
  };

  const callOutcomesList: CallOutcome[] = [
    'Interested',
    'Call Later',
    'No Answer',
    'Busy',
    'Not Interested',
    'Wrong Number',
    'Counselling Needed',
  ];

  // Dynamically update form options when outcome changes
  const handleOutcomeChange = (newOutcome: CallOutcome) => {
    setCallOutcome(newOutcome);
    if (newOutcome === 'Call Later') {
      setWillScheduleFollowUp(true);
      if (!followUpDate || followUpDate === '2026-05-05') {
        setFollowUpDate('2026-05-06');
        setFollowUpTime('11:00');
      }
    } else if (newOutcome === 'Counselling Needed') {
      setWillReferToCounsellor(true);
      setReferralReason('Student expressed serious interest and requested detailed academic & scholarship counselling.');
    } else if (newOutcome === 'Busy') {
      setWillScheduleFollowUp(true);
      setFollowUpDate('2026-05-05');
      setFollowUpTime('14:30');
      setFollowUpNotes('Student was busy during first call, retry in 1-2 hours.');
    } else if (newOutcome === 'No Answer') {
      setWillScheduleFollowUp(true);
      setFollowUpDate('2026-05-05');
      setFollowUpTime('16:00');
      setFollowUpNotes('No answer on first attempt, retry scheduled for afternoon.');
    } else if (newOutcome === 'Not Interested' || newOutcome === 'Wrong Number') {
      setWillScheduleFollowUp(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[620px] max-w-full bg-white shadow-2xl border-l border-[#DCE7DF] z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
      {/* 1. Header Bar with Student Identity & Dismiss */}
      <div className="px-6 py-4 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#39854A]/15 text-[#28663B] font-bold text-sm flex items-center justify-center border border-[#39854A]/30 shrink-0">
            {formData.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#172B20] leading-tight">
                {formData.name}
              </h2>
              <span className="text-[10px] font-mono font-bold text-[#36473C] bg-white px-1.5 py-0.5 rounded border border-[#DCE7DF]">
                {formData.enquiryNo}
              </span>
              {isUnderage && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  &lt;17 Yrs
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-[#36473C] mt-0.5">
              {formData.city} · Preferred:{' '}
              <span className="text-[#39854A] font-bold">{formData.preferredCourse}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          title="Close Data Entry"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Top Call Action Bar (Always visible at top of the panel) */}
      <div className="px-6 py-3 bg-white border-b border-[#DCE7DF] shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isCalling ? (
              <button
                type="button"
                onClick={handleStartCall}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {formData.mobile}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                <span>Connected: {formatTime(callDuration)}</span>
                <button
                  type="button"
                  onClick={handleEndCall}
                  className="ml-2 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold"
                >
                  End Call
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowWhatsAppPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#28663B] border border-emerald-200 text-xs font-bold rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp</span>
            </button>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#36473C] uppercase tracking-wider block">
              Admission Stage
            </span>
            <span className="text-xs font-bold text-[#39854A]">
              {formData.admissionStage}
            </span>
          </div>
        </div>

        {/* Call Outcome Chips */}
        <div>
          <label className="block text-[11px] font-bold text-[#172B20] mb-1.5">
            Call Outcome <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {callOutcomesList.map((outcome) => {
              const isSelected = callOutcome === outcome;
              return (
                <button
                  key={outcome}
                  type="button"
                  onClick={() => handleOutcomeChange(outcome)}
                  className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border text-center transition-all truncate ${
                    isSelected
                      ? outcome === 'Interested'
                        ? 'bg-[#39854A] text-white border-[#39854A] shadow-xs'
                        : outcome === 'Not Interested' || outcome === 'Wrong Number'
                        ? 'bg-red-700 text-white border-red-700 shadow-xs'
                        : outcome === 'Counselling Needed'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                        : 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-[#F7FAF8] hover:bg-gray-100 text-[#172B20] border-[#DCE7DF]'
                  }`}
                >
                  {outcome}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Call Notes */}
        <div>
          <input
            type="text"
            value={callNotes}
            onChange={(e) => setCallNotes(e.target.value)}
            placeholder="Call Notes: e.g. Interested in B.Tech AI & DS, father requested hostel fee concession..."
            className="w-full text-xs px-3 py-1.5 rounded-lg border border-[#DCE7DF] bg-[#F7FAF8] focus:bg-white focus:outline-none focus:border-[#39854A]"
          />
        </div>
      </div>

      {/* 3. Section Navigation Tabs */}
      <div className="px-6 bg-[#F7FAF8] border-b border-[#DCE7DF] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {[
            { id: 'personal' as const, label: '1. Personal & Family', icon: <User className="w-3.5 h-3.5" /> },
            { id: 'education' as const, label: '2. Education', icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'interest' as const, label: '3. Admission Interest', icon: <Building className="w-3.5 h-3.5" /> },
            { id: 'reference' as const, label: '4. Reference', icon: <Tag className="w-3.5 h-3.5" /> },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`py-2.5 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeSection === sec.id
                  ? 'border-[#39854A] text-[#39854A]'
                  : 'border-transparent text-[#36473C] hover:text-[#172B20]'
              }`}
            >
              <span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Scrollable Form Content Area */}
      <div className="p-6 overflow-y-auto space-y-4 flex-1">
        {/* SIBLING NOTICE BANNER */}
        {siblings.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
            <div className="flex items-center justify-between font-bold text-[#172B20]">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#39854A]" />
                Family Sibling Linked
              </span>
              <span className="text-[11px] text-[#36473C]">
                Parent: {formData.parentMobile}
              </span>
            </div>
            <p className="text-[#36473C] mt-1 text-[11px]">
              Siblings sharing parent phone maintain independent student profiles:
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {siblings.map((sib) => (
                <span
                  key={sib.id}
                  className="px-2 py-0.5 bg-white border border-emerald-300 rounded text-[11px] font-semibold text-[#28663B]"
                >
                  {sib.name} ({sib.qualification})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 1: Personal & Family */}
        {activeSection === 'personal' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter student full name"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Student Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="+91 98XXX XXXXX"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-mono text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Date of Birth (Age: {calculatedAge} Yrs)
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                />
                {isUnderage && (
                  <span className="text-[10px] text-amber-700 font-bold mt-0.5 block">
                    ⚠ Candidate age is below 17. Review board eligibility.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  City / District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter city or district"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  placeholder="Enter father name"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Mother's Name
                </label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  placeholder="Enter mother name"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Parent / Guardian Mobile (Shared Sibling Key)
                </label>
                <input
                  type="text"
                  value={formData.parentMobile}
                  onChange={(e) =>
                    setFormData({ ...formData, parentMobile: e.target.value })
                  }
                  placeholder="Enter parent mobile (e.g. +91 9842X XXXXX)"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-mono text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                />
                <span className="text-[10px] text-[#36473C] mt-0.5 block">
                  Siblings sharing this number are recognized as family without being rejected as duplicates.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Education (Dynamic based on 12th vs UG) */}
        {activeSection === 'education' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">
                Current Qualification Level <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.qualification}
                onChange={(e) => handleQualificationChange(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-semibold text-[#172B20] focus:outline-none focus:border-[#39854A]"
              >
                <option value="12th Standard">12th Standard (Higher Secondary)</option>
                <option value="Diploma">Diploma / Polytechnic</option>
                <option value="UG Completed">UG Degree Completed</option>
                <option value="UG Final Year">UG Final Year</option>
                <option value="10th Standard">10th Standard (SSLC)</option>
              </select>
            </div>

            {/* 12th Standard Fields */}
            {is12thStudent ? (
              <div className="p-4 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-3">
                <div className="text-xs font-bold text-[#172B20] border-b border-[#DCE7DF] pb-1.5">
                  12th Standard & School Academic Details
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      10th Standard Marks / %
                    </label>
                    <input
                      type="text"
                      value={formData.tenthMarks || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, tenthMarks: e.target.value })
                      }
                      placeholder="Enter 10th marks (e.g. 445 / 500)"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      12th Group / Stream
                    </label>
                    <input
                      type="text"
                      value={formData.twelfthGroup || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, twelfthGroup: e.target.value })
                      }
                      placeholder="Enter 12th group (e.g. Maths, Physics, Chemistry, CS)"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      12th Result Status
                    </label>
                    <select
                      value={formData.twelfthResultStatus || 'Result Pending'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          twelfthResultStatus: e.target.value as any,
                        })
                      }
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-medium text-[#172B20] focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                    >
                      <option value="Result Pending">Result Pending (Board Exam Awaited)</option>
                      <option value="Declared">Declared</option>
                    </select>
                  </div>

                  {formData.twelfthResultStatus === 'Declared' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                        12th Total Marks & Cutoff
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthMarks || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, twelfthMarks: e.target.value })
                        }
                        placeholder="e.g. 545 / 600 or Cutoff 185/200"
                        className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center px-3 py-2 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-[11px] text-[#28663B]">
                      <span>12th Marks field will appear once status is changed to <strong>Declared</strong>.</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* UG Degree Fields */
              <div className="p-4 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-3">
                <div className="text-xs font-bold text-[#172B20] border-b border-[#DCE7DF] pb-1.5">
                  Undergraduate (UG) Degree Qualifications
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      UG Degree & Discipline
                    </label>
                    <input
                      type="text"
                      value={formData.ugDegree || ''}
                      onChange={(e) => setFormData({ ...formData, ugDegree: e.target.value })}
                      placeholder="Enter UG degree (e.g. B.Sc, B.Com, B.E.)"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      UG Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.ugSpecialization || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ugSpecialization: e.target.value })
                      }
                      placeholder="Enter specialization (e.g. Computer Science)"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      value={formData.ugCompletionYear || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ugCompletionYear: e.target.value })
                      }
                      placeholder="Passing year (e.g. 2026)"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-mono text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      Cumulative Marks / CGPA (Optional if Pending)
                    </label>
                    <input
                      type="text"
                      value={formData.ugMarksCgpa || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, ugMarksCgpa: e.target.value })
                      }
                      placeholder="Enter marks / CGPA (e.g. 8.2 CGPA or 78%)"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-mono text-[#172B20] placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: Admission Interest (Masters based courses) */}
        {activeSection === 'interest' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">
                Karpagam Institution / College <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.preferredInstitution}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredInstitution: e.target.value,
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-semibold text-[#172B20]"
              >
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.name}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Target Degree ({relevantDegreeType} Level)
                </label>
                <input
                  type="text"
                  value={formData.preferredDegree}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredDegree: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Candidate Interest Level
                </label>
                <select
                  value={formData.interestStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interestStatus: e.target.value as InterestLevel,
                    })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                >
                  <option value="High">High (Keen on Karpagam Admission)</option>
                  <option value="Medium">Medium (Evaluating Courses)</option>
                  <option value="Low">Low (Just Inquiring)</option>
                  <option value="Undecided">Undecided</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Offered Course (Configured from Masters) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.preferredCourse}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredCourse: e.target.value })
                  }
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-bold text-[#39854A]"
                >
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.courseName}>
                      {c.degree} {c.courseName} {c.specialization ? `(${c.specialization})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Reference Details */}
        {activeSection === 'reference' && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">
                Reference Channel / Lead Source
              </label>
              <select
                value={formData.referenceType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    referenceType: e.target.value as ReferenceType,
                  })
                }
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-semibold"
              >
                <option value="School">School / Coaching Institution</option>
                <option value="Teacher">Teacher / Lecturer</option>
                <option value="Sibling">Sibling</option>
                <option value="Alumni">Karpagam Alumni</option>
                <option value="Existing Student">Existing Student</option>
                <option value="Other">Other / Walk-in / Social Media</option>
              </select>
            </div>

            {/* Dynamic Reference Fields based on Type */}
            {formData.referenceType === 'Alumni' && (
              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2.5">
                <div className="text-xs font-bold text-[#172B20]">Alumni Verification</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      Alumni Register Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.referenceDetails.alumniRegNo || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceDetails: {
                            ...formData.referenceDetails,
                            alumniRegNo: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. 18CS142"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                      College Graduated
                    </label>
                    <input
                      type="text"
                      value={formData.referenceDetails.alumniCollege || 'KCE'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          referenceDetails: {
                            ...formData.referenceDetails,
                            alumniCollege: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. KCE or KAHE"
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.referenceType === 'Teacher' && (
              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2.5">
                <div className="text-xs font-bold text-[#172B20]">Teacher Details</div>
                <input
                  type="text"
                  value={formData.referenceDetails.teacherName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referenceDetails: {
                        ...formData.referenceDetails,
                        teacherName: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Mr. R. Shanmugam (PG Asst Physics)"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                />
              </div>
            )}

            {formData.referenceType === 'Sibling' && (
              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2.5">
                <div className="text-xs font-bold text-[#172B20]">Sibling Details</div>
                <input
                  type="text"
                  value={formData.referenceDetails.siblingName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referenceDetails: {
                        ...formData.referenceDetails,
                        siblingName: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Brother studying MBA at KAHE"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                />
              </div>
            )}

            {formData.referenceType === 'Existing Student' && (
              <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2.5">
                <div className="text-xs font-bold text-[#172B20]">
                  Existing Student Register Number
                </div>
                <input
                  type="text"
                  value={formData.referenceDetails.existingStudentRegNo || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referenceDetails: {
                        ...formData.referenceDetails,
                        existingStudentRegNo: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. 23BPA042"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-mono"
                />
              </div>
            )}
          </div>
        )}

        {/* 5. Schedule Follow-up Accordion */}
        <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2.5">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-xs font-bold text-[#172B20]">
              <input
                type="checkbox"
                checked={willScheduleFollowUp}
                onChange={(e) => setWillScheduleFollowUp(e.target.checked)}
                className="rounded text-[#39854A] focus:ring-[#39854A]"
              />
              <span>Schedule Next Callback</span>
            </span>
            {willScheduleFollowUp && (
              <span className="text-[10px] font-bold text-[#39854A] bg-[#39854A]/10 px-2 py-0.5 rounded">
                Callback Active
              </span>
            )}
          </label>

          {willScheduleFollowUp && (
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#DCE7DF]">
              <div>
                <label className="block text-[10px] font-bold text-[#36473C] mb-1">
                  Callback Date
                </label>
                <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#DCE7DF] rounded text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#39854A]" />
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-xs outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#36473C] mb-1">
                  Callback Time
                </label>
                <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#DCE7DF] rounded text-xs">
                  <Clock className="w-3.5 h-3.5 text-[#39854A]" />
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full text-xs outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Senior Counsellor Referral Accordion */}
        <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2.5">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-xs font-bold text-[#172B20]">
              <input
                type="checkbox"
                checked={willReferToCounsellor}
                onChange={(e) => setWillReferToCounsellor(e.target.checked)}
                className="rounded text-[#39854A] focus:ring-[#39854A]"
              />
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#39854A]" />
                <span>Refer to Senior Academic Counsellor</span>
              </span>
            </span>
            {willReferToCounsellor && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Escalation
              </span>
            )}
          </label>

          {willReferToCounsellor && (
            <div className="space-y-2 pt-2 border-t border-[#DCE7DF]">
              <div className="flex gap-2">
                {(['Medium', 'High', 'Urgent'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setReferralPriority(p)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                      referralPriority === p
                        ? 'bg-[#172B20] text-white font-bold'
                        : 'bg-white text-[#36473C] border-[#DCE7DF]'
                    }`}
                  >
                    {p} Priority
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={referralReason}
                onChange={(e) => setReferralReason(e.target.value)}
                placeholder="Reason for referral: e.g. 92% cut-off, asking tuition concession..."
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* 7. Bottom Action Bar: Prominent SAVE DETAILS button */}
      <div className="px-6 py-3.5 border-t border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveDetails}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-98"
        >
          <Save className="w-4 h-4" />
          <span>Save Details & Update CRM</span>
        </button>
      </div>

      {/* WhatsApp Message Preview Modal */}
      {showWhatsAppPreview && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Template Message</span>
              </div>
              <button
                onClick={() => setShowWhatsAppPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#EFEAE2] p-3 rounded-lg text-xs space-y-2">
              <div className="bg-white p-2.5 rounded shadow-xs text-[#172B20] leading-relaxed">
                Dear <span className="font-bold">{formData.name}</span>, Greetings from Karpagam
                Institutions! Admissions for{' '}
                <span className="font-bold text-[#39854A]">{formData.preferredCourse}</span> are
                open. Book your campus counseling appointment: bit.ly/kahe-admit. Reply STOP to opt
                out.
                <div className="text-[9px] text-gray-400 text-right mt-1">11:00 AM</div>
              </div>
            </div>

            <div className="text-[11px] text-[#36473C] italic">
              * Demonstration preview: Verified WhatsApp Business template format.
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowWhatsAppPreview(false)}
                className="px-4 py-1.5 text-xs font-bold bg-[#39854A] text-white rounded-lg hover:bg-[#28663B]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
