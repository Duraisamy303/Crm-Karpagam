'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Search,
  Filter,
  UserPlus,
  UploadCloud,
  ChevronDown,
  Eye,
  CheckSquare,
  Square,
  Users,
  PhoneCall,
  Edit,
  MessageCircle,
} from 'lucide-react';
import { Student } from '../../types';
import { StudentDataEntryPanel } from '../telecaller/StudentDataEntryPanel';
import { AddContactModal } from '../common/AddContactModal';
import { ImportContactsModal } from '../common/ImportContactsModal';

interface ContactsViewProps {
  onNavigate: (tab: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({ onNavigate }) => {
  const {
    filteredStudents,
    setSelectedStudent,
    institutions,
    users,
    activeAcademicYear,
    setCallModalStudent,
    currentRole,
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('ALL');
  const [filterCollege, setFilterCollege] = useState('ALL');
  const [filterQualification, setFilterQualification] = useState('ALL');
  const [filterTelecaller, setFilterTelecaller] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dataEntryStudent, setDataEntryStudent] = useState<Student | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Unique filter lists
  const cities = useMemo(() => {
    return Array.from(new Set(filteredStudents.map((s) => s.city))).filter(Boolean);
  }, [filteredStudents]);

  const telecallers = useMemo(() => {
    return users.filter((u) => u.role === 'TELECALLER');
  }, [users]);

  // Filtered dataset
  const displayedStudents = useMemo(() => {
    return filteredStudents.filter((s) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesPhone = s.mobile.includes(q) || s.parentMobile.includes(q);
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesEnq = s.enquiryNo.toLowerCase().includes(q);
        const matchesCourse = s.preferredCourse.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCity && !matchesEnq && !matchesCourse) {
          return false;
        }
      }

      // Dropdown filters
      if (filterCity !== 'ALL' && s.city !== filterCity) return false;
      if (filterCollege !== 'ALL' && s.preferredInstitution !== filterCollege) return false;
      if (filterQualification !== 'ALL' && s.qualification !== filterQualification) return false;
      if (filterTelecaller !== 'ALL') {
        if (filterTelecaller === 'UNASSIGNED') {
          if (s.assignedTelecallerId) return false;
        } else if (s.assignedTelecallerId !== filterTelecaller) {
          return false;
        }
      }
      if (filterStatus !== 'ALL' && s.admissionStage !== filterStatus) return false;

      return true;
    });
  }, [
    filteredStudents,
    searchQuery,
    filterCity,
    filterCollege,
    filterQualification,
    filterTelecaller,
    filterStatus,
  ]);

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedStudents.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

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
        return 'bg-gray-100 text-gray-800';
      case 'Not Interested':
        return 'bg-red-100 text-red-800 font-semibold';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Quick actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Enquiry Contacts Directory
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Displaying {displayedStudents.length} student records for Academic Year {activeAcademicYear}
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
          {currentRole === 'ADMIN' && (
            <button
              onClick={() => onNavigate('assign')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#28663B] border border-emerald-200 text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <Users className="w-4 h-4 text-[#39854A]" />
              <span>Assign {selectedIds.length > 0 ? `(${selectedIds.length})` : 'Contacts'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls Row */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE7DF] shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#36473C]/60 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search student name, phone number, enquiry ID, city, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-lg border border-[#DCE7DF] bg-[#F7FAF8] focus:bg-white focus:outline-none focus:border-[#39854A]"
          />
        </div>

        {/* Multi-filter Dropdowns */}
        <div className="grid grid-cols-5 gap-3 pt-1">
          <div>
            <label className="block text-[10px] uppercase font-bold text-[#36473C]/80 mb-1">
              City / Area
            </label>
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
            >
              <option value="ALL">All Cities</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#36473C]/80 mb-1">
              Institution / College
            </label>
            <select
              value={filterCollege}
              onChange={(e) => setFilterCollege(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A] truncate"
            >
              <option value="ALL">All Institutions</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.name}>
                  {i.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#36473C]/80 mb-1">
              Qualification
            </label>
            <select
              value={filterQualification}
              onChange={(e) => setFilterQualification(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
            >
              <option value="ALL">All Qualifications</option>
              <option value="12th Standard">12th Standard</option>
              <option value="Diploma">Diploma</option>
              <option value="UG Completed">UG Completed</option>
              <option value="UG Final Year">UG Final Year</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#36473C]/80 mb-1">
              Telecaller
            </label>
            <select
              value={filterTelecaller}
              onChange={(e) => setFilterTelecaller(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
            >
              <option value="ALL">All Telecallers</option>
              <option value="UNASSIGNED">Unassigned Only</option>
              {telecallers.map((tc) => (
                <option key={tc.id} value={tc.id}>
                  {tc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-[#36473C]/80 mb-1">
              Admission Stage
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs p-1.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
            >
              <option value="ALL">All Stages</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Counselling">Counselling</option>
              <option value="Applied">Applied</option>
              <option value="Admitted">Admitted</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contacts Table (High Density, Clean) */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#F7FAF8] border-b border-[#DCE7DF] text-[#36473C] font-semibold">
              <th className="py-3 px-4 w-10">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-gray-400 hover:text-[#39854A]"
                >
                  {selectedIds.length > 0 && selectedIds.length === displayedStudents.length ? (
                    <CheckSquare className="w-4 h-4 text-[#39854A]" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="py-3 px-3">Student Name</th>
              <th className="py-3 px-3">Mobile & Parent</th>
              <th className="py-3 px-3">City / Area</th>
              <th className="py-3 px-3">Target Course</th>
              <th className="py-3 px-3">Assigned To</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {displayedStudents.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              const hasSiblings =
                student.linkedSiblingIds && student.linkedSiblingIds.length > 0;

              return (
                <tr
                  key={student.id}
                  className={`hover:bg-[#F7FAF8] transition-colors ${
                    isSelected ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSelectOne(student.id)}
                      className="text-gray-400 hover:text-[#39854A]"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#39854A]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Student Name */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-[#172B20]">{student.name}</div>
                      {hasSiblings && (
                        <span
                          title="Has registered sibling under same family phone"
                          className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold cursor-help"
                        >
                          Sibling
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#36473C] font-mono">
                      {student.enquiryNo} · {student.qualification}
                    </div>
                  </td>

                  {/* Mobile & Parent */}
                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-[#172B20] font-semibold">{student.mobile}</div>
                    <div className="text-[#36473C]">P: {student.parentMobile || '—'}</div>
                  </td>

                  {/* City */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#172B20]">{student.city}</div>
                    <div className="text-[11px] text-[#36473C]">{student.area}</div>
                  </td>

                  {/* Course */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#172B20] truncate max-w-[200px]">
                      {student.preferredCourse}
                    </div>
                    <div className="text-[10px] text-[#36473C] truncate max-w-[200px]">
                      {student.preferredInstitution.split('(')[1]?.replace(')', '') ||
                        student.preferredInstitution}
                    </div>
                  </td>

                  {/* Assigned To */}
                  <td className="py-3 px-3">
                    {student.assignedTelecallerName ? (
                      <div className="font-bold text-[#172B20]">
                        {student.assignedTelecallerName}
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Unassigned
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full ${getStatusBadge(
                        student.admissionStage
                      )}`}
                    >
                      {student.admissionStage}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {currentRole === 'TELECALLER' ? (
                        <>
                          <button
                            onClick={() => setCallModalStudent(student)}
                            className="p-1.5 text-[#39854A] hover:bg-[#39854A]/10 rounded-lg transition-colors"
                            title="Quick Call Log"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDataEntryStudent(student)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Call & Update</span>
                          </button>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 text-[#172B20] hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#39854A]" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setCallModalStudent(student)}
                            className="p-1.5 text-[#39854A] hover:bg-[#39854A]/10 rounded-lg transition-colors"
                            title="Quick Call Log"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#172B20] bg-white border border-[#DCE7DF] hover:bg-[#F7FAF8] rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#39854A]" />
                            <span>View</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {displayedStudents.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-xs text-[#36473C]">
                  No matching student records found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Dedicated Student Data Entry Panel */}
      {dataEntryStudent && (
        <StudentDataEntryPanel
          student={dataEntryStudent}
          onClose={() => setDataEntryStudent(null)}
          onSaved={() => setDataEntryStudent(null)}
        />
      )}

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
