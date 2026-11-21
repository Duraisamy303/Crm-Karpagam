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
import CustomPhoneInput from '@/components/PhoneInput';

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
        name: '',
        location: '',
        website: '',
        phone: '',
        email: '',
        submitLoad: false,
        isDeleteOpen: false,
        isOpen: false,
        isDeleteLoad: false,
        isValidNumber: true,
    });

    useEffect(() => {
        getMasterData(state.currentPage);
    }, []);

    const getMasterData = async (page) => {
        try {
            setState({ loading: true });
            const response: any = await Models.master.college_list(page);
            console.log('✌️response --->', response);
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
                name: item.name,
                location: item.location,
                website: item.website,
                phone: item.phone,
                email: item.email,
            };
        });

        setState({ data: Data, allData: res, totalRecords: res.count, next: res.next, previous: res.previous, count: res?.count });
    };

    const clearLogData = () => {
        setState({
            EditId: '',
            name: '',
            location: '',
            website: '',
            phone: '',
            email: '',
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
                name: state?.name,
                location: state?.location,
                website: state?.website,
                phone: state?.phone,
                email: state?.email,
            };

            await Validation.CreateCollege.validate(body, { abortEarly: false });

            if (state.EditId) {
                await Models.master.update_college(body, state.EditId);
                Success('College Updated successfully');
            } else {
                const res = await Models.master.create_college(body);
                Success('College created successfully');
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
        }
    };

    const handleDelete = async () => {
        try {
            setState({ isDeleteLoad: true });
            await Models.master.delete_college(state.EditId);
            Success('College Deleted successfully');
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
                    <h5 className="text-lg font-semibold">College</h5>
                </div>

                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ modalManage: false, EditId: null, name: '', location: '', website: '', phone: '', email: '', isOpen: true });
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
                                accessor: 'name',
                                title: 'College Name',
                            },
                            {
                                accessor: 'location',
                                title: 'Location',
                            },
                            {
                                accessor: 'website',
                                title: 'Website',
                            },
                            {
                                accessor: 'phone',
                                title: 'Phone',
                            },
                            {
                                accessor: 'email',
                                title: 'Email',
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
                                                    setState({
                                                        modalManage: true,
                                                        EditId: row.id,
                                                        name: row.name,
                                                        location: row.location,
                                                        website: row.website,
                                                        phone: row.phone,
                                                        email: row.email,
                                                        isOpen: true,
                                                    });
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
                addHeader={state.EditId ? 'Update College' : 'Create College'}
                close={() => clearLogData()}
                renderComponent={() => (
                    <div className="p-5">
                        <div className="space-y-4">
                            <TextInput
                                title={'College Name'}
                                placeholder={'Enter college name'}
                                value={state.name}
                                onChange={(e) => setState({ name: e, errors: { ...state.errors, name: '' } })}
                                error={state.errors?.name}
                                required
                            />
                            <TextInput
                                title={'Location'}
                                placeholder={'Enter location'}
                                value={state.location}
                                onChange={(e) => setState({ location: e, errors: { ...state.errors, location: '' } })}
                                error={state.errors?.location}
                                required
                            />
                            <TextInput
                                title={'Website'}
                                placeholder={'Enter website URL'}
                                value={state.website}
                                onChange={(e) => setState({ website: e, errors: { ...state.errors, website: '' } })}
                                error={state.errors?.website}
                                required
                            />
                            <CustomPhoneInput
                                title={'Phone'}
                                placeholder={'Enter phone number'}
                                value={state.phone}
                                onChange={(e) => setState({ phone: e, errors: { ...state.errors, phone: '' } })}
                                error={state.errors?.phone}
                                required
                            />
                            <TextInput
                                title={'Email'}
                                placeholder={'Enter email address'}
                                value={state.email}
                                onChange={(e) => setState({ email: e, errors: { ...state.errors, email: '' } })}
                                error={state.errors?.email}
                                required
                            />
                        </div>

                        <div className="mt-8 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => clearLogData()}>
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
                close={() => setState({ isDeleteOpen: false })}
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
