'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Eye,
  FileCheck,
  Send,
  X,
  PhoneCall,
  UserCheck,
  UserPlus,
  FileSpreadsheet,
  MessageCircle,
  ArrowRightLeft,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Student, AdmissionStage } from '../../types';
import { AddContactModal } from '../common/AddContactModal';
import { ImportContactsModal } from '../common/ImportContactsModal';

export const CounsellingQueueView: React.FC = () => {
  const {
    filteredStudents,
    updateCounsellingSession,
    setSelectedStudent,
    updateAdmissionStage,
    currentUser,
    scheduleFollowUp,
    requestTransfer,
    showToast,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'Pending' | 'In Progress' | 'Completed' | 'Direct'>('Pending');
  const [selectedStudentForCounselling, setSelectedStudentForCounselling] = useState<Student | null>(null);

  // Modals
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Quick Action Sub-Modals
  const [followUpModalStudent, setFollowUpModalStudent] = useState<Student | null>(null);
  const [followUpDate, setFollowUpDate] = useState('2026-05-08');
  const [followUpTime, setFollowUpTime] = useState('11:00');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const [transferModalStudent, setTransferModalStudent] = useState<Student | null>(null);
  const [transferReason, setTransferReason] = useState('Routine documentation follow-up required by telecaller team.');

  // Counselling form state
  const [counsellingNotes, setCounsellingNotes] = useState('');
  const [counsellingOutcome, setCounsellingOutcome] = useState('Campus Visit Scheduled');
  const [newAdmissionStage, setNewAdmissionStage] = useState<AdmissionStage>('Applied');

  // Filter students referred to senior counsellor
  const referredStudents = useMemo(() => {
    return filteredStudents.filter((s) => s.counsellingReferral);
  }, [filteredStudents]);

  // Direct enquiries created by or assigned to counsellor
  const directCounsellorStudents = useMemo(() => {
    return filteredStudents.filter(
      (s) =>
        s.assignedTelecallerName === currentUser.name ||
        s.assignedTelecallerId === currentUser.id ||
        (s.activityHistory && s.activityHistory.some((a) => a.actor === currentUser.name))
    );
  }, [filteredStudents, currentUser]);

  const displayedList = useMemo(() => {
    if (activeTab === 'Direct') {
      return directCounsellorStudents;
    }
    return referredStudents.filter(
      (s) => s.counsellingReferral?.status === activeTab
    );
  }, [referredStudents, directCounsellorStudents, activeTab]);

  const handleOpenCounsellingDetails = (student: Student) => {
    setSelectedStudentForCounselling(student);
    setCounsellingNotes(student.counsellingReferral?.counsellorNotes || '');
    setCounsellingOutcome(student.counsellingReferral?.counsellorOutcome || 'Campus Visit Scheduled');
    setNewAdmissionStage(student.admissionStage);
  };

  const handleSaveCounsellingSession = () => {
    if (!selectedStudentForCounselling) return;
    if (!counsellingNotes.trim()) {
      showToast('Please enter counselling session notes.');
      return;
    }

    updateCounsellingSession(
      selectedStudentForCounselling.id,
      counsellingNotes,
      counsellingOutcome,
      newAdmissionStage
    );

    setSelectedStudentForCounselling(null);
  };

  const handleQuickWhatsApp = (student: Student) => {
    const rawDigits = student.mobile.replace(/\D/g, '');
    const cleanNumber = rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`;
    const text = encodeURIComponent(
      `Dear ${student.name}, this is ${currentUser.name}, Senior Academic Counsellor at Karpagam Institutions. We have reviewed your eligibility for ${student.preferredCourse} (${student.preferredInstitution}). We would like to invite you for a 1-on-1 academic consultation and campus tour. Let us know your convenient time.`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
    showToast(`Opened WhatsApp chat for ${student.name}`);
  };

  const handleSaveFollowUp = () => {
    if (!followUpModalStudent) return;
    if (!followUpNotes.trim()) {
      showToast('Please specify the follow-up agenda.');
      return;
    }
    scheduleFollowUp(followUpModalStudent.id, followUpDate, followUpTime, followUpNotes);
    setFollowUpModalStudent(null);
    setFollowUpNotes('');
  };

  const handleSaveTransfer = () => {
    if (!transferModalStudent) return;
    if (!transferReason.trim()) {
      showToast('Please enter the reason for assignment request.');
      return;
    }
    requestTransfer(transferModalStudent.id, transferReason);
    setTransferModalStudent(null);
  };

  const outcomes = [
    'Campus Visit Scheduled',
    'Seat Reserved (Token Paid)',
    'Fee Concession Approved',
    'Application Form Issued',
    'Deferred / Under Consideration',
    'Not Interested (Course Mismatch)',
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Top Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Senior Academic Counselling Queue
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Conduct high-level academic consultations, verify eligibility cut-offs, and authorize spot provisional admissions.
          </p>
        </div>

        {/* Action Buttons: Add Contact & Import Contacts */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F7FAF8] border border-[#DCE7DF] text-[#172B20] text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#39854A]" />
            <span>Import Contacts</span>
          </button>

          <button
            onClick={() => setIsAddContactOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Contact</span>
          </button>
        </div>
      </div>

      {/* Tabs Row: Pending, In Progress, Completed, Direct */}
      <div className="bg-white p-1.5 rounded-xl border border-[#DCE7DF] shadow-xs flex items-center gap-1 overflow-x-auto">
        {(['Pending', 'In Progress', 'Completed'] as const).map((tab) => {
          const count = referredStudents.filter((s) => s.counsellingReferral?.status === tab).length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors shrink-0 ${
                isActive
                  ? 'bg-[#39854A] text-white shadow-xs'
                  : 'text-[#172B20] hover:bg-[#F7FAF8]'
              }`}
            >
              <span>{tab} Enquiries</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#36473C]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setActiveTab('Direct')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors shrink-0 ${
            activeTab === 'Direct'
              ? 'bg-[#39854A] text-white shadow-xs'
              : 'text-[#172B20] hover:bg-[#F7FAF8]'
          }`}
        >
          <span>Direct Enquiries</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded ${
              activeTab === 'Direct' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#36473C]'
            }`}
          >
            {directCounsellorStudents.length}
          </span>
        </button>
      </div>

      {/* Counselling Queue Table */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]">
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-3">Target Programme</th>
              <th className="py-3 px-3">{activeTab === 'Direct' ? 'Enquiry Source' : 'Referred By'}</th>
              <th className="py-3 px-3">{activeTab === 'Direct' ? 'Current Stage' : 'Referral Reason'}</th>
              <th className="py-3 px-3 text-center">{activeTab === 'Direct' ? 'Follow-up' : 'Priority'}</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {displayedList.map((student) => {
              const ref = student.counsellingReferral;
              return (
                <tr key={student.id} className="hover:bg-[#F7FAF8] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#172B20]">
                    <div className="flex items-center gap-2">
                      <span>{student.name}</span>
                      <span className="text-[10px] font-mono text-[#36473C] bg-gray-100 px-1 py-0.2 rounded">
                        {student.enquiryNo}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#36473C] font-normal">
                      {student.mobile} · {student.city} · {student.qualification}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[#172B20] truncate max-w-[200px]">
                      {student.preferredCourse}
                    </div>
                    <div className="text-[10px] text-[#36473C]">
                      {student.preferredInstitution.split('(')[1]?.replace(')', '') || 'KAHE'}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    {activeTab === 'Direct' ? (
                      <div>
                        <div className="font-semibold text-[#172B20]">{student.referenceType || 'Direct Walk-in'}</div>
                        <div className="text-[10px] text-[#36473C] font-mono">AY {student.academicYear}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-[#172B20]">{ref?.referredBy}</div>
                        <div className="text-[10px] text-[#36473C] font-mono">{ref?.referredDate}</div>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    {activeTab === 'Direct' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {student.admissionStage}
                      </span>
                    ) : (
                      <div className="text-[#36473C] text-[11px] max-w-[220px] leading-relaxed line-clamp-2">
                        {ref?.reason}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    {activeTab === 'Direct' ? (
                      <span className="text-[10px] font-mono text-[#36473C]">
                        {student.followUpDate || 'None'}
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ref?.priority === 'Urgent'
                            ? 'bg-red-100 text-red-800'
                            : ref?.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ref?.priority}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ref?.status === 'Completed' || student.admissionStage === 'Admitted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ref?.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {activeTab === 'Direct' ? student.admissionStage : ref?.status}
                    </span>
                  </td>

                  {/* Actions Column with Direct WhatsApp, Schedule Follow-up, Transfer, and Session Review */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Direct WhatsApp Action Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickWhatsApp(student)}
                        title={`Send WhatsApp Consultation Invite to ${student.name}`}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Schedule Follow-up Action Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setFollowUpModalStudent(student);
                          setFollowUpNotes(`Senior Academic Follow-up consultation with ${student.name} regarding ${student.preferredCourse}`);
                        }}
                        title="Schedule Consultation Follow-up"
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>

                      {/* Request Assignment to Telecaller Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setTransferModalStudent(student);
                          setTransferReason(`Counselled on ${student.preferredCourse}. Requires routine telecaller callback for documentation submission.`);
                        }}
                        title="Request Assignment to Telecaller"
                        className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>

                      {/* Main Counselling Details / Profile Button */}
                      <button
                        onClick={() => handleOpenCounsellingDetails(student)}
                        className="px-2.5 py-1 bg-[#39854A] hover:bg-[#28663B] text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs ml-1"
                      >
                        Counselling →
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedList.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[#36473C]">
                  No {activeTab.toLowerCase()} counselling enquiries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* QUICK FOLLOW-UP MODAL */}
      {followUpModalStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#39854A]" />
                <h3 className="text-sm font-bold text-[#172B20]">
                  Schedule Consultation Follow-up
                </h3>
              </div>
              <button
                onClick={() => setFollowUpModalStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-2.5 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]">
                <div className="font-bold text-[#172B20]">{followUpModalStudent.name}</div>
                <div className="text-[11px] text-[#36473C]">
                  {followUpModalStudent.mobile} · {followUpModalStudent.preferredCourse}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                  Agenda / Consultation Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                  placeholder="e.g. In-person lab inspection with parent; review provisional scholarship."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => setFollowUpModalStudent(null)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFollowUp}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Confirm Follow-up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ASSIGNMENT REQUEST MODAL */}
      {transferModalStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-[#172B20]">
                  Request Assignment to Telecaller
                </h3>
              </div>
              <button
                onClick={() => setTransferModalStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-[#36473C]">
                Send this enquiry to the central Admin queue to assign to a dedicated telecaller for documentation and status updates.
              </p>

              <div className="p-2.5 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]">
                <div className="font-bold text-[#172B20]">{transferModalStudent.name}</div>
                <div className="text-[11px] text-[#36473C]">
                  {transferModalStudent.mobile} · {transferModalStudent.preferredCourse}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                  Reason for Assignment Request <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                  placeholder="e.g. Counselling completed; candidate needs regular telecaller follow-up for TC and mark-sheet collection."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => setTransferModalStudent(null)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTransfer}
                className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700"
              >
                Submit Request to Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNSELLING DETAILS MODAL / DRAWER */}
      {selectedStudentForCounselling && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#39854A]/10 text-[#39854A] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B20]">
                    Counselling Review: {selectedStudentForCounselling.name}
                  </h3>
                  <p className="text-xs text-[#36473C]">
                    Enquiry ID: {selectedStudentForCounselling.enquiryNo} · Mobile:{' '}
                    {selectedStudentForCounselling.mobile}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudentForCounselling(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Student Academic & Contact Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] text-xs">
                <div>
                  <span className="text-[#36473C]">Qualification:</span>{' '}
                  <span className="font-bold text-[#172B20]">
                    {selectedStudentForCounselling.qualification}
                  </span>
                </div>
                <div>
                  <span className="text-[#36473C]">Marks / Cutoff:</span>{' '}
                  <span className="font-mono font-bold text-[#39854A]">
                    {selectedStudentForCounselling.twelfthMarks ||
                      selectedStudentForCounselling.ugMarksCgpa ||
                      'Board Result Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[#36473C]">Target Course:</span>{' '}
                  <span className="font-bold text-[#172B20]">
                    {selectedStudentForCounselling.preferredCourse}
                  </span>
                </div>
                <div>
                  <span className="text-[#36473C]">Campus:</span>{' '}
                  <span className="font-bold text-[#172B20]">
                    {selectedStudentForCounselling.preferredInstitution}
                  </span>
                </div>
              </div>

              {/* Referral Context */}
              {selectedStudentForCounselling.counsellingReferral && (
                <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-[#172B20]">
                    <span>
                      Referral by {selectedStudentForCounselling.counsellingReferral?.referredBy}
                    </span>
                    <span className="text-amber-800">
                      Priority: {selectedStudentForCounselling.counsellingReferral?.priority}
                    </span>
                  </div>
                  <p className="text-[#36473C] leading-relaxed">
                    {selectedStudentForCounselling.counsellingReferral?.reason}
                  </p>
                </div>
              )}

              {/* Counselling Outcome Selection */}
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-2">
                  Session Outcome Decision <span className="text-red-500">*</span>
                </label>
                <select
                  value={counsellingOutcome}
                  onChange={(e) => setCounsellingOutcome(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white font-medium focus:outline-none focus:border-[#39854A]"
                >
                  {outcomes.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Update Admission Progress Stage */}
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-2">
                  Update Candidate Admission Stage
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Counselling', 'Applied', 'Admitted', 'Not Interested'] as const).map(
                    (stg) => (
                      <button
                        key={stg}
                        type="button"
                        onClick={() => setNewAdmissionStage(stg)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                          newAdmissionStage === stg
                            ? 'bg-[#39854A] text-white font-bold border-[#39854A] shadow-xs'
                            : 'bg-white text-[#36473C] border-[#DCE7DF] hover:bg-[#F7FAF8]'
                        }`}
                      >
                        {stg}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Counselling Notes */}
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">
                  Senior Counsellor Consultation Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={counsellingNotes}
                  onChange={(e) => setCounsellingNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Conducted department facility tour with student & father. Verified original 12th marksheet (Cutoff 182.5/200). Issued provisional seat reservation token slip."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedStudent(selectedStudentForCounselling);
                  setSelectedStudentForCounselling(null);
                }}
                className="text-xs font-bold text-[#39854A] hover:underline"
              >
                View Full Student Profile →
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStudentForCounselling(null)}
                  className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCounsellingSession}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Finalize Counselling Session</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REUSABLE ADD CONTACT & IMPORT MODALS */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
      />

      <ImportContactsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
