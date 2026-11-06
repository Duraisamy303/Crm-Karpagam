import React from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  LayoutDashboard,
  Users,
  UploadCloud,
  UserPlus,
  MessageSquareShare,
  Layers,
  ShieldCheck,
  BarChart3,
  PhoneCall,
  Clock,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { currentRole, filteredStudents, currentUser } = useCrm();

  // Badge calculations
  const unassignedCount = filteredStudents.filter((s) => !s.assignedTelecallerId).length;
  const myPendingFollowUps = filteredStudents.filter(
    (s) =>
      s.assignedTelecallerId === currentUser.id &&
      (s.followUpStatus === 'Scheduled' || s.followUpStatus === 'Overdue')
  ).length;
  const pendingCounsellingCount = filteredStudents.filter(
    (s) => s.counsellingReferral && s.counsellingReferral.status === 'Pending'
  ).length;

  const adminNav = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: <Users className="w-4 h-4" />,
      badge: filteredStudents.length,
    },
    { id: 'import', label: 'Bulk Import', icon: <UploadCloud className="w-4 h-4" /> },
    {
      id: 'assign',
      label: 'Assign Contacts',
      icon: <UserPlus className="w-4 h-4" />,
      badge: unassignedCount > 0 ? `${unassignedCount} new` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-bold',
    },
    { id: 'campaigns', label: 'WhatsApp Campaigns', icon: <MessageSquareShare className="w-4 h-4" /> },
    { id: 'masters', label: 'Masters Management', icon: <Layers className="w-4 h-4" /> },
    { id: 'users', label: 'CRM Users', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const telecallerNav = [
    { id: 'tc-dashboard', label: 'Telecaller Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'tc-contacts',
      label: 'My Contacts',
      icon: <PhoneCall className="w-4 h-4" />,
      badge: filteredStudents.filter((s) => s.assignedTelecallerId === currentUser.id).length,
    },
    {
      id: 'tc-followups',
      label: 'Follow-ups & Calls',
      icon: <Clock className="w-4 h-4" />,
      badge: myPendingFollowUps > 0 ? myPendingFollowUps : undefined,
      badgeColor: 'bg-red-100 text-red-700 font-bold',
    },
  ];

  const counsellorNav = [
    { id: 'cns-dashboard', label: 'Counsellor Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    {
      id: 'cns-queue',
      label: 'Counselling Queue',
      icon: <GraduationCap className="w-4 h-4" />,
      badge: pendingCounsellingCount > 0 ? `${pendingCounsellingCount} pending` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    { id: 'contacts', label: 'All Student Profiles', icon: <Users className="w-4 h-4" /> },
    { id: 'reports', label: 'Admission Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const navItems =
    currentRole === 'ADMIN'
      ? adminNav
      : currentRole === 'TELECALLER'
      ? telecallerNav
      : counsellorNav;

  return (
    <aside className="w-64 bg-white border-r border-[#DCE7DF] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] select-none">
      <div className="p-4 flex flex-col gap-6">
        {/* Role context badge */}
        <div className="px-3 py-2 bg-[#F7FAF8] border border-[#DCE7DF] rounded-lg">
          <div className="text-[10px] uppercase font-bold text-[#36473C]/80 tracking-wider">
            Active Workspace
          </div>
          <div className="text-xs font-bold text-[#172B20] mt-0.5 flex items-center justify-between">
            <span>
              {currentRole === 'ADMIN'
                ? 'Central Admissions'
                : currentRole === 'TELECALLER'
                ? 'Inbound Telecalling'
                : 'Senior Academic Desk'}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#39854A]" />
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-[#39854A] text-white font-bold shadow-xs'
                    : 'text-[#172B20] hover:bg-[#F7FAF8] hover:text-[#39854A]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={isActive ? 'text-white' : 'text-[#36473C]'}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-sm tabular-nums shrink-0 ml-2 ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#F7FAF8] border border-[#DCE7DF] text-[#36473C]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Institutional Footer note */}
      <div className="p-4 border-t border-[#DCE7DF] bg-[#F7FAF8]/60">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#172B20]">
          <Sparkles className="w-3.5 h-3.5 text-[#39854A] shrink-0" />
          <span>Karpagam Campus Portal</span>
        </div>
        <div className="text-[10px] text-[#36473C] mt-1 leading-relaxed">
          Pollachi Main Road, Eachanari, Coimbatore - 641021.
        </div>
      </div>
    </aside>
  );
};
