'use client';

import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  MessageSquareShare,
  MessageCircle,
  Plus,
  Send,
  Eye,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  X,
  Search,
  CheckSquare,
  Square,
  Filter,
  AlertTriangle,
  FileText,
  Calendar,
  Check,
  ExternalLink,
  Copy,
  Info,
  Radio,
  Sparkles,
} from 'lucide-react';
import { WhatsAppCampaign, WhatsAppTemplate, Student } from '../../types';

export const CampaignsView: React.FC = () => {
  const {
    campaigns,
    templates,
    filteredStudents,
    createCampaign,
    activeAcademicYear,
    setSelectedStudent,
    showToast,
  } = useCrm();

  // Primary Tab: 'direct_broadcast' (The direct interactive flow) vs 'campaign_history'
  const [activeTab, setActiveTab] = useState<'direct_broadcast' | 'campaign_history'>('direct_broadcast');

  // Filter state
  const [selectedCity, setSelectedCity] = useState<string>('Coimbatore');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedQualFilter, setSelectedQualFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // Selected Template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'WT-01');

  // WhatsApp Action Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [bulkDispatchSuccess, setBulkDispatchSuccess] = useState(false);
  const [campaignTitleInput, setCampaignTitleInput] = useState('');

  // Performance Report modal for campaign history
  const [selectedCampaignReport, setSelectedCampaignReport] = useState<WhatsAppCampaign | null>(null);

  // Available unique cities and courses
  const availableCities = useMemo(() => {
    const list = Array.from(new Set(filteredStudents.map((s) => s.city))).filter(Boolean);
    const standardCities = ['Coimbatore', 'Tiruppur', 'Erode', 'Pollachi', 'Salem'];
    return Array.from(new Set([...standardCities, ...list]));
  }, [filteredStudents]);

  const availableAreas = useMemo(() => {
    const list = filteredStudents
      .filter((s) => (selectedCity === 'ALL' ? true : s.city === selectedCity))
      .map((s) => s.area)
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [filteredStudents, selectedCity]);

  const availableCourses = useMemo(() => {
    return Array.from(new Set(filteredStudents.map((s) => s.preferredCourse))).filter(Boolean);
  }, [filteredStudents]);

  // Evaluate matching contacts & WhatsApp Eligibility:
  // - Valid phone number
  // - Sibling Family De-duplication: When multiple students share the same parent mobile number,
  //   mark only the first as eligible for bulk broadcast to prevent spamming the same family.
  const { matchingContacts, eligibleContacts, ineligibleMap, siblingDuplicateCount } = useMemo(() => {
    const ineligibility: { [id: string]: 'Invalid Number' | 'Duplicate Family Number' | 'No Consent' } = {};
    const seenFamilyNumbers = new Set<string>();
    let duplicateSiblings = 0;

    const matching = filteredStudents.filter((s) => {
      if (selectedCity !== 'ALL' && s.city !== selectedCity) return false;
      if (selectedArea !== 'ALL' && s.area !== selectedArea) return false;
      if (selectedCourseFilter !== 'ALL' && s.preferredCourse !== selectedCourseFilter) return false;
      if (selectedQualFilter !== 'ALL' && s.qualification !== selectedQualFilter) return false;
      return true;
    });

    const eligible: Student[] = [];

    matching.forEach((s) => {
      // 1. Invalid number check
      const rawMobile = s.mobile ? s.mobile.replace(/\s+/g, '') : '';
      if (!rawMobile || rawMobile.length < 10 || rawMobile.toLowerCase().includes('invalid')) {
        ineligibility[s.id] = 'Invalid Number';
        return;
      }

      // 2. Sibling Family De-duplication check:
      // Check parentMobile if available, otherwise student mobile
      const familyPhone = (s.parentMobile && s.parentMobile.trim().length >= 10
        ? s.parentMobile.replace(/\D/g, '')
        : rawMobile.replace(/\D/g, '')
      ).slice(-10);

      if (seenFamilyNumbers.has(familyPhone)) {
        ineligibility[s.id] = 'Duplicate Family Number';
        duplicateSiblings++;
        return;
      }

      seenFamilyNumbers.add(familyPhone);
      eligible.push(s);
    });

    return {
      matchingContacts: matching,
      eligibleContacts: eligible,
      ineligibleMap: ineligibility,
      siblingDuplicateCount: duplicateSiblings,
    };
  }, [filteredStudents, selectedCity, selectedArea, selectedCourseFilter, selectedQualFilter]);

  // Filtered contacts based on search input
  const displayedContacts = useMemo(() => {
    if (!searchTerm.trim()) return matchingContacts;
    const term = searchTerm.toLowerCase();
    return matchingContacts.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.mobile.includes(term) ||
        (s.area && s.area.toLowerCase().includes(term)) ||
        s.preferredCourse.toLowerCase().includes(term)
    );
  }, [matchingContacts, searchTerm]);

  // Manage selection
  const handleSelectAllEligible = () => {
    setSelectedContactIds(eligibleContacts.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedContactIds([]);
  };

  const toggleSelectContact = (id: string) => {
    if (ineligibleMap[id]) return; // Block ineligible
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((item) => item !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedArea('ALL');
    // Pre-select new eligible contacts for convenience
    const newMatching = filteredStudents.filter((s) => (city === 'ALL' ? true : s.city === city));
    const seen = new Set<string>();
    const newEligibleIds: string[] = [];
    newMatching.forEach((s) => {
      const raw = s.mobile ? s.mobile.replace(/\D/g, '').slice(-10) : '';
      const fam = s.parentMobile ? s.parentMobile.replace(/\D/g, '').slice(-10) : raw;
      if (raw.length === 10 && !seen.has(fam)) {
        seen.add(fam);
        newEligibleIds.push(s.id);
      }
    });
    setSelectedContactIds(newEligibleIds);
  };

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Helper: interpolate variables for template
  const interpolateTemplate = (tmpl: WhatsAppTemplate, student?: Student | null) => {
    const studentName = student ? student.name : 'K. Vignesh';
    const course = student ? student.preferredCourse : 'B.Tech Artificial Intelligence & Data Science';
    const campus = student && student.preferredInstitution
      ? student.preferredInstitution.split('(')[0].trim()
      : 'Karpagam Academy of Higher Education (Main Campus)';

    return tmpl.body
      .replace(/{{StudentName}}/g, studentName)
      .replace(/{{Course}}/g, course)
      .replace(/{{Campus}}/g, campus);
  };

  // Quick 1-on-1 WhatsApp Chat Action
  const handleOpenIndividualChat = (student: Student) => {
    const rawDigits = student.mobile.replace(/\D/g, '');
    const cleanNumber = rawDigits.startsWith('91') ? rawDigits : `91${rawDigits}`;
    const text = encodeURIComponent(interpolateTemplate(activeTemplate, student));
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
    showToast(`Opening WhatsApp chat for ${student.name}`);
  };

  // Open "Share via WhatsApp" Modal
  const handleTriggerShare = () => {
    if (selectedContactIds.length === 0) {
      showToast('Please select at least one contact to share via WhatsApp.');
      return;
    }
    setBulkDispatchSuccess(false);
    setCampaignTitleInput(`${selectedCity} ${activeTemplate.title} — ${new Date().toLocaleDateString('en-GB')}`);
    setIsShareModalOpen(true);
  };

  // Execute Sandbox Bulk Broadcast
  const handleConfirmBulkDispatch = () => {
    createCampaign({
      name: campaignTitleInput || `${selectedCity} Broadcast`,
      location: selectedCity,
      targetCount: selectedContactIds.length,
      templateId: activeTemplate.id,
      templateTitle: activeTemplate.title,
      status: 'Sent',
    });
    setBulkDispatchSuccess(true);
    showToast(`Dispatched WhatsApp broadcast to ${selectedContactIds.length} recipients`);
    setTimeout(() => {
      setIsShareModalOpen(false);
      setBulkDispatchSuccess(false);
    }, 2200);
  };

  // Get first selected student object for preview/single chat
  const firstSelectedStudent = useMemo(() => {
    if (selectedContactIds.length === 0) return null;
    return filteredStudents.find((s) => s.id === selectedContactIds[0]) || null;
  }, [selectedContactIds, filteredStudents]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight flex items-center gap-2.5">
            <span>WhatsApp Campaign & Broadcast Center</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#39854A]/10 text-[#39854A] border border-[#39854A]/20">
              AY {activeAcademicYear}
            </span>
          </h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Filter matching regional candidates, select pre-approved Meta templates, and initiate direct WhatsApp outreach with family duplicate protection.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-white p-1 rounded-xl border border-[#DCE7DF] shadow-xs flex items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('direct_broadcast')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'direct_broadcast'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <MessageSquareShare className="w-4 h-4" />
            <span>Direct WhatsApp Broadcast</span>
          </button>

          <button
            onClick={() => setActiveTab('campaign_history')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'campaign_history'
                ? 'bg-[#39854A] text-white shadow-xs'
                : 'text-[#172B20] hover:bg-[#F7FAF8]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Campaign History ({campaigns.length})</span>
          </button>
        </div>
      </div>

      {/* 2. DIRECT WHATSAPP BROADCAST WORKSPACE */}
      {activeTab === 'direct_broadcast' && (
        <div className="space-y-6">
          {/* STEP 1: Location & Audience Filter Bar */}
          <div className="bg-[#F7FAF8] p-4 rounded-2xl border border-[#DCE7DF] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172B20] flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-[#39854A]" />
                <span>Step 1: Select Location & Audience Demographic Filters</span>
              </span>
              <span className="text-[11px] text-[#36473C]">
                Matching candidates update automatically across all admissions databases
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* City Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                  City / District <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white font-bold text-[#172B20] focus:outline-none focus:border-[#39854A]"
                >
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="ALL">All Cities (State-wide)</option>
                </select>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                  Area / Locality
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] focus:outline-none focus:border-[#39854A]"
                >
                  <option value="ALL">All Areas in {selectedCity}</option>
                  {availableAreas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Interest */}
              <div>
                <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                  Course Interest
                </label>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] focus:outline-none focus:border-[#39854A]"
                >
                  <option value="ALL">All Programmes</option>
                  {availableCourses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-[11px] font-bold text-[#36473C] mb-1">
                  Qualification
                </label>
                <select
                  value={selectedQualFilter}
                  onChange={(e) => setSelectedQualFilter(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#DCE7DF] bg-white text-[#172B20] focus:outline-none focus:border-[#39854A]"
                >
                  <option value="ALL">All Qualifications</option>
                  <option value="12th Standard">12th Standard (HSC)</option>
                  <option value="Diploma">Diploma / Polytechnic</option>
                  <option value="UG Completed">UG Degree Completed</option>
                  <option value="UG Final Year">UG Final Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 2: Live Counters & Sibling Deduplication Notification Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Matching Contacts */}
            <div className="bg-white p-4 rounded-xl border border-[#DCE7DF] shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-[#36473C]">Matching Contacts</div>
                <div className="text-2xl font-bold font-mono text-[#172B20] mt-0.5">
                  {matchingContacts.length}
                </div>
                <div className="text-[10px] text-[#36473C] mt-0.5">
                  In {selectedCity} {selectedArea !== 'ALL' ? `(${selectedArea})` : ''}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* Eligible Numbers */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-800">Eligible WhatsApp Numbers</div>
                <div className="text-2xl font-bold font-mono text-[#39854A] mt-0.5">
                  {eligibleContacts.length}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Unique family numbers verified
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            {/* Selected Recipients & Actions */}
            <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-blue-900">Selected Recipients</div>
                <div className="text-2xl font-bold font-mono text-blue-900 mt-0.5">
                  {selectedContactIds.length}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={handleSelectAllEligible}
                    className="text-[11px] font-bold text-[#39854A] hover:underline"
                  >
                    Select All ({eligibleContacts.length})
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-[11px] font-bold text-gray-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Sibling Family Protection Notice Banner */}
          {siblingDuplicateCount > 0 && (
            <div className="p-3 bg-amber-50/90 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Sibling Family Protection Active:</strong> {siblingDuplicateCount} contact
                  shares a parent WhatsApp number with an existing family member and has been automatically
                  de-duplicated to avoid sending repeated broadcasts to the same household.
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-100 px-2 py-0.5 rounded text-amber-800 border border-amber-200">
                1 Msg Per Family
              </span>
            </div>
          )}

          {/* STEP 3: Two-Column Interactive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Matching Contacts Table with Checkboxes & Direct Chat Icons */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE7DF] shadow-xs overflow-hidden flex flex-col">
              {/* Header with Search */}
              <div className="p-3.5 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={
                      selectedContactIds.length === eligibleContacts.length && eligibleContacts.length > 0
                        ? handleDeselectAll
                        : handleSelectAllEligible
                    }
                    className="text-gray-500 hover:text-[#39854A]"
                    title="Select/Deselect All Eligible"
                  >
                    {selectedContactIds.length > 0 &&
                    selectedContactIds.length === eligibleContacts.length ? (
                      <CheckSquare className="w-4 h-4 text-[#39854A]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <span className="text-xs font-bold text-[#172B20]">
                    Step 2: Select Recipients ({displayedContacts.length} in view)
                  </span>
                </div>

                {/* Search */}
                <div className="relative w-56">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, phone, course..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#DCE7DF] bg-white focus:outline-none focus:border-[#39854A]"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto divide-y divide-[#DCE7DF]/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAF8]/80 text-[#36473C] font-semibold sticky top-0 z-10 border-b border-[#DCE7DF]">
                    <tr>
                      <th className="py-2.5 px-3 w-8"></th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Mobile & Area</th>
                      <th className="py-2.5 px-3">Course Interest</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Chat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE7DF]/60">
                    {displayedContacts.map((student) => {
                      const ineligibilityReason = ineligibleMap[student.id];
                      const isEligible = !ineligibilityReason;
                      const isSelected = selectedContactIds.includes(student.id);

                      return (
                        <tr
                          key={student.id}
                          onClick={() => isEligible && toggleSelectContact(student.id)}
                          className={`hover:bg-[#F7FAF8] transition-colors ${
                            !isEligible ? 'opacity-65 bg-gray-50/50 cursor-not-allowed' : 'cursor-pointer'
                          } ${isSelected ? 'bg-emerald-50/40' : ''}`}
                        >
                          {/* Checkbox */}
                          <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              disabled={!isEligible}
                              checked={isSelected}
                              onChange={() => toggleSelectContact(student.id)}
                              className="w-4 h-4 text-[#39854A] rounded border-gray-300 focus:ring-[#39854A] cursor-pointer disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Student Name & Enquiry No */}
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#172B20] flex items-center gap-1.5">
                              <span>{student.name}</span>
                              {student.linkedSiblingIds && student.linkedSiblingIds.length > 0 && (
                                <span className="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-semibold">
                                  Sibling
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[#36473C] font-mono">
                              {student.enquiryNo} · {student.qualification}
                            </div>
                          </td>

                          {/* Mobile & Area */}
                          <td className="py-3 px-3">
                            <div className="font-mono text-[#172B20]">{student.mobile}</div>
                            <div className="text-[10px] text-[#36473C]">
                              {student.area || student.city}
                            </div>
                          </td>

                          {/* Preferred Course */}
                          <td className="py-3 px-3">
                            <div className="font-medium text-[#172B20] truncate max-w-[170px]" title={student.preferredCourse}>
                              {student.preferredCourse}
                            </div>
                            <div className="text-[10px] text-[#36473C] truncate max-w-[170px]">
                              {student.preferredInstitution.split('(')[1]?.replace(')', '') || 'KAHE'}
                            </div>
                          </td>

                          {/* Eligibility Badge */}
                          <td className="py-3 px-3 text-center">
                            {isEligible ? (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                Eligible
                              </span>
                            ) : ineligibilityReason === 'Duplicate Family Number' ? (
                              <span
                                title="Parent mobile number already assigned to another sibling recipient"
                                className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300"
                              >
                                Sibling Dup
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded border border-red-300">
                                {ineligibilityReason}
                              </span>
                            )}
                          </td>

                          {/* Direct WhatsApp Action Icon Beside Contact */}
                          <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenIndividualChat(student)}
                              title={`Start direct 1-on-1 WhatsApp chat with ${student.name}`}
                              className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {displayedContacts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-xs text-[#36473C]">
                          No students found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 5 Columns: Step 3 Templates, Live Smartphone Preview & Step 4 WhatsApp Action Button */}
            <div className="lg:col-span-5 space-y-4">
              {/* Approved Templates Selection Card */}
              <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172B20] flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#39854A]" />
                    <span>Step 3: Select Approved Template</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    Meta Verified
                  </span>
                </div>

                <div className="space-y-2">
                  {templates.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#39854A] bg-[#39854A]/5 ring-1 ring-[#39854A]'
                            : 'border-[#DCE7DF] hover:bg-[#F7FAF8]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-[#172B20]">
                          <span className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-[#39854A]' : 'bg-gray-300'
                              }`}
                            />
                            {tmpl.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-gray-100 text-[#36473C] rounded">
                            {tmpl.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#36473C] mt-1.5 line-clamp-2 leading-relaxed">
                          {tmpl.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Smartphone Mockup with Live Interpolated Preview */}
              <div className="bg-[#E5DDD5] p-4 rounded-2xl border border-[#DCE7DF] shadow-inner space-y-3">
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#39854A] flex items-center justify-center text-white text-[10px] font-bold">
                      K
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#172B20] flex items-center gap-1">
                        <span>Karpagam Admissions</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#39854A] fill-[#39854A]/20" />
                      </div>
                      <div className="text-[9px] text-gray-600">Official Business Account</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-mono font-bold">Preview</span>
                </div>

                {/* Message Bubble with Live Interpolation */}
                <div className="bg-white p-3.5 rounded-xl rounded-tl-xs shadow-xs text-xs space-y-2 relative">
                  <div className="text-[10px] font-bold text-[#28663B] border-b border-gray-100 pb-1">
                    Karpagam Academy of Higher Education (KAHE)
                  </div>
                  <p className="text-[#172B20] text-xs leading-relaxed whitespace-pre-wrap">
                    {interpolateTemplate(activeTemplate, firstSelectedStudent)}
                  </p>
                  <div className="text-[9px] text-gray-400 text-right">
                    10:30 AM · Delivered ✓✓
                  </div>
                </div>

                <div className="text-[10px] text-gray-600 bg-white/70 p-2 rounded-lg flex items-center justify-between">
                  <span>
                    Interpolated for:{' '}
                    <strong>{firstSelectedStudent ? firstSelectedStudent.name : 'Sample Student'}</strong>
                  </span>
                  <span>{selectedContactIds.length} in queue</span>
                </div>
              </div>

              {/* PROMINENT GREEN ACTION BUTTON: "Share via WhatsApp" */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleTriggerShare}
                  disabled={selectedContactIds.length === 0}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#39854A] hover:bg-[#28663B] text-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.99]"
                >
                  <MessageCircle className="w-5 h-5 fill-white text-[#39854A]" />
                  <span>Share via WhatsApp ({selectedContactIds.length} Recipients)</span>
                </button>
                <p className="text-[10px] text-[#36473C] text-center">
                  TRAI compliant (9 AM – 6 PM) · Single family deduplication active
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CAMPAIGN HISTORY VIEW */}
      {activeTab === 'campaign_history' && (
        <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#DCE7DF] flex items-center justify-between bg-[#F7FAF8]">
            <span className="text-xs font-bold text-[#172B20]">
              Campaign History & Delivery Analytics ({campaigns.length} Campaigns)
            </span>
            <span className="text-[11px] text-[#36473C]">
              Pre-approved templates · Opt-out & single-family delivery active
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]/50">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3 text-center">Audience</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7DF]/60">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-[#F7FAF8] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#172B20]">{camp.name}</div>
                    <div className="text-[10px] text-[#36473C] font-mono">
                      Template: {camp.templateTitle}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#172B20]">
                      <MapPin className="w-3.5 h-3.5 text-[#39854A]" />
                      <span>{camp.location}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono font-bold text-[#172B20]">
                    {camp.targetCount} recipients
                  </td>

                  <td className="py-3.5 px-3 font-mono text-[11px] text-[#36473C]">
                    {camp.sentDate || 'Scheduled Draft'}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        camp.status === 'Sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {camp.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCampaignReport(camp)}
                      className="px-2.5 py-1 text-xs font-bold text-[#39854A] hover:bg-[#39854A]/10 rounded-md transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. "SHARE VIA WHATSAPP" ACTION MODAL (Dual Single vs Bulk flow) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-xl w-full p-6 space-y-4 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#39854A]/10 text-[#39854A] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 fill-[#39854A]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172B20]">
                    {selectedContactIds.length === 1
                      ? 'Direct WhatsApp Message'
                      : 'WhatsApp Campaign Dispatch'}
                  </h3>
                  <p className="text-xs text-[#36473C]">
                    Template: {activeTemplate.title} · {selectedContactIds.length} Recipient(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CASE A: Single Recipient Selected */}
            {selectedContactIds.length === 1 && firstSelectedStudent && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-1">
                  <div className="font-bold text-[#172B20] text-sm">
                    {firstSelectedStudent.name}
                  </div>
                  <div className="text-[#36473C]">
                    Mobile: <span className="font-mono font-bold text-[#172B20]">{firstSelectedStudent.mobile}</span> · {firstSelectedStudent.preferredCourse}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                    Message to be Sent:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[#172B20] font-sans leading-relaxed whitespace-pre-wrap">
                    {interpolateTemplate(activeTemplate, firstSelectedStudent)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(interpolateTemplate(activeTemplate, firstSelectedStudent));
                      showToast('Message text copied to clipboard');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 border border-[#DCE7DF] text-[#172B20] rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-500" />
                    <span>Copy Text</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsShareModalOpen(false)}
                      className="px-3 py-2 text-gray-600 font-semibold"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleOpenIndividualChat(firstSelectedStudent);
                        setIsShareModalOpen(false);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#39854A] hover:bg-[#28663B] text-white font-bold rounded-lg transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open WhatsApp Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CASE B: Multiple Recipients Selected (> 1) */}
            {selectedContactIds.length > 1 && (
              <div className="space-y-4 text-xs">
                {bulkDispatchSuccess ? (
                  <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <CheckCircle2 className="w-12 h-12 text-[#39854A] mx-auto animate-bounce" />
                    <h4 className="text-base font-bold text-[#172B20]">
                      Broadcast Dispatched Successfully!
                    </h4>
                    <p className="text-xs text-[#36473C]">
                      Validated {selectedContactIds.length} candidate numbers with single-family deduplication. Campaign logged in analytics.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[#36473C] leading-relaxed">
                      You have selected <strong>{selectedContactIds.length} recipients</strong> across{' '}
                      <strong>{selectedCity}</strong>. Choose how you would like to proceed:
                    </p>

                    {/* Option 1: Open Single Chat */}
                    <div className="p-3.5 rounded-xl border border-[#DCE7DF] hover:border-[#39854A] transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#172B20] flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-[#39854A]" />
                          <span>Option 1: Open WhatsApp Chat (Single Recipient)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                          Quick 1-on-1
                        </span>
                      </div>
                      <p className="text-[11px] text-[#36473C] leading-relaxed">
                        Open your personal or WhatsApp Web client to start an individual conversation with{' '}
                        <strong>{firstSelectedStudent?.name || 'the first recipient'}</strong>.
                      </p>
                      {firstSelectedStudent && (
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenIndividualChat(firstSelectedStudent);
                            setIsShareModalOpen(false);
                          }}
                          className="mt-1 text-xs font-bold text-[#39854A] hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open Chat with {firstSelectedStudent.name}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Option 2: Bulk Broadcast via WhatsApp Business Platform */}
                    <div className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-[#172B20] flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#39854A]" />
                          <span>Option 2: Send Bulk Campaign (Authorized WhatsApp Business Platform)</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-bold">
                          Cloud API
                        </span>
                      </div>

                      {/* Explicit Sandbox / Integration Required Callout */}
                      <div className="p-2.5 bg-white rounded-lg border border-emerald-200 text-[11px] space-y-1">
                        <div className="font-bold text-[#172B20] flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-[#39854A]" />
                          <span>Integration Status: Authorized Sandbox Preview Mode</span>
                        </div>
                        <p className="text-[#36473C] leading-relaxed">
                          Bulk multi-recipient broadcasting without account suspension requires the official Meta WhatsApp Business Cloud API. In this CRM visual prototype, dispatching executes verified template validation, protects family numbers, and records analytics.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-white rounded-lg border border-[#DCE7DF]">
                          <span className="text-gray-500 block">Recipients:</span>
                          <span className="font-bold text-[#172B20] font-mono">
                            {selectedContactIds.length} Verified Contacts
                          </span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#DCE7DF]">
                          <span className="text-gray-500 block">Family Deduplication:</span>
                          <span className="font-bold text-emerald-700">Single Msg per Family</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#172B20] mb-1">
                          Campaign Log Name
                        </label>
                        <input
                          type="text"
                          value={campaignTitleInput}
                          onChange={(e) => setCampaignTitleInput(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white font-medium"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleConfirmBulkDispatch}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        <Send className="w-4 h-4" />
                        <span>Launch Sandbox Broadcast to {selectedContactIds.length} Recipients</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Campaign Performance Report Modal */}
      {selectedCampaignReport && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-[#DCE7DF] shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#DCE7DF] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#172B20]">
                  {selectedCampaignReport.name}
                </h3>
                <p className="text-xs text-[#36473C]">
                  Location: {selectedCampaignReport.location} · Academic Year {selectedCampaignReport.academicYear}
                </p>
              </div>
              <button
                onClick={() => setSelectedCampaignReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campaign Metrics Breakdown */}
            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-2.5 bg-[#F7FAF8] rounded-lg border border-[#DCE7DF]">
                <div className="text-[10px] text-[#36473C] font-semibold">Sent</div>
                <div className="text-base font-mono font-bold text-[#172B20] mt-0.5">
                  {selectedCampaignReport.metrics.sent}
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-[10px] text-emerald-800 font-semibold">Delivered</div>
                <div className="text-base font-mono font-bold text-emerald-800 mt-0.5">
                  {selectedCampaignReport.metrics.delivered}
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-[10px] text-blue-800 font-semibold">Read</div>
                <div className="text-base font-mono font-bold text-blue-800 mt-0.5">
                  {selectedCampaignReport.metrics.read}
                </div>
              </div>
              <div className="p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-[10px] text-purple-800 font-semibold">Replied</div>
                <div className="text-base font-mono font-bold text-purple-800 mt-0.5">
                  {selectedCampaignReport.metrics.replied}
                </div>
              </div>
              <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                <div className="text-[10px] text-red-700 font-semibold">Failed</div>
                <div className="text-base font-mono font-bold text-red-700 mt-0.5">
                  {selectedCampaignReport.metrics.failed}
                </div>
              </div>
            </div>

            {/* Template Preview */}
            <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCE7DF] space-y-1.5 text-xs">
              <div className="font-bold text-[#172B20]">
                Template: {selectedCampaignReport.templateTitle}
              </div>
              <p className="text-[#36473C] leading-relaxed italic bg-white p-2.5 rounded-lg border border-[#DCE7DF]">
                {templates.find((t) => t.id === selectedCampaignReport.templateId)?.body ||
                  'Official Karpagam Admission Template'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCampaignReport(null)}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
