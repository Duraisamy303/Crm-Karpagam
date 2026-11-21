import IconBitcoin from '@/components/Icon/IconBitcoin';
import IconSearch from '@/components/Icon/IconSearch';
import CustomSelect from '@/components/Select';
import {
    Dropdown,
    Success,
    capitalizeFLetter,
    chartData,
    filterByDates,
    getDateRange,
    leadSourceColor,
    leadStatusColor,
    objIsEmpty,
    pageCounts,
    useSetState,
    viewPhoneNumber,
} from '@/utils/functions.utils';
import { Loader, SimpleGrid } from '@mantine/core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import Tippy from '@tippyjs/react';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import QuickEdit from '@/components/QuickEdit';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import SideMenu from '@/common_component/sideMenu';
import CustomeDatePicker from '@/common_component/datePicker';
import Models from '@/imports/models.import';
import { ROLE } from '@/utils/constant.utils';
import { PrivateRouter } from '@/utils/imports.utils';
import moment from 'moment';
import IconUserPlus from '@/components/Icon/IconUserPlus';
import Chip from '@/components/chip';
import useDebounce from '@/common_component/useDebounce';
import IconX from '@/components/Icon/IconX';
import { current } from '@reduxjs/toolkit';
import * as FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import IconLoader from '@/components/Icon/IconLoader';
import { IRootState } from '@/store';
import { useDispatch, useSelector } from 'react-redux';
import { leadIndex } from '@/store/crmConfigSlice';
import Pagination from '@/components/Pagination';
import IconTrash from '@/components/Icon/IconTrash';

