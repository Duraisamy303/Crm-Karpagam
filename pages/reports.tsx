import { Models, PrivateRouter } from '@/utils/imports.utils';
import React, { useEffect, useState, Fragment } from 'react';
import { Dropdown, Failure, allValuesAreZero, objIsEmpty, useSetState } from '@/utils/functions.utils';
import CommonLoader from './elements/commonLoader';
import IconSearch from '@/components/Icon/IconSearch';
import CustomSelect from '@/components/Select';
import IconFilter from '@/components/Icon/IconFilter';
import Funnel from '@/common_component/funnelChart';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Tab } from '@headlessui/react';
import IconHome from '@/components/Icon/IconHome';
import IconLeads from '@/components/Icon/IconLead';
import SideMenu from '@/common_component/sideMenu';
import CustomeDatePicker from '@/common_component/datePicker';
import moment from 'moment';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});
const Reports = () => {
    const [state, setState] = useSetState({
        ownerList: [],
        loading: false,
        countryList: [],
        stateList: [],
        verticalList: [],
        focusList: [],
        marketSegmentList: [],
        funnelData: {},
        reportLead: null,
        reportOpportunity: {},
        reportData: {},
        isMounted: false,
        isOpen: false,
        from_date: null,
        to_date: null,
        activeTab: 'Lead',
        oppRecValue: '',
        oppoValue: [],
        oppoCount: [],
        currentLeadPage: 1,
        hasMoreLead: '',
        leadList: [],
        lead: '',
        isShowOppCount: false,
        isShowOppValue: false,
        isShowOppRec: false,
        isShowIncom: false,
        incommingOpportunity: {},
        leadSource: {},
        isShowLead: false,
        isShowIncomLead: false,
        incomLead: {},
        oppLoading: false,
        oppCountZero: false,
        oppValueZero: false,
        oppRecZero: false,
        oppIncZero: false,
        leadIncomZero: false,
        leadSourceZero: false,
        createdByList: [],
        assigned_to: '',
        role: '',
    });

    useEffect(() => {
        getUserDetails();
    }, []);

    useEffect(() => {
        if (state.activeTab == 'Lead') {
            reportLead();
            reportLeadSource();
        } else if (state.activeTab == 'Sales') {
            funnelChartCount();
        } else {
            reportOpportunity();
            reportValue();
            reportIncomValue();
            reportRecurringValue();
        }
    }, []);

    useEffect(() => {
        if (state.activeTab == 'Lead') {
            reportLead(true);
            reportLeadSource(true);
        } else if (state.activeTab == 'Sales') {
            funnelChartCount(true);
        } else {
            reportOpportunity(true);
            reportValue(true);
            reportIncomValue(true);
            reportRecurringValue(true);
        }
    }, [state.activeTab]);

    const getUserDetails = async () => {
        try {
            const res: any = await Models.auth.userDetails();
            setState({ role: res?.designation });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const filters = () => {
        let filter = false;
        if (state.vertical || state.focus_segment || state.market_segment || state.country || state.state || state.owner || state.lead || state.from_date || state.to_date || state.assigned_to) {
            filter = true;
        }
        return filter;
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

    const bodyData = () => {
        let body: any = {};

        if (state.vertical) {
            body.vertical = state.vertical?.value;
        }
        // if (state.lead) {
        //     body.lead = state.lead?.value;
        // }
        if (state.focus_segment) {
            body.focus_segment = state.focus_segment?.value;
        }
        if (state.owner) {
            body.owner = state.owner?.value;
        }
        if (state.market_segment) {
            body.market_segment = state.market_segment?.value;
        }
        if (state.country) {
            body.country = state.country?.value;
        }
        if (state.state) {
            body.state = state.state?.value;
        }
        if (state.from_date) {
            body.start_date = moment(state.from_date).format('YYYY-MM-DD');
        }

        if (state.to_date) {
            body.end_date = moment(state.to_date).format('YYYY-MM-DD');
        }

        if (state.assigned_to) {
            body.assigned_to = state.assigned_to?.value;
        }

        return body;
    };

    const reportOpportunity = async (filter = false) => {
        try {
            setState({ oppLoading: true });
            let body = {};
            if (filter) {
                if (filters()) {
                    body = bodyData();
                }
            }

            let res: any = await Models.report.reportOpportunity(body);
            const formatName = (name) => {
                if (name === 'no_decision') return 'No Decision';
                if (name === 'Oops-Follow up') return 'Oops Follow Up';
                return name.replace(/\b\w/g, (char) => char.toUpperCase());
            };

            const counts = Object.keys(res)
                .filter((name) => name !== 'total' && name !== 'monthly_data')
                .map((name) => ({
                    name: formatName(name),
                    count: res[name].count,
                }));

            const countSeries = counts?.map((item) => item?.count);
            const allValAreZero = allValuesAreZero(countSeries);
            const countLabels = counts?.map((item) => item?.name);

            const count = {
                series: countSeries, // Ensuring this is a plain array
                options: {
                    chart: {
                        type: 'donut',
                        height: 460,
                    },
                    labels: countLabels, // Ensuring this is a plain array
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
                    colors: ['#e2833f', '#691ac3', '#e73e5a', '#3ad4e2', '#7a7ce3', '#a2e530'],
                },
            };

            setState({
                oppoCount: count,
                oppLoading: false,
                isShowOppCount: count.series.length > 0,
                oppCountZero: allValAreZero,
            });
        } catch (error) {
            setState({ oppLoading: false });
        }
    };

    const reportValue = async (filter = false) => {
        try {
            setState({ oppLoading: true });
            let body = {};
            if (filter) {
                if (filters()) {
                    body = bodyData();
                }
            }

            let res: any = await Models.report.reportOpportunity(body);
            const formatName = (name) => {
                if (name === 'no_decision') return 'No Decision';
                if (name === 'Oops-Follow up') return 'Oops Follow Up';
                return name.replace(/\b\w/g, (char) => char.toUpperCase());
            };

            const values = Object.keys(res)
                .filter((name) => name !== 'total' && name !== 'monthly_data')
                .map((name) => ({
                    name: formatName(name),
                    value: res[name].value,
                }));

            const valueSeries = values?.map((item) => item?.value);
            const allValAreZero = allValuesAreZero(valueSeries);

            const valueLabels = values?.map((item) => item?.name);

            const count = {
                series: valueSeries,
                options: {
                    chart: {
                        type: 'donut',
                        height: 460,
                    },
                    labels: valueLabels,
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

            setState({
                oppoValue: count,
                oppLoading: false,
                isShowOppValue: count.series.length > 0,
                oppValueZero: allValAreZero,
            });
        } catch (error) {
            setState({ oppLoading: false });
        }
    };

    const reportRecurringValue = async (filter = false) => {
        try {
            setState({ oppLoading: true });
            let body = {};
            if (filter) {
                if (filters()) {
                    body = bodyData();
                }
            }

            let res: any = await Models.report.reportOpportunity(body);
            const formatName = (name) => {
                if (name === 'no_decision') return 'No Decision';
                if (name === 'Oops-Follow up') return 'Oops Follow Up';
                return name.replace(/\b\w/g, (char) => char.toUpperCase());
            };

            const recurringValues = Object.keys(res)
                .filter((name) => name !== 'total' && name !== 'monthly_data')
                .map((name) => ({
                    name: formatName(name),
                    recurring_value: res[name]?.recurring_value || 0,
                }));

            const recurringValueSeries = recurringValues?.map((item) => item?.recurring_value);
            const allValAreZero = allValuesAreZero(recurringValueSeries);

            const recurringValueLabels = recurringValues?.map((item) => item?.name);

            const count = {
                series: recurringValueSeries, // Ensuring this is a plain array
                options: {
                    chart: {
                        type: 'donut',
                        height: 460,
                    },
                    labels: recurringValueLabels, // Ensuring this is a plain array
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
                    colors: ['#e2833f', '#691ac3', '#e73e5a', '#3ad4e2', '#7a7ce3', '#a2e530'],
                },
            };

            setState({
                oppRecValue: count,
                oppLoading: false,
                isShowOppRec: count.series.length > 0,
                oppRecZero: allValAreZero,
            });
        } catch (error) {
            setState({ oppLoading: false });
        }
    };

    const reportIncomValue = async (filter = false) => {
        try {
            setState({ oppLoading: true });
            let body = {};
            if (filter) {
                if (filters()) {
                    body = bodyData();
                }
            }

            let res: any = await Models.report.reportOpportunity(body);
            const monthSeries = res?.monthly_data?.map((item) => item.count);
            const allValAreZero = allValuesAreZero(monthSeries);

            const monthLabels = res?.monthly_data?.map((item) => item.month);

            const incomOpp = {
                series: [
                    {
                        name: 'Count',
                        data: monthSeries,
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
                    labels: monthLabels,
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

            setState({
                oppLoading: false,
                isShowIncom: incomOpp?.series?.length > 0,
                incommingOpportunity: incomOpp,
                oppIncZero: allValAreZero,
            });
        } catch (error) {
            setState({ oppLoading: false });
        }
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

    const tabClassNames = (selected: boolean) =>
        `${selected ? ' text-lg !border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''}
        -mb-[1px] block border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black text-lg `;

    const clearFilter = () => {
        setState({
            state: '',
            vertical: '',
            country: '',
            market_segment: '',
            focus_segment: '',
            isOpen: false,
            owner: '',
            from_date: null,
            to_date: null,
            lead: '',
            assigned_to: '',
        });
        reportOpportunity();
        reportLead();
        reportLeadSource();
        funnelChartCount();
        reportValue();
        reportIncomValue();
        reportRecurringValue();
    };

    return (
        <div className="p-2">
            <div className="panel mb-2 flex items-center justify-between gap-5">
                <div className="flex items-center gap-5 pl-3">
                    <h5 className="text-lg font-semibold dark:text-white-light">Reports</h5>
                </div>
            </div>

            <div className="panel mb-2 flex items-center justify-between p-3">
                <Tab.Group>
                    <Tab.List className="mt-3 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                        {['Lead', 'Opportunity', 'Sales'].map((tab) => (
                            <Tab as={Fragment} key={tab}>
                                {({ selected }) => (
                                    <button
                                        onClick={() => {
                                            setState({
                                                activeTab: tab,
                                            });
                                        }}
                                        className={tabClassNames(selected)}
                                    >
                                        {tab}
                                    </button>
                                )}
                            </Tab>
                        ))}
                    </Tab.List>
                </Tab.Group>
                <button className="btn btn-primary" onClick={() => setState({ isOpen: true })}>
                    <IconFilter />
                </button>
            </div>
            {state.activeTab == 'Lead' ? (
                <>
                    {state.loading ? (
                        <div className="relative inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                            <CommonLoader />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-5">
                                <div className="panel w-full items-center   justify-center p-3">
                                    <div className="mb-2 flex w-full items-center  gap-5">
                                        <h5 className="text-lg font-semibold dark:text-white-light">Lead Source</h5>
                                    </div>
                                    {state.isShowLead && !state.leadSourceZero ? (
                                        // <ReactApexChart
                                        //     series={state.leadSource?.series}
                                        //     options={state.leadSource?.options}
                                        //     className="rounded-lg bg-white dark:bg-black"
                                        //     type="pie"
                                        //     height={300}
                                        //     width={'100%'}
                                        // />
                                        <ReactApexChart series={state.leadSource?.series} options={state.leadSource?.options} type="donut" height={400} width={'100%'} />
                                    ) : (
                                        <div className="flex items-center justify-center">No Data Found</div>
                                    )}
                                </div>
                            </div>
                            <div className="panel mt-3 flex w-full flex-col p-3">
                                <div className="mb-2 flex w-full items-center  gap-5">
                                    <h5 className="text-lg font-semibold dark:text-white-light">Incoming Lead</h5>
                                </div>
                                {state.isShowIncomLead && !state.leadIncomZero ? (
                                    <ReactApexChart key={state.leadSourceKey} series={state.incomLead?.series} options={state.incomLead?.options} type="area" height={400} width={'100%'} />
                                ) : (
                                    <div className="flex items-center justify-center">No Data Found</div>
                                )}
                            </div>
                        </>
                    )}
                </>
            ) : state.activeTab == 'Opportunity' ? (
                state.oppLoading ? (
                    <div className="relative inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                        <CommonLoader />
                    </div>
                ) : (
                    <>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <div className="panel flex w-full flex-col  p-3 md:w-[50%]">
                                <div className="mb-2 flex w-full items-center  gap-5">
                                    <h5 className="text-lg font-semibold dark:text-white-light">Count</h5>
                                </div>
                                {state.isShowOppCount && !state.oppCountZero ? (
                                    // <ReactApexChart
                                    //     series={state.oppoCount.series}
                                    //     options={state.oppoCount.options}
                                    //     className="rounded-lg bg-white dark:bg-black"
                                    //     type="pie"
                                    //     height={300}
                                    //     width={'100%'}
                                    // />
                                    <ReactApexChart series={state.oppoCount.series} options={state.oppoCount.options} type="donut" height={350} width={'100%'} />
                                ) : (
                                    <div className="flex items-center justify-center">No Data Found</div>
                                )}
                            </div>

                            <div className="panel flex w-full flex-col  p-3 md:w-[49%]">
                                <div className="mb-2 flex w-full items-center  gap-5">
                                    <h5 className="text-lg font-semibold dark:text-white-light">Value</h5>
                                </div>
                                {state.isShowOppValue && !state.oppValueZero ? (
                                    // <ReactApexChart
                                    //     series={state.oppoValue?.series}
                                    //     options={state.oppoValue?.options}
                                    //     className="rounded-lg bg-white dark:bg-black"
                                    //     type="pie"
                                    //     height={300}
                                    //     width={'100%'}
                                    // />
                                    <ReactApexChart series={state.oppoValue?.series} options={state.oppoValue?.options} type="donut" height={350} width={'100%'} />
                                ) : (
                                    <div className="flex items-center justify-center">No Data Found</div>
                                )}
                            </div>

                            <div className="panel flex w-full flex-col p-3">
                                <div className="mb-2 flex w-full items-center  gap-5">
                                    <h5 className="text-lg font-semibold dark:text-white-light">Recurring Value</h5>
                                </div>
                                {state.isShowOppRec && !state.oppRecZero ? (
                                    // <ReactApexChart
                                    //     series={state.oppRecValue?.series}
                                    //     options={state.oppRecValue?.options}
                                    //     className="rounded-lg bg-white dark:bg-black"
                                    //     type="pie"
                                    //     height={300}
                                    //     width={'100%'}
                                    // />
                                    <ReactApexChart series={state.oppRecValue?.series} options={state.oppRecValue?.options} type="donut" height={350} width={'100%'} />
                                ) : (
                                    <div className="flex items-center justify-center">No Data Found</div>
                                )}
                            </div>
                        </div>
                        <div className="panel mt-3 flex w-full  flex-col p-3">
                            <div className="mb-2 flex w-full items-center  gap-5">
                                <h5 className="text-lg font-semibold dark:text-white-light">Incoming Opportunity</h5>
                            </div>
                            {state.isShowIncom && !state.oppIncZero ? (
                                <ReactApexChart key={state.oppKey} series={state.incommingOpportunity?.series} options={state.incommingOpportunity?.options} type="area" height={325} width={'100%'} />
                            ) : (
                                <div className="flex items-center justify-center">No Data Found</div>
                            )}
                        </div>
                    </>
                )
            ) : (
                <div className="mt-2 flex flex-wrap gap-5">
                    <div className="panel flex w-full flex-col items-center justify-center  p-3 ">
                        <div className="mb-2 flex w-full items-center  gap-5">
                            <h5 className="text-lg font-semibold dark:text-white-light">Sales</h5>
                        </div>
                        <Funnel data={state.funnelData} />
                        {/* <ReactApexChart series={stageChart.series} options={stageChart.options} className="rounded-lg bg-white dark:bg-black" type="pie" height={300} width={'100%'} /> */}
                    </div>
                </div>
            )}

            <SideMenu
                title="Filter"
                open={state.isOpen}
                close={() => clearFilter()}
                cancelOnClick={() => clearFilter()}
                submitOnClick={() => {
                    funnelChartCount(true);
                    reportLead(true);
                    reportLeadSource(true);
                    reportOpportunity(true);
                    reportValue(true);
                    reportIncomValue(true);
                    reportRecurringValue(true);
                    setState({ isOpen: false });
                }}
                submitLoading={state.loading}
                canceTitle="Reset"
                renderComponent={() => (
                    <div className=" flex flex-col gap-5">
                        {/* <CustomSelect title="Lead " value={state.lead} onChange={(e) => setState({ lead: e })} placeholder={'Lead'} options={state.leadList} loadMore={() => leadListLoadMore()} /> */}
                        {state.role == 'ADMIN' && (
                            <CustomSelect options={state.ownerList} value={state.owner} onChange={(e) => setState({ owner: e })} isMulti={false} placeholder={'Owner'} title={'Owner'} />
                        )}
                        <CustomSelect
                            value={state.vertical}
                            onChange={(e) => {
                                if (e) {
                                    setState({ focus_segment: '', vertical: e });
                                } else {
                                    setState({ focus_segment: '', vertical: '' });
                                }
                            }}
                            placeholder={'Vertical'}
                            title={'Vertical'}
                            options={state.verticalList}
                            error={state.errors?.vertical}
                        />
                        <CustomSelect
                            options={state.focusList}
                            value={state.focus_segment}
                            onChange={(e) => setState({ focus_segment: e })}
                            isMulti={false}
                            placeholder={'Company Segment'}
                            title={'Company Segment'}
                        />
                        <CustomSelect
                            options={state.marketSegmentList}
                            value={state.market_segment}
                            onChange={(e) => setState({ market_segment: e })}
                            isMulti={false}
                            placeholder={'Market Segment'}
                            title={'Market Segment'}
                        />
                        <CustomSelect title="Assigned To" value={state.assigned_to} onChange={(e) => setState({ assigned_to: e })} placeholder={'Assigned To'} options={state.createdByList} />
                        <CustomSelect
                            value={state.country}
                            onChange={(e) => {
                                if (e) {
                                }
                                setState({ country: e, state: '' });
                            }}
                            placeholder={'Country'}
                            title={'Country'}
                            options={state.countryList}
                            error={state.errors?.country}
                        />
                        <CustomSelect value={state.state} onChange={(e) => setState({ state: e })} placeholder={'State'} title={'State'} options={state.stateList} error={state.errors?.state} />
                        <CustomeDatePicker value={state.from_date} placeholder="From" title="From Date" onChange={(e) => setState({ from_date: e, to_date: null })} />
                        <CustomeDatePicker value={state.to_date} placeholder="To" title="To Date" onChange={(e) => setState({ to_date: e })} />
                        {/* <div className=" flex justify-end gap-3">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    funnelChartCount(true);
                                    reportLead(true);
                                    reportOpportunity(true);
                                    setState({ isOpen: false });
                                }}
                            >
                                Submit
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => clearFilter()}>
                                Reset
                            </button>
                        </div> */}
                    </div>
                )}
            />
        </div>
    );
};

export default PrivateRouter(Reports);
