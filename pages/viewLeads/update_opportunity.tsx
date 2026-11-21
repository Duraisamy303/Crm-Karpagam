import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useRouter } from 'next/router';
import IconUser from '@/components/Icon/IconUser';
import { Dropdown, Failure, Success, convertUrlToFile, getFileNameFromUrl, objIsEmpty, useSetState } from '@/utils/functions.utils';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomSelect from '@/components/Select';
import Models from '@/imports/models.import';
import CommonLoader from '../elements/commonLoader';
import IconLoader from '@/components/Icon/IconLoader';
import { PrivateRouter, Validation } from '@/utils/imports.utils';
import * as Yup from 'yup';
import Breadcrumb from '@/common_component/breadcrumb';
import TextArea from '@/components/TextArea';
import { LEADTYPE } from '@/utils/constant.utils';
import CustomeDatePicker from '@/common_component/datePicker';
import FileUpload from '@/common_component/fileUpload';
import { IRootState } from '@/store';
import lead from '@/models/lead.model';
import dayjs from 'dayjs';

const CreateOpportunities = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Create Opportunity'));
    });
    const router = useRouter();

    const id = router?.query?.id;

    const redux = useSelector((state: IRootState) => state.crmConfig);

    const crmConfig = useSelector((state: IRootState) => state.crmConfig);

    const [state, setState] = useSetState({
        loading: false,
        name: '',
        focus_segment: null,
        lead_owner: '',
        country: null,
        state: null,
        company_number: '',
        company_email: '',
        company_website: '',
        fax: '',
        annual_revenue: '',
        tags: [],
        market_segment: '',
        is_active: false,
        focusSegmentList: [],
        marketSegmentList: [],
        countryList: [],
        tagList: [],
        ownerList: [],
        stateList: [],
        createdByList: [],
        stateLoading: false,
        submitLoad: false,
        errors: null,
        created_by: null,
        verticalList: [],
        vertical: '',
        isOpenTask: false,
        isOpen: false,
        source_from: null,
        assignList: [],
        sourceList: [],
        sourceFromList: [],
        leadTypeList: [],
        leadManagerList: [],
        contactPage: 1,
        leadId: null,
        StageList: [],

        opp_name: '',
        opp_value: '',
        opp_value_per_year: '',
        opp_closing_date: '',
        opp_percentage: '',
        remark: '',
        contact: null,
        contact_name: '',
        email_id: '',
        phone_number: '',
        designation: '',
        department: null,
        lead_source: null,
        contact_status: null,
        file: null,
    });

    useEffect(() => {
        // ownerList();
        // createdByList();
        // currencyList();
        // LeadManagerList();
        // StageList();
        // // contactList();
        // sourceList();
        // departmentList();
        // statusList();
        contactStatusList();

        const LeadId = localStorage.getItem('LeadId');
        setState({ leadId: LeadId });
    }, []);

    useEffect(() => {
        if (state?.leadId) {
            contactList(state?.leadId);
        }
    }, [state?.leadId]);

    useEffect(() => {
        if (id) {
            GetOpportunitesDatas(id);
        }
    }, [id]);

    const GetOpportunitesDatas = async (id) => {
        try {
            setState({ loading: true });
            const res: any = await Models.opportunity.details(id);

            if (res?.file_url) {
                const fileName = getFileNameFromUrl(res?.file_url);
                const files = await convertUrlToFile(res?.file_url, fileName);
                setState({ file: files });
            }

            setState({
                opp_name: res.name,
                opp_value: res.opportunity_value,
                opp_value_per_year: res.recurring_value_per_year,
                opp_closing_date: res.closing_date,
                opp_percentage: res.probability_in_percentage,
                stage: !objIsEmpty(res.stage) ? { value: res.stage.id, label: res.stage.stage } : null,
                // lead_manager: { value: res.owner.id, label: res.owner.username },
                remark: res.remark,
                contact: { value: res.primary_contact.id, label: res.primary_contact.name },
                contact_name: res.primary_contact.name,
                email_id: res.primary_contact.email_id,
                phone_number: res.primary_contact.phone_number,
                designation: res.primary_contact.designation,
                department: !objIsEmpty(res.primary_contact) ? { value: res.primary_contact.department.id, label: res.primary_contact.department.department } : null,
                lead_source: !objIsEmpty(res.primary_contact) ? { value: res.primary_contact.lead_source.id, label: res.primary_contact.lead_source.source } : null,
                contact_status: !objIsEmpty(res.primary_contact) ? { value: res.primary_contact.status.id, label: res.primary_contact.status.status } : null,
            });
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const contactList = async (id: any) => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.listByLeadId(id);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ contactList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    // const LeadManagerList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.leadManager();
    //         const dropdownList = Dropdown(res?.results, 'full_name');
    //         setState({ leadManagerList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const StageList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.leadStageList();
    //         const dropdownList = Dropdown(res.results, 'stage');
    //         setState({ stageList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const getMarketSegmentList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.GetDropdown('market_segments');
    //         const dropdownList = Dropdown(res.results, 'market_segment');
    //         setState({ marketSegmentList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const sourceList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.sourceList();
    //         const dropdownList = Dropdown(res.results, 'source');
    //         setState({ sourceList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const statusList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.statusList();
    //         const dropdownList = Dropdown(res.results, 'name');
    //         setState({ statusList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    const contactStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.status();
            const dropdownList = Dropdown(res, 'status');
            setState({ contactStatusList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    // const countryList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.GetDropdown('countries');
    //         const dropdownList = Dropdown(res?.results, 'country_name');
    //         setState({ countryList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const stateList = async (country) => {
    //     try {
    //         setState({ stateLoading: true });
    //         const res: any = await Models.lead.stateList(country?.value);
    //         const dropdownList = Dropdown(res.results, 'state_name');
    //         setState({ stateList: dropdownList, stateLoading: false });
    //     } catch (error) {
    //         setState({ stateLoading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const cityList = async (state) => {
    //     try {
    //         const res: any = await Models.lead.cityList(state?.value);
    //         const dropdownList = Dropdown(res, 'city_name');
    //         setState({ cityList: dropdownList });
    //     } catch (error) {
    //         setState({ stateLoading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const tagList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.GetDropdown('tags');
    //         const dropdownList = Dropdown(res.results, 'tag');
    //         setState({ tagList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const assignList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res = await Models.lead.bdmAndBDE();
    //         const dropdownList = Dropdown(res, 'full_name');
    //         setState({ assignList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //         console.log('error: ', error);
    //     }
    // };

    // const departmentList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.departmentList();
    //         const dropdownList = Dropdown(res.results, 'department');
    //         setState({ departmentList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });

    //         console.log('error: ', error);
    //     }
    // };

    // const contactList = async (page) => {
    //     const res: any = await Models.contact.list(page);
    //     const dropdownList = Dropdown(res.results, 'name');
    //     setState({ contactList: dropdownList, hasMoreLead: res.next });
    //     try {
    //     } catch (error) {
    //         console.log('error: ', error);
    //     }
    // };

    // const verticalList = async () => {
    //     try {
    //         setState({ loading: true });
    //         const res: any = await Models.lead.GetDropdown('verticals');
    //         const dropdownList = Dropdown(res, 'vertical');
    //         setState({ verticalList: dropdownList, loading: false });
    //     } catch (error) {
    //         setState({ loading: false });
    //     }
    // };

    const contactLoadMore = async () => {
        try {
            if (state.hasMoreLead) {
                const role: any = await Models.auth.userDetails();
                const res: any = await Models.contact.list(state.contactPage + 1, role?.id);
                const newOptions = Dropdown(res?.results, 'name');
                setState({
                    contactList: [...state.contactList, ...newOptions],
                    hasMoreLead: res.next,
                    contactPage: state.contactPage + 1,
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

    const handleSelectedContact = async (contact) => {
        try {
            setState({ contact: contact });

            if (contact) {
                const res: any = await Models.contact.details(contact?.value);
                setState({
                    contact_name: res.name,
                    email_id: res.email_id,
                    phone_number: res.phone_number,
                    designation: res.designation,
                    department: !objIsEmpty(res.department) ? { value: res?.department?.id, label: res?.department?.department } : null,
                    lead_source: !objIsEmpty(res.lead_source) ? { value: res?.lead_source?.id, label: res?.lead_source?.source } : null,
                    contact_status: !objIsEmpty(res.status) ? { value: res.status.id, label: res.status.status } : null,
                    contact_remark: res?.remark,
                });
            }
        } catch (error) {
            console.log('error: ', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setState({ submitLoad: true });
            if (objIsEmpty(state.contact)) {
                Failure('Select a contact');
                setState({ submitLoad: false });
            } else {
                // let tags = [];
                // if (state.tags?.length > 0) {
                //     tags = state.tags?.map((item) => item.value);
                // }

                const body = {
                    opp_name: state.opp_name,
                    opp_value: state.opp_value,
                    opp_value_per_year: state.opp_value_per_year,
                    opp_closing_date: state.opp_closing_date,
                    opp_percentage: state.opp_percentage,
                    // lead_manager: state.lead_manager?.value,
                    stage: state.stage?.value,
                    // primary_contact: state.contact?.value,
                    // focus_segment: state.focus_segment?.value,
                    // address: state.address,
                    // country: state.country?.value,
                    // state: state.state?.value,
                    // city: state.city?.value,
                    // annual_revenue: state.annual_revenue ? Number(state.annual_revenue) : null,
                    // market_segment: state.market_segment?.value,
                    // lead_type: state.lead_type?.value,
                    // lead_owner: state.lead_owner?.value,
                    // tags: tags,
                    // is_active: true,
                    // assigned_to: state.assigned_to?.value,
                    // status: state.status?.value,
                    // remark: state.remark,
                    // contact_id: state.contact?.value,
                    //For contact
                    contact_name: state.contact_name,
                    email_id: state.email_id,
                    designation: state.designation,
                    department: state.department?.value,
                    phone_number: state.phone_number,
                    lead_source: state.lead_source?.value,
                    // contact_remark: state.contact_remark,
                    // is_archive: false,
                    contact_status: state.contact_status?.value,
                    // file: state.file,
                };

                const opportunity = {
                    lead: state.leadId,
                    primary_contact: state.contact?.value,
                    name: state.opp_name,
                    opportunity_value: state.opp_value,
                    recurring_value_per_year: state.opp_value_per_year,
                    closing_date: dayjs(state.opp_closing_date).format('YYYY-MM-DD'),
                    probability_in_percentage: state.opp_percentage,
                    // owner: state.lead_manager?.value,
                    remark: state.remark,
                    file: state.file,
                    stage: state.stage?.value,

                    // company_website: state.company_website,
                    // vertical: state.vertical?.value,
                    // focus_segment: state.focus_segment?.value,
                    // address: state.address,
                    // country: state.country?.value,
                    // state: state.state?.value,
                    // city: state.city?.value,
                    // annual_revenue: state.annual_revenue ? Number(state.annual_revenue) : null,
                    // market_segment: state.market_segment?.value,
                    // lead_type: state.lead_type?.value,
                    // lead_owner: state.lead_owner?.value,
                    // tags: tags,
                    // is_active: true,
                    // assigned_to: state.assigned_to?.value,
                    // status: state.status?.value,
                    // remark: state.remark,
                    // contact_id: state.contact?.value,
                };

                // const contacts = {
                //     name: state.contact_name,
                //     email_id: state.email_id,
                //     designation: state.designation,
                //     department: state.department?.value,
                //     phone_number: state.phone_number,
                //     lead_source: state.lead_source?.value,
                //     remark: state.contact_remark,
                //     is_archive: false,
                //     // lead: state.lead?.value,
                //     status: state.contact_status?.value,
                //     is_active: true,
                //     moveToLead: true,
                // };

                // console.log('contacts: ', contacts);

                await Validation.createOppValidation.validate(body, { abortEarly: false });
                const res: any = await Models.opportunity.update(opportunity, id);
                Success('Opportunity updated successfully');
                router.replace(`/viewLead?id=${state.leadId}`);
                setState({ submitLoad: false });
                // if (res?.id) {
                //     updateContacts(res?.id);
                // } else {
                //     setState({ submitLoad: false });
                // }
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });

                setState({ errors: validationErrors });
                setState({ submitLoad: false });
            } else {
                setState({ submitLoad: false });
            }
            setState({ submitLoad: false });
        }
    };

    console.log('error: ', state.errors);

    // const updateContacts = async (leadId) => {
    //     try {
    //         const body = {
    //             lead: leadId,
    //             name: state.contact_name,
    //             email_id: state.email_id,
    //             designation: state.designation,
    //             department: state.department?.value,
    //             phone_number: state.phone_number,
    //             lead_source: state.lead_source?.value,
    //             remark: state.contact_remark,
    //             is_archive: false,
    //             status: state.contact_status?.value,
    //             is_active: true,
    //             moveToLead: true,
    //         };

    //         await Models.contact.update(body, state.contact?.value);
    //         setState({ submitLoad: false });
    //         Success('Lead created successfully');
    //         router.replace('/leads');
    //     } catch (error) {
    //         setState({ submitLoad: false });

    //         console.log('error: ', error);
    //     }
    // };

    const breadcrumbItems = [
        { label: 'Home', path: '/leads' },
        { label: 'Create Opportunity', path: '' },
    ];

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="relative h-auto  overflow-scroll bg-[#dbe7ff] bg-cover p-2">
            <Breadcrumb items={breadcrumbItems} />

            <div className="panel  flex  items-center justify-between gap-5 ">
                <div className="flex items-center gap-2">
                    <div className="flex h-[50px] w-[50px] overflow-hidden bg-white" style={{ borderRadius: 50 }}>
                        <img src="/assets/images/profile-1.jpeg" height={'100%'} width={'100%'} />
                    </div>
                    <div>
                        <h5 className="font-semibold " style={{ fontSize: '18px' }}>
                            Create Opportunity
                        </h5>
                        <div className="  " style={{ fontSize: '14px', color: 'grey' }}>
                            Your data journey starts here...
                        </div>
                    </div>
                </div>
                {/* <div className="flex gap-3">
                    <CustomSelect
                        value={state.assigned_to}
                        onChange={(e) => setState({ assigned_to: e })}
                        placeholder={'Assign To'}
                        options={state.assignList}
                        error={state.errors?.assigned_to}
                        required
                        className="w-[200px]"
                    />

                    <CustomSelect
                        value={state.status}
                        onChange={(e) => setState({ status: e })}
                        placeholder={'Status'}
                        options={state.statusList}
                        error={state.errors?.status}
                        required
                        className="w-[200px]"
                    />
                </div> */}
            </div>
            <div className="panel mt-2">
                <CustomSelect
                    value={state.contact}
                    onChange={(e) => {
                        handleSelectedContact(e);
                    }}
                    isSearchable={true}
                    placeholder={'Select Contact'}
                    options={state.contactList}
                    className=" lg:w-2/3"
                    loadMore={() => contactLoadMore()}
                />
                {/* <div className="  relative flex w-full max-w-lg items-center rounded-full border border-gray-300 dark:border-white-dark/30 ">
                    <button type="submit" className="absolute right-2 flex items-center justify-center rounded-full bg-transparent p-2 text-primary hover:bg-gray-200 dark:hover:bg-gray-700">
                        <IconSearch className="h-5 w-5 font-bold" />
                    </button>
                    <input
                        type="text"
                        value={state.search}
                        onChange={(e) => setState({ search: e.target.value })}
                        placeholder="Search contact"
                        className="form-input flex-grow rounded-full border-0 bg-white py-2 pl-4 text-sm placeholder:tracking-wide focus:shadow-lg focus:outline-none dark:bg-gray-800 dark:shadow-[#1b2e4b] dark:placeholder:text-gray-400"
                    />
                </div> */}
            </div>
            <div className="mt-1 flex w-full justify-between space-x-2">
                <div className={`mt-1 ${!objIsEmpty(state.contact) ? 'w-1/3' : 'w-2/3'}`}>
                    <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                                <IconUser className="text-[#82de69]" />
                            </div>
                            <div className=" " style={{ fontSize: '20px' }}>
                                Opportunity Information
                            </div>
                        </div>
                        <TextInput
                            title="Opportunity Name"
                            value={state.opp_name}
                            onChange={(e) => setState({ opp_name: e })}
                            placeholder={'Opportunity Name'}
                            required
                            error={state.errors?.opp_name}
                        />
                        <NumberInput
                            title="Opportunity Value"
                            value={state.opp_value}
                            onChange={(e) => setState({ opp_value: e })}
                            placeholder={'Opportunity Value'}
                            required
                            error={state.errors?.opp_value}
                        />
                        <NumberInput
                            title="Opportunity Value Per Year"
                            value={state.opp_value_per_year}
                            onChange={(e) => setState({ opp_value_per_year: e })}
                            placeholder={'Opportunity Value Per Year'}
                            required
                            error={state.errors?.opp_value_per_year}
                        />
                        <NumberInput
                            title="Probability In Percentage"
                            value={state.opp_percentage}
                            onChange={(e) => setState({ opp_percentage: e })}
                            placeholder={'Probability In Percentage'}
                            required
                            error={state.errors?.opp_percentage}
                        />
                        <CustomeDatePicker
                            required
                            error={state.errors?.opp_closing_date}
                            value={state.opp_closing_date}
                            placeholder="Closing Date"
                            title="Closing Date"
                            onChange={(e) => setState({ opp_closing_date: e })}
                        />
                        <CustomSelect
                            value={state.stage}
                            onChange={(e) => setState({ stage: e })}
                            placeholder={'Stage'}
                            title={'Stage'}
                            options={state.stageList}
                            error={state.errors?.stage}
                            required
                        />
                    </div>
                </div>
                {!objIsEmpty(state.contact) && (
                    <div className=" w-1/3">
                        <div className=" col-span-12 flex flex-col   md:col-span-5">
                            <div className="panel mt-1 flex flex-col gap-5 rounded-2xl p-3 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#ffeeee]">
                                        <IconUser className="text-[#fe70f2]" />
                                    </div>
                                    <div className="text-lg font-medium" style={{ fontSize: '20px' }}>
                                        Contact Information
                                    </div>
                                </div>
                                <TextInput title="Name" value={state.contact_name} onChange={(e) => setState({ contact_name: e })} placeholder={' Name'} error={state.errors?.contact_name} required />
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
                                    value={state.department}
                                    onChange={(e) => setState({ department: e })}
                                    placeholder={'Department'}
                                    title={'Department'}
                                    options={state.departmentList}
                                    error={state.errors?.department}
                                    required
                                />

                                <CustomSelect
                                    value={state.lead_source}
                                    onChange={(e) => setState({ lead_source: e })}
                                    placeholder={'Lead Source'}
                                    title={'Lead Source'}
                                    options={state.sourceList}
                                    error={state.errors?.lead_source}
                                    required
                                />
                                <CustomSelect
                                    value={state.contact_status}
                                    onChange={(e) => setState({ contact_status: e })}
                                    placeholder={'Status'}
                                    title={'Status'}
                                    options={state.contactStatusList}
                                    error={state.errors?.contact_status}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className={`mt-1 ${!objIsEmpty(state.contact) ? 'w-1/3' : 'w-2/3'}`}>
                    <div className="panel col-span-12  flex  flex-col gap-5 rounded-2xl p-3 md:col-span-7">
                        <div className="  flex items-center gap-3">
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#ffefe4]">
                                <IconUser className="text-[#ffbb55]" />
                            </div>
                            <div className=" " style={{ fontSize: '20px' }}>
                                More Information
                            </div>
                        </div>
                        {/* <CustomSelect
                            title="Lead Manager"
                            value={state.lead_manager}
                            onChange={(e) => setState({ lead_manager: e })}
                            placeholder={'Lead Manager'}
                            options={state.leadManagerList}
                            required
                            error={state.errors?.lead_manager}
                        /> */}

                        <TextArea height="120px" value={state.remark} onChange={(e) => setState({ remark: e })} placeholder={'Remark'} title={'Remark'} />
                        <FileUpload
                            onFileSelect={(file) => setState({ file })}
                            buttonText="Upload Document"
                            iconSrc="/assets/images/fileUplaod.jpg"
                            accept=".docs,.pdf"
                            isImageAllowed={true}
                            value={state.file}
                        />
                        <div className=" flex items-center justify-end gap-3">
                            <button type="button" className="btn btn-outline-danger border " onClick={() => router.replace('/')}>
                                Cancel
                            </button>
                            <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
                                {state.submitLoad ? <IconLoader className=" h-4  w-4 animate-spin" /> : 'Submit'}
                            </button>
                            {/* <button type="button" className="btn btn-primary" onClick={() => setState({ isOpen: true })}>
                            {state.submitLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Submit and Add Opportunity'}
                        </button> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className=" mt-2 grid grid-cols-12  gap-2">
                <div className=" col-span-12 flex flex-col   md:col-span-5"></div>
            </div>
        </div>
    );
};

export default PrivateRouter(CreateOpportunities);
