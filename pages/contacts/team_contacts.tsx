import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { UserPlus, CloudUpload, Users, X } from 'lucide-react';
import AdmissionsContactsTable from '@/components/KAHE/AdmissionsContactsTable';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import { useSetState } from '@/utils/functions.utils';

// ── option helpers ────────────────────────────────────────────────────────────
const toOpt = (v: string) => ({ value: v, label: v });

const INSTITUTION_OPTIONS = [
    'KAHE',
    'KCE',
    'KIT',
    'Karpagam College of Pharmacy',
    'Karpagam Nursing College',
    'Karpagam Faculty of Medical Sciences',
].map(toOpt);

const TELECALLER_OPTIONS = ['P. Malathi', 'S. Ramesh Kumar', 'K. Kavitha', 'Unassigned'].map(toOpt);

const QUALIFICATION_OPTIONS = ['12th Standard', '10th Standard', 'Diploma', 'Graduate'].map(toOpt);

const DEFAULT_FORM = {
    student_name: '',
    phone_number: '',
    parent_phone: '',
    city: 'Coimbatore',
    area: '',
    qualification: toOpt('12th Standard'),
    target_course: 'Computer Science & Engineering',
    institution: toOpt('KAHE'),
    assigned_to: toOpt('P. Malathi'),
};

const TeamContactsPage = () => {
    const router = useRouter();
    const [state, setState] = useSetState({
        isOpenAddContact: false,
        formData: DEFAULT_FORM,
    });

    const setField = (key: keyof typeof DEFAULT_FORM) => (val: any) =>
        setState({ formData: { ...state.formData, [key]: val } });

    useEffect(() => {
        document.body.style.overflow = state.isOpenAddContact ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [state.isOpenAddContact]);

    const handleAddContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Contact "${state.formData.student_name}" created successfully!`);
        setState({ isOpenAddContact: false, formData: DEFAULT_FORM });
    };

    const modalContent = state.isOpenAddContact && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-[#0e1726]">
                <button
                    type="button"
                    onClick={() => setState({ isOpenAddContact: false })}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                        <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Enquiry Contact</h3>
                        <p className="text-xs text-gray-500">Academic Year 2026–27 · Karpagam Group</p>
                    </div>
                </div>

                <form onSubmit={handleAddContactSubmit} className="space-y-4 text-xs">
                    <TextInput
                        title="Student Full Name"
                        required
                        type="text"
                        value={state.formData.student_name}
                        onChange={setField('student_name')}
                        placeholder="e.g. K. Vignesh"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            title="Student Mobile"
                            required
                            type="tel"
                            value={state.formData.phone_number}
                            onChange={setField('phone_number')}
                            placeholder="+91 98421 98210"
                        />
                        <TextInput
                            title="Parent Mobile"
                            type="tel"
                            value={state.formData.parent_phone}
                            onChange={setField('parent_phone')}
                            placeholder="+91 98421 44552"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            title="City / District"
                            required
                            type="text"
                            value={state.formData.city}
                            onChange={setField('city')}
                            placeholder="Coimbatore"
                        />
                        <TextInput
                            title="Area / Locality"
                            type="text"
                            value={state.formData.area}
                            onChange={setField('area')}
                            placeholder="Gandhipuram"
                        />
                    </div>

                    <CustomSelect
                        title="Qualification"
                        required
                        options={QUALIFICATION_OPTIONS}
                        value={state.formData.qualification}
                        onChange={setField('qualification')}
                        placeholder="Select qualification"
                        isClearable={false}
                    />

                    <TextInput
                        title="Target Course & Specialization"
                        required
                        type="text"
                        value={state.formData.target_course}
                        onChange={setField('target_course')}
                        placeholder="Computer Science & Engineering"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <CustomSelect
                            title="Institution"
                            options={INSTITUTION_OPTIONS}
                            value={state.formData.institution}
                            onChange={setField('institution')}
                            placeholder="Select institution"
                            isSearchable={false}
                            isClearable={false}
                        />
                        <CustomSelect
                            title="Assigned Telecaller"
                            options={TELECALLER_OPTIONS}
                            value={state.formData.assigned_to}
                            onChange={setField('assigned_to')}
                            placeholder="Select telecaller"
                            isSearchable={false}
                            isClearable={false}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setState({ isOpenAddContact: false })}
                            className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-action-solid px-4 py-2 text-xs font-bold">
                            Save Contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen">
            <Head>
                <title>Team Contacts Directory - KAHE CRM</title>
            </Head>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Team Contacts Directory
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Displaying enquiry contacts assigned across Telecalling & Counselling teams for Academic Year 2026–27
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setState({ isOpenAddContact: true })}
                        className="btn-action-solid flex items-center gap-2"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>+ Add Contact</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/contacts/bulk_import')}
                        className="btn-action-outline flex items-center gap-2"
                    >
                        <CloudUpload className="h-4 w-4 text-[#39854a]" />
                        <span>Import Contacts</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/contacts/assign_contact')}
                        className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50/50 px-4 py-2.5 text-xs font-bold text-[#39854a] shadow-sm transition hover:bg-green-100 sm:text-sm dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-400"
                    >
                        <Users className="h-4 w-4 text-[#39854a]" />
                        <span>Assign Contacts</span>
                    </button>
                </div>
            </div>

            <AdmissionsContactsTable
                activeCategory="all"
                categoryTitle="Team Contacts"
                showRoleFilter={true}
                showCardFilterTag={false}
            />

            {typeof window !== 'undefined' &&
                ReactDOM.createPortal(modalContent, document.getElementById('modal-portal')!)}
        </div>
    );
};

export default TeamContactsPage;
