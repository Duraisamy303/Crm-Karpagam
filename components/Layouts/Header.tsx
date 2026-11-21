import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Menu,
    Search,
    X,
    Sun,
    Moon,
    Bell,
    User,
    LogOut,
    CheckCircle2,
    Clock,
    PhoneCall,
    GraduationCap,
    Users,
} from 'lucide-react';
import { IRootState } from '../../store';
import { toggleTheme, toggleSidebar } from '../../store/themeConfigSlice';
import { resetAll } from '@/store/crmConfigSlice';
import Dropdown from '../Dropdown';
import Models from '@/imports/models.import';
import { capitalizeFLetter } from '@/utils/functions.utils';
import IconMenu from '../Icon/IconMenu';

// =============================================================================
// SAMPLE RECENT NOTIFICATIONS (FALLBACK FOR KAHE ADMISSIONS)
// =============================================================================
interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    type: 'lead' | 'call' | 'admission';
    isUnread: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
    {
        id: 'NOTIF-1',
        title: 'New Student Enquiry',
        description: 'P. Vignesh registered for B.Tech Computer Science & Engineering.',
        time: '15m ago',
        type: 'admission',
        isUnread: true,
    },
    {
        id: 'NOTIF-2',
        title: 'Callback Scheduled',
        description: 'Follow-up call scheduled today at 03:30 PM with Sneha M.',
        time: '1h ago',
        type: 'call',
        isUnread: true,
    },
    {
        id: 'NOTIF-3',
        title: 'Document Verified',
        description: 'Admission stage updated to "Campus Walk-in" for Rajesh K.',
        time: '3h ago',
        type: 'lead',
        isUnread: false,
    },
];

