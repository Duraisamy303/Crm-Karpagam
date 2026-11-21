import { Models, PrivateRouter, Validation } from '@/utils/imports.utils';
import React, { useEffect, useState } from 'react';
import { Dropdown, Success, allValuesAreZero, objIsEmpty, roundOff, sortData, useSetState } from '@/utils/functions.utils';
import CommonLoader from './elements/commonLoader';
import dynamic from 'next/dynamic';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import IconEdit from '@/components/Icon/IconEdit';
import IconEye from '@/components/Icon/IconEye';
import { useRouter } from 'next/router';
import CustomSelect from '@/components/Select';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import useDebounce from '@/common_component/useDebounce';
import SideMenu from '@/common_component/sideMenu';
import InputRange from '../common_component/slider';
import IconUser from '@/components/Icon/IconUser';
import IconPlus from '@/components/Icon/IconPlus';
import OppCard from '@/components/oppCard';
import IconSearch from '@/components/Icon/IconSearch';
import Header from '@/components/Layouts/Header';
import Chip from '@/components/chip';
import Tippy from '@tippyjs/react';
import IconUserPlus from '@/components/Icon/IconUserPlus';
import Modal from '@/common_component/modal';
import TextArea from '@/components/TextArea';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';
import * as Yup from 'yup';
import { ROLE } from '@/utils/constant.utils';
import QuickEdit from '@/components/QuickEdit';
import CustomeDatePicker from '@/common_component/datePicker';
import IconPhone from '@/components/Icon/IconPhone';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import IconMail from '@/components/Icon/IconMail';
import IconMobile from '@/components/Icon/IconMobile';
import Funnel from '@/common_component/funnelChart';
import { Badge, Card, SimpleGrid, Text, Title } from '@mantine/core';
import IconBitcoin from '@/components/Icon/IconBitcoin';
import IconFilter from '@/components/Icon/IconFilter';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

