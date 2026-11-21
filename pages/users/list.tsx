import Link from 'next/link';
import { DataTable } from 'mantine-datatable';
import { useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/Icon/IconTrashLines';
import IconEdit from '@/components/Icon/IconEdit';
import IconEye from '@/components/Icon/IconEye';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';

import Models from '@/imports/models.import';
import { Validation } from '@/utils/imports.utils';

import Swal from 'sweetalert2';
import * as Yup from 'yup';
import useDebounce from '@/common_component/useDebounce';
import { capitalizeFLetter, Dropdown, Failure, formatDate, formatIndianRupees, formatINR, showDeleteAlert, sortedResults, Success, useSetState } from '@/utils/functions.utils';
import CustomSelect from '@/components/Select';
import Modal from '@/common_component/modal';
import TextInput from '@/components/TextInput';
import TextArea from '@/components/TextArea';
import IconLoader from '@/components/Icon/IconLoader';
import { PrivateRouter } from '@/utils/imports.utils';
import { ROLE, ROLES } from '@/utils/constant.utils';
import IconChecks from '@/components/Icon/IconChecks';
import IconCircleCheck from '@/components/Icon/IconCircleCheck';
import IconXCircle from '@/components/Icon/IconXCircle';
import IconInfoCircle from '@/components/Icon/IconInfoCircle';
import MonthlyTargetCards from '@/components/MonthlyTargetHistory';
import Pagination from '@/components/Pagination';
import IconSearch from '@/components/Icon/IconSearch';
import CustomPhoneInput from '@/components/PhoneInput';

const List = () => {
    const [state, setState] = useSetState({
        previousPage: false,
        nextPage: false,
        currentPage: 1,
        role: null,
        page: 1,
        btnLoading: false,
        tableList: [],
        editId: null,
        search: '',
        total: null,
        next: null,
        previous: null,
        totalRecords: null,
        userList: [],
        first_name: '',
        last_name: '',
        phone_number: '',
        email: '',
        password: '',
        date: '',
        address: '',
        groups: null,
        target_amount: '',
        isOpen: false,
        error: {},
        target_history: [],
        sortStatus: null,
    });

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        setState(() => {
            userId;
        });
    }, []);

    useEffect(() => {
        usersList(1);
    }, []);

    useEffect(() => {
        usersList(1);
    }, [debouncedSearch, state.role, state.sortStatus]);

    const usersList = async (page: any) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.user.userList(page, body);
            const data = res?.results?.map((item: any) => ({
                id: item?.id,
                first_name: item?.first_name,
                last_name: item?.last_name,
                email: item.email,
                date: formatDate(item.date_joined),

                ...item,
            }));

            setState({
                userList: res.results,
                tableList: data,
                total: res?.count,
                page: page,
                next: res.next,
                previous: res.previous,
                totalRecords: res.count,
                count: res.count,
                loading: false,
            });
        } catch (error: any) {
            setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const createUser = async () => {
        try {
            setState({ btnLoading: true });
            const body = {
                first_name: state?.first_name,
                last_name: state?.last_name,
                email: state?.email,
                phone_number: state?.phone_number,
                password: state?.password,
                address: state?.address,
                is_staff:true
            };

            await Validation.createUser.validate(body, {
                abortEarly: false,
            });

            // await Utils.Validation.user.validate(body, { abortEarly: false });

            const res: any = await Models.user.addUser(body);


            clearData();
            setState({ btnLoading: false });
            usersList(1);
            Success('User created succssfully');
        } catch (error: any) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ error: validationErrors, btnLoading: false });
            } else {
                console.log('error', error);
                Failure(error);
                setState({ btnLoading: false });
            }
        }
    };

    const updateUsers = async () => {
        try {
            setState({ btnLoading: true });
            const body = {
                first_name: state?.first_name,
                last_name: state?.last_name,
                email: state?.email,
                phone_number: state?.phone_number,
                address: state?.address,
            };

            await Validation.updateUser.validate(body, {
                abortEarly: false,
            });

            const res = await Models.user.updateUser(body, state.editId);

            clearData();
            setState({ btnLoading: false });
            usersList(state.page);

            Success('User updated succssfully');
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ error: validationErrors, btnLoading: false });
            } else {
                console.log('errors --->', error);
                Failure(error);
                setState({ btnLoading: false });
            }
        }
    };

    const bodyData = () => {
        let body: any = {};

        if (state.search) {
            body.search = state.search;
        }
        if (state.role) {
            body.group = state.role.value;
        }
        if (state.sortStatus) {
            body.ordering = state.sortStatus.direction === 'desc' ? `-${state.sortStatus.columnAccessor}` : state.sortStatus.columnAccessor;
        }

        return body;
    };

    const clearData = () => {
        setState({
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            phone_number: '',
            address: '',
            groups: '',
            editId: '',
            isOpen: false,
            error: {},
            target_amount: '',
        });
    };

    const clearFilter = () => {
        setState({
            search: '',
            role: '',
        });
    };

    const handleEdit = (row) => {
        console.log('✌️row --->', row);
        setState({
            first_name: row?.first_name,
            last_name: row?.last_name,
            email: row?.email,
            phone_number: row?.phone_number,

            editId: row?.id,
            isOpen: true,
            address: row?.address,
        });
    };

    const deleteDecord = async (row) => {
        try {
            setState({ btnLoading: true });

            const res = await Models.user.deleteUser(row?.id);
            clearData();
            setState({ btnLoading: false });
            usersList(state.page);

            Success('User deleted succssfully');
        } catch (error) {}
    };

    const handleDelete = (row) => {
        showDeleteAlert(
            () => {
                deleteDecord(row);
            },
            () => {
                Swal.fire('Cancelled', 'Your Record is safe :)', 'info');
            },
            'Are you sure want to delete user?'
        );
    };

    const handleActiveStatus = async (row) => {
        try {
            const body = {
                is_active: !row?.is_active,
            };

            const res = await Models.user.updateUser(body, row.id);
            usersList(state.page);
        } catch (error) {
            console.log('error', error);
        }
    };

    const handleNextPage = () => {
        if (state?.next) {
            const newPage = state.page + 1;
            usersList(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (state?.previous) {
            const newPage = state.page - 1;
            usersList(newPage);
        }
    };

    const handleChange = (name, value) => {
        setState({
            [name]: value,
            error: {
                ...state.error,
                [name]: '',
            },
        });
    };

    return (
        <>
            <div className="panel mb-5 flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                    <h5 className="text-lg font-semibold dark:text-white-light">User List</h5>
                </div>
                <div className="flex gap-5">
                    <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => setState({ isOpen: true })}>
                        + Create
                    </button>
                </div>
            </div>

            <div className="panel mb-5 mt-5 gap-2 px-2 md:mt-0 md:flex md:justify-between xl:gap-4">
                {/* Search Input */}
                <div className="relative flex w-full items-center rounded-full border border-gray-300 dark:border-white-dark/30 md:w-1/3">
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
            </div>

            <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
                {/* <div className="invoice-table"> */}

                <div className="datatables pagination-padding">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={state?.tableList || []}
                        fetching={state.loading || state.subLoading}
                        loaderSize="lg"
                        loaderVariant="dots"
                        loaderColor="blue"
                        loaderBackgroundBlur={0}
                        sortStatus={state.sortStatus}
                        onSortStatusChange={(sortStatus) => setState({ sortStatus })}
                        columns={[
                            {
                                accessor: 'name',
                                title: 'Name',
                                sortable: true,
                                render: (row) => (
                                    <div className="flex items-center font-semibold">
                                        <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                                            <img className="h-8 w-8 cursor-pointer rounded-full object-cover" src={`/assets/images/dummyUser.png`} alt="" />
                                        </div>
                                        <Link className="cursor-pointer" href={`/real-estate/profile/${row.id}/`}>
                                            {capitalizeFLetter(row.first_name)} {row.last_name}
                                        </Link>
                                    </div>
                                ),
                            },
                            { accessor: 'email', title: 'Email', sortable: true },
                            { accessor: 'phone_number', title: 'Phone Number', sortable: true },

                            {
                                accessor: 'role',
                                title: 'Role',
                                render: (row: any) => <span className={`badge badge-outline-danger`}>Staff</span>,
                            },
                            { accessor: 'date', title: 'Joined Date', sortable: true },

                            {
                                accessor: 'action',
                                title: 'Actions',
                                sortable: false,
                                textAlignment: 'center',
                                render: (row: any) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        <button
                                            className="flex hover:text-info"
                                            onClick={(e) => {
                                                handleEdit(row);
                                            }}
                                        >
                                            <IconEdit className="h-4.5 w-4.5" />
                                        </button>
                                        {/* <Link href="/real-estate/profile" className="flex hover:text-primary">
                                            <IconEye />
                                        </Link> */}
                                        {/* <button type="button" className="flex hover:text-danger" onClick={(e) => handleDelete(row)}>
                                            <IconTrashLines />
                                        </button> */}
                                        <button type="button" className="flex hover:text-danger" title={row.is_active ? 'Active' : 'Inactive'} onClick={(e) => handleActiveStatus(row)}>
                                            {row.is_active ? <IconCircleCheck className="h-5 w-4.5 text-success" /> : <IconXCircle className="text-danger" />}
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                        highlightOnHover
                        totalRecords={state?.initialRecords?.length}
                        recordsPerPage={state?.pageSize}
                        page={null}
                        onPageChange={(p) => {}}
                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                    />
                </div>

                <div className="mt-5 flex justify-center gap-3">
                    <Pagination
                        currentPage={state.currentPage}
                        totalRecords={state.count}
                        onPageChange={(page) => {
                            usersList(page);
                        }}
                        hasNext={state.next !== null}
                        hasPrevious={state.previous !== null}
                        recordsPerPage={10}
                    />
                </div>
            </div>

            <Modal
                addHeader={state.editId ? 'Update User' : 'Create User'}
                open={state.isOpen}
                close={() => {
                    clearData();
                }}
                renderComponent={() => (
                    <div className=" p-7">
                        <form className="flex flex-col gap-3">
                            <div className="w-full space-y-5">
                                <TextInput
                                    name="first_name"
                                    type="text"
                                    title="First Name"
                                    placeholder="Enter First Name"
                                    value={state.first_name}
                                    onChange={(e) => handleChange('first_name', e)}
                                    error={state.error?.first_name}
                                    required
                                />

                                <TextInput
                                    name="last_name"
                                    type="text"
                                    title="Last Name"
                                    placeholder="Enter Last Name"
                                    value={state.last_name}
                                    onChange={(e) => handleChange('last_name', e)}
                                    error={state.error?.last_name}
                                    required
                                />

                                <TextInput
                                    name="email"
                                    type="email"
                                    title="Email"
                                    placeholder="Enter Email"
                                    value={state.email}
                                    onChange={(e) => handleChange('email', e)}
                                    error={state.error?.email}
                                    required
                                />

                                {!state.editId && (
                                    <TextInput
                                        name="password"
                                        type="password"
                                        title="Password"
                                        placeholder="Enter password"
                                        value={state.password}
                                        onChange={(e) => handleChange('password', e)}
                                        error={state.error?.password}
                                        required
                                    />
                                )}

                                <CustomPhoneInput
                                    title={'Phone'}
                                    placeholder={'Phone Number'}
                                    value={state.phone_number}
                                    onChange={(e) => setState({ phone_number: e, errors: { ...state.errors, phone_number: '' } })}
                                    error={state.errors?.phone_number}
                                    required
                                />

                                <TextArea name="address" title="Address" placeholder="Enter Address" value={state.address} onChange={(e) => handleChange('address', e)} />
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary gap-2"
                                    onClick={() => {
                                        clearData();
                                    }}
                                >
                                    Cancel
                                </button>
                                <button type="button" onClick={() => (state.editId ? updateUsers() : createUser())} className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                    {state.btnLoading ? <IconLoader /> : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            />
            {/* </div> */}
        </>
    );
};

export default PrivateRouter(List);
