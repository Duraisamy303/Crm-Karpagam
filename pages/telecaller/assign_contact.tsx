import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import {
    Users,
    UserCheck,
    RotateCcw,
    Calendar,
    Eye,
    Check,
    X,
    Clock,
    Sparkles,
    UserPlus,
    Filter,
    ChevronDown,
} from 'lucide-react';
import assignmentData from '@/data/assignmentSampleData.json';
import admissionsData from '@/data/admissionsSampleData.json';
import TelecallerAssignedContactsModal, {
    AssignedStudentItem,
} from '@/components/KAHE/TelecallerAssignedContactsModal';
import ReassignContactsModal from '@/components/KAHE/ReassignContactsModal';
import StudentDetailsModal from '@/components/KAHE/StudentDetailsModal';
import LogCallModal from '@/components/KAHE/LogCallModal';
import { AdmissionContact } from '@/components/KAHE/AdmissionsContactsTable';

type TabKey = 'assignment' | 'workload' | 'history';
type QueueFilter = 'unassigned' | 'new_imports' | 'all';
type DistributionMode = 'manual' | 'equal';
type DateFilter = 'all' | 'day' | 'month' | 'year' | 'custom';

const AssignContactPage = () => {
    const router = useRouter();

    // Top Level Tab Navigation
    const [activeTab, setActiveTab] = useState<TabKey>('assignment');

    // Tab 1: Contact Assignment States
    const [queueFilter, setQueueFilter] = useState<QueueFilter>('unassigned');
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
    const [distributionMode, setDistributionMode] = useState<DistributionMode>('manual');
    const [selectedTelecallersForEqual, setSelectedTelecallersForEqual] = useState<string[]>([
        'P. Malathi',
        'S. Ramesh Kumar',
        'K. Kavitha',
    ]);
    const [manualQuantities, setManualQuantities] = useState<Record<string, number>>({
        'P. Malathi': 0,
        'S. Ramesh Kumar': 0,
        'K. Kavitha': 0,
    });
    const [singleSelectedTelecaller, setSingleSelectedTelecaller] = useState<string>('');

    // Tab 3: History States
    const [dateFilter, setDateFilter] = useState<DateFilter>('custom');
    const [fromDate, setFromDate] = useState('01/05/2026');
    const [toDate, setToDate] = useState('31/05/2026');
    const [telecallerFilter, setTelecallerFilter] = useState('All Telecallers');
    const [academicYearFilter, setAcademicYearFilter] = useState('AY 2026–27');

    // Modals
    const [assignedModalTelecaller, setAssignedModalTelecaller] = useState<string | null>(null);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [reassignConfig, setReassignConfig] = useState<{
        contactsSummary: string;
        totalCount: number;
        currentOwner: string;
    }>({
        contactsSummary: '',
        totalCount: 0,
        currentOwner: '',
    });

    // Profile View Modal
    const [viewingStudent, setViewingStudent] = useState<AdmissionContact | null>(null);
    const [callingContact, setCallingContact] = useState<AdmissionContact | null>(null);

    // Dynamic unassigned queue
    const unassignedQueue = assignmentData.unassignedQueue;
    const isAllQueueSelected =
        unassignedQueue.length > 0 && selectedContactIds.length === unassignedQueue.length;

    const handleSelectAllQueue = () => {
        if (isAllQueueSelected) {
            setSelectedContactIds([]);
        } else {
            setSelectedContactIds(unassignedQueue.map((c) => c.id));
        }
    };

    const handleToggleQueueContact = (id: string) => {
        setSelectedContactIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Confirm Assignment Handler
    const handleConfirmAssignment = () => {
        if (selectedContactIds.length === 0) return;

        if (distributionMode === 'equal') {
            if (selectedTelecallersForEqual.length === 0) {
                alert('Please select at least one Telecaller for equal split');
                return;
            }
            alert(
                `Successfully split ${selectedContactIds.length} contact(s) equally among ${selectedTelecallersForEqual.join(
                    ', '
                )}!`
            );
        } else {
            // manual
            alert(
                `Successfully assigned ${selectedContactIds.length} contact(s) via manual distribution!`
            );
        }
        setSelectedContactIds([]);
    };

    // Open Reassign Modal for Workload row
    const handleOpenReassignForTelecaller = (telecallerName: string, count: number) => {
        const contactsForTelecaller =
            assignmentData.telecallerAssignedContacts[
            telecallerName as keyof typeof assignmentData.telecallerAssignedContacts
            ] || [];
        const summary = contactsForTelecaller.map((c) => c.student_name).slice(0, 3).join(', ');
        const remainder = count > 3 ? ` and ${count - 3} others` : '';

        setReassignConfig({
            contactsSummary: summary ? `${summary}${remainder}` : `${count} contacts`,
            totalCount: count,
            currentOwner: telecallerName,
        });
        setIsReassignModalOpen(true);
    };

    // View contacts modal handler
    const handleOpenAssignedContacts = (telecallerName: string) => {
        setAssignedModalTelecaller(telecallerName);
    };

    // View profile from assigned contacts modal
    const handleViewProfile = (studentId: string) => {
        const fullStudent = (admissionsData as AdmissionContact[]).find((s) => s.id === studentId);
        if (fullStudent) {
            setViewingStudent(fullStudent);
        } else {
            // fallback
            setViewingStudent({
                id: studentId,
                student_name: 'Student ' + studentId,
                enquiry_id: studentId,
                qualification: '12th Standard',
                phone_number: '+91 98421 98210',
                parent_phone: '-',
                city: 'Coimbatore',
                area: 'Gandhipuram',
                target_course: 'Computer Science & Engineering',
                institution: 'KAHE',
                assigned_to: assignedModalTelecaller || 'P. Malathi',
                status: 'Called',
            });
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen">
            <Head>
                <title>Contact Assignment Management - KAHE CRM</title>
            </Head>

            {/* ============================================================== */}
            {/* TOP HEADER & TAB SWITCHER */}
            {/* ============================================================== */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Contact Assignment Management
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Allocate imported student contacts to telecallers, monitor team workload, and track distribution audit history.
                    </p>
                </div>

                {/* 3-Tab Pill Switcher */}
                <div className="inline-flex rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab('assignment')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'assignment'
                            ? 'bg-[#39854a] text-white shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                            }`}
                    >
                        <UserPlus className="h-4 w-4" />
                        <span>Contact Assignment</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('workload')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'workload'
                            ? 'bg-[#39854a] text-white shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        <span>Team Workload</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${activeTab === 'history'
                            ? 'bg-[#39854a] text-white shadow-sm'
                            : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                            }`}
                    >
                        <Clock className="h-4 w-4" />
                        <span>Assignment History</span>
                    </button>
                </div>
            </div>

            {/* ============================================================== */}
            {/* 4 OVERVIEW STAT CARDS */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Telecallers */}
                <div className="stat-card">
                    <span className="stat-card-title">Total Telecallers</span>
                    <div className="stat-card-value">{assignmentData.stats.total_telecallers}</div>
                    <p className="mt-1 text-xs font-bold text-[#39854a]">Active staff members</p>
                </div>

                {/* Total Contacts */}
                <div className="stat-card">
                    <span className="stat-card-title">Total Contacts (AY 2026–27)</span>
                    <div className="stat-card-value">{assignmentData.stats.total_contacts}</div>
                    <p className="stat-card-subtitle">All valid student enquiries</p>
                </div>

                {/* Assigned */}
                <div className="stat-card">
                    <span className="stat-card-title">Assigned</span>
                    <div className="stat-card-value text-[#39854a]">{assignmentData.stats.assigned}</div>
                    <p className="stat-card-subtitle">Allocated to telecallers</p>
                </div>

                {/* Unassigned */}
                <div className="stat-card border-amber-200 dark:border-amber-900/60">
                    <span className="stat-card-title text-amber-700 dark:text-amber-400">Unassigned</span>
                    <div className="stat-card-value text-[#ea580c]">{assignmentData.stats.unassigned}</div>
                    <p className="mt-1 text-xs font-bold text-[#ea580c]">Ready for allocation</p>
                </div>
            </div>

            {/* ============================================================== */}
            {/* TAB 1: CONTACT ASSIGNMENT */}
            {/* ============================================================== */}
            {activeTab === 'assignment' && (
                <div className="space-y-4">
                    {/* Sub-filter Badges & Selected Indicator */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setQueueFilter('unassigned')}
                                className={`rounded-xl px-4 py-1.5 text-sm font-bold transition ${queueFilter === 'unassigned'
                                    ? 'bg-[#ea580c] text-white shadow-sm'
                                    : 'rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                    }`}
                            >
                                Unassigned Contacts{' '}
                                <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                                    4
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setQueueFilter('new_imports')}
                                className={`inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition ${queueFilter === 'new_imports'
                                    ? 'ring-2 ring-[#39854a] border-[#39854a]'
                                    : ''
                                    }`}
                            >
                                <Sparkles className="h-3.5 w-3.5 text-[#39854a]" />
                                <span>New Imports</span>
                                <span className="ml-1 rounded-full bg-green-50 px-1.5 py-0.2 text-[10px] font-bold text-[#39854a]">
                                    6
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setQueueFilter('all')}
                                className={`rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 transition ${queueFilter === 'all'
                                    ? 'ring-2 ring-[#39854a] border-[#39854a]'
                                    : ''
                                    }`}
                            >
                                All Contacts{' '}
                                <span className="ml-1 text-[11px] text-gray-400">23</span>
                            </button>
                        </div>

                        {selectedContactIds.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    {selectedContactIds.length} contact(s) selected
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setReassignConfig({
                                            contactsSummary: `${selectedContactIds.length} contacts selected from queue`,
                                            totalCount: selectedContactIds.length,
                                            currentOwner: 'Unassigned',
                                        });
                                        setIsReassignModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Reassign Selected</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* 2-Column Main Section */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* LEFT COLUMN: Queue */}
                        <div className="overview-panel p-0 overflow-hidden lg:col-span-7 flex flex-col justify-between">
                            {/* Queue Header */}
                            <div>
                                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-[#fafafa] dark:bg-[#101b2e]">
                                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-gray-900 dark:text-white">
                                        <input
                                            type="checkbox"
                                            checked={isAllQueueSelected}
                                            onChange={handleSelectAllQueue}
                                            className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                        />
                                        <span>
                                            Unassigned Contact Queue ({selectedContactIds.length} of{' '}
                                            {unassignedQueue.length} selected)
                                        </span>
                                    </label>
                                    <span className="text-xs text-gray-400 font-medium">
                                        Awaiting Telecaller Assignment
                                    </span>
                                </div>

                                {/* Queue Items List */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {unassignedQueue.map((item) => {
                                        const isChecked = selectedContactIds.includes(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => handleToggleQueueContact(item.id)}
                                                className={`flex items-start justify-between p-4 transition cursor-pointer ${isChecked
                                                    ? 'bg-green-50/40 dark:bg-green-950/20'
                                                    : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => { }}
                                                        className="mt-1 h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                                                {item.student_name}
                                                            </span>
                                                            <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                                {item.enquiry_id}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-medium">
                                                            {item.phone_number} · {item.city} ·{' '}
                                                            {item.target_course}
                                                        </p>
                                                        {item.batch && (
                                                            <p className="text-[11px] text-gray-400 mt-0.5">
                                                                Batch: {item.batch} · Imported:{' '}
                                                                {item.imported_date}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {item.is_new && (
                                                        <span className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-bold text-[#39854a] border border-green-200 dark:bg-green-950/40 dark:border-green-900/60">
                                                            NEW
                                                        </span>
                                                    )}
                                                    <span className="rounded bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-[#ea580c] border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60">
                                                        Unassigned
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Queue Footer */}
                            <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-gray-800 bg-[#fafafa]/50 dark:bg-[#101b2e]/50 text-xs">
                                <span className="text-gray-400">
                                    Single-owner constraint enforced: No student enquiry is shared across multiple telecallers
                                </span>
                                <button
                                    type="button"
                                    onClick={handleSelectAllQueue}
                                    className="font-bold text-[#39854a] hover:underline"
                                >
                                    {isAllQueueSelected
                                        ? 'Deselect All'
                                        : `Select All (${unassignedQueue.length})`}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Distribution Strategy */}
                        <div className="overview-panel lg:col-span-5 flex flex-col justify-between space-y-5">
                            <div>
                                {/* Header & Strategy Switcher */}
                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                                        Distribution Strategy
                                    </h3>
                                    <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
                                        <button
                                            type="button"
                                            onClick={() => setDistributionMode('equal')}
                                            className={`rounded-lg px-3 py-1 text-xs font-bold transition ${distributionMode === 'equal'
                                                ? 'bg-[#39854a] text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300'
                                                }`}
                                        >
                                            Equal Split
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDistributionMode('manual')}
                                            className={`rounded-lg px-3 py-1 text-xs font-bold transition ${distributionMode === 'manual'
                                                ? 'bg-[#39854a] text-white shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-300'
                                                }`}
                                        >
                                            Manual / Direct
                                        </button>
                                    </div>
                                </div>

                                {/* Strategy Description */}
                                <p className="text-xs text-gray-500 mt-3">
                                    {distributionMode === 'manual'
                                        ? `Specify exact allocation counts or assign all ${selectedContactIds.length} contacts to a single Telecaller:`
                                        : `Select Telecallers to evenly share the ${selectedContactIds.length} selected contacts:`}
                                </p>

                                {/* Telecaller Options */}
                                <div className="mt-4 space-y-3">
                                    {assignmentData.telecallerWorkloads.map((telecaller) => {
                                        if (distributionMode === 'manual') {
                                            const isSelectedRadio =
                                                singleSelectedTelecaller === telecaller.name;
                                            return (
                                                <div
                                                    key={telecaller.id}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-300 transition"
                                                >
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="telecallerRadio"
                                                            checked={isSelectedRadio}
                                                            onChange={() => {
                                                                setSingleSelectedTelecaller(telecaller.name);
                                                                setManualQuantities({
                                                                    'P. Malathi': 0,
                                                                    'S. Ramesh Kumar': 0,
                                                                    'K. Kavitha': 0,
                                                                    [telecaller.name]:
                                                                        selectedContactIds.length,
                                                                });
                                                            }}
                                                            className="h-4 w-4 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                                        />
                                                        <div>
                                                            <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                                                {telecaller.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                Current: {telecaller.assigned} contacts
                                                            </span>
                                                        </div>
                                                    </label>

                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <span>Qty:</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={unassignedQueue.length}
                                                            value={manualQuantities[telecaller.name] || 0}
                                                            onChange={(e) =>
                                                                setManualQuantities({
                                                                    ...manualQuantities,
                                                                    [telecaller.name]: Number(
                                                                        e.target.value
                                                                    ),
                                                                })
                                                            }
                                                            className="w-14 rounded-lg border border-gray-200 p-1.5 text-center font-bold text-gray-900 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // equal split
                                            const isChecked = selectedTelecallersForEqual.includes(
                                                telecaller.name
                                            );
                                            return (
                                                <div
                                                    key={telecaller.id}
                                                    onClick={() => {
                                                        setSelectedTelecallersForEqual((prev) =>
                                                            prev.includes(telecaller.name)
                                                                ? prev.filter((n) => n !== telecaller.name)
                                                                : [...prev, telecaller.name]
                                                        );
                                                    }}
                                                    className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer ${isChecked
                                                        ? 'border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20'
                                                        : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => { }}
                                                            className="h-4 w-4 rounded border-gray-300 accent-[#39854a] text-[#39854a] focus:ring-[#39854a] cursor-pointer"
                                                        />
                                                        <div>
                                                            <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                                                {telecaller.name}
                                                            </span>
                                                            <span className="text-[11px] text-gray-400">
                                                                {telecaller.phone}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="font-bold text-xs text-gray-900 dark:text-white block">
                                                            {telecaller.assigned} contacts
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            current load
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                type="button"
                                disabled={selectedContactIds.length === 0}
                                onClick={handleConfirmAssignment}
                                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition ${selectedContactIds.length > 0
                                    ? 'bg-[#39854a] hover:bg-[#2e6d3c] text-white cursor-pointer'
                                    : 'bg-[#a3c7ac] text-white cursor-not-allowed'
                                    }`}
                            >
                                <UserPlus className="h-4 w-4" />
                                <span>
                                    Confirm Assignment ({selectedContactIds.length} Contacts)
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: TEAM WORKLOAD */}
            {/* ============================================================== */}
            {activeTab === 'workload' && (
                <div className="overview-panel p-0 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-[#fafafa] dark:bg-[#101b2e]">
                        <div>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                                Active Telecaller Workloads (3)
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                                · Unique student contacts per telecaller in current cycle
                            </span>
                        </div>
                        <span className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                            Called = At least 1 call attempt completed
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="border-b border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="py-3.5 px-4">Telecaller Name</th>
                                    <th className="py-3.5 px-4 text-center">Status</th>
                                    <th className="py-3.5 px-4 text-center">Current Assigned</th>
                                    <th className="py-3.5 px-4 text-center">Called Contacts</th>
                                    <th className="py-3.5 px-4 text-center">Pending Calls</th>
                                    <th className="py-3.5 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {assignmentData.telecallerWorkloads.map((telecaller) => (
                                    <tr
                                        key={telecaller.id}
                                        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                                    >
                                        {/* Telecaller Name */}
                                        <td className="py-4 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {telecaller.name}
                                                </span>
                                                <span className="text-xs text-gray-400 mt-0.5">
                                                    {telecaller.phone}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="inline-block rounded-full bg-[#dcfce7] px-3 py-0.5 text-xs font-bold text-[#16a34a] dark:bg-green-950/40">
                                                {telecaller.status}
                                            </span>
                                        </td>

                                        {/* Current Assigned */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="inline-block rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-bold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                {telecaller.assigned}
                                            </span>
                                        </td>

                                        {/* Called Contacts */}
                                        <td className="py-4 px-4 text-center">
                                            <span className="inline-block rounded-md border border-green-200 bg-green-50/60 px-3 py-1 font-bold text-[#39854a] dark:border-green-900/60 dark:bg-green-950/30">
                                                {telecaller.called}
                                            </span>
                                        </td>

                                        {/* Pending Calls */}
                                        <td className="py-4 px-4 text-center">
                                            {telecaller.pending === 0 ? (
                                                <span className="inline-block rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-bold text-gray-400 dark:border-gray-700 dark:bg-gray-800">
                                                    0
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded-md border border-amber-200 bg-amber-50 px-3 py-1 font-bold text-[#ea580c] dark:border-amber-900/60 dark:bg-amber-950/30">
                                                    {telecaller.pending}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenAssignedContacts(telecaller.name)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 shadow-sm"
                                                >
                                                    <Eye className="h-3.5 w-3.5 text-gray-500" />
                                                    <span>View Contacts ({telecaller.assigned})</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleOpenReassignForTelecaller(
                                                            telecaller.name,
                                                            telecaller.assigned
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition dark:border-purple-900/60 dark:bg-purple-950/30 dark:text-purple-300"
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                    <span>Reassign</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: ASSIGNMENT HISTORY */}
            {/* ============================================================== */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Filters Row (White Box / Overview Panel) */}
                    <div className="overview-panel p-4 space-y-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Quick Date Filters */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                {(['all', 'day', 'month', 'year', 'custom'] as const).map((filterKey) => {
                                    const labels: Record<DateFilter, string> = {
                                        all: 'All Dates',
                                        day: 'Day',
                                        month: 'Month',
                                        year: 'Year',
                                        custom: 'Custom Range',
                                    };
                                    const isActive = dateFilter === filterKey;
                                    return (
                                        <button
                                            key={filterKey}
                                            type="button"
                                            onClick={() => setDateFilter(filterKey)}
                                            className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition ${isActive
                                                ? 'bg-[#39854a] text-white shadow-sm font-bold border border-[#39854a]'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                                }`}
                                        >
                                            {labels[filterKey]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Dropdown Filters (Increased Text Size) */}
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="relative">
                                    <select
                                        value={telecallerFilter}
                                        onChange={(e) => setTelecallerFilter(e.target.value)}
                                        className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-gray-800 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
                                    >
                                        <option value="All Telecallers">All Telecallers</option>
                                        <option value="P. Malathi">P. Malathi</option>
                                        <option value="S. Ramesh Kumar">S. Ramesh Kumar</option>
                                        <option value="K. Kavitha">K. Kavitha</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>

                                <div className="relative">
                                    <select
                                        value={academicYearFilter}
                                        onChange={(e) => setAcademicYearFilter(e.target.value)}
                                        className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm font-semibold text-gray-800 shadow-sm transition focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 cursor-pointer"
                                    >
                                        <option value="AY 2026–27">AY 2026–27</option>
                                        <option value="AY 2025–26">AY 2025–26</option>
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Custom Date Range Pickers INSIDE the White Box */}
                        {dateFilter === 'custom' && (
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-600 dark:text-gray-400">From:</span>
                                    <div className="relative flex items-center">
                                        <Flatpickr
                                            value={fromDate}
                                            options={{
                                                dateFormat: 'd/m/Y',
                                            }}
                                            className="form-input rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-9 text-xs sm:text-sm font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer w-36 sm:w-44"
                                            onChange={(dates) => {
                                                if (dates[0]) {
                                                    const d = dates[0];
                                                    setFromDate(
                                                        `${String(d.getDate()).padStart(2, '0')}/${String(
                                                            d.getMonth() + 1
                                                        ).padStart(2, '0')}/${d.getFullYear()}`
                                                    );
                                                }
                                            }}
                                        />
                                        <Calendar className="pointer-events-none absolute right-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-600 dark:text-gray-400">To:</span>
                                    <div className="relative flex items-center">
                                        <Flatpickr
                                            value={toDate}
                                            options={{
                                                dateFormat: 'd/m/Y',
                                            }}
                                            className="form-input rounded-xl border border-gray-200 bg-white py-1.5 pl-3 pr-9 text-xs sm:text-sm font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white cursor-pointer w-36 sm:w-44"
                                            onChange={(dates) => {
                                                if (dates[0]) {
                                                    const d = dates[0];
                                                    setToDate(
                                                        `${String(d.getDate()).padStart(2, '0')}/${String(
                                                            d.getMonth() + 1
                                                        ).padStart(2, '0')}/${d.getFullYear()}`
                                                    );
                                                }
                                            }}
                                        />
                                        <Calendar className="pointer-events-none absolute right-2.5 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Historical Table */}
                    <div className="overview-panel p-0 overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-[#fafafa] dark:bg-[#101b2e]">
                            <div>
                                <span className="font-bold text-sm text-gray-900 dark:text-white">
                                    Historical Assignment Logs (6)
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                    · 7 total contact allocations in view
                                </span>
                            </div>
                            <span className="text-xs text-gray-400">
                                Maintains full audit trail without double-counting current owners
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead className="border-b border-gray-100 dark:border-gray-800 text-sm font-bold text-gray-700 dark:text-gray-200">
                                    <tr>
                                        <th className="py-3.5 px-4">Assignment Date</th>
                                        <th className="py-3.5 px-4">Telecaller</th>
                                        <th className="py-3.5 px-4 text-center">Contacts Assigned</th>
                                        <th className="py-3.5 px-4">Assigned By</th>
                                        <th className="py-3.5 px-4 text-center">Action Type</th>
                                        <th className="py-3.5 px-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {assignmentData.assignmentLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition"
                                        >
                                            <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                    <span>{log.date}</span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                                                {log.telecaller}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-block rounded-md bg-[#dcfce7] px-2.5 py-0.5 text-xs font-bold text-[#16a34a] dark:bg-green-950/40">
                                                    {log.count} {log.count === 1 ? 'contact' : 'contacts'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {log.assigned_by}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {log.academic_year}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-[#39854a] border border-green-200 dark:bg-green-950/40 dark:border-green-900/60">
                                                    <UserPlus className="h-3 w-3" />
                                                    <span>{log.action_type}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenAssignedContacts(log.telecaller)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span>View Contacts</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODALS */}
            {/* ============================================================== */}

            {/* Telecaller Assigned Contacts Modal (Image 4) */}
            <TelecallerAssignedContactsModal
                telecallerName={assignedModalTelecaller || ''}
                isOpen={Boolean(assignedModalTelecaller)}
                contacts={
                    assignedModalTelecaller
                        ? (assignmentData.telecallerAssignedContacts[
                            assignedModalTelecaller as keyof typeof assignmentData.telecallerAssignedContacts
                        ] as AssignedStudentItem[]) || []
                        : []
                }
                onClose={() => setAssignedModalTelecaller(null)}
                onReassignAll={(telecallerName, contacts) => {
                    setAssignedModalTelecaller(null);
                    handleOpenReassignForTelecaller(telecallerName, contacts.length);
                }}
                onViewProfile={handleViewProfile}
            />

            {/* Reassign Contacts Modal (Image 5) */}
            <ReassignContactsModal
                isOpen={isReassignModalOpen}
                onClose={() => setIsReassignModalOpen(false)}
                contactsSummary={reassignConfig.contactsSummary}
                totalCount={reassignConfig.totalCount}
                currentOwner={reassignConfig.currentOwner}
                onConfirmReassign={(newTelecaller, reason) => {
                    alert(
                        `Successfully reassigned ${reassignConfig.totalCount} contact(s) to ${newTelecaller}!\nReason: ${reason}`
                    );
                }}
            />

            {/* Student Details Full Profile Modal */}
            <StudentDetailsModal
                contact={viewingStudent}
                isOpen={Boolean(viewingStudent)}
                onClose={() => setViewingStudent(null)}
                onLogCall={(contact) => {
                    setViewingStudent(null);
                    setCallingContact(contact);
                }}
            />

            {/* Log Call Modal */}
            <LogCallModal
                contact={callingContact}
                isOpen={Boolean(callingContact)}
                onClose={() => setCallingContact(null)}
            />
        </div>
    );
};

export default AssignContactPage;
