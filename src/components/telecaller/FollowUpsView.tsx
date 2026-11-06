import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Clock,
  PhoneCall,
  CheckCircle2,
  Calendar,
  ArrowRightLeft,
  Edit2,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { Student } from '../../types';
import { StudentDataEntryPanel } from './StudentDataEntryPanel';

export const FollowUpsView: React.FC = () => {
  const {
    filteredStudents,
    currentUser,
    setSelectedStudent,
    completeFollowUp,
    scheduleFollowUp,
    requestTransfer,
    setCallModalStudent,
  } = useCrm();

  const [activeSubTab, setActiveSubTab] = useState<'today' | 'upcoming' | 'overdue'>('today');
  const [dataEntryStudent, setDataEntryStudent] = useState<Student | null>(null);

  // Reschedule modal state
  const [rescheduleStudent, setRescheduleStudent] = useState<Student | null>(null);
  const [newDate, setNewDate] = useState('2026-05-08');
  const [newTime, setNewTime] = useState('11:00');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  // Transfer request modal state
  const [transferPromptStudent, setTransferPromptStudent] = useState<Student | null>(null);
  const [transferReason, setTransferReason] = useState('');

  // Follow-ups belonging to current telecaller
  const myFollowUps = useMemo(() => {
    return filteredStudents.filter(
      (s) => s.assignedTelecallerId === currentUser.id && s.followUpDate
    );
  }, [filteredStudents, currentUser]);

  const todayStr = '2026-05-05';

  const todayFollowUps = myFollowUps.filter(
    (s) =>
      s.followUpDate === todayStr &&
      s.followUpStatus !== 'Completed'
  );

  const upcomingFollowUps = myFollowUps.filter(
    (s) =>
      s.followUpDate &&
      s.followUpDate > todayStr &&
      s.followUpStatus !== 'Completed'
  );

  const overdueFollowUps = myFollowUps.filter(
    (s) =>
      (s.followUpStatus === 'Overdue' ||
        (s.followUpDate && s.followUpDate < todayStr)) &&
      s.followUpStatus !== 'Completed'
  );

  const displayedList =
    activeSubTab === 'today'
      ? todayFollowUps
      : activeSubTab === 'upcoming'
      ? upcomingFollowUps
      : overdueFollowUps;

  const handleRescheduleSubmit = () => {
    if (!rescheduleStudent) return;
    scheduleFollowUp(rescheduleStudent.id, newDate, newTime, rescheduleNotes || 'Rescheduled callback');
    setRescheduleStudent(null);
  };

  const handleTransferSubmit = () => {
    if (!transferPromptStudent || !transferReason.trim()) {
      alert('Please state a reason for callback transfer');
      return;
    }
    requestTransfer(transferPromptStudent.id, transferReason);
    setTransferPromptStudent(null);
    setTransferReason('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Follow-ups & Scheduled Callbacks
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Maintain callback commitments and request administrative transfers when unavailable.
          </p>
        </div>
      </div>

      {/* Tabs Row: Today, Upcoming, Overdue */}
      <div className="bg-white p-1.5 rounded-xl border border-[#DCE7DF] shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveSubTab('today')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeSubTab === 'today'
              ? 'bg-[#39854A] text-white shadow-xs'
              : 'text-[#172B20] hover:bg-[#F7FAF8]'
          }`}
        >
          <span>Today's Callbacks</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded ${
              activeSubTab === 'today' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#36473C]'
            }`}
          >
            {todayFollowUps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeSubTab === 'upcoming'
              ? 'bg-[#39854A] text-white shadow-xs'
              : 'text-[#172B20] hover:bg-[#F7FAF8]'
          }`}
        >
          <span>Upcoming Schedule</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded ${
              activeSubTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#36473C]'
            }`}
          >
            {upcomingFollowUps.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('overdue')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeSubTab === 'overdue'
              ? 'bg-red-700 text-white shadow-xs'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Overdue</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded ${
              activeSubTab === 'overdue' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
            }`}
          >
            {overdueFollowUps.length}
          </span>
        </button>
      </div>

      {/* Follow-ups Table */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]">
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-3">Contact Number</th>
              <th className="py-3 px-3">Last Call Notes</th>
              <th className="py-3 px-3">Scheduled Date & Time</th>
              <th className="py-3 px-3">Assigned Telecaller</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {displayedList.map((student) => (
              <tr key={student.id} className="hover:bg-[#F7FAF8] transition-colors">
                {/* Student Name */}
                <td className="py-3.5 px-4 font-bold text-[#172B20]">
                  <div>{student.name}</div>
                  <div className="text-[10px] text-[#36473C] font-normal">
                    {student.enquiryNo} · {student.city}
                  </div>
                </td>

                {/* Contact Number */}
                <td className="py-3.5 px-3 font-mono text-[11px] text-[#172B20]">
                  {student.mobile}
                </td>

                {/* Last Call Notes */}
                <td className="py-3.5 px-3">
                  <div className="text-[#36473C] text-[11px] max-w-[260px] line-clamp-2 leading-relaxed">
                    {student.followUpNotes || 'Callback requested regarding admission eligibility.'}
                  </div>
                  {student.lastCallOutcome && (
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-[#36473C]">
                      Outcome: {student.lastCallOutcome}
                    </span>
                  )}
                </td>

                {/* Scheduled Date & Time */}
                <td className="py-3.5 px-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#172B20]">
                    <Calendar className="w-3.5 h-3.5 text-[#39854A]" />
                    <span>{student.followUpDate}</span>
                  </div>
                  <div className="text-[10px] text-[#36473C] font-mono mt-0.5">
                    @ {student.followUpTime || '11:00'} hrs
                  </div>
                </td>

                {/* Assigned Telecaller */}
                <td className="py-3.5 px-3">
                  <span className="font-semibold text-[#172B20] bg-[#F7FAF8] px-2 py-0.5 rounded border border-[#DCE7DF] text-[11px]">
                    {student.assignedTelecallerName || currentUser.name}
                  </span>
                </td>

                {/* Action: Call & Update, Reschedule, Complete, Request Transfer */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {/* Call & Update (Primary) */}
                    <button
                      type="button"
                      onClick={() => setDataEntryStudent(student)}
                      className="px-2.5 py-1 text-xs font-bold bg-[#39854A] hover:bg-[#28663B] text-white rounded-lg transition-colors shadow-xs"
                      title="Open Call & Update"
                    >
                      Call & Update
                    </button>

                    {/* Reschedule */}
                    <button
                      type="button"
                      onClick={() => {
                        setRescheduleStudent(student);
                        setNewDate(student.followUpDate || '2026-05-08');
                        setNewTime(student.followUpTime || '11:00');
                        setRescheduleNotes(student.followUpNotes || '');
                      }}
                      className="px-2 py-1 text-xs font-semibold text-[#172B20] bg-white border border-[#DCE7DF] hover:bg-[#F7FAF8] rounded-lg transition-colors"
                      title="Reschedule Callback"
                    >
                      Reschedule
                    </button>

                    {/* Complete */}
                    <button
                      type="button"
                      onClick={() => completeFollowUp(student.id)}
                      className="px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      title="Mark Completed"
                    >
                      Complete
                    </button>

                    {/* Request Transfer */}
                    <button
                      type="button"
                      onClick={() => setTransferPromptStudent(student)}
                      className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                      title="Request Transfer to another Telecaller"
                    >
                      Transfer
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {displayedList.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#36473C]">
                  No {activeSubTab} callbacks found in your calling roster.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reschedule Callback Modal */}
      {rescheduleStudent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#172B20]">
              Reschedule Callback: {rescheduleStudent.name}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Reason / Note</label>
              <textarea
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Student in exam hall, asked to call back Saturday morning."
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => setRescheduleStudent(null)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Callback Modal */}
      {transferPromptStudent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-800">
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-[#172B20]">Request Callback Transfer</h3>
            </div>
            <p className="text-xs text-[#36473C]">
              Candidate: <span className="font-bold text-[#172B20]">{transferPromptStudent.name}</span>.
              This will submit a request to Admin to assign a replacement telecaller for this specific
              callback without changing your overall student record ownership.
            </p>
            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">
                Reason for Transfer
              </label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
                placeholder="e.g. On leave / Medical appointment / Student requested native Malayalam speaker."
                className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => setTransferPromptStudent(null)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferSubmit}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Submit Transfer Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call & Update Student Data Entry Panel */}
      {dataEntryStudent && (
        <StudentDataEntryPanel
          student={dataEntryStudent}
          onClose={() => setDataEntryStudent(null)}
          onSaved={() => setDataEntryStudent(null)}
        />
      )}
    </div>
  );
};
