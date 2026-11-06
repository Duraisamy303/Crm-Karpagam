'use client';

import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { UserRole } from '../../types';
import { ShieldCheck, Headphones, GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { setCurrentRole, users } = useCrm();

  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [email, setEmail] = useState('admissions.director@karpagam.edu.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'ADMIN') {
      setEmail('admissions.director@karpagam.edu.in');
    } else if (role === 'TELECALLER') {
      setEmail('malathi.p@karpagam.edu.in');
    } else {
      setEmail('swaminathan.counsellor@karpagam.edu.in');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentRole(selectedRole);
    onLoginSuccess();
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setCurrentRole(role);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] flex flex-col justify-between items-center p-6 select-none">
      <div className="w-full max-w-md my-auto space-y-6">
        {/* Official KAHE Logo Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img
              src="/assets/aistudio/image_7878f0c8.png"
              alt="Karpagam Academy of Higher Education"
              className="h-24 w-auto object-contain mx-auto"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#172B20]">
              KARPAGAM INSTITUTIONS
            </h1>
            <p className="text-xs font-semibold text-[#36473C] mt-0.5">
              CENTRAL ADMISSIONS MANAGEMENT CRM
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white p-7 rounded-2xl border border-[#DCE7DF] shadow-md space-y-5">
          {/* Role selector tab */}
          <div>
            <label className="block text-xs font-bold text-[#172B20] mb-2">
              Select User Role Profile
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { r: 'ADMIN' as UserRole, label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { r: 'TELECALLER' as UserRole, label: 'Telecaller', icon: <Headphones className="w-3.5 h-3.5" /> },
                { r: 'COUNSELLOR' as UserRole, label: 'Sr. Counsellor', icon: <GraduationCap className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => handleRoleSelect(item.r)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedRole === item.r
                      ? 'bg-[#39854A] text-white border-[#39854A] shadow-xs'
                      : 'bg-[#F7FAF8] text-[#172B20] border-[#DCE7DF] hover:bg-gray-100'
                  }`}
                >
                  <span className="mb-1">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#36473C] mb-1">
                Institutional Email ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#DCE7DF] bg-[#F7FAF8] focus:bg-white focus:outline-none focus:border-[#39854A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#36473C] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#DCE7DF] bg-[#F7FAF8] focus:bg-white focus:outline-none focus:border-[#39854A]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#39854A] hover:bg-[#28663B] text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
            >
              <span>Sign In to {selectedRole} Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Section */}
          <div className="pt-3 border-t border-[#DCE7DF] text-center space-y-2">
            <span className="text-[11px] font-bold text-[#36473C] uppercase tracking-wider">
              1-Click Prototype Preview
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="flex-1 py-1.5 px-2 bg-[#F7FAF8] hover:bg-[#39854A]/10 border border-[#DCE7DF] text-[#172B20] text-[11px] font-bold rounded-md transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('TELECALLER')}
                className="flex-1 py-1.5 px-2 bg-[#F7FAF8] hover:bg-[#39854A]/10 border border-[#DCE7DF] text-[#172B20] text-[11px] font-bold rounded-md transition-colors"
              >
                Telecaller
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('COUNSELLOR')}
                className="flex-1 py-1.5 px-2 bg-[#F7FAF8] hover:bg-[#39854A]/10 border border-[#DCE7DF] text-[#172B20] text-[11px] font-bold rounded-md transition-colors"
              >
                Counsellor
              </button>
            </div>
          </div>
        </div>

        {/* Security and Affiliation footnote */}
        <div className="text-center text-[11px] text-[#36473C] space-y-0.5">
          <p>Karpagam Academy of Higher Education (Deemed to be University)</p>
          <p>Coimbatore, Tamil Nadu, India · Admissions 2026–27</p>
        </div>
      </div>
    </div>
  );
};
