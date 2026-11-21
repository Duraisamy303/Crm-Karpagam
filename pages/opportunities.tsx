import { Models, PrivateRouter, Validation } from '@/utils/imports.utils';
import React, { useEffect, useState } from 'react';
import { Dropdown, Failure, Success, convertUrlToFile, getFileNameFromUrl, objIsEmpty, roundOff, sortData, useSetState } from '@/utils/functions.utils';
import CommonLoader from './elements/commonLoader';
import dynamic from 'next/dynamic';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import IconEdit from '@/components/Icon/IconEdit';
import IconEye from '@/components/Icon/IconEye';
import { useRouter } from 'next/router';
import CustomSelect from '@/components/Select';
import IconArrowBackward from '@/components/Icon/IconArrowBackward';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import useDebounce from '@/common_component/useDebounce';
import SideMenu from '@/common_component/sideMenu';
import InputRange from '../common_component/slider';
import IconFilter from '@/components/Icon/IconFilter';
import IconUser from '@/components/Icon/IconUser';
import IconPlus from '@/components/Icon/IconPlus';
import OppCard from '@/components/oppCard';
import IconSearch from '@/components/Icon/IconSearch';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomeDatePicker from '@/common_component/datePicker';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';
import * as Yup from 'yup';
import IconFileUpload from '@/components/Icon/IconFileUpload';
import FileUpload from '@/common_component/fileUpload';
import YearPicker from '@/common_component/yearPicker';
import CustomYearSelect from '@/common_component/yearPicker';
import { useDispatch } from 'react-redux';
import { leadId, oppId } from '@/store/crmConfigSlice';
import { ROLE } from '@/utils/constant.utils';
import QuickEdit from '@/components/QuickEdit';
import IconNotesEdit from '@/components/Icon/IconNotesEdit';
import Tippy from '@tippyjs/react';
import QuickEditOpp from '@/components/QuickEditOpp';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});

