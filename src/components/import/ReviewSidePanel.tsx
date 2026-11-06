import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  X,
  AlertTriangle,
  Users,
  Copy,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Building,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Phone,
  User,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ReviewRequest, ReviewDecision } from '../../types';

interface ReviewSidePanelProps {
  request: ReviewRequest;
  onClose: () => void;
}

export const ReviewSidePanel: React.FC<ReviewSidePanelProps> = ({ request, onClose }) => {
  const { resolveReviewRequest, students, setSelectedStudent } = useCrm();

  const [notes, setNotes] = useState<string>(request.discussionNotes || '');
  const [decisionReason, setDecisionReason] = useState<string>(request.decisionReason || '');
  const [hasEstablishedDifferentIdentity, setHasEstablishedDifferentIdentity] = useState<boolean>(false);

  // Look up matched student if available
  const existingStudent = students.find((s) => s.id === request.existingMatchStudentId);

  const handleDecision = (decision: ReviewDecision) => {
    // Exact duplicate constraint:
    // "For an exact confirmed duplicate, 'Approve as New Student' must remain unavailable unless the reviewer first establishes that the records represent different people."
    if (request.issueType === 'EXACT_DUPLICATE' && decision === 'APPROVE_NEW' && !hasEstablishedDifferentIdentity) {
      alert('You must establish and confirm that these records represent different individuals before approving as a new student.');
      return;
    }

    const defaultReason =
      decision === 'APPROVE_NEW'
        ? 'Identity verified as distinct individual from existing database entry.'
        : decision === 'LINK_SIBLING'
        ? 'Verified family connection; sibling profile linked to existing parent phone.'
        : decision === 'CONFIRM_DUPLICATE'
        ? 'Confirmed exact duplicate student record; skipped to avoid database clutter.'
        : decision === 'REJECT_IMPORT'
        ? 'Record rejected due to conflicting or unverified contact information.'
        : 'Kept pending further document / identity verification.';

    resolveReviewRequest(request.id, decision, decisionReason.trim() || defaultReason, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[640px] max-w-full bg-white shadow-2xl border-l border-[#DCE7DF] z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-250">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-[#36473C] bg-white px-2 py-0.5 rounded border border-[#DCE7DF]">
              {request.id}
            </span>
            {request.issueType === 'EXACT_DUPLICATE' && (
              <span className="text-[10px] font-bold text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Copy className="w-3 h-3 text-red-600" />
                Duplicate Found
              </span>
            )}
            {request.issueType === 'POSSIBLE_SIBLING' && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Users className="w-3 h-3 text-amber-600" />
                Possible Sibling
              </span>
            )}
            {request.issueType === 'PREVIOUS_YEAR_MATCH' && (
              <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                Previous Year Record Found
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-[#172B20] mt-1">
            Review: {request.studentName}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area - Side-by-side comparison & discussion */}
      <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
        {/* Match Reason Banner */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          request.issueType === 'EXACT_DUPLICATE'
            ? 'bg-red-50/70 border-red-200 text-red-900'
            : request.issueType === 'POSSIBLE_SIBLING'
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-blue-50/70 border-blue-200 text-blue-900'
        }`}>
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[11px] uppercase tracking-wide">
              {request.issueType === 'EXACT_DUPLICATE'
                ? 'Exact Student Match Detected'
                : request.issueType === 'POSSIBLE_SIBLING'
                ? 'Similar Parent Details Found'
                : 'Prior Academic Cycle Match'}
            </div>
            <div className="text-xs">{request.matchReason}</div>
          </div>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="space-y-2">
          <div className="font-bold text-[#172B20] text-xs flex items-center justify-between">
            <span>Side-by-Side Comparison</span>
            <span className="text-[11px] font-normal text-[#36473C]">
              Verify identity differences before decision
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Column 1: Imported Candidate */}
            <div className="p-3.5 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-1.5">
                <span className="font-bold text-[#39854A]">Imported Candidate</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                  New Lead
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Student Name</div>
                  <div className="font-bold text-[#172B20] text-sm">{request.studentName}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Student Mobile</div>
                  <div className="font-mono font-semibold text-[#172B20]">{request.mobile}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Parent Name</div>
                  <div className="text-[#172B20] font-semibold">{request.parentName || 'Uncollected'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Parent Mobile</div>
                  <div className="font-mono font-semibold text-[#172B20]">{request.parentMobile || 'Not provided'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">City / Location</div>
                  <div className="text-[#172B20]">{request.city}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Academic Year</div>
                  <div className="font-semibold text-[#39854A]">2026–27 (Current Cycle)</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Course Interest</div>
                  <div className="text-[#172B20] font-semibold">{request.preferredCourse}</div>
                  <div className="text-[10px] text-[#36473C]">{request.preferredInstitution}</div>
                </div>
              </div>
            </div>

            {/* Column 2: Existing CRM Match */}
            <div className="p-3.5 bg-white rounded-xl border border-[#DCE7DF] space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-1.5">
                <span className="font-bold text-[#172B20]">Existing CRM Record</span>
                <span className="text-[10px] font-mono font-bold text-[#36473C] bg-gray-100 px-1.5 py-0.5 rounded">
                  {request.existingMatchEnquiryNo || 'In Database'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Matched Student</div>
                  <div className="font-bold text-[#172B20] text-sm flex items-center justify-between">
                    <span>{request.existingMatchStudentName || existingStudent?.name || 'N/A'}</span>
                    {existingStudent && (
                      <button
                        onClick={() => setSelectedStudent(existingStudent)}
                        className="text-[10px] text-[#39854A] hover:underline font-bold"
                      >
                        Profile →
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Student Mobile</div>
                  <div className="font-mono font-semibold text-[#172B20]">
                    {existingStudent?.mobile || request.mobile}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Parent Name</div>
                  <div className="text-[#172B20] font-semibold">
                    {request.existingMatchParentName || existingStudent?.fatherName || 'Uncollected'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Parent Mobile</div>
                  <div className="font-mono font-semibold text-[#172B20]">
                    {request.existingMatchParentMobile || existingStudent?.parentMobile || 'Not recorded'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">City / Location</div>
                  <div className="text-[#172B20]">{existingStudent?.city || request.city}</div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Academic Year</div>
                  <div className={`font-semibold ${
                    request.existingMatchAcademicYear?.includes('2025')
                      ? 'text-blue-800 font-bold'
                      : 'text-[#172B20]'
                  }`}>
                    {request.existingMatchAcademicYear || existingStudent?.academicYear || '2026–27'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#36473C] uppercase">Course Interest</div>
                  <div className="text-[#172B20] font-semibold">
                    {request.existingMatchCourse || existingStudent?.preferredCourse || 'N/A'}
                  </div>
                  <div className="text-[10px] text-[#36473C]">
                    {existingStudent?.preferredInstitution || request.preferredInstitution}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Verification Checkbox (Mandatory before Exact Duplicate can be approved as new) */}
        {request.issueType === 'EXACT_DUPLICATE' && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasEstablishedDifferentIdentity}
                onChange={(e) => setHasEstablishedDifferentIdentity(e.target.checked)}
                className="mt-0.5 rounded text-[#39854A] focus:ring-[#39854A]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#172B20]">
                  Reviewer Identity Verification:
                </span>{' '}
                <span className="text-[#36473C]">
                  I have investigated this contact and verified with academic records that this imported record represents a distinct person with the same phone/name, NOT a duplicate lead.
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Discussion Notes and Decision Reason */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Internal Discussion Notes & Observations
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record notes from telecaller feedback, family verification, or document check..."
              className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-1">
              Decision Reason (Recorded in audit trail)
            </label>
            <input
              type="text"
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="e.g. Sibling relationship confirmed with father; separate B.Sc Nursing profile approved"
              className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white placeholder-[#36473C]/50 focus:outline-none focus:border-[#39854A] focus:ring-1 focus:ring-[#39854A]"
            />
          </div>
        </div>

        {/* Reviewer / Submitted By Info */}
        <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] flex items-center justify-between text-[11px] text-[#36473C]">
          <div>
            <span className="font-bold text-[#172B20]">Submitted by:</span> {request.submittedBy}
          </div>
          <div>
            <span className="font-bold text-[#172B20]">Submitted on:</span> {request.submittedAt}
          </div>
        </div>

        {request.reviewedBy && (
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-[#28663B] flex items-center justify-between">
            <div>
              <span className="font-bold">Reviewed by:</span> {request.reviewedBy}
            </div>
            <div>
              <span className="font-bold">Decision:</span> {request.decision} ({request.reviewedAt})
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-5 border-t border-[#DCE7DF] bg-[#F7FAF8] flex flex-col gap-2 shrink-0">
        <div className="text-[11px] font-bold text-[#36473C] mb-0.5">
          Select Approval Action:
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Action 1: Approve as New Student */}
          <button
            onClick={() => handleDecision('APPROVE_NEW')}
            disabled={request.issueType === 'EXACT_DUPLICATE' && !hasEstablishedDifferentIdentity}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              request.issueType === 'EXACT_DUPLICATE' && !hasEstablishedDifferentIdentity
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-[#39854A] hover:bg-[#28663B] text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve as New Student</span>
          </button>

          {/* Action 2: Link as Sibling */}
          <button
            onClick={() => handleDecision('LINK_SIBLING')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Link as Sibling</span>
          </button>

          {/* Action 3: Confirm Duplicate */}
          <button
            onClick={() => handleDecision('CONFIRM_DUPLICATE')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
          >
            <Copy className="w-4 h-4" />
            <span>Confirm Duplicate</span>
          </button>

          {/* Action 4: Reject Import */}
          <button
            onClick={() => handleDecision('REJECT_IMPORT')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-700 border border-red-300 rounded-lg text-xs font-bold transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Import</span>
          </button>
        </div>

        {/* Action 5: Keep Pending */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => handleDecision('KEEP_PENDING')}
            className="text-xs text-[#36473C] hover:text-[#172B20] font-semibold underline"
          >
            Keep Pending for Further Verification
          </button>

          <button
            onClick={onClose}
            className="text-xs px-3 py-1.5 bg-white border border-[#DCE7DF] text-[#172B20] font-bold rounded-lg hover:bg-gray-50"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
