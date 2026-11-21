import { Fragment, useEffect, useState } from 'react';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import IconMobile from '@/components/Icon/IconMobile';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import { useRouter } from 'next/router';
import QuickEdit from '@/components/QuickEdit';
import { Dialog, Transition } from '@headlessui/react';
import IconCode from '@/components/Icon/IconCode';
import IconX from '@/components/Icon/IconX';
import IconTrash from '@/components/Icon/IconTrash';
import Models from '@/imports/models.import';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import { convertToDateValue, Dropdown, Failure, formatIndianRupees, formatINR, getMonthName, sortedResults, Success, useSetState } from '@/utils/functions.utils';
import * as Yup from 'yup';
import { Validation } from '@/utils/imports.utils';
import IconBell from '@/components/Icon/IconBell';
import Modal from '@/common_component/modal';
import IconLoader from '@/components/Icon/IconLoader';
import TextInput from '@/components/TextInput';
import CustomSelect from '@/components/Select';
import YearPicker from '@/common_component/yearPicker';
import MonthYearPicker from '@/common_component/MonthYearPicker';
import moment from 'moment';
import ContactQuickEdit from '@/components/ContactQuickEdit';
import IconInfoCircle from '@/components/Icon/IconInfoCircle';
import MonthlyTargetCards from '@/components/MonthlyTargetHistory';

