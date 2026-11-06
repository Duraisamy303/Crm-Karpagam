import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Users,
  Search,
  PhoneCall,
  Phone,
  MessageCircle,
  Edit,
  Eye,
  Clock,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  UserPlus,
  UploadCloud,
} from 'lucide-react';
import { Student, CallOutcome } from '../../types';
import { StudentDataEntryPanel } from './StudentDataEntryPanel';
import { AddContactModal } from '../common/AddContactModal';
import { ImportContactsModal } from '../common/ImportContactsModal';

interface MyContactsViewProps {
  onNavigate: (tab: string) => void;
}

type TabType = 'All' | 'New' | 'Follow-ups' | 'Retry' | 'Closed';

export const MyContactsView: React.FC<MyContactsViewProps> = ({ onNavigate }) => {
  const {
    filteredStudents,
    currentUser,
    setSelectedStudent,
    setCallModalStudent,
    activeAcademicYear,
    showToast,
  } = useCrm();

  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataEntryStudent, setDataEntryStudent] = useState<Student | null>(null);
  const [whatsAppStudent, setWhatsAppStudent] = useState<Student | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // All contacts assigned to this telecaller
  const myAssignedContacts = useMemo(() => {
    return filteredStudents.filter((s) => s.assignedTelecallerId === currentUser.id);
  }, [filteredStudents, currentUser.id]);

  // Tab categorization logic
  const categorized = useMemo(() => {
    const isNew = (s: Student) =>
      (!s.lastContactedDate && (!s.activityHistory || s.activityHistory.length === 0)) ||
      (s.admissionStage === 'New' && !s.lastCallOutcome);

    const isFollowUp = (s: Student) =>
      s.followUpStatus === 'Scheduled' ||
      s.followUpStatus === 'Overdue' ||
      (Boolean(s.followUpDate) && s.followUpStatus !== 'Completed');

    const isRetry = (s: Student) =>
      (s.lastCallOutcome === 'No Answer' || s.lastCallOutcome === 'Busy') &&
      s.followUpStatus !== 'Completed';

    const isClosed = (s: Student) =>
      s.followUpStatus === 'Completed' ||
      s.admissionStage === 'Not Interested' ||
      s.lastCallOutcome === 'Wrong Number' ||
      s.admissionStage === 'Admitted';

    return {
      All: myAssignedContacts,
      New: myAssignedContacts.filter(isNew),
      'Follow-ups': myAssignedContacts.filter(isFollowUp),
      Retry: myAssignedContacts.filter(isRetry),
      Closed: myAssignedContacts.filter(isClosed),
    };
  }, [myAssignedContacts]);

  // Apply search query to active tab's list
  const displayedStudents = useMemo(() => {
    const baseList = categorized[activeTab];
    if (!searchQuery.trim()) return baseList;

    const q = searchQuery.toLowerCase().trim();
    return baseList.filter((s) => {
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesPhone = s.mobile.includes(q) || s.parentMobile.includes(q);
      const matchesCity = s.city.toLowerCase().includes(q);
      const matchesEnq = s.enquiryNo.toLowerCase().includes(q);
      const matchesCourse = s.preferredCourse.toLowerCase().includes(q);
      return matchesName || matchesPhone || matchesCity || matchesEnq || matchesCourse;
    });
  }, [categorized, activeTab, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Admitted':
        return 'bg-emerald-100 text-emerald-800 font-bold';
      case 'Applied':
        return 'bg-blue-100 text-blue-800 font-bold';
      case 'Counselling':
        return 'bg-purple-100 text-purple-800 font-bold';
      case 'Interested':
        return 'bg-[#39854A]/15 text-[#28663B] font-bold';
      case 'Contacted':
        return 'bg-gray-100 text-gray-800 font-semibold';
      case 'Not Interested':
        return 'bg-red-100 text-red-800 font-semibold';
      default:
        return 'bg-amber-100 text-amber-800 font-semibold';
    }
  };

  const getOutcomeBadge = (outcome?: CallOutcome) => {
    if (!outcome) return <span className="text-[#36473C] italic text-[10px]">No outcome</span>;
    switch (outcome) {
      case 'Interested':
        return <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">Interested</span>;
      case 'Call Later':
      case 'Callback':
        return <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">Call Later</span>;
      case 'Busy':
        return <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">Busy</span>;
      case 'No Answer':
        return <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">No Answer</span>;
      case 'Counselling Needed':
        return <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold text-[10px]">Counselling Needed</span>;
      case 'Not Interested':
      case 'Wrong Number':
        return <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">{outcome}</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-800 text-[10px]">{outcome}</span>;
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'All', label: 'All Contacts', icon: <Users className="w-3.5 h-3.5" />, count: categorized.All.length },
    { id: 'New', label: 'New Leads', icon: <Sparkles className="w-3.5 h-3.5" />, count: categorized.New.length },
    { id: 'Follow-ups', label: 'Follow-ups', icon: <Clock className="w-3.5 h-3.5" />, count: categorized['Follow-ups'].length },
    { id: 'Retry', label: 'Retry Queue', icon: <RotateCcw className="w-3.5 h-3.5" />, count: categorized.Retry.length },
    { id: 'Closed', label: 'Closed / Completed', icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: categorized.Closed.length },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            My Contacts Directory
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Assigned student leads for {currentUser.name} · Academic Year {activeAcademicYear}
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
            onClick={() => onNavigate('tc-dashboard')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#DCE7DF] hover:bg-[#F7FAF8] text-[#172B20] text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-[#39854A]" />
            <span>Back to Today's Calls</span>
          </button>
        </div>
      </div>

      {/* Search and Simple Tabs Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#DCE7DF] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-4">
          {/* Simple Tabs: All, New, Follow-ups, Retry, Closed */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#39854A] text-white shadow-xs'
                      : 'text-[#172B20] bg-[#F7FAF8] hover:bg-gray-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-[#36473C] border border-[#DCE7DF]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search by student name or mobile */}
          <div className="relative w-80 shrink-0">
            <Search className="w-4 h-4 text-[#36473C] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or mobile..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#DCE7DF] bg-[#F7FAF8] focus:bg-white focus:outline-none focus:border-[#39854A] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtered Student Table without duplication */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between text-xs">
          <div className="font-bold text-[#172B20] flex items-center gap-2">
            <span>Showing {displayedStudents.length} contacts</span>
            <span className="text-[11px] font-normal text-[#36473C]">
              (Tab: <strong>{activeTab}</strong>)
            </span>
          </div>
          <span className="text-[11px] text-[#36473C]">
            Click <strong className="text-[#39854A]">Call & Update</strong> to enter details directly
          </span>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/60">
              <th className="py-2.5 px-4">Student Name</th>
              <th className="py-2.5 px-3">Mobile</th>
              <th className="py-2.5 px-3">Course Interest</th>
              <th className="py-2.5 px-3 text-center">Stage</th>
              <th className="py-2.5 px-3">Last Outcome</th>
              <th className="py-2.5 px-3">Next Action</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {displayedStudents.map((student) => {
              const hasSibling = student.linkedSiblingIds && student.linkedSiblingIds.length > 0;
              return (
                <tr key={student.id} className="hover:bg-[#F7FAF8] transition-colors">
                  {/* Student Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#172B20]">{student.name}</span>
                      {hasSibling && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-semibold rounded">
                          Sibling
                        </span>
                      )}
                      {student.age < 17 && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded">
                          &lt;17 yrs
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#36473C] font-mono">
                      {student.enquiryNo} · {student.city}
                    </div>
                  </td>

                  {/* Mobile */}
                  <td className="py-3 px-3 font-mono text-[11px] text-[#172B20]">
                    {student.mobile}
                  </td>

                  {/* Course Interest */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#172B20] truncate max-w-[200px]">
                      {student.preferredCourse}
                    </div>
                    <div className="text-[10px] text-[#36473C] truncate max-w-[200px]">
                      {student.preferredInstitution.split('(')[1]?.replace(')', '') ||
                        student.preferredInstitution}
                    </div>
                  </td>

                  {/* Call Status / Admission Stage */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(
                        student.admissionStage
                      )}`}
                    >
                      {student.admissionStage}
                    </span>
                  </td>

                  {/* Last Outcome */}
                  <td className="py-3 px-3">
                    {getOutcomeBadge(student.lastCallOutcome)}
                  </td>

                  {/* Next Action */}
                  <td className="py-3 px-3">
                    <div className="text-[11px] font-semibold text-[#172B20] truncate max-w-[170px]">
                      {student.nextAction || (student.followUpStatus === 'Scheduled' ? 'Scheduled callback' : 'First contact call')}
                    </div>
                    {student.followUpDate && (
                      <div className="text-[10px] text-[#36473C] font-mono">
                        {student.followUpDate} @ {student.followUpTime || '11:00'}
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Call Icon Button */}
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Calling ${student.name} (${student.mobile})...`);
                          setCallModalStudent(student);
                        }}
                        className="p-1.5 text-[#39854A] hover:bg-[#39854A]/10 rounded-lg transition-colors"
                        title={`Call ${student.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>

                      {/* PRIMARY: Call & Update */}
                      <button
                        type="button"
                        onClick={() => setDataEntryStudent(student)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Call & Update</span>
                      </button>

                      {/* WhatsApp */}
                      <button
                        type="button"
                        onClick={() => setWhatsAppStudent(student)}
                        className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="WhatsApp message"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedStudents.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs text-[#36473C]">
                  No student records found under <strong>{activeTab}</strong> tab
                  {searchQuery ? ` matching "${searchQuery}"` : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DEDICATED STUDENT DATA ENTRY SIDE PANEL */}
      {dataEntryStudent && (
        <StudentDataEntryPanel
          student={dataEntryStudent}
          onClose={() => setDataEntryStudent(null)}
          onSaved={() => setDataEntryStudent(null)}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsAppStudent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-2xl max-w-sm w-full p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-2">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Outreach Preview</span>
              </div>
              <button
                type="button"
                onClick={() => setWhatsAppStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#EFEAE2] p-3 rounded-lg text-xs space-y-2">
              <div className="bg-white p-2.5 rounded shadow-xs text-[#172B20] leading-relaxed">
                Dear <span className="font-bold">{whatsAppStudent.name}</span>, Greetings from
                Karpagam Institutions! Admissions for{' '}
                <span className="font-bold text-[#39854A]">{whatsAppStudent.preferredCourse}</span>{' '}
                are currently open. Contact your telecalling officer at +91 422 261 1146. Reply STOP
                to opt out.
                <div className="text-[9px] text-gray-400 text-right mt-1">11:00 AM</div>
              </div>
            </div>

            <div className="text-[11px] text-[#36473C] italic">
              * Demonstration preview: Template message queued for {whatsAppStudent.mobile}.
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  showToast(`WhatsApp invitation queued for ${whatsAppStudent.name}`);
                  setWhatsAppStudent(null);
                }}
                className="px-4 py-1.5 text-xs font-bold bg-[#39854A] text-white rounded-lg hover:bg-[#28663B]"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
      />

      {/* Reusable Import Contacts Modal */}
      <ImportContactsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
};
