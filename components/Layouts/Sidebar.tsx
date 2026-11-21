import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import IconCaretsDown from '@/components/Icon/IconCaretsDown';
import IconCaretDown from '@/components/Icon/IconCaretDown';
import IconMenuCalendar from '@/components/Icon/Menu/IconMenuCalendar';
import IconMenuUsers from '@/components/Icon/Menu/IconMenuUsers';
import IconMenuContacts from '@/components/Icon/Menu/IconMenuContacts';
import IconMenuCharts from '@/components/Icon/Menu/IconMenuCharts';
import IconMenuWidgets from '@/components/Icon/Menu/IconMenuWidgets';
import IconPhoneCall from '@/components/Icon/IconPhoneCall';
import IconLayoutGrid from '@/components/Icon/IconLayoutGrid';
import IconPhone from '@/components/Icon/IconPhone';
import IconClock from '@/components/Icon/IconClock';
import IconListCheck from '@/components/Icon/IconListCheck';
import IconUsers from '@/components/Icon/IconUsers';
import IconLeads from '../Icon/IconLead';
import Models from '@/imports/models.import';
import { ROLE, ROLES, TASK_TYPE } from '@/utils/constant.utils';
import SideMenu from '@/common_component/sideMenu';
import { Validation } from '@/utils/imports.utils';
import moment from 'moment';
import * as Yup from 'yup';
import CustomSelect from '../Select';
import TextArea from '../TextArea';
import CustomeDatePicker from '@/common_component/datePicker';
import IconUser from '../Icon/IconUser';
import { capitalizeFLetter, Dropdown, Success, useSetState } from '@/utils/functions.utils';
import { useTranslation } from 'react-i18next';
import IconMenuChat from '../Icon/Menu/IconMenuChat';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconNotes from '@/components/Icon/IconNotes';
const Sidebar = () => {
    const router = useRouter();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [role, setRole] = useState('');
    const [currentRole, setCurrentRole] = useState<string>('admin');
    const [isMounted, setIsMounted] = useState(false);
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    const effectiveRole = isMounted ? (currentRole || role || 'admin').toLowerCase() : 'admin';

    // Counsellor menu:
    // If logged-in role is 'counsellor', or if an admin is inspecting counsellor routes
    const isCounsellor =
        effectiveRole === 'counsellor' ||
        (effectiveRole === 'admin' && router.pathname.startsWith('/counsellor'));

    // Telecaller menu:
    // If not counsellor, and logged-in role is 'telecaller', or if an admin is inspecting telecaller routes
    const isTelecaller =
        !isCounsellor &&
        (effectiveRole === 'telecaller' ||
            (effectiveRole === 'admin' && router.pathname.startsWith('/telecaller')));

    const isAdmin = !isCounsellor && !isTelecaller;

    const [state, setState] = useSetState({
        currentLeadPage: 1,
        assignList: [],
        assignRole: null,
    });

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        if (router.pathname.startsWith('/masters')) {
            setCurrentMenu('masters_management');
        } else if (router.pathname.startsWith('/contacts')) {
            setCurrentMenu('Calendars');
        }
        getUserDetails();
        leadList();
    }, [router.pathname]);

    const leadList = async (page = 1) => {
        try {
            setState({ LeadMoreloading: true });
            const userString = localStorage.getItem('crmUser');
            const user = userString ? JSON.parse(userString) : null;
            if (!user?.id) {
                setState({ LeadMoreloading: false });
                return;
            }

            const body = {
                userId: user?.id,
            };
            const res: any = await Models.lead.list(body, page, null);
            const dropdown = res?.results?.map((item) => ({
                value: item.college_contact?.id,
                label: `${capitalizeFLetter(item.college_contact?.student_name)} (${item.college_contact?.phone_number})`,
            }));

            setState({ LeadMoreloading: false, leadList: dropdown, count: res?.count, leadnext: res?.next, previous: res?.previous, currentPage: page });
        } catch (error) {
            setState({ LeadMoreloading: false });
            console.log('error: ', error);
        }
    };

    const leadListLoadMore = async () => {
        try {
            setState({ LeadMoreloading: true });
            const userString = localStorage.getItem('crmUser');
            const user = userString ? JSON.parse(userString) : null;
            if (!user?.id) {
                setState({ LeadMoreloading: false });
                return;
            }

            const body = {
                userId: user?.id,
            };
            const res: any = await Models.lead.list(body, state.currentPage + 1, null);
            const dropdown = res?.results?.map((item) => ({
                value: item.college_contact?.id,
                label: `${capitalizeFLetter(item.college_contact?.student_name)} (${item.college_contact?.phone_number})`,
            }));
            setState({ LeadMoreloading: false, leadList: [...state.leadList, ...dropdown], count: res?.count, leadnext: res?.next, previous: res?.previous, currentPage: state.currentPage + 1 });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const usersList = async (e) => {
        try {
            setState({ assignRole: e, assigned_to: null });
            setState({ leadStatusloadMore: true });
            let body: any = {};
            if (e?.label == ROLE.ADMIN) {
                body.show_admins_only = 'Yes';
            } else {
                body.exclude_admin = 'Yes';
            }

            const res: any = await Models.user.includeAdminuserList(1, body);
            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({ usersList: dropdownList, leadStatusloadMore: false, userPage: 1, userHasNext: res?.next });
        } catch (error) {
            setState({ leadStatusloadMore: false });
            console.log('error: ', error);
        }
    };

    const usersListLoadMore = async () => {
        try {
            setState({ leadStatusloadMore: true });
            let body: any = {};
            if (state.assignRole?.label == ROLE.ADMIN) {
                body.show_admins_only = 'Yes';
            } else {
                body.exclude_admin = 'Yes';
            }

            const res: any = await Models.user.includeAdminuserList(1, body);

            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({
                usersList: [...state.usersList, ...dropdownList],
                leadStatusloadMore: false,
                userPage: state.userPage + 1,
                userHasNext: res.next,
            });
        } catch (error) {
            setState({ leadStatusloadMore: false });
            console.log('error: ', error);
        }
    };

    const getUserDetails = async () => {
        try {
            const userString = localStorage.getItem('crmUser');
            const token = localStorage.getItem('kaheToken') || localStorage.getItem('crmToken');
            const user = userString ? JSON.parse(userString) : null;
            const storedRole = (
                localStorage.getItem('role') ||
                localStorage.getItem('crmRole') ||
                user?.role ||
                user?.group ||
                'admin'
            ).toLowerCase();
            setCurrentRole(storedRole);
            setRole(storedRole);
            if (user) {
                setState({ userData: user, token, userId: user?.id, role: user?.designation });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const clearTaskData = () => {
        setState({
            isOpenTask: false,
            errors: '',
            lead: '',
            contact: '',
            task_date_time: '',
            remark: '',
            task_type: '',
            assigned_to: '',
            assignRole: null,
        });
    };

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const taskList = async () => {
        const res: any = await Models.task.list({}, 1);
        try {
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const createAndUpdateTask = async () => {
        try {
            setState({ taskLoading: true });

            const validateField = {
                lead: state.lead?.value,
                task_type: state.task_type?.value,
                assigned_to: state.assigned_to,
                task_date_time: state.task_date_time,
                remark: state?.remark,
                // assignRole: state.assignRole?.value,
            };
            await Validation.createTask.validate(validateField, {
                abortEarly: false,
            });

            const body: any = {
                contact: state.lead?.value,
                task_type: state.task_type?.value,
                assigned_to: state.assigned_to?.map((item) => item.value),
                remark: state.remark,
            };
            if (state.task_date_time) {
                body.task_date_time = moment(state.task_date_time).format('YYYY-MM-DD HH:mm:ss');
            }

            const res: any = await Models.task.create(body);
            clearTaskData();
            setState({ taskLoading: false });
            Success('Task created successfully');
            taskList();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message; // Set the error message for each field
                });
                setState({ errors: validationErrors, taskLoading: false });
            } else {
                setState({ taskLoading: false });
            }
        }
    };

    const getContactList = async (val) => {
        try {
            setState({ contactLoading: true });
            const res: any = await Models.contact.listByLeadId(val.value);
            const dropdown = Dropdown(res.results, 'name');
            setState({
                contactList: dropdown,
                contactCount: res?.count,
                contactNext: res.next,
                contactLoading: false,
            });
        } catch (error) {
            setState({ contactLoading: false });

            console.log('error: ', error);
        }
    };

    const assignList = async () => {
        try {
            const res: any = await Models.task.assigned_to();
            const dropdownList = Dropdown(res?.results, 'full_name');
            setState({ assignList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/kahe-logo.png" alt="logo" height={400} width={400} style={{ height: '45px', width: '170px' }} />
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 dark:text-white-light dark:hover:bg-dark-light/10 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold" suppressHydrationWarning>
                            {isCounsellor ? (
                                // =========================================================================
                                // COUNSELLOR ROLE SIDEBAR (Matching User Request)
                                // 1. Dashboard
                                // 2. Counselling Queue
                                // 3. Student Profile
                                // 4. Admission Analytics
                                // =========================================================================
                                <li className="nav-item">
                                    <div className="px-3.5 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        {t('Senior Counselling')}
                                    </div>
                                    <ul className="space-y-1.5">
                                        {/* 1. Dashboard */}
                                        <li className="nav-item">
                                            <Link
                                                href="/counsellor/dashboard"
                                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${router.pathname === '/counsellor/dashboard'
                                                    ? '!bg-[#39854a] !text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconLayoutGrid
                                                        className={`w-5 h-5 shrink-0 ${router.pathname === '/counsellor/dashboard'
                                                            ? '!text-white'
                                                            : 'text-gray-500 group-hover:text-[#39854a]'
                                                            }`}
                                                    />
                                                    <span>{t('Dashboard')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* 2. Counselling Queue */}
                                        <li className="nav-item">
                                            <Link
                                                href="/counsellor/queue"
                                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${router.pathname === '/counsellor/queue'
                                                    ? '!bg-[#39854a] !text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconNotes
                                                        className={`w-5 h-5 shrink-0 ${router.pathname === '/counsellor/queue'
                                                            ? '!text-white'
                                                            : 'text-gray-500 group-hover:text-[#39854a]'
                                                            }`}
                                                    />
                                                    <span>{t('Counselling Queue')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* 3. Student Profile */}
                                        <li className="nav-item">
                                            <Link
                                                href="/contacts/my_contacts"
                                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${router.pathname === '/counsellor/student_profiles'
                                                    ? '!bg-[#39854a] !text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconUsers
                                                        className={`w-5 h-5 shrink-0 ${router.pathname === '/contacts/my_contacts'
                                                            ? '!text-white'
                                                            : 'text-gray-500 group-hover:text-[#39854a]'
                                                            }`}
                                                    />
                                                    <span>{t('My Contacts')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* 4. Admission Analytics */}
                                        <li className="nav-item">
                                            <Link
                                                href="/counsellor/analytics"
                                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${router.pathname === '/counsellor/analytics'
                                                    ? '!bg-[#39854a] !text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconMenuCharts
                                                        className={`w-5 h-5 shrink-0 ${router.pathname === '/counsellor/analytics'
                                                            ? '!text-white'
                                                            : 'text-gray-500 group-hover:text-[#39854a]'
                                                            }`}
                                                    />
                                                    <span>{t('Admission Analytics')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* Admin return switch */}
                                        {effectiveRole === 'admin' && (
                                            <li className="nav-item pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                                <Link
                                                    href="/own_dashboard"
                                                    className="group flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-[#39854a]"
                                                >
                                                    <IconMenuDashboard className="w-4 h-4 shrink-0" />
                                                    <span>{t('← Switch to Admin Console')}</span>
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </li>
                            ) : isTelecaller ? (
                                // =========================================================================
                                // TELECALLER ROLE SIDEBAR (Matching Image 7)
                                // =========================================================================
                                <li className="nav-item">
                                    <div className="px-3.5 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        {t('Telecalling Desk')}
                                    </div>
                                    <ul className="space-y-1.5">
                                        {/* 1. Telecaller Dashboard */}
                                        <li className="nav-item">
                                            <Link
                                                href="/telecaller/dashboard"
                                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${router.pathname === '/telecaller/dashboard'
                                                    ? '!bg-[#39854a] !text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconLayoutGrid
                                                        className={`w-5 h-5 shrink-0 ${router.pathname === '/telecaller/dashboard'
                                                            ? '!text-white'
                                                            : 'text-gray-500 group-hover:text-[#39854a]'
                                                            }`}
                                                    />
                                                    <span>{t('Telecaller Dashboard')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* 2. My Contacts */}
                                        <li className="nav-item">
                                            <Link
                                                href="/contacts/my_contacts"
                                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${router.pathname === '/telecaller/contacts'
                                                    ? '!bg-[#39854a] !text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconPhone
                                                        className={`w-5 h-5 shrink-0 ${router.pathname === '/contacts/my_contacts'
                                                            ? '!text-white'
                                                            : 'text-gray-500 group-hover:text-[#39854a]'
                                                            }`}
                                                    />
                                                    <span>{t('My Contacts')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* 3. Follow-ups & Calls */}
                                        <li className="nav-item">
                                            <Link
                                                href="/telecaller/follow_ups"
                                                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition ${router.pathname === '/telecaller/follow_ups'
                                                    ? '!bg-[#39854a] !text-white shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <IconClock
                                                        className={`w-5 h-5 shrink-0 ${router.pathname === '/telecaller/follow_ups'
                                                            ? '!text-white'
                                                            : 'text-gray-500 group-hover:text-[#39854a]'
                                                            }`}
                                                    />
                                                    <span>{t('Follow-ups & Calls')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* Admin return switch */}
                                        {effectiveRole === 'admin' && (
                                            <li className="nav-item pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                                <Link
                                                    href="/own_dashboard"
                                                    className="group flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-gray-500 hover:text-[#39854a]"
                                                >
                                                    <IconMenuDashboard className="w-4 h-4 shrink-0" />
                                                    <span>{t('← Switch to Admin Console')}</span>
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </li>
                            ) : (
                                // =========================================================================
                                // ADMIN / MANAGEMENT SIDEBAR
                                // =========================================================================
                                <li className="nav-item">
                                    <ul>
                                        <li className="nav-item">
                                            <Link href="/own_dashboard" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuDashboard className="shrink-0 group-hover:!text-[#39854a] group-[.active]:!text-white" />
                                                    <span className="text-black group-hover:!text-[#39854a] group-[.active]:!text-white dark:text-[#506690] dark:group-hover:!text-[#39854a] ltr:pl-3 rtl:pr-3">{t('Dashboard')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'Calendars' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('Calendars');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <IconMenuContacts className="shrink-0 group-hover:!text-[#39854a] group-[.active]:!text-[#39854a]" />
                                                    <span className="text-black group-hover:!text-[#39854a] group-[.active]:!text-[#39854a] dark:text-[#506690] dark:group-hover:!text-[#39854a] ltr:pl-3 rtl:pr-3">{t('Contacts')}</span>
                                                </div>

                                                <div className={`${currentMenu !== 'Calendars' ? '-rotate-90 rtl:rotate-90' : ''} group-hover:!text-[#39854a] group-[.active]:!text-[#39854a]`}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'Calendars' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/contacts/all_contacts">{t('All Contacts')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/contacts/my_contacts">{t('My Contacts')}</Link>
                                                    </li>

                                                    <li>
                                                        <Link href="/contacts/assign_contact">  {t('Assign Contacts')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/contacts/bulk_import">{t('Bulk Import')}</Link>
                                                    </li>

                                                </ul>
                                            </AnimateHeight>
                                        </li>
                                        <li className="nav-item">
                                            <Link href="/crm_users" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuUsers className="shrink-0 group-hover:!text-[#39854a] group-[.active]:!text-white" />
                                                    <span className="text-black group-hover:!text-[#39854a] group-[.active]:!text-white dark:text-[#506690] dark:group-hover:!text-[#39854a] ltr:pl-3 rtl:pr-3">{t('CRM Users')}</span>
                                                </div>
                                            </Link>
                                        </li>
                                        {/* Telecaller Desk Quick Access for Admin */}
                                        <li className="nav-item">
                                            <Link href="/admin/telecaller/follow_ups" className="group">
                                                <div className="flex items-center">
                                                    <IconPhoneCall className="shrink-0 group-hover:!text-[#39854a] group-[.active]:!text-white" />
                                                    <span className="text-black group-hover:!text-[#39854a] group-[.active]:!text-white dark:text-[#506690] dark:group-hover:!text-[#39854a] ltr:pl-3 rtl:pr-3">{t('Telecaller Desk')}</span>
                                                </div>
                                            </Link>
                                        </li>

                                        {/* Counsellor Desk Quick Access for Admin */}
                                        <li className="nav-item">
                                            <Link href="/admin/counsellor/queue" className="group">
                                                <div className="flex items-center">
                                                    <IconNotes className="shrink-0 group-hover:!text-[#39854a] group-[.active]:!text-white" />
                                                    <span className="text-black group-hover:!text-[#39854a] group-[.active]:!text-white dark:text-[#506690] dark:group-hover:!text-[#39854a] ltr:pl-3 rtl:pr-3">{t('Counsellor Desk')}</span>
                                                </div>
                                            </Link>
                                        </li>
                                        {/* <li className="nav-item">
                                            <Link href="/own_dashboard" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuCharts className="shrink-0 group-hover:!text-[#39854a] group-[.active]:!text-white" />
                                                    <span className="text-black group-hover:!text-[#39854a] group-[.active]:!text-white dark:text-[#506690] dark:group-hover:!text-[#39854a] ltr:pl-3 rtl:pr-3">{t('Reports & Analytics')}</span>
                                                </div>
                                            </Link>
                                        </li> */}
                                        <li className="menu nav-item">
                                            <button
                                                type="button"
                                                className={`${currentMenu === 'masters_management' ? 'active' : ''} nav-link group w-full`}
                                                onClick={() => {
                                                    toggleMenu('masters_management');
                                                }}
                                            >
                                                <div className="flex items-center">
                                                    <IconMenuWidgets className="shrink-0 group-hover:!text-[#39854a] group-[.active]:!text-[#39854a]" />
                                                    <span className="text-black group-hover:!text-[#39854a] group-[.active]:!text-[#39854a] dark:text-[#506690] dark:group-hover:!text-[#39854a] ltr:pl-3 rtl:pr-3">{t('Masters Management')}</span>
                                                </div>

                                                <div className={`${currentMenu !== 'masters_management' ? '-rotate-90 rtl:rotate-90' : ''} group-hover:!text-[#39854a] group-[.active]:!text-[#39854a]`}>
                                                    <IconCaretDown />
                                                </div>
                                            </button>

                                            <AnimateHeight duration={300} height={currentMenu === 'masters_management' ? 'auto' : 0}>
                                                <ul className="sub-menu text-gray-500">
                                                    <li>
                                                        <Link href="/masters/admission_stage">{t('Admission Stage')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/masters/institutions">{t('Institutions / Colleges')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/masters/courses">{t('Courses & Degrees')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/masters/academic_years">{t('Academic Years')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/masters/whatsapp_templates">{t('Whatsapp Templates')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/masters/qualifications">{t('Qualifications')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/masters/call_outcomes">{t('Call Outcomes')}</Link>
                                                    </li>
                                                    <li>
                                                        <Link href="/masters/reference_types">{t('Reference Types')}</Link>
                                                    </li>
                                                </ul>
                                            </AnimateHeight>
                                        </li>

                                        
                                    </ul>
                                </li>
                            )}


                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>

            <SideMenu
                title="Create Task"
                open={state.isOpenTask}
                close={() => clearTaskData()}
                cancelOnClick={() => clearTaskData()}
                submitOnClick={() => createAndUpdateTask()}
                submitLoading={state.loading}
                canceTitle="Reset"
                renderComponent={() => (
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-5 ">
                            <CustomSelect
                                title="Lead "
                                value={state.lead}
                                onChange={(e) => {
                                    setState({ lead: e, contact: '' });
                                }}
                                placeholder={'Lead '}
                                options={state.leadList}
                                error={state.errors?.lead}
                                required
                                loading={state.LeadMoreloading}
                                loadMore={() => state.leadnext && leadListLoadMore()}
                            />
                            {/* {state.contactLoading?
                            
                        
                        } */}
                            {/* <CustomSelect
                                title="Contact"
                                value={state.contact}
                                onChange={(e) => setState({ contact: e })}
                                placeholder={'Contact '}
                                options={state.contactList}
                                error={state.errors?.contact}
                                required
                                loading={state.contactLoading}
                            /> */}
                        </div>

                        <CustomeDatePicker
                            value={state.task_date_time}
                            placeholder="Task Date"
                            title="Task Date"
                            onChange={(e) => setState({ task_date_time: e })}
                            error={state.errors?.task_date_time}
                            required
                        />
                        <CustomSelect
                            title="Task Type"
                            value={state.task_type}
                            onChange={(e) => setState({ task_type: e })}
                            placeholder={'Task Type'}
                            options={TASK_TYPE}
                            error={state.errors?.task_type}
                            required
                        />

                        <CustomSelect
                            value={state.assignRole}
                            onChange={(e) => {
                                usersList(e);
                            }}
                            placeholder={'Choose Role'}
                            title={'Choose Role'}
                            options={[
                                { value: 'admin', label: 'Admin' },
                                { value: 'staff', label: 'Staff' },
                            ]}
                            error={state.errors?.assignRole}
                        />
                        <CustomSelect
                            title="Assign To"
                            value={state.assigned_to}
                            onChange={(e) => setState({ assigned_to: e })}
                            placeholder={'Assign To'}
                            options={state.usersList}
                            error={state.errors?.assigned_to}
                            isMulti={true}
                            loadMore={() => state.userHasNext && usersListLoadMore()}
                            loading={state.loading || state.leadStatusloadMore}
                        />

                        <TextArea height="150px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} error={state.errors?.remark} required />
                    </div>
                )}
            />
        </div>
    );
};

export default Sidebar;
