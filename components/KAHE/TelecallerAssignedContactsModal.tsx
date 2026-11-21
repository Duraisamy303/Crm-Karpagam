import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, RotateCcw, ArrowRight } from 'lucide-react';

export interface AssignedStudentItem {
    id: string;
    student_name: string;
    enquiry_id: string;
    city: string;
    target_course: string;
    status: string;
}

export interface TelecallerAssignedContactsModalProps {
    telecallerName: string;
    contacts: AssignedStudentItem[];
    isOpen: boolean;
    onClose: () => void;
    onReassignAll: (telecallerName: string, contacts: AssignedStudentItem[]) => void;
    onViewProfile?: (studentId: string) => void;
}

const TelecallerAssignedContactsModal: React.FC<TelecallerAssignedContactsModalProps> = ({
    telecallerName,
    contacts,
    isOpen,
    onClose,
    onReassignAll,
    onViewProfile,
}) => {
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const total = contacts.length;
    const called = contacts.filter((c) => c.status?.toLowerCase() === 'called').length;
    const pending = total - called;

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 my-8">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {telecallerName}&apos;s Assigned Contacts
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {total} Total ({called} Called · {pending} Pending)
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Contacts List */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[55vh] overflow-y-auto custom-scroll py-2">
                    {contacts.length === 0 ? (
                        <p className="py-6 text-center text-xs text-gray-400">
                            No assigned contacts found.
                        </p>
                    ) : (
                        contacts.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between py-3.5 px-1 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 rounded-xl transition"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                                            {item.student_name}
                                        </span>
                                        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                            {item.enquiry_id}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {item.city} · {item.target_course}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-[11px] font-bold text-[#16a34a] dark:bg-green-950/40">
                                        {item.status || 'Called'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onViewProfile && onViewProfile(item.id)}
                                        className="inline-flex items-center gap-1 text-xs font-bold text-[#39854a] hover:underline"
                                    >
                                        <span>Profile</span>
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <button
                        type="button"
                        onClick={() => onReassignAll(telecallerName, contacts)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition dark:text-purple-400"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reassign All {total} Contacts</span>
                    </button>
                    <button type="button" onClick={onClose} className="btn-action-solid px-5 py-2 text-xs font-bold">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal')!)
        : null;
};

export default TelecallerAssignedContactsModal;
