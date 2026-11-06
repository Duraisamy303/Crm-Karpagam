import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Users,
  PhoneCall,
  Clock,
  Calendar,
  AlertCircle,
  MessageCircle,
  Edit,
  Eye,
  CheckCircle2,
  Phone,
  RotateCcw,
  Sparkles,
  ArrowRightLeft,
  Search,
} from 'lucide-react';
import { Student, CallOutcome } from '../../types';
import { StudentDataEntryPanel } from './StudentDataEntryPanel';

interface TelecallerDashboardProps {
  onNavigate: (tab: string) => void;
}

type PriorityCategory = 'OVERDUE' | 'DUE_TODAY' | 'RETRY' | 'NEW_CALL';

interface QueueItem {
  student: Student;
  category: PriorityCategory;
  priorityOrder: number;
  priorityLabel: string;
  badgeClass: string;
  scheduledTimeDisplay: string;
  nextActionText: string;
}

export const TelecallerDashboard: React.FC<TelecallerDashboardProps> = ({ onNavigate }) => {
  const {
    filteredStudents,
    currentUser,
    setSelectedStudent,
    setCallModalStudent,
    activeAcademicYear,
    scheduleFollowUp,
    requestTransfer,
    showToast,
  } = useCrm();

  // Active student for "Call & Update" workflow
  const [dataEntryStudent, setDataEntryStudent] = useState<Student | null>(null);

  // Reschedule modal
  const [rescheduleStudent, setRescheduleStudent] = useState<Student | null>(null);
  const [newDate, setNewDate] = useState('2026-05-08');
  const [newTime, setNewTime] = useState('11:00');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  // Transfer modal
  const [transferPromptStudent, setTransferPromptStudent] = useState<Student | null>(null);
  const [transferReason, setTransferReason] = useState('');

  // WhatsApp modal
  const [whatsAppStudent, setWhatsAppStudent] = useState<Student | null>(null);

  // Filter state for Today's Calls Queue
  const [activeQueueFilter, setActiveQueueFilter] = useState<'ALL' | PriorityCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = '2026-05-05';

  // 1. All contacts assigned to this telecaller
  const myAssignedContacts = useMemo(() => {
    return filteredStudents.filter((s) => s.assignedTelecallerId === currentUser.id);
  }, [filteredStudents, currentUser.id]);

  // 2. Build the Smart Calling Queue in strict priority order:
  // Overdue → Due Today → Retry → New Calls
  const queueItems = useMemo<QueueItem[]>(() => {
    const items: QueueItem[] = [];

    myAssignedContacts.forEach((student) => {
      // Exclude completely closed contacts from active daily calling queue
      if (
        student.admissionStage === 'Not Interested' ||
        student.admissionStage === 'Admitted' ||
        student.lastCallOutcome === 'Wrong Number'
      ) {
        return;
      }

      const isOverdue =
        (student.followUpStatus === 'Overdue' ||
          (student.followUpDate && student.followUpDate < todayStr)) &&
        student.followUpStatus !== 'Completed';

      const isDueToday =
        student.followUpDate === todayStr && student.followUpStatus !== 'Completed';

      const isRetry =
        (student.lastCallOutcome === 'No Answer' || student.lastCallOutcome === 'Busy') &&
        student.followUpStatus !== 'Completed' &&
        !isOverdue &&
        !isDueToday;

      const isNewCall =
        (!student.lastContactedDate &&
          (!student.activityHistory || student.activityHistory.length === 0)) ||
        (student.admissionStage === 'New' && !student.lastCallOutcome);

      if (isOverdue) {
        items.push({
          student,
          category: 'OVERDUE',
          priorityOrder: 1,
          priorityLabel: 'Overdue Call',
          badgeClass: 'bg-red-100 text-red-800 border-red-200 font-bold',
          scheduledTimeDisplay: `${student.followUpDate} @ ${student.followUpTime || '10:00'} hrs`,
          nextActionText: student.nextAction || 'Immediate callback required (past deadline)',
        });
      } else if (isDueToday) {
        items.push({
          student,
          category: 'DUE_TODAY',
          priorityOrder: 2,
          priorityLabel: 'Due Today',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-200 font-bold',
          scheduledTimeDisplay: `Today @ ${student.followUpTime || '11:00'} hrs`,
          nextActionText: student.nextAction || 'Scheduled callback commitment',
        });
      } else if (isRetry) {
        const outcome = student.lastCallOutcome;
        items.push({
          student,
          category: 'RETRY',
          priorityOrder: 3,
          priorityLabel: outcome === 'Busy' ? 'Retry (Busy)' : 'Retry (No Answer)',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-200 font-semibold',
          scheduledTimeDisplay: student.followUpTime ? `Today @ ${student.followUpTime} hrs` : 'Afternoon Retry',
          nextActionText: student.nextAction || (outcome === 'Busy' ? 'Second call attempt (1 hr later)' : 'Afternoon call attempt 2'),
        });
      } else if (isNewCall) {
        items.push({
          student,
          category: 'NEW_CALL',
          priorityOrder: 4,
          priorityLabel: 'New Call',
          badgeClass: 'bg-[#39854A]/15 text-[#28663B] border-[#39854A]/30 font-bold',
          scheduledTimeDisplay: 'Ready to Call',
          nextActionText: student.nextAction || 'First introductory outreach & profile collection',
        });
      }
    });

    // Sort strictly: Overdue (1) → Due Today (2) → Retry (3) → New Calls (4)
    return items.sort((a, b) => {
      if (a.priorityOrder !== b.priorityOrder) {
        return a.priorityOrder - b.priorityOrder;
      }
      return (a.student.name || '').localeCompare(b.student.name || '');
    });
  }, [myAssignedContacts, todayStr]);

  // 3. Mandatory 3 Summary Counts: Due Today, Overdue, New Calls
  const countDueToday = useMemo(() => {
    return queueItems.filter((item) => item.category === 'DUE_TODAY').length;
  }, [queueItems]);

  const countOverdue = useMemo(() => {
    return queueItems.filter((item) => item.category === 'OVERDUE').length;
  }, [queueItems]);

  const countNewCalls = useMemo(() => {
    return queueItems.filter((item) => item.category === 'NEW_CALL').length;
  }, [queueItems]);

  const countRetry = useMemo(() => {
    return queueItems.filter((item) => item.category === 'RETRY').length;
  }, [queueItems]);

  // Filtered list based on pill filter & search
  const displayedQueue = useMemo(() => {
    return queueItems.filter((item) => {
      if (activeQueueFilter !== 'ALL' && item.category !== activeQueueFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const s = item.student;
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesPhone = s.mobile.includes(q) || s.parentMobile.includes(q);
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesCourse = s.preferredCourse.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesCity || matchesCourse;
      }
      return true;
    });
  }, [queueItems, activeQueueFilter, searchQuery]);

  const handleRescheduleSubmit = () => {
    if (!rescheduleStudent) return;
    scheduleFollowUp(
      rescheduleStudent.id,
      newDate,
      newTime,
      rescheduleNotes || 'Rescheduled callback'
    );
    setRescheduleStudent(null);
  };

  const handleTransferSubmit = () => {
    if (!transferPromptStudent || !transferReason.trim()) {
      alert('Please state a reason for callback transfer');
      return;
    }
    requestTransfer(transferPromptStudent.id, transferReason);
    setTransferPromptStudent(null);
    setTransferReason('');
  };

  const getOutcomeBadge = (outcome?: CallOutcome) => {
    if (!outcome) {
      return (
        <span className="text-[10px] text-[#36473C] italic bg-[#F7FAF8] px-2 py-0.5 rounded border border-[#DCE7DF]">
          No prior call
        </span>
      );
    }
    switch (outcome) {
      case 'Interested':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Interested
          </span>
        );
      case 'Call Later':
      case 'Callback':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            Call Later
          </span>
        );
      case 'Busy':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            Busy
          </span>
        );
      case 'No Answer':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
            No Answer
          </span>
        );
      case 'Counselling Needed':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
            Counselling
          </span>
        );
      case 'Not Interested':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
            Not Interested
          </span>
        );
      case 'Wrong Number':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
            Wrong Number
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-800">
            {outcome}
          </span>
        );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header with Title and Telecaller Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Telecaller Dashboard
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Logged in as {currentUser.name} · Academic Year {activeAcademicYear} · Karpagam Admissions CRM
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('tc-contacts')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#DCE7DF] hover:bg-[#F7FAF8] text-[#172B20] text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Users className="w-4 h-4 text-[#39854A]" />
            <span>My Contacts ({myAssignedContacts.length})</span>
          </button>
          <button
            onClick={() => onNavigate('tc-followups')}
            className="flex items-center gap-2 px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Clock className="w-4 h-4" />
            <span>Scheduled Follow-ups</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY COUNTS: Due Today, Overdue, Retry Queue, New Calls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Due Today */}
        <div
          onClick={() => setActiveQueueFilter(activeQueueFilter === 'DUE_TODAY' ? 'ALL' : 'DUE_TODAY')}
          className={`bg-white p-5 rounded-xl border transition-all cursor-pointer shadow-xs ${
            activeQueueFilter === 'DUE_TODAY'
              ? 'border-[#39854A] ring-2 ring-[#39854A]/20 bg-emerald-50/20'
              : 'border-[#DCE7DF] hover:border-[#39854A]/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#39854A]" />
              <span>Due Today</span>
            </span>
            <span className="text-[10px] font-semibold text-[#39854A] uppercase tracking-wider">
              {todayStr}
            </span>
          </div>
          <div className="text-3xl font-bold text-[#172B20] font-mono tabular-nums mt-2">
            {countDueToday}
          </div>
          <div className="text-xs text-[#36473C] mt-1">
            Callback commitments scheduled for today
          </div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setActiveQueueFilter(activeQueueFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`bg-white p-5 rounded-xl border transition-all cursor-pointer shadow-xs ${
            activeQueueFilter === 'OVERDUE'
              ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
              : 'border-[#DCE7DF] hover:border-red-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Overdue</span>
            </span>
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
              High Priority
            </span>
          </div>
          <div className="text-3xl font-bold text-red-700 font-mono tabular-nums mt-2">
            {countOverdue}
          </div>
          <div className="text-xs text-[#36473C] mt-1">
            Calls delayed past designated callback slot
          </div>
        </div>

        {/* Retry Queue */}
        <div
          onClick={() => setActiveQueueFilter(activeQueueFilter === 'RETRY' ? 'ALL' : 'RETRY')}
          className={`bg-white p-5 rounded-xl border transition-all cursor-pointer shadow-xs ${
            activeQueueFilter === 'RETRY'
              ? 'border-purple-600 ring-2 ring-purple-600/20 bg-purple-50/20'
              : 'border-[#DCE7DF] hover:border-purple-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-purple-700" />
              <span>Retry Queue</span>
            </span>
            <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
              Busy / No Answer
            </span>
          </div>
          <div className="text-3xl font-bold text-purple-800 font-mono tabular-nums mt-2">
            {countRetry}
          </div>
          <div className="text-xs text-[#36473C] mt-1">
            Prior attempts requiring second touchpoint
          </div>
        </div>

        {/* New Calls */}
        <div
          onClick={() => setActiveQueueFilter(activeQueueFilter === 'NEW_CALL' ? 'ALL' : 'NEW_CALL')}
          className={`bg-white p-5 rounded-xl border transition-all cursor-pointer shadow-xs ${
            activeQueueFilter === 'NEW_CALL'
              ? 'border-[#39854A] ring-2 ring-[#39854A]/20 bg-emerald-50/20'
              : 'border-[#DCE7DF] hover:border-[#39854A]/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-[#36473C]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#39854A]" />
              <span>New Calls</span>
            </span>
            <span className="text-[10px] font-bold text-[#28663B] bg-emerald-100 px-2 py-0.5 rounded">
              Uncontacted
            </span>
          </div>
          <div className="text-3xl font-bold text-[#39854A] font-mono tabular-nums mt-2">
            {countNewCalls}
          </div>
          <div className="text-xs text-[#36473C] mt-1">
            Fresh assigned contacts awaiting initial reachout
          </div>
        </div>
      </div>

      {/* 3. TODAY'S CALLS WORK QUEUE (PRIORITY LIST) */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden space-y-0">
        {/* Work Queue Header & Filter Strip */}
        <div className="px-6 py-4 border-b border-[#DCE7DF] bg-[#F7FAF8] flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#39854A]" />
              <h2 className="text-sm font-bold text-[#172B20]">Today's Calls Work Queue</h2>
              <span className="text-xs font-bold text-[#39854A] bg-[#39854A]/10 px-2 py-0.5 rounded-full">
                {displayedQueue.length} Pending
              </span>
            </div>
            <p className="text-[11px] text-[#36473C] mt-0.5">
              Priority order: <strong className="text-red-700">Overdue</strong> → <strong className="text-amber-800">Due Today</strong> → <strong className="text-purple-800">Retry</strong> → <strong className="text-[#28663B]">New Calls</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#DCE7DF] text-xs">
              <button
                onClick={() => setActiveQueueFilter('ALL')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeQueueFilter === 'ALL'
                    ? 'bg-[#39854A] text-white font-bold shadow-xs'
                    : 'text-[#36473C] hover:bg-[#F7FAF8]'
                }`}
              >
                All ({queueItems.length})
              </button>
              <button
                onClick={() => setActiveQueueFilter('OVERDUE')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeQueueFilter === 'OVERDUE'
                    ? 'bg-red-700 text-white font-bold shadow-xs'
                    : 'text-red-700 hover:bg-red-50'
                }`}
              >
                Overdue ({countOverdue})
              </button>
              <button
                onClick={() => setActiveQueueFilter('DUE_TODAY')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeQueueFilter === 'DUE_TODAY'
                    ? 'bg-amber-600 text-white font-bold shadow-xs'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                Today ({countDueToday})
              </button>
              <button
                onClick={() => setActiveQueueFilter('RETRY')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeQueueFilter === 'RETRY'
                    ? 'bg-purple-700 text-white font-bold shadow-xs'
                    : 'text-purple-800 hover:bg-purple-50'
                }`}
              >
                Retry ({countRetry})
              </button>
              <button
                onClick={() => setActiveQueueFilter('NEW_CALL')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                  activeQueueFilter === 'NEW_CALL'
                    ? 'bg-[#39854A] text-white font-bold shadow-xs'
                    : 'text-[#28663B] hover:bg-emerald-50'
                }`}
              >
                New ({countNewCalls})
              </button>
            </div>

            {/* Quick search */}
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-[#36473C] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queue..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
              />
            </div>
          </div>
        </div>

        {/* Priority Table */}
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/60">
              <th className="py-2.5 px-4">Priority / Student Name</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Last Outcome</th>
              <th className="py-2.5 px-3">Next Action</th>
              <th className="py-2.5 px-3">Scheduled Time</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {displayedQueue.map((item) => {
              const student = item.student;
              const hasSibling = student.linkedSiblingIds && student.linkedSiblingIds.length > 0;

              return (
                <tr key={student.id} className="hover:bg-[#F7FAF8] transition-colors">
                  {/* Student Name & Priority Tag */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded border uppercase tracking-wider ${item.badgeClass}`}
                      >
                        {item.priorityLabel}
                      </span>
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
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(student)}
                      className="font-bold text-[#172B20] text-sm hover:text-[#39854A] transition-colors text-left flex items-center gap-1.5 group cursor-pointer"
                      title="Click to view complete student admission profile"
                    >
                      <span className="group-hover:underline">{student.name}</span>
                      <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#39854A] opacity-60 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <div className="text-[11px] text-[#36473C] font-mono mt-0.5">
                      {student.enquiryNo} · {student.city} · {student.preferredCourse}
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-3 px-3">
                    <div className="font-mono text-xs font-semibold text-[#172B20]">
                      {student.mobile}
                    </div>
                    {student.parentMobile && (
                      <div className="text-[10px] text-[#36473C] font-mono">
                        P: {student.parentMobile}
                      </div>
                    )}
                  </td>

                  {/* Last Outcome */}
                  <td className="py-3 px-3">
                    {getOutcomeBadge(student.lastCallOutcome)}
                    {student.lastContactedDate && (
                      <div className="text-[10px] text-[#36473C] font-mono mt-0.5">
                        {student.lastContactedDate}
                      </div>
                    )}
                  </td>

                  {/* Next Action */}
                  <td className="py-3 px-3">
                    <div className="text-xs font-bold text-[#172B20] leading-snug max-w-[240px]">
                      {item.nextActionText}
                    </div>
                    {student.followUpNotes && (
                      <div className="text-[10px] text-[#36473C] italic mt-0.5 truncate max-w-[240px]">
                        "{student.followUpNotes}"
                      </div>
                    )}
                  </td>

                  {/* Scheduled Time */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-bold text-[#172B20]">
                      <Clock className="w-3.5 h-3.5 text-[#39854A]" />
                      <span>{item.scheduledTimeDisplay}</span>
                    </div>
                    {student.followUpDate && student.followUpDate > todayStr && (
                      <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">
                        Future commitment
                      </span>
                    )}
                  </td>

                  {/* Actions: Call & Update (Primary), Quick Call, WhatsApp */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Quick Call */}
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
                        title="Send WhatsApp invitation"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>

                      {/* Reschedule (for follow-ups/overdue) */}
                      {(item.category === 'OVERDUE' || item.category === 'DUE_TODAY') && (
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleStudent(student);
                            setNewDate(student.followUpDate || '2026-05-08');
                            setNewTime(student.followUpTime || '11:00');
                            setRescheduleNotes(student.followUpNotes || '');
                          }}
                          className="px-2 py-1 text-xs font-semibold text-[#172B20] bg-white border border-[#DCE7DF] hover:bg-[#F7FAF8] rounded-lg transition-colors"
                          title="Reschedule callback"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedQueue.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-[#36473C]">
                  No calls currently pending in queue for selected filter. Excellent job!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DEDICATED STUDENT DATA ENTRY PANEL */}
      {dataEntryStudent && (
        <StudentDataEntryPanel
          student={dataEntryStudent}
          onClose={() => setDataEntryStudent(null)}
          onSaved={() => setDataEntryStudent(null)}
        />
      )}

      {/* Reschedule Callback Modal */}
      {rescheduleStudent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#172B20]">
              Reschedule Callback: {rescheduleStudent.name}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Reason / Note</label>
              <textarea
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Student requested callback after school exam at 4 PM"
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                type="button"
                onClick={() => setRescheduleStudent(null)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRescheduleSubmit}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Callback Modal */}
      {transferPromptStudent && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-800">
              <ArrowRightLeft className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-[#172B20]">Request Callback Transfer</h3>
            </div>
            <p className="text-xs text-[#36473C]">
              Candidate: <span className="font-bold text-[#172B20]">{transferPromptStudent.name}</span>.
              This submits a request to Central Admissions to reallocate this callback.
            </p>
            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">
                Reason for Transfer
              </label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
                placeholder="e.g. On leave / Medical appointment / Language barrier"
                className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                type="button"
                onClick={() => setTransferPromptStudent(null)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTransferSubmit}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Submit Transfer Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick WhatsApp Preview Modal */}
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
    </div>
  );
};
