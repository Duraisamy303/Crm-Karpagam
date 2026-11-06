'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  UserPlus,
  Users,
  CheckSquare,
  Square,
  ArrowRight,
  Split,
  Sliders,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  PhoneCall,
  RotateCcw,
  History,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Student } from '../../types';
import { ReassignModal } from './ReassignModal';
import { AssignmentHistorySection } from './AssignmentHistorySection';
import { TeamWorkloadSection } from './TeamWorkloadSection';

interface AssignContactsViewProps {
  onNavigate: (tab: string) => void;
}

export const AssignContactsView: React.FC<AssignContactsViewProps> = ({ onNavigate }) => {
  const {
    filteredStudents,
    users,
    activeAcademicYear,
    batchAssignEqualSplit,
    assignContacts,
    reviewRequests,
  } = useCrm();

  // Active top-level subview: Contacts Assignment vs Team Workload vs Assignment History
  const [activeSubView, setActiveSubView] = useState<'assignment' | 'workload' | 'history'>('assignment');

  // Contact list filter tab: New Imports vs Unassigned (default) vs All Contacts
  const [contactsCategoryTab, setContactsCategoryTab] = useState<'unassigned' | 'new_imports' | 'all'>('unassigned');

  // Selection & Allocation state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignmentMode, setAssignmentMode] = useState<'equal_split' | 'manual_split'>('equal_split');
  const [selectedTelecallerIds, setSelectedTelecallerIds] = useState<string[]>([]);
  const [manualSplitAllocation, setManualSplitAllocation] = useState<{ [tcId: string]: number }>({});
  const [singleTargetTelecallerId, setSingleTargetTelecallerId] = useState<string>('');

  // Reassignment Modal state
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignTargetStudents, setReassignTargetStudents] = useState<Student[]>([]);

  // Active Telecallers
  const telecallers = useMemo(() => {
    return users.filter((u) => u.role === 'TELECALLER' && u.status === 'Active');
  }, [users]);

  // Overall metric cards strictly aligned with active academic year
  const totalTelecallers = telecallers.length;
  const totalContacts = filteredStudents.length;
  const assignedContactsCount = filteredStudents.filter((s) => !!s.assignedTelecallerId).length;
  const unassignedContactsCount = filteredStudents.filter((s) => !s.assignedTelecallerId).length;
  const newImportsCount = filteredStudents.filter((s) => s.isNewImport || s.importDate === '2026-05-05').length;

  // Filter candidates based on category tab
  // Do not allow invalid, confirmed duplicate or review-pending contacts to enter the assignment selection
  const candidateStudents = useMemo(() => {
    // Collect pending review student phones or IDs to exclude
    const pendingStudentIds = reviewRequests
      .filter((r) => r.status === 'PENDING')
      .map((r) => r.existingMatchStudentId)
      .filter(Boolean) as string[];

    let list = filteredStudents.filter((s) => !pendingStudentIds.includes(s.id));

    if (contactsCategoryTab === 'unassigned') {
      return list.filter((s) => !s.assignedTelecallerId);
    }
    if (contactsCategoryTab === 'new_imports') {
      return list.filter((s) => s.isNewImport || s.importDate === '2026-05-05');
    }
    return list; // All Contacts in current AY
  }, [filteredStudents, contactsCategoryTab, reviewRequests]);

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === candidateStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(candidateStudents.map((s) => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const toggleSelectTelecaller = (id: string) => {
    if (selectedTelecallerIds.includes(id)) {
      setSelectedTelecallerIds(selectedTelecallerIds.filter((item) => item !== id));
    } else {
      setSelectedTelecallerIds([...selectedTelecallerIds, id]);
    }
  };

  const handleManualCountChange = (tcId: string, count: number) => {
    setManualSplitAllocation((prev) => ({
      ...prev,
      [tcId]: Math.max(0, count),
    }));
  };

  const handleConfirmAssignment = () => {
    if (selectedStudentIds.length === 0) {
      alert('Please select at least one contact to assign.');
      return;
    }

    if (assignmentMode === 'equal_split') {
      if (selectedTelecallerIds.length === 0) {
        alert('Please select at least one active telecaller for equal split distribution.');
        return;
      }
      batchAssignEqualSplit(selectedStudentIds, selectedTelecallerIds);
      setSelectedStudentIds([]);
      setSelectedTelecallerIds([]);
    } else {
      // Manual Split / Direct Assignment
      if (singleTargetTelecallerId) {
        assignContacts(selectedStudentIds, singleTargetTelecallerId, 'direct');
        setSelectedStudentIds([]);
        setSingleTargetTelecallerId('');
      } else {
        // Multi manual split
        const activeAllocations = Object.entries(manualSplitAllocation).filter(([_, count]) => count > 0);
        if (activeAllocations.length === 0) {
          alert('Please enter allocation counts or select a target telecaller.');
          return;
        }

        let assignedIndex = 0;
        activeAllocations.forEach(([tcId, count]) => {
          const chunk = selectedStudentIds.slice(assignedIndex, assignedIndex + count);
          if (chunk.length > 0) {
            assignContacts(chunk, tcId, 'direct');
            assignedIndex += chunk.length;
          }
        });
        setSelectedStudentIds([]);
        setManualSplitAllocation({});
      }
    }
  };

  const handleOpenReassignModal = (students: Student[]) => {
    setReassignTargetStudents(students);
    setIsReassignModalOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Section View Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Contact Assignment Management
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Allocate imported student contacts to telecallers, monitor team workload, and track distribution audit history.
          </p>
        </div>

        {/* 3 Main View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#DCE7DF] rounded-xl shadow-xs">
          <button
            onClick={() => setActiveSubView('assignment')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubView === 'assignment'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Contact Assignment</span>
          </button>

          <button
            onClick={() => setActiveSubView('workload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubView === 'workload'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Workload</span>
          </button>

          <button
            onClick={() => setActiveSubView('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSubView === 'history'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Assignment History</span>
          </button>
        </div>
      </div>

      {/* 2. Four Compact Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1: Total Telecallers */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="text-xs font-bold text-[#36473C]">Total Telecallers</div>
          <div className="text-2xl font-bold font-mono text-[#172B20] mt-1">
            {totalTelecallers}
          </div>
          <div className="text-[11px] text-[#39854A] font-semibold mt-0.5">
            Active staff members
          </div>
        </div>

        {/* Card 2: Total Contacts */}
        <div className="bg-white p-4 rounded-xl border border-[#DCE7DF] shadow-xs">
          <div className="text-xs font-bold text-[#36473C]">Total Contacts (AY {activeAcademicYear})</div>
          <div className="text-2xl font-bold font-mono text-[#172B20] mt-1">
            {totalContacts}
          </div>
          <div className="text-[11px] text-[#36473C] mt-0.5">
            All valid student enquiries
          </div>
        </div>

        {/* Card 3: Assigned */}
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-xs font-bold text-[#39854A]">Assigned</div>
          <div className="text-2xl font-bold font-mono text-[#39854A] mt-1">
            {assignedContactsCount}
          </div>
          <div className="text-[11px] text-[#28663B] font-semibold mt-0.5">
            Allocated to telecallers
          </div>
        </div>

        {/* Card 4: Unassigned */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <div className="text-xs font-bold text-amber-800">Unassigned</div>
          <div className="text-2xl font-bold font-mono text-amber-800 mt-1">
            {unassignedContactsCount}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
            Ready for allocation
          </div>
        </div>
      </div>

      {/* VIEW: Contact Assignment (Workspace with New Imports, Unassigned, All Contacts) */}
      {activeSubView === 'assignment' && (
        <div className="space-y-4">
          {/* Subtabs: Unassigned (default) | New Imports | All Contacts */}
          <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setContactsCategoryTab('unassigned');
                  setSelectedStudentIds([]);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  contactsCategoryTab === 'unassigned'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-[#DCE7DF] text-[#172B20] hover:bg-[#F7FAF8]'
                }`}
              >
                <span>Unassigned Contacts</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    contactsCategoryTab === 'unassigned'
                      ? 'bg-white/25 text-white'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {unassignedContactsCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setContactsCategoryTab('new_imports');
                  setSelectedStudentIds([]);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  contactsCategoryTab === 'new_imports'
                    ? 'bg-[#39854A] text-white shadow-xs'
                    : 'bg-white border border-[#DCE7DF] text-[#172B20] hover:bg-[#F7FAF8]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Imports</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    contactsCategoryTab === 'new_imports'
                      ? 'bg-white/25 text-white'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {newImportsCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setContactsCategoryTab('all');
                  setSelectedStudentIds([]);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  contactsCategoryTab === 'all'
                    ? 'bg-gray-800 text-white shadow-xs'
                    : 'bg-white border border-[#DCE7DF] text-[#172B20] hover:bg-[#F7FAF8]'
                }`}
              >
                <span>All Contacts</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    contactsCategoryTab === 'all'
                      ? 'bg-white/25 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {totalContacts}
                </span>
              </button>
            </div>

            {/* Reassign Shortcut Button */}
            {selectedStudentIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#172B20]">
                  {selectedStudentIds.length} contact(s) selected
                </span>
                <button
                  onClick={() => {
                    const selStudents = candidateStudents.filter((s) => selectedStudentIds.includes(s.id));
                    handleOpenReassignModal(selStudents);
                  }}
                  className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reassign Selected</span>
                </button>
              </div>
            )}
          </div>

          {/* Two-Column Allocation Workspace */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column: Contact Selection Table */}
            <div className="col-span-7 bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-3.5 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-[#39854A]"
                    >
                      {selectedStudentIds.length > 0 &&
                      selectedStudentIds.length === candidateStudents.length ? (
                        <CheckSquare className="w-4 h-4 text-[#39854A]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <span className="text-xs font-bold text-[#172B20]">
                      {contactsCategoryTab === 'new_imports'
                        ? 'Newly Imported Contacts'
                        : contactsCategoryTab === 'unassigned'
                        ? 'Unassigned Contact Queue'
                        : 'All Academic Contacts'}{' '}
                      ({selectedStudentIds.length} of {candidateStudents.length} selected)
                    </span>
                  </div>

                  <span className="text-[11px] text-[#36473C]">
                    {contactsCategoryTab === 'new_imports' && 'Identifiable by Batch & Import Date'}
                    {contactsCategoryTab === 'unassigned' && 'Awaiting Telecaller Assignment'}
                    {contactsCategoryTab === 'all' && 'AY 2026–27 Full Master'}
                  </span>
                </div>

                <div className="max-h-[480px] overflow-y-auto divide-y divide-[#DCE7DF]/60">
                  {candidateStudents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#36473C]">
                      No contacts in this category awaiting assignment.
                    </div>
                  ) : (
                    candidateStudents.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const isAssigned = !!student.assignedTelecallerId;
                      const isNew = student.isNewImport || student.importDate === '2026-05-05';

                      return (
                        <div
                          key={student.id}
                          onClick={() => toggleSelectStudent(student.id)}
                          className={`p-3 flex items-center justify-between hover:bg-[#F7FAF8] transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-gray-400">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#39854A]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-[#172B20]">
                                  {student.name}
                                </span>
                                <span className="text-[10px] font-mono text-[#36473C] bg-white px-1 py-0.2 rounded border border-[#DCE7DF]">
                                  {student.enquiryNo}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#36473C] mt-0.5">
                                {student.mobile} · {student.city} · {student.preferredCourse}
                              </div>
                              {student.importBatch && (
                                <div className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                                  <span>Batch: {student.importBatch}</span>
                                  <span>·</span>
                                  <span>Imported: {student.importDate || '2026-05-05'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="text-right flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1">
                              {isNew && (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded uppercase">
                                  New
                                </span>
                              )}
                              {isAssigned ? (
                                <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                  Assigned: {student.assignedTelecallerName}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-3 border-t border-[#DCE7DF] bg-[#F7FAF8] text-[11px] text-[#36473C] flex items-center justify-between">
                <span>Single-owner constraint enforced: No student enquiry is shared across multiple telecallers</span>
                <button
                  onClick={toggleSelectAll}
                  className="text-xs font-bold text-[#39854A] hover:underline"
                >
                  {selectedStudentIds.length === candidateStudents.length
                    ? 'Deselect All'
                    : `Select All (${candidateStudents.length})`}
                </button>
              </div>
            </div>

            {/* Right Column: Telecaller Strategy & Assignment Execution */}
            <div className="col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
                  <h2 className="text-sm font-bold text-[#172B20]">
                    Distribution Strategy
                  </h2>

                  {/* Mode switcher */}
                  <div className="flex items-center bg-[#F7FAF8] p-1 rounded-lg border border-[#DCE7DF]">
                    <button
                      onClick={() => setAssignmentMode('equal_split')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        assignmentMode === 'equal_split'
                          ? 'bg-[#39854A] text-white font-bold'
                          : 'text-[#172B20]'
                      }`}
                    >
                      Equal Split
                    </button>
                    <button
                      onClick={() => setAssignmentMode('manual_split')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                        assignmentMode === 'manual_split'
                          ? 'bg-[#39854A] text-white font-bold'
                          : 'text-[#172B20]'
                      }`}
                    >
                      Manual / Direct
                    </button>
                  </div>
                </div>

                {/* STRATEGY 1: Equal Split */}
                {assignmentMode === 'equal_split' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#36473C]">
                      Select Telecallers to evenly share the{' '}
                      <span className="font-bold text-[#172B20]">{selectedStudentIds.length}</span> selected contacts:
                    </p>

                    <div className="space-y-2">
                      {telecallers.map((tc) => {
                        const isChecked = selectedTelecallerIds.includes(tc.id);
                        const currentAssigned = filteredStudents.filter(
                          (s) => s.assignedTelecallerId === tc.id
                        ).length;

                        return (
                          <div
                            key={tc.id}
                            onClick={() => toggleSelectTelecaller(tc.id)}
                            className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? 'border-[#39854A] bg-[#39854A]/5'
                                : 'border-[#DCE7DF] hover:bg-[#F7FAF8]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="rounded text-[#39854A]"
                              />
                              <div>
                                <div className="text-xs font-bold text-[#172B20]">{tc.name}</div>
                                <div className="text-[10px] text-[#36473C] font-mono">{tc.mobile}</div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-xs font-mono font-bold text-[#172B20]">
                                {currentAssigned} contacts
                              </div>
                              <div className="text-[10px] text-[#36473C]">current load</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Equal Split Calculation Preview */}
                    {selectedStudentIds.length > 0 && selectedTelecallerIds.length > 0 && (
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-[#28663B] font-semibold space-y-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>Equal Split Preview:</span>
                          <span>
                            {selectedStudentIds.length} ÷ {selectedTelecallerIds.length} Telecallers
                          </span>
                        </div>
                        <div className="text-[11px] font-normal">
                          Each selected Telecaller receives ≈{' '}
                          <span className="font-bold font-mono">
                            {Math.ceil(selectedStudentIds.length / selectedTelecallerIds.length)} contacts
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* STRATEGY 2: Manual Split / Direct */
                  <div className="space-y-3">
                    <p className="text-xs text-[#36473C]">
                      Specify exact allocation counts or assign all{' '}
                      <span className="font-bold text-[#172B20]">{selectedStudentIds.length}</span> contacts to a single Telecaller:
                    </p>

                    <div className="space-y-2">
                      {telecallers.map((tc) => {
                        const isDirectTarget = singleTargetTelecallerId === tc.id;
                        const currentAssigned = filteredStudents.filter(
                          (s) => s.assignedTelecallerId === tc.id
                        ).length;

                        return (
                          <div
                            key={tc.id}
                            className={`p-3 rounded-lg border transition-all ${
                              isDirectTarget
                                ? 'border-[#39854A] bg-[#39854A]/5'
                                : 'border-[#DCE7DF] bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="singleTarget"
                                  checked={isDirectTarget}
                                  onChange={() => setSingleTargetTelecallerId(tc.id)}
                                  className="text-[#39854A]"
                                />
                                <div>
                                  <div className="text-xs font-bold text-[#172B20]">{tc.name}</div>
                                  <div className="text-[10px] text-[#36473C]">
                                    Current: {currentAssigned} contacts
                                  </div>
                                </div>
                              </label>

                              {/* Manual count input if not single target */}
                              {!singleTargetTelecallerId && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-500 font-bold">Qty:</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max={selectedStudentIds.length}
                                    value={manualSplitAllocation[tc.id] || ''}
                                    onChange={(e) =>
                                      handleManualCountChange(tc.id, parseInt(e.target.value) || 0)
                                    }
                                    placeholder="0"
                                    className="w-16 text-xs p-1 rounded border border-[#DCE7DF] font-mono text-center font-bold"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {singleTargetTelecallerId && (
                      <button
                        onClick={() => setSingleTargetTelecallerId('')}
                        className="text-[11px] text-[#39854A] font-bold hover:underline"
                      >
                        Switch back to custom quantity split
                      </button>
                    )}
                  </div>
                )}

                {/* Confirm Assignment Button */}
                <button
                  onClick={handleConfirmAssignment}
                  disabled={selectedStudentIds.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    Confirm Assignment ({selectedStudentIds.length} Contacts)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Team Workload */}
      {activeSubView === 'workload' && (
        <TeamWorkloadSection onOpenReassignModal={handleOpenReassignModal} />
      )}

      {/* VIEW: Assignment History */}
      {activeSubView === 'history' && <AssignmentHistorySection />}

      {/* Reassign Modal */}
      {isReassignModalOpen && (
        <ReassignModal
          studentsToReassign={reassignTargetStudents}
          onClose={() => setIsReassignModalOpen(false)}
          onSuccess={() => {
            setSelectedStudentIds([]);
          }}
        />
      )}
    </div>
  );
};
