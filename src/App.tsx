'use client';

import React, { useState, useEffect } from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ContactsView } from './components/contacts/ContactsView';
import { StudentProfileModal } from './components/contacts/StudentProfileModal';
import { BulkImportView } from './components/import/BulkImportView';
import { AssignContactsView } from './components/assignment/AssignContactsView';
import { CampaignsView } from './components/campaigns/CampaignsView';
import { MastersView } from './components/masters/MastersView';
import { UsersView } from './components/users/UsersView';
import { ReportsView } from './components/reports/ReportsView';
import { TelecallerDashboard } from './components/telecaller/TelecallerDashboard';
import { MyContactsView } from './components/telecaller/MyContactsView';
import { FollowUpsView } from './components/telecaller/FollowUpsView';
import { CallUpdateModal } from './components/telecaller/CallUpdateModal';
import { CounsellorDashboard } from './components/counsellor/CounsellorDashboard';
import { CounsellingQueueView } from './components/counsellor/CounsellingQueueView';
import { LoginScreen } from './components/auth/LoginScreen';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { CheckCircle2 } from 'lucide-react';

const CrmApp: React.FC = () => {
  const {
    currentRole,
    selectedStudent,
    setSelectedStudent,
    callModalStudent,
    setCallModalStudent,
    toastMessage,
    activeTab,
    setActiveTab,
  } = useCrm();

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync default tab when role changes
  useEffect(() => {
    if (currentRole === 'ADMIN') {
      setActiveTab('dashboard');
    } else if (currentRole === 'TELECALLER') {
      setActiveTab('tc-dashboard');
    } else if (currentRole === 'COUNSELLOR') {
      setActiveTab('cns-dashboard');
    }
  }, [currentRole, setActiveTab]);

  // Keyboard shortcut for Cmd/Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col text-[#172B20]">
      {/* Top Bar Header adhering to Top Bar Contract */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar currentTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Viewport Content */}
        <main className="flex-1 overflow-y-auto bg-[#F7FAF8]">
          {/* Admin Views */}
          {activeTab === 'dashboard' && <AdminDashboard onNavigate={setActiveTab} />}
          {activeTab === 'contacts' && <ContactsView onNavigate={setActiveTab} />}
          {activeTab === 'import' && <BulkImportView onNavigate={setActiveTab} />}
          {activeTab === 'assign' && <AssignContactsView onNavigate={setActiveTab} />}
          {activeTab === 'campaigns' && <CampaignsView />}
          {activeTab === 'masters' && <MastersView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'reports' && <ReportsView />}

          {/* Telecaller Views */}
          {activeTab === 'tc-dashboard' && <TelecallerDashboard onNavigate={setActiveTab} />}
          {activeTab === 'tc-contacts' && <MyContactsView onNavigate={setActiveTab} />}
          {activeTab === 'tc-followups' && <FollowUpsView />}

          {/* Counsellor Views */}
          {activeTab === 'cns-dashboard' && <CounsellorDashboard onNavigate={setActiveTab} />}
          {activeTab === 'cns-queue' && <CounsellingQueueView />}
        </main>
      </div>

      {/* Global Shared Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Quick Call Log Modal */}
      {callModalStudent && (
        <CallUpdateModal
          student={callModalStudent}
          onClose={() => setCallModalStudent(null)}
        />
      )}

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#172B20] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 border border-[#39854A]/40">
          <CheckCircle2 className="w-4 h-4 text-[#39854A] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <CrmApp />
    </CrmProvider>
  );
}
