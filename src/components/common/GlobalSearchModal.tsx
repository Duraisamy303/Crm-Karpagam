'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Search, X, Users, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Student } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { filteredStudents, setSelectedStudent } = useCrm();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return filteredStudents
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.mobile.includes(q) ||
          s.parentMobile.includes(q) ||
          s.enquiryNo.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.preferredCourse.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [filteredStudents, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-start justify-center pt-24 z-50 p-4">
      <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        {/* Search Input Box */}
        <div className="p-4 border-b border-[#DCE7DF] flex items-center gap-3 bg-[#F7FAF8]">
          <Search className="w-5 h-5 text-[#39854A] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students by name, mobile, parent phone, or city..."
            className="w-full text-xs bg-transparent outline-none text-[#172B20] placeholder:text-[#36473C]/60"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#DCE7DF]/60 p-2">
          {results.map((student) => (
            <div
              key={student.id}
              onClick={() => {
                setSelectedStudent(student);
                onClose();
              }}
              className="p-3 hover:bg-[#F7FAF8] rounded-xl transition-colors cursor-pointer flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#172B20]">{student.name}</span>
                  <span className="text-[10px] text-[#36473C] font-mono">{student.enquiryNo}</span>
                  {student.linkedSiblingIds && student.linkedSiblingIds.length > 0 && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                      Sibling
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#36473C] mt-0.5 flex items-center gap-3">
                  <span>{student.mobile}</span>
                  <span>·</span>
                  <span>{student.city}</span>
                  <span>·</span>
                  <span className="text-[#39854A] font-semibold">{student.preferredCourse}</span>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}

          {query.trim() && results.length === 0 && (
            <div className="p-6 text-center text-xs text-[#36473C]">
              No student records matching "{query}".
            </div>
          )}

          {!query.trim() && (
            <div className="p-6 text-center text-xs text-[#36473C]">
              Type a name, phone number, or city to instantly locate enquiry records.
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-[#F7FAF8] border-t border-[#DCE7DF] text-[10px] text-[#36473C] flex justify-between">
          <span>Press ESC or click Outside to close</span>
          <span>Karpagam Admission CRM</span>
        </div>
      </div>
    </div>
  );
};
