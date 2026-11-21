import IconBitcoin from '@/components/Icon/IconBitcoin';
import { Card, SimpleGrid, Text, Title } from '@mantine/core';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

import { Models, PrivateRouter } from '@/utils/imports.utils';
import { Dropdown, formatMonthYear, getColorScheme, getColorTargetScheme, getDateRange, pageCounts, useSetState } from '@/utils/functions.utils';
import { ROLE } from '@/utils/constant.utils';
import AdminDashboard from '@/components/DashboardCard';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import Tippy from '@tippyjs/react';
import { DataTable } from 'mantine-datatable';
import IconX from '@/components/Icon/IconX';
import CustomSelect from '@/components/Select';
import IconSearch from '@/components/Icon/IconSearch';
import UserTargetCard from '@/components/UserTargetCard';
import moment from 'moment';
import useDebounce from '@/common_component/useDebounce';
import { useRouter } from 'next/router';
import MonthlyTargetSlider from '@/components/MonthlyTargetSlider';
import Pagination from '@/components/Pagination';

const UserTargetYear = () => {
    const router = useRouter();
    const { type, user_id } = router.query;

    const [selectedCard, setSelectedCard] = useState(null);
    const [selectedCardDate, setSelectedCardDate] = useState(null);
    const [selectedUserCard, setSelectedUserCard] = useState(null);
    const [selectedUserCardDate, setSelectedUserCardDate] = useState(null);

    const [state, setState] = useSetState({
        state: [],
        activeTab: '',
        loading: false,
        chartData: {},
        role: '',
        currentPage: 1,
        totalRecords: 0,
        next: null,
        previous: null,
        search: '',
        statusList: [],
        allData: null,
        selectedRow: {},
        bdmList: [],
        cardData: [],
        chartLoading: false,
        sourceList: [],
        assignList: [],
        expandedRow: null,
        coloumns: [],
        group: '',
        leadList: [],
        userCardData: [],
        bdm: null,
        filterMonth: null,
        // data:
    });

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        if (user_id) {
            getRole();
        }
    }, [type, user_id]);


    useEffect(() => {
        // getRole();
      
    }, []);

    // useEffect(() => {
    //     if (state.tm?.value || state.bde?.value || state.bdm?.value || state.dm?.value) {
    //         userCardData();
    //     } else {
    //         setState({ userCardData: [] });
    //     }
    // }, [state.tm, state.dm, state.bde, state.bdm]);

    useEffect(() => {
        if (state.userId) {
            setState({ currentPage: 1 });
            leadList(1);
        }
    }, [
        state.assigned_to,
        state.lead_source,
        state.opportunity,
        state.lead_status,
        state.role,
        state.bdm,
        state.bde,
        state.dm,
        state.tm,
        state?.today,
        state?.month,
        state.filterMonth,
        debouncedSearch,
    ]);

    const getRole = async () => {
        try {
            const res: any = await Models.auth.userById(user_id);
            let designation = res?.groups?.name;
            setState({ role: designation, userId: res?.id, name: res?.full_name });

            // const res: any = await Models.auth.userDetails();
            // setState({ role: res?.designation, userId: res?.id, name: res?.full_name });
            let role: any = null;

            if (res?.designation == ROLE.ADMIN || res?.designation == ROLE.BDM) {
                const body: any = {
                    year_type: type,
                    summary: true,
                    // team: res?.designation == ROLE.BDM ? 'Yes' : null,
                };
                if (user_id) {
                    body.user_id = user_id;
                }
                if (user_id || type) {
                    adminCardData(body);
                }

                // setState({ bdm: { value: 10, label: `Manikandan G` } });
                // role = {
                //     bdm: 10,
                // };
            } else if (res?.designation != ROLE.BDM) {
                if (res?.designation == ROLE.BDE) {
                    setState({ bde: { value: res?.id, label: `${res?.first_name} ${res?.last_name}` } });
                    role = {
                        bde: res?.id,
                    };
                }

                if (res?.designation == ROLE.TM) {
                    setState({ tm: { value: res?.id, label: `${res?.first_name} ${res?.last_name}` } });
                    role = {
                        tm: res?.id,
                    };
                }

                if (res?.designation == ROLE.DM) {
                    setState({ dm: { value: res?.id, label: `${res?.first_name} ${res?.last_name}` } });
                    role = {
                        dm: res?.id,
                    };
                }
                const body: any = {
                    year_type: type,
                    summary: true,
                    user_id: res?.id,
                };
                adminCardData(body);
            }

            leadList(1, role);

            // adminCardData();
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const adminCardData = async (body) => {
        try {
            setState({ loading: true });

            console.log('body', body);

            const bodys: any = {
                year_type: body?.year_type,
                summary: 'Yes',
                team: body?.team,
            };
            if (body?.user_id) {
                bodys.user_id = body?.user_id;
            }

            const res: any = await Models.report.targetTeamCard(bodys);
            // const mergedData = res?.map((item) => ({
            //     ...item,
            //     colorScheme: getColorTargetScheme(item.title),
            // }));

            const mergedData = res?.map((item) => {
                let subtitle = '';
                if (item.title === 'monthly') {
                    subtitle = formatMonthYear(item.start_date); // e.g., "November 2025"
                } else {
                    const start = formatMonthYear(item.start_date);
                    const end = formatMonthYear(item.end_date);
                    subtitle = `${start} - ${end}`; // e.g., "October 2025 - December 2025"
                }
                return {
                    ...item,
                    subtitle,
                    colorScheme: getColorTargetScheme(item.title),
                };
            });

            setState({ adminCardData: mergedData, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

  

    const leadList = async (page, role = null) => {
        try {
            setState({ loading: true });
            let body = bodyData();
            if (role) {
                body = {
                    ...body,
                    ...role,
                };
                if (role.bdm) body.bdm = role.bdm;
                if (role.bde) body.bde = role.bde;
                if (role.tm) body.tm = role.tm;
                if (role.dm) body.dm = role.dm;
            }
            // const response: any = await Models.opportunity.dashboardLead(body, page);
            // tableData(response?.results, state.role);
            // setState({
            //     loading: false,
            //     totalRecords: response.count,
            //     next: response.next,
            //     previous: response.previous,
            //     isOpen: false,
            //     currentPage: page,
            // });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const getFinancialYearRange = () => {
        const today = new Date();
        let year = today.getFullYear();

        // If current month is Jan–Mar, financial year started last year
        const month = today.getMonth() + 1; // 1-12

        let startYear = month < 4 ? year - 1 : year;
        let endYear = month < 4 ? year : year + 1;

        return {
            start: `${startYear}-04-01`,
            end: `${endYear}-03-31`,
        };
    };

    const getPhysicalYearRange = () => {
        const today = new Date();
        let year = today.getFullYear();

        return {
            start: `${year}-01-01`,
            end: `${year}-12-31`,
        };
    };

    const bodyData = () => {
        let body: any = {};

        //  body.team = true;

        body.display_date_source = true;

        body.userid = state.userId;

        if (state.search) {
            body.search = state.search;
        }

        if (state.opportunity) {
            body.opportunity = state.opportunity?.value;
        }

        if (state.lead_source) {
            body.lead_source = state.lead_source?.value;
        }

        if (state.lead_status) {
            body.status = state.lead_status?.value;
        }

        if (state.filterMonth?.value == 'Year') {
            let date = getDateRange('Year');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (type == 'financial') {
            let date = getFinancialYearRange();
            body.from_date = date.start;
            body.end_date = date.end;
        }

        if (type == 'physical') {
            let date = getPhysicalYearRange();
            body.from_date = date.start;
            body.end_date = date.end;
        }

        if (state.filterMonth?.value == 'Last Month') {
            let date = getDateRange('lastMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.filterMonth?.value == 'This Month') {
            let date = getDateRange('thisMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }
        if (state.filterMonth?.value == 'Last 7 Days') {
            let date = getDateRange('last7Days');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        // body.opportunity_status = 34;

        return body;
    };

    const tableData = (res, role) => {
        const data = res?.map((item) => {
            return {
                ...item,
                allData: item,
                lead: item.lead,
                opportunity: item?.name,
                // opportunity: item?.opportunities?.length > 0 ? item.opportunities.map((detail) => detail.name).join(', ') : '-',
                source: item.primary_contact?.lead_source?.source || '',
                date: item.created_on ? moment(item.created_on).format('DD-MM-YYYY') : '',
                contact_person: item.primary_contact?.name || '',
                lead_status: item.lead_status?.name,
                status_date: item.status_date ? moment(item.status_date).format('DD-MM-YYYY') : null,
                remark: item.remark,
                // assigned_to: item.assigned_to?.username,
                follow_up: moment(item.status_date).format('DD-MM-YYYY'),
                contact_number: item.primary_contact?.phone_number,
                created_by: `${item?.created_by?.first_name} ${item?.created_by?.last_name}`,

                assigned_to: item?.lead?.assigned_to?.first_name ? `${item?.lead?.assigned_to?.first_name} ${item?.lead?.assigned_to?.last_name}` : '',
                updated_on: item?.updated_on ? moment(item?.updated_on).format('DD-MM-YYYY') : '',
                closing_date: item.closing_date ? moment(item.closing_date).format('DD-MM-YYYY') : '',
            };
        });

        let columns = [];

        switch (role) {
            case ROLE.ADMIN:
                columns = [
                    { accessor: 'lead' },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source' },
                    { accessor: 'date', title: 'Date', width: 120 },
                    { accessor: 'contact_person', title: 'Contact Person' },
                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },

                    { accessor: 'remark', title: 'Remark' },
                ];
                break;

            case ROLE.BDM:
                columns = [
                    { accessor: 'lead' },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source' },
                    { accessor: 'date', title: 'Date', width: 120 },

                    { accessor: 'contact_person', title: 'Contact Person' },

                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark' },
                ];
                break;

            case ROLE.BDE:
                columns = [
                    {
                        accessor: 'lead',

                        render: (row, index) => (
                            <>
                                <div className="">{row.name}</div>
                            </>
                        ),
                    },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source', title: 'Source' },
                    { accessor: 'date', title: 'Date' },
                    { accessor: 'contact_person', title: 'Contact Person' },
                    { accessor: 'contact_number', title: 'Contact Number' },
                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark' },
                ];
                break;

            case ROLE.TM:
                columns = [
                    {
                        accessor: 'lead',

                        title: 'Company',
                    },

                    {
                        accessor: 'contact_person',
                        title: 'Contact Person',
                    },
                    { accessor: 'contact_number', title: 'Contact Number' },

                    { accessor: 'source', title: 'Source' },

                    { accessor: 'date', title: 'Date', width: 120 },
                    {
                        accessor: 'lead_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lead_status === 'Calls'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lead_status === 'Appointments'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lead_status === 'Opportunity'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lead_status === 'Proposal'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lead_status === 'Closures'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lead_status === 'Leads'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lead_status}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Follow Up', width: 120 },
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark ' },
                ];
                break;

            case ROLE.DM:
                columns = [
                    {
                        accessor: 'lead',
                    },
                    { accessor: 'opportunity', title: 'Opportunity', width: 120, sortable: false },
                    { accessor: 'source', title: 'Source' },
                    { accessor: 'date', title: 'Date' },
                    { accessor: 'contact_person', title: 'Contact Person' },
                    {
                        accessor: 'last_status',
                        title: 'Last Status',

                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lastStatus === 'New'
                                        ? 'bg-blue-100 text-blue-800'
                                        : row?.lastStatus === 'Contacted'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : row?.lastStatus === 'Qualified'
                                        ? 'bg-green-100 text-green-800'
                                        : row?.lastStatus === 'Disqualified'
                                        ? 'bg-red-100 text-red-800'
                                        : row?.lastStatus === 'Follow-Up'
                                        ? 'bg-orange-100 text-orange-800'
                                        : row?.lastStatus === 'Converted'
                                        ? 'bg-teal-100 text-teal-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lastStatus}
                            </div>
                        ),
                    },
                    { accessor: 'status_date', title: 'Status Date' },
                    { accessor: 'created_by', title: 'Created By' },
                    { accessor: 'assigned_to', title: 'Assigned To' },
                    { accessor: 'remark', title: 'Remark' },
                ];
                break;

            default:
                console.warn('Invalid role provided!');
                break;
        }
        setState({ data: data, allData: res, columns: columns });
    };

    const handleNextPage = () => {
        if (state.next) {
            const newPage = state.currentPage + 1;
            leadList(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            const newPage = state.currentPage - 1;
            leadList(newPage);
        }
    };

    const handleClickTeamCard = async (data) => {
        try {
            setState({ cartLoading: true });
            setSelectedCard(data.title);
            setSelectedCardDate(`${data.start_date} - ${data.end_date}`);
            const bodys: any = {
                year_type: type,
                // summary: 'No',
                period: data?.title == 'half yearly' ? 'half' : data?.title == 'annually' ? 'annual' : data?.title?.toLowerCase(),
            };
            if (user_id) {
                bodys.user_id = user_id;
            }
            const res: any = await Models.report.targetTeamCard(bodys);
            if (res?.length > 0) {
                setState({ targetTeamCardData: res[0] });
            }
            setState({ cartLoading: false });
        } catch (error) {
            setState({ cartLoading: false });

            console.log('✌️error --->', error);
        }
    };

    const handleClickUserCard = async (data) => {
        try {
            setSelectedUserCard(data.title);
            setSelectedUserCardDate(`${data.start_date} - ${data.end_date}`);
            const bodys: any = {
                year_type: type,
                // summary: 'No',
                period: data?.title == 'half yearly' ? 'half' : data?.title == 'annually' ? 'annual' : data?.title?.toLowerCase(),
            };
            if (state.tm?.value || state.bde?.value || state.bdm?.value || state.dm?.value) {
                bodys.user_id = state.tm?.value || state.bde?.value || state.bdm?.value || state.dm?.value;
            }
            const res: any = await Models.report.targetTeamCard(bodys);
            if (res?.length > 0) {
                setState({ targetUserCardData: res[0] });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    return (
        <div className="p-2">
            <div className="panel bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{'Repute Digital Bussiness Agency'}</h1>
                        <p className="text-blue-100">{/* {state.role} Dashboard - {'2025'} */}</p>
                    </div>
                    <div className="text-right">
                        <Text size="sm" className="text-blue-100">
                            Last Updated
                        </Text>
                        <Text fw={500}>{new Date().toLocaleDateString()}</Text>
                    </div>
                </div>
            </div>
            <div className="panel mb-3 mt-3 flex flex items-center items-center justify-between gap-5 pl-3">
                {/* <h5 className="text-lg font-semibold">{state.name} - {`(${state.role})`} Monthly Target</h5> */}
                <h5 className="text-lg font-semibold">
                    {state.name} - {type == 'financial' ? 'Financial' : 'Physical'} Year Target
                </h5>
            </div>
            {state.adminCardData?.length > 0 && (
                <div className="">
                    <AdminDashboard cardData={state.adminCardData} handleClick={(data) => handleClickTeamCard(data)} selectedCard={selectedCard} />
                </div>
            )}
            {state.targetTeamCardData?.items?.length > 0 && (
                <MonthlyTargetSlider
                    onClose={() => setState({ targetTeamCardData: null })}
                    data={state.targetTeamCardData?.items}
                    title={state.targetTeamCardData?.period_type}
                    selectedCardDate={selectedCardDate}
                    loading={state.cartLoading}
                />
            )}
            {/* {state.userCardData?.map((card, index) => (

                    <UserTargetCard key={card.type} data={card} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }} />
                ))} */}

            <div className="panel mt-2 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className={`relative flex w-full items-center  rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/3 `}>
                    <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                        <IconSearch className="h-6 w-6 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search by lead name"
                        className="form-input rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                    <CustomSelect
                        value={state.lead_source}
                        onChange={(e) => setState({ lead_source: e })}
                        placeholder={'Source'}
                        options={state.sourceList}
                        error={state.errors?.lead_source}
                        className="w-full"
                        required
                    />
                    {/*   )}*/}

                    <CustomSelect
                        value={state.lead_status}
                        onChange={(e) => setState({ lead_status: e })}
                        placeholder={'Status'}
                        options={state.statusList}
                        error={state.errors?.lead_status}
                        className="w-full"
                        required
                    />

                    <CustomSelect
                        value={state.opportunity}
                        onChange={(e) => setState({ opportunity: e })}
                        placeholder={'Opportunity'}
                        options={state.opportunityList}
                        error={state.errors?.opportunity}
                        required
                    />
                </div>
            </div>

            <div className="flex items-center justify-end">
                {state.data?.length > 0 && (
                    <div className="mt-3 flex items-center justify-end pb-2 pr-3">
                        <div className="rounded-lg bg-gray-300 p-1 font-semibold">{pageCounts(state.currentPage, state.totalRecords)}</div>
                    </div>
                )}
            </div>

            <>
                <div>
                    <DataTable
                        className="table-responsive"
                        records={state.data}
                        fetching={state.loading || state.subLoading}
                        loaderSize="lg"
                        loaderVariant="dots"
                        loaderColor="blue"
                        loaderBackgroundBlur={0}
                        // onRowClick={()=>tableRow(state.data)}
                        columns={[
                            {
                                accessor: 'lead',

                                title: `${ROLE.TM == state.role ? 'Company' : 'Lead'}`,
                                render: (row: any) => <div>{row?.lead?.name}</div>,
                            },
                            ...(state.role === ROLE.BDE || state.role === ROLE.BDM || state.role === ROLE.DM || state.role === ROLE.ADMIN
                                ? [
                                      {
                                          accessor: 'name',
                                          title: 'Opportunity',
                                          sortable: false,
                                          width: 150,
                                          render: (row) => (
                                              <div>
                                                  {row?.name?.name} {/* {row?.opportunity_keyword && `(${row?.opportunity_keyword})`} */}
                                              </div>
                                          ),
                                      },
                                  ]
                                : []),

                            {
                                accessor: 'contact_person',
                                title: 'Contact Person',
                            },

                            ...(state.role == ROLE.BDE || state.role == ROLE.TM ? [{ accessor: 'contact_number', title: 'Contact Number' }] : []),

                            { accessor: 'source', title: 'Source' },

                            { accessor: 'date', title: 'Created Date', width: 120 },
                            {
                                accessor: 'opportunity_status',
                                title: 'Opportunity Status',
                                render: (row) => (
                                    <div
                                        className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                            row?.opportunity_status?.name === 'Inquired'
                                                ? 'bg-pink-100 text-pink-800'
                                                : row?.opportunity_status?.name === 'Appointments'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : row?.opportunity_status?.name === 'Opportunity'
                                                ? 'bg-green-100 text-green-800'
                                                : row?.opportunity_status?.name === 'Proposal'
                                                ? 'bg-orange-100 text-orange-800'
                                                : row?.opportunity_status?.name === 'Leads'
                                                ? 'bg-teal-100 text-teal-800'
                                                : row?.opportunity_status?.name === 'Income'
                                                ? 'bg-blue-100 text-blue-800'
                                                : row?.opportunity_status?.name === 'Meetings'
                                                ? 'bg-green-100 text-green-800'
                                                : row?.opportunity_status?.name === 'Prospect'
                                                ? 'bg-blue-100 text-blue-800'
                                                : row?.opportunity_status?.name === 'Deal Won'
                                                ? 'bg-green-100 text-green-800'
                                                : row?.opportunity_status?.name === 'Deal Lose'
                                                ? 'bg-red-300 text-red-800'
                                                : row?.opportunity_status?.name === "Don't have our budget"
                                                ? 'bg-red-200 text-red-800'
                                                : row?.opportunity_status?.name === 'Idea in hold'
                                                ? 'bg-red-100 text-red-800'
                                                : row?.opportunity_status?.name === 'Follow Up'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : row?.opportunity_status?.name === 'Follow Up'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {row?.opportunity_status?.name}
                                    </div>
                                ),
                            },

                            // { accessor: 'status_date', title: `${ROLE.TM == state.role ? 'Follow Up' : 'Status Date'}` },

                            { accessor: 'updated_on', title: 'Updated Date' },
                            { accessor: 'closing_date', title: 'Closing Date' },

                            { accessor: 'created_by', title: 'Created By' },
                            { accessor: 'assigned_to', title: 'Assigned To' },

                            {
                                accessor: 'remark',
                                title: 'Remark ',
                                render: (row: any) => (
                                    <Tippy content={row?.remark} placement="top" className="rounded-lg bg-black p-1 text-sm text-white">
                                        <div>{row?.remark?.length > 20 ? `${row.remark.slice(0, 20)}...` : row?.remark}</div>
                                    </Tippy>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={state.taskList?.length}
                        recordsPerPage={state.pageSize}
                        minHeight={200}
                        page={null}
                        onPageChange={(p) => {}}
                        withBorder={true}
                        // sortStatus={sortStatus}
                        // onSortStatusChange={setSortStatus}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>

                <div className="mt-5 flex justify-center gap-3">
                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.totalRecords}
                        onPageChange={(page) => {
                            leadList(page);
                            setState({ currentPage: page });
                        }}
                        hasNext={state.next !== null}
                        hasPrevious={state.previous !== null}
                        recordsPerPage={10}
                    />
                </div>
            </>
        </div>
    );
};
export default PrivateRouter(UserTargetYear);
