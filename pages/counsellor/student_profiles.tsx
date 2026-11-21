import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { UserPlus, UploadCloud, Users, X, Check } from 'lucide-react';
import AdmissionsContactsTable from '@/components/KAHE/AdmissionsContactsTable';
import Modal from '@/common_component/modal';
import Models from '@/imports/models.import';

export default function CounsellorStudentProfiles() {
    const router = useRouter();
    const [isOpenAddContact, setIsOpenAddContact] = useState(false);
    const [formData, setFormData] = useState({
        student_name: '',
        phone_number: '',
        parent_phone: '',
        city: 'Coimbatore',
        area: '',
        qualification: '12th Standard',
        target_course: 'Computer Science & Engineering',
        institution: 'KAHE',
        assigned_to: 'Dr. K. Swaminathan',
    });
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};
        if (!formData.student_name.trim()) errors.student_name = 'Student Name is required';
        if (!formData.phone_number.trim()) {
            errors.phone_number = 'Mobile number is required';
        }

        if (Object.keys(errors).length > 0) {
            setAddErrors(errors);
            return;
        }

        try {
            setIsSubmitting(true);
            await (Models.contact as any).counsellor.add_contact({
                student_name: formData.student_name,
                mobile: formData.phone_number,
                parent_phone: formData.parent_phone,
                city: formData.city,
                qualification: formData.qualification,
                target_programme: formData.target_course,
                institution: formData.institution,
            });

            setIsSubmitting(false);
            setIsOpenAddContact(false);
            setFormData({
                student_name: '',
                phone_number: '',
                parent_phone: '',
                city: 'Coimbatore',
                area: '',
                qualification: '12th Standard',
                target_course: 'Computer Science & Engineering',
                institution: 'KAHE',
                assigned_to: 'Dr. K. Swaminathan',
            });
            setAddErrors({});
        } catch (error) {
            console.error('Failed to create student profile:', error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8] min-h-screen">
            <Head>
                <title>Enquiry Contacts Directory · KAHE Senior Academic Counselling</title>
            </Head>

            {/* Header Section (Matching Image 8) */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 sm:text-3xl dark:text-white">
                        Enquiry Contacts Directory
                    </h1>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 sm:text-sm dark:text-gray-400">
                        Displaying 21 student records for Academic Year 2026–27
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsOpenAddContact(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#39854a] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#2e6d3c] sm:text-sm"
                    >
                        <UserPlus className="h-4 w-4 text-white" />
                        <span>+ Add Contact</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push('/counsellor/bulk_import')}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700/60 sm:text-sm"
                    >
                        <UploadCloud className="h-4 w-4 text-[#39854a]" />
                        <span>Import Contacts</span>
                    </button>
                </div>
            </div>

            {/* Directory Table with 5 Dropdowns, Filter Bar, and Drawer Profile */}
            <AdmissionsContactsTable
                activeCategory="all"
                categoryTitle="All Contacts"
                showCardFilterTag={false}
                showRoleFilter={true}
            />

            {/* Add Contact Modal */}
            <Modal
                show={isOpenAddContact}
                setShow={(val: boolean) => setIsOpenAddContact(val)}
                title="Create New Student Enquiry Profile"
            >
                <form onSubmit={handleAddContactSubmit} className="space-y-4 pt-2 text-xs">
                    <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Student Full Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.student_name}
                            onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                            placeholder="e.g. S. Gokul"
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:border-[#39854a] focus:outline-none"
                        />
                        {addErrors.student_name && (
                            <p className="text-xs text-rose-500 mt-1">{addErrors.student_name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Student Mobile *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.phone_number}
                                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                placeholder="+91 98421 XXXXX"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:border-[#39854a] focus:outline-none"
                            />
                            {addErrors.phone_number && (
                                <p className="text-xs text-rose-500 mt-1">{addErrors.phone_number}</p>
                            )}
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Parent / Guardian Mobile
                            </label>
                            <input
                                type="text"
                                value={formData.parent_phone}
                                onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                                placeholder="+91 98420 XXXXX"
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:border-[#39854a] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                City / District
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:border-[#39854a] focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                                Educational Qualification
                            </label>
                            <select
                                value={formData.qualification}
                                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:border-[#39854a] focus:outline-none"
                            >
                                <option value="12th Standard">12th Standard (HSC)</option>
                                <option value="Diploma">Diploma</option>
                                <option value="UG Degree">UG Degree</option>
                                <option value="10th Standard">10th Standard</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Target Programme & Campus
                        </label>
                        <select
                            value={formData.target_course}
                            onChange={(e) => setFormData({ ...formData, target_course: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-800 dark:text-white focus:border-[#39854a] focus:outline-none"
                        >
                            <option value="Computer Science & Engineering">Computer Science & Engineering (KAHE)</option>
                            <option value="B.Sc Nursing">B.Sc Nursing (KAHE)</option>
                            <option value="Bachelor of Pharmacy">Bachelor of Pharmacy (KAHE)</option>
                            <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (KAHE)</option>
                            <option value="MCA">MCA (KAHE)</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setIsOpenAddContact(false)}
                            className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl bg-[#39854a] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#2e6d3c] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

