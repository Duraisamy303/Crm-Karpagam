import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Bell,
  Search,
  Calendar,
  UserCheck,
  Headphones,
  GraduationCap,
  ChevronDown,
  X,
  PhoneCall,
  ArrowRightLeft,
  User as UserIcon,
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onLogout }) => {
  const {
    currentRole,
    setCurrentRole,
    currentUser,
    academicYears,
    activeAcademicYear,
    setActiveAcademicYear,
    filteredStudents,
    setSelectedStudent,
  } = useCrm();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Compute pending notifications
  const transferRequests = filteredStudents.filter(
    (s) => s.transferRequest && s.transferRequest.status === 'Pending'
  );
  const overdueFollowUps = filteredStudents.filter(
    (s) => s.followUpStatus === 'Overdue' || s.followUpStatus === 'Transfer Requested'
  );
  const urgentCounselling = filteredStudents.filter(
    (s) => s.counsellingReferral && s.counsellingReferral.status === 'Pending' && s.counsellingReferral.priority === 'Urgent'
  );

  const totalNotifications =
    (currentRole === 'ADMIN' ? transferRequests.length : 0) +
    overdueFollowUps.length +
    (currentRole === 'COUNSELLOR' ? urgentCounselling.length : 0);

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'ADMIN', label: 'Admin', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { role: 'TELECALLER', label: 'Telecaller', icon: <Headphones className="w-3.5 h-3.5" /> },
    { role: 'COUNSELLOR', label: 'Sr. Counsellor', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="h-16 bg-white border-b border-[#DCE7DF] px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Zone 1: Official KAHE Logo & Title */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/image_7878f0c8.png"
            alt="Karpagam Academy of Higher Education"
            className="h-11 w-auto object-contain shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#172B20] leading-tight">
              KARPAGAM INSTITUTIONS
            </span>
            <span className="text-xs font-semibold text-[#36473C]/80 tracking-wide">
              ADMISSION MANAGEMENT CRM
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Academic Year Selector, Search & Alerts */}
      <div className="flex items-center gap-3">
        {/* Academic Year Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#DCE7DF] bg-[#F7FAF8] hover:bg-white text-xs font-semibold text-[#172B20] transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#39854A]" />
            <span>AY {activeAcademicYear}</span>
            <span className="text-[10px] text-[#39854A] font-bold px-1.5 py-0.2 bg-[#39854A]/10 rounded">
              Active
            </span>
            <ChevronDown className="w-3 h-3 text-[#36473C]" />
          </button>

          {showYearDropdown && (
            <div className="absolute left-0 mt-2 w-48 bg-white border border-[#DCE7DF] rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#36473C] border-b border-[#DCE7DF]/60">
                Admission Cycle
              </div>
              {academicYears.map((year) => (
                <button
                  key={year.id}
                  onClick={() => {
                    setActiveAcademicYear(year.name);
                    setShowYearDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#F7FAF8] transition-colors ${
                    activeAcademicYear === year.name
                      ? 'font-bold text-[#39854A] bg-[#39854A]/5'
                      : 'text-[#172B20]'
                  }`}
                >
                  <span>AY {year.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      year.status === 'ACTIVE'
                        ? 'bg-[#39854A]/10 text-[#39854A] font-semibold'
                        : year.status === 'UPCOMING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {year.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#DCE7DF] bg-white hover:bg-[#F7FAF8] text-xs text-[#36473C] transition-colors w-64 shadow-xs"
        >
          <Search className="w-3.5 h-3.5 text-[#36473C]/70" />
          <span className="truncate">Search by student, mobile, city...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-[#F7FAF8] border border-[#DCE7DF] px-1.5 py-0.5 rounded text-[#36473C]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg border border-[#DCE7DF] bg-white hover:bg-[#F7FAF8] text-[#172B20] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#172B20]" />
            {totalNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#DCE7DF] rounded-xl shadow-xl py-2 z-50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#DCE7DF]">
                <span className="text-xs font-bold text-[#172B20]">Action Notifications</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#DCE7DF]/60">
                {transferRequests.length > 0 && currentRole === 'ADMIN' && (
                  <div className="p-3 hover:bg-[#F7FAF8] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <ArrowRightLeft className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#172B20]">
                          {transferRequests.length} Telecaller Transfer Request Pending
                        </div>
                        <div className="text-[11px] text-[#36473C] mt-0.5">
                          {transferRequests[0].transferRequest?.requestedBy} requested callback re-assignment.
                        </div>
                        <button
                          onClick={() => {
                            setSelectedStudent(transferRequests[0]);
                            setShowNotifications(false);
                          }}
                          className="mt-1.5 text-xs text-[#39854A] font-bold hover:underline"
                        >
                          Review & Reassign →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {overdueFollowUps.length > 0 && (
                  <div className="p-3 hover:bg-[#F7FAF8] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <PhoneCall className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-[#172B20]">
                          {overdueFollowUps.length} Follow-up Overdue Calls
                        </div>
                        <div className="text-[11px] text-[#36473C] mt-0.5">
                          {overdueFollowUps[0].name} ({overdueFollowUps[0].city}) awaiting call response.
                        </div>
                        <button
                          onClick={() => {
                            setSelectedStudent(overdueFollowUps[0]);
                            setShowNotifications(false);
                          }}
                          className="mt-1.5 text-xs text-[#39854A] font-bold hover:underline"
                        >
                          View Student Profile →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {totalNotifications === 0 && (
                  <div className="p-4 text-center text-xs text-[#36473C]">
                    All follow-ups and approvals are up to date.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Demo Role Switcher & User Profile */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Role Switcher */}
        <div className="flex items-center bg-[#F7FAF8] p-1 rounded-lg border border-[#DCE7DF]">
          <span className="text-[10px] font-bold text-[#36473C]/80 uppercase tracking-wider px-2 shrink-0">
            Role:
          </span>
          <div className="flex items-center gap-1">
            {roles.map((r) => {
              const isActive = currentRole === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => setCurrentRole(r.role)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#39854A] text-white shadow-xs font-bold'
                      : 'text-[#172B20] hover:text-[#39854A] hover:bg-white/70'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current User Card */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#DCE7DF]">
          <div className="w-8 h-8 rounded-full bg-[#39854A]/15 text-[#28663B] font-bold text-xs flex items-center justify-center border border-[#39854A]/30">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-[#172B20] leading-tight max-w-[130px] truncate">
              {currentUser.name}
            </span>
            <span className="text-[10px] font-semibold text-[#36473C]/80">
              {currentRole === 'ADMIN'
                ? 'Central Admissions'
                : currentRole === 'TELECALLER'
                ? 'Inbound Telecaller'
                : 'Senior Academic Counsellor'}
            </span>
          </div>

          <button
            onClick={onLogout}
            title="Log Out / Switch Account"
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50"
          >
            <UserIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
