import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { ShieldCheck, Plus, CheckCircle2, XCircle, UserPlus, PhoneCall, Mail } from 'lucide-react';
import { UserRole } from '../../types';

export const UsersView: React.FC = () => {
  const { users, toggleUserStatus, addUser } = useCrm();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('TELECALLER');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  const handleAddUser = () => {
    if (!name.trim() || !mobile.trim()) {
      alert('Name and Mobile number are required.');
      return;
    }
    addUser({
      name,
      role,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@karpagam.edu.in`,
      mobile,
      status: 'Active',
    });
    setName('');
    setEmail('');
    setMobile('');
    setShowAddModal(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#172B20] tracking-tight">CRM Staff & User Roles</h1>
          <p className="text-xs font-semibold text-[#36473C] mt-1">
            Manage authorized admission staff across Admin, Inbound Telecalling, and Senior Counselling desks.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#DCE7DF] text-[#36473C] font-semibold bg-[#F7FAF8]">
              <th className="py-3 px-4">Staff Name</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Contact Details</th>
              <th className="py-3 px-3 text-right">Active Workload</th>
              <th className="py-3 px-3 text-right">Calls Today</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7DF]/60">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-[#F7FAF8] transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#172B20]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#39854A]/10 text-[#39854A] font-bold text-xs flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div>{user.name}</div>
                      <div className="text-[10px] text-[#36473C] font-mono">{user.id}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-3">
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'COUNSELLOR'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-[#39854A]/10 text-[#39854A]'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="py-3.5 px-3">
                  <div className="font-mono text-[11px] text-[#172B20]">{user.mobile}</div>
                  <div className="text-[10px] text-[#36473C] truncate max-w-[200px]">
                    {user.email}
                  </div>
                </td>

                <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums text-[#172B20]">
                  {user.assignedContactsCount} contacts
                </td>

                <td className="py-3.5 px-3 text-right font-mono font-bold tabular-nums text-[#39854A]">
                  {user.callsToday}
                </td>

                <td className="py-3.5 px-3 text-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      user.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className="text-xs text-[#39854A] font-bold hover:underline"
                  >
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#DCE7DF] shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#172B20]">Add New CRM Staff Member</h3>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. S. Saravanan"
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF] bg-white"
              >
                <option value="TELECALLER">Telecaller</option>
                <option value="COUNSELLOR">Senior Counsellor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9842X XXXXX"
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172B20] mb-1">Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="saravanan.s@karpagam.edu.in"
                className="w-full text-xs p-2 rounded-lg border border-[#DCE7DF]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE7DF]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-1.5 bg-[#39854A] text-white text-xs font-bold rounded-lg hover:bg-[#28663B]"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
