'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  PhoneCall,
  Calendar,
  AlertTriangle,
  Users,
  GraduationCap,
  History,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Share2,
  Edit3,
  Save,
  MessageCircle,
} from 'lucide-react';
import {
  Student,
  AdmissionStage,
  InterestLevel,
  ReferenceType,
} from '../../types';
import { CallUpdateModal } from '../telecaller/CallUpdateModal';

interface StudentProfileModalProps {
  student: Student;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
}) => {
  const {
    students,
    institutions,
    courses,
    updateStudent,
    setSelectedStudent,
    updateAdmissionStage,
    currentRole,
    currentUser,
    requestTransfer,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'personal' | 'education' | 'interest' | 'activity'>(
    'personal'
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showCallModal, setShowCallModal] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);
  const [showTransferPrompt, setShowTransferPrompt] = useState<boolean>(false);
  const [transferReason, setTransferReason] = useState<string>('');

  // Local editable draft state
  const [formData, setFormData] = useState<Student>({ ...student });

  // Compute linked siblings by looking up linkedSiblingIds or matching parent mobile
  const siblings = useMemo(() => {
    return students.filter(
      (s) =>
        s.id !== student.id &&
        (student.linkedSiblingIds?.includes(s.id) ||
          (student.parentMobile && s.parentMobile && s.parentMobile.trim() === student.parentMobile.trim()))
    );
  }, [students, student]);

  // Dynamic age calculation & checks
  const calculatedAge = useMemo(() => {
    if (!formData.dob) return formData.age || 18;
    const birthDate = new Date(formData.dob);
    const today = new Date('2026-05-05');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }, [formData.dob, formData.age]);

  const isUnderage = calculatedAge < 17;
  const isOlderApplicant = calculatedAge > 28;

  // Filter courses available for the selected institution
  const availableCourses = useMemo(() => {
    const selectedInst = institutions.find((i) => i.name === formData.preferredInstitution);
    if (!selectedInst) return courses;
    return courses.filter((c) => c.institutionId === selectedInst.id);
  }, [institutions, courses, formData.preferredInstitution]);

  const handleSave = () => {
    updateStudent(student.id, {
      ...formData,
      age: calculatedAge,
    });
    setIsEditing(false);
  };

  const handleStageChange = (newStage: AdmissionStage) => {
    updateAdmissionStage(student.id, newStage);
    setFormData((prev) => ({ ...prev, admissionStage: newStage }));
  };

  const stages: AdmissionStage[] = [
    'New',
    'Contacted',
    'Interested',
    'Counselling',
    'Applied',
    'Admitted',
    'Not Interested',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#39854A]/15 text-[#28663B] font-bold text-sm flex items-center justify-center border border-[#39854A]/30">
              {student.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#172B20]">{student.name}</h2>
                <span className="text-[11px] font-mono text-[#36473C] bg-white px-2 py-0.5 rounded border border-[#DCE7DF]">
                  {student.enquiryNo}
                </span>
                {isUnderage && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Review Age (&lt;17 yrs)
                  </span>
                )}
                {isOlderApplicant && (
                  <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                    Mature Applicant ({calculatedAge} yrs)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#36473C] font-semibold mt-0.5">
                {student.city}, {student.area} · Preferred:{' '}
                <span className="text-[#39854A] font-bold">{student.preferredCourse}</span> · AY{' '}
                {student.academicYear}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCallModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Log Call</span>
            </button>

            <button
              onClick={() => setShowWhatsAppModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#28663B] border border-emerald-200 text-xs font-bold rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>WhatsApp</span>
            </button>

            {currentRole === 'TELECALLER' && (
              <button
                onClick={() => setShowTransferPrompt(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-700" />
                <span>Request Transfer</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admission Pipeline Stage Strip */}
        <div className="px-6 py-2.5 bg-white border-b border-[#DCE7DF] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#172B20]">Admission Stage:</span>
            <div className="flex items-center gap-1">
              {stages.map((stage) => {
                const isCurrent = (formData.admissionStage || student.admissionStage) === stage;
                return (
                  <button
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors ${
                      isCurrent
                        ? stage === 'Not Interested'
                          ? 'bg-red-700 text-white font-bold'
                          : stage === 'Admitted'
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-[#39854A] text-white font-bold shadow-xs'
                        : 'bg-[#F7FAF8] hover:bg-gray-200 text-[#36473C]'
                    }`}
                  >
                    {stage}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#36473C] font-semibold">Assigned Telecaller:</span>
            <span className="font-bold text-[#172B20] bg-[#F7FAF8] px-2 py-0.5 rounded border border-[#DCE7DF]">
              {student.assignedTelecallerName || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* COMPACT NEXT ACTION SECTION (Mandatory CRM Requirement) */}
        <div className="px-6 py-2.5 bg-[#F7FAF8] border-b border-[#DCE7DF] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#36473C] block">
                Last Contacted
              </span>
              <span className="font-semibold text-[#172B20]">
                {student.lastContactedDate || (student.activityHistory && student.activityHistory.length > 0 ? student.activityHistory[0].timestamp : 'Not yet contacted')}
              </span>
            </div>

            <div className="h-6 w-px bg-[#DCE7DF]" />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#36473C] block">
                Last Outcome
              </span>
              {student.lastCallOutcome ? (
                <span className="font-bold text-[#39854A] bg-[#39854A]/10 px-2 py-0.5 rounded text-[11px]">
                  {student.lastCallOutcome}
                </span>
              ) : (
                <span className="text-[#36473C] italic text-[11px]">No call logged</span>
              )}
            </div>

            <div className="h-6 w-px bg-[#DCE7DF]" />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#36473C] block">
                Next Action
              </span>
              <span className="font-bold text-[#172B20] text-[11px]">
                {student.nextAction || (student.followUpStatus === 'Scheduled' ? 'Scheduled callback' : 'First contact call')}
              </span>
            </div>

            <div className="h-6 w-px bg-[#DCE7DF]" />

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#36473C] block">
                Follow-up Time
              </span>
              <span className="font-semibold text-[#172B20]">
                {student.followUpDate ? `${student.followUpDate} @ ${student.followUpTime || '11:00'} hrs` : 'None scheduled'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#36473C]">
              Assigned Telecaller:
            </span>
            <span className="font-bold text-[#172B20] bg-white px-2 py-1 rounded border border-[#DCE7DF] text-[11px]">
              {student.assignedTelecallerName || 'Unassigned'}
            </span>
          </div>
        </div>

        {/* Compact Navigation Tabs */}
        <div className="px-6 bg-[#F7FAF8] border-b border-[#DCE7DF] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'personal'
                  ? 'border-[#39854A] text-[#39854A]'
                  : 'border-transparent text-[#36473C] hover:text-[#172B20]'
              }`}
            >
              Personal & Family
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'education'
                  ? 'border-[#39854A] text-[#39854A]'
                  : 'border-transparent text-[#36473C] hover:text-[#172B20]'
              }`}
            >
              Academic Qualifications
            </button>
            <button
              onClick={() => setActiveTab('interest')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'interest'
                  ? 'border-[#39854A] text-[#39854A]'
                  : 'border-transparent text-[#36473C] hover:text-[#172B20]'
              }`}
            >
              Admission Preferences
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-[#39854A] text-[#39854A]'
                  : 'border-transparent text-[#36473C] hover:text-[#172B20]'
              }`}
            >
              Activity & History ({student.activityHistory.length})
            </button>
          </div>

          <div>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1 border border-[#DCE7DF] bg-white text-[#172B20] text-xs font-bold rounded-lg hover:bg-[#F7FAF8]"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#39854A]" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: Personal & Family */}
          {activeTab === 'personal' && (
            <div className="space-y-5">
              {/* Sibling Alert / Link Box */}
              {siblings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#39854A]" />
                      <span className="text-xs font-bold text-[#172B20]">
                        Family Sibling Link Detected
                      </span>
                    </div>
                    <span className="text-[11px] text-[#36473C] font-semibold">
                      Parent Phone: {student.parentMobile}
                    </span>
                  </div>
                  <p className="text-xs text-[#36473C] mt-1">
                    This family has {siblings.length} other registered student record(s). Sibling
                    applications maintain separate individual profiles:
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {siblings.map((sib) => (
                      <button
                        key={sib.id}
                        onClick={() => setSelectedStudent(sib)}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-[#28663B] hover:bg-emerald-100 transition-colors shadow-xs"
                      >
                        <span>{sib.name}</span>
                        <span className="text-[10px] text-[#36473C] font-normal">
                          ({sib.qualification} · {sib.preferredCourse})
                        </span>
                        <span className="text-[#39854A]">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Personal Details Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                      {student.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">
                    Date of Birth (Age: {calculatedAge} yrs)
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60 flex items-center justify-between">
                      <span>{student.dob || 'Not provided'}</span>
                      <span className="text-[11px] font-mono text-[#36473C]">
                        {calculatedAge} years old
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">
                    Student Mobile
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                      {student.mobile}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">City / District</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                      {student.city}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">
                    Area / Locality
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                      {student.area}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">
                    Parent / Guardian Mobile
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.parentMobile}
                      onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                      {student.parentMobile || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">Father's Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                      {student.fatherName || '—'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#36473C] mb-1">Mother's Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    />
                  ) : (
                    <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                      {student.motherName || '—'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Education (Dynamic Form based on 12th vs UG) */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF]">
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Current Qualification
                </label>
                {isEditing ? (
                  <select
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        qualification: e.target.value as any,
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                  >
                    <option value="12th Standard">12th Standard (Higher Secondary)</option>
                    <option value="Diploma">Diploma / Polytechnic</option>
                    <option value="UG Completed">UG Degree Completed</option>
                    <option value="UG Final Year">UG Final Year</option>
                    <option value="10th Standard">10th Standard (SSLC)</option>
                  </select>
                ) : (
                  <div className="text-xs font-bold text-[#39854A]">
                    {student.qualification}
                  </div>
                )}
              </div>

              {/* If 12th Standard: show 10th Marks, 12th Group, 12th Result Status & Marks */}
              {(formData.qualification === '12th Standard' ||
                formData.qualification === 'Diploma' ||
                formData.qualification === '10th Standard') && (
                <div className="p-4 bg-white rounded-xl border border-[#DCE7DF] space-y-4">
                  <h4 className="text-xs font-bold text-[#172B20] border-b border-[#DCE7DF] pb-2">
                    School & Higher Secondary Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        School Name & Town
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.schoolOrCollege}
                          onChange={(e) =>
                            setFormData({ ...formData, schoolOrCollege: e.target.value })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        />
                      ) : (
                        <div className="text-xs font-medium text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.schoolOrCollege || 'Not recorded'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        10th Standard (SSLC) Marks / %
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.tenthMarks || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, tenthMarks: e.target.value })
                          }
                          placeholder="e.g. 450 / 500 (90%)"
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        />
                      ) : (
                        <div className="text-xs font-mono font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.tenthMarks || 'Pending'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        12th Subject Group
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.twelfthGroup || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, twelfthGroup: e.target.value })
                          }
                          placeholder="e.g. Maths, Physics, Chemistry, CS"
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        />
                      ) : (
                        <div className="text-xs font-medium text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.twelfthGroup || 'General Science'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        12th Board Result Status
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.twelfthResultStatus || 'Declared'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              twelfthResultStatus: e.target.value as any,
                            })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        >
                          <option value="Declared">Declared</option>
                          <option value="Result Pending">Result Pending (Board Exam Awaited)</option>
                        </select>
                      ) : (
                        <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.twelfthResultStatus || 'Declared'}
                        </div>
                      )}
                    </div>

                    {formData.twelfthResultStatus === 'Declared' && (
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-[#36473C] mb-1">
                          12th Marks & Cutoff Percentage
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.twelfthMarks || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, twelfthMarks: e.target.value })
                            }
                            placeholder="e.g. 540 / 600 (90%)"
                            className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                          />
                        ) : (
                          <div className="text-xs font-mono font-bold text-[#39854A] p-2 bg-[#F7FAF8] rounded-lg">
                            {student.twelfthMarks || 'Not entered'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* If UG Completed / Final Year: show UG Degree, Specialization, Year, CGPA */}
              {(formData.qualification === 'UG Completed' ||
                formData.qualification === 'UG Final Year') && (
                <div className="p-4 bg-white rounded-xl border border-[#DCE7DF] space-y-4">
                  <h4 className="text-xs font-bold text-[#172B20] border-b border-[#DCE7DF] pb-2">
                    Undergraduate (UG) Degree Details
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        UG College Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.schoolOrCollege}
                          onChange={(e) =>
                            setFormData({ ...formData, schoolOrCollege: e.target.value })
                          }
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        />
                      ) : (
                        <div className="text-xs font-medium text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.schoolOrCollege || 'Not recorded'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        UG Degree & Branch
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ugDegree || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, ugDegree: e.target.value })
                          }
                          placeholder="e.g. B.Sc / B.Com / B.E."
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        />
                      ) : (
                        <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.ugDegree || 'B.Sc Computer Science'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        Year of Completion
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ugCompletionYear || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, ugCompletionYear: e.target.value })
                          }
                          placeholder="e.g. 2026"
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        />
                      ) : (
                        <div className="text-xs font-mono font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.ugCompletionYear || '2026'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        Marks / CGPA
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.ugMarksCgpa || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, ugMarksCgpa: e.target.value })
                          }
                          placeholder="e.g. 8.2 CGPA or 78%"
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                        />
                      ) : (
                        <div className="text-xs font-mono font-bold text-[#39854A] p-2 bg-[#F7FAF8] rounded-lg">
                          {student.ugMarksCgpa || 'Result Pending'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Admission Preferences & Reference Details */}
          {activeTab === 'interest' && (
            <div className="space-y-5">
              <div className="p-4 bg-white rounded-xl border border-[#DCE7DF] space-y-4">
                <h4 className="text-xs font-bold text-[#172B20] border-b border-[#DCE7DF] pb-2">
                  Karpagam Institution & Course Preference
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-[#36473C] mb-1">
                      Preferred Institution
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.preferredInstitution}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            preferredInstitution: e.target.value,
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                      >
                        {institutions.map((inst) => (
                          <option key={inst.id} value={inst.name}>
                            {inst.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]/60">
                        {student.preferredInstitution}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#36473C] mb-1">
                      Degree Type
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.preferredDegree}
                        onChange={(e) =>
                          setFormData({ ...formData, preferredDegree: e.target.value })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                      />
                    ) : (
                      <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                        {student.preferredDegree}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#36473C] mb-1">
                      Course & Specialization
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.preferredCourse}
                        onChange={(e) =>
                          setFormData({ ...formData, preferredCourse: e.target.value })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                      >
                        {availableCourses.map((c) => (
                          <option key={c.id} value={c.courseName}>
                            {c.degree} {c.courseName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs font-bold text-[#39854A] p-2 bg-[#F7FAF8] rounded-lg">
                        {student.preferredCourse}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#36473C] mb-1">
                      Student Interest Level
                    </label>
                    {isEditing ? (
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
                        <option value="High">High (Very Keen / Campus Visit Ready)</option>
                        <option value="Medium">Medium (Comparing Options)</option>
                        <option value="Low">Low (Just Enquiring)</option>
                        <option value="Undecided">Undecided</option>
                      </select>
                    ) : (
                      <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                        {student.interestStatus}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reference Details Section */}
              <div className="p-4 bg-white rounded-xl border border-[#DCE7DF] space-y-4">
                <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-2">
                  <h4 className="text-xs font-bold text-[#172B20]">Reference Details</h4>
                  <span className="text-[11px] text-[#36473C]">Lead attribution source</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#36473C] mb-1">
                      Reference Type
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.referenceType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            referenceType: e.target.value as ReferenceType,
                          })
                        }
                        className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                      >
                        <option value="School">School / Coaching Academy</option>
                        <option value="Teacher">Teacher / Lecturer</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Alumni">Karpagam Alumni</option>
                        <option value="Existing Student">Existing Student</option>
                        <option value="Other">Other / Walk-in / Social Media</option>
                      </select>
                    ) : (
                      <div className="text-xs font-bold text-[#39854A] p-2 bg-[#F7FAF8] rounded-lg">
                        {student.referenceType}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Reference Fields based on Type */}
                  {formData.referenceType === 'Alumni' && (
                    <div className="col-span-2 grid grid-cols-3 gap-3 bg-[#F7FAF8] p-3 rounded-lg border border-[#DCE7DF]">
                      <div>
                        <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                          Alumni Reg Number
                        </label>
                        <div className="text-xs font-mono font-bold text-[#172B20]">
                          {student.referenceDetails.alumniRegNo || '18CS142'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                          College
                        </label>
                        <div className="text-xs font-bold text-[#172B20]">
                          {student.referenceDetails.alumniCollege || 'KCE'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                          Passed Out Year
                        </label>
                        <div className="text-xs font-mono font-bold text-[#172B20]">
                          {student.referenceDetails.alumniPassoutYear || '2022'}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.referenceType === 'Teacher' && (
                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        Teacher Name & Department
                      </label>
                      <div className="text-xs font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                        {student.referenceDetails.teacherName || 'Referred by School Faculty'}
                      </div>
                    </div>
                  )}

                  {formData.referenceType === 'Existing Student' && (
                    <div>
                      <label className="block text-xs font-bold text-[#36473C] mb-1">
                        Existing Student Reg No
                      </label>
                      <div className="text-xs font-mono font-bold text-[#172B20] p-2 bg-[#F7FAF8] rounded-lg">
                        {student.referenceDetails.existingStudentRegNo || '23BPA042'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Activity & History */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {/* Senior Counselling Referral Card if exists */}
              {student.counsellingReferral && (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#39854A]" />
                      <span className="text-xs font-bold text-[#172B20]">
                        Senior Counsellor Referral ({student.counsellingReferral.priority} Priority)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Status: {student.counsellingReferral.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#36473C]">
                    <span className="font-bold text-[#172B20]">Reason:</span>{' '}
                    {student.counsellingReferral.reason}
                  </p>
                  {student.counsellingReferral.counsellorNotes && (
                    <div className="text-xs bg-white p-2.5 rounded-lg border border-emerald-200 text-[#172B20]">
                      <span className="font-bold">Counsellor Notes:</span>{' '}
                      {student.counsellingReferral.counsellorNotes} (Outcome:{' '}
                      <span className="font-bold text-[#39854A]">
                        {student.counsellingReferral.counsellorOutcome}
                      </span>
                      )
                    </div>
                  )}
                </div>
              )}

              {/* Follow-up info */}
              {student.followUpDate && (
                <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-[#39854A]" />
                    <span className="font-bold text-[#172B20]">Scheduled Follow-up:</span>
                    <span className="font-mono text-[#36473C]">
                      {student.followUpDate} at {student.followUpTime || '10:00'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-[#39854A]/10 text-[#39854A] font-bold rounded">
                      {student.followUpStatus}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#36473C] italic">{student.followUpNotes}</span>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#172B20]">Interaction & Calling Log</h4>
                <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCE7DF]">
                  {student.activityHistory.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#39854A] ring-4 ring-white" />
                      <div className="bg-white p-3 rounded-xl border border-[#DCE7DF] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#172B20]">{act.title}</span>
                          <span className="text-[10px] font-mono text-[#36473C]">
                            {act.timestamp}
                          </span>
                        </div>
                        {act.details && (
                          <p className="text-[#36473C] text-[11px] leading-relaxed">
                            {act.details}
                          </p>
                        )}
                        <div className="text-[10px] text-[#36473C]/80 pt-1 flex items-center gap-2">
                          <span>By: {act.actor} ({act.role})</span>
                          {act.outcome && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 font-bold rounded">
                              {act.outcome}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
          <div className="text-xs text-[#36473C]">
            Enquiry Registered for{' '}
            <span className="font-bold text-[#172B20]">AY {student.academicYear}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#DCE7DF] text-xs font-bold rounded-lg hover:bg-[#F7FAF8] text-[#172B20]"
          >
            Close
          </button>
        </div>
      </div>

      {/* Embedded Call Modal */}
      {showCallModal && (
        <CallUpdateModal student={student} onClose={() => setShowCallModal(false)} />
      )}

      {/* WhatsApp Message Preview Modal (Visual Prototype, no false delivery claims) */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#172B20]">WhatsApp Message Preview</h3>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#EFEAE2] p-4 rounded-xl border border-[#DCE7DF] space-y-2 text-xs">
              <div className="bg-white p-3 rounded-lg shadow-xs max-w-[90%] text-[#172B20] leading-relaxed">
                Dear <span className="font-bold">{student.name}</span>, Greetings from Karpagam
                Institutions! We have reserved your enquiry for{' '}
                <span className="font-bold text-[#39854A]">{student.preferredCourse}</span>. For
                merit scholarship evaluation and lab tour bookings, visit our Eachanari campus or
                call +91 422 261 1146. Reply STOP to opt out.
                <div className="text-[9px] text-gray-400 text-right mt-1">11:42 AM · Sent</div>
              </div>
            </div>

            <div className="text-[11px] text-[#36473C] italic">
              * Demonstration Preview: Uses approved WhatsApp Business API template without sending
              real messages.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="px-4 py-1.5 text-xs font-bold bg-[#39854A] text-white rounded-lg hover:bg-[#28663B]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Transfer Prompt Modal for Telecaller */}
      {showTransferPrompt && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-800">
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-[#172B20]">Request Callback Transfer</h3>
            </div>
            <p className="text-xs text-[#36473C]">
              Specify why this scheduled callback should be temporarily transferred to another
              telecaller. Admin will review and assign a replacement.
            </p>
            <textarea
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="e.g. On medical leave tomorrow / Student requested Malayalam speaking telecaller."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] focus:outline-none focus:border-[#39854A]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTransferPrompt(false)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!transferReason.trim()) {
                    alert('Please provide a reason for the transfer.');
                    return;
                  }
                  requestTransfer(student.id, transferReason);
                  setShowTransferPrompt(false);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#39854A] text-white rounded-lg hover:bg-[#28663B]"
              >
                Submit Request to Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
