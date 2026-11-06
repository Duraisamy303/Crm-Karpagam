import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  PhoneCall,
  Calendar,
  Clock,
  GraduationCap,
  X,
  AlertTriangle,
  Send,
} from 'lucide-react';
import { CallOutcome, Student } from '../../types';

interface CallUpdateModalProps {
  student: Student;
  onClose: () => void;
}

export const CallUpdateModal: React.FC<CallUpdateModalProps> = ({ student, onClose }) => {
  const { logCall } = useCrm();

  const [outcome, setOutcome] = useState<CallOutcome>('Interested');
  const [notes, setNotes] = useState<string>('');
  const [willScheduleFollowUp, setWillScheduleFollowUp] = useState<boolean>(false);
  const [followUpDate, setFollowUpDate] = useState<string>('2026-05-08');
  const [followUpTime, setFollowUpTime] = useState<string>('11:00');
  const [followUpNotes, setFollowUpNotes] = useState<string>('');

  const [willReferToCounsellor, setWillReferToCounsellor] = useState<boolean>(false);
  const [referralReason, setReferralReason] = useState<string>(
    'Student requested detailed fee structure and lab visit tour with Senior Counsellor.'
  );
  const [referralPriority, setReferralPriority] = useState<'High' | 'Medium' | 'Urgent'>('High');

  const outcomes: CallOutcome[] = [
    'Interested',
    'Call Later',
    'No Answer',
    'Busy',
    'Not Interested',
    'Wrong Number',
    'Counselling Needed',
  ];

  const handleOutcomeClick = (opt: CallOutcome) => {
    setOutcome(opt);
    if (opt === 'Call Later') {
      setWillScheduleFollowUp(true);
      setWillReferToCounsellor(false);
    } else if (opt === 'Counselling Needed') {
      setWillReferToCounsellor(true);
      setWillScheduleFollowUp(false);
    } else if (opt === 'No Answer' || opt === 'Busy') {
      setWillScheduleFollowUp(true);
      setWillReferToCounsellor(false);
      setFollowUpNotes(`Retry attempted after ${opt}. Suggested next attempt today.`);
    } else {
      setWillScheduleFollowUp(false);
      setWillReferToCounsellor(false);
    }
  };

  const handleSave = () => {
    if (!notes.trim()) {
      alert('Please enter a brief call note.');
      return;
    }

    logCall(
      student.id,
      outcome,
      notes,
      willScheduleFollowUp
        ? {
            date: followUpDate,
            time: followUpTime,
            notes: followUpNotes || notes,
          }
        : undefined,
      willReferToCounsellor
        ? {
            reason: referralReason,
            priority: referralPriority,
          }
        : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39854A]/10 text-[#39854A] flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B20]">
                Call Update: {student.name}
              </h3>
              <p className="text-[11px] font-semibold text-[#36473C]">
                {student.mobile} · {student.city} · {student.preferredCourse}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Outcome Selector */}
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-2">
              Call Outcome <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {outcomes.map((opt) => {
                const isSelected = outcome === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleOutcomeClick(opt)}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all text-center ${
                      isSelected
                        ? 'bg-[#39854A] text-white border-[#39854A] font-bold shadow-xs'
                        : 'bg-white text-[#172B20] border-[#DCE7DF] hover:bg-[#F7FAF8]'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Next Action Helper Badge */}
            <div className="mt-2 text-[11px] text-[#36473C] bg-[#F7FAF8] p-2 rounded-lg border border-[#DCE7DF] flex items-center justify-between">
              <span className="font-bold text-[#172B20]">Next Action:</span>
              <span className="text-[#39854A] font-semibold">
                {outcome === 'Call Later' && 'Schedule callback date & time'}
                {outcome === 'No Answer' && 'Add to retry queue with afternoon attempt'}
                {outcome === 'Busy' && 'Schedule retry in 1 hour'}
                {outcome === 'Interested' && 'Save admission interest & follow-up'}
                {outcome === 'Not Interested' && 'Close active calling task'}
                {outcome === 'Wrong Number' && 'Mark invalid & stop calling'}
                {outcome === 'Counselling Needed' && 'Refer to Senior Counsellor'}
                {outcome === 'Callback' && 'Schedule callback'}
              </span>
            </div>
          </div>

          {/* Call Notes */}
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Call Notes / Student Feedback <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Student enquired about B.Tech CSE fee concessions and hostel facilities. Parents willing to visit campus this Saturday."
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
            />
          </div>

          {/* Follow-up Section Toggle */}
          <div className="p-3 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-[#172B20] cursor-pointer">
                <input
                  type="checkbox"
                  checked={willScheduleFollowUp}
                  onChange={(e) => setWillScheduleFollowUp(e.target.checked)}
                  className="rounded text-[#39854A] focus:ring-[#39854A]"
                />
                <span>Schedule Next Follow-up Callback</span>
              </label>
              {willScheduleFollowUp && (
                <span className="text-[10px] font-bold text-[#39854A]">Callback Required</span>
              )}
            </div>

            {willScheduleFollowUp && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DCE7DF]">
                <div>
                  <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                    Callback Date
                  </label>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#DCE7DF] rounded-md text-xs">
                    <Calendar className="w-3.5 h-3.5 text-[#39854A]" />
                    <input
                      type="date"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full outline-hidden text-xs bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                    Callback Time
                  </label>
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-[#DCE7DF] rounded-md text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#39854A]" />
                    <input
                      type="time"
                      value={followUpTime}
                      onChange={(e) => setFollowUpTime(e.target.value)}
                      className="w-full outline-hidden text-xs bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refer to Senior Counsellor Toggle */}
          <div className="p-3 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-bold text-[#172B20] cursor-pointer">
                <input
                  type="checkbox"
                  checked={willReferToCounsellor}
                  onChange={(e) => setWillReferToCounsellor(e.target.checked)}
                  className="rounded text-[#39854A] focus:ring-[#39854A]"
                />
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#39854A]" />
                  <span>Refer to Senior Academic Counsellor</span>
                </span>
              </label>
              {willReferToCounsellor && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Escalation
                </span>
              )}
            </div>

            {willReferToCounsellor && (
              <div className="space-y-2.5 pt-2 border-t border-[#DCE7DF]">
                <div>
                  <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                    Referral Priority
                  </label>
                  <div className="flex gap-2">
                    {(['Medium', 'High', 'Urgent'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setReferralPriority(p)}
                        className={`px-3 py-1 text-xs rounded border transition-colors ${
                          referralPriority === p
                            ? 'bg-[#172B20] text-white font-bold border-[#172B20]'
                            : 'bg-white text-[#36473C] border-[#DCE7DF]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                    Specific Reason for Referral
                  </label>
                  <input
                    type="text"
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    className="w-full text-xs p-2 rounded-md border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                    placeholder="e.g. Cutoff > 90%, asking scholarship discount or hostel tour."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#39854A] hover:bg-[#28663B] text-white rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Save Call & Update CRM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
