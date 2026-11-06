'use client';

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Users,
  Calendar,
  AlertTriangle,
  Eye,
  Filter,
  Check,
} from 'lucide-react';
import { ReviewRequest, ReviewStatus } from '../../types';
import { ReviewSidePanel } from './ReviewSidePanel';

export const ReviewRequestsTab: React.FC = () => {
  const { reviewRequests } = useCrm();

  const [activeStatusTab, setActiveStatusTab] = useState<ReviewStatus>('PENDING');
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);

  const pendingList = reviewRequests.filter((r) => r.status === 'PENDING');
  const approvedList = reviewRequests.filter((r) => r.status === 'APPROVED');
  const rejectedList = reviewRequests.filter((r) => r.status === 'REJECTED');

  const displayedList =
    activeStatusTab === 'PENDING'
      ? pendingList
      : activeStatusTab === 'APPROVED'
      ? approvedList
      : rejectedList;

  return (
    <div className="space-y-4">
      {/* 3 Status Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStatusTab('PENDING')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeStatusTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-[#DCE7DF] text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusTab === 'PENDING' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-900'
              }`}
            >
              {pendingList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusTab('APPROVED')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeStatusTab === 'APPROVED'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'bg-white border border-[#DCE7DF] text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved Records</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusTab === 'APPROVED' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-900'
              }`}
            >
              {approvedList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveStatusTab('REJECTED')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeStatusTab === 'REJECTED'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white border border-[#DCE7DF] text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected / Skipped</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeStatusTab === 'REJECTED' ? 'bg-white/25 text-white' : 'bg-red-100 text-red-900'
              }`}
            >
              {rejectedList.length}
            </span>
          </button>
        </div>

        <div className="text-[11px] text-[#36473C]">
          Showing <span className="font-bold text-[#172B20]">{displayedList.length}</span> request(s)
        </div>
      </div>

      {/* Review Requests Table */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/60">
              <th className="py-2.5 px-4">Student Name</th>
              <th className="py-2.5 px-3">Issue Type</th>
              <th className="py-2.5 px-3">Existing Match</th>
              <th className="py-2.5 px-3">Submitted By</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {displayedList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">
                  No review requests in {activeStatusTab.toLowerCase()} status.
                </td>
              </tr>
            ) : (
              displayedList.map((req) => (
                <tr key={req.id} className="hover:bg-[#F7FAF8] transition-colors">
                  {/* Student Name */}
                  <td className="py-3 px-4 font-bold text-[#172B20]">
                    <div>{req.studentName}</div>
                    <div className="text-[10px] text-[#36473C] font-mono font-normal">
                      {req.mobile} · {req.city}
                    </div>
                  </td>

                  {/* Issue Type */}
                  <td className="py-3 px-3">
                    {req.issueType === 'EXACT_DUPLICATE' && (
                      <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1">
                        <Copy className="w-3 h-3 text-red-600" />
                        Exact Duplicate
                      </span>
                    )}
                    {req.issueType === 'POSSIBLE_SIBLING' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                        <Users className="w-3 h-3 text-amber-600" />
                        Possible Sibling
                      </span>
                    )}
                    {req.issueType === 'PREVIOUS_YEAR_MATCH' && (
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        Previous Year Match
                      </span>
                    )}
                  </td>

                  {/* Existing Match */}
                  <td className="py-3 px-3 text-[#172B20]">
                    <div className="font-semibold text-xs">
                      {req.existingMatchStudentName || 'Matched by phone'}
                    </div>
                    <div className="text-[10px] text-[#36473C] flex items-center gap-1.5">
                      <span className="font-mono">{req.existingMatchEnquiryNo}</span>
                      <span>·</span>
                      <span className="font-semibold">{req.existingMatchAcademicYear || '2026–27'}</span>
                    </div>
                  </td>

                  {/* Submitted By */}
                  <td className="py-3 px-3 text-[11px] text-[#36473C]">
                    <div className="font-semibold text-[#172B20]">{req.submittedBy}</div>
                    <div className="text-[10px] text-gray-400">{req.submittedAt}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    {req.status === 'PENDING' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pending Decision
                      </span>
                    )}
                    {req.status === 'APPROVED' && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Approved ({req.decision === 'LINK_SIBLING' ? 'Sibling Linked' : 'New Profile'})
                      </span>
                    )}
                    {req.status === 'REJECTED' && (
                      <span className="text-[10px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        ✕ {req.decision === 'CONFIRM_DUPLICATE' ? 'Duplicate Skipped' : 'Rejected'}
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="px-3 py-1.5 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{req.status === 'PENDING' ? 'Review' : 'View Decision'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Side Panel */}
      {selectedRequest && (
        <ReviewSidePanel
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
