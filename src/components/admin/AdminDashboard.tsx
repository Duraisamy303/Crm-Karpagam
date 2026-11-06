'use client';

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Users,
  UserCheck,
  PhoneCall,
  HeartHandshake,
  UploadCloud,
  UserPlus,
  ArrowRightLeft,
  AlertCircle,
  GraduationCap,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { Student } from '../../types';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const {
    filteredStudents,
    users,
    setSelectedStudent,
    approveTransfer,
    rejectTransfer,
    activeAcademicYear,
  } = useCrm();

  // State for transfer modal
  const [selectedTransferStudent, setSelectedTransferStudent] = useState<Student | null>(null);
  const [replacementTelecallerId, setReplacementTelecallerId] = useState<string>('');

  // 4 KPI Card Metrics
  const totalContacts = filteredStudents.length;
  const assignedCount = filteredStudents.filter((s) => s.assignedTelecallerId).length;
  const followUpsCount = filteredStudents.filter(
    (s) => s.followUpStatus === 'Scheduled' || s.followUpStatus === 'Overdue'
  ).length;
  const interestedCount = filteredStudents.filter(
    (s) => s.interestStatus === 'High' || s.admissionStage === 'Interested'
  ).length;

  // Today's Work Metrics
  const overdueCalls = filteredStudents.filter(
    (s) => s.followUpStatus === 'Overdue' || (s.followUpDate && s.followUpDate < '2026-05-05')
  );
  const transferRequests = filteredStudents.filter(
    (s) => s.transferRequest && s.transferRequest.status === 'Pending'
  );
  const pendingCounselling = filteredStudents.filter(
    (s) => s.counsellingReferral && s.counsellingReferral.status === 'Pending'
  );

  // Telecallers list for Team Activity Table
  const telecallers = users.filter((u) => u.role === 'TELECALLER' && u.status === 'Active');

  // Recent 5 Activity Updates across all students
  const recentActivities = filteredStudents
    .flatMap((s) =>
      s.activityHistory.map((act) => ({
        ...act,
        studentName: s.name,
        enquiryNo: s.enquiryNo,
        student: s,
      }))
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 5);

  const handleApproveTransfer = () => {
    if (!selectedTransferStudent || !replacementTelecallerId) return;
    approveTransfer(selectedTransferStudent.id, replacementTelecallerId);
    setSelectedTransferStudent(null);
    setReplacementTelecallerId('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Central Admissions Overview
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Academic Year {activeAcademicYear} · Karpagam Group of Institutions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('import')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCE7DF] hover:bg-[#F7FAF8] text-[#172B20] text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-[#39854A]" />
            <span>Import Contacts</span>
          </button>
          <button
            onClick={() => onNavigate('assign')}
            className="flex items-center gap-2 px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Contacts</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards (Mandatory from prompt) */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Total Contacts</span>
            <Users className="w-4 h-4 text-[#39854A]" />
          </div>
          <div className="text-2xl font-bold text-[#172B20] font-mono tabular-nums mt-2">
            {totalContacts}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">
            {totalContacts - assignedCount} unassigned contacts
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Assigned</span>
            <UserCheck className="w-4 h-4 text-[#39854A]" />
          </div>
          <div className="text-2xl font-bold text-[#172B20] font-mono tabular-nums mt-2">
            {assignedCount}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">
            {Math.round((assignedCount / (totalContacts || 1)) * 100)}% allocation rate
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Follow-ups</span>
            <PhoneCall className="w-4 h-4 text-[#39854A]" />
          </div>
          <div className="text-2xl font-bold text-[#172B20] font-mono tabular-nums mt-2">
            {followUpsCount}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">
            {overdueCalls.length} requiring immediate attention
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Interested</span>
            <HeartHandshake className="w-4 h-4 text-[#39854A]" />
          </div>
          <div className="text-2xl font-bold text-[#172B20] font-mono tabular-nums mt-2">
            {interestedCount}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">
            Qualified candidates in pipeline
          </div>
        </div>
      </div>

      {/* Today's Work & Transfer Requests Strip */}
      <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE7DF]/60 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#39854A]" />
            <h2 className="text-sm font-bold text-[#172B20]">Today's Work & Action Items</h2>
          </div>
          <span className="text-[11px] text-[#36473C] font-semibold">Priority Operations</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Overdue Calls */}
          <div className="p-4 rounded-lg bg-[#F7FAF8] border border-[#DCE7DF] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B20]">Overdue Calls</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                  {overdueCalls.length}
                </span>
              </div>
              <p className="text-[11px] text-[#36473C] mt-2 leading-relaxed">
                Scheduled callbacks delayed beyond designated time slot.
              </p>
            </div>
            {overdueCalls.length > 0 ? (
              <button
                onClick={() => setSelectedStudent(overdueCalls[0])}
                className="mt-3 text-left text-xs font-bold text-[#39854A] hover:underline flex items-center justify-between"
              >
                <span>Resolve: {overdueCalls[0].name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="mt-3 text-xs text-[#36473C]">No overdue calls pending.</div>
            )}
          </div>

          {/* Transfer Requests */}
          <div className="p-4 rounded-lg bg-[#F7FAF8] border border-[#DCE7DF] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B20]">Transfer Requests</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {transferRequests.length}
                </span>
              </div>
              <p className="text-[11px] text-[#36473C] mt-2 leading-relaxed">
                Telecallers unavailable due to leave or language preference.
              </p>
            </div>
            {transferRequests.length > 0 ? (
              <button
                onClick={() => {
                  setSelectedTransferStudent(transferRequests[0]);
                  setReplacementTelecallerId(telecallers[0]?.id || '');
                }}
                className="mt-3 text-left text-xs font-bold text-[#39854A] hover:underline flex items-center justify-between"
              >
                <span>Approve: {transferRequests[0].transferRequest?.requestedBy}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="mt-3 text-xs text-[#36473C]">No pending transfer requests.</div>
            )}
          </div>

          {/* Pending Counselling */}
          <div className="p-4 rounded-lg bg-[#F7FAF8] border border-[#DCE7DF] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B20]">Pending Counselling</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {pendingCounselling.length}
                </span>
              </div>
              <p className="text-[11px] text-[#36473C] mt-2 leading-relaxed">
                High merit & complex enquiries referred to Senior Counsellors.
              </p>
            </div>
            {pendingCounselling.length > 0 ? (
              <button
                onClick={() => setSelectedStudent(pendingCounselling[0])}
                className="mt-3 text-left text-xs font-bold text-[#39854A] hover:underline flex items-center justify-between"
              >
                <span>Review: {pendingCounselling[0].name}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="mt-3 text-xs text-[#36473C]">All counselling sessions cleared.</div>
            )}
          </div>
        </div>
      </div>

      {/* Team Activity & Recent Activity (Clean 2-Column Split) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Team Activity Table */}
        <div className="col-span-7 bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#DCE7DF]/60 pb-3">
              <h2 className="text-sm font-bold text-[#172B20]">Telecaller Team Activity</h2>
              <button
                onClick={() => onNavigate('users')}
                className="text-xs font-bold text-[#39854A] hover:underline"
              >
                Manage Staff →
              </button>
            </div>

            <table className="w-full text-left text-xs mt-3">
              <thead>
                <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold">
                  <th className="pb-2">Telecaller</th>
                  <th className="pb-2 text-right">Assigned</th>
                  <th className="pb-2 text-right">Calls Today</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE7DF]/60">
                {telecallers.map((tc) => {
                  const assignedToTc = filteredStudents.filter(
                    (s) => s.assignedTelecallerId === tc.id
                  ).length;
                  return (
                    <tr key={tc.id} className="hover:bg-[#F7FAF8] transition-colors">
                      <td className="py-2.5 font-bold text-[#172B20]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#39854A]/10 text-[#39854A] flex items-center justify-center font-bold text-[10px]">
                            {tc.name.charAt(0)}
                          </div>
                          <span>{tc.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-[#172B20]">
                        {assignedToTc}
                      </td>
                      <td className="py-2.5 text-right font-mono font-semibold tabular-nums text-[#39854A]">
                        {tc.callsToday}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-[#DCE7DF]/60 text-[11px] text-[#36473C] flex items-center justify-between">
            <span>Workload is monitored for equal distribution</span>
            <button
              onClick={() => onNavigate('assign')}
              className="text-xs font-bold text-[#39854A] hover:underline"
            >
              Rebalance Workload
            </button>
          </div>
        </div>

        {/* Recent Activity Feed (3–5 latest updates) */}
        <div className="col-span-5 bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between border-b border-[#DCE7DF]/60 pb-3">
            <h2 className="text-sm font-bold text-[#172B20]">Recent Activity</h2>
            <span className="text-[11px] text-[#36473C]">Live audit log</span>
          </div>

          <div className="mt-3 space-y-3">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => setSelectedStudent(act.student)}
                className="p-2.5 rounded-lg border border-[#DCE7DF]/60 hover:bg-[#F7FAF8] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172B20] truncate">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-[#36473C] font-mono tabular-nums shrink-0 ml-2">
                    {act.timestamp.slice(11)}
                  </span>
                </div>
                <div className="text-[11px] text-[#36473C] mt-1 flex items-center gap-1.5">
                  <span className="font-semibold text-[#172B20]">{act.studentName}</span>
                  <span>·</span>
                  <span>by {act.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transfer Request Review & Replacement Modal */}
      {selectedTransferStudent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-700">
              <ArrowRightLeft className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#172B20]">
                Approve Callback Transfer
              </h3>
            </div>

            <div className="text-xs text-[#36473C] space-y-2 bg-[#F7FAF8] p-3 rounded-lg border border-[#DCE7DF]">
              <div>
                <span className="font-bold text-[#172B20]">Student:</span>{' '}
                {selectedTransferStudent.name} ({selectedTransferStudent.city})
              </div>
              <div>
                <span className="font-bold text-[#172B20]">Scheduled Follow-up:</span>{' '}
                {selectedTransferStudent.followUpDate} at {selectedTransferStudent.followUpTime}
              </div>
              <div>
                <span className="font-bold text-[#172B20]">Reason:</span>{' '}
                {selectedTransferStudent.transferRequest?.reason}
              </div>
              <div className="text-[11px] text-gray-500 italic mt-1">
                Note: A callback transfer does not change overall ownership of the student record.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">
                Select Replacement Telecaller
              </label>
              <select
                value={replacementTelecallerId}
                onChange={(e) => setReplacementTelecallerId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
              >
                {telecallers.map((tc) => (
                  <option key={tc.id} value={tc.id}>
                    {tc.name} ({tc.assignedContactsCount} contacts currently)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => {
                  rejectTransfer(selectedTransferStudent.id);
                  setSelectedTransferStudent(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800"
              >
                Decline Transfer
              </button>
              <button
                onClick={handleApproveTransfer}
                className="px-4 py-1.5 text-xs font-bold bg-[#39854A] hover:bg-[#28663B] text-white rounded-lg transition-colors"
              >
                Approve & Reassign Callback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
