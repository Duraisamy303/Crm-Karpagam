import React, { useEffect, useState } from 'react';
import CustomfullCalender from '@/common_component/fullCalender';
import { Dropdown, Failure, Success, capitalizeFLetter, objIsEmpty, pageCounts, useSetState } from '@/utils/functions.utils';
import IconSearch from '@/components/Icon/IconSearch';
import CustomSelect from '@/components/Select';
import IconFilter from '@/components/Icon/IconFilter';
import CustomeDatePicker from '@/common_component/datePicker';
import Models from '@/imports/models.import';
import CommonLoader from './elements/commonLoader';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import moment from 'moment';
import { ROLE } from '@/utils/constant.utils';
import Tippy from '@tippyjs/react';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import SideMenu from '@/common_component/sideMenu';
import TextArea from '@/components/TextArea';
import IconLoader from '@/components/Icon/IconLoader';
import * as Yup from 'yup';
import { PrivateRouter, Validation } from '@/utils/imports.utils';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import IconSquareRotated from '@/components/Icon/IconSquareRotated';
import IconQuickEdit from '@/components/Icon/IconQuickEdit';
import ContactQuickEdit from '@/components/ContactQuickEdit';
import useDebounce from '@/common_component/useDebounce';
import CheckboxInput from '@/components/Checkbox';
import { useRouter } from 'next/router';
import Modal from '@/common_component/modal';
import FileUpload from '@/common_component/fileUpload';
import { IRootState } from '@/store';
import { useSelector } from 'react-redux';
import IconX from '@/components/Icon/IconX';
import TaskCard from '@/components/TaskCard';
import Pagination from '@/components/Pagination';

