import { useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { DataTable } from 'mantine-datatable';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import IconTrash from '@/components/Icon/IconTrash';
import Models from '@/imports/models.import';
import { Success, useSetState } from '@/utils/functions.utils';
import * as Yup from 'yup';
import { Validation } from '@/utils/imports.utils';
import TextInput from '@/components/TextInput';
import IconLoader from '@/components/Icon/IconLoader';
import Modal from '@/common_component/modal';
import Pagination from '@/components/Pagination';

const departments = () => {
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
        qualification: '',
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
            const res: any = await Models.master.lead_education_qua(page);
            setState({ data: res?.results, totalRecords: res.count, next: res.next, previous: res.previous, count: res?.count, loading: false });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const clearLogData = () => {
        setState({
            EditId: '',
            qualification: '',
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
                qualification: state?.qualification,
            };
            await Validation.CreateQualification.validate(body, { abortEarly: false });
            if (state.EditId) {
                await Models.master.update_education_qua(body, state.EditId);
                Success('Qualification Updated successfully');
            } else {
                await Models.master.create_education_qua(body);
                Success('Qualification created successfully');
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

            await Models.master.delete_education_qua( state.EditId);
            Success('Qualification Deleted successfully');
            clearLogData();
            getMasterData(state.currentPage);
        } catch (error) {
            setState({ isDeleteOpen: false, isDeleteLoad: false });
        }
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">Education Qualification</h5>
                </div>

                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ modalManage: false, EditId: null, qualification: '', isOpen: true });
                        }}
                    >
                        + Create
                    </button>
                </div>
            </div>

            {state.data?.length > 0 && (
                <div className="flex items-center justify-end pb-2 pr-3">
                    <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                        {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                    </div>
                </div>
            )}

            <>
                <div>
                    <DataTable
                        className="table-responsive"
                        records={state.data}
                        fetching={state.loading || state.subLoading}
                        loaderSize="lg"
                        loaderVariant="dots"
                        loaderColor="blue"
                        loaderBackgroundBlur={0}
                        columns={[
                            {
                                accessor: 'qualification',
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
                                                    setState({ modalManage: true, EditId: row.id, qualification: row.qualification, isOpen: true });
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
                    />
                </div>

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

            <Modal
                open={state.isOpen}
                addHeader={state.EditId ? 'Update Qualification' : 'Create Qualification'}
                close={() => setState({ isOpen: false, department: '', errors: {} })}
                renderComponent={() => (
                    <div className="p-5">
                        <TextInput
                            title={'Qualification'}
                            placeholder={'Qualification'}
                            value={state.qualification}
                            onChange={(e) => setState({ qualification: e, errors: { ...state.errors, qualification: '' } })}
                            error={state.errors?.qualification}
                            required
                        />

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpen: false, department: '', errors: {} })}>
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

export default departments;
