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
import { Success, useSetState } from '@/utils/functions.utils';
import * as Yup from 'yup';
import { Validation } from '@/utils/imports.utils';
import IconBell from '@/components/Icon/IconBell';
import CustomSelect from '@/components/Select';
import { Dropdown } from '@/utils/functions.utils';
import Modal from '@/common_component/modal';
import IconLoader from '@/components/Icon/IconLoader';
import TextInput from '@/components/TextInput';
import Pagination from '@/components/Pagination';
import IconSearch from '@/components/Icon/IconSearch';
import useDebounce from '@/common_component/useDebounce';

const FocusSegmets = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const router = useRouter();

    const [state, setState] = useSetState({
        state: [],
        loading: false,
        role: '',
        currentPage: 1,
        totalRecords: 0,
        next: null,
        previous: null,
        allData: null,
        expandedRow: null,
        data: [],
        create: '',
        modalManage: false,
        pageSize: 5,
        EditId: null,
        errors: {},
        logLoad: false,
        vertical: null,
        focus: '',
        verticalList: [],
        focusList: [],
        focus_segment: '',
        submitLoad: false,
        isDeleteOpen: false,
        isOpen: false,
        isDeleteLoad: false,
        search: '',
    });

    const debouncedSearch = useDebounce(state.search, 1000);

    useEffect(() => {
        getMasterData(state.currentPage);
        stateList();
    }, []);

    useEffect(() => {
        getMasterData(state.currentPage);
    }, [debouncedSearch]);

    // useEffect(() => {
    //     getMasterData(state.currentPage);
    // }, [state.currentPage]);

    const getMasterData = async (page) => {
        try {
            setState({ loading: true });
            const body = {
                search: state.search,
            };
            const response: any = await Models.master.master_city_list();
            tableData(response);
            setState({
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const tableData = (res: any) => {
        const Data: any = res?.results?.map((item: any) => {
            return {
                ...item,
                allData: item,
                city: item.city_name,
                state: item.state?.state_name,
                country: item.state?.country?.country_name,
            };
        });

        setState({ data: Data, allData: res, totalRecords: res.count, next: res.next, previous: res.previous, count: res?.count });
    };

    const clearLogData = () => {
        setState({
            EditId: '',
            city_name: '',
            state: '',
            submitLoad: false,
            errors: {},
            isOpen: false,
            isDeleteOpen: false,
            isDeleteLoad: false,
        });
    };

    const handleCreateAndUpdate = async () => {
        try {
            setState({ submitLoad: true });

            const body = {
                city_name: state?.city_name,
                state: state?.state.value,
            };
            await Validation.CreateCity.validate(body, { abortEarly: false });

            if (state.EditId) {
                await Models.master.update_city(state.EditId, body);

                Success('City Updated successfully');
            } else {
                await Models.master.create_city(body);
                Success('City created successfully');
            }
            clearLogData();
            getMasterData(state.currentPage);
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ errors: validationErrors });
                setState({ submitLoad: false });
            } else {
                console.log('Error: ', error?.message);
                setState({ submitLoad: false });
            }
            setState({ submitLoad: false });
        }
    };

    const handleDelete = async () => {
        try {
            setState({ isDeleteLoad: true });
            const body = {
                is_active: 'False',
            };

            await Models.master.delete_city(state.EditId);

            Success('City Deleted successfully');
            clearLogData();
            getMasterData(state.currentPage);
        } catch (error) {
            setState({ isDeleteLoad: false });
        }
    };

    const stateList = async () => {
        try {
            setState({ logLoad: true });
            const response: any = await Models.master.master_state_list(1);
            const dropdownList = Dropdown(response.results, 'state_name');
            setState({ stateList: dropdownList, logLoad: false });
        } catch (error) {
            setState({ logLoad: false });
        }
    };

    const handleEdit = (row: any) => {
        setState({
            modalManage: true,
            EditId: row.id,
            city_name: row.city_name,
            isOpen: true,
            state: { value: row?.allData?.state?.id, label: row?.allData?.state?.state_name },
        });
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">Cities</h5>
                </div>

                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ modalManage: false, EditId: null, focus_segment: '', isOpen: true, vertical: '' });
                        }}
                    >
                        + Create
                    </button>
                </div>
            </div>

            <div className="panel mt-2 flex flex-col gap-4 lg:flex-row lg:items-center ">
                <div className="relative flex w-full max-w-full items-center rounded-full border border-gray-300 dark:border-white-dark/30 lg:w-1/4">
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
                                    accessor: 'city',
                                    title: 'Name',
                                },
                                {
                                    accessor: 'country',
                                },
                                {
                                    accessor: 'state',
                                },

                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <div className=" flex w-max items-center gap-4">
                                            <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                                <button
                                                    type="button"
                                                    className="flex hover:text-primary"
                                                    onClick={() => {
                                                        handleEdit(row);
                                                    }}
                                                >
                                                    <IconNotesEdit />
                                                </button>
                                            </Tippy>

                                            <button
                                                className="flex hover:text-info"
                                                onClick={() => {
                                                    setState({
                                                        modalManage: true,
                                                        EditId: row.id,
                                                        isDeleteOpen: true,

                                                        // create:""
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
                                    overflowX: 'auto', // Enable horizontal scroll
                                },
                            }}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                    </div>
                    {/* <div className="mt-5 flex justify-end gap-3">
                        <button disabled={!state.previous} onClick={handlePreviousPage} className={`btn ${!state.previous ? 'btn-disabled' : 'btn-primary'}`}>
                            <IconArrowBackward />
                        </button>
                        <button disabled={!state.next} onClick={handleNextPage} className={`btn ${!state.next ? 'btn-disabled' : 'btn-primary'}`}>
                            <IconArrowForward />
                        </button>
                    </div> */}

                    <div className="mt-5 flex justify-center gap-3">
                        <Pagination
                            currentPage={state.currentPage}
                            totalRecords={state.count}
                            onPageChange={(page) => {
                                getMasterData(page);
                                setState({ currentPage: page });
                            }}
                            hasNext={state.next !== null}
                            hasPrevious={state.previous !== null}
                            recordsPerPage={10}
                        />
                    </div>
                </>
            ) : (
                <div className="mt-20 flex items-center justify-center">No Record Found</div>
            )}

            <Modal
                open={state.isOpen}
                height={450}
                addHeader={state.EditId ? 'Update City' : 'Create City'}
                close={() => setState({ isOpen: false, focus_segment: '', errors: {}, vertical: '', city_name: null, state: null })}
                renderComponent={() => (
                    <div className="flex flex-col gap-5 p-5">
                        <CustomSelect
                            title="State"
                            placeholder="State"
                            value={state.state}
                            onChange={(e) => {
                                if (e) {
                                    setState({ state: e });
                                } else {
                                    setState({ state: '' });
                                }
                            }}
                            options={state.stateList}
                            error={state.errors?.state}
                            required
                        />
                        <TextInput title={'City'} placeholder={'City'} value={state.city_name} onChange={(e) => setState({ city_name: e })} error={state.errors?.city_name} required />

                        <div className="mt-6 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpen: false, focus_segment: '', errors: {}, city_name: null, state: null })}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                onClick={() => {
                                    handleCreateAndUpdate();
                                }}
                            >
                                {state.submitLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : state.modalManage ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                )}
            />

            <Modal
                open={state.isDeleteOpen}
                close={() => setState({ isDeleteOpen: false, focus_segment: '', vertical: '' })}
                renderComponent={() => (
                    <div className="p-5">
                        <div className="text-sm text-dark">
                            <p style={{ fontSize: '18px', fontWeight: '600', lineHeight: '1.5' }}>Are You Sure, Do You want to delete? This process cannot be Reverted.</p>
                        </div>
                        <div className="mt-0 flex items-center justify-end">
                            <button type="button" onClick={() => setState({ isDeleteOpen: false, focus_segment: '', vertical: '' })} className="btn btn-outline-danger">
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

export default FocusSegmets;