const OpportunityName = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const [state, setState] = useSetState({
        loading: false,
        role: '',
        currentPage: 1,
        totalRecords: 0,
        next: null,
        previous: null,
        pageSize: 5,
        EditId: null,
        errors: {},
        isOpen: false,
        submitLoad: false,
        isDeleteOpen: false,
        isDeleteLoad: false,
        userList: [],
        target_history: [],
    });

    useEffect(() => {
        target_list(state.currentPage);
    }, []);

    const target_list = async (page) => {
        try {
            setState({ loading: true });
            // const response: any = await Models.master.monthly_target(page);

            // tableData(response);
            setState({
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });
        }
    };



    const target_history = async (row) => {
        try {
            setState({ loading: true });

            const body = {
                user: row?.allData?.user?.id,
            };

            // const response: any = await Models.master.target_history(body);
            // setState({ target_history: sortedResults(response?.results)});

            // tableData(response);
            setState({
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const tableData = (res: any) => {
        const Data: any = res?.map((item: any) => {
            return {
                ...item,
                allData: item,
                target_amount: formatIndianRupees(item.target),
                date: moment(item?.updated_at).format('MMMM YYYY'),
                user: `${item?.user?.first_name} ${item?.user?.last_name}`,
                role: item?.user?.group?.name,
            };
        });

        setState({ data: Data, allData: res, totalRecords: res?.length, next: res.next, previous: res.previous });
    };

    const clearLogData = () => {
        setState({
            submitLoad: false,
            EditId: '',
            lead_status: '',
            isOpen: false,
            isDeleteOpen: false,
            isDeleteLoad: false,
            errors: {},
            target_amount: '',
            user: '',
            role: '',
        });
    };

    const handleCreateAndUpdate = async () => {
        try {
            setState({ submitLoad: true });
            const body: any = {
                target_amount: state.target_amount,
                user: state.user?.value,
                role: state.role?.value,
                month: state.month,
            };

            await Validation.CreateTarget.validate(body, { abortEarly: false });
            delete body.month;
            delete body.target_amount;

            body.target = state.target_amount;
            // const [year, month] = state.month.split('-');
            // body.month = month;
            // body.year = year;

            // if (state.EditId) {
            //     await Models.master.update_target(body, state.EditId);
            //     Success('Monthly target updated successfully');
            // } else {
            //     await Models.master.create_target(body);
            //     Success('Monthly target created successfully');
            // }
            clearLogData();
            target_list(state.currentPage);
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ errors: validationErrors });
                setState({ submitLoad: false });
            } else {
                if (error?.non_field_errors?.length > 0) {
                    Failure(error?.non_field_errors[0]);
                }
                console.log('Error: ', error);
                setState({ submitLoad: false });
            }
            setState({ submitLoad: false });
        }
    };

    const handleDelete = async () => {
        try {
            setState({ isDeleteLoad: true });
            // await Models.master.delete_target(state.EditId).then((res) => {
            //     Success('Record Deleted successfully');
            //     clearLogData();
            // });

            const filter = state.data?.filter((item) => item?.id != state.EditId);
            setState({ isDeleteLoad: false, data: filter });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const handleRoleChange = async (data) => {
        try {
            setState({ role: data, errors: { ...state.errors, role: '' }, user: '' });
            if (data) {
                const body = {
                    group: data?.value,
                };
                const res: any = await Models.task.all_user(body);
                const dropdown = Dropdown(res?.results, 'full_name');
                setState({ userList: dropdown });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
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

    const handleEdit = (row) => {
        const rawValue = row?.allData?.target?.replace(/,/g, '');
        const numericValue = rawValue === '' ? 0 : parseInt(rawValue) || 0;
        setState({
            EditId: row.id,
            name: row.name,
            isOpen: true,
            target_amount: numericValue,
            // month: convertToDateValue(row?.month, row?.allData?.year),
            role: { value: row?.allData?.user?.group?.id, label: row?.allData?.user?.group?.name },
            user: { value: row?.allData?.user?.id, label: `${row?.allData?.user?.first_name} ${row?.allData?.user?.last_name}` },
        });
        getUserList(row?.allData?.user?.group?.name);
    };

    const getUserList = async (data) => {
        try {
            if (data) {
                const body = {
                    group: data,
                };
                const res: any = await Models.task.all_user(body);
                const dropdown = Dropdown(res?.results, 'full_name');
                setState({ userList: dropdown });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                {/* Title Section */}
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">Monthly Target</h5>
                </div>

                {/* <div className="mb-5"> */}
                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ EditId: null, target_amount: '', isOpen: true, month: '', role: '', user: '' });
                        }}
                    >
                        + Create
                    </button>
                </div>

                {/* </div> */}
            </div>

            {state.data?.length > 0 ? (
                <>
                    <div className="flex items-center justify-end pb-2 pr-3">
                        <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                            {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                        </div>
                    </div>
                    <div>
                        <DataTable
                            className="table-responsive"
                            records={state.data}
                            columns={[
                                {
                                    accessor: 'user',
                                    title: 'Name',
                                },
                                {
                                    accessor: 'role',
                                    title: 'Role',
                                },

                                {
                                    accessor: 'target_amount',
                                    title: 'Amount',
                                },
                                {
                                    accessor: 'date',
                                    title: 'Last Updated Date',
                                },

                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <div className=" flex w-max items-center gap-4">
                                            <Tippy content="Target History" className="rounded-lg bg-black p-1 text-sm text-white">
                                                <button
                                                    type="button"
                                                    className="flex hover:text-primary"
                                                    onClick={(e) => {
                                                        target_history(row);
                                                        state.expandedRow === row?.id ? setState({ expandedRow: null }) : setState({ expandedRow: row?.id });
                                                    }}
                                                >
                                                    <IconInfoCircle />
                                                </button>
                                            </Tippy>
                                            <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                                <button
                                                    type="button"
                                                    className="flex hover:text-primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        handleEdit(row);
                                                        setState({ expandedRow: null });
                                                    }}
                                                >
                                                    <IconNotesEdit />
                                                </button>
                                            </Tippy>

                                            <button
                                                className="flex hover:text-info"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setState({
                                                        modalManage: true,
                                                        EditId: row.id,
                                                        isDeleteOpen: true,
                                                        // create:row.name
                                                    });
                                                }}
                                            >
                                                <IconTrash className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            totalRecords={state.data?.length}
                            recordsPerPage={state.pageSize}
                            minHeight={200}
                            page={null}
                            onPageChange={(p) => {}}
                            withBorder={true}
                            styles={{
                                root: {
                                    overflowX: 'auto',
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
                                            <MonthlyTargetCards
                                                key={record.id}
                                                data={state.target_history}
                                               
                                            />
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
                </>
            ) : (
                <div className="mt-20 flex items-center justify-center">No Record Found</div>
            )}

            <Modal
                height={'auto'}
                open={state.isOpen}
                addHeader={state.EditId ? 'Update Monthly Target' : 'Create Monthly Target'}
                close={() => setState({ isOpen: false, name: '', errors: {} })}
                renderComponent={() => (
                    <div className="space-y-5 p-5">
                        <CustomSelect
                            title="Select Role"
                            value={state.role}
                            onChange={(e) => handleRoleChange(e)}
                            placeholder={'Role'}
                            options={[
                                {
                                    value: 'BDM',
                                    label: 'BDM',
                                },
                                {
                                    value: 'BDE',
                                    label: 'BDE',
                                },
                                {
                                    value: 'TM',
                                    label: 'TM',
                                },
                                {
                                    value: 'DM',
                                    label: 'DM',
                                },
                            ]}
                            error={state.errors?.role}
                            className="w-full"
                            required
                        />

                        <CustomSelect
                            title={`Select ${state.role?.label || 'User'}`}
                            placeholder={`Select ${state.role?.label || 'User'}`}
                            value={state.user}
                            onChange={(e) => setState({ user: e, errors: { ...state.errors, user: '' } })}
                            options={state.userList}
                            error={state.errors?.user}
                            className="w-full"
                            required
                        />

                        {/* <MonthYearPicker
                            required
                            error={state.errors?.month}
                            title="Month / Year"
                            value={state.month}
                            onChange={(year) => {
                                setState({ month: year, errors: { ...state.errors, month: '' } });
                            }}
                        /> */}

                        <TextInput
                            title={'Target (Amount)'}
                            placeholder={'Target (Amount)'}
                            value={formatINR(state.target_amount)}
                            onChange={(value) => {
                                const rawValue = value.replace(/,/g, '');
                                const numericValue = rawValue === '' ? 0 : parseInt(rawValue) || 0;
                                setState({
                                    target_amount: numericValue,
                                    errors: { ...state.errors, target_amount: '' },
                                });
                            }}
                            error={state.errors?.target_amount}
                            required
                        />

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpen: false, name: '', errors: {} })}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                onClick={() => {
                                    handleCreateAndUpdate();
                                }}
                            >
                                {state.submitLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : state.EditId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                )}
            />

            <Modal
                open={state.isDeleteOpen}
                close={() => setState({ isDeleteOpen: false, department: '' })}
                renderComponent={() => (
                    <div className="p-5">
                        <div className="text-sm text-dark">
                            <p style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.5' }}>Are You Sure, Do You want to delete? This process cannot be Reverted.</p>
                        </div>
                        <div className="mt-0 flex items-center justify-end">
                            <button type="button" onClick={() => setState({ isDeleteOpen: false })} className="btn btn-outline-danger">
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

export default OpportunityName;
