'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Calendar,
  Filter,
  Users,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  RotateCcw,
  UserPlus,
  FileText,
} from 'lucide-react';
import { AssignmentRecord } from '../../types';

interface AssignmentHistorySectionProps {
  onViewStudentProfile?: (studentId: string) => void;
}

export const AssignmentHistorySection: React.FC<AssignmentHistorySectionProps> = ({
  onViewStudentProfile,
}) => {
  const { assignmentHistory, users, activeAcademicYear, academicYears, students, setSelectedStudent } = useCrm();

  const [dateFilterType, setDateFilterType] = useState<'ALL' | 'DAY' | 'MONTH' | 'YEAR' | 'CUSTOM'>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('2026-05-05');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-05');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [customStart, setCustomStart] = useState<string>('2026-05-01');
  const [customEnd, setCustomEnd] = useState<string>('2026-05-31');

  const [selectedTelecallerId, setSelectedTelecallerId] = useState<string>('ALL');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(activeAcademicYear);
  const [activeRecordForModal, setActiveRecordForModal] = useState<AssignmentRecord | null>(null);

  const telecallers = useMemo(() => {
    return users.filter((u) => u.role === 'TELECALLER');
  }, [users]);

  // Filtered Assignment History
  const filteredRecords = useMemo(() => {
    return assignmentHistory.filter((rec) => {
      // Academic year filter
      if (selectedAcademicYear !== 'ALL' && rec.academicYear !== selectedAcademicYear) {
        return false;
      }

      // Telecaller filter
      if (selectedTelecallerId !== 'ALL' && rec.telecallerId !== selectedTelecallerId) {
        return false;
      }

      // Date Filters
      if (dateFilterType === 'DAY') {
        return rec.assignmentDate === selectedDay;
      }
      if (dateFilterType === 'MONTH') {
        return rec.assignmentDate.startsWith(selectedMonth);
      }
      if (dateFilterType === 'YEAR') {
        return rec.assignmentDate.startsWith(selectedYear);
      }
      if (dateFilterType === 'CUSTOM') {
        return rec.assignmentDate >= customStart && rec.assignmentDate <= customEnd;
      }

      return true;
    });
  }, [
    assignmentHistory,
    selectedAcademicYear,
    selectedTelecallerId,
    dateFilterType,
    selectedDay,
    selectedMonth,
    selectedYear,
    customStart,
    customEnd,
  ]);

  const totalAssignedInView = filteredRecords.reduce((acc, r) => acc + r.contactsAssignedCount, 0);

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE7DF] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Granularity Filter */}
          <div className="flex items-center gap-1 bg-[#F7FAF8] p-1 rounded-lg border border-[#DCE7DF]">
            {(
              [
                { id: 'ALL', label: 'All Dates' },
                { id: 'DAY', label: 'Day' },
                { id: 'MONTH', label: 'Month' },
                { id: 'YEAR', label: 'Year' },
                { id: 'CUSTOM', label: 'Custom Range' },
              ] as const
            ).map((btn) => (
              <button
                key={btn.id}
                onClick={() => setDateFilterType(btn.id)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  dateFilterType === btn.id
                    ? 'bg-[#39854A] text-white font-bold shadow-xs'
                    : 'text-[#172B20] hover:bg-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Telecaller & Academic Year Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedTelecallerId}
              onChange={(e) => setSelectedTelecallerId(e.target.value)}
              className="text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-semibold text-[#172B20] focus:outline-none focus:border-[#39854A]"
            >
              <option value="ALL">All Telecallers</option>
              {telecallers.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name}
                </option>
              ))}
            </select>

            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-semibold text-[#172B20] focus:outline-none focus:border-[#39854A]"
            >
              <option value="ALL">All Academic Cycles</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.name}>
                  AY {ay.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Sub-filter based on Date Granularity selection */}
        {dateFilterType === 'DAY' && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#DCE7DF]">
            <span className="text-xs font-bold text-[#172B20]">Select Day:</span>
            <input
              type="date"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="text-xs p-1.5 rounded border border-[#DCE7DF] bg-white font-mono"
            />
          </div>
        )}

        {dateFilterType === 'MONTH' && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#DCE7DF]">
            <span className="text-xs font-bold text-[#172B20]">Select Month:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs p-1.5 rounded border border-[#DCE7DF] bg-white font-mono"
            />
          </div>
        )}

        {dateFilterType === 'YEAR' && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#DCE7DF]">
            <span className="text-xs font-bold text-[#172B20]">Select Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="text-xs p-1.5 rounded border border-[#DCE7DF] bg-white font-mono"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2027">2027</option>
            </select>
          </div>
        )}

        {dateFilterType === 'CUSTOM' && (
          <div className="flex items-center gap-3 pt-1 border-t border-[#DCE7DF]">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#172B20]">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="text-xs p-1.5 rounded border border-[#DCE7DF] bg-white font-mono"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[#172B20]">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="text-xs p-1.5 rounded border border-[#DCE7DF] bg-white font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Historical Logs Table */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#172B20]">
              Historical Assignment Logs ({filteredRecords.length})
            </span>
            <span className="text-[11px] text-[#36473C]">
              · {totalAssignedInView} total contact allocations in view
            </span>
          </div>
          <span className="text-[10px] text-[#36473C] bg-white px-2 py-0.5 rounded border border-[#DCE7DF]">
            Maintains full audit trail without double-counting current owners
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
              <th className="py-2.5 px-4">Assignment Date</th>
              <th className="py-2.5 px-3">Telecaller</th>
              <th className="py-2.5 px-3 text-center">Contacts Assigned</th>
              <th className="py-2.5 px-3">Assigned By</th>
              <th className="py-2.5 px-3">Action Type</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No assignment activity matches the selected date and telecaller filters.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-[#F7FAF8] transition-colors">
                  {/* Date */}
                  <td className="py-3 px-4 font-mono text-[11px] font-semibold text-[#172B20]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#39854A]" />
                      <span>{rec.assignmentDate}</span>
                    </div>
                  </td>

                  {/* Telecaller */}
                  <td className="py-3 px-3 font-bold text-[#172B20]">
                    <div>{rec.telecallerName}</div>
                    {rec.previousTelecallerName && (
                      <div className="text-[10px] text-gray-500 font-normal">
                        Transferred from: {rec.previousTelecallerName}
                      </div>
                    )}
                  </td>

                  {/* Contacts Count */}
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono font-bold text-xs bg-emerald-50 text-[#28663B] px-2 py-0.5 rounded border border-emerald-200">
                      {rec.contactsAssignedCount} contact{rec.contactsAssignedCount > 1 ? 's' : ''}
                    </span>
                  </td>

                  {/* Assigned By */}
                  <td className="py-3 px-3 text-[11px] text-[#36473C]">
                    <div className="font-semibold text-[#172B20]">{rec.assignedBy}</div>
                    <div className="text-[10px] text-gray-400">AY {rec.academicYear}</div>
                  </td>

                  {/* Action Type */}
                  <td className="py-3 px-3">
                    {rec.actionType === 'New Assignment' ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <UserPlus className="w-3 h-3 text-emerald-600" />
                        New Assignment
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-200 inline-flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 text-purple-600" />
                        Reassignment
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveRecordForModal(rec)}
                      className="px-3 py-1 bg-white hover:bg-gray-50 border border-[#DCE7DF] text-[#172B20] text-xs font-bold rounded-lg transition-colors shadow-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#39854A]" />
                      <span>View Contacts</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Record Contacts Modal */}
      {activeRecordForModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in duration-150">
            <div className="px-5 py-3.5 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#36473C] bg-white px-1.5 py-0.5 rounded border border-[#DCE7DF]">
                  {activeRecordForModal.id}
                </span>
                <h3 className="text-sm font-bold text-[#172B20] mt-1">
                  Assignment Record Details
                </h3>
              </div>
              <button
                onClick={() => setActiveRecordForModal(null)}
                className="text-gray-400 hover:text-gray-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#DCE7DF]">
                <span className="text-[#36473C]">Assigned To:</span>
                <span className="font-bold text-[#172B20]">{activeRecordForModal.telecallerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE7DF]">
                <span className="text-[#36473C]">Date:</span>
                <span className="font-mono text-[#172B20]">{activeRecordForModal.assignmentDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DCE7DF]">
                <span className="text-[#36473C]">Action:</span>
                <span className="font-bold text-[#39854A]">{activeRecordForModal.actionType}</span>
              </div>
              {activeRecordForModal.reason && (
                <div className="py-1 border-b border-[#DCE7DF]">
                  <span className="text-[#36473C] block mb-0.5">Reason:</span>
                  <span className="text-[#172B20] font-medium">{activeRecordForModal.reason}</span>
                </div>
              )}

              <div className="pt-2">
                <span className="font-bold text-[#172B20] block mb-2">
                  Assigned Students ({activeRecordForModal.contactsAssignedCount}):
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-[#DCE7DF]/40">
                  {activeRecordForModal.studentIds.map((sId, idx) => {
                    const st = students.find((s) => s.id === sId);
                    return (
                      <div key={sId} className="pt-1.5 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#172B20]">
                            {activeRecordForModal.studentNames[idx] || st?.name || sId}
                          </div>
                          <div className="text-[10px] text-[#36473C]">
                            {st ? `${st.city} · ${st.preferredCourse}` : 'Enquiry Record'}
                          </div>
                        </div>

                        {st && (
                          <button
                            onClick={() => {
                              setSelectedStudent(st);
                              setActiveRecordForModal(null);
                            }}
                            className="text-[11px] text-[#39854A] hover:underline font-bold"
                          >
                            Profile →
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#DCE7DF] bg-[#F7FAF8] text-right">
              <button
                onClick={() => setActiveRecordForModal(null)}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
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