const Index = () => {
    const router = useRouter();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const [state, setState] = useSetState({
        data: [],
        loading: false,
        selectedRecords: [],
        isOpenFilter: false,
        focusList: [],
        marketList: [],
        verticalList: [],
        countryList: [],
        stateList: [],
        state: '',
        vertical: '',
        country: '',
        market: '',
        focus: '',
        next: null,
        previous: null,
        totalRecords: 0,
        currentPage: 1,
        search: '',
        isOpen: false,
        range: [0, 10000],
        maxPrice: 10000,
        tagList: [],
        tags: [],
        isOpenAssign: false,
        createdByList: [],
        assigned_to: '',
        popupHeight: 'auto',
        columns: [],
        role: '',
        subLoading: false,
        incomLead: {},
        isShowIncomLead: false,
        leadIncomZero: false,
    });

    useEffect(() => {
        // getData();
        // getMarketSegmentList();
        // countryList();
        // verticalList();
        // tagList();
        // createdByList();
        reportLead();
        reportLeadSource();
        funnelChartCount();
    }, []);

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        if (filters()) {
            filterData(state.currentPage);
        } else {
            // getData(state.currentPage);
        }
    }, [state.currentPage, debouncedSearch, state.vertical, state.focus, state.market]);

    useEffect(() => {
        setState({ currentPage: 1 });
    }, [debouncedSearch, state.vertical, state.focus, state.market]);

    useEffect(() => {
        if (state.data?.length > 0) {
            const sortedData = sortData(state.data, sortStatus.columnAccessor, sortStatus.direction);
            setState({ data: sortedData });
        }
    }, [sortStatus]);

    // const getData = async (page = 1) => {
    //     try {
    //         setState({ loading: true });
    //         const response: any = await Models.lead.list(page);
    //         setState({ range: [0, response.max_revenue], maxPrice: response.max_revenue });
    //         const res: any = await Models.auth.userDetails();
    //         setState({ role: res?.designation });
    //         tableData(response?.results, res?.designation);

    //         setState({
    //             loading: false,
    //             totalRecords: response.count,
    //             next: response.next,
    //             previous: response.previous,
    //         });
    //     } catch (error) {
    //         setState({ loading: false });
    //     }
    // };

    const filters = () => {
        let filter = false;
        if (state.search || state.vertical || state.focus || state.market || state.country || state.state || state.range[0] > 0 || state.range[1] != state.maxPrice) {
            filter = true;
        }
        return filter;
    };

    const filterData = async (page = 1) => {
        try {
            setState({ loading: true });
            let body = bodyData();
            if (!objIsEmpty(body)) {
                const response: any = await Models.lead.filter(body, page);

                tableData(response?.results, state.role);

                setState({
                    loading: false,
                    totalRecords: response.count,
                    next: response.next,
                    previous: response.previous,
                    isOpen: false,
                });
            } else {
                // getData();
                setState({
                    loading: false,

                    isOpen: false,
                });
            }
        } catch (error) {
            setState({ loading: false });
        }
    };

    const bodyData = () => {
        let body: any = {};

        if (state.search) {
            body.key = state.search;
        }
        if (state.vertical) {
            body.vertical_id = [state.vertical?.value];
        }
        if (state.focus) {
            body.focus_segment = [state.focus?.value];
        }
        if (state.market) {
            body.market_segment = [state.market?.value];
        }
        if (state.country) {
            body.country_id = [state.country?.value];
        }
        if (state.state) {
            body.state_id = [state.state?.value];
        }
        if (state.range[0] > 0 || state.range[1] != state.maxPrice) {
            (body.min_revenue = state.range[0]), (body.max_revenue = state.range[1]);
        }
        if (state.tags?.length > 0) {
            body.tags = state.tags?.map((item) => item?.value);
        }

        return body;
    };

    const clearFilter = () => {
        setState({
            state: '',
            vertical: '',
            country: '',
            market: '',
            focus: '',
            next: null,
            previous: null,
            totalRecords: 0,
            currentPage: 1,
            search: '',
            isOpen: false,
            range: [0, state.maxPrice],
            tags: [],
        });
        // getData();
    };

    const reportLead = async (filter = false) => {
        try {
            setState({ loading: true });
            let body = {};
            if (filter) {
                if (filters()) {
                    body = bodyData();
                }
            }
            const res: any = await Models.report.reportLead(body);
            const counts = res?.chart_data?.monthly_data?.map((item) => ({
                name: item?.month,
                count: item?.count,
            }));

            const countSeries = counts?.map((item) => item?.count);

            const countLabels = counts?.map((item) => item?.name);
            const allValAreZero = allValuesAreZero(countSeries);

            const incomLead = {
                series: [
                    {
                        name: 'Count',
                        data: countSeries,
                    },
                ],
                options: {
                    chart: {
                        height: 325,
                        type: 'line',
                        fontFamily: 'Nunito, sans-serif',
                        zoom: { enabled: false },
                        toolbar: { show: false },
                    },
                    dataLabels: { enabled: false },
                    stroke: {
                        show: true,
                        curve: 'smooth',
                        width: 2,
                        lineCap: 'square',
                    },
                    dropShadow: {
                        enabled: true,
                        opacity: 0.2,
                        blur: 10,
                        left: -7,
                        top: 22,
                    },
                    colors: ['#1B55E2'],
                    markers: {
                        size: 5,
                    },
                    labels: countLabels,
                    xaxis: {
                        axisBorder: { show: false },
                        axisTicks: { show: false },
                        labels: {
                            style: {
                                fontSize: '12px',
                                cssClass: 'apexcharts-xaxis-title',
                            },
                        },
                    },
                    yaxis: {
                        tickAmount: 7,
                        labels: {
                            style: {
                                fontSize: '12px',
                                cssClass: 'apexcharts-yaxis-title',
                            },
                        },
                        opposite: false,
                    },
                    grid: {
                        borderColor: '#E0E6ED',
                        strokeDashArray: 5,
                        xaxis: { lines: { show: false } },
                        yaxis: { lines: { show: true } },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    },
                    legend: {
                        position: 'top',
                        horizontalAlign: 'right',
                        fontSize: '16px',
                        markers: { width: 10, height: 10, offsetX: -2 },
                        itemMargin: { horizontal: 10, vertical: 5 },
                    },
                    tooltip: {
                        marker: { show: true },
                        x: { show: false },
                    },
                },
            };

            setState({ loading: false, incomLead: incomLead, isShowIncomLead: incomLead?.series?.length > 0, leadIncomZero: allValAreZero });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const reportLeadSource = async (filter = false) => {
        try {
            setState({ loading: true });
            let body = {};
            if (filter) {
                if (filters()) {
                    body = bodyData();
                }
            }
            const res: any = await Models.report.reportLead(body);
            const labels = Object.keys(res?.lead_source_counts);
            const data = Object.values(res?.lead_source_counts);
            const allValAreZero = allValuesAreZero(data);

            const count = {
                series: data,
                options: {
                    chart: {
                        type: 'donut',
                        height: 460,
                    },
                    labels: labels,
                    plotOptions: {
                        pie: {
                            donut: {
                                size: '65%',
                                background: 'transparent',
                                labels: {
                                    show: true,
                                    name: {
                                        show: true,
                                        fontSize: '29px',
                                        offsetY: -10,
                                    },
                                    value: {
                                        show: true,
                                        fontSize: '26px',
                                        color: undefined,
                                        offsetY: 16,
                                        formatter: (val: any) => {
                                            return val;
                                        },
                                    },
                                    total: {
                                        show: true,
                                        label: 'Total',
                                        color: '#888ea8',
                                        fontSize: '20px',
                                        formatter: (w: any) => {
                                            return w.globals.seriesTotals.reduce(function (a: any, b: any) {
                                                return a + b;
                                            }, 0);
                                        },
                                    },
                                },
                            },
                        },
                    },
                    dataLabels: {
                        enabled: false,
                    },
                    stroke: {
                        show: true,
                        width: 25,
                        colors: ['#fff'],
                    },
                    colors: ['#e2bd3f', '#4c1ac3', '#e7605a', '#3ab3e2', '#7a42e3', '#91e51a'],
                },
            };

            setState({ leadSource: count, reportLead: res, loading: false, isShowLead: count?.series?.length > 0, leadSourceZero: allValAreZero });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const funnelChartCount = async (filter = false) => {
        try {
            setState({ loading: true });
            let body = {};
            if (filter) {
                if (filters()) {
                    body = bodyData();
                }
            }
            const res: any = await Models.report.funnelCount(body);
            const data = [
                { name: 'Lead', value: res?.leads_count },
                { name: 'Opportunity', value: res?.opportunities_count },
                { name: 'Negotiation & Commitment Count', value: res?.Negotiation_and_commitment_count },
                { name: 'Won', value: res?.won_count },
            ];
            setState({ funnelData: data, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    // const getFocusSegmentList = async (verticalData: any) => {
    //     try {
    //         setState({ subLoading: true });
    //         const res: any = await Models.lead.focusIdBasedVericalList(verticalData?.value);
    //         let focusList: [];
    //         if (res?.results?.length > 0) {
    //             focusList = res?.results?.map((item) => ({ value: item?.id, label: item?.focus_segment }));
    //         }

    //         setState({ focusList: focusList });
    //     } catch (error) {
    //         setState({ subLoading: false });
    //     }
    // };

    // const tagList = async () => {
    //     try {
    //         setState({ subLoading: true });
    //         const res = await Models.lead.dropdowns('tags');
    //         const dropdownList = Dropdown(res, 'tag');
    //         setState({ tagList: dropdownList, subLoading: false });
    //     } catch (error) {
    //         setState({ subLoading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const createdByList = async () => {
    //     try {
    //         setState({ subLoading: true });
    //         const res = await Models.lead.dropdowns('assigned_to');
    //         const dropdownList = Dropdown(res, 'username');
    //         setState({ createdByList: dropdownList, subLoading: false });
    //     } catch (error) {
    //         setState({ subLoading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const getMarketSegmentList = async () => {
    //     try {
    //         setState({ subLoading: true });
    //         const res = await Models.lead.dropdowns('market_segment');
    //         const dropdownList = Dropdown(res, 'market_segment');
    //         setState({ marketList: dropdownList, subLoading: false });
    //     } catch (error) {
    //         setState({ subLoading: false });
    //     }
    // };

    // const countryList = async () => {
    //     try {
    //         setState({ subLoading: true });
    //         const res = await Models.lead.dropdowns('country');
    //         const dropdownList = Dropdown(res, 'country_name');
    //         setState({ countryList: dropdownList, subLoading: false });
    //     } catch (error) {
    //         setState({ subLoading: false });
    //     }
    // };

    // const verticalList = async () => {
    //     try {
    //         setState({ subLoading: true });
    //         const res = await Models.lead.dropdowns('vertical');
    //         const dropdownList = Dropdown(res, 'vertical');
    //         setState({ verticalList: dropdownList, subLoading: false });
    //     } catch (error) {
    //         setState({ subLoading: false });
    //     }
    // };

    // const stateList = async (country) => {
    //     try {
    //         setState({ stateLoading: true });
    //         const res = await Models.lead.stateList(country?.value);
    //         const dropdownList = Dropdown(res, 'state_name');
    //         setState({ stateList: dropdownList, stateLoading: false });
    //     } catch (error) {
    //         setState({ stateLoading: false });
    //     }
    // };

    const orderFilter = ['Year', 'Last Month', 'This Month', 'Last 7 Days', 'Custom'];

    const tableData = (res: any, role: string) => {
        // const opportunity = ['Website', 'Logo Design', 'Application', 'Marketing', 'Amazon Listing', 'SEO'];
        const opportunity = ['Sales', 'Marketing', 'Customer Service', 'Analytics', 'E-commerce', 'Mobile'];

        const lastStatus = ['New', 'Contacted', 'Qualified', 'Disqualified', 'Follow-Up', 'Converted'];
        const assigned = ['TeleMarketer', 'BDE'];
        const domain = ['Web', 'Social Handle'];

        // Helper function to pick a random value from an array
        const getRandomValue = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const data = res?.map((item) => ({
            ...item,
            country: item?.country?.country_name,
            focus_segment: item.focus_segment.focus_segment,
            state: item?.state?.state_name || [],
            lead_owner: item?.lead_owner?.username,
            created_by: item?.created_by?.username,
            name: item?.name,
            vertical: item?.focus_segment?.vertical?.vertical || item?.vertical?.vertical,
            annual_revenue: roundOff(item?.annual_revenue),
            tags: item?.tags,
            value: 38740,
            lastStatus: getRandomValue(lastStatus), // Assign random "lastStatus" value
            opportunity: getRandomValue(opportunity),
            assigned: getRandomValue(assigned),
            created_on: moment(item.created_on).format('DD-MM-YYYY '),
            domain: getRandomValue(domain),
        }));

        let columns = [];

        switch (role) {
            case ROLE.ADMIN:
                columns = [
                    { accessor: 'name', width: 130,  },

                    { accessor: 'lead_owner', title: 'Lead Manager',  },
                    { accessor: 'vertical',  },
                    { accessor: 'focus_segment', title: 'Focus Segment',  },
                    {
                        accessor: 'tags',
                        width: 150,
                        
                        render: (row, index) => (
                            <>
                                {row.tags?.length > 0 && (
                                    <Tippy
                                        content={
                                            <div className="rounded-lg bg-white p-2 text-sm shadow-lg">
                                                {row.tags.map((item, index) => (
                                                    <div key={index} className="p-0.5">
                                                        <Chip label={item.tag} />
                                                    </div>
                                                ))}
                                            </div>
                                        }
                                    >
                                        <div className="flex gap-2 p-0.5">{row.tags[0]?.tag}</div>
                                    </Tippy>
                                )}
                            </>
                        ),
                    },
                    { accessor: 'state', title: 'State',  },
                    { accessor: 'country', width: '120px',  },
                    { accessor: 'annual_revenue', title: 'Annual Revenue',  },
                    { accessor: 'created_on', title: 'Date', width: 130 },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Assign To" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button type="button" className="flex hover:text-primary" onClick={() => setState({ isOpenAssign: true, leadId: row.id })}>
                                        <IconUserPlus />
                                    </button>
                                </Tippy>
                                <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                        style: {
                            position: 'sticky', // Sticky position
                            right: 0, // Fix to the right side
                            background: '#fff', // Background color for better visibility
                            zIndex: 2, // Ensure it's above other elements
                        },
                    },
                ];
                break;

            case ROLE.BDM:
                columns = [
                    {
                        accessor: 'name',
                        width: 170,
                        
                        title: 'Lead',
                        render: (row, index) => (
                            <>
                                <div className="">{row.name}</div>
                            </>
                        ),
                    },
                    { accessor: 'opportunity', title: 'Opportunity',  },
                    { accessor: 'created_on', title: 'Date',  },
                    {
                        accessor: 'created_by',
                        title: 'Contact Person',
                        
                        render: (row: any) => (
                            <div className="flex items-center gap-2 ">
                                <Tippy content={'9876543210'} className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button type="button" className="flex hover:text-primary">
                                        <span className="font-medium text-gray-800 dark:text-white">{row.created_by}</span>
                                        <IconMobile />
                                    </button>
                                </Tippy>

                                {/* <a
                                    href={`tel:${row.phone}`}
                                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                    onClick={(e) => e.stopPropagation()} // Prevents table row click if applicable
                                >
                                    ({9876543210})
                                </a> */}
                            </div>
                        ),
                    },
                    {
                        accessor: 'lastStatus',
                        title: 'Last Status',
                        
                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lastStatus === 'New'
                                        ? 'bg-blue-100 text-blue-800' // Light blue for new entries
                                        : row?.lastStatus === 'Contacted'
                                        ? 'bg-yellow-100 text-yellow-800' // Yellow for contacted entries
                                        : row?.lastStatus === 'Qualified'
                                        ? 'bg-green-100 text-green-800' // Green for qualified entries
                                        : row?.lastStatus === 'Disqualified'
                                        ? 'bg-red-100 text-red-800' // Red for disqualified entries
                                        : row?.lastStatus === 'Follow-Up'
                                        ? 'bg-orange-100 text-orange-800' // Orange for follow-ups
                                        : row?.lastStatus === 'Converted'
                                        ? 'bg-teal-100 text-teal-800' // Teal for converted entries
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lastStatus}
                            </div>
                        ),
                    },
                    { accessor: 'created_on', title: 'Status Date ',  },
                    { accessor: 'assigned', title: 'Assigned To',  },
                    { accessor: 'value', title: 'Value ',  },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button
                                        type="button"
                                        className="flex hover:text-primary"
                                        onClick={() => {
                                            // Toggle row expansion
                                            state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                        }}
                                    >
                                        <IconNotesEdit />
                                    </button>
                                </Tippy>

                                <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                        style: {
                            position: 'sticky', // Sticky position
                            right: 0, // Fix to the right side
                            background: '#fff', // Background color for better visibility
                            zIndex: 2, // Ensure it's above other elements
                        },
                    },

                    // {
                    //     accessor: 'tags',
                    //     width: 150,
                    //     
                    //     render: (row, index) => (
                    //         <>
                    //             {row.tags?.length > 0 && (
                    //                 <Tippy
                    //                     content={
                    //                         <div className="rounded-lg bg-white p-2 text-sm shadow-lg">
                    //                             {row.tags.map((item, index) => (
                    //                                 <div key={index} className="p-0.5">
                    //                                     <Chip label={item.tag} />
                    //                                 </div>
                    //                             ))}
                    //                         </div>
                    //                     }
                    //                 >
                    //                     <div className="flex gap-2 p-0.5">{row.tags[0]?.tag}</div>
                    //                 </Tippy>
                    //             )}
                    //         </>
                    //     ),
                    // },
                    // { accessor: 'annual_revenue', title: 'Annual Revenue',  },
                    // { accessor: 'lead_owner', title: 'Lead Owner',  },
                    // { accessor: 'country', width: '120px',  },
                    // { accessor: 'state', title: 'State',  },
                ];
                break;

            case ROLE.BDE:
                columns = [
                    {
                        accessor: 'name',
                        width: 170,
                        
                        title: 'Lead',
                        render: (row, index) => (
                            <>
                                <div className="">{row.name}</div>
                            </>
                        ),
                    },
                    { accessor: 'opportunity', title: 'Opportunity',  },
                    { accessor: 'created_on', title: 'Date',  },
                    {
                        accessor: 'created_by',
                        title: 'Contact Person',
                        
                        render: (row: any) => (
                            <div className="flex items-center gap-2 ">
                                <Tippy content={'9876543210'} className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button type="button" className="flex hover:text-primary">
                                        <span className="font-medium text-gray-800 dark:text-white">{row.created_by}</span>
                                        <IconMobile />
                                    </button>
                                </Tippy>

                                {/* <a
                                    href={`tel:${row.phone}`}
                                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                    onClick={(e) => e.stopPropagation()} // Prevents table row click if applicable
                                >
                                    ({9876543210})
                                </a> */}
                            </div>
                        ),
                    },
                    {
                        accessor: 'lastStatus',
                        title: 'Last Status',
                        
                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lastStatus === 'New'
                                        ? 'bg-blue-100 text-blue-800' // Light blue for new entries
                                        : row?.lastStatus === 'Contacted'
                                        ? 'bg-yellow-100 text-yellow-800' // Yellow for contacted entries
                                        : row?.lastStatus === 'Qualified'
                                        ? 'bg-green-100 text-green-800' // Green for qualified entries
                                        : row?.lastStatus === 'Disqualified'
                                        ? 'bg-red-100 text-red-800' // Red for disqualified entries
                                        : row?.lastStatus === 'Follow-Up'
                                        ? 'bg-orange-100 text-orange-800' // Orange for follow-ups
                                        : row?.lastStatus === 'Converted'
                                        ? 'bg-teal-100 text-teal-800' // Teal for converted entries
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lastStatus}
                            </div>
                        ),
                    },
                    { accessor: 'created_on', title: 'Status Date ',  },
                    { accessor: 'created_on', title: 'Follow Up',  },
                    // { accessor: 'value', title: 'Value ',  },
                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button
                                        type="button"
                                        className="flex hover:text-primary"
                                        onClick={() => {
                                            // Toggle row expansion
                                            state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                        }}
                                    >
                                        <IconNotesEdit />
                                    </button>
                                </Tippy>

                                <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                        style: {
                            position: 'sticky', // Sticky position
                            right: 0, // Fix to the right side
                            background: '#fff', // Background color for better visibility
                            zIndex: 2, // Ensure it's above other elements
                        },
                    },

                    // {
                    //     accessor: 'tags',
                    //     width: 150,
                    //     
                    //     render: (row, index) => (
                    //         <>
                    //             {row.tags?.length > 0 && (
                    //                 <Tippy
                    //                     content={
                    //                         <div className="rounded-lg bg-white p-2 text-sm shadow-lg">
                    //                             {row.tags.map((item, index) => (
                    //                                 <div key={index} className="p-0.5">
                    //                                     <Chip label={item.tag} />
                    //                                 </div>
                    //                             ))}
                    //                         </div>
                    //                     }
                    //                 >
                    //                     <div className="flex gap-2 p-0.5">{row.tags[0]?.tag}</div>
                    //                 </Tippy>
                    //             )}
                    //         </>
                    //     ),
                    // },
                    // { accessor: 'annual_revenue', title: 'Annual Revenue',  },
                    // { accessor: 'lead_owner', title: 'Lead Owner',  },
                    // { accessor: 'country', width: '120px',  },
                    // { accessor: 'state', title: 'State',  },
                ];
                break;

            case ROLE.TM:
                columns = [
                    {
                        accessor: 'name',
                        
                        title: 'Company',
                        render: (row, index) => (
                            <>
                                <div className="">{row.name}</div>
                            </>
                        ),
                    },

                    {
                        accessor: 'created_by',
                        title: 'Contact',
                        
                        render: (row: any) => (
                            <div className="flex items-center gap-2 ">
                                <Tippy content={'9876543210'} className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button type="button" className="flex hover:text-primary">
                                        <span className="font-medium text-gray-800 dark:text-white">{row.created_by}</span>
                                        <IconMobile />
                                    </button>
                                </Tippy>

                                {/* <a
                                    href={`tel:${row.phone}`}
                                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                    onClick={(e) => e.stopPropagation()} // Prevents table row click if applicable
                                >
                                    ({9876543210})
                                </a> */}
                            </div>
                        ),
                    },
                    { accessor: 'opportunity', title: 'Communication',  },

                    { accessor: 'domain', title: 'Domain',  },

                    { accessor: 'created_on', title: 'Date',  width: 120 },
                    {
                        accessor: 'lastStatus',
                        title: 'Last Status',
                        
                        render: (row) => (
                            <div
                                className={`flex w-max gap-4 rounded-full px-2 py-1 ${
                                    row?.lastStatus === 'New'
                                        ? 'bg-blue-100 text-blue-800' // Light blue for new entries
                                        : row?.lastStatus === 'Contacted'
                                        ? 'bg-yellow-100 text-yellow-800' // Yellow for contacted entries
                                        : row?.lastStatus === 'Qualified'
                                        ? 'bg-green-100 text-green-800' // Green for qualified entries
                                        : row?.lastStatus === 'Disqualified'
                                        ? 'bg-red-100 text-red-800' // Red for disqualified entries
                                        : row?.lastStatus === 'Follow-Up'
                                        ? 'bg-orange-100 text-orange-800' // Orange for follow-ups
                                        : row?.lastStatus === 'Converted'
                                        ? 'bg-teal-100 text-teal-800' // Teal for converted entries
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {row?.lastStatus}
                            </div>
                        ),
                    },
                    { accessor: 'created_on', title: 'Call At',  width: 120 },
                    { accessor: 'created_on', title: 'Next Call',  },
                    { accessor: 'created_on', title: 'Follow up ',  },

                    {
                        accessor: 'actions',
                        title: 'Actions',
                        render: (row: any) => (
                            <div className="mx-auto flex w-max items-center gap-4">
                                <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                    <button
                                        type="button"
                                        className="flex hover:text-primary"
                                        onClick={() => {
                                            // Toggle row expansion
                                            state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                        }}
                                    >
                                        <IconNotesEdit />
                                    </button>
                                </Tippy>

                                <button type="button" className="flex hover:text-primary" onClick={() => router.push(`/viewLead?id=${row.id}`)}>
                                    <IconEye />
                                </button>
                                <button className="flex hover:text-info" onClick={() => router.push(`/updateLead?id=${row.id}`)}>
                                    <IconEdit className="h-4.5 w-4.5" />
                                </button>
                            </div>
                        ),
                        style: {
                            position: 'sticky', // Sticky position
                            right: 0, // Fix to the right side
                            background: '#fff', // Background color for better visibility
                            zIndex: 2, // Ensure it's above other elements
                        },
                    },

                    // {
                    //     accessor: 'tags',
                    //     width: 150,
                    //     
                    //     render: (row, index) => (
                    //         <>
                    //             {row.tags?.length > 0 && (
                    //                 <Tippy
                    //                     content={
                    //                         <div className="rounded-lg bg-white p-2 text-sm shadow-lg">
                    //                             {row.tags.map((item, index) => (
                    //                                 <div key={index} className="p-0.5">
                    //                                     <Chip label={item.tag} />
                    //                                 </div>
                    //                             ))}
                    //                         </div>
                    //                     }
                    //                 >
                    //                     <div className="flex gap-2 p-0.5">{row.tags[0]?.tag}</div>
                    //                 </Tippy>
                    //             )}
                    //         </>
                    //     ),
                    // },
                    // { accessor: 'annual_revenue', title: 'Annual Revenue',  },
                    // { accessor: 'lead_owner', title: 'Lead Owner',  },
                    // { accessor: 'country', width: '120px',  },
                    // { accessor: 'state', title: 'State',  },
                ];
                break;

            case ROLE.DM:
                columns = [
                    { accessor: 'name', width: 130,  },
                    { accessor: 'focus_segment', title: 'Focus Segment',  },
                    { accessor: 'state', title: 'State',  },
                    { accessor: 'created_on', title: 'Date', width: 130 },
                ];
                break;

            default:
                console.warn('Invalid role provided!');
                break;
        }

        setState({ data, columns });
    };

    const handleNextPage = () => {
        if (state.next) {
            setState({ currentPage: state.currentPage + 1 });
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            setState({ currentPage: state.currentPage - 1 });
        }
    };

    // const leadListLoadMore = async () => {
    //     try {
    //         if (state.hasMoreLead) {
    //             const res: any = await Models.lead.list(state.currentLeadPage + 1);
    //             const newOptions = Dropdown(res?.results, 'name');
    //             setState({
    //                 leadList: [...state.leadList, ...newOptions],
    //                 hasMoreLead: res.next,
    //                 currentLeadPage: state.currentLeadPage + 1,
    //             });
    //         } else {
    //             setState({
    //                 leadList: state.leadList,
    //             });
    //         }
    //     } catch (error) {
    //         setState((prev) => ({ ...prev, loading: false }));
    //     }
    // };

    const clearAssignData = () => {
        setState({
            assigned_to: '',
            isOpenAssign: false,
            errors: '',
            assignLoad: false,
            leadId: '',
        });
    };

    // const assignedLead = async () => {
    //     try {
    //         setState({ assignLoad: true });
    //         const validateField = {
    //             assigned_to: state.assigned_to ? moment(state.assigned_to).format('YYYY-MM-DD') : '',
    //         };
    //         await Validation.assignTask.validate(validateField, { abortEarly: false });

    //         const body = {
    //             assigned_to: state.assigned_to?.map((item) => item?.value),
    //         };
    //         const res: any = await Models.lead.leadAssign(state.leadId, body);
    //         Success(res.message);
    //         clearAssignData();
    //         setState({ assignLoad: false });
    //         getData();
    //     } catch (error) {
    //         if (error instanceof Yup.ValidationError) {
    //             const validationErrors = {};
    //             error.inner.forEach((err) => {
    //                 validationErrors[err.path] = err?.message; // Set the error message for each field
    //             });
    //             setState({ errors: validationErrors, assignLoad: false });
    //         } else {
    //             setState({ assignLoad: false });
    //         }
    //     }
    // };

    // const pipelineData = [
    //     { name: 'Prospecting', value: 30, fillColor: '#FFFF00' },
    //     { name: 'Qualification', value: 20, fillColor: '#FF4500' },
    //     { name: 'Proposal', value: 15, fillColor: '#1E90FF' },
    //     { name: 'Negotiation', value: 10, fillColor: '#32CD32' },
    //     { name: 'Closed-Won', value: 5, fillColor: '#FFD700' },
    //     { name: 'Retention', value: 20, fillColor: '#FFD700' },
    // ];

    // const salesPipelineData = [
    //     { stage: 'Prospecting', deals: 30, totalValue: 50000, status: 'In Progress' },
    //     { stage: 'Qualification', deals: 20, totalValue: 40000, status: 'Pending' },
    //     { stage: 'Proposal', deals: 15, totalValue: 35000, status: 'Completed' },
    //     { stage: 'Negotiation', deals: 10, totalValue: 30000, status: 'Pending' },
    //     { stage: 'Closed-Won', deals: 5, totalValue: 25000, status: 'Completed' },
    //     { stage: 'Retention', deals: 20, totalValue: 25000, status: 'In Progress' },
    // ];

    // const pipelineData = [
    //     { name: 'Lead Generation', value: 30, fillColor: '#FFA07A' }, // Light Salmon
    //     { name: 'Contact Made', value: 20, fillColor: '#FFD700' }, // Gold
    //     { name: 'Qualification', value: 15, fillColor: '#32CD32' }, // Lime Green
    //     { name: 'Proposal Sent', value: 10, fillColor: '#1E90FF' }, // Dodger Blue
    //     { name: 'Negotiation', value: 5, fillColor: '#FF4500' }, // Orange Red
    //     { name: 'Closed-Won', value: 20, fillColor: '#9400D3' }, // Dark Violet
    // ];

    // const salesPipelineData = [
    //     { stage: 'Lead Generation', deals: 30, totalValue: 50000, status: 'In Progress' },
    //     { stage: 'Contact Made', deals: 20, totalValue: 40000, status: 'Pending' },
    //     { stage: 'Qualification', deals: 15, totalValue: 35000, status: 'Completed' },
    //     { stage: 'Negotiation', deals: 10, totalValue: 30000, status: 'Pending' },
    //     { stage: 'Proposal Sent', deals: 5, totalValue: 25000, status: 'Completed' },
    //     { stage: 'Closed-Won', deals: 20, totalValue: 25000, status: 'In Progress' },
    // ];

    const pipelineData = [
        { name: 'Market Research', value: 30, fillColor: '#FFC300' }, // Amber
        { name: 'Team Outreach', value: 20, fillColor: '#FF5733' }, // Red Orange
        { name: 'Opportunity Review', value: 15, fillColor: '#C70039' }, // Deep Red
        { name: 'Strategy Deployment', value: 10, fillColor: '#900C3F' }, // Dark Red
        { name: 'Deal Support', value: 5, fillColor: '#581845' }, // Plum
        { name: 'Closed Deals', value: 20, fillColor: '#2E1A47' }, // Purple Black
    ];

    const salesPipelineData = [
        { stage: 'Market Research', deals: 30, totalValue: 50000, status: 'In Progress' },
        { stage: 'Team Outreach', deals: 20, totalValue: 40000, status: 'Pending' },
        { stage: 'Opportunity Review', deals: 15, totalValue: 35000, status: 'Completed' },
        { stage: 'Strategy Deployment', deals: 10, totalValue: 30000, status: 'Pending' },
        { stage: 'Deal Support', deals: 5, totalValue: 25000, status: 'Completed' },
        { stage: 'Closed Deals', deals: 20, totalValue: 25000, status: 'In Progress' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'In Progress':
                return <Badge color="blue">{status}</Badge>;
            case 'Pending':
                return <Badge color="orange">{status}</Badge>;
            case 'Completed':
                return <Badge color="green">{status}</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const cardData = [
        { title: 'Leads', monthCount: 150, todayCount: 25, icon: '🔗' },
        { title: 'Revenues', monthCount: 150, todayCount: '$20,000', icon: '💰' },
        { title: 'BDMs', monthCount: 150, todayCount: 2, icon: '👨‍💼' },
        { title: 'Tasks', monthCount: 150, todayCount: 3, icon: '⏳' },
        { title: 'Sales', monthCount: 150, todayCount: '$5,000', icon: '💵' },
        { title: 'Targets', monthCount: 150, todayCount: '$10,000', icon: '🎯' },
        { title: 'Contacts', monthCount: 150, todayCount: 15, icon: '📞' },
    ];

    const backgroundColors = [
        'linear-gradient(135deg, #ff7e5f, #feb47b)', // Gradient 1
        'linear-gradient(135deg, #6a11cb, #2575fc)', // Gradient 2
        'linear-gradient(135deg, #00c6ff, #0072ff)', // Gradient 3
        'linear-gradient(135deg, #ff9a8b, #ffc3a0)', // Gradient 4
        'linear-gradient(135deg, #e44d26, #f7b731)', // Gradient 5
        'linear-gradient(135deg, #6b6b6b, #b3b3b3)', // Gradient 6
        'linear-gradient(135deg, #f093fb, #f5576c)', // Gradient 7
    ];

    const BDMData = [
        { title: 'Leads', monthCount: 150, todayCount: 25, icon: '🔗', name1: 'Today', name2: 'Month' },
        { title: 'Calls', monthCount: 150, todayCount: 300, icon: '📞', name1: 'Today', name2: 'Month' },
        { title: 'Opportunity', monthCount: 150, todayCount: 300, icon: '💰', name1: 'Today', name2: 'Month' },
        { title: 'Appoinments', monthCount: 150, todayCount: 2, icon: '👨‍💼', name1: 'Today', name2: 'Month' },
        { title: 'Proposals', monthCount: 150, todayCount: 3, icon: '⏳', name1: 'Month', name2: 'Target' },
        { title: 'Closures', monthCount: 150, todayCount: 300, icon: '💵', name1: 'Month', name2: 'Target' },
    ];

    const bitcoin: any = {
        series: [
            {
                data: [21, 9, 36, 12, 44, 25, 59, 41, 25, 66],
            },
        ],
        options: {
            chart: {
                height: 45,
                type: 'line',
                sparkline: {
                    enabled: true,
                },
            },
            stroke: {
                width: 2,
            },
            markers: {
                size: 0,
            },
            colors: ['#00ab55'],
            grid: {
                padding: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            tooltip: {
                x: {
                    show: false,
                },
                y: {
                    title: {
                        formatter: () => {
                            return '';
                        },
                    },
                },
            },
            responsive: [
                {
                    breakPoint: 576,
                    options: {
                        chart: {
                            height: 95,
                        },
                        grid: {
                            padding: {
                                top: 45,
                                bottom: 0,
                                left: 0,
                            },
                        },
                    },
                },
            ],
        },
    };

    return (
        <>
            <div className="p-2">
                <div className="panel  mb-3 flex items-center justify-between gap-5 ">
                    <div className="flex items-center gap-5 pl-3">
                        <h5 className="text-lg font-semibold ">Leads</h5>
                    </div>
                    <div className="flex gap-5">
                        <button type="button" className="btn btn-primary font-white w-full md:mb-0 md:w-auto" onClick={() => router.push('/createLead')}>
                            + Create
                        </button>
                    </div>
                </div>
                {/* <div className="panel mt-2 flex flex-col items-center justify-between gap-5 lg:flex-row">
                    <div className="relative flex w-full max-w-lg rounded-full border border-gray-300 dark:border-white-dark/30">
                        <button type="submit" className="m-auto flex items-center justify-center px-3 py-2 text-primary ">
                            <IconSearch className="h-6 w-6 font-bold" /> 
                        </button>
                        <input
                            type="text"
                            value={state.search}
                            onChange={(e) => setState({ search: e.target.value })}
                            placeholder="Search"
                            className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row">
                        <CustomSelect
                            value={state.vertical}
                            onChange={(e) => {
                                if (e) {
                                    setState({ focus: '', vertical: e });
                                    getFocusSegmentList(e);
                                } else {
                                    setState({ focus: '', vertical: '' });
                                }
                            }}
                            placeholder={'Vertical'}
                            options={state.verticalList}
                            required
                            error={state.errors?.vertical}
                            className="w-full lg:w-64"
                        />
                        <CustomSelect options={state.focusList} value={state.focus} onChange={(e) => setState({ focus: e })} isMulti={false} placeholder={'Focus Segment'} className="w-full lg:w-64" />
                        <CustomSelect
                            options={state.marketList}
                            value={state.market}
                            onChange={(e) => setState({ market: e })}
                            isMulti={false}
                            placeholder={'Market Segment'}
                            className="w-full lg:w-64"
                        />
                    </div>

                   
                </div> */}

                <div className="panel   flex items-center justify-between ">
                    <div className="  flex items-center">
                        <div className="pb-2 ">
                            <SimpleGrid
                                cols={7}
                                spacing="sm"
                                breakpoints={[
                                    { maxWidth: 768, cols: 2 },
                                    { maxWidth: 576, cols: 1 },
                                ]}
                            >
                                {cardData.map((card, index) => (
                                    <div className="panel">
                                        <div className="mb-5 flex items-center font-semibold">
                                            <div className="grid h-10 w-10 shrink-0 place-content-center rounded-full">
                                                <IconBitcoin />
                                            </div>
                                            <div className="ltr:ml-2 rtl:mr-2">
                                                <h6 className="text-lg font-bold text-dark dark:text-white-light">{card.title}</h6>
                                                {/* <p className="text-xs text-white-dark">Bitcoin</p> */}
                                            </div>
                                        </div>
                                        <div className="mb-5">{!state.loading && <ReactApexChart series={bitcoin.series} options={bitcoin.options} type="line" height={45} width={'100%'} />}</div>
                                        <div className="flex items-center justify-between text-base font-bold">
                                            {/* <div>
                                                <div className="text-sm font-normal ">{card.name1}</div>
                                                <div>
                                                    <span className="text-xl font-bold  text-success">{card.todayCount}</span>
                                                </div>
                                            </div> */}
                                            {/* <div>
                                                <div className="text-sm font-normal "> {card.name2}</div>
                                                <div>
                                                    <span className="text-xl font-bold text-success">{card.monthCount}</span>
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                ))}
                            </SimpleGrid>
                        </div>
                    </div>
                    {/* <button className="btn btn-primary w-full lg:mt-0 lg:w-auto" onClick={() => setState({ isOpen: true })}>
                        <IconFilter />
                    </button> */}
                </div>
                <div className=" gap-4">
                    {/*  */}
                    {state.loading ? (
                        <div className="relative inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                            <CommonLoader />
                        </div>
                    ) : (
                        <>
                            {/* <SimpleGrid
                                cols={4}
                                spacing="sm"
                                breakpoints={[
                                    { maxWidth: 768, cols: 2 },
                                    { maxWidth: 576, cols: 1 },
                                ]}
                            >
                                {cardData.map((card, index) => (
                                    <Card
                                        key={index}
                                        shadow="sm"
                                        radius="lg"
                                        p="md"
                                        style={{
                                            background: backgroundColors[index], // Linear gradient background
                                            color: '#fff', // Text color for better contrast
                                            transition: 'transform 0.3s ease, opacity 0.3s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.05)'; // Slight zoom on hover
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)'; // Reset zoom
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Title size="30px" weight={600} mt="xs">
                                                {card.icon}
                                            </Title>
                                            <Text size="lg" weight={600} mt="xs">
                                                {card.title}
                                            </Text>
                                        </div>

                                        <div className="flex items-center gap-8 ">
                                            <div className="flex items-center gap-2">
                                                <Title size="10px" weight={600} mt="xs">
                                                    By Today
                                                </Title>
                                                <Text size="25px" weight={600} mt="xs">
                                                    {card.monthCount}
                                                </Text>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Title size="10px" weight={600} mt="xs">
                                                    By Month
                                                </Title>
                                                <Text size="25px" weight={600} mt="xs">
                                                    {card.monthCount}
                                                </Text>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </SimpleGrid> */}
                            <div className="panel mt-2  flex items-center">
                                {orderFilter?.map((link, index) => (
                                    <React.Fragment key={index}>
                                        <div
                                            onClick={() => {
                                                setState({ orderDateFilter: link });
                                                if (state.orderSubMenu == 'Sales by product') {
                                                    setState({ activeAccordion: 'topSellers' });
                                                }
                                            }}
                                            className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.orderDateFilter ? 'text-primary' : ' border-gray-300'} border-r`}
                                        >
                                            {link?.split(' ')?.map((word, i) => (
                                                <React.Fragment key={i}>
                                                    <span className="text-md cursor-pointer">{word}</span>
                                                    {i !== link.split(' ').length - 1 && <span className=" "></span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </React.Fragment>
                                ))}

                                <div className="flex items-center   gap-4 pl-5">
                                    <div className="">
                                        <input
                                            type="datetime-local"
                                            value={state.orderStartDate}
                                            onChange={(e) => {
                                                setState({ orderStartDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // min={mintDateTime(state.orderStartDate)}
                                        />
                                    </div>
                                    <div className="">
                                        <input
                                            type="datetime-local"
                                            value={state.orderEndDate}
                                            onChange={(e) => {
                                                setState({ orderEndDate: e.target.value });
                                            }}
                                            id="dateTimeCreated"
                                            name="dateTimeCreated"
                                            className="form-input"
                                            // min={mintDateTime(state.orderStartDate)}
                                        />
                                    </div>
                                    <button type="button" className="btn btn-primary font-white w-full md:mb-0 md:w-auto" onClick={() => router.push('/createLead')}>
                                        Go
                                    </button>
                                </div>
                                {/* <button className="btn btn-primary w-full lg:mt-0 lg:w-auto" onClick={() => setState({ isOpen: true })}>
                                    <IconFilter />
                                </button> */}
                            </div>

                            <>
                                <div className="grid grid-cols-2 gap-5 pb-5 pt-2">
                                    {/* Lead Source Chart */}
                                    <div className="panel items-center justify-center p-3">
                                        <div className="mb-2 flex w-full items-center gap-5">
                                            <h5 className="text-lg font-semibold dark:text-white-light">Lead Source</h5>
                                        </div>
                                        {state.isShowLead && !state.leadSourceZero ? (
                                            <ReactApexChart series={state.leadSource?.series} options={state.leadSource?.options} type="donut" height={400} width={'100%'} />
                                        ) : (
                                            <div className="flex items-center justify-center">No Data Found</div>
                                        )}
                                    </div>

                                    {/* Incoming Lead Chart */}
                                    <div className="panel items-center justify-center p-3">
                                        <div className="mb-2 flex w-full items-center gap-5">
                                            <h5 className="text-lg font-semibold dark:text-white-light">Incoming Lead</h5>
                                        </div>
                                        {state.isShowIncomLead && !state.leadIncomZero ? (
                                            <ReactApexChart key={state.leadSourceKey} series={state.incomLead?.series} options={state.incomLead?.options} type="area" height={400} width={'100%'} />
                                        ) : (
                                            <div className="flex items-center justify-center">No Data Found</div>
                                        )}
                                    </div>
                                </div>
                            </>

                            <div className=" col-span-12 flex flex-col   md:col-span-12 ">
                                <div className="flex items-center justify-between pb-3">
                                    <div className="relative flex w-full max-w-lg rounded-full border border-gray-300 dark:border-white-dark/30">
                                        <button type="submit" className="m-auto flex items-center justify-center px-3 py-2 text-primary ">
                                            <IconSearch className="h-6 w-6 font-bold" /> {/* Icon size slightly reduced */}
                                        </button>
                                        <input
                                            type="text"
                                            value={state.search}
                                            onChange={(e) => setState({ search: e.target.value })}
                                            placeholder="Search"
                                            className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div className="flex items-center justify-end pb-2 pr-3 pt-3">
                                        <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                                            {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <DataTable
                                        className="table-responsive"
                                        records={state.data}
                                        columns={state.columns}
                                        sortStatus={sortStatus}
                                        onSortStatusChange={setSortStatus}
                                        highlightOnHover
                                        totalRecords={state.data?.length}
                                        recordsPerPage={state.pageSize}
                                        minHeight={200}
                                        page={null}
                                        onPageChange={(p) => {}}
                                        withBorder={true}
                                        styles={{
                                            root: {
                                                overflowX: 'auto', // Enable horizontal scroll
                                            },
                                        }}
                                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                        // rowExpansion={{
                                        //     collapseProps: {
                                        //         transitionDuration: 500,
                                        //         animateOpacity: false,
                                        //         transitionTimingFunction: 'ease-out',
                                        //     },
                                        //     allowMultiple: false,
                                        //     content: ({ record, collapse }) =>
                                        //         state.expandedRow === record.id ? (
                                        //             <div>
                                        //                 <QuickEdit collapse={() => collapse()} />
                                        //             </div>
                                        //         ) : null,
                                        // }}
                                    />
                                </div>
                                <div className="mt-5 flex justify-end gap-3">
                                    <button disabled={!state.previous} onClick={handlePreviousPage} className={`btn ${!state.previous ? 'btn-disabled' : 'btn-primary'}`}>
                                        <IconArrowBackward />
                                    </button>
                                    <button disabled={!state.next} onClick={handleNextPage} className={`btn ${!state.next ? 'btn-disabled' : 'btn-primary'}`}>
                                        <IconArrowForward />
                                    </button>
                                </div>
                                <div className="panel   mt-3 flex items-center justify-between">
                                    <div className="  flex items-center">
                                        {orderFilter?.map((link, index) => (
                                            <React.Fragment key={index}>
                                                <div
                                                    onClick={() => {
                                                        setState({ orderDateFilter: link });
                                                        if (state.orderSubMenu == 'Sales by product') {
                                                            setState({ activeAccordion: 'topSellers' });
                                                        }
                                                    }}
                                                    className={`dark:hover:text-primary-dark hover: px-4 py-2 ${link == state.orderDateFilter ? 'text-primary' : ' border-gray-300'} border-r`}
                                                >
                                                    {link?.split(' ')?.map((word, i) => (
                                                        <React.Fragment key={i}>
                                                            <span className="text-md cursor-pointer">{word}</span>
                                                            {i !== link.split(' ').length - 1 && <span className=" "></span>}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </React.Fragment>
                                        ))}
                                        <div className="flex items-center   gap-4 pl-5">
                                            <div className="">
                                                <input
                                                    type="datetime-local"
                                                    value={state.orderStartDate}
                                                    onChange={(e) => {
                                                        setState({ orderStartDate: e.target.value });
                                                    }}
                                                    id="dateTimeCreated"
                                                    name="dateTimeCreated"
                                                    className="form-input"
                                                    // min={mintDateTime(state.orderStartDate)}
                                                />
                                            </div>
                                            <div className="">
                                                <input
                                                    type="datetime-local"
                                                    value={state.orderEndDate}
                                                    onChange={(e) => {
                                                        setState({ orderEndDate: e.target.value });
                                                    }}
                                                    id="dateTimeCreated"
                                                    name="dateTimeCreated"
                                                    className="form-input"
                                                    // min={mintDateTime(state.orderStartDate)}
                                                />
                                            </div>
                                            <button type="button" className="btn btn-primary font-white w-full md:mb-0 md:w-auto" onClick={() => router.push('/createLead')}>
                                                Go
                                            </button>
                                        </div>
                                    </div>
                                    {/* <button className="btn btn-primary w-full lg:mt-0 lg:w-auto" onClick={() => setState({ isOpen: true })}>
                                        <IconFilter />
                                    </button> */}
                                </div>
                                <div className="mt-2 flex h-[480px] flex-wrap gap-5">
                                    <div className="panel flex w-full flex-col items-center justify-center  p-3 ">
                                        <div className="mb-2 flex w-full items-center  gap-5">
                                            <h5 className="text-lg font-semibold dark:text-white-light">Sales Pipeline Stages</h5>
                                        </div>
                                        <Funnel data={pipelineData} />
                                        {/* <ReactApexChart series={stageChart.series} options={stageChart.options} className="rounded-lg bg-white dark:bg-black" type="pie" height={300} width={'100%'} /> */}
                                    </div>
                                </div>
                                <div className=" panel">
                                    <DataTable
                                        className="table-responsive"
                                        records={salesPipelineData}
                                        columns={[
                                            {
                                                accessor: 'stage',
                                                title: 'Stage',
                                                width: 100,
                                            },
                                            {
                                                accessor: 'deals',
                                                title: 'Number of Deals',
                                                render: (row: any) => <div className="flex items-center">{row.deals}</div>,
                                                width: 100,
                                            },
                                            {
                                                accessor: 'totalValue',
                                                title: 'Total Value ($)',
                                                render: (record) => record.totalValue.toLocaleString(), // Format number
                                                width: 100,
                                            },
                                            {
                                                accessor: 'status',
                                                title: 'Status',
                                                render: (record) => getStatusBadge(record.status), // Render Badge
                                                width: 100,
                                            },
                                        ]}
                                        sortStatus={sortStatus}
                                        onSortStatusChange={setSortStatus}
                                        highlightOnHover
                                        totalRecords={state.data?.length}
                                        recordsPerPage={state.pageSize}
                                        minHeight={200}
                                        page={null}
                                        onPageChange={(p) => {}}
                                        withBorder={true}
                                        styles={{
                                            root: {
                                                overflowX: 'auto', // Enable horizontal scroll
                                            },
                                        }}
                                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                        rowExpansion={{
                                            collapseProps: {
                                                transitionDuration: 500,
                                                animateOpacity: false,
                                                transitionTimingFunction: 'ease-out',
                                            },
                                            allowMultiple: false,
                                            content: ({ record, collapse }) =>
                                                state.expandedRow === record.id ? (
                                                    <div>
                                                        <QuickEdit collapse={() => collapse()} />
                                                    </div>
                                                ) : null,
                                        }}
                                    />
                                </div>
                                <div className="mt-5 flex justify-end gap-3">
                                    <button disabled={!state.previous} onClick={handlePreviousPage} className={`btn ${!state.previous ? 'btn-disabled' : 'btn-primary'}`}>
                                        <IconArrowBackward />
                                    </button>
                                    <button disabled={!state.next} onClick={handleNextPage} className={`btn ${!state.next ? 'btn-disabled' : 'btn-primary'}`}>
                                        <IconArrowForward />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <Modal
                    open={state.isOpenAssign}
                    addHeader={'Assign Lead'}
                    height={state.popupHeight}
                    close={() => clearAssignData()}
                    renderComponent={() => (
                        <div className="flex flex-col gap-5 p-5">
                            <div className="flex flex-col gap-5 ">
                                <CustomSelect
                                    title="Assigned To"
                                    value={state.assigned_to}
                                    onChange={(e) => setState({ assigned_to: e })}
                                    placeholder={'Assigned To'}
                                    options={state.createdByList}
                                    error={state.errors?.assigned_to}
                                    required
                                    isMulti
                                    menuOpen={(isOpen) => setState({ popupHeight: isOpen ? 500 : 'auto' })}
                                />
                            </div>

                            <div className="mt-3 flex items-center justify-end gap-3">
                                <button type="button" className="btn btn-outline-danger border " onClick={() => clearAssignData()}>
                                    Cancel
                                </button>
                                {/* <button type="button" className="btn btn-primary" onClick={() => assignedLead()}>
                                    {state.assignLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                                </button> */}
                            </div>
                        </div>
                    )}
                />
                <SideMenu
                    title="Filter"
                    open={state.isOpen}
                    close={() => setState({ isOpen: false })}
                    cancelOnClick={() => clearFilter()}
                    submitOnClick={() => filterData(state.currentPage)}
                    submitLoading={state.loading}
                    canceTitle="Reset"
                    renderComponent={() => (
                        <div>
                            <div className=" mb-5 mt-5 flex flex-col gap-4 md:mt-0  md:justify-between">
                                <CustomeDatePicker
                                    error={state.errors?.closing_date}
                                    value={state.opp_closing_date}
                                    placeholder="Date"
                                    title="Date"
                                    onChange={(e) => setState({ opp_closing_date: e })}
                                />
                                <CustomSelect
                                    title="Opportunity"
                                    value={state.tags}
                                    isMulti={true}
                                    onChange={(e) => setState({ tags: e })}
                                    placeholder={'Opportunity'}
                                    options={state.tagList}
                                    error={state.errors?.tags}
                                />
                                <CustomSelect
                                    title="Status"
                                    value={state.tags}
                                    isMulti={true}
                                    onChange={(e) => setState({ tags: e })}
                                    placeholder={'Status'}
                                    options={state.tagList}
                                    error={state.errors?.tags}
                                />
                                {/* <CustomSelect
                                    options={state.countryList}
                                    value={state.country}
                                    onChange={(e) => {
                                        if (e) {
                                            stateList(e);
                                        }
                                        setState({ country: e, state: '' });
                                    }}
                                    isMulti={false}
                                    placeholder={'Country'}
                                    title={'Country'}
                                />

                                <CustomSelect options={state.stateList} value={state.state} onChange={(e) => setState({ state: e })} isMulti={false} placeholder={'State'} title={'State'} /> */}
                                {/* <div id="" className="">
                                    <label className="text-md mb-2 block font-bold text-gray-700">Annual Revenue</label>
                                    <div id="" className="p-2">
                                        <InputRange STEP={1} MIN={0} MAX={state.maxPrice} values={state.range} handleChanges={(data) => setState({ range: data })} />
                                    </div>
                                    <div className="mt-2 flex w-full items-center justify-between">
                                        <span className="">{state?.range[0] ? roundOff(state?.range[0]) : 0}</span>
                                        <span className="">{state?.range[1] ? roundOff(state?.range[1]) : roundOff(state.maxPrice)}</span>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    )}
                />
            </div>
        </>
    );
};

export default Index;
