'use client';

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Users,
  PhoneCall,
  CheckCircle2,
  Clock,
  Eye,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { Student } from '../../types';

interface TeamWorkloadSectionProps {
  onOpenReassignModal?: (students: Student[]) => void;
}

export const TeamWorkloadSection: React.FC<TeamWorkloadSectionProps> = ({
  onOpenReassignModal,
}) => {
  const { users, filteredStudents, setSelectedStudent } = useCrm();

  const [selectedTelecallerForInspection, setSelectedTelecallerForInspection] = useState<string | null>(null);

  const activeTelecallers = users.filter(
    (u) => u.role === 'TELECALLER' && u.status === 'Active'
  );

  // Calculate workloads accurately:
  // Current Assigned: unique students currently owned by telecaller in active academic year
  // Called: assigned students with at least 1 completed call attempt in activityHistory
  // Pending: assigned students without any call attempt in activityHistory
  const workloadStats = activeTelecallers.map((tc) => {
    const ownedStudents = filteredStudents.filter(
      (s) => s.assignedTelecallerId === tc.id
    );

    const calledStudents = ownedStudents.filter((s) =>
      s.activityHistory.some((act) => act.actionType === 'CALL')
    );

    const pendingStudents = ownedStudents.filter(
      (s) => !s.activityHistory.some((act) => act.actionType === 'CALL')
    );

    return {
      telecaller: tc,
      assigned: ownedStudents.length,
      called: calledStudents.length,
      pending: pendingStudents.length,
      students: ownedStudents,
    };
  });

  const inspectedTelecallerData = workloadStats.find(
    (w) => w.telecaller.id === selectedTelecallerForInspection
  );

  return (
    <div className="space-y-4">
      {/* Team Workload Table */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#172B20]">
              Active Telecaller Workloads ({activeTelecallers.length})
            </span>
            <span className="text-[11px] text-[#36473C]">
              · Unique student contacts per telecaller in current cycle
            </span>
          </div>
          <span className="text-[10px] text-[#36473C] bg-white px-2 py-0.5 rounded border border-[#DCE7DF]">
            Called = At least 1 call attempt completed
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
              <th className="py-2.5 px-4">Telecaller Name</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-center">Current Assigned</th>
              <th className="py-2.5 px-3 text-center">Called Contacts</th>
              <th className="py-2.5 px-3 text-center">Pending Calls</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {workloadStats.map((row) => (
              <tr key={row.telecaller.id} className="hover:bg-[#F7FAF8] transition-colors">
                {/* Telecaller Name */}
                <td className="py-3 px-4 font-bold text-[#172B20]">
                  <div>{row.telecaller.name}</div>
                  <div className="text-[10px] text-[#36473C] font-mono font-normal">
                    {row.telecaller.mobile}
                  </div>
                </td>

                {/* Status */}
                <td className="py-3 px-3">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </td>

                {/* Assigned */}
                <td className="py-3 px-3 text-center">
                  <span className="font-mono font-bold text-xs bg-gray-100 text-[#172B20] px-2.5 py-0.5 rounded">
                    {row.assigned}
                  </span>
                </td>

                {/* Called */}
                <td className="py-3 px-3 text-center">
                  <span className="font-mono font-bold text-xs bg-emerald-50 text-[#28663B] px-2.5 py-0.5 rounded border border-emerald-200">
                    {row.called}
                  </span>
                </td>

                {/* Pending */}
                <td className="py-3 px-3 text-center">
                  <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded border ${
                    row.pending > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-gray-50 text-gray-400 border-gray-200'
                  }`}>
                    {row.pending}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedTelecallerForInspection(row.telecaller.id)}
                      className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-[#DCE7DF] text-[#172B20] text-xs font-bold rounded-lg transition-colors shadow-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#39854A]" />
                      <span>View Contacts ({row.assigned})</span>
                    </button>

                    {row.assigned > 0 && onOpenReassignModal && (
                      <button
                        onClick={() => onOpenReassignModal(row.students)}
                        className="px-2.5 py-1 bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reassign</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Telecaller Contacts Inspection Drawer/Modal */}
      {inspectedTelecallerData && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#172B20]">
                  {inspectedTelecallerData.telecaller.name}'s Assigned Contacts
                </h3>
                <p className="text-[11px] text-[#36473C]">
                  {inspectedTelecallerData.assigned} Total ({inspectedTelecallerData.called} Called · {inspectedTelecallerData.pending} Pending)
                </p>
              </div>
              <button
                onClick={() => setSelectedTelecallerForInspection(null)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto space-y-2 text-xs divide-y divide-[#DCE7DF]/50">
              {inspectedTelecallerData.students.length === 0 ? (
                <div className="py-6 text-center text-gray-400">
                  No contacts currently assigned to this telecaller.
                </div>
              ) : (
                inspectedTelecallerData.students.map((st) => {
                  const hasBeenCalled = st.activityHistory.some((act) => act.actionType === 'CALL');
                  return (
                    <div key={st.id} className="pt-2 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#172B20] flex items-center gap-2">
                          <span>{st.name}</span>
                          <span className="text-[10px] font-mono text-[#36473C] bg-gray-100 px-1 py-0.2 rounded">
                            {st.enquiryNo}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#36473C]">
                          {st.city} · {st.preferredCourse}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasBeenCalled ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Called
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Pending
                          </span>
                        )}

                        <button
                          onClick={() => {
                            setSelectedStudent(st);
                            setSelectedTelecallerForInspection(null);
                          }}
                          className="text-[11px] text-[#39854A] font-bold hover:underline"
                        >
                          Profile →
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-3 border-t border-[#DCE7DF] bg-[#F7FAF8] flex justify-between items-center">
              {inspectedTelecallerData.students.length > 0 && onOpenReassignModal && (
                <button
                  onClick={() => {
                    const stList = inspectedTelecallerData.students;
                    setSelectedTelecallerForInspection(null);
                    onOpenReassignModal(stList);
                  }}
                  className="text-xs text-purple-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reassign All {inspectedTelecallerData.students.length} Contacts</span>
                </button>
              )}
              <button
                onClick={() => setSelectedTelecallerForInspection(null)}
                className="ml-auto px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
