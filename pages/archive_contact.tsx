import React, { useEffect, useState, useRef } from 'react';
import CustomfullCalender from '@/common_component/fullCalender';
import { Dropdown, Failure, Success, capitalizeFLetter, objIsEmpty, useSetState } from '@/utils/functions.utils';
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
import { useDispatch, useSelector } from 'react-redux';
import IconX from '@/components/Icon/IconX';
import * as FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import Pagination from '@/components/Pagination';
import { contactIndex } from '@/store/crmConfigSlice';
import IconTrash from '@/components/Icon/IconTrash';

const Contacts = () => {
    const dispatch = useDispatch();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus | null>(null);

    const router = useRouter();

    const isInitialized = useRef(false);

    const redux: any = useSelector((state: IRootState) => state.crmConfig);

    const [state, setState] = useSetState({
        contactList: [],
        previous: null,
        next: null,
        role: null,
        columns: [],
        currentPage: redux.contactIndex || 1,
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
        isClick: false,
        importLoading: false,
        errorContacts: [],
        to_date: null,
        from_date: null,
        isFirstLoad: true,
    });

    const debouncedSearch = useDebounce(state.search, 1000);

    const debouncedPhnoSearch = useDebounce(state.phone_number_search, 1000);

    useEffect(() => {
        const page = redux.contactIndex || 1;
        setState({ currentPage: page });
        contactList(page);
        statusList();
        leadList();
        contactStatusList();
        isInitialized.current = true;
    }, []);

    useEffect(() => {
        if (!isInitialized.current) return;

        setState({ currentPage: 1 });
        dispatch(contactIndex(1));

        contactList(1);
    }, [debouncedSearch, debouncedPhnoSearch, state.status, state.role, state.assigned_to, state.from_date, state.to_date, sortStatus]);

    const bodyData = () => {
        let filter: any = {};

        filter.team = 'Yes';

        if (state.search) {
            filter.search = state.search;
        }

        if (state.phone_number_search) {
            filter.phone_number_search = state.phone_number_search;
        }

        if (state.status) {
            filter.status = state.status?.value;
        }

        if (state.lead_source) {
            filter.lead_source = state.lead_source?.value;
        }
        if (state.lead_status) {
            filter.status = state.lead_status?.value;
        }

        if (state.from_date) {
            filter.from_date = moment(state.from_date).format('YYYY-MM-DD');
        }

        if (state.to_date) {
            filter.to_date = moment(state.to_date).format('YYYY-MM-DD');
        }

        if (sortStatus) {
            filter.ordering = sortStatus.direction === 'desc' ? `-${sortStatus.columnAccessor}` : sortStatus.columnAccessor;
        }

        if (sortStatus?.columnAccessor && sortStatus?.direction) {
            const orderingPrefix = sortStatus.direction === 'desc' ? '-' : '';
            const columnMapping = {
                student_name: 'created_at',
                phone_number: 'created_at',
                date: 'created_at',
                status: 'created_at',
                updated_on: 'updated_at',
            };
            const backendField = columnMapping[sortStatus.columnAccessor] || sortStatus.columnAccessor;
            filter.ordering = `${orderingPrefix}${backendField}`;
        }
        return filter;
    };

    const contactList = async (page) => {
        setState({ loading: true });
        const body = bodyData();

        const res: any = await Models.contact.archive_list(page, body);

        setState({ loading: false, currentPage: page, count: res.count, next: res.next, previous: res.previous, isFirstLoad: false });
        tableData(res);

        try {
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const tableData = (res: any) => {
        const data = res?.results?.map((item) => {
            return {
                ...item,
                student_name: item?.student_name ? capitalizeFLetter(item?.student_name) : '',
                contact_person: item?.name ? capitalizeFLetter(item?.name) : '',
                contact_number: item?.phone_number,
                designation: item?.designation ? capitalizeFLetter(item?.designation) : '',
                remark: item?.remark ? item?.remark : '',
                status: item?.status?.status,
                allData: item,
                date: moment(item?.created_on).format('DD-MM-YYYY'),
            };
        });
        console.log('data: ', data);

        setState({ contactList: data, next: res.next, previous: res.previous, totalRecords: res.count });
    };

    const contactStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.contact_status_list(1);
            const dropdownList = Dropdown(res.results, 'status');
            setState({ contactStatusList: dropdownList, loading: false, contactStatusPage: 1, contactStatusHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };
    const contactStatusLoadMore = async () => {
        try {
            setState({ contactStatusloadMore: true });
            const res: any = await Models.master.contact_status_list(state.contactStatusPage + 1);
            const dropdownList = Dropdown(res.results, 'status');
            setState({
                contactStatusList: [...state.contactStatusList, ...dropdownList],
                contactStatusloadMore: false,
                contactStatusPage: state.contactStatusPage + 1,
                contactStatusHasNext: res.next,
            });
        } catch (error) {
            setState({ contactStatusloadMore: false });
            console.log('error: ', error);
        }
    };

    const userData = async () => {
        try {
            const res: any = await Models.auth.userDetails();
            setState({ role: res?.designation, userId: res?.id });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const statusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.status();
            const dropdownList = Dropdown(res, 'status');
            setState({ statusList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const clearContactData = (rowId: any) => {
        setState({
            name: '',
            department: '',
            designation: '',
            phone_number: '',
            email_id: '',
            lead_source: '',
            status: '',
            is_active: false,
            isOpenCreateContact: false,
            errors: '',
            remark: '',
            moveToLead: false,
            is_archive: false,
            contactId: null,
            expandedRow: rowId,
        });
    };

    const createContact = async (rowId) => {
        try {
            setState({ createContactLoad: true, errors: {} });

            const validateField = {
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation,
                phone_number: state.phone_number,
                email_id: state.email_id,
                name: state.name,
                lead: state.lead?.value,
                moveToLead: state.moveToLead,
            };

            const body = {
                // lead: id,
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation,
                phone_number: state.phone_number,
                email_id: state.email_id,
                is_active: state.is_active,
                name: state.name,
                is_archive: state.is_archive,
                lead: state.moveToLead ? state.lead?.value : null,
                remark: state.remark,
            };

            await Validation.createNewContact.validate(validateField, { abortEarly: false });

            await Models.contact.create(body);
            Success('Contact created successfully');
            clearContactData(rowId);
            contactList(state.currentPage);
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = error.inner.reduce((acc, err) => {
                    acc[err.path] = err.message;
                    return acc;
                }, {});
                setState({ errors: validationErrors });
            } else {
                console.log('Error: ', error?.message);
            }
        } finally {
            setState({ createContactLoad: false });
        }
    };

    const updateContacts = async (rowId) => {
        try {
            setState({ createContactLoad: true, errors: {} });

            const validateField = {
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation?.trim(),
                phone_number: state.phone_number?.trim(),
                email_id: state.email_id?.trim(),
                name: state.name?.trim(),
                lead: state.lead?.value,
                moveToLead: state.moveToLead,
                company_name: state.company_name?.trim(),
            };

            const body = {
                // lead: id,
                status: state.status?.value,
                lead_source: state.lead_source?.value,
                department: state.department?.value,
                designation: state.designation?.trim(),
                phone_number: state.phone_number,
                email_id: state.email_id?.trim(),
                is_active: state.is_active,
                name: state.name?.trim(),
                company_name: state.company_name?.trim(),
                is_archive: state.is_archive,
                lead: state.moveToLead ? state.lead?.value : null,
                remark: state.remark?.trim(),
            };

            await Validation.createNewContact.validate(validateField, { abortEarly: false });

            await Models.contact.update(body, state.contactId);
            Success('Contact updated successfully');
            clearContactData(rowId);
            contactList(state.currentPage);
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = error.inner.reduce((acc, err) => {
                    acc[err.path] = err.message;
                    return acc;
                }, {});

                setState({ errors: validationErrors });
            } else {
                console.log('Error: ', error?.message);
            }
        } finally {
            setState({ createContactLoad: false });
        }
    };

    const updateContact = (row) => {
        setState({
            isOpenCreateContact: true,
            contactId: row.id,
            name: row.name?.trim(),
            company_name: row.company_name?.trim(),
            email_id: row.email_id?.trim(),
            phone_number: row.phone_number,
            designation: row.designation?.trim(),
            department: objIsEmpty(row.department) ? null : { value: row.department.id, label: row.department.department },
            lead_source: objIsEmpty(row.lead_source) ? null : { value: row.lead_source.id, label: row.lead_source.source },
            status: objIsEmpty(row.allData?.status) ? null : { value: row.allData?.status.id, label: row.allData?.status.status },
            remark: row.remark?.trim(),
            moveToLead: objIsEmpty(row.lead) ? false : true,
            lead: objIsEmpty(row.lead) ? null : { value: row.lead.id, label: row.lead.name },
            is_archive: row.is_archive,
            expandedRow: null,
        });
    };

    const leadList = async () => {
        try {
            const res: any = await Models.lead.list(null, state.currentLeadPage, null);
            const dropdownList = Dropdown(res?.results, 'name');
            setState({
                leadList: dropdownList,
                hasMoreLead: res.next,
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const leadListLoadMore = async () => {
        try {
            if (state.hasMoreLead) {
                const res: any = await Models.lead.list(null, state.currentLeadPage + 1, null);

                const newOptions = Dropdown(res?.results, 'name');
                setState({
                    leadList: [...state.leadList, ...newOptions],
                    hasMoreLead: res.next,
                    currentLeadPage: state.currentLeadPage + 1,
                });
            } else {
                setState({
                    leadList: state.leadList,
                });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const importContact = async () => {
        try {
            setState({ importLoading: true });
            if (!state.file) {
                Failure('Please upload a valid file');
                return;
            }
            const formData = new FormData();
            formData.append('file', state.file);
            const res: any = await Models.contact.import(formData);

            if (res?.error) {
                setState({ isOpenImport: false, file: null, importLoading: false });
                throw new Error(res.error);
            }

            Success('Contact imported successfully');

            setState({ isOpenImport: false, file: null, importLoading: false, errorContacts: [] });
            contactList(state.currentPage);
        } catch (error: any) {
            setState({ importLoading: false });
            if (error.response?.data?.details?.length > 0) {
                const errorContacts = error.response?.data?.details
                    .filter((contact: any) => Object.keys(contact.error).length > 0)
                    .map((contact: any) => {
                        let errorMessage = '';
                        if (contact?.error?.company_name) {
                            errorMessage += ` Company Name Error - ${contact?.error.company_name?.company_name} - Created By -(${capitalizeFLetter(
                                contact?.error.company_name?.created_by
                            )}) message- (${contact?.error.company_name?.message})  `;
                        }
                        if (contact?.error?.phone_number) {
                            errorMessage += ` Phone Number Error - ${contact?.error?.phone_number?.phone_number} - Created By (${capitalizeFLetter(
                                contact?.error?.phone_number?.created_by
                            )}) message - (${contact?.error?.phone_number?.message}) `;
                        }

                        if (contact?.error?.department?.length > 0) {
                            errorMessage += ` Department Error - ${contact?.error?.department[0]}  `;
                        }
                        return errorMessage;
                    });
                setState({ errorContacts });
            } else {
                if (error?.response?.data?.error) {
                    // Failure(error?.response?.data?.error);
                    setState({ errorContacts: [error?.response?.data?.error] });
                }
            }
        }
    };

    const exportToExcel = async () => {
        setState({ excelLoading: true });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Contacts');

        // Define the columns matching your DataTable
        const exportColumns = [
            {
                title: 'Company Name',
                accessor: 'company_name',
            },
            {
                title: 'Contact Person',
                accessor: 'name',
            },
            {
                title: 'Contact Number',
                accessor: 'phone_number',
            },
            {
                title: 'Date',
                accessor: 'date',
                width: 120,
            },
            {
                title: 'Designation',
                accessor: 'designation',
            },
            // ...(state?.role !== ROLE.BDE
            //     ? [
            {
                title: 'Status',
                accessor: 'status',
            },
            //   ]
            // : []),
            {
                title: 'Remark',
                accessor: 'remark',
            },
        ];

        // Add header row
        worksheet.addRow(exportColumns.map((col) => col.title));

        // Get user details once
        const res: any = await Models.auth.userDetails();
        const userId = res?.id;

        let page = 1;
        let hasMoreData = true;
        let allData: any[] = [];

        // Loop through all pages until no more data
        while (hasMoreData) {
            try {
                let response = null;

                const body = bodyData();

                response = await Models.contact.list(page, body);

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
        setState({ excelLoading: false });

        const data = allData?.map((item) => {
            return {
                ...item,
                company_name: item?.company_name ? capitalizeFLetter(item?.company_name) : '',
                contact_person: item?.name ? capitalizeFLetter(item?.name) : '',
                contact_number: item?.phone_number,
                designation: item?.designation ? capitalizeFLetter(item?.designation) : '',
                remark: item?.remark,
                status: item?.status?.status,
                allData: item,
                date: moment(item?.created_on).format('DD-MM-YYYY'),
            };
        });

        // Add all data rows to worksheet
        data.forEach((row: any) => {
            const rowData = exportColumns.map((col: any) => {
                if (typeof col.accessor === 'function') {
                    return col.accessor(row);
                }
                return row[col.accessor];
            });
            worksheet.addRow(rowData);
        });

        // Auto-fit columns
        exportColumns.forEach((_, i) => {
            const headerLength = exportColumns[i].title.length;
            worksheet.getColumn(i + 1).width = Math.max(20, headerLength + 2);
        });

        // Generate and save Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        FileSaver.saveAs(
            new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            'Contacts.xlsx'
        );
    };

    const handleDelete = async (row) => {
        try {
            setState({ isDeleteLoad: true });

            await Models.contact.delete(row?.id);
            Success('Contact Deleted Successfully');
            contactList(state.currentPage);
            setState({ isDeleteLoad: false });
        } catch (error) {
            setState({ isDeleteOpen: false, isDeleteLoad: false });
        }
    };

    return (
        <div className="p-2">
            <div className="panel  mb-3 flex items-center justify-between gap-5 ">
                <div className="flex items-center gap-5 pl-3">
                    <h5 className="text-lg font-semibold ">TEAM ARCHIVE CONTACTS</h5>
                </div>
            </div>

            <div className="panel mt-2 flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex flex-1 items-center rounded-full border border-gray-300 dark:border-white-dark/30">
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

                {/* <div className="relative flex flex-1 items-center rounded-full border border-gray-300 dark:border-white-dark/30">
                    <button type="submit" className="flex items-center justify-center px-3 py-2 text-primary">
                        <IconSearch className="h-6 w-6 font-bold" />
                    </button>
                    <input
                        type="number"
                        value={state.phone_number_search}
                        onChange={(e) => setState({ phone_number_search: e.target.value })}
                        placeholder="Search phone number"
                        className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div> */}

                <div className="flex-1">
                    <CustomSelect
                        options={state.contactStatusList}
                        value={state.status}
                        onChange={(e) => setState({ status: e })}
                        isMulti={false}
                        placeholder="Status"
                        loadMore={() => state.contactStatusHasNext && contactStatusLoadMore()}
                    />
                </div>
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
                            records={state.contactList}
                            fetching={state.loading || state.subLoading}
                            loaderSize="lg"
                            loaderVariant="dots"
                            loaderColor="blue"
                            loaderBackgroundBlur={0}
                            columns={[
                                { accessor: 'student_name', title: 'Student Name', sortable: true },
                                { accessor: 'phone_number', title: 'Contact Number', sortable: true },
                                { accessor: 'date', title: 'Date', width: 120, sortable: true },

                                // { accessor: 'category', title: 'Category',  },
                                // { accessor: 'created_by', title: 'Assign To',  },
                                // { accessor: 'designation', title: 'Designation' },

                                // ...(state?.role !== ROLE.BDE ? [
                                {
                                    accessor: 'status',
                                    title: 'Status',
                                    sortable: true,
                                    render: (row) => {
                                        const getBadgeColor = (status) => {
                                            switch (status?.toLowerCase()) {
                                                case 'contacted':
                                                    return 'bg-blue-100 text-blue-800';
                                                case 'new':
                                                    return 'bg-green-100 text-green-800';
                                                case 'not interested':
                                                    return 'bg-red-100 text-red-800';
                                                case 'follow-up':
                                                    return 'bg-yellow-100 text-yellow-800';
                                                case 'converted to lead':
                                                    return 'bg-emerald-100 text-emerald-800';
                                                case 'no response':
                                                    return 'bg-gray-100 text-gray-800';
                                                default:
                                                    return 'bg-gray-100 text-gray-800';
                                            }
                                        };
                                        return <span className={`rounded-full px-2 py-1 text-xs font-medium ${getBadgeColor(row?.status)}`}>{row?.status}</span>;
                                    },
                                },
                                // ] : []),
                                {
                                    accessor: 'remark',
                                    title: 'Remark',
                                    sortable: false,
                                    render: (row: any) => (
                                        <Tippy content={row?.remark} placement={'top'} className="rounded-lg bg-black p-1 text-sm text-white">
                                            <div>{row?.remark?.length > 30 ? `${row.remark.slice(0, 30)}...` : row?.remark}</div>
                                        </Tippy>
                                    ),
                                },
                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    sortable: false,
                                    render: (row: any) => (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            {/* <button
                                                    className="flex hover:text-primary"
                                                    onClick={(e) => {
                                                        state.expandedRow === row.id ? setState({ expandedRow: null, isClick: true }) : setState({ expandedRow: row.id, isClick: true });
                                                    }}
                                                >
                                                    <IconQuickEdit />
                                                </button> */}

                                            <button
                                                className="flex hover:text-info"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/update_contact?id=${row?.id}`);
                                                    dispatch(contactIndex(state.currentPage));
                                                }}
                                            >
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </button>
                                            <button className="flex hover:text-primary" onClick={() => handleDelete(row)}>
                                                <IconTrash />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
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
                            //                 <ContactQuickEdit
                            //                     key={record.id}
                            //                     collapse={() => collapse()}
                            //                     data={record}
                            //                     updateList={() => {
                            //                         setState({ expandedRow: null });
                            //                         filter(state.currentPage);
                            //                         contactList(state.currentPage);
                            //                     }}
                            //                     resetExpandedRow={() => {
                            //                         setState({ expandedRow: null });
                            //                     }}
                            //                 />
                            //             </div>
                            //         ) : null,
                            // }}
                            // onRowClick={({ id }) => {
                            //     if (state.expandedRow !== id && !state.isClick) {
                            //         setState({ expandedRow: id });
                            //         // router.push(`/update_contact?id=${id}`);
                            //     }
                            //     setState({ isClick: false });
                            // }}
                            // onRowClick={({ id }) => {
                            //     if (state.isClick) {
                            //         //     setState({ expandedRow: id });
                            //         router.push(`/update_contact?id=${id}`);
                            //     }
                            // }}
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
                        />
                    </div>
                    <div className="mt-5 flex justify-center gap-3">
                        <Pagination
                            currentPage={state.currentPage}
                            totalRecords={state.count}
                            onPageChange={(page) => {
                                setState({ currentPage: page });
                                dispatch(contactIndex(page));

                                contactList(page);
                            }}
                            hasNext={state.next !== null}
                            hasPrevious={state.previous !== null}
                            recordsPerPage={10}
                        />
                    </div>
                </div>
            </div>
            <SideMenu
                title={state.contactId ? 'Update Contact' : 'Add Contact'}
                open={state.isOpenCreateContact}
                close={() => clearContactData(state.contactId)}
                cancelOnClick={() => clearContactData(state.contactId)}
                submitOnClick={() => (state.contactId ? updateContacts(state.contactId) : createContact(state.contactId))}
                submitLoading={state.createContactLoad}
                renderComponent={() => (
                    <div className="flex flex-col gap-3 ">
                        <TextInput
                            title="Company Name"
                            value={state.company_name}
                            onChange={(e) => setState({ company_name: e })}
                            placeholder={'Company Name'}
                            error={state.errors?.company_name}
                            required
                        />
                        <TextInput title="Name" value={state.name} onChange={(e) => setState({ name: e })} placeholder={'Name'} error={state.errors?.name} required />
                        <TextInput title="Email" value={state.email_id} onChange={(e) => setState({ email_id: e })} placeholder={'Email'} error={state.errors?.email_id} required />
                        <NumberInput
                            title="Phone Number"
                            value={state.phone_number}
                            onChange={(e) => setState({ phone_number: e })}
                            placeholder={'Phone Number'}
                            error={state.errors?.phone_number}
                            required
                        />
                        <TextInput
                            title="Designation"
                            value={state.designation}
                            onChange={(e) => setState({ designation: e })}
                            placeholder={'Designation'}
                            error={state.errors?.designation}
                            required
                        />
                        <CustomSelect
                            title="Department"
                            value={state.department}
                            onChange={(e) => setState({ department: e })}
                            placeholder={'Department'}
                            options={state.departmentList}
                            error={state.errors?.department}
                            required
                        />
                        <CustomSelect
                            title="Lead Source"
                            value={state.lead_source}
                            onChange={(e) => setState({ lead_source: e })}
                            placeholder={'Lead Source'}
                            options={state.sourceList}
                            error={state.errors?.lead_source}
                            required
                        />
                        <CustomSelect
                            title="Status"
                            value={state.status}
                            onChange={(e) => setState({ status: e })}
                            placeholder={'Status'}
                            options={state.statusList}
                            error={state.errors?.status}
                            required
                        />
                        <TextArea height="120px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} />
                        <div className="">
                            <CheckboxInput className="w-full md:w-1/2 lg:w-3/4" checked={state.moveToLead} onChange={(val) => setState({ moveToLead: val })} label="Move To Lead" />
                            {state.moveToLead && (
                                <CustomSelect
                                    value={state.lead}
                                    onChange={(e) => setState({ lead: e })}
                                    placeholder={'Lead'}
                                    title={'Lead '}
                                    options={state.leadList}
                                    error={state.errors?.lead}
                                    required
                                    loadMore={() => leadListLoadMore()}
                                />
                            )}
                        </div>
                        <CheckboxInput className="w-full md:w-1/2 lg:w-3/4" checked={state.is_archive} onChange={(val) => setState({ is_archive: val })} label="Archive Contact" />
                    </div>
                )}
            />
            <Modal
                open={state.isOpenImport}
                addHeader={'Import Contact'}
                close={() => setState({ isOpenImport: false, file: null, errorContacts: [], importLoading: false })}
                renderComponent={() => (
                    <div className="flex flex-col gap-5 p-5">
                        <FileUpload
                            onFileSelect={(file) => setState({ file })}
                            buttonText="Upload Document"
                            iconSrc="/assets/images/fileUplaod.jpg"
                            accept=".xls,.xlsx,.csv"
                            isImageAllowed={false}
                            value={state.file}
                        />
                        {state.errorContacts?.length > 0 && (
                            <ol className="list-disc pl-5 text-red-500">
                                {state.errorContacts?.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ol>
                        )}
                        <div className="mt-3 flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => setState({ isOpenImport: false, file: null, errorContacts: [] })}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => importContact()}>
                                {state.importLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};
export default PrivateRouter(Contacts);
