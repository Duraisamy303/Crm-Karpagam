'use client';

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Student } from '../../types';

interface ReassignModalProps {
  studentsToReassign: Student[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ReassignModal: React.FC<ReassignModalProps> = ({
  studentsToReassign,
  onClose,
  onSuccess,
}) => {
  const { users, reassignContacts } = useCrm();

  const [targetTelecallerId, setTargetTelecallerId] = useState<string>('');
  const [reason, setReason] = useState<string>('Workload rebalancing and priority callback');

  const activeTelecallers = users.filter((u) => u.role === 'TELECALLER' && u.status === 'Active');

  const handleExecute = () => {
    if (!targetTelecallerId) {
      alert('Please select a target telecaller.');
      return;
    }
    if (!reason.trim()) {
      alert('Please enter a reason for reassignment.');
      return;
    }

    reassignContacts(
      studentsToReassign.map((s) => s.id),
      targetTelecallerId,
      reason.trim()
    );
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#39854A]/10 text-[#39854A] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172B20]">Reassign Selected Contacts</h3>
              <p className="text-[11px] text-[#36473C]">
                Transfer ownership to another active Telecaller
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Selected Contacts Summary */}
          <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-1.5">
            <div className="flex items-center justify-between text-[#172B20]">
              <span className="font-bold">Contacts to Reassign:</span>
              <span className="font-bold text-[#39854A]">{studentsToReassign.length} contacts</span>
            </div>
            <div className="text-[11px] text-[#36473C] truncate">
              {studentsToReassign.map((s) => s.name).slice(0, 3).join(', ')}
              {studentsToReassign.length > 3 ? ` and ${studentsToReassign.length - 3} others` : ''}
            </div>
          </div>

          {/* Current Owner Info */}
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Current Assigned Owner
            </label>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-[#DCE7DF] text-[#36473C] font-semibold">
              {Array.from(new Set(studentsToReassign.map((s) => s.assignedTelecallerName || 'Unassigned'))).join(', ')}
            </div>
          </div>

          {/* New Target Telecaller */}
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Select New Telecaller <span className="text-red-500">*</span>
            </label>
            <select
              value={targetTelecallerId}
              onChange={(e) => setTargetTelecallerId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white font-semibold text-[#172B20] focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
            >
              <option value="">-- Choose active Telecaller --</option>
              {activeTelecallers.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name} ({tc.assignedContactsCount} active contacts)
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Reassignment Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Telecaller leave coverage, geographic reallocation, or language preference..."
              className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
            />
          </div>

          {/* Policy Note */}
          <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-[#28663B] space-y-0.5">
            <span className="font-bold">Preservation Policy:</span> Prior calling history, notes, and scheduled follow-up dates are fully preserved for the new telecaller.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#DCE7DF] bg-white text-[#172B20] text-xs font-bold rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleExecute}
            disabled={!targetTelecallerId}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserCheck className="w-4 h-4" />
            <span>Confirm Reassignment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