const Leads = () => {
    const dispatch = useDispatch();

    const redux = useSelector((state: IRootState) => state.crmConfig);

    const router = useRouter();

    const prevDeps = useRef(null);

    const isInitialLoad = useRef(true);

    const [state, setState] = useSetState({
        state: [],
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
        bdeList: [],
        dmList: [],
        cardData: [],
        chartLoading: false,
        sourceList: [],
        assignList: [],
        expandedRow: null,
        coloumns: [],
        assignRole: null,
        chartsLoading: false,
        activeTab: '',
        today: false,
        month: false,
        card_lead_status: '',
        opporunity_status: '',
        userId: '',
        // data:
    });

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus | null>(null);

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        getData();
        userData();
        sourceList();
        leadList();
        leadStatusList();
        usersList();
    }, []);

    const deps = useMemo(
        () => ({
            activeTab: state.activeTab,
            search: debouncedSearch,
            assigned_to: state.assigned_to?.value,
            lead_source_category: state.lead_source_category?.value,
            lead_status: state.lead_status?.value,
            role: state.role,
            bdm: state.bdm?.value,
            bde: state.bde?.value,
            dm: state.dm?.value,
            tm: state.tm?.value,
            today: state?.today,
            month: state?.month,
            card_lead_status: state?.card_lead_status,
            from_date: state?.from_date,
            end_date: state?.end_date,
            sortStatus: sortStatus,
        }),
        [
            state.activeTab,
            debouncedSearch,
            state.assigned_to,
            state.lead_source_category,
            state.lead_status,
            state.role,
            state.bdm,
            state.bde,
            state.dm,
            state.tm,
            state?.today,
            state?.month,
            state?.card_lead_status,
            state.from_date,
            state.end_date,
            sortStatus,
        ]
    );

    useEffect(() => {
        const currentDeps = JSON.stringify(deps);

        if (isInitialLoad.current) {
            const page = redux?.leadIndex || state?.currentPage;
            if (redux?.leadIndex) {
                setState({ currentPage: redux.leadIndex });
            }
            leadList(page);
            isInitialLoad.current = false;
        } else if (prevDeps.current !== currentDeps) {
            leadList(1);
            countData();
        }

        prevDeps.current = currentDeps;
    }, [deps]);

    useEffect(() => {
        setState({ from_date: '', end_date: '' });
    }, [state.activeTab]);

    useEffect(() => {
        if (state.from_date || state.end_date) {
            setState({ activeTab: 'Custom' });
        }
    }, [state.from_date, state.end_date]);

    const leadList = async (page = 1) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.lead.list(body, page, null);
            tableData(res);
            setState({ loading: false, count: res?.count, next: res?.next, previous: res?.previous, currentPage: page, totalRecords: res?.count });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const sourceList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_cat_List(1);
            console.log('✌️res --->', res);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ sourceList: dropdownList, loading: false, sourcePage: 1, sourceHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const sourceLoadMore = async () => {
        try {
            setState({ sorceloadMore: true });
            const res: any = await Models.master.lead_cat_List(state.sourcePage + 1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ sourceList: [...state.sourceList, ...dropdownList], loading: false, sourcePage: state.sourcePage + 1, sourceHasNext: res.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const leadStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_status_list(1);
            const dropdownList = Dropdown(res.results, 'stage');

            setState({ leadStatusList: dropdownList, loading: false, leadStatusPage: 1, leadStatusHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const leadStatusLoadMore = async () => {
        try {
            setState({ leadStatusloadMore: true });
            const res: any = await Models.master.lead_status_list(state.leadStatusPage + 1);
            const dropdownList = Dropdown(res.results, 'stage');

            setState({
                leadStatusList: [...state.leadStatusList, ...dropdownList],
                leadStatusloadMore: false,
                leadStatusPage: state.leadStatusPage + 1,
                leadStatusHasNext: res.next,
            });
        } catch (error) {
            setState({ leadStatusloadMore: false });
            console.log('error: ', error);
        }
    };

    const usersList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.user.userList(1, null);
            console.log('usersList --->', res);
            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({ usersList: dropdownList, loading: false, userPage: 1, userHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const usersListLoadMore = async () => {
        try {
            setState({ leadStatusloadMore: true });
            const res: any = await Models.master.lead_status_list(state.leadStatusPage + 1);
            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));
            setState({ usersList: dropdownList, loading: false, userPage: 1, userHasNext: res?.next });

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

    const countData = async () => {
        try {
            // setState({ chartLoading: true });
            let body = bodyData();

            const res: any = await Models.lead.cart_count(body);
            console.log('countData --->', res);

            const count = [
                { title: 'Call', total: res?.total_call, this_month: res?.this_month_call, name1: 'This Month', name2: 'Total' },
                { title: 'Appointments', total: res?.total_appointments, this_month: res?.this_month_appointments, name1: 'This Month', name2: 'Total' },
                { title: 'Follow-Up', total: res?.['total_follow-up'], this_month: res?.['this_month_follow-up'], name1: 'This Month', name2: 'Total' },
                { title: 'Interested', total: res?.total_interested, this_month: res?.this_month_interested, name1: 'This Month', name2: 'Total' },
                { title: 'In Progress', total: res?.total_in_progress, this_month: res?.this_month_in_progress, name1: 'This Month', name2: 'Total' },
                { title: 'Converted', total: res?.total_converted, this_month: res?.this_month_converted, name1: 'This Month', name2: 'Total' },
            ];

            setState({ cardData: count, chartLoading: false });
        } catch (error) {
            setState({ chartLoading: false });
            console.log('error: ', error);
        }
    };

    const handleEdit = (id) => {
        dispatch(leadIndex(state.currentPage));
        router.push(`/updateLead?id=${id}`);
    };

    const handleView = (id) => {
        dispatch(leadIndex(state.currentPage));
        router.push(`/viewLead?id=${id}`);
    };

    const tableData = (res) => {
        const data = res?.results?.map((item) => {
            return {
                ...item,
                allData: item,
                lead: item.lead,
                source: capitalizeFLetter(item.lead_source_category?.name) || '',
                date: item.created_at ? moment(item.created_at).format('DD-MM-YYYY') : '',
                contact_person: capitalizeFLetter(item.college_contact?.student_name) || '',
                lead_status: capitalizeFLetter(item.stage?.stage),
                status_date: item.status_date ? moment(item.status_date).format('DD-MM-YYYY') : null,
                remark: capitalizeFLetter(item.remark),
                assigned_to: item.assigned_to?.username,
                follow_up: moment(item.status_date).format('DD-MM-YYYY'),
                contact_number: item.primary_contact?.phone_number,
                phone_number: item?.college_contact?.phone_number,

                updated_on: item?.updated_at ? moment(item?.updated_at).format('DD-MM-YYYY') : '',
                created_by: item.created_by ? capitalizeFLetter(item?.created_by?.first_name) + ' ' + capitalizeFLetter(item?.created_by?.last_name) : '',

                assigned: item.assign_to ? capitalizeFLetter(item?.assign_to?.first_name) + ' ' + capitalizeFLetter(item?.assign_to?.last_name) : '',
            };
        });
        console.log('✌️data --->', data);

        setState({ data: data, allData: res });
    };

    const getData = async () => {
        try {
            let res;
            if (state.activeTab === 'Year') {
                res = filterByDates('Year');
            } else if (state.activeTab === 'Last Month') {
                res = filterByDates('Last Month');
            } else if (state.activeTab === 'This Month') {
                res = filterByDates('This Month');
            } else if (state.activeTab === 'Last 7 Days') {
                res = filterByDates('Last 7 Days');
            }
            setState({ loading: false });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const userData = async () => {
        try {
            const res: any = await Models.auth.userDetails();
            console.log('userData --->', res);
            setState({ role: res?.designation, userId: res?.id });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const orderFilter = ['Year', 'Last Month', 'This Month', 'Last 7 Days', 'Custom'];

    const clearFilter = () => {
        setState({
            activeTab: '',
            from_date: '',
            end_date: '',
            card_lead_status: '',
            opporunity_status: '',
            today: false,
            month: false,
        });
        // getAllData(state.currentPage);
        // countData();
    };

    const filterCustomDate = async () => {
        try {
            setState({ loading1: true });
            let body = bodyData();
            if (state.from_date) {
                body.from_date = moment(state.from_date).format('YYYY-MM-DD');
            }

            if (state.end_date) {
                body.end_date = moment(state.end_date).format('YYYY-MM-DD');
            }

            let response: any;

            // if (ROLE.ADMIN == state.role || ROLE.BDM == state.role) {
            //     response = await Models.opportunity.filters(body, state.currentPage);
            // } else {
            //     response = await Models.opportunity.filters(body, state.currentPage, state?.userId);
            // }

            // const response: any = await Models.opportunity.filters(body, state.currentPage);
            tableData(response);
            countData();
            setState({
                loading1: false,
                totalRecords: response.count,
                next: response.next,
                previous: response.previous,
                isOpen: false,
            });
        } catch (error) {
            setState({ loading1: false });

            console.log('error: ', error);
        }
    };

    const bodyData = () => {
        let body: any = {};

        if (state.search) {
            body.search = state.search;
        }

        if (state.assigned_to) {
            body.userId = state.assigned_to?.value;
            body.assigned_leads = 'Yes';
        } else {
            body.team = 'Yes';
        }

        // if (state.lead_source) {
        //     body.lead_source = state.lead_source?.value;
        // }

        if (state.lead_source_category) {
            body.lead_source_category = state.lead_source_category?.value;
        }

        if (state.lead_status) {
            body.status = state.lead_status?.value;
        }

        if (state.today == true && state?.card_lead_status) {
            body.today = state.today;
            body.card_lead_status = state?.card_lead_status;
            body.opporunity_status = state?.opporunity_status;
        }
        if (state.month == true && state?.card_lead_status) {
            body.month = state.month;
            body.card_lead_status = state?.card_lead_status;
            body.opporunity_status = state?.opporunity_status;
        }
        if (state.activeTab == 'Year') {
            let date = getDateRange('Year');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.activeTab == 'Last Month') {
            let date = getDateRange('lastMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.activeTab == 'This Month') {
            let date = getDateRange('thisMonth');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }
        if (state.activeTab == 'Last 7 Days') {
            let date = getDateRange('last7Days');
            body.from_date = date?.start;
            body.end_date = date?.end;
        }

        if (state.from_date) {
            body.from_date = moment(state.from_date).format('YYYY-MM-DD');
        }

        if (state.end_date) {
            body.end_date = moment(state.end_date).format('YYYY-MM-DD');
        }

        if (sortStatus?.columnAccessor && sortStatus?.direction) {
            const orderingPrefix = sortStatus.direction === 'desc' ? '-' : '';
            const columnMapping = {
                'contact_person': 'created_at',
                'phone_number': 'created_at',
                'source': 'created_at',
                'date': 'created_at',
                'lead_status': 'created_at',
                'created_by': 'created_at',
                'assigned': 'created_at',
                'updated_on': 'created_at'
            };
            const backendField = columnMapping[sortStatus.columnAccessor] || sortStatus.columnAccessor;
            body.ordering = `${orderingPrefix}${backendField}`;
        }

        return body;
    };

    const handleRemove = (type) => {
        if (type == 'lead_source') {
            setState({ lead_source: null });
        } else if (type == 'lead_status') {
            setState({ lead_status: null });
        } else if (type == 'assigned_to') {
            setState({ assigned_to: null });
        }
    };

    const handleDelete = async (id) => {
        try {
            setState({ isDeleteLoading: true });
            const res = await Models.lead.delete(id);
            setState({ isDeleteLoading: false, isDeleteOpen: false });
            Success('Lead deleted successfully');
            leadList(state.currentPage);
        } catch (error) {
            setState({ isDeleteLoading: false });
            // Failure(error[0]);
            console.log('error: ', error);
        }
    };

    const exportToExcel = async () => {
        setState({ excelLoading: true });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        const exportColumns = [
            { title: 'Student Name', accessor: 'contact_person' },
            { title: 'Phone Number', accessor: 'phone_number' },
            { title: 'Email', accessor: (row: any) => row?.college_contact?.email },
            { title: 'Source', accessor: 'source' },
            { title: 'Created Date', accessor: 'date' },
            { title: 'Lead Status', accessor: 'lead_status' },
            { title: 'Created By', accessor: 'created_by' },
            { title: 'Assigned To', accessor: 'assigned' },
            { title: 'Updated Date', accessor: 'updated_on' },
            { title: 'Remark', accessor: 'remark' },
        ];

        worksheet.addRow(exportColumns.map((col) => col.title));

        let page = 1;
        let hasMoreData = true;
        let allData: any[] = [];

        while (hasMoreData) {
            try {
                const body = bodyData();
                const response: any = await Models.lead.list(body, page, null);

                if (response?.results && response?.results.length > 0) {
                    allData = [...allData, ...response?.results];
                }
                if (response?.next) {
                    page++;
                } else {
                    hasMoreData = false;
                }
            } catch (error) {
                console.error('Error fetching data for export:', error);
                hasMoreData = false;
            }
        }

        const processedData = allData?.map((item) => {
            return {
                ...item,
                allData: item,
                lead: item.lead,
                source: capitalizeFLetter(item.lead_source_category?.name) || '',
                date: item.created_at ? moment(item.created_at).format('DD-MM-YYYY') : '',
                contact_person: capitalizeFLetter(item.college_contact?.student_name) || '',
                lead_status: capitalizeFLetter(item.stage?.stage),
                status_date: item.status_date ? moment(item.status_date).format('DD-MM-YYYY') : null,
                remark: capitalizeFLetter(item.remark),
                follow_up: moment(item.status_date).format('DD-MM-YYYY'),
                contact_number: item.primary_contact?.phone_number,
                phone_number: item?.college_contact?.phone_number,
                updated_on: item?.updated_at ? moment(item?.updated_at).format('DD-MM-YYYY') : '',
                created_by: item.created_by ? capitalizeFLetter(item?.created_by?.first_name) + ' ' + capitalizeFLetter(item?.created_by?.last_name) : '',
                assigned: item.assign_to ? capitalizeFLetter(item?.assign_to?.first_name) + ' ' + capitalizeFLetter(item?.assign_to?.last_name) : '',
            };
        });

        processedData.forEach((row: any) => {
            const rowData = exportColumns.map((col) => {
                if (typeof col.accessor === 'function') {
                    return col.accessor(row);
                }
                return row[col.accessor];
            });
            worksheet.addRow(rowData);
        });

        exportColumns.forEach((_, i) => {
            const headerLength = exportColumns[i].title.length;
            worksheet.getColumn(i + 1).width = Math.max(20, headerLength + 2);
        });

        setState({ excelLoading: false });

        const buffer = await workbook.xlsx.writeBuffer();
        FileSaver.saveAs(
            new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            `Team_Assigned_Leads (${moment().format('DD-MM-YYYY')}).xlsx`
        );
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                {/* Title Section */}
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold"> TEAM ASSIGNED LEADS</h5>
                </div>
            </div>

            <div className="panel flex flex-wrap items-center justify-between gap-2 md:gap-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    {orderFilter?.map((link, index) => (
                        <React.Fragment key={index}>
                            <div
                                onClick={() => setState({ activeTab: link })}
                                className={`cursor-pointer border-r px-1 py-2  font-bold md:px-4 ${
                                    link === state.activeTab ? 'border-primary text-primary' : 'border-gray-300 text-gray-500 dark:border-gray-600 dark:text-gray-400'
                                } dark:hover:text-primary-dark hover:text-primary`}
                            >
                                {link?.split(' ')?.map((word, i) => (
                                    <React.Fragment key={i}>
                                        <span className="text-md">{word}</span>
                                        {i !== link.split(' ').length - 1 && <span className=" "></span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </React.Fragment>
                    ))}

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="w-full md:w-auto">
                            <input
                                type="datetime-local"
                                value={state.from_date}
                                onChange={(e) => setState({ from_date: e.target.value })}
                                id="dateTimeCreated"
                                name="dateTimeCreated"
                                className="form-input w-full"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <input
                                type="datetime-local"
                                value={state.end_date}
                                onChange={(e) => setState({ end_date: e.target.value })}
                                id="dateTimeCreated"
                                name="dateTimeCreated"
                                className="form-input w-full"
                            />
                        </div>
                        <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => filterCustomDate()}>
                            Go
                        </button>

                        <button type="button" className="btn btn-primary w-full md:w-auto" onClick={() => exportToExcel()}>
                            {state.excelLoading ? <IconLoader className=" h-4 w-4 animate-spin" /> : 'Excel'}
                        </button>
                    </div>
                </div>

                <button type="button" className="btn btn-primary w-full sm:mt-4 md:w-auto lg:mt-1" onClick={() => clearFilter()}>
                    Clear
                </button>
            </div>

            {/* {ROLE.DM === state.role && (
                <div className="chart-container panel mb-2 mt-2">
                    {!state.chartsLoading && <ReactApexChart series={state?.series} options={state?.chartData?.options} type="bar" height={400} width={'100%'} />}
                </div>
            )} */}

            <div className="panel mt-2 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div
                    // className={`relative flex items-center  rounded-full border border-gray-300 dark:border-white-dark/30 sm:w-[${
                    //     state.role == 'ADMIN' ? '400px' : state.role == 'BDE' ? '400px' : '1000px'
                    // }] `}
                    className={`relative flex w-full items-center  rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/3 `}
                >
                    <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                        <IconSearch className="h-6 w-6 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search ..."
                        className="form-input rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                    <CustomSelect value={state.assigned_to} onChange={(e) => setState({ assigned_to: e })} placeholder={'Select User'} options={state.usersList} error={state.errors?.assigned_to} />
                    <CustomSelect
                        value={state.lead_status}
                        onChange={(e) => setState({ lead_status: e })}
                        placeholder={'Lead Status'}
                        options={state.leadStatusList}
                        error={state.errors?.status}
                        loadMore={() => state.leadStatusHasNext && leadStatusLoadMore()}
                    />

                    {/* <CustomSelect
                        value={state.lead_status}
                        onChange={(e) => setState({ lead_status: e })}
                        placeholder={'Status'}
                        options={state.statusList}
                        error={state.errors?.lead_status}
                        className="w-full"
                        required
                    /> */}

                    <CustomSelect
                        value={state.lead_source_category}
                        onChange={(e) => setState({ lead_source_category: e })}
                        placeholder={'Lead Source Category'}
                        options={state.sourceList}
                        loadMore={() => state.sourceHasNext && sourceLoadMore()}
                    />
                </div>
            </div>

            <div className="panel   flex items-center justify-between pb-3">
                <div className="  flex items-center">
                    <div className="pb-2 ">
                        <SimpleGrid
                            cols={6}
                            spacing="sm"
                            breakpoints={[
                                { maxWidth: 768, cols: 2 },
                                { maxWidth: 576, cols: 1 },
                            ]}
                        >
                            {state.cardData?.map((card, index) => (
                                <div className="panel">
                                    <div className="mb-5 flex items-center font-semibold">
                                        <div className="grid h-10 w-10 shrink-0 place-content-center rounded-full">
                                            <IconBitcoin />
                                        </div>
                                        <div className="ltr:ml-2 rtl:mr-2">
                                            <h6 className="text-lg font-bold text-dark dark:text-white-light">{card.title}</h6>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-base font-bold">
                                        <div>
                                            <div className="text-sm font-normal ">{card.name1}</div>
                                            <div>
                                                <span className="text-xl font-bold  text-success">{card.this_month}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-normal "> {card.name2}</div>
                                            <div>
                                                <span className="text-xl font-bold text-success">{card.total}</span>
                                            </div>
                                        </div>
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
            <>
                <div className="flex items-center justify-end pb-2 pr-3 pt-3">
                    <div className="rounded-lg bg-gray-300 p-1 font-semibold">{pageCounts(state.currentPage, state.totalRecords)}</div>
                </div>
                <div>
                    <DataTable
                        className="table-responsive"
                        records={state.data}
                        fetching={state.loading1 || state.loading || state.subLoading}
                        loaderSize="lg"
                        loaderVariant="dots"
                        loaderColor="blue"
                        loaderBackgroundBlur={0}
                        // onRowClick={()=>tableRow(state.data)}
                        columns={[
                            {
                                accessor: 'contact_person',
                                title: 'Student Name',
                                sortable: true,
                            },
                            {
                                accessor: 'phone_number',
                                title: 'Contact',
                                sortable: true,
                                render: (row: any) => (
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm font-medium">{viewPhoneNumber(row?.phone_number)}</div>
                                        <a href={`mailto:${row?.college_contact?.email}`} className="text-xs text-blue-500 hover:underline">
                                            {row?.college_contact?.email}
                                        </a>
                                    </div>
                                ),
                            },

                            {
                                accessor: 'source',
                                title: 'Source',
                                sortable: true,
                                render: (row) => {
                                    return <span className={`text-md rounded-full px-2 py-1 font-medium ${leadSourceColor(row?.source)}`}>{row?.source}</span>;
                                },
                            },

                            { accessor: 'date', title: 'Created Date', width: 120, sortable: true },
                            {
                                accessor: 'lead_status',
                                title: 'Lead Status',
                                sortable: true,
                                render: (row) => {
                                    return <span className={`text-md rounded-full px-2 py-1 font-medium ${leadStatusColor(row?.lead_status)}`}>{row?.lead_status}</span>;
                                },
                            },
                            { accessor: 'created_by', title: 'Created By', sortable: true },

                            { accessor: 'assigned', title: 'Assigned To', sortable: true },

                            // { accessor: 'status_date', title: `${ROLE.TM == state.role ? 'Follow Up' : 'Status Date'}` },

                            { accessor: 'updated_on', title: 'Updated Date', sortable: true },

                            {
                                accessor: 'remark',
                                title: 'Remark ',
                                render: (row: any) => (
                                    <Tippy content={row?.remark} placement="top" className="rounded-lg bg-black p-1 text-sm text-white">
                                        <div>{row?.remark?.length > 20 ? `${row.remark.slice(0, 20)}...` : row?.remark}</div>
                                    </Tippy>
                                ),
                            },

                            {
                                accessor: 'actions',
                                title: 'Actions',
                                render: (row: any) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        {/* <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                                <button
                                                    type="button"
                                                    className="flex hover:text-primary"
                                                    onClick={() => {
                                                        state.expandedRow == row.lead?.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.lead?.id });
                                                    }}
                                                >
                                                    <IconNotesEdit />
                                                </button>
                                            </Tippy> */}

                                        <button
                                            type="button"
                                            className="flex hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(row?.id);
                                            }}
                                        >
                                            <IconEye />
                                        </button>
                                        {/* <button
                                            className="flex hover:text-info"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(row.lead?.id);
                                            }}
                                        >
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </button> */}

                                        {/* <button
                                            className="flex hover:text-info"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(row?.id);
                                            }}
                                        >
                                            <IconTrash className="h-4.5 w-4.5" />
                                        </button> */}
                                    </div>
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
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        onRowClick={({ id }) => {
                            if (state.expandedRow != id) {
                                setState({ expandedRow: id });
                                // router.push(`/update_contact?id=${id}`);
                            }
                        }}
                        rowExpansion={{
                            collapseProps: {
                                transitionDuration: 500,
                                animateOpacity: false,
                                transitionTimingFunction: 'ease-out',
                            },
                            allowMultiple: false,

                            content: ({ record, collapse }) => {
                                return (
                                    <>
                                        {state.expandedRow === record?.id ? (
                                            <div className="w-full bg-gray-50 px-4 py-2">
                                                <QuickEdit
                                                    id={state.expandedRow}
                                                    data={record}
                                                    collapse={() => {
                                                        collapse();
                                                    }}
                                                    statusList={state.statusList}
                                                    updateList={() => {
                                                        collapse();
                                                        setState({ expandedRow: null });
                                                        leadList(state?.currentPage);
                                                        countData();
                                                    }}
                                                    resetExpandedRow={() => {
                                                        setState({ expandedRow: null });
                                                    }}
                                                />
                                            </div>
                                        ) : null}
                                    </>
                                );
                            },
                        }}
                    />
                </div>

                <div className="mt-5 flex justify-center gap-3">
                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.count}
                        onPageChange={(page) => {
                            leadList(page);
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
export default PrivateRouter(Leads);
