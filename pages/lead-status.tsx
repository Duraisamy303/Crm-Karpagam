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
import TextInput from '@/components/TextInput';
import IconLoader from '@/components/Icon/IconLoader';
import Modal from '@/common_component/modal';
import Pagination from '@/components/Pagination';

const Status = () => {
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const router = useRouter();

    const [state, setState] = useSetState({
        state: [],
        loading: false,
        currentPage: 1,
        totalRecords: 0,
        next: null,
        previous: null,
        allData: null,
        data: [],
        pageSize: 5,
        EditId: null,
        errors: {},
        status: '',
        submitLoad: false,
        isDeleteOpen: false,
        isOpen: false,
        isDeleteLoad: false,
    });

    useEffect(() => {
        getMasterData(state.currentPage);
    }, []);

    const getMasterData = async (page) => {
        try {
            setState({ loading: true });
            const response: any = await Models.master.lead_status_list(page);
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
                name: item.stage,
            };
        });

        setState({ data: Data, allData: res, totalRecords: res.count, next: res.next, previous: res.previous, count: res?.count });
    };

    const clearLogData = () => {
        setState({
            EditId: '',
            status: '',
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
                status: state?.status,
            };

            await Validation.CreateContactStatus.validate(body, { abortEarly: false });
            delete body.status;
            body['stage'] = state?.status;
            if (state.EditId) {
                await Models.master.update_lead_status(state.EditId, body);

                Success('Status Updated successfully');
            } else {
                await Models.master.create_lead_status(body);

                Success('Status created successfully');
            }
            clearLogData();

            getMasterData(state.currentPage);
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });
                setState({ errors: validationErrors, submitLoad: false });
            } else {
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

            await Models.master.delete_lead_status(state.EditId);

            Success('Status Deleted successfully');
            clearLogData();
            getMasterData(state.currentPage);
        } catch (error) {
            setState({ isDeleteOpen: false, isDeleteLoad: false });
        }
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                {/* Title Section */}
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">Lead Status</h5>
                </div>

                {/* <div className="mb-5"> */}
                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ modalManage: false, EditId: null, create: '', isOpen: true });
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
                                    accessor: 'name',
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
                                                        setState({ modalManage: true, EditId: row.id, status: row.name, isOpen: true });
                                                    }}
                                                >
                                                    <IconNotesEdit />
                                                </button>
                                            </Tippy>

                                            {/* <button
                                                className="flex hover:text-info"
                                                onClick={() => {
                                                    setState({
                                                        modalManage: true,
                                                        EditId: row.id,
                                                        isDeleteOpen: true,
                                                        
                                                    });
                                                }}
                                            >
                                                <IconTrash className="h-4.5 w-4.5" />
                                            </button> */}
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
                addHeader={state.EditId ? 'Update Status' : 'Create Status'}
                close={() => setState({ isOpen: false, status: '', errors: {} })}
                renderComponent={() => (
                    <div className="p-5">
                        <TextInput title={'Status Name'} placeholder={'Status Name'} value={state.status} onChange={(e) => setState({ status: e })} error={state.errors?.status} required />

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpen: false, status: '', errors: {} })}>
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
                close={() => setState({ isDeleteOpen: false, status: '' })}
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

export default Status;
