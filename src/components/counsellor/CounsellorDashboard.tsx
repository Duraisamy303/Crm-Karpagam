'use client';

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  GraduationCap,
  Users,
  Calendar,
  HeartHandshake,
  Clock,
  ArrowRight,
  Eye,
  FileCheck,
  UserPlus,
  UploadCloud,
} from 'lucide-react';
import { Student } from '../../types';
import { AddContactModal } from '../common/AddContactModal';
import { ImportContactsModal } from '../common/ImportContactsModal';

interface CounsellorDashboardProps {
  onNavigate: (tab: string) => void;
}

export const CounsellorDashboard: React.FC<CounsellorDashboardProps> = ({ onNavigate }) => {
  const { filteredStudents, currentUser, setSelectedStudent, activeAcademicYear } = useCrm();
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Referred enquiries for Senior Counselling
  const referredStudents = filteredStudents.filter((s) => s.counsellingReferral);
  const pendingCounselling = referredStudents.filter(
    (s) => s.counsellingReferral?.status === 'Pending'
  );
  const inProgressCounselling = referredStudents.filter(
    (s) => s.counsellingReferral?.status === 'In Progress'
  );
  const todaysAppointments = referredStudents.filter(
    (s) => s.counsellingReferral?.scheduledVisitDate === '2026-05-09' || s.followUpDate === '2026-05-06'
  );
  const interestedStudents = filteredStudents.filter(
    (s) => s.interestStatus === 'High' || s.admissionStage === 'Interested'
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Academic Counselling Desk: {currentUser.name}
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Senior Academic Consultations, Merit Evaluations & Direct Spot Admissions · AY{' '}
            {activeAcademicYear}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddContactOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Contact</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DCE7DF] hover:bg-[#F7FAF8] text-[#172B20] text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-[#39854A]" />
            <span>Import Contacts</span>
          </button>

          <button
            onClick={() => onNavigate('cns-queue')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Open Full Counselling Queue</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards (Mandatory from prompt) */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Referred Students</span>
            <Users className="w-4 h-4 text-[#39854A]" />
          </div>
          <div className="text-2xl font-bold text-[#172B20] font-mono tabular-nums mt-2">
            {referredStudents.length}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">Total referred by telecallers</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Pending Counselling</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-2">
            {pendingCounselling.length}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">Awaiting preliminary review</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Today's Appointments</span>
            <Calendar className="w-4 h-4 text-[#39854A]" />
          </div>
          <div className="text-2xl font-bold text-[#172B20] font-mono tabular-nums mt-2">
            {todaysAppointments.length}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">Campus visits & calls</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span>Interested Students</span>
            <HeartHandshake className="w-4 h-4 text-[#39854A]" />
          </div>
          <div className="text-2xl font-bold text-[#39854A] font-mono tabular-nums mt-2">
            {interestedStudents.length}
          </div>
          <div className="text-[11px] text-[#36473C] mt-1">Ready for spot provisional admit</div>
        </div>
      </div>

      {/* Two Column Layout: Counselling Priority Queue + Upcoming Follow-ups */}
      <div className="grid grid-cols-12 gap-6">
        {/* Counselling Queue Preview */}
        <div className="col-span-7 bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#39854A]" />
                <h2 className="text-xs font-bold text-[#172B20]">Urgent Counselling Referrals</h2>
              </div>
              <button
                onClick={() => onNavigate('cns-queue')}
                className="text-xs font-bold text-[#39854A] hover:underline"
              >
                View Full Queue ({referredStudents.length}) →
              </button>
            </div>

            <div className="divide-y divide-[#DCE7DF]/60">
              {referredStudents.slice(0, 4).map((student) => {
                const ref = student.counsellingReferral;
                return (
                  <div
                    key={student.id}
                    className="p-3.5 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#172B20]">{student.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            ref?.priority === 'Urgent'
                              ? 'bg-red-100 text-red-800'
                              : ref?.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ref?.priority}
                        </span>
                        <span className="text-[10px] text-[#36473C]">Referred by {ref?.referredBy}</span>
                      </div>
                      <div className="text-[11px] text-[#36473C] mt-1 line-clamp-1">
                        {ref?.reason}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="px-3 py-1 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-md transition-colors"
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                );
              })}

              {referredStudents.length === 0 && (
                <div className="p-8 text-center text-xs text-[#36473C]">
                  No referred students in queue.
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#F7FAF8] border-t border-[#DCE7DF] text-[11px] text-[#36473C] flex items-center justify-between">
            <span>Verify marks cutoff & discuss department scholarships</span>
            <button
              onClick={() => onNavigate('cns-queue')}
              className="text-xs font-bold text-[#39854A] hover:underline"
            >
              Counselling Queue →
            </button>
          </div>
        </div>

        {/* Upcoming Consultations & Visits */}
        <div className="col-span-5 bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#39854A]" />
                <h2 className="text-xs font-bold text-[#172B20]">Scheduled Campus Visits</h2>
              </div>
              <span className="text-[11px] text-[#36473C]">In-person appointments</span>
            </div>

            <div className="p-3 space-y-2.5">
              {referredStudents.map((student) => (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="p-3 rounded-lg border border-[#DCE7DF] hover:bg-[#F7FAF8] transition-colors cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172B20]">{student.name}</span>
                    <span className="text-[10px] font-mono font-bold text-[#39854A] bg-[#39854A]/10 px-2 py-0.5 rounded">
                      {student.counsellingReferral?.scheduledVisitDate || 'May 09, 2026'}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#36473C]">
                    Preferred: {student.preferredCourse} ({student.preferredInstitution.split('(')[1]?.replace(')', '') || 'KAHE'})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#F7FAF8] border-t border-[#DCE7DF] text-[11px] text-[#36473C] flex items-center justify-between">
            <span>Direct campus admissions counter</span>
            <span className="font-semibold text-[#172B20]">Admin Block, Eachanari</span>
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
      />

      {/* Import Contacts Modal */}
      <ImportContactsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
};
