import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Layers,
  Plus,
  CheckCircle2,
  XCircle,
  Edit,
  GraduationCap,
  Calendar,
  MessageCircle,
  Building,
  BookOpen,
} from 'lucide-react';

export const MastersView: React.FC = () => {
  const {
    institutions,
    courses,
    academicYears,
    templates,
    toggleInstitutionStatus,
    toggleCourseStatus,
    addCourse,
    addAcademicYear,
  } = useCrm();

  const [activeCategory, setActiveCategory] = useState<
    | 'institutions'
    | 'courses'
    | 'qualifications'
    | 'outcomes'
    | 'references'
    | 'academic_years'
    | 'whatsapp_templates'
  >('institutions');

  // New course modal state
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newDegreeType, setNewDegreeType] = useState<'UG' | 'PG'>('UG');
  const [newDegree, setNewDegree] = useState('B.Tech');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState(institutions[0]?.id || '');

  // New Academic Year modal state
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearName, setNewYearName] = useState('2028–29');
  const [newYearStart, setNewYearStart] = useState('2028-04-01');
  const [newYearEnd, setNewYearEnd] = useState('2029-03-31');

  const categories = [
    { id: 'institutions', label: 'Institutions / Colleges', count: institutions.length },
    { id: 'courses', label: 'Courses & Degrees', count: courses.length },
    { id: 'academic_years', label: 'Academic Years', count: academicYears.length },
    { id: 'whatsapp_templates', label: 'WhatsApp Templates', count: templates.length },
    { id: 'qualifications', label: 'Qualifications', count: 5 },
    { id: 'outcomes', label: 'Call Outcomes', count: 6 },
    { id: 'references', label: 'Reference Types', count: 6 },
  ] as const;

  const handleSaveCourse = () => {
    if (!newCourseName.trim()) {
      alert('Course name is required');
      return;
    }
    const inst = institutions.find((i) => i.id === selectedInstitutionId);
    addCourse({
      institutionId: selectedInstitutionId,
      institutionName: inst?.name || 'Karpagam Academy of Higher Education (KAHE)',
      degreeType: newDegreeType,
      degree: newDegree,
      courseName: newCourseName,
      specialization: newSpecialization || 'Core',
      durationYears: newDegreeType === 'UG' ? 4 : 2,
      status: 'Active',
    });
    setNewCourseName('');
    setShowAddCourseModal(false);
  };

  const handleSaveYear = () => {
    if (!newYearName.trim()) return;
    addAcademicYear(newYearName, newYearStart, newYearEnd);
    setShowAddYearModal(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">
            Institutional Masters Configuration
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Central repository governing colleges, affiliated courses, academic cycles, and communication templates.
          </p>
        </div>

        {activeCategory === 'courses' && (
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>
        )}

        {activeCategory === 'academic_years' && (
          <button
            onClick={() => setShowAddYearModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Academic Year</span>
          </button>
        )}
      </div>

      {/* Category Tabs Header */}
      <div className="bg-white p-1.5 rounded-xl border border-[#DCE7DF] shadow-xs flex items-center gap-1 overflow-x-auto">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#39854A] text-white font-bold shadow-xs'
                  : 'text-[#172B20] hover:bg-[#F7FAF8]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#36473C]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Institutions */}
      {activeCategory === 'institutions' && (
        <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
            <span className="text-xs font-bold text-[#172B20]">
              Registered Karpagam Campuses ({institutions.length})
            </span>
            <span className="text-[11px] text-[#36473C]">Deemed University & Affiliated Colleges</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-3">Code</th>
                <th className="py-3 px-3">Classification</th>
                <th className="py-3 px-3 text-right">Offered Courses</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7DF]/60">
              {institutions.map((inst) => {
                const count = courses.filter((c) => c.institutionId === inst.id).length;
                return (
                  <tr key={inst.id} className="hover:bg-[#F7FAF8] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#172B20]">
                      <div className="flex items-center gap-2.5">
                        <Building className="w-4 h-4 text-[#39854A]" />
                        <span>{inst.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-[#39854A]">{inst.code}</td>
                    <td className="py-3.5 px-3 text-[#36473C]">{inst.category}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#172B20]">
                      {count} programmes
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          inst.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {inst.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleInstitutionStatus(inst.id)}
                        className="text-xs text-[#39854A] font-bold hover:underline"
                      >
                        {inst.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Courses & Degrees */}
      {activeCategory === 'courses' && (
        <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
            <span className="text-xs font-bold text-[#172B20]">Configured Courses ({courses.length})</span>
            <span className="text-[11px] text-[#36473C]">Connected dynamically to Student Profile Forms</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
                <th className="py-3 px-4">Course Name</th>
                <th className="py-3 px-3">Level / Degree</th>
                <th className="py-3 px-3">Specialization</th>
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3 text-right">Duration</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7DF]/60">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-[#F7FAF8] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#172B20]">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-[#39854A]" />
                      <span>{course.courseName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#39854A]">
                    {course.degreeType} · {course.degree}
                  </td>
                  <td className="py-3 px-3 text-[#36473C]">{course.specialization || 'Core'}</td>
                  <td className="py-3 px-3 text-[#172B20] truncate max-w-[200px]">
                    {course.institutionName.split('(')[1]?.replace(')', '') || course.institutionName}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[#36473C]">
                    {course.durationYears} Yrs
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        course.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleCourseStatus(course.id)}
                      className="text-xs text-[#39854A] font-bold hover:underline"
                    >
                      {course.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: Academic Years */}
      {activeCategory === 'academic_years' && (
        <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
          <div className="px-5 py-3 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
            <span className="text-xs font-bold text-[#172B20]">Academic Years & Admission Cycles</span>
            <span className="text-[11px] text-[#36473C]">Archived years retain history without appearing in active calling</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
                <th className="py-3 px-4">Academic Year</th>
                <th className="py-3 px-3">Start Date</th>
                <th className="py-3 px-3">End Date</th>
                <th className="py-3 px-3 text-right">Enquiries Logged</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7DF]/60">
              {academicYears.map((ay) => (
                <tr key={ay.id} className="hover:bg-[#F7FAF8] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#172B20] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#39854A]" />
                    <span>AY {ay.name}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#36473C]">{ay.startDate}</td>
                  <td className="py-3 px-3 font-mono text-[#36473C]">{ay.endDate}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#172B20]">
                    {ay.totalEnquiries}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ay.status === 'ACTIVE'
                          ? 'bg-[#39854A]/10 text-[#39854A]'
                          : ay.status === 'UPCOMING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Academic Year Data Separation & Archival Policy Note */}
          <div className="p-4 bg-[#F7FAF8] border-t border-[#DCE7DF] space-y-2">
            <div className="text-xs font-bold text-[#172B20] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#39854A]" />
              <span>Yearly Data Handling & Archival Retention Rules</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px] text-[#36473C]">
              <div className="p-2.5 bg-white border border-[#DCE7DF] rounded-lg space-y-1">
                <div className="font-bold text-[#172B20]">1. Cycle Separation</div>
                <div>Current year admission enquiries remain strictly isolated from past batches. Previous year records do not appear in telecaller queues.</div>
              </div>
              <div className="p-2.5 bg-white border border-[#DCE7DF] rounded-lg space-y-1">
                <div className="font-bold text-[#172B20]">2. Returning Applicants</div>
                <div>When candidates from archived years re-apply, the system flags a "Previous Year Record Found" alert to verify re-enquiry vs new family member.</div>
              </div>
              <div className="p-2.5 bg-white border border-[#DCE7DF] rounded-lg space-y-1">
                <div className="font-bold text-[#172B20]">3. Archival Retention</div>
                <div>Historical calling logs and notes are never automatically mixed into the fresh cycle, preserving clean telecalling metrics and compliance.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: WhatsApp Templates */}
      {activeCategory === 'whatsapp_templates' && (
        <div className="grid grid-cols-2 gap-4">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-white p-5 rounded-xl border border-[#DCE7DF] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#39854A]" />
                  <h3 className="text-xs font-bold text-[#172B20]">{tmpl.title}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                  {tmpl.category}
                </span>
              </div>
              <p className="text-xs text-[#36473C] bg-[#F7FAF8] p-3 rounded-lg border border-[#DCE7DF] leading-relaxed">
                {tmpl.body}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#36473C] pt-1">
                <span>Variables: &#123;&#123;StudentName&#125;&#125;</span>
                <span className="font-bold text-emerald-700">Verified Approved</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB CONTENT: Qualifications, Outcomes, References */}
      {(activeCategory === 'qualifications' ||
        activeCategory === 'outcomes' ||
        activeCategory === 'references') && (
        <div className="bg-white p-6 rounded-xl border border-[#DCE7DF] shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#172B20]">
            System Configured {activeCategory.replace('_', ' ').toUpperCase()}
          </h3>
          <p className="text-xs text-[#36473C]">
            These standard master values ensure strict data normalization across all telecallers and counselling staff.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {activeCategory === 'qualifications' &&
              ['10th Standard', '12th Standard', 'Diploma / Polytechnic', 'UG Completed', 'UG Final Year'].map(
                (item) => (
                  <div key={item} className="p-3 bg-[#F7FAF8] border border-[#DCE7DF] rounded-lg text-xs font-bold text-[#172B20]">
                    {item}
                  </div>
                )
              )}

            {activeCategory === 'outcomes' &&
              ['Interested', 'Callback', 'No Answer', 'Busy', 'Not Interested', 'Wrong Number'].map(
                (item) => (
                  <div key={item} className="p-3 bg-[#F7FAF8] border border-[#DCE7DF] rounded-lg text-xs font-bold text-[#172B20]">
                    {item}
                  </div>
                )
              )}

            {activeCategory === 'references' &&
              ['School', 'Teacher', 'Sibling', 'Alumni', 'Existing Student', 'Other'].map((item) => (
                <div key={item} className="p-3 bg-[#F7FAF8] border border-[#DCE7DF] rounded-lg text-xs font-bold text-[#172B20]">
                  {item}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#172B20]">Configure New Course Master</h3>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Select Institution</label>
              <select
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">Level</label>
                <select
                  value={newDegreeType}
                  onChange={(e) => setNewDegreeType(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
                >
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">Degree Prefix</label>
                <input
                  type="text"
                  value={newDegree}
                  onChange={(e) => setNewDegree(e.target.value)}
                  placeholder="e.g. B.Tech or M.Sc"
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Course Name</label>
              <input
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g. Robotics & Automation"
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Specialization</label>
              <input
                type="text"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                placeholder="e.g. Industrial IoT"
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => setShowAddCourseModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Save Course to Master
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Academic Year Modal */}
      {showAddYearModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#172B20]">Add New Academic Admission Cycle</h3>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Year Label</label>
              <input
                type="text"
                value={newYearName}
                onChange={(e) => setNewYearName(e.target.value)}
                placeholder="e.g. 2028–29"
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">Start Date</label>
                <input
                  type="date"
                  value={newYearStart}
                  onChange={(e) => setNewYearStart(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#172B20] mb-1">End Date</label>
                <input
                  type="date"
                  value={newYearEnd}
                  onChange={(e) => setNewYearEnd(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => setShowAddYearModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveYear}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Create Academic Year
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
