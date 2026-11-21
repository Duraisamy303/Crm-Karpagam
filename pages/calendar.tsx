import React, { useEffect, useState } from 'react';
import CustomfullCalender from '@/common_component/fullCalender';
import { Dropdown, Failure, Success, useSetState } from '@/utils/functions.utils';
import IconSearch from '@/components/Icon/IconSearch';
import CustomSelect from '@/components/Select';
import CustomeDatePicker from '@/common_component/datePicker';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import CommonLoader from './elements/commonLoader';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import Tippy from '@tippyjs/react';
import IconEdit from '@/components/Icon/IconEdit';
import moment from 'moment';
import Models from '@/imports/models.import';
import useDebounce from '@/common_component/useDebounce';
import SideMenu from '@/common_component/sideMenu';
import { PrivateRouter, Validation } from '@/utils/imports.utils';
import * as Yup from 'yup';
import TextArea from '@/components/TextArea';
import Modal from '@/common_component/modal';
import IconLoader from '@/components/Icon/IconLoader';
import IconX from '@/components/Icon/IconX';
import Link from 'next/link';
import IconTrash from '@/components/Icon/IconTrash';
import { ROLE, TASK_TYPE } from '@/utils/constant.utils';

const Calendar = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const [state, setState] = useSetState({
        calenderList: [],
        taskList: [],
        currentPage: 1,
        totalRecords: 0,
        isOpenTask: false,
        currentLeadPage: 1,
        remark: '',
        userData: null,
        isOpenRemark: false,
        replayRemark: '',
        task_id: null,
        replayLoad: false,
        isDeleteOpen: false,
        deleteId: '',
        isDeleteLoad: false,
    });

    useEffect(() => {
        taskList(state.currentPage);
        // leadList();
        calendarList();
        getUserData();
    }, []);

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        taskList(1);
    }, [debouncedSearch, state.from_date, state.to_date, state.assigned]);

    // useEffect(() => {
    //     if (state.assignRole) {
    //         if (state.assignRole?.value == 'owner') {
    //             ownerList();
    //         } else if (state.assignRole?.value == 'bdm') {
    //             bdmList();
    //         } else if (state.assignRole?.value == 'tm') {
    //             telecallerList();
    //         } else if (state.assignRole?.value == 'bde') {
    //             bdeList();
    //         }
    //     }
    // }, [state.assignRole]);

    // const ownerList = async () => {
    //     try {
    //         const res: any = await Models.lead.ownerList();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const telecallerList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.bdmAndBDE();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const bdmList = async () => {
    //     try {
    //         const res: any = await Models.lead.bdmList();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const bdeList = async () => {
    //     try {
    //         const res: any = await Models.lead.bdeList();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    const bodyData = () => {
        let body: any = {};

        if (state.search) {
            body.contact = debouncedSearch;
        }
        if (state.from_date) {
            body.from_date_to_date_after = moment(state.from_date).format('YYYY-MM-DD');
        }
        if (state.to_date) {
            body.from_date_to_date_before = moment(state.to_date).format('YYYY-MM-DD');
        }

        if (state.assigned) {
            if (state.assigned?.value == 'assigned_by_me') {
                body.assigned_by_me = true;
            } else {
                body.assigned_to_me = true;
            }
        }

        return body;
    };

    const calendarList = async () => {
        try {
            const user: any = Models.auth.userDetails();
            const res: any = await Models.task.calendarTask(user?.id, true);
            const data = res
                ?.map((item) => {
                    if (!item?.task_date_time) {
                        console.error('Invalid task_date_time for item:', item);
                        return null;
                    }

                    const taskDate = new Date(item.task_date_time);
                    if (isNaN(taskDate.getTime())) {
                        console.error('Invalid date parsed from task_date_time:', item.task_date_time);
                        return null;
                    }

                    const startDate = new Date(taskDate);
                    const endDate = new Date(taskDate);

                    startDate.setHours(14, 30, 0, 0);

                    endDate.setHours(16, 30, 0, 0);

                    return {
                        id: item?.id,
                        title: item.contact?.name,
                        start: startDate?.toISOString(),
                        end: endDate?.toISOString(),
                        className: 'primary',
                        remark: item?.remark || 'No remarks',
                        ...item,
                    };
                })
                .filter(Boolean);

            setState({ calenderList: data });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const getUserData = async () => {
        try {
            const userString = localStorage.getItem('crmUser');
            const token = localStorage.getItem('kaheToken');
            const user = userString ? JSON.parse(userString) : null;
            setState({ userData: user, token });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const taskList = async (page) => {
        const body = bodyData();
        const res: any = await Models.task.list(body, page);
        tableData(res);
        setState({ currentPage: page });

        try {
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const tableData = (res: any) => {
        const data = res?.results?.map((item) => {
            return {
                ...item,
                assignData: item?.assignment_details,
                leadData: { value: item.contact?.lead?.id, label: item.contact?.lead?.name },
                contactData: { value: item.contact?.id, label: item.contact?.name },
                leadName: item.contact?.lead?.name,
                leadId: item.contact?.lead?.id,
                task: item?.task_type,
                contact: item?.contact?.name,
                date: item?.task_date_time ? moment(item?.task_date_time).format('DD-MM-YYYY') : '',
                description: item?.task_detail ? item?.task_detail : '',
                // assigned_to: item?.assignment_details?.length > 0 ? item.assignment_details.map((detail) => detail.assigned_to.username).join(', ') : item.created_by?.username,
                assigned_to:
                    item?.assignment_details?.length > 0
                        ? item.assignment_details.map((detail) => `${detail.assigned_to.first_name} ${detail.assigned_to.last_name}`).join(', ')
                        : `${item.created_by?.first_name} ${item.created_by?.last_name}`,
            };
        });

        setState({ taskList: data, next: res.next, previous: res.previous, totalRecords: res.count });
    };

    const getContactList = async (val) => {
        try {
            const res: any = await Models.contact.listByLeadId(val.value);
            const dropdown = Dropdown(res.results, 'name');
            setState({
                contactList: dropdown,
                contactCount: res?.count,
                contactNext: res.next,
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const createAndUpdateTask = async () => {
        try {
            setState({ taskLoading: true });

            const validateField = {
                lead: state.lead?.value,
                contact: state.contact?.value,
                task_date_time: state.task_date_time ? moment(state.task_date_time).format('YYYY-MM-DD') : '',
                task_type: state.task_type?.value,
                assigned_to: state.assigned_to,
                remark: state.remark,
                assignRole: state.assignRole?.value,
            };
            await Validation.createTask.validate(validateField, {
                abortEarly: false,
            });

            const body: any = {
                task_detail: state.details,
                // task_date_time: moment(state.task_date_time).format('YYYY-MM-DD'),
                contact: state.contact?.value,
                task_type: state.task_type?.value,
                task_assignment: state.assigned_to?.map((item) => ({ assigned_to: item.value })),
                remark: state.remark,
            };
            console.log('body: ', body);

            if (state.task_date_time) {
                body.task_date_time = moment(state.task_date_time).format('YYYY-MM-DD');
            }
            if (state.taskId) {
                const res: any = await Models.task.update(body, state.taskId);
                Success('Task updated successfully');
            } else {
                const res: any = await Models.task.create(body);
                Success(state.task_date_time ? 'Task created successfully' : 'Log created successfully');
            }
            // const res: any = await Models.task.update(body, state.taskId);
            clearTaskData();
            setState({ taskLoading: false });
            taskList(state.currentPage);
            calendarList();
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

    // const assignList = async () => {
    //     try {
    //         const res: any = await Models.task.all_user();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const leadList = async () => {
    //     try {
    //         const res: any = await Models.lead.list(state.currentLeadPage);
    //         const dropdownList = Dropdown(res?.results, 'name');

    //         setState({
    //             leadList: dropdownList,
    //             hasMoreLead: res.next,
    //         });
    //     } catch (error) {
    //         console.log('error: ', error);
    //     }
    // };

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
    //         console.log('error: ', error);
    //     }
    // };

    const handleNextPage = () => {
        if (state.next) {
            const newPage = state.currentPage + 1;
            taskList(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (state.previous) {
            const newPage = state.currentPage - 1;
            taskList(newPage);
        }
    };

    const updateTask = (row) => {
        let role = row.assignment_details?.[0]?.assigned_to;
        let value = {};
        if (role?.groups[0] == 'Admin') {
            value = { value: 'owner', label: 'Owner' };
        } else if (role?.groups[0] == 'BDM') {
            value = { value: 'bdm', label: 'BDM' };
        } else if (role?.groups[0] == 'BDE') {
            value = { value: 'bde', label: 'BDE' };
        } else if (role?.groups[0] == 'TM') {
            value = { value: 'tm', label: 'TM' };
        } else {
            value = null;
        }
        setState({
            taskId: row.id,
            isOpenTask: true,
            lead: row?.leadData,
            contact: row?.contactData,
            task_type: {
                label: row.task_type,
                value: row.task_type,
            },
            assignRole: value,
            task_date_time: row.task_date_time ? new Date(row.task_date_time) : null,
            remark: row?.remark ? row?.remark : '',
            // assigned_to: row?.assignment_details?.length > 0 ? row?.assignment_details?.map((item) => ({ value: item?.assigned_to?.id, label: item?.assigned_to?.username })) : null,
            assigned_to:
                row?.assignment_details?.length > 0
                    ? row.assignment_details.map((item) => ({
                        value: item?.assigned_to?.id,
                        label: `${item?.assigned_to?.first_name} ${item?.assigned_to?.last_name}`,
                    }))
                    : null,
        });
    };

    const handleDelete = async () => {
        try {
            setState({ isDeleteLoading: true });
            const res = await Models.task.deleteCalenderTask(state.deleteId);
            setState({ isDeleteLoading: false, isDeleteOpen: false });
            Success('Task deleted successfully');
            taskList(state.currentPage);
        } catch (error) {
            setState({ isDeleteLoading: false });
            // Failure(error[0]);
            console.log('error: ', error);
        }
    };

    const clearTaskData = () => {
        setState({
            details: '',
            isOpenTask: false,
            errors: '',
            taskId: '',
            lead: '',
            contact: '',
            task_date_time: '',
            assigned_to: null,
            task_type: null,
            assignRole: null,
            remark: '',
        });
    };

    const options = [
        { label: 'Assigned by me', value: 'assigned_by_me' },
        { label: 'Assigned to me', value: 'assigned_to_me' },
    ];

    const replayRemark = async () => {
        try {
            setState({ replayLoad: true });
            const body = {
                task: state.task_id,
                message: state.replayRemark,
            };

            const res = await Models.task.reply_task(body);
            setState({ replayLoad: false, isOpenRemark: false, replayRemark: '', task_id: null });
            Success('Task replied successfully');
        } catch (error) {
            setState({ replayLoad: false });
            Failure(error[0]);
            console.log('error: ', error);
        }
    };

    const handleRemove = (type) => {
        if (type == 'assigned') {
            setState({ assigned: null });
        } else if (type == 'from_date') {
            setState({ from_date: null });
        } else if (type == 'to_date') {
            setState({ to_date: null });
        }
    };

    return (
        <div className="p-2">
            <div className="panel  mb-3 flex items-center justify-between gap-5 ">
                <div className="flex w-full items-center justify-between gap-5 pl-3">
                    <h5 className="text-lg font-semibold ">TASKS</h5>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            setState({ isOpenTask: true, taskId: '' });
                        }}
                    >
                        Add
                        {/* {submitLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : submitTitle ? submitTitle : 'Submit'} */}
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row ">
                <div className="panel w-full">
                    <CustomfullCalender events={state.calenderList} eventClick={(event) => console.log('first', event)} />
                </div>
            </div>
            <div className="panel mt-2 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                {/* Search Bar */}
                <div className="relative flex w-full max-w-full items-center rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/3">
                    <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                        <IconSearch className="h-6 w-6 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search contact name"
                        className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                {/* Filters */}
                <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                    <CustomSelect value={state.assigned} options={options} placeholder="Filter" onChange={(e) => setState({ assigned: e })} className="" />

                    <CustomeDatePicker value={state.from_date} placeholder="From Date" onChange={(e) => setState({ from_date: e })} className="w-full md:w-1/2 lg:w-1/4" />
                    <CustomeDatePicker value={state.to_date} placeholder="To Date" onChange={(e) => setState({ to_date: e })} className="w-full md:w-1/2 lg:w-1/4" />

                    {/* <button className="btn btn-primary w-full lg:w-auto" onClick={() => setState({ isOpen: true })}>
                        <IconFilter />
                    </button> */}
                </div>
            </div>

            <div className="flex gap-2 pt-3">
                {state?.assigned?.label && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('assigned')}>
                            {state?.assigned?.label}
                            <div>
                                <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                            </div>
                        </div>
                    </div>
                )}
                {state?.from_date && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('from_date')}>
                            {moment(state?.from_date).format('DD/MM/YYYY HH:mm:ss')}
                            <div>
                                <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                            </div>
                        </div>
                    </div>
                )}
                {state?.to_date && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('to_date')}>
                            {moment(state?.to_date).format('DD/MM/YYYY HH:mm:ss')}

                            <div>
                                <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                            </div>
                        </div>
                    </div>
                )}

                {state?.card_lead_status && (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <div className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-200 px-2 py-1" onClick={() => handleRemove('status')}>
                            {`${state?.card_lead_status} (${state.today ? 'Today' : 'Month'})`}
                            <div>
                                <IconX className="h-4 w-4 cursor-pointer text-gray-600 hover:text-red-500" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className=" mt-2 grid grid-cols-12  gap-4">
                {state.loading || state.subLoading ? (
                    <div className="relative inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                        <CommonLoader />
                    </div>
                ) : (
                    <div className=" col-span-12 flex flex-col   md:col-span-12">
                        <div className=" col-span-12 flex flex-col   md:col-span-12">
                            <div className="flex items-center justify-end pb-2 pr-3">
                                <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                                    {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                                </div>
                            </div>
                            {state.taskList?.length > 0 && (
                                <DataTable
                                    className="table-responsive"
                                    records={state.taskList}
                                    columns={[
                                        {
                                            accessor: 'leadName',
                                            title: 'Lead Name',
                                            render: (row: any) => {
                                                return (
                                                    <Link href={`/viewLead?id=${row?.leadId}`} className=" cursor-pointer hover:text-blue-600">
                                                        {row.leadName}
                                                    </Link>
                                                );
                                            },
                                        },
                                        { accessor: 'contact', title: 'Contact Name' },
                                        { accessor: 'task', title: 'Task Type' },
                                        { accessor: 'date', title: 'Task Date' },
                                        { accessor: 'assigned_to', title: 'Assign To', sortable: false },
                                        {
                                            accessor: 'remark',
                                            title: 'Remark',
                                            sortable: false,
                                            render: (row) => (
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
                                                    {/* <button className="flex hover:text-primary" onClick={() => console.log('View task', row)}>
                                                        <IconEye />
                                                    </button> */}
                                                    {state?.userData?.id == row?.created_by?.id ? (
                                                        <button className="flex hover:text-info" onClick={() => updateTask(row)}>
                                                            <IconEdit className="h-4.5 w-4.5" />
                                                        </button>
                                                    ) : (
                                                        <button className="flex hover:text-info" onClick={() => setState({ isOpenRemark: true, replayRemark: '', task_id: row.id })}>
                                                            <IconArrowBackward className="h-4.5 w-4.5" />
                                                        </button>
                                                    )}
                                                    {state?.userData?.designation == ROLE.ADMIN && (
                                                        <button className="flex hover:text-primary" onClick={() => setState({ isDeleteOpen: true, deleteId: row.id })}>
                                                            <IconTrash className="h-4.5 w-4.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ),
                                        },
                                    ]}
                                    highlightOnHover
                                    totalRecords={state.taskList?.length}
                                    recordsPerPage={null}
                                    minHeight={200}
                                    page={null}
                                    onPageChange={(p) => { }}
                                    withBorder={true}
                                    sortStatus={sortStatus}
                                    onSortStatusChange={setSortStatus}
                                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                />
                            )}
                        </div>
                        <div className="mt-5 flex justify-center gap-3">
                            <button disabled={!state.previous} onClick={handlePreviousPage} className={`btn ${!state.previous ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowBackward />
                            </button>
                            <button disabled={!state.next} onClick={handleNextPage} className={`btn ${!state.next ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowForward />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <SideMenu
                title={state.taskId ? 'Update Task' : 'Create Task'}
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
                                    if (e) {
                                        getContactList(e);
                                    }
                                    setState({ lead: e, contact: '' });
                                }}
                                placeholder={'Lead '}
                                options={state.leadList}
                                error={state.errors?.lead}
                                required
                            // loadMore={() => leadListLoadMore()}
                            />
                            <CustomSelect
                                title="Contact"
                                value={state.contact}
                                onChange={(e) => setState({ contact: e })}
                                placeholder={'Contact '}
                                options={state.contactList}
                                error={state.errors?.contact}
                                required
                            />
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
                            onChange={(e) => setState({ assignRole: e, assigned_to: '', assignList: [] })}
                            placeholder={'Choose Role'}
                            title={'Choose Role'}
                            options={[
                                { value: 'owner', label: 'Owner' },
                                { value: 'bdm', label: 'BDM' },
                                { value: 'bde', label: 'BDE' },
                                { value: 'tm', label: 'TM' },
                            ]}
                            error={state.errors?.assignRole}
                        />
                        <CustomSelect
                            title="Assign To"
                            value={state.assigned_to}
                            onChange={(e) => setState({ assigned_to: e })}
                            placeholder={'Assign To'}
                            options={state.assignList}
                            error={state.errors?.assigned_to}
                            isMulti={true}
                        />

                        <TextArea height="150px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} error={state.errors?.remark} required />
                    </div>
                )}
            />

            <Modal
                open={state.isOpenRemark}
                close={() => setState({ isOpenRemark: false, replayRemark: '' })}
                renderComponent={() => (
                    <div className="rounded-lg bg-white p-6 shadow-lg ">
                        <TextArea title="Replay" height="120px" value={state.replayRemark} onChange={(e) => setState({ replayRemark: e })} placeholder={'Replay'} />

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpenRemark: false, replayRemark: '' })}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                onClick={() => {
                                    replayRemark();
                                }}
                            >
                                {state.replayLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            />

            <Modal
                open={state.isDeleteOpen}
                close={() => setState({ isDeleteOpen: false, department: '', errors: {}, deleteId: '' })}
                renderComponent={() => (
                    <div className="p-5">
                        <div className="text-sm text-dark">
                            <p style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.5' }}>Are You Sure, Do you want to delete? This process cannot be Reverted.</p>
                        </div>
                        <div className="mt-0 flex items-center justify-end">
                            <button type="button" onClick={() => setState({ isDeleteOpen: false, deleteId: '' })} className="btn btn-outline-danger">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    handleDelete();
                                }}
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                            >
                                {state.isDeleteLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : 'Delete'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};
export default PrivateRouter(Calendar);