const Opportunity = () => {
    const router = useRouter();

    const dispatch = useDispatch();

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'name',
        direction: 'asc',
    });

    const [state, setState] = useSetState({
        data: [],
        loading: false,
        selectedRecords: [],
        isOpenFilter: false,
        focusList: [],
        marketList: [],
        verticalList: [],
        stateList: [],
        state: '',
        vertical: '',
        market: '',
        focus: '',
        next: null,
        previous: null,
        totalRecords: 0,
        currentPage: 1,
        search: '',
        isOpen: false,

        // New Data
        isOpenOpp: false,
        stageList: [],
        currencyList: [],
        ownerList: [],
        hasMoreLead: '',
        currentLeadPage: 1,
        lead: '',
        closing_date: null,
        stage: '',
        lead_owner: '',
        currency: '',
        range: [0, 10000000],
        maxPrice: 10000000,
        start_date: '',
        end_date: '',
        file: null,
        recurring_value_per_year: '',
        columns: [],
        role: '',
        subLoading: false,
    });

    useEffect(() => {
        getData();
        // currencyList();
        // stageList();
        // ownerList();
        // leadList();
        // getFocusSegmentList();
        // getMarketSegmentList();
    }, []);

    const debouncedSearch = useDebounce(state.search, 500);

    useEffect(() => {
        if (filters()) {
            filterData(state.currentPage);
        } else {
            getData(state.currentPage);
        }
    }, [state.currentPage, debouncedSearch, state.vertical, state.focus, state.lead, state.stage]);

    useEffect(() => {
        setState({ currentPage: 1 });
    }, [debouncedSearch, state.vertical, state.focus, state.lead, state.stage]);

    useEffect(() => {
        if (state.data?.length > 0) {
            const sortedData = sortData(state.data, sortStatus.columnAccessor, sortStatus.direction);
            setState({ data: sortedData });
        }
    }, [sortStatus]);

    const getData = async (page = 1) => {
        try {
            // setState({ loading: true });
            // const response: any = await Models.opportunity.allList(page);
            // const res: any = await Models.auth.userDetails();
            // setState({ role: res?.designation });
            // tableData(response?.results, res?.designation);

            // setState({
            //     loading: false,
            //     totalRecords: response.count,
            //     next: response.next,
            //     previous: response.previous,
            // });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const filters = () => {
        let filter = false;
        if (state.search || state.vertical || state.focus || state.lead || state.range[0] > 0 || state.range[1] != state.maxPrice || state.stage) {
            filter = true;
        }
        return filter;
    };

    const filterData = async (page = 1) => {
        try {
            setState({ loading: true });
            let body = bodyData();
            if (!objIsEmpty(body)) {
                // const response: any = await Models.opportunity.filter(body, page);
                // tableData(response?.results, state.role);
                // setState({
                //     loading: false,
                //     totalRecords: response.count,
                //     next: response.next,
                //     previous: response.previous,
                //     isOpen: false,
                // });
            } else {
                getData();
                setState({
                    loading: false,

                    isOpen: false,
                });
            }
        } catch (error) {
            setState({ loading: false });
        }
    };

    const bodyData = () => {
        let body: any = {};

        // lead_id
        //owner_id
        //stage_id
        //currency_type
        //closing_date
        //opportunity_value

        if (state.search) {
            body.key = state.search;
        }
        if (state.vertical) {
            body.vertical_id = [state.vertical?.value];
        }
        if (state.lead) {
            body.lead_id = [state.lead?.value];
        }
        if (state.lead_owner) {
            body.owner_id = [state.lead_owner?.value];
        }
        if (state.stage) {
            body.stage_id = [state.stage?.value];
        }
        if (state.currency) {
            body.currency_type = [state.currency?.value];
        }
        if (state.start_date) {
            body.start_date = moment(state.start_date).format('YYYY-MM-DD');
        }
        if (state.end_date) {
            body.end_date = moment(state.end_date).format('YYYY-MM-DD');
        }
        if (state.focus) {
            body.focus_segment = [state.focus?.value];
        }

        if (state.range[0] > 0 || state.range[1] != state.maxPrice) {
            body.opportunity_value = [state.range[0], state.range[1]];
        }

        return body;
    };



    // ...table
    const tableData = (res: any, role: string) => {
        const data = res?.map((item) => {
            return {
                // ...item,
                name: item?.lead?.name,
                contactName: item?.owner?.username,
                opportunityName:item?.name,
                opportunity_value: item.opportunity_value,
                probability_in_percentage: item.probability_in_percentage,
                // recurring_value_per_year: item?.recurring_value_per_year,
                stages: item?.stage,
                // currency: item.currency_type.currency_short,
                closing_date: item.closing_date,
            };
        });
        let columns = [];

        setState({ data: data, columns });
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

    const clearOppData = () => {
        setState({
            oppId: '',
            opp_name: '',
            owner: '',
            opportunity_value: '',
            recurring_value_per_year: '',
            currency_type: '',
            probability_in_percentage: '',
            opp_created_by: '',
            opp_closing_date: '',
            opp_stage: '',
            isOpenOpp: false,
            oppLoading: false,
            errors: '',
            createlead: '',
            file: null,
        });
    };

    const createAndUpdateOpportunity = async () => {
        try {
            setState({ oppLoading: true });
            const validateField = {
                opp_name: state.opp_name,
                owner: state.owner?.value,
                opp_stage: state.opp_stage?.value,
                opportunity_value: state.opportunity_value,
                recurring_value_per_year: state.recurring_value_per_year,
                currency_type: state.currency_type?.value,
                closing_date: state.opp_closing_date ? moment(state.opp_closing_date).format('YYYY-MM-DD') : '',
                probability_in_percentage: state.probability_in_percentage,
            };

            const formData = new FormData();

            formData.append('lead', state.createlead?.value || '');
            formData.append('name', state.opp_name || '');
            formData.append('owner', state.owner?.value || '');
            formData.append('stage', state.opp_stage?.value || '');
            formData.append('opportunity_value', state.opportunity_value || '');
            formData.append('recurring_value_per_year', state.recurring_value_per_year || '');
            formData.append('currency_type', state.currency_type?.value || '');
            formData.append('closing_date', state.opp_closing_date ? moment(state.opp_closing_date).format('YYYY-MM-DD') : '');
            formData.append('probability_in_percentage', state.probability_in_percentage || '');
            if (state.file && state.file instanceof File) {
                formData.append('file', state.file); // Make sure to append the file correctly
            } else {
                formData.append('file', ''); // Make sure to append the file correctly
            }
            await Validation.createOppValidation.validate(validateField, { abortEarly: false });
            let res;
            if (state.oppId) {
                res = await Models.opportunity.update(formData, state.oppId);
            } else {
                res = await Models.opportunity.create(formData);
            }
            setState({ oppLoading: false });
            getData();
            Success(res?.message);
            clearOppData();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message; // Set the error message for each field
                });
                setState({ errors: validationErrors });
                setState({ oppLoading: false });
            } else {
                setState({ oppLoading: false });
            }
            setState({ oppLoading: false });
        }
    };

    const leadListLoadMore = async () => {
        try {
            // if (state.hasMoreLead) {
            //     const res: any = await Models.lead.list(state.currentLeadPage + 1);
            //     const newOptions = Dropdown(res?.results, 'name');
            //     setState({
            //         leadList: [...state.leadList, ...newOptions],
            //         hasMoreLead: res.next,
            //         currentLeadPage: state.currentLeadPage + 1,
            //     });
            // } else {
            //     setState({
            //         leadList: state.leadList,
            //     });
            // }
        } catch (error) {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };

    const editOppData = async (row) => {
        try {
            if (row?.file_url) {
                const fileName = getFileNameFromUrl(row?.file_url);
                const files = await convertUrlToFile(row?.file_url, fileName);
                setState({ file: files });
            }
            setState({
                oppId: row.id,
                isOpenOpp: true,
                opp_name: row.name,
                owner: { value: row?.owner?.id, label: row?.owner?.username },
                opportunity_value: Number(row?.opportunity_value),
                recurring_value_per_year: Number(row?.recurring_value_per_year),
                currency_type: { value: row?.currency_type?.id, label: row?.currency_type?.currency_short },
                probability_in_percentage: row.probability_in_percentage,
                opp_created_by: { value: row?.created_by?.id, label: row?.created_by?.username },
                opp_closing_date: new Date(row?.closing_date),
                opp_stage: { value: row?.stage?.id, label: row?.stage?.stage },
                createlead: { value: row?.lead?.id, label: row?.lead?.name },
            });
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const clearFilter = () => {
        setState({
            state: '',
            vertical: '',
            next: null,
            previous: null,
            totalRecords: 0,
            currentPage: 1,
            search: '',
            isOpen: false,
            range: [0, state.maxPrice],
            stage: '',
            currency: '',
            closing_date: null,
            lead_owner: '',
            lead: '',
            start_date: '',
            end_date: '',
            currency_type: '',
        });
        getData();
    };

    const getProbabilityPercentage = async (e) => {
        try {
            // if (e) {
            //     const res: any = await Models.opportunity.getProbabilityPercentage(e?.value);
            //     setState({ probability_in_percentage: res.probability });
            // } else {
            //     setState({ probability_in_percentage: '' });
            // }
        } catch (error) {}
    };

    const getLeadOwnerByLeadId = async (e) => {
        try {
            if (e) {
                const res: any = await Models.lead.details(e?.value);
                let lead_owner = res?.lead_owner;
                setState({ owner: { value: lead_owner?.id, label: lead_owner?.username } });
            } else {
                setState({ owner: '' });
            }
        } catch (error) {}
    };

    return (
        <div className="p-2">
            <div className="panel flex items-center justify-between gap-5 ">
                <div className="flex items-center gap-5 pl-3">
                    <h5 className="text-lg font-semibold ">Opportunities</h5>
                </div>
                <div className="flex gap-5">
                    <button type="button" className="btn btn-primary font-white w-full md:mb-0 md:w-auto" onClick={() => setState({ isOpenOpp: true })}>
                        + Create
                    </button>
                </div>
            </div>
            <div className="panel mt-2 flex flex-col items-center justify-between gap-5 lg:flex-row">
                <div className="relative flex w-full max-w-lg rounded-full border border-gray-300 dark:border-white-dark/30">
                    <button type="submit" className="m-auto flex items-center justify-center px-3 py-2 text-primary ">
                        <IconSearch className="h-6 w-6 font-bold" /> {/* Icon size slightly reduced */}
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search"
                        className="form-input w-full rounded-r-full border-0 bg-white py-1.5 pl-0 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div>

                <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row">
                    <CustomSelect value={state.stage} onChange={(e) => setState({ stage: e })} placeholder={'Stage'} options={state.stageList} error={state.errors?.stage} className="w-full lg:w-64" />
                    <CustomSelect
                        value={state.lead}
                        onChange={(e) => setState({ lead: e })}
                        placeholder={'Lead'}
                        options={state.leadList}
                        error={state.errors?.lead}
                        required
                        className="w-full lg:w-64"
                        loadMore={() => leadListLoadMore()}
                    />
                    <CustomSelect
                        options={state.focusList}
                        value={state.focus}
                        onChange={(e) => {
                            if (e) {
                                setState({ focus: e });
                                // verticalList(e);
                            } else {
                                setState({ focus: '', verticalList: [], vertical: '' });
                            }
                        }}
                        isMulti={false}
                        placeholder={'Focus Segment'}
                        className="w-full lg:w-64"
                    />

                    <button className="btn btn-primary lg:mt-0" onClick={() => setState({ isOpen: true })}>
                        <IconFilter />
                    </button>
                </div>
            </div>

            <div className="  mt-2 grid  grid-cols-12 gap-4">
                {state.loading ? (
                    <div className="relative inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
                        <CommonLoader />
                    </div>
                ) : (
                    <div className=" col-span-12 flex flex-col   md:col-span-12">
                        <div className="flex items-center justify-end pb-2 pr-3">
                            <div className="rounded-lg bg-gray-300 p-1 font-semibold">
                                {state.currentPage}-{Math.min(state.currentPage * 10, state.totalRecords)} of {state.totalRecords}
                            </div>
                        </div>

                        {/* ...table */}
                        <DataTable
                            className="table-responsive"
                            records={state.data}
                            columns={[
                                {
                                    accessor: 'name',
                                    
                                    title: 'Lead',
                                },
                                {
                                    accessor: 'contactName',
                                    
                                    title: 'Contact Name',
                                },
                                {
                                    accessor: 'opportunityName',
                                    
                                    title: 'Opportunity Name',
                                },
                                { accessor: 'opportunity_value',  title: 'Opportunity Value', render: (row: any) => <div>{roundOff(row?.opportunity_value)}</div> },
                                { accessor: 'probability_in_percentage',  title: 'Probability (%)' },
                                // { accessor: 'recurring_value_per_year',  title: 'Recurring Value ', render: (row: any) => <div>{roundOff(row?.recurring_value_per_year)}</div> },
                                { accessor: 'stages',  title: 'Stage' },
                                // { accessor: 'currency',  title: 'Currency Type' },
                                { accessor: 'closing_date',  title: 'Closing Date', render: (row: any) => <div>{moment(row?.closing_date).format('DD-MM-YYYY')}</div> },
                                {
                                    accessor: 'actions',
                                    title: 'Actions',
                                    render: (row: any) => (
                                        <>
                                            <div className="mx-auto flex w-max items-center gap-4">
                                                <Tippy content="Quick Edit" className="rounded-lg bg-black p-1 text-sm text-white">
                                                    <button
                                                        type="button"
                                                        className="flex hover:text-primary"
                                                        onClick={() => {
                                                            // Toggle row expansion
                                                            state.expandedRow === row.id ? setState({ expandedRow: null }) : setState({ expandedRow: row.id });
                                                        }}
                                                    >
                                                        <IconNotesEdit />
                                                    </button>
                                                </Tippy>
                                                <button
                                                    type="button"
                                                    className="flex hover:text-danger"
                                                    onClick={() => {
                                                        dispatch(oppId(row?.id));
                                                        dispatch(leadId(row?.id));

                                                        router.push(`/viewOpportunity?id=${row.id}`);
                                                    }}
                                                >
                                                    <IconEye />
                                                </button>
                                                <button className="flex hover:text-info" onClick={() => editOppData(row)}>
                                                    <IconEdit className="h-4.5 w-4.5" />
                                                </button>
                                            </div>
                                        </>
                                    ),
                                },
                            ]}
                            highlightOnHover
                            sortStatus={sortStatus}
                            onSortStatusChange={setSortStatus}
                            totalRecords={state.data?.length}
                            recordsPerPage={state.pageSize}
                            minHeight={200}
                            page={null}
                            onPageChange={(p) => {}}
                            withBorder={true}
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
                                            <QuickEditOpp collapse={() => collapse()} />
                                        </div>
                                    ) : null,
                            }}
                            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                        />
                        <div className="mt-5 flex justify-center gap-3">
                            <button disabled={!state.previous} onClick={handlePreviousPage} className={`btn ${!state.previous ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowBackward />
                            </button>
                            <button disabled={!state.next} onClick={handleNextPage} className={`btn ${!state.next ? 'btn-disabled' : 'btn-primary'}`}>
                                <IconArrowForward />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <SideMenu
                title={state.oppId ? 'Update Opportunity' : 'Add Opportunity'}
                open={state.isOpenOpp}
                width={450}
                close={() => clearOppData()}
                cancelOnClick={() => clearOppData()}
                submitOnClick={() => createAndUpdateOpportunity()}
                submitLoading={state.oppLoading}
                renderComponent={() => (
                    <div className="flex flex-col gap-3">
                        <FileUpload
                            onFileSelect={(file) => setState({ file })}
                            buttonText="Upload Document"
                            iconSrc="/assets/images/fileUplaod.jpg"
                            accept=".pdf,.doc,.docx,.txt"
                            isImageAllowed={false} // Only allow non-image files
                            value={state.file}
                        />
                        <CustomSelect
                            title="Lead "
                            value={state.createlead}
                            onChange={(e) => {
                                getLeadOwnerByLeadId(e);
                                setState({ createlead: e });
                            }}
                            placeholder={'Lead '}
                            options={state.leadList}
                            loadMore={() => leadListLoadMore()}
                        />
                        <TextInput title="Name" value={state.opp_name} onChange={(e) => setState({ opp_name: e })} placeholder={'Name'} error={state.errors?.opp_name} required />
                        <CustomSelect
                            title="Opportunity Owner"
                            value={state.owner}
                            onChange={(e) => setState({ owner: e })}
                            placeholder={'Opportunity Owner'}
                            options={state.ownerList}
                            error={state.errors?.owner}
                            required
                        />
                        <NumberInput
                            error={state.errors?.opportunity_value}
                            title="Opportunity Value"
                            value={state.opportunity_value}
                            onChange={(e) => setState({ opportunity_value: e })}
                            placeholder={'Opportunity Value'}
                            required
                        />
                        {/* <YearPicker
                            required
                            error={state.errors?.recurring_value_per_year}
                            title="Recurring Value Per Year"
                            value={state.recurring_value_per_year}
                            onChange={(year) => {
                                setState({ recurring_value_per_year: year });
                            }}
                        /> */}
                        {/* <CustomYearSelect
                            title="Recurring Value Per Year"
                            value={state.recurring_value_per_year}
                            onChange={(e) => setState({ recurring_value_per_year: e })}
                            placeholder={'Recurring Value Per Year'}
                            error={state.errors?.recurring_value_per_year}
                            required
                        />  */}

                        <NumberInput
                            title="Recurring Value Per Year"
                            value={state.recurring_value_per_year}
                            onChange={(e) => setState({ recurring_value_per_year: e })}
                            placeholder={'Recurring Value Per Year'}
                            error={state.errors?.recurring_value_per_year}
                            required
                        />
                        <CustomSelect
                            title="Stage"
                            value={state.opp_stage}
                            onChange={(e) => {
                                setState({ opp_stage: e });
                                getProbabilityPercentage(e);
                            }}
                            placeholder={'Stage'}
                            options={state.stageList}
                            required
                            error={state.errors?.opp_stage}
                        />
                        <NumberInput
                            title="Probability In Percentage"
                            value={state.probability_in_percentage}
                            onChange={(e) => {
                                setState({ probability_in_percentage: e });
                            }}
                            placeholder={'Probability In Percentage'}
                            error={state.errors?.probability_in_percentage}
                            max={100}
                            required
                        />

                        {/* <CustomSelect
                            title="Created By"
                            value={state.opp_created_by}
                            onChange={(e) => setState({ opp_created_by: e })}
                            placeholder={'Created By'}
                            options={state.createdByList}
                            required
                            error={state.errors?.created_by}
                        /> */}
                        <CustomeDatePicker
                            error={state.errors?.closing_date}
                            value={state.opp_closing_date}
                            placeholder="Closing Date"
                            title="Closing Date"
                            onChange={(e) => setState({ opp_closing_date: e })}
                            required
                        />
                        <CustomSelect
                            title="Currency Type"
                            value={state.currency_type}
                            onChange={(e) => setState({ currency_type: e })}
                            placeholder={'Currency Type'}
                            options={state.currencyList}
                            required
                            error={state.errors?.currency_type}
                        />

                        {/* <CustomSelect
                            title="Primary Contact"
                            value={state.createlead}
                            onChange={(e) => {
                                // getLeadOwnerByLeadId(e);
                                // setState({ createlead: e });
                            }}
                            placeholder={'Primary Contact'}
                            options={state.leadList}
                            // loadMore={() => leadListLoadMore()}
                        /> */}

                        {/* <div className="mt-3 flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => clearOppData()}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => createAndUpdateOpportunity()}>
                                {state.oppLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit'}
                            </button>
                        </div> */}
                    </div>
                )}
            />
            <SideMenu
                title="Filter"
                open={state.isOpen}
                close={() => setState({ isOpen: false })}
                cancelOnClick={() => clearFilter()}
                submitOnClick={() => filterData(state.currectPage)}
                submitLoading={state.loading}
                canceTitle="Reset"
                renderComponent={() => (
                    <div>
                        <div className=" mb-5 mt-5 flex flex-col gap-4 md:mt-0  md:justify-between">
                            <CustomSelect
                                title="Lead Manager"
                                value={state.lead_owner}
                                onChange={(e) => setState({ lead_owner: e })}
                                placeholder={'Lead Manager'}
                                options={state.ownerList}
                                error={state.errors?.lead_owner}
                            />
                            <CustomeDatePicker value={state.start_date} placeholder="Start Date" title="Start Date" onChange={(e) => setState({ start_date: e })} />
                            <CustomeDatePicker value={state.end_date} placeholder="End Date" title="End Date" onChange={(e) => setState({ end_date: e })} />

                            <CustomSelect
                                title="Currency Type"
                                value={state.currency}
                                onChange={(e) => setState({ currency: e })}
                                placeholder={'Currency Type'}
                                options={state.currencyList}
                                error={state.errors?.currency}
                            />
                            <div id="" className="">
                                <label className="text-md mb-2 block font-bold text-gray-700">Opportunity Value</label>
                                <div id="" className="p-2">
                                    <InputRange STEP={1} MIN={0} MAX={state.maxPrice} values={state.range} handleChanges={(data) => setState({ range: data })} />
                                </div>
                                <div className="mt-2 flex w-full items-center justify-between">
                                    <span className="">{state?.range[0] ? roundOff(state?.range[0]) : 0}</span>
                                    <span className="">{state?.range[1] ? roundOff(state?.range[1]) : roundOff(state.maxPrice)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            />
        </div>
    );
};

export default PrivateRouter(Opportunity);




 