// =============================================================================
// MAIN COMPONENT: Header
// =============================================================================
const Header = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [userRole, setUserRole] = useState<string>('Staff');
    const [searchQuery, setSearchQuery] = useState('');
    const [notifications] = useState<NotificationItem[]>(SAMPLE_NOTIFICATIONS);

    // ── Load Logged-in User Data ─────────────────────────────────────────────
    useEffect(() => {
        try {
            const userString = localStorage.getItem('crmUser');
            const storedRole = localStorage.getItem('role') || localStorage.getItem('crmRole');
            if (userString) {
                const u = JSON.parse(userString);
                setUserInfo(u);
                const r = storedRole || u?.role_name || u?.role || u?.group || 'Staff';
                setUserRole(capitalizeFLetter(String(r)));
            } else if (storedRole) {
                setUserRole(capitalizeFLetter(String(storedRole)));
            }
        } catch (error) {
            console.error('Failed to parse crmUser:', error);
        }
    }, []);

    // ── Handle Global Search ─────────────────────────────────────────────────
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = searchQuery.trim();
        if (!query) return;

        // Navigate to contacts with search query
        router.push(`/contacts/all_contacts?search=${encodeURIComponent(query)}`);
    };

    // ── Handle Logout ────────────────────────────────────────────────────────
    const onLogOut = async () => {
        try {
            const kaheRefreshToken =
                localStorage.getItem('kaheRefreshToken') || localStorage.getItem('refreshToken');
            if (kaheRefreshToken) {
                await Models.auth.logOut({ refresh: kaheRefreshToken }).catch(() => null);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('kaheToken');
            localStorage.removeItem('kaheRefreshToken');
            localStorage.removeItem('crmToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('crmUser');
            localStorage.removeItem('role');
            localStorage.removeItem('crmRole');
            dispatch(resetAll());
            router.replace('/auth/signin');
        }
    };

    // ── User Display Name & Role ─────────────────────────────────────────────
    const fullName = userInfo
        ? `${capitalizeFLetter(userInfo.first_name || '')} ${userInfo.last_name || ''}`.trim() ||
          userInfo.username ||
          'Admissions Staff'
        : 'Admissions Staff';

    const userEmail = userInfo?.email || 'staff@karpagam.edu';
    const initials =
        (userInfo?.first_name?.[0] || 'K') + (userInfo?.last_name?.[0] || 'A');

    const unreadCount = notifications.filter((n) => n.isUnread).length;

    // ── Toggle Theme Mode ────────────────────────────────────────────────────
    const handleToggleTheme = () => {
        const nextTheme = themeConfig.theme === 'dark' ? 'light' : 'dark';
        dispatch(toggleTheme(nextTheme));
    };

    return (
        <header className="sticky top-0 z-30 w-full border-b border-gray-100 bg-white/95 shadow-xs backdrop-blur-md transition-colors duration-150 dark:border-gray-800/80 dark:bg-[#0e1726]/95">
            <div className="flex items-center justify-between px-4 py-2.5 lg:px-6">
                {/* ── LEFT SECTION: TOGGLE & BRAND ─────────────────────────── */}

                <div className="horizontal-logo flex items-center justify-between gap-4 lg:hidden ltr:mr-2 rtl:ml-2">
                    <button
                            type="button"
                            className="collapse-icon h-9 w-9 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 active:scale-95 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer lg:hidden ltr:ml-2 rtl:mr-2"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/kahe-logo.png" alt="logo" style={{
                                height: "40px", width: "150px"
                            }} />
                        </Link>
                        
                    </div>
           
                

                {/* ── RIGHT SECTION: CONTROLS & PROFILE ────────────────────── */}
                <div className="flex items-center gap-2 sm:gap-3 ms-auto">
                    {/* Academic Session Badge (Tablet/Mobile) */}
                    <div className="flex lg:hidden">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-extrabold text-[#2e7d32] dark:bg-emerald-950/60 dark:text-emerald-300">
                            AY 26–27
                        </span>
                    </div>

                    {/* Dark / Light Mode Toggle */}
                    {/* <button
                        type="button"
                        onClick={handleToggleTheme}
                        title={themeConfig.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 shadow-2xs transition hover:bg-gray-50 hover:text-gray-900 active:scale-95 dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                    >
                        {themeConfig.theme === 'dark' ? (
                            <Sun className="h-4 w-4 text-amber-400" />
                        ) : (
                            <Moon className="h-4 w-4 text-gray-600" />
                        )}
                    </button> */}

                    {/* Notifications Dropdown */}
                    <Dropdown
                        offset={[0, 10]}
                        placement="bottom-end"
                        btnClassName="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 shadow-2xs transition hover:bg-gray-50 hover:text-gray-900 active:scale-95 dark:border-gray-800 dark:bg-[#121e32] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer"
                        button={
                            <>
                                <Bell className="h-4 w-4" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#39854a] text-[10px] font-black text-white shadow-xs">
                                        {unreadCount}
                                    </span>
                                )}
                            </>
                        }
                    >
                        <div className="w-80 rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden dark:border-gray-800 dark:bg-[#0e1726] animate-in fade-in zoom-in-95 duration-100">
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-gray-100 bg-[#f8fafc] px-4 py-3 dark:border-gray-800 dark:bg-[#121e32]">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                                        Notifications
                                    </span>
                                    {unreadCount > 0 && (
                                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-[#2e7d32] dark:bg-emerald-950 dark:text-emerald-300">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <span className="text-[11px] font-medium text-gray-400">Activity</span>
                            </div>

                            {/* Notification List */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-800/60 max-h-74 overflow-y-auto">
                                {notifications.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`flex items-start gap-3 p-3.5 transition hover:bg-gray-50 dark:hover:bg-[#121e32]/60 cursor-pointer ${
                                            item.isUnread ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                                        }`}
                                    >
                                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[#2e7d32] dark:bg-emerald-950 dark:text-emerald-300">
                                            {item.type === 'call' ? (
                                                <PhoneCall className="h-3.5 w-3.5" />
                                            ) : item.type === 'admission' ? (
                                                <GraduationCap className="h-3.5 w-3.5" />
                                            ) : (
                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                                                {item.description}
                                            </p>
                                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                                                <Clock className="h-2.5 w-2.5" /> {item.time}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer Link */}
                            {/* <div className="border-t border-gray-100 bg-[#f8fafc] p-2.5 text-center dark:border-gray-800 dark:bg-[#121e32]">
                                <Link
                                    href="/notifications"
                                    className="block text-xs font-bold text-[#39854a] hover:underline"
                                >
                                    View All Notifications →
                                </Link>
                            </div> */}
                        </div>
                    </Dropdown>

                    {/* User Profile Dropdown */}
                    <Dropdown
                        offset={[0, 10]}
                        placement="bottom-end"
                        btnClassName="flex items-center gap-2 rounded-xl p-1 transition hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                        button={
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#39854a] text-xs font-black text-white shadow-xs ring-2 ring-emerald-500/20">
                                    {initials.toUpperCase()}
                                </div>
                                <div className="hidden text-left xl:block">
                                    <p className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                                        {fullName}
                                    </p>
                                    <p className="text-[10px] font-semibold text-[#39854a] leading-tight" suppressHydrationWarning>
                                        {userRole}
                                    </p>
                                </div>
                            </div>
                        }
                    >
                        <div className="w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl dark:border-gray-800 dark:bg-[#0e1726] animate-in fade-in zoom-in-95 duration-100">
                            {/* User Header */}
                            <div className="rounded-xl bg-[#f8fafc] p-3 dark:bg-[#121e32] mb-1">
                                <p className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
                                    {fullName}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {userEmail}
                                </p>
                                <div className="mt-2">
                                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-[#2e7d32] dark:bg-emerald-950 dark:text-emerald-300" suppressHydrationWarning>
                                        {userRole}
                                    </span>
                                </div>
                            </div>

                            {/* Menu Links */}
                            <div className="space-y-0.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                <Link
                                    href="/users/profile"
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                                >
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span>My Profile</span>
                                </Link>

                                {/* {(userRole.toLowerCase() === 'admin' ||
                                    userRole.toLowerCase().includes('admin')) && (
                                    <Link
                                        href="/crm_users"
                                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                                    >
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <span>User Management</span>
                                    </Link>
                                )} */}
                            </div>

                            {/* Divider & Sign Out */}
                            <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={onLogOut}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                                >
                                    <LogOut className="h-4 w-4 text-red-600" />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
};

export default Header;
