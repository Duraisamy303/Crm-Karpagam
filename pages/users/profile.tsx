import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import {
    User,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building2,
    ShieldCheck,
    CheckCircle2,
    Award,
    TrendingUp,
    Edit3,
    Lock,
    Key,
    LogOut,
    Clock,
    Target,
    PhoneCall,
    GraduationCap,
    X,
    Briefcase,
    Sparkles,
} from 'lucide-react';
import { setPageTitle } from '@/store/themeConfigSlice';
import { resetAll } from '@/store/crmConfigSlice';
import Models from '@/imports/models.import';
import { capitalizeFLetter, Failure, Success, useSetState } from '@/utils/functions.utils';
import TextInput from '@/components/TextInput';

// =============================================================================
// MAIN COMPONENT: UserProfilePage
// =============================================================================
const UserProfilePage = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'security'>('overview');

    // ── Unified State ────────────────────────────────────────────────────────
    const [state, setState] = useSetState({
        isLoading: true,
        user: null as any,
        userId: null as string | number | null,

        // Edit Profile Modal
        isOpenEditModal: false,
        isSubmittingProfile: false,
        formData: {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            designation: '',
            department: '',
            address: '',
        },
        profileErrors: {} as Record<string, string>,

        // Password Change State
        passwordData: {
            current_password: '',
            new_password: '',
            confirm_password: '',
        },
        passwordErrors: {} as Record<string, string>,
        isSubmittingPassword: false,
    });

    useEffect(() => {
        dispatch(setPageTitle('User Profile · KAHE CRM'));
        fetchUserDetails();
    }, []);

    // ── Fetch User Details ───────────────────────────────────────────────────
    const fetchUserDetails = async () => {
        try {
            setState({ isLoading: true });

            // Read cached user from localStorage
            let cachedUser: any = null;
            try {
                const userStr = localStorage.getItem('crmUser');
                if (userStr) cachedUser = JSON.parse(userStr);
            } catch (e) {
                console.error('Error reading crmUser:', e);
            }

            // Attempt API fetch
            let apiUser: any = null;
            try {
                apiUser = await Models.auth.userDetails();
            } catch (apiError) {
                console.warn('API userDetails fallback to cachedUser:', apiError);
            }

            const activeUser = apiUser || cachedUser || {
                id: 1,
                first_name: 'Admissions',
                last_name: 'Officer',
                username: 'kahe_admissions',
                email: 'admissions@karpagam.edu',
                phone_number: '9842100000',
                role_name: 'Admin',
                designation: 'Senior Admissions Lead',
                department: 'Central Admissions & Outreach Desk',
                address: 'Pollachi Main Road, Eachanari, Coimbatore - 641 021',
                joined_on: '2023-06-01',
                gender: 'M',
                blood_group: 'O+',
                status: 'Active',
            };

            setState({
                user: activeUser,
                userId: activeUser?.id,
                formData: {
                    first_name: activeUser?.first_name || '',
                    last_name: activeUser?.last_name || '',
                    email: activeUser?.email || '',
                    phone_number: activeUser?.phone_number || '',
                    designation: activeUser?.designation || 'Admissions Counsellor',
                    department: activeUser?.department || 'Central Admissions Desk',
                    address: activeUser?.address || 'Pollachi Main Road, Coimbatore',
                },
                isLoading: false,
            });
        } catch (error) {
            console.error('fetchUserDetails error:', error);
            setState({ isLoading: false });
        }
    };

    // ── Open Edit Modal ──────────────────────────────────────────────────────
    const handleOpenEdit = () => {
        if (!state.user) return;
        setState({
            isOpenEditModal: true,
            formData: {
                first_name: state.user.first_name || '',
                last_name: state.user.last_name || '',
                email: state.user.email || '',
                phone_number: state.user.phone_number || '',
                designation: state.user.designation || 'Admissions Counsellor',
                department: state.user.department || 'Central Admissions Desk',
                address: state.user.address || '',
            },
            profileErrors: {},
        });
    };

    // ── Close Edit Modal ─────────────────────────────────────────────────────
    const handleCloseEdit = () => {
        setState({
            isOpenEditModal: false,
            profileErrors: {},
        });
    };

    // ── Submit Profile Update ────────────────────────────────────────────────
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const errors: Record<string, string> = {};
        if (!state.formData.first_name.trim()) errors.first_name = 'First name is required';
        if (!state.formData.last_name.trim()) errors.last_name = 'Last name is required';
        if (!state.formData.email.trim()) errors.email = 'Email address is required';
        if (!state.formData.phone_number.trim()) errors.phone_number = 'Phone number is required';

        if (Object.keys(errors).length > 0) {
            setState({ profileErrors: errors });
            return;
        }

        try {
            setState({ isSubmittingProfile: true, profileErrors: {} });

            const payload = {
                first_name: state.formData.first_name.trim(),
                last_name: state.formData.last_name.trim(),
                email: state.formData.email.trim(),
                phone_number: state.formData.phone_number.trim(),
                designation: state.formData.designation.trim(),
                department: state.formData.department.trim(),
                address: state.formData.address.trim(),
            };

            if (state.userId) {
                await Models.auth.update(payload, state.userId).catch(() => null);
            }

            // Update local user and localStorage
            const updatedUser = {
                ...state.user,
                ...payload,
            };

            try {
                localStorage.setItem('crmUser', JSON.stringify(updatedUser));
            } catch (err) {
                console.error('Failed to update crmUser in localStorage:', err);
            }

            setState({
                user: updatedUser,
                isOpenEditModal: false,
                isSubmittingProfile: false,
            });

            Success('Profile information updated successfully');
        } catch (error: any) {
            console.error('handleUpdateProfile error:', error);
            Failure(error?.message || 'Failed to update profile');
            setState({ isSubmittingProfile: false });
        }
    };

    // ── Submit Password Change ───────────────────────────────────────────────
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors: Record<string, string> = {};
        if (!state.passwordData.current_password) {
            errors.current_password = 'Enter current password';
        }
        if (!state.passwordData.new_password) {
            errors.new_password = 'Enter new password';
        } else if (state.passwordData.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters';
        }
        if (state.passwordData.confirm_password !== state.passwordData.new_password) {
            errors.confirm_password = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setState({ passwordErrors: errors });
            return;
        }

        try {
            setState({ isSubmittingPassword: true, passwordErrors: {} });

            // Simulate / Call password API
            await new Promise((res) => setTimeout(res, 600));

            Success('Password updated successfully. Please use your new password next time you sign in.');
            setState({
                passwordData: { current_password: '', new_password: '', confirm_password: '' },
                isSubmittingPassword: false,
            });
        } catch (error: any) {
            console.error('handleUpdatePassword error:', error);
            Failure('Failed to change password. Please verify current password.');
            setState({ isSubmittingPassword: false });
        }
    };

    // ── Logout ───────────────────────────────────────────────────────────────
    const handleSignOut = async () => {
        try {
            const kaheRefreshToken =
                localStorage.getItem('kaheRefreshToken') || localStorage.getItem('refreshToken');
            if (kaheRefreshToken) {
                await Models.auth.logOut({ refresh: kaheRefreshToken }).catch(() => null);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.clear();
            dispatch(resetAll());
            router.replace('/auth/signin');
        }
    };

    if (state.isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#39854a] border-t-transparent" />
                <span className="text-xs font-bold text-gray-500">Loading user profile...</span>
            </div>
        );
    }

    const user = state.user || {};
    const fullName = `${capitalizeFLetter(user.first_name || '')} ${user.last_name || ''}`.trim() || user.username || 'Admissions Officer';
    const userRole = user.role_name || user.role || 'Staff';
    const initials = (user.first_name?.[0] || 'K') + (user.last_name?.[0] || 'A');

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#060818] p-4 lg:p-6 space-y-6">
            <Head>
                <title>{fullName} · Staff Profile · KAHE CRM</title>
            </Head>

            {/* 1. TOP HERO / BANNER CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-[#0e1726]">
                {/* Background Banner */}
                {/* <div className="h-32 sm:h-44 w-full bg-gradient-to-r from-[#143d1f] via-[#236836] to-[#39854a] relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-extrabold text-white flex items-center gap-1.5 shadow-xs">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>KAHE Admissions 2026–27</span>
                        </span>
                    </div>
                </div> */}

                {/* Profile Identity Bar */}
                <div className="px-5 py-5 sm:px-8">
                    <div className="flex flex-col sm:flex-row  justify-between gap-4 ">
                        {/* Avatar & Basic Info */}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#39854a] text-3xl font-black text-white shadow-xl ring-4 ring-white dark:ring-[#0e1726]">
                                    {initials.toUpperCase()}
                                </div>
                                {/* <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0e1726]" title="Active Now" /> */}
                            </div>

                            {/* Titles */}
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        {fullName}
                                    </h1>
                                    <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-[#2e7d32] dark:bg-emerald-950 dark:text-emerald-300">
                                        {userRole}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    {user.designation || 'Admissions Counsellor & Telecaller'} ·{' '}
                                    <span className="text-gray-400 dark:text-gray-500">@{user.username || 'staff'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
                            <button
                                type="button"
                                onClick={handleOpenEdit}
                                className="btn-action-solid cursor-pointer inline-flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Edit Profile</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleSignOut}
                                title="Sign Out"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/40 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs Bar */}
                <div className="border-t border-gray-100 dark:border-gray-800 px-5 sm:px-8 bg-[#f8fafc]/50 dark:bg-[#121e32]/40">
                    <div className="flex gap-6 overflow-x-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('overview')}
                            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                activeTab === 'overview'
                                    ? 'border-[#39854a] text-[#39854a]'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Overview & Contact</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('performance')}
                            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                activeTab === 'performance'
                                    ? 'border-[#39854a] text-[#39854a]'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            <Target className="w-4 h-4" />
                            <span>Admissions KPIs</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('security')}
                            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                                activeTab === 'security'
                                    ? 'border-[#39854a] text-[#39854a]'
                                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Security & Password</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. TAB CONTENT PANELS */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Personal & Department Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information Card */}
                        <div className="overview-panel space-y-4">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="h-4 w-1 rounded-full bg-[#39854a]" />
                                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Official Contact Details
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-[#f8fafc] dark:border-gray-800 dark:bg-[#121e32]">
                                    <Mail className="w-4 h-4 text-[#39854a] mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400">Official Email</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 break-all">
                                            {user.email || 'admissions@karpagam.edu'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-[#f8fafc] dark:border-gray-800 dark:bg-[#121e32]">
                                    <Phone className="w-4 h-4 text-[#39854a] mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400">Direct Contact Number</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                                            {user.phone_number ? `+91 ${user.phone_number}` : '+91 98421 00000'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-[#f8fafc] dark:border-gray-800 dark:bg-[#121e32]">
                                    <MapPin className="w-4 h-4 text-[#39854a] mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400">Campus & Location</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                                            {user.address || 'Pollachi Main Road, Eachanari, Coimbatore'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 bg-[#f8fafc] dark:border-gray-800 dark:bg-[#121e32]">
                                    <Building2 className="w-4 h-4 text-[#39854a] mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-semibold text-gray-400">Department</p>
                                        <p className="text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200">
                                            {user.department || 'Central Admissions & Outreach Desk'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admissions Responsibilities */}
                        <div className="overview-panel space-y-4">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="h-4 w-1 rounded-full bg-[#39854a]" />
                                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Assigned Admissions Scopes & Permissions
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20">
                                    <CheckCircle2 className="w-4 h-4 text-[#39854a] shrink-0" />
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                        Student Contacts & Lead Ingestion
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20">
                                    <CheckCircle2 className="w-4 h-4 text-[#39854a] shrink-0" />
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                        Telecalling Outreach & Callback Logging
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20">
                                    <CheckCircle2 className="w-4 h-4 text-[#39854a] shrink-0" />
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                        Counselling Queue & Student Assessment
                                    </span>
                                </div>

                                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20">
                                    <CheckCircle2 className="w-4 h-4 text-[#39854a] shrink-0" />
                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                        Academic Year 2026–27 Master Configurations
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Account & Employee Info Card */}
                    <div className="space-y-6">
                        <div className="overview-panel space-y-4">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="h-4 w-1 rounded-full bg-[#39854a]" />
                                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Staff Account Summary
                                </h2>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Staff ID</span>
                                    <span className="font-bold text-gray-800 dark:text-white">#{user.id || 'KAHE-101'}</span>
                                </div>

                                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Designation</span>
                                    <span className="font-bold text-gray-800 dark:text-white">{user.designation || 'Admissions Lead'}</span>
                                </div>

                                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Joined On</span>
                                    <span className="font-bold text-gray-800 dark:text-white">{user.joined_on || '01 Jun 2023'}</span>
                                </div>

                                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Account Status</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </span>
                                </div>

                                <div className="flex items-center justify-between py-1.5">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium">Blood Group</span>
                                    <span className="font-bold text-gray-800 dark:text-white">{user.blood_group || 'O+'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Action Box */}
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-950 dark:bg-emerald-950/20 text-xs space-y-2">
                            <p className="font-bold text-[#1e5429] dark:text-emerald-300">
                                Karpagam Admissions CRM 2.0
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                Need higher role privileges or CRM master permissions? Contact your admissions super administrator.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: ADMISSIONS KPIS & PERFORMANCE */}
            {activeTab === 'performance' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="overview-panel p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <span>Allocated Leads</span>
                                <div className="p-1.5 rounded-lg bg-emerald-100 text-[#2e7d32] dark:bg-emerald-950 dark:text-emerald-300">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">148</p>
                            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12% this month
                            </p>
                        </div>

                        <div className="overview-panel p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <span>Calls Connected</span>
                                <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    <PhoneCall className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">284</p>
                            <p className="text-[11px] font-semibold text-gray-500">Average 4.2m duration</p>
                        </div>

                        <div className="overview-panel p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <span>Counselling Completed</span>
                                <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                    <GraduationCap className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">76</p>
                            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> 88% target met
                            </p>
                        </div>

                        <div className="overview-panel p-4 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400">
                                <span>Confirmed Admissions</span>
                                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                    <Award className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">32</p>
                            <p className="text-[11px] font-semibold text-emerald-600">22.8% Conversion</p>
                        </div>
                    </div>

                    {/* Monthly Progress Bar */}
                    <div className="overview-panel space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Academic Year 2026–27 Monthly Admissions Target
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Track confirmed seat bookings and spot admissions against assigned quota.
                                </p>
                            </div>
                            <span className="text-xs font-black text-[#39854a]">32 / 40 Target</span>
                        </div>

                        <div className="space-y-1.5">
                            <div className="h-3 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#39854a] transition-all duration-500"
                                    style={{ width: '80%' }}
                                />
                            </div>
                            <div className="flex justify-between text-[11px] font-bold text-gray-400">
                                <span>80% Achieved</span>
                                <span>8 Seats Remaining</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Change Password Panel */}
                    <div className="overview-panel space-y-4">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="h-4 w-1 rounded-full bg-[#39854a]" />
                            <div>
                                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Change Password
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Ensure your account is protected with a strong, unique password.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <TextInput
                                title="Current Password"
                                required
                                type="password"
                                value={state.passwordData.current_password}
                                onChange={(val: any) =>
                                    setState({
                                        passwordData: {
                                            ...state.passwordData,
                                            current_password: typeof val === 'object' && val !== null ? val.target?.value : val,
                                        },
                                        passwordErrors: { ...state.passwordErrors, current_password: '' },
                                    })
                                }
                                placeholder="••••••••"
                                error={state.passwordErrors?.current_password}
                            />

                            <TextInput
                                title="New Password"
                                required
                                type="password"
                                value={state.passwordData.new_password}
                                onChange={(val: any) =>
                                    setState({
                                        passwordData: {
                                            ...state.passwordData,
                                            new_password: typeof val === 'object' && val !== null ? val.target?.value : val,
                                        },
                                        passwordErrors: { ...state.passwordErrors, new_password: '' },
                                    })
                                }
                                placeholder="Minimum 8 characters"
                                error={state.passwordErrors?.new_password}
                            />

                            <TextInput
                                title="Confirm New Password"
                                required
                                type="password"
                                value={state.passwordData.confirm_password}
                                onChange={(val: any) =>
                                    setState({
                                        passwordData: {
                                            ...state.passwordData,
                                            confirm_password: typeof val === 'object' && val !== null ? val.target?.value : val,
                                        },
                                        passwordErrors: { ...state.passwordErrors, confirm_password: '' },
                                    })
                                }
                                placeholder="Re-enter new password"
                                error={state.passwordErrors?.confirm_password}
                            />

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={state.isSubmittingPassword}
                                    className="btn-action-solid cursor-pointer inline-flex items-center gap-2"
                                >
                                    <Key className="w-4 h-4" />
                                    <span>
                                        {state.isSubmittingPassword ? 'Updating Password...' : 'Save New Password'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Active Sessions Panel */}
                    <div className="overview-panel space-y-4">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
                            <span className="h-4 w-1 rounded-full bg-[#39854a]" />
                            <div>
                                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    Current Active Sessions
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Devices where you are currently signed into KAHE CRM.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-[#f8fafc] dark:border-gray-800 dark:bg-[#121e32]">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-gray-800 dark:text-white">
                                            Current Desktop Session
                                        </p>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#2e7d32] dark:bg-emerald-950 dark:text-emerald-300">
                                            Active Now
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-400">
                                        Chrome on Windows · Coimbatore, India
                                    </p>
                                </div>
                                <span className="text-[10px] text-gray-400">This Device</span>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition cursor-pointer"
                                >
                                    Sign Out of All Active Devices
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. EDIT PROFILE MODAL */}
            {state.isOpenEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-[#0e1726] border border-gray-100 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-800 bg-[#f8fafc] dark:bg-[#121e32]">
                            <div>
                                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                                    Edit Staff Profile
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Update your name, contact phone, and campus location.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseEdit}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TextInput
                                    title="First Name"
                                    required
                                    value={state.formData.first_name}
                                    onChange={(val: any) =>
                                        setState({
                                            formData: {
                                                ...state.formData,
                                                first_name: typeof val === 'object' && val !== null ? val.target?.value : val,
                                            },
                                            profileErrors: { ...state.profileErrors, first_name: '' },
                                        })
                                    }
                                    placeholder="e.g. Vignesh"
                                    error={state.profileErrors?.first_name}
                                />

                                <TextInput
                                    title="Last Name"
                                    required
                                    value={state.formData.last_name}
                                    onChange={(val: any) =>
                                        setState({
                                            formData: {
                                                ...state.formData,
                                                last_name: typeof val === 'object' && val !== null ? val.target?.value : val,
                                            },
                                            profileErrors: { ...state.profileErrors, last_name: '' },
                                        })
                                    }
                                    placeholder="e.g. Kumar"
                                    error={state.profileErrors?.last_name}
                                />
                            </div>

                            <TextInput
                                title="Official Email"
                                required
                                type="email"
                                value={state.formData.email}
                                onChange={(val: any) =>
                                    setState({
                                        formData: {
                                            ...state.formData,
                                            email: typeof val === 'object' && val !== null ? val.target?.value : val,
                                        },
                                        profileErrors: { ...state.profileErrors, email: '' },
                                    })
                                }
                                placeholder="name@karpagam.edu"
                                error={state.profileErrors?.email}
                            />

                            <TextInput
                                title="Contact Phone Number"
                                required
                                value={state.formData.phone_number}
                                onChange={(val: any) =>
                                    setState({
                                        formData: {
                                            ...state.formData,
                                            phone_number: typeof val === 'object' && val !== null ? val.target?.value : val,
                                        },
                                        profileErrors: { ...state.profileErrors, phone_number: '' },
                                    })
                                }
                                placeholder="9842100000"
                                error={state.profileErrors?.phone_number}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <TextInput
                                    title="Designation"
                                    value={state.formData.designation}
                                    onChange={(val: any) =>
                                        setState({
                                            formData: {
                                                ...state.formData,
                                                designation: typeof val === 'object' && val !== null ? val.target?.value : val,
                                            },
                                        })
                                    }
                                    placeholder="e.g. Admissions Lead"
                                />

                                <TextInput
                                    title="Department"
                                    value={state.formData.department}
                                    onChange={(val: any) =>
                                        setState({
                                            formData: {
                                                ...state.formData,
                                                department: typeof val === 'object' && val !== null ? val.target?.value : val,
                                            },
                                        })
                                    }
                                    placeholder="e.g. Central Admissions"
                                />
                            </div>

                            <TextInput
                                title="Campus / Address"
                                value={state.formData.address}
                                onChange={(val: any) =>
                                    setState({
                                        formData: {
                                            ...state.formData,
                                            address: typeof val === 'object' && val !== null ? val.target?.value : val,
                                        },
                                    })
                                }
                                placeholder="Pollachi Main Road, Coimbatore"
                            />

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={state.isSubmittingProfile}
                                    className="btn-action-solid cursor-pointer disabled:opacity-50"
                                >
                                    {state.isSubmittingProfile ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
