import { useEffect } from 'react';

import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { DataTable } from 'mantine-datatable';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import IconTrash from '@/components/Icon/IconTrash';
import Models from '@/imports/models.import';
import { Dropdown, formatIndianRupees, formatINR, Success, useSetState } from '@/utils/functions.utils';
import * as Yup from 'yup';
import { Validation } from '@/utils/imports.utils';
import TextInput from '@/components/TextInput';
import IconLoader from '@/components/Icon/IconLoader';
import Modal from '@/common_component/modal';
import Pagination from '@/components/Pagination';
import CustomSelect from '@/components/Select';

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
        department: '',
        course_name: '',
        course_code: '',
        duration_in_months: '',
        fees: '',
        college: null,
        submitLoad: false,
        isDeleteOpen: false,
        isOpen: false,
        isDeleteLoad: false,
    });

    useEffect(() => {
        getMasterData(state.currentPage);
        collegeList(state.currentPage);
    }, []);

    const getMasterData = async (page) => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.course_list(page);

            setState({ loading: false, data: res?.results, totalRecords: res.count, next: res.next, previous: res.previous, count: res?.count });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const collegeList = async (page) => {
        try {
            const response: any = await Models.master.college_list(page);

            const dropdown = Dropdown(response?.results, 'name');
            setState({ collegeList: dropdown });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const clearLogData = () => {
        setState({
            EditId: '',
            department: '',
            course_name: '',
            course_code: '',
            duration_in_months: '',
            fees: '',
            college: null,
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
                college: state?.college?.value,
                name: state?.name,
                course_code: state?.course_code,
                duration_in_months: state?.duration_in_months,
                fee_amount: state?.fee_amount,
            };

            await Validation.CreateProgramme.validate(body, { abortEarly: false });

            if (state.EditId) {
                await Models.master.update_course(body, state.EditId);
                Success('Programme Updated successfully');
            } else {
                await Models.master.create_course(body);
                Success('Programme created successfully');
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
            await Models.master.delete_course(state.EditId);
            Success('Programme Deleted successfully');
            clearLogData();
            getMasterData(state.currentPage);
        } catch (error) {
            setState({ isDeleteOpen: false, isDeleteLoad: false });
        }
    };

    const handleEdit = (row) => {
        const rawValue = row?.fee_amount?.replace(/,/g, '');
        const numericValue = rawValue === '' ? 0 : parseInt(rawValue) || 0;
        setState({
            modalManage: true,
            EditId: row.id,
            name: row.name,
            isOpen: true,
            course_code: row.course_code,
            duration_in_months: row.duration_in_months,
            fee_amount: numericValue,
            college: { label: row.college_name, value: row.college },
        });
    };

    return (
        <div className="p-2">
            <div className="panel mb-3 flex items-center justify-between gap-5">
                <div className="flex items-center pl-3">
                    <h5 className="text-lg font-semibold">Programme</h5>
                </div>

                <div className="flex ">
                    <button
                        type="button"
                        className="btn btn-primary w-auto"
                        onClick={() => {
                            setState({ modalManage: false, EditId: null, department: '', isOpen: true });
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
                                accessor: 'college_name',
                                title: 'College Name',
                            },
                            {
                                accessor: 'name',
                            },

                            {
                                accessor: 'course_code',
                                title: 'Course Code ',
                            },

                            {
                                accessor: 'duration_in_months',
                                title: 'Duration (Months) ',
                            },
                            {
                                accessor: 'fee_amount',
                                title: 'Fee Amount',
                                render: (row: any) => <span>{formatIndianRupees(row.fee_amount)}</span>,
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
                addHeader={state.EditId ? 'Update Programme' : 'Create Programme'}
                close={() => setState({ isOpen: false, department: '', errors: {} })}
                renderComponent={() => (
                    <div className="space-y-4 p-5">
                        <CustomSelect
                            title="College"
                            value={state.college}
                            onChange={(e) => {
                                setState({ college: e, errors: { ...state.errors, college: '' } });
                            }}
                            placeholder={'Select College'}
                            options={state.collegeList}
                            required
                            error={state.errors?.college}
                        />

                        <TextInput
                            title={'Course Name'}
                            placeholder={'Enter course name'}
                            value={state.name}
                            onChange={(e) => setState({ name: e, errors: { ...state.errors, name: '' } })}
                            error={state.errors?.name}
                            required
                        />

                        <TextInput
                            title={'Course Code'}
                            placeholder={'Enter course code'}
                            value={state.course_code}
                            onChange={(e) => setState({ course_code: e, errors: { ...state.errors, course_code: '' } })}
                            error={state.errors?.course_code}
                            required
                        />

                        <TextInput
                            title={'Duration (Months)'}
                            placeholder={'Enter duration in months'}
                            value={state.duration_in_months}
                            onChange={(e) => setState({ duration_in_months: e, errors: { ...state.errors, duration_in_months: '' } })}
                            error={state.errors?.duration_in_months}
                            type="number"
                            required
                        />

                        <TextInput
                            title={'Fees'}
                            placeholder={'Enter course fees'}
                            error={state.errors?.fee_amount}
                            required
                            value={formatINR(state.fee_amount)}
                            onChange={(value) => {
                                const rawValue = value.replace(/,/g, '');
                                const numericValue = rawValue === '' ? 0 : parseInt(rawValue) || 0;
                                setState({
                                    fee_amount: numericValue,
                                    errors: { ...state.errors, fee_amount: '' },
                                });
                            }}
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
