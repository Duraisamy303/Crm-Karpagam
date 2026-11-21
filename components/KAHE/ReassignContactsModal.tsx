import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RotateCcw, X, UserPlus } from 'lucide-react';

export interface ReassignContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
    contactsSummary: string;
    totalCount: number;
    currentOwner: string;
    availableTelecallers?: string[];
    onConfirmReassign: (newTelecaller: string, reason: string) => void;
}

const ReassignContactsModal: React.FC<ReassignContactsModalProps> = ({
    isOpen,
    onClose,
    contactsSummary,
    totalCount,
    currentOwner,
    availableTelecallers = ['S. Ramesh Kumar', 'K. Kavitha', 'P. Malathi'],
    onConfirmReassign,
}) => {
    const [selectedTelecaller, setSelectedTelecaller] = useState('');
    const [reason, setReason] = useState('Workload rebalancing and priority callback');

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const targetTelecallers = availableTelecallers.filter((t) => t !== currentOwner);

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTelecaller) {
            alert('Please choose an active Telecaller');
            return;
        }
        onConfirmReassign(selectedTelecaller, reason);
        onClose();
    };

    const modal = (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 my-8">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#39854a] dark:bg-green-950/40">
                            <RotateCcw className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                Reassign Selected Contacts
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Transfer ownership to another active Telecaller
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleConfirm} className="space-y-4 pt-4 text-xs">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="font-bold text-gray-700 dark:text-gray-300">
                                Contacts to Reassign:
                            </label>
                            <span className="font-bold text-[#39854a]">{totalCount} contacts</span>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-3 font-semibold text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            {contactsSummary || `${totalCount} contacts selected`}
                        </div>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Current Assigned Owner
                        </label>
                        <input
                            type="text"
                            readOnly
                            value={currentOwner || 'Unassigned'}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 font-semibold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Select New Telecaller <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            value={selectedTelecaller}
                            onChange={(e) => setSelectedTelecaller(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-white p-2.5 font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">-- Choose active Telecaller --</option>
                            {targetTelecallers.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                            Reassignment Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={2}
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 p-2.5 font-semibold text-gray-800 focus:border-[#39854a] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50/70 p-3 text-xs leading-relaxed text-[#1e612f] dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-300">
                        <span className="font-bold">Preservation Policy:</span> Prior calling history, notes, and scheduled follow-up dates are fully preserved for the new telecaller.
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-action-solid flex items-center gap-1.5 px-4 py-2 font-bold">
                            <UserPlus className="h-4 w-4" />
                            <span>Confirm Reassignment</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof window !== 'undefined'
        ? ReactDOM.createPortal(modal, document.getElementById('modal-portal')!)
        : null;
};

export default ReassignContactsModal;
