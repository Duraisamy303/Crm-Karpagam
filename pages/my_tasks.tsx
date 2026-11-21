import React, { useEffect, useState } from 'react';
import CustomfullCalender from '@/common_component/fullCalender';
import { capitalizeFLetter, Dropdown, Failure, getBadgeColor, getDate, Success, useSetState } from '@/utils/functions.utils';
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
import IconEye from '@/components/Icon/IconEye';
import TaskCard from '@/components/TaskCard';
import next from 'next';
import Pagination from '@/components/Pagination';

const Calendar = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus | null>(null);

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
        task: '',
        isOpenTaskView: false,
        taskDetails: {},
        viewLoad: false,
    });

    useEffect(() => {
        initializeData();
        leadList();
    }, []);

    const debouncedSearch = useDebounce(state.search, 1000);

    useEffect(() => {
        calendarList();
        taskList(state.currentPage);
    }, [debouncedSearch, state.from_date, state.to_date, state.userId, sortStatus]);

    const bodyData = () => {
        let body: any = {};

        body.my_tasks = 'Yes';

        if (state.search) {
            body.search = debouncedSearch;
        }
        if (state.from_date) {
            body.task_date_time_after = moment(state.from_date).format('YYYY-MM-DD');
        }
        if (state.to_date) {
            body.task_date_time_before = moment(state.to_date).format('YYYY-MM-DD');
        }

        if (sortStatus?.columnAccessor && sortStatus?.direction) {
            const orderingPrefix = sortStatus.direction === 'desc' ? '-' : '';
            const columnMapping = {
                contact: 'created_at',
                task: 'created_at',
                date: 'created_at',
                assigned_to: 'created_at',
                created_at: 'created_at',
                remark: 'created_at',
            };
            const backendField = columnMapping[sortStatus.columnAccessor] || sortStatus.columnAccessor;
            body.ordering = `${orderingPrefix}${backendField}`;
        }

        return body;
    };

    const calendarList = async () => {
        try {
            const body = bodyData();
            const res: any = await Models.task.calendarTask(body, true);
            const data = res
                ?.map((item) => {
                    if (!item?.task_date_time) return null;

                    const taskDate = new Date(item.task_date_time);
                    if (isNaN(taskDate.getTime())) return null;

                    const startDate = new Date(taskDate);
                    const endDate = new Date(taskDate);

                    startDate?.setUTCHours(14, 30, 0, 0);
                    endDate?.setUTCHours(16, 30, 0, 0);

                    return {
                        id: item?.id,
                        title: capitalizeFLetter(item.contact?.student_name),
                        start: startDate?.toISOString(),
                        end: endDate?.toISOString(),
                        className: 'primary',
                        remark: item?.remark || 'No remarks',
                        ...item,
                    };
                })
                .filter(Boolean);
            console.log('✌️data --->', data);

            setState({ calenderList: data });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const initializeData = async () => {
        try {
            const [userResponse] = await Promise.all([Models.auth.userDetails()]);

            const userDetails: any = userResponse;
            console.log('✌️userDetails --->', userDetails);
            const token = localStorage.getItem('kaheToken');
            setState({
                userData: userDetails,
                token,
                userId: userDetails.user?.id,
            });

            // Now fetch calendar and task data with userId
            await Promise.all([calendarList(), taskList(state.currentPage)]);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const taskList = async (page) => {
        try {
            const body = bodyData();
            const res: any = await Models.task.list(body, page);
            tableData(res, page);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const tableData = (res: any, page: number) => {
        const data = res?.results?.map((item) => {
            return {
                ...item,
                assignData: item?.assigned_to,
                leadData: { value: item.contact?.id, label: item?.contact?.student_name },
                contactData: { value: item.contact?.id, label: item.contact?.name },
                leadName: item.contact?.lead?.name,
                leadId: item.contact?.lead?.id,
                task: item?.task_type,
                contact: capitalizeFLetter(item?.contact?.student_name),
                created_at: item?.created_at ? moment(item?.created_at).format('DD-MM-YYYY a') : '',

                date: item?.task_date_time ? getDate(item?.task_date_time) : '',

                description: item?.task_detail ? item?.task_detail : '',
                assigned_to:
                    item?.assigned_to?.length > 0
                        ? item.assigned_to.map((detail) => `${capitalizeFLetter(detail?.first_name)} ${capitalizeFLetter(detail?.last_name)}`)?.join(', ')
                        : `${capitalizeFLetter(item.created_by?.first_name)} ${capitalizeFLetter(item.created_by?.last_name)}`,
            };
        });
        console.log('list --->', data);

        setState({
            currentPage: page,
            count: res?.count,
            next: res.next,
            previous: res.previous,
            taskList: data,
            totalRecords: res.count,
        });
    };

    const leadList = async (page = 1) => {
        try {
            setState({ LeadMoreloading: true });
            const userString = localStorage.getItem('crmUser');
            const user = userString ? JSON.parse(userString) : null;

            const body = {
                userId: user?.id,
            };
            const res: any = await Models.lead.list(body, page, null);
            const dropdown = res?.results?.map((item) => ({
                value: item.college_contact?.id,
                label: `${capitalizeFLetter(item.college_contact?.student_name)} (${item.college_contact?.phone_number})`,
            }));
            console.log('✌️dropdown --->', dropdown);

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

            if (state.taskId) {
                const res: any = await Models.task.update(body, state.taskId);
            } else {
                const res: any = await Models.task.create(body);
            }
            clearTaskData();
            setState({ taskLoading: false });
            if (state.taskId) {
                Success('Task updated successfully');
            } else {
                Success('Task created successfully');
            }
            taskList(state.currentPage);
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

    const updateTask = (row) => {
        let value = {};
        if (row?.assignData?.length > 0) {
            value = { value: row?.assignData?.[0]?.groups, label: capitalizeFLetter(row?.assignData?.[0]?.groups) };
            usersList(value);
            setState({ assigned_to: row?.assignData?.map((item) => ({ value: item?.id, label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}` })) });
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

    const taskDetails = async (row: any) => {
        try {
            setState({ viewLoad: true });
            const res = await Models.task.details(row?.id);
            const conversationList: any = await Models.task.get_reply_task_messages(row?.id);
            setState({ taskDetails: res, isOpenTaskView: true, conversationList: conversationList });
            taskList(state.currentPage);

            setState({ viewLoad: false });
        } catch (error) {
            setState({ viewLoad: false });

            console.log('✌️error --->', error);
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
            taskList(state.currentPage);
        } catch (error) {
            setState({ replayLoad: false });
            Failure(error?.[0]);
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
                        placeholder="Search by student name"
                        className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                {/* Filters */}
                <div className="flex w-full flex-col gap-4 lg:w-2/3 lg:flex-row">
                    {/* <CustomSelect value={state.assigned} options={options} placeholder="Filter" onChange={(e) => setState({ assigned: e })} className="" /> */}

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
            </div>

            <div className=" mt-2 grid grid-cols-12  gap-4">
                <div className=" col-span-12 flex flex-col   md:col-span-12">
                    <div className=" col-span-12 flex flex-col   md:col-span-12">
                        <div className="flex items-center justify-end pb-2 pr-3">
                            <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                                {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                            </div>
                        </div>
                        <DataTable
                            className="table-responsive"
                            records={state.taskList}
                            fetching={state.loading || state.subLoading}
                            loaderSize="lg"
                            loaderVariant="dots"
                            loaderColor="blue"
                            loaderBackgroundBlur={0}
                            columns={[
                                { accessor: 'contact', title: 'Contact Name', sortable: true },
                                {
                                    accessor: 'task',
                                    title: 'Task Type',
                                    sortable: true,
                                    render: (row: any) => {
                                        return <span className={`text-md rounded-full px-2 py-1 font-medium ${getBadgeColor(row?.task)}`}>{row?.task}</span>;
                                    },
                                },
                                { accessor: 'date', title: 'Task Date', sortable: true },
                                { accessor: 'assigned_to', title: 'Assign To', sortable: true },
                                { accessor: 'created_at', title: 'Created Date', sortable: true },

                                {
                                    accessor: 'remark',
                                    title: 'Remark',
                                    // sortable: true,
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
                                            <button className="flex hover:text-primary" onClick={() => setState({ isOpenRemark: true, replayRemark: '', task_id: row?.id })}>
                                                <IconArrowBackward />
                                            </button>
                                            <button className="flex hover:text-info" onClick={() => updateTask(row)}>
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </button>

                                            <button className="relative flex hover:text-primary" onClick={() => taskDetails(row)}>
                                                {state.viewLoad && row?.id == state?.taskDetails?.id ? <IconLoader className=" h-4  w-4 animate-spin" /> : <IconEye />}
                                                {row.reply_counts > 0 && <p className="absolute right-[-15px] top-[-10px] rounded-md bg-gray-200 px-[5px] py-[1px] text-[10px]">{row.reply_counts}</p>}
                                            </button>

                                            <button className="flex hover:text-primary" onClick={() => setState({ isDeleteOpen: true, deleteId: row.id })}>
                                                <IconTrash className="h-4.5 w-4.5" />
                                            </button>
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
                    </div>
                    <div className="mt-5 flex justify-center gap-3">
                        <Pagination
                            currentPage={state.currentPage}
                            totalRecords={state.count}
                            onPageChange={(page) => {
                                taskList(page);
                                setState({ currentPage: page });
                            }}
                            hasNext={state.next !== null}
                            hasPrevious={state.previous !== null}
                            recordsPerPage={10}
                        />
                    </div>
                </div>
                {/* )} */}
            </div>

            <Modal
                open={state.isOpenTaskView}
                addHeader={'Task Details'}
                close={() => setState({ isOpenTaskView: false, taskDetails: {} })}
                renderComponent={() => <TaskCard task={state.taskDetails} conversationList={state.conversationList} btn={false} />}
            />

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
                        {/* <CustomSelect
                            title="Assign To"
                            value={state.assigned_to}
                            onChange={(e) => setState({ assigned_to: e })}
                            placeholder={'Assign To'}
                            options={state.assignList}
                            error={state.errors?.assigned_to}
                            required
                            isMulti={true}
                        /> */}

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