const Notifications = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const router = useRouter();

    const redux = useSelector((state: IRootState) => state.crmConfig);

    const [state, setState] = useSetState({
        contactList: [],
        previous: null,
        next: null,
        role: null,
        columns: [],
        currentPage: 1,
        totalRecords: 0,
        isOpenCreateContact: false,
        lead: '',
        contact: '',
        leadList: [],
        task_date_time: '',
        taskType: '',
        assigned_to: '',
        currentLeadPage: 1,
        expandedRow: null,
        isOpenImport: false,
        types: null,
        isOpenTask: false,
        task: {},
        conversationList: [],
        notificationList: [],
    });

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        noticationList(state.currentPage);
        userData();
    }, []);

    useEffect(() => {
        noticationList(1);
    }, [debouncedSearch, state.types,state.from_date,state.end_date]);

    const noticationList = async (page) => {
        setState({ loading: true });
        let body = bodyData();
        const res: any = await Models.notication.list(page, body);
        setState({ loading: false, currentPage: page });
        tableData(res);
        try {
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const tableData = (res: any) => {
        if (!res?.results) return;

        const data = res?.results?.map((item) => {
            return notificationData(item);
        });

        setState({
            notificationList: data,
            next: res.next,
            previous: res.previous,
            totalRecords: res.count,
            count: res.count,
            loading: false,
        });
    };

    const notificationData = (row) => {
        // Determine notification type and extract relevant data
        let type = '';
        let Ids = null;
        let lead_name = '';
        let contact = '';
        let status = '';
        let remark = '';
        let action = '';

        // Parse the value field if it exists
        let valueData = null;
        try {
            valueData = row.value ? JSON.parse(row.value.replace(/\\"/g, '"')) : null;
        } catch (e) {
            valueData = null;
        }

        // Determine notification type and extract data
        if (row.type === 'Lead' || row.type === 'lead_updated') {
            type = 'Lead';
            Ids = row.college_lead?.id;
            lead_name = row.college_lead ? 'Lead Assign' : valueData?.updated_what || row.message;
            contact = `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}` || valueData?.updated_by;
            status = 'Updated';
            action = valueData?.updated_what || 'Lead Updated';
        } else if (row.type === 'Contact') {
            type = 'Contact';
            Ids = row.contact?.id;
            lead_name = row.contact?.student_name || 'Contact Data';
            contact = `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}` || valueData?.updated_by;

            // contact = valueData?.updated_by || valueData?.created_by || `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`;
            status = valueData?.created_by ? 'Created' : 'Updated';
            action = valueData?.created_what || valueData?.updated_what || 'Contact Action';
        } else if (row.type === 'opportunity') {
            type = 'Opportunity';
            Ids = row.college_lead?.id;
            lead_name = row.college_lead ? 'Opportunity Data' : valueData?.updated_what || row.message;
            contact = valueData?.updated_by || `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`;
            status = 'Updated';
            action = valueData?.updated_what || 'Opportunity Updated';
        } else if (row.type.includes('task')) {
            type = 'Task';
            Ids = row.task || row.conversation?.id;

            if (row.type === 'task_conversation_created') {
                lead_name = 'Conversation';
                contact = `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`;
                status = 'Reply';
                action = 'Task Conversation';
                remark = row.conversation?.message;
            } else if (row.type === 'task_updated') {
                lead_name = 'Task Assign';
                contact = `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}` || valueData?.updated_by;

                // contact = valueData?.updated_by || `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`;
                status = 'Assigned';
                action = valueData?.updated_what || 'Task Updated';
            } else {
                lead_name = 'Task Action';
                contact = `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`;
                status = 'Task';
                action = row.message;
            }
        } else {
            // Default case for unknown types
            type = capitalizeFLetter(row.type) || 'Notification';
            Ids = row.id;
            lead_name = row.message;
            contact = `${row?.assigned_by?.first_name} ${row?.assigned_by?.last_name}`;
            status = 'Info';
            action = row.type;
        }

        return {
            Ids,
            type,
            lead_name,
            contact,
            assigned_to: `${row.assigned_by?.first_name} ${row.assigned_by?.last_name}`,
            status,
            date: row.created_at ? moment(row.created_at).format('DD-MM-YYYY HH:mm') : '',
            remark: remark || row.message,
            action,
            rawData: row, // Keep original data for reference
            is_read: row.is_read,
        };
    };

    const bodyData = () => {
        let body: any = {};
        if (state.search) {
            body.search = state.search;
        }
        if (state.types) {
            body.type = state.types?.value;
        }

        if (state.from_date) {
            body.from_date = moment(state.from_date).format('YYYY-MM-DD HH:mm:ss');
        }

        if (state.end_date) {
            body.end_date = moment(state.end_date).format('YYYY-MM-DD HH:mm:ss');
        }

        return body;
    };


    const userData = async () => {
        try {
            const res: any = await Models.auth.userDetails();
            setState({ role: res?.designation, userId: res?.id });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const onView = (row) => {
        if (row?.type === 'Lead' || row?.type === 'Opportunity') {
            router.push(`/viewLead?id=${row.Ids}`);
        } else if (row?.type === 'Contact') {
            router.push(`/update_contact?id=${row?.Ids}`);
        } else if (row?.type === 'Task') {
            taskDetails(row);
        } else {
            // For other notification types, show details in modal or console
            console.log('Notification details:', row);
        }
    };

    const taskDetails = async (row: any) => {
        try {
            setState({ viewLoad: true });
            const res = await Models.task.details(row?.Ids);
            const body = bodyData();
            const conversationList = await Models.task.get_reply_task_messages(row?.Ids);
            setState({ task: res, isOpenTask: true, conversationList });
            setState({ viewLoad: false });
        } catch (error) {
            setState({ viewLoad: false });
            console.log('✌️error --->', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            // Call API to mark notification as read
            // await Models.notication.markAsRead(notificationId);
            // // Update local state
            // const updatedList = state.notificationList.map(item =>
            //     item.rawData.id === notificationId ? {...item, is_read: true} : item
            // );
            // setState({ notificationList: updatedList });
        } catch (error) {
            console.log('Error marking as read:', error);
        }
    };

    return (
        <div className="p-2">
            <div className="panel  mb-3 flex items-center justify-between gap-5 ">
                <div className="flex items-center gap-5 pl-3">
                    <h5 className="text-lg font-semibold ">NOTIFICATIONS</h5>
                </div>
            </div>

            <div className="panel mt-2 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex w-full items-center rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-2/5">
                    <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                        <IconSearch className="h-6 w-6 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search ..."
                        className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                {/* Filter Select - Takes 1/5 of the width */}
                <div className="w-full lg:w-1/5">
                    <CustomSelect
                        value={state.types}
                        onChange={(e) => setState({ types: e })}
                        placeholder={'Filter By Type'}
                        options={[
                            { value: 'Lead', label: 'Lead' },
                            { value: 'Contact', label: 'Contact' },
                            { value: 'task_created', label: 'Assigned Task' },
                            { value: 'Task Reply', label: 'Task Replay' },
                        ]}
                        className="w-full"
                    />
                </div>

                {/* Date Filters - Each takes 1/5 of the width */}
                <div className="flex w-full gap-2 lg:w-2/5">
                    <div className="w-1/2">
                        <input
                            type="datetime-local"
                            value={state.from_date}
                            onChange={(e) => setState({ from_date: e.target.value })}
                            id="dateTimeCreated"
                            name="dateTimeCreated"
                            className="form-input w-full"
                        />
                    </div>
                    <div className="w-1/2">
                        <input
                            type="datetime-local"
                            value={state.end_date}
                            onChange={(e) => setState({ end_date: e.target.value })}
                            id="dateTimeCreated"
                            name="dateTimeCreated"
                            className="form-input w-full"
                        />
                    </div>
                </div>
            </div>

            <div className=" mt-2 grid grid-cols-12  gap-4">
                <div className=" col-span-12 flex flex-col   md:col-span-12">
                    <div className=" col-span-12 flex flex-col   md:col-span-12">
                        <div className="flex items-center justify-between pb-2 pr-3">
                            <div className="text-sm text-gray-500">Total: {state.totalRecords} notifications</div>
                            <div className="rounded-lg bg-gray-300 p-1 font-semibold">{pageCounts(state.currentPage, state.totalRecords)}</div>
                        </div>
                        <DataTable
                            className="table-responsive"
                            records={state.notificationList}
                            fetching={state.loading || state.subLoading}
                            loaderSize="lg"
                            loaderVariant="dots"
                            loaderColor="blue"
                            loaderBackgroundBlur={0}
                            columns={[
                                {
                                    accessor: 'type',
                                    title: 'Type',
                                    render: (row: any) => (
                                        <div
                                            className={`font-bold ${
                                                row?.type === 'Lead'
                                                    ? 'text-green-600'
                                                    : row?.type === 'Opportunity'
                                                    ? 'text-blue-600'
                                                    : row?.type === 'Contact'
                                                    ? 'text-purple-600'
                                                    : 'text-orange-600'
                                            }`}
                                        >
                                            {capitalizeFLetter(row?.type)}
                                        </div>
                                    ),
                                },
                                {
                                    accessor: 'lead_name',
                                    title: 'Title',
                                    render: (row: any) => <div className={!row.is_read ? 'font-semibold' : ''}>{row.lead_name}</div>,
                                },
                                {
                                    accessor: 'contact',
                                    title: 'Created By',
                                    render: (row: any) => <div className="text-sm text-gray-600">{capitalizeFLetter(row.contact)}</div>,
                                },
                                {
                                    accessor: 'assigned_to',
                                    title: 'Assigned To',
                                    render: (row: any) => <div className="text-sm">{capitalizeFLetter(row.assigned_to)}</div>,
                                },
                                {
                                    accessor: 'status',
                                    title: 'Action',
                                    render: (row: any) => (
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs ${
                                                row.status === 'Created'
                                                    ? 'bg-green-100 text-green-800'
                                                    : row.status === 'Updated'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : row.status === 'Reply'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {row.status}
                                        </span>
                                    ),
                                },
                                { accessor: 'date', title: 'Date & Time' },
                                {
                                    accessor: 'remark',
                                    title: 'Message',
                                    sortable: false,
                                    render: (row) => (
                                        <Tippy content={row?.remark} placement="top" className="rounded-lg bg-black p-1 text-sm text-white">
                                            <div className={`max-w-xs truncate ${!row.is_read ? 'font-medium' : ''}`}>{row?.remark}</div>
                                        </Tippy>
                                    ),
                                },
                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            {/* {!row.is_read && (
                                                <button
                                                    className="text-xs text-blue-600 hover:text-blue-800"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(row.rawData.id);
                                                    }}
                                                >
                                                    Mark Read
                                                </button>
                                            )} */}
                                            <button className="flex hover:text-primary" onClick={() => onView(row)}>
                                                <IconEye />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            onRowClick={(object) => onView(object)}
                            highlightOnHover
                            totalRecords={state.notificationList?.length}
                            recordsPerPage={state.pageSize}
                            minHeight={200}
                            page={null}
                            onPageChange={(p) => {}}
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
                                noticationList(page);
                                setState({ currentPage: page });
                            }}
                            hasNext={state.next !== null}
                            hasPrevious={state.previous !== null}
                            recordsPerPage={10}
                        />
                    </div>
                </div>
            </div>

            <Modal
                open={state.isOpenTask}
                addHeader={'Task Details'}
                close={() => setState({ isOpenTask: false, task: {} })}
                renderComponent={() => <TaskCard task={state.task} conversationList={state.conversationList} close={() => setState({ isOpenTask: false })} />}
            />
        </div>
    );
};
export default PrivateRouter(Notifications);
