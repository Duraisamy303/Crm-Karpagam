import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import OverviewStatCards from '@/components/KAHE/OverviewStatCards';
import AdmissionsContactsTable from '@/components/KAHE/AdmissionsContactsTable';
import TodayActionItems from '@/components/KAHE/TodayActionItems';
import TelecallerTeamActivity from '@/components/KAHE/TelecallerTeamActivity';
import RecentActivity from '@/components/KAHE/RecentActivity';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Target, CloudUpload, UserPlus, UserCheck, Phone, HandHeart } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { capitalizeFLetter, getDate } from '@/utils/functions.utils';
import Models from '@/imports/models.import';
import moment from 'moment';
import IconEye from '@/components/Icon/IconEye';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import Modal from '@/common_component/modal';
import TaskCard from '@/components/TaskCard';
import IconSearch from '@/components/Icon/IconSearch';
import CustomeDatePicker from '@/common_component/datePicker';
import useDebounce from '@/common_component/useDebounce';
import { Text } from '@mantine/core';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });



export default function DashboardCustomTabs() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('summary');
    const [isMount, setIsMount] = useState(false);
    const [selectedStatCard, setSelectedStatCard] = useState<string | null>(null);

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    // Initialize state properly
    const [state, setState] = useState({
        page: 1,
        currentPage: 1,
        isOpenTaskView: false,
        loading: false,
        viewLoad: false,
        search: '',
        from_date: null,
        to_date: null,
        userId: null,
        taskList: [],
        count: 0,
        next: null,
        previous: null,
        taskDetails: null,
        conversationList: [],
        popupHeight: '500px',
        salesByCategory: null,
        leadFunnelData: null,
        leadSourceData: null,
        monthlyLeadsTrend: null,
        dashboardData: null,
        counts: {
            total_contacts: 0,
            total_leads: 0,
            total_appointments: 0,
            total_tasks: 0,
            this_month_total_contacts: 0,
            this_month_total_leads: 0,
            this_month_total_appointments: 0,
            this_month_total_tasks: 0,
        },
        taskStats: {
            total_tasks: 0,
            completed_tasks: 0,
            pending_tasks: 0,
            overdue_tasks: 0,
            upcoming_tasks: 0,
        },
    });

    // Safe state update function
    const updateState = (newState) => {
        setState((prevState) => ({
            ...prevState,
            ...newState,
        }));
    };

    useEffect(() => {
        taskList(1);
        setIsMount(true);
    }, []);

    const taskList = async (page: number) => {
        try {
            updateState({ loading: true });
            const body = bodyData();
            const res: any = await Models.task.list(body, page);
            updateState({
                loading: false,
                taskList: Array.isArray(res?.results) ? res.results : [],
                count: res?.count || 0,
                currentPage: page,
            });
        } catch (error) {
            updateState({ loading: false });
            console.log('error: ', error);
        }
    };



    const debouncedSearch = useDebounce(state.search, 1000);

    useEffect(() => {
        taskList(state.currentPage);
    }, [debouncedSearch, state.from_date, state.to_date, state.userId]);

    const bodyData = () => {
        let body: any = {};

        const userString = localStorage.getItem('crmUser');
        const user = userString ? JSON.parse(userString) : null;

        if (user) {
            body.userId = user?.id;
        }

        if (state.search) {
            body.search = debouncedSearch;
        }
        if (state.from_date) {
            body.task_date_time_after = moment(state.from_date).format('YYYY-MM-DD');
        }
        if (state.to_date) {
            body.task_date_time_before = moment(state.to_date).format('YYYY-MM-DD');
        }

        return body;
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 bg-[#f7faf8]">

            <div className="overview-panel">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="page-title">
                            Central Admissions Overview
                        </div>
                        <p className="page-subtitle">
                            Academic Year 2026–27 · Karpagam Group of Institutions
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/contacts/bulk_import')}
                            className="btn-action-outline font-semibold"
                        >
                            <CloudUpload className="h-4 w-4 text-[#39854a]" />
                            <span className="font-bold">Import Contacts</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/contacts/assign_contact')}
                            className="btn-action-solid font-semibold"
                        >
                            <UserPlus className="h-4 w-4 text-white" />
                            <span className="font-bold">Assign Contacts</span>
                        </button>
                    </div>
                </div>

                {/* 4 Overview Stat Cards Component (Set count=4 or count=3 as needed) */}
                <OverviewStatCards
                    count={4}
                    selectedCard={selectedStatCard}
                    onCardClick={(card) => {
                        setSelectedStatCard((prev) => (prev === card.id ? null : (card.id as string)));
                    }}
                    cards={[
                        {
                            id: 'total_contacts',
                            title: 'Total Contacts',
                            value: state.counts?.total_contacts > 0 ? state.counts.total_contacts : 23,
                            subtitle: '4 unassigned contacts',
                            icon: <Users className="h-5 w-5 text-[#39854a]" />,
                        },
                        {
                            id: 'assigned',
                            title: 'Assigned',
                            value: 19,
                            subtitle: '83% allocation rate',
                            icon: <UserCheck className="h-5 w-5 text-[#39854a]" />,
                        },
                        {
                            id: 'follow_ups',
                            title: 'Follow-ups',
                            value: state.taskStats?.pending_tasks > 0 ? state.taskStats.pending_tasks : 11,
                            subtitle: '3 requiring immediate attention',
                            icon: <Phone className="h-5 w-5 text-[#39854a]" />,
                        },
                        {
                            id: 'interested',
                            title: 'Interested',
                            value: state.counts?.total_leads > 0 ? state.counts.total_leads : 17,
                            subtitle: 'Qualified candidates in pipeline',
                            icon: <HandHeart className="h-5 w-5 text-[#39854a]" />,
                        },
                    ]}
                />
            </div>

            {/* ============================================================== */}
            {/* ADMISSIONS CONTACTS TABLE SECTION (When Stat Card is Clicked) */}
            {/* ============================================================== */}
            {selectedStatCard && (
                <div className="transition-all duration-300">
                    <AdmissionsContactsTable
                        activeCategory={selectedStatCard}
                        categoryTitle={
                            selectedStatCard === 'total_contacts'
                                ? 'Total Contacts'
                                : selectedStatCard === 'assigned'
                                    ? 'Assigned Contacts'
                                    : selectedStatCard === 'follow_ups'
                                        ? 'Follow-up Contacts'
                                        : selectedStatCard === 'interested'
                                            ? 'Interested Candidates'
                                            : 'Contacts'
                        }
                        onResetCategory={() => setSelectedStatCard('total_contacts')}
                        onClose={() => setSelectedStatCard(null)}
                    />
                </div>
            )}

            {/* ============================================================== */}
            {/* TODAY'S WORK & ACTION ITEMS SECTION */}
            {/* ============================================================== */}
            <TodayActionItems />

            {/* ============================================================== */}
            {/* TELECALLER TEAM ACTIVITY & RECENT ACTIVITY SECTION */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                <div className="flex flex-col lg:col-span-7">
                    <TelecallerTeamActivity
                        className="h-[380px]"
                        title="Telecaller Team Activity"
                        manageStaffText="Manage Staff →"
                        staffList={[
                            {
                                id: '1',
                                name: 'P. Malathi',
                                avatarLetter: 'P',
                                assignedCount: 5,
                                callsTodayCount: 8,
                                status: 'Active',
                            },
                            {
                                id: '2',
                                name: 'S. Ramesh Kumar',
                                avatarLetter: 'S',
                                assignedCount: 9,
                                callsTodayCount: 5,
                                status: 'Active',
                            },
                            {
                                id: '3',
                                name: 'K. Kavitha',
                                avatarLetter: 'K',
                                assignedCount: 5,
                                callsTodayCount: 4,
                                status: 'Active',
                            },
                        ]}
                        footerNote="Workload is monitored for equal distribution"
                        footerActionText="Rebalance Workload"
                    />
                </div>
                <div className="flex flex-col lg:col-span-5">
                    <RecentActivity
                        className="h-[380px]"
                        title="Recent Activity"
                        subtitle="Live audit log"
                        activities={[
                            {
                                id: '1',
                                title: 'Bulk Imported',
                                time: '06:07',
                                targetName: 'M. Naveen Kumar',
                                performedBy: 'Prof. R. Natarajan',
                            },
                            {
                                id: '2',
                                title: 'Bulk Imported',
                                time: '06:07',
                                targetName: 'G. Gokulraj',
                                performedBy: 'Prof. R. Natarajan',
                            },
                            {
                                id: '3',
                                title: 'Morning Call Attempt',
                                time: '11:00',
                                targetName: 'G. Harini',
                                performedBy: 'P. Malathi',
                            },
                            {
                                id: '4',
                                title: 'Enquiry Added via Bulk Import',
                                time: '10:30',
                                targetName: 'G. Arvind',
                                performedBy: 'Admin',
                            },
                            {
                                id: '5',
                                title: 'Morning Call Attempt',
                                time: '10:15',
                                targetName: 'A. Dinesh',
                                performedBy: 'P. Malathi',
                            },
                        ]}
                    />
                </div>
            </div>







            <Modal
                open={state.isOpenTaskView}
                addHeader={'Task Details'}
                close={() => updateState({ isOpenTaskView: false, taskDetails: null })}
                renderComponent={() => <TaskCard task={state.taskDetails} conversationList={state.conversationList} btn={false} />}
            />
        </div>
    );
}


