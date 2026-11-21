import React, { useEffect } from 'react';
import CommonLoader from './elements/commonLoader';
import { Dropdown, Failure, Success, capitalizeFLetter, convertUrlToFile, getFileNameFromUrl, objIsEmpty, roundOff, showDeleteAlert, useSetState } from '@/utils/functions.utils';
import { useRouter } from 'next/router';
import Models from '@/imports/models.import';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../store/themeConfigSlice';
import IconUser from '@/components/Icon/IconUser';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomSelect from '@/components/Select';
import CheckboxInput from '@/components/Checkbox';
import IconLoader from '@/components/Icon/IconLoader';
import { createLeadValidation } from '@/utils/validation.utils';
import { Validation } from '@/utils/imports.utils';
import * as Yup from 'yup';
import { DataTable } from 'mantine-datatable';
import ViewLabel from '@/components/viewLabel';
import SideMenu from '@/common_component/sideMenu';
import OppCard from '@/components/oppCard';
import IconPlus from '@/components/Icon/IconPlus';
import { notifyError, notifySuccess } from '@/components/toast';
import Swal from 'sweetalert2';
import Modal from '@/common_component/modal';
import LogCard from '@/components/logCard';
import TextArea from '@/components/TextArea';
import CustomeDatePicker from '@/common_component/datePicker';
import moment from 'moment';
import { leadId, oppId } from '@/store/crmConfigSlice';
import IconEye from '@/components/Icon/IconEye';
import IconEdit from '@/components/Icon/IconEdit';
import IconMenuContacts from '@/components/Icon/Menu/IconMenuContacts';
import IconContacts from '@/components/Icon/IconContact';
import IconUserPlus from '@/components/Icon/IconUserPlus';
import Tippy from '@tippyjs/react';
import IconOpportunity from '@/components/Icon/IconOpportunity';
import OppLabel from '@/components/oppLabel';
import Breadcrumb from '@/common_component/breadcrumb';
import YearPicker from '@/common_component/yearPicker';
import FileUpload from '@/common_component/fileUpload';
import Link from 'next/link';
import Dropdowns from '../components/Dropdown';
import IconTrash from '@/components/Icon/IconTrash';
import { Badge, Card, SimpleGrid, Text, Title } from '@mantine/core';
import IconArrowForward from '@/components/Icon/IconArrowForward';
import IconArrowDown from '@/components/Icon/IconArrowDown';
import MenuPopup from '@/components/MenuPopup';
import IconHorizontalDots from '@/components/Icon/IconHorizontalDots';
import IconVerticalDots from '@/components/Icon/IconVerticalDots';
import IconMenu from '@/components/Icon/IconMenu';
import IconPencil from '@/components/Icon/IconPencil';
import IconPencilPaper from '@/components/Icon/IconPencilPaper';
import { LEADTYPE, ROLE, TASK_TYPE } from '@/utils/constant.utils';
import TextWithValue from '@/components/TextWithValue';
import CustomPhoneInput from '@/components/PhoneInput';

export default function ViewLead() {
    const router = useRouter();

    const id = router?.query?.id;

    const dispatch = useDispatch();

    const breadcrumbItems = [
        { label: 'Home', path: '/' },
        { label: 'Lead', path: '' },
    ];

    const [state, setState] = useSetState({
        loading: false,
        data: {},
        isOpen: false,
        contactList: [],
        isOpenCreateContact: false,
        statusList: [],
        leadSourceList: [],
        createdByList: [],
        department: '',
        designation: '',
        phoneNumber: '',
        email: '',
        lead_source: '',
        contact_status: '',
        createdby: '',
        contact_name: '',
        logList: [],
        opportunityList: [],
        logCount: 0,
        contactCount: 0,
        isOpenOpp: false,
        //Opportunity
        opp_name: '',
        owner: '',
        opportunity_value: '',
        recurring_value_per_year: '',
        currency_type: '',
        probability_in_percentage: '',
        opp_created_by: '',
        opp_closing_date: '',
        opp_stage: '',
        oppLoading: false,
        ownerList: [],
        file: null,
        isOpenOppo: false,
        isOpenLog: false,
        logType: null,
        taskType: null,
        isLogOpen: false,
        primary_contact_list: [],
        primary_contact: null,
        stageList: [],
        assignToList: [],
        oppStageList: [],
        isOpenLeadInfo: false,
        logtype: '',
        role: '',

        logStage: null,
        follow_up_date_time: null,
        assigned_to: null,
        // assignment_note: '',
        details: '',
        isEditLead: false,
        stateList: [],
        verticalList: [],
        marketSegmentList: [],
        countryList: [],
        leadManagerList: [],
        tagList: [],
        DropContactList: [],
        contactPage: 1,
        logAssignRole: null,
        logAssignList: [],

        isOpenCourse: false,
        best_time_to_contact: null,
    });

    useEffect(() => {
        getDate();
        opportunityList();
        collegeList();
        courseList();
        countryList();
        sourceList();
        leadStatusList();
        getLogList();

        // getContactList();
        // verticalList();
        // getContactStatusList();
        // getContactLeadSourceList();
        // createdByList();
        // getLogList();
        // departmentList();
        // currencyList();
        // oppstageList();
        // ownerList();
        // getLeadOwnerByLeadId();
        // getLogStageList();
        // userList();
        // focusSegmentList();
        // statusList();
        // countryList();
        // getMarketSegmentList();
        // leadManagerList();
        // tagList();
    }, [id]);

    useEffect(() => {
        if (state.logtype) {
            getLogListFilter();
        } else {
            getLogList();
        }
    }, [state.logtype]);

    const getDate = async (loading = true) => {
        try {
            if (loading) {
                setState({ loading: true });
            }
            setState({ loading: true });
            const res: any = await Models.lead.details(id);
            console.log('getDate --->', res);
            setState({ contact: res?.college_contact, detail: res, loading: false });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const contactList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.contact.listByLeadId(id);

            const dropdownList = Dropdown(res.results, 'name');
            // setState({ contactList: dropdownList, loading: false });
            setState({ DropContactList: dropdownList, hasMoreLead: res.next });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const collegeList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.college_list(1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ collegeList: dropdownList, loading: false, collegePage: 1, collegeHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const collegeLoadMore = async () => {
        try {
            setState({ collegeloadMore: true });
            const res: any = await Models.master.college_list(state.collegePage + 1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ collegeList: [...state.collegeList, ...dropdownList], collegeloadMore: false, collegePage: state.collegePage + 1, collegeHasNext: res.next });
        } catch (error) {
            setState({ collegeloadMore: false });
            console.log('error: ', error);
        }
    };

    const sourceList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_cat_List(1);
            console.log('✌️res --->', res);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ sourceList: dropdownList, loading: false, sourcePage: 1, sourceHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const sourceLoadMore = async () => {
        try {
            setState({ sorceloadMore: true });
            const res: any = await Models.master.lead_cat_List(state.sourcePage + 1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ sourceList: [...state.sourceList, ...dropdownList], loading: false, sourcePage: state.sourcePage + 1, sourceHasNext: res.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const courseList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.course_list(1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ courseList: dropdownList, loading: false, coursePage: 1, courseHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const courseLoadMore = async () => {
        try {
            setState({ courseloadMore: true });
            const res: any = await Models.master.course_list(state.coursePage + 1);
            const dropdownList = Dropdown(res.results, 'name');
            setState({ courseList: [...state.courseList, ...dropdownList], courseloadMore: false, coursePage: state.coursePage + 1, courseHasNext: res.next });
        } catch (error) {
            setState({ courseloadMore: false });
            console.log('error: ', error);
        }
    };

    const leadStatusList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.lead_status_list(1);
            const dropdownList = Dropdown(res.results, 'stage');

            setState({ leadStatusList: dropdownList, loading: false, leadStatusPage: 1, leadStatusHasNext: res?.next });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const leadStatusLoadMore = async () => {
        try {
            setState({ leadStatusloadMore: true });
            const res: any = await Models.master.lead_status_list(state.leadStatusPage + 1);
            const dropdownList = Dropdown(res.results, 'stage');

            setState({
                leadStatusList: [...state.leadStatusList, ...dropdownList],
                leadStatusloadMore: false,
                leadStatusPage: state.leadStatusPage + 1,
                leadStatusHasNext: res.next,
            });
        } catch (error) {
            setState({ leadStatusloadMore: false });
            console.log('error: ', error);
        }
    };

    const countryList = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.master.country_list(1);
            const dropdownList = Dropdown(res?.results, 'country_name');
            setState({ countryList: dropdownList, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const stateList = async (country) => {
        try {
            setState({ stateLoading: true });
            const res: any = await Models.master.state_list(country?.value);
            const dropdownList = Dropdown(res.results, 'state_name');
            setState({ stateList: dropdownList, stateLoading: false });
        } catch (error) {
            setState({ stateLoading: false });

            console.log('error: ', error);
        }
    };

    const cityList = async (state) => {
        try {
            const res: any = await Models.master.city_list(state?.value);
            const dropdownList = Dropdown(res?.results, 'city_name');
            setState({ cityList: dropdownList });
        } catch (error) {
            setState({ stateLoading: false });

            console.log('error: ', error);
        }
    };

    const opportunityList = async () => {
        try {
            // setState({ loading: true });
            const res: any = await Models.opportunity.listByLeadId(id);
            console.log('opportunityList --->', res);

            const data = res?.results?.map((item) => ({
                // ...item,
                id: item?.id,
                college_name: item?.college?.name || '',
                college_id: item?.college?.id,
                college_location: item?.college?.location || '',
                course_name: item?.course?.name || '',
                course_id: item?.course?.id,
                student_name: item?.college_lead?.college_contact?.student_name || '',
                parent_name: item?.college_lead?.college_contact?.parent_name || '',
                parent_designation: item?.college_lead?.college_contact?.parent_designation || '',
                tenth_marks: item?.college_lead?.college_contact?.tenth_marks,
                twelfth_marks: item?.college_lead?.college_contact?.twelfth_marks,
                ug_marks: item?.college_lead?.college_contact?.ug_marks,
                entrance_exam_score: item?.college_lead?.college_contact?.entrance_exam_score,
                interview_rating: item?.college_lead?.college_contact?.interview_rating,
                internal_rating: item?.college_lead?.college_contact?.internal_rating,
                source_details: item?.college_lead?.source_details,
                remark: item?.college_lead?.remark,
                preferred_location: item?.college_lead?.preferred_location,
                best_time_to_contact: item?.college_lead?.best_time_to_contact,
            }));
            console.log('✌️data --->', data);

            setState({ opportunityList: data, loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const getLogList = async () => {
        try {
            const res: any = await Models.log.listByLeadId(id);
            setState({ logList: res, loading: false, logCount: res.count });
        } catch (error) {
            console.log('error: ', error);
            setState({ loading: false });
        }
    };

    const getLogListFilter = async () => {
        try {
            let statusId = null;
            if (state.logtype == 'Meeting') {
                statusId = 'Meeting';
            }
            if (state.logtype == 'Call') {
                statusId = 'Call';
            }
            if (state.logtype == 'Email') {
                statusId = 'Email';
            }

            if (state.logtype == 'include_opportunity') {
                statusId = 'include_opportunity';
            }

            const res: any = await Models.log.listByLeadId(id, statusId);
            setState({ logList: res?.results, loading: false, logCount: res.count });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const usersList = async (e, type = '') => {
        console.log('✌️e --->', e);
        try {
            if (type == 'task') {
                setState({ logAssignRole: e, log_assigned_to: null });
            } else if (type == 'update') {
            } else {
                setState({ assignRole: e, assign_to: null });
            }
            setState({ userloading: true });
            let body: any = {};
            if (e?.label == ROLE.ADMIN) {
                body.show_admins_only = 'Yes';
            } else {
                body.exclude_admin = 'Yes';
            }

            const res: any = await Models.user.includeAdminuserList(1, body);
            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({ usersList: dropdownList, userloading: false, userPage: 1, userHasNext: res?.next });
        } catch (error) {
            setState({ userloading: false });
            console.log('error: ', error);
        }
    };

    const usersListLoadMore = async () => {
        try {
            setState({ leadStatusloadMore: true });
            let body: any = {};
            if (state.assignRole?.label == ROLE.ADMIN) {
                body.show_admins_only = 'Yes';
            } else {
                body.exclude_admin = 'Yes';
            }

            const res: any = await Models.user.includeAdminuserList(1, body);

            const dropdownList = res?.results?.map((item) => ({
                label: `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`,
                value: item?.id,
            }));

            setState({
                usersList: [...state.usersList, ...dropdownList],
                leadStatusloadMore: false,
                userPage: state.userPage + 1,
                userHasNext: res.next,
            });
        } catch (error) {
            setState({ leadStatusloadMore: false });
            console.log('error: ', error);
        }
    };

    const addCourse = async () => {
        try {
            setState({ courseLoading: true });

            const body = {
                college: state.college?.value,
                course: state.course?.value,
                college_lead: id,
            };
            const res: any = await Models.opportunity.create(body);
            opportunityList();
            getLogList();

            setState({ isOpenCourse: false, college: null, course: null, oppId: null, courseLoading: false });
            Success('Course Added Successfully');
            // setState({ logList: res?.results, loading: false, logCount: res.count });
        } catch (error) {
            console.log('error: ', error);
            setState({ loading: false });
        }
    };

    const updateCourse = async () => {
        try {
            setState({ courseLoading: true });
            const body = {
                college: state.college?.value,
                course: state.course?.value,
                college_lead: id,
            };
            const res: any = await Models.opportunity.update(body, state.oppId);
            opportunityList();
            getLogList();
            Success('Course Updated Successfully');

            setState({ isOpenCourse: false, college: null, course: null, oppId: null, courseLoading: false });
        } catch (error) {
            console.log('error: ', error);
            setState({ loading: false });
        }
    };

    const deleteOpp = async (id) => {
        showDeleteAlert(
            async () => {
                deleteOpportunity(id);
            },
            () => {
                Swal.fire('Cancelled', 'Your Course is safe :)', 'info');
            },
            'Are you sure you want to delete course?'
        );
    };

    const deleteOpportunity = async (id) => {
        try {
            const res = await Models.opportunity.delete(id);
            opportunityList();
        } catch (error) {
            console.log('Error: ', error);
        }
    };

    const handleEditLead = async () => {
        try {
            const response = state.detail;
            console.log('✌️response --->', response);
            const res = state.contact;
            console.log('✌️res --->', res);

            const contact = response?.college_contact;
            setState({
                isEditLead: !state.isEditLead,
                isOpenStudentInfo: true,
                student_name: contact?.student_name || '',
                phone_number: contact?.phone_number || '',
                alternate_email: contact?.alternate_email || '',
                address: contact?.address || '',
                pincode: contact?.pincode || '',
                preferred_location: contact?.preferred_location || '',
                parent_name: contact?.parent_name || '',
                parent_designation: contact?.parent_designation || '',
                siblings_count: res?.siblings_count || '',
                school_name: contact?.school_name || '',
                board_name: contact?.board_name || '',
                education_qualification: contact?.education_qualification?.qualification || '',
                graduation_year: contact?.graduation_year || '',
                tenth_marks: contact?.tenth_marks || '',
                twelfth_marks: contact?.twelfth_marks || '',
                ug_marks: contact?.ug_marks || '',
                score_in_subjects: contact?.score_in_subjects || '',
                entrance_exam_score: contact?.entrance_exam_score || '',
                interview_rating: contact?.interview_rating ? { value: contact?.interview_rating, label: contact?.interview_rating } : null,
                internal_rating: contact?.internal_rating ? { value: contact?.internal_rating, label: contact?.internal_rating } : null,
                personal_remarks: contact?.personal_remarks || '',
                country: contact?.country ? { value: contact.country.id, label: contact.country.country_name } : null,
                state: contact?.state ? { value: contact.state.id, label: contact.state.state_name } : null,
                city: contact?.city ? { value: contact.city.id, label: contact.city.city_name } : null,
                lead_status: response?.stage || '',
                lead_source_name: response?.lead_source_category?.source || '',
                lead_preferred_location: response?.preferred_location || '',
                best_time_to_contact: response?.best_time_to_contact || '',
                source_details: contact?.source_details || '',
                lead_remark: contact?.remark || '',
                contactId: res?.id,
                email: res?.email,
            });
        } catch (error) {}
    };

    const updateContact = async () => {
        try {
            setState({ createContactLoad: true });
            const buildContactPayload = {
                phone_number: state.phone_number,
                student_name: state.student_name?.trim(),
                email: state.email?.trim(),
                alternate_email: state.alternate_email?.trim(),
                secondary_phone_number: state.secondary_phone_number,
                parent_name: state.parent_name?.trim(),
                parent_designation: state.parent_designation?.trim(),
                siblings_count: state.siblings_count ? Number(state.siblings_count) : null,
                address: state.address?.trim(),
                city: state.city?.value,
                pincode: state.pincode?.trim(),
                education_qualification: state.education_qualification?.value,
                graduation_year: state.graduation_year ? Number(state.graduation_year) : null,
                board_name: state.board_name?.trim(),
                school_name: state.school_name?.trim(),
                tenth_marks: state.tenth_marks ? Number(state.tenth_marks) : null,
                twelfth_marks: state.twelfth_marks ? Number(state.twelfth_marks) : null,
                ug_marks: state.ug_marks ? Number(state.ug_marks) : null,
                entrance_exam_score: state.entrance_exam_score ? Number(state.entrance_exam_score) : null,
                colleges_interested: state.colleges_interested,
                courses_interested: state.courses_interested,
                interview_rating: state.interview_rating ? state.interview_rating?.value : null,
                internal_rating: state.internal_rating ? state.internal_rating?.value : null,
                personal_remarks: state.personal_remarks?.trim(),
                score_in_subjects: state.score_in_subjects,
                state: state.state ? state.state?.value : null,
                country: state.country ? state.country?.value : null,
            };

            const res: any = await Models.contact.update(buildContactPayload, state.contactId);
            if (res) {
                Success('Contact updated successfully');
                getDate(false);
                getLogList();

                setState({ isEditLead: false, createContactLoad: false });
            }
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = error.inner.reduce((acc, err) => {
                    acc[err.path] = err.message;
                    return acc;
                }, {});
                setState({ errors: validationErrors, createContactLoad: false });
            } else {
                console.log('Error: ', error?.message);
            }
        }
    };

    const updateLeadData = async () => {
        try {
            const response = state.detail;
            console.log('✌️response --->', response);
            let value = {};

            if (response?.assign_to?.groups?.length > 0) {
                value = { label: response?.assign_to?.groups?.[0] == 1 ? 'Admin' : 'Staff' };
                usersList(value, 'update');
            }

            setState({
                isEditLead1: !state.isEditLead1,
                isOpenLeadInfo: true,
                preferred_location: response?.preferred_location || '',
                best_time_to_contact: response?.best_time_to_contact ? moment(response.best_time_to_contact).format('DD-MM-YYYY HH:mm:ss') : null,
                lead_status: response?.stage ? { value: response?.stage?.id, label: response?.stage?.stage } : null,
                lead_source_category: response?.lead_source_category ? { value: response?.lead_source_category?.id, label: response?.lead_source_category?.name } : null,
                source_details: response?.source_details || '',
                remark: response?.remark || '',
                leadId: response?.id,
                assign_to: response?.assign_to
                    ? { value: response?.assign_to?.id, label: `${capitalizeFLetter(response?.assign_to?.first_name)} ${capitalizeFLetter(response?.assign_to?.last_name)}` }
                    : null,
                assignRole: response?.assign_to
                    ? response?.assign_to?.groups?.length > 0
                        ? response?.assign_to?.groups?.[0] == 1
                            ? { value: 'admin', label: 'Admin' }
                            : { value: 'staff', label: 'Staff' }
                        : null
                    : null,
            });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const updateLead = async () => {
        try {
            setState({ updateLoadLoading: true });
            const body = {
                college_lead: id,
                college: state.college?.value,
                course: state.course?.value,
                stage: state.lead_status?.value,
                assign_to: state.assign_to?.value,
                lead_source_category: state.lead_source_category?.value,
                preferred_location: state.preferred_location,
                best_time_to_contact: state.best_time_to_contact,
                source_details: state.source_details,
                remark: state.remark,
            };
            const res = await Models.lead.update(body, state.leadId);
            if (res) {
                Success('Lead updated successfully');
                getDate(false);
                getLogList();

                setState({ isEditLead1: false, updateLoadLoading: false });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };
    const editOppData = async (row) => {
        setState({ isOpenCourse: true, college: { value: row?.college_id, label: row?.college_name }, course: { value: row?.course_id, label: row?.course_name }, oppId: row?.id });
    };

    console.log('detail', state.detail);

    const createAndUpdateLog = async () => {
        try {
            setState({ logLoad: true });
            let validateField;
            if (state.follow_up_date_time) {
                validateField = {
                    logStage: state.logStage?.value,
                    log_type: state.log_type?.value,
                    follow_up_date_time: state.follow_up_date_time,
                    task_type: state.task_type?.value,
                    details: state.details,
                    logAssignRole: state.logAssignRole?.value,
                    // assigned_to: state.assigned_to?.value,
                    assigned_to: state.log_assigned_to?.length > 0 ? state.log_assigned_to?.map((item) => item.value) : [],
                    // assignment_note: state.assignment_note,

                    // details: state.details,
                    // focus_segment: state.focus_segment?.value,
                    // primary_contact: state.primary_contact?.value,
                };
                await Validation.createLeadsLog.validate(validateField, { abortEarly: false });
            } else {
                validateField = {
                    logStage: state.logStage?.value,
                    log_type: state.log_type?.value,
                    details: state.details,
                };
                await Validation.createLeadLog.validate(validateField, { abortEarly: false });
            }

            let body;

            if (state.follow_up_date_time) {
                const taskbody = {
                    contact: state.detail?.college_contact?.id,
                    task_type: state.task_type?.value,
                    assigned_to: state.log_assigned_to?.map((item) => item.value),
                    task_date_time: state.task_date_time,
                    log_stage: state.logStage?.value,
                    details: state.details,
                    remark: state.details,
                };
                const logBody: any = {
                    college_lead: id,

                    details: state.details,
                    log_type: state.log_type?.value,
                    // file:state.file
                };
                if (state.follow_up_date_time) {
                    logBody.follow_up_date_time = state.follow_up_date_time;
                }
                const res: any = await Models.task.create(taskbody);
                await Models.log.create(logBody);
            } else {
                body = {
                    college_lead: id,

                    details: state.details,
                    log_type: state.log_type?.value,
                };
                if (state.follow_up_date_time) {
                    body.follow_up_date_time = state.follow_up_date_time;
                }
                await Models.log.create(body);
                Success('Log created successfully');
            }
            clearLogData();
            getLogList();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err?.message;
                });
                console.log('✌️validationErrors --->', validationErrors);

                setState({ errors: validationErrors });
                setState({ logLoad: false });
            } else {
                console.log('Error: ', error?.message);
                setState({ logLoad: false });
            }
            setState({ logLoad: false });
        }
    };

    const clearLogData = () => {
        setState({
            isOpenLog: false,
            logCreatedBy: '',
            logId: '',
            logStage: '',
            focus_segment: '',
            follow_up_date_time: '',
            details: '',
            errors: '',
            logLoad: false,
            file: null,
            isLogOpen: false,
            log_type: '',
            remark: '',
            task_type: '',
            log_assigned_to: [],
            logAssignList: [],
            logAssignRole: null,
        });
    };

    const checkboxOptions = [
        { value: 'include_opportunity', label: 'Exclude Course' },
        { value: 'Call', label: 'Call' },
        { value: 'Meeting', label: 'Meeting' },
        { value: 'Email', label: 'Email' },
    ];

    return state.loading ? (
        <CommonLoader />
    ) : (
        <div className="  relative  h-auto bg-[#dbe7ff] bg-cover p-2 ">
            <Breadcrumb items={breadcrumbItems} />

            <div className=" panel flex flex-wrap items-center justify-between gap-5 pl-3 pr-3">
                <div className="flex items-center gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                        <img src="/assets/images/profile-1.jpeg" style={{ objectFit: 'cover' }} />

                        {/* <img className="h-10 w-10 rounded-md object-cover" src="/assets/images/auth/user.png" alt="userProfile" /> */}
                    </div>
                    <div>
                        <h5 className="text-lg font-semibold dark:text-white-light"> {capitalizeFLetter(state.contact?.student_name)}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-300">{`${state.contact?.email}`} </p>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <>
                        {state.detail?.assign_to && (
                            <div className="flex flex-col p-2 ">
                                <div className="text-md text-gray-600">Assigned To</div>
                                <div className="text-[18px]">
                                    {`${capitalizeFLetter(state.detail?.assign_to?.first_name)} 
  ${state.detail?.assign_to?.last_name}`}
                                </div>
                            </div>
                        )}
                    </>
                </div>
            </div>

            <div className="panel mt-2 rounded-2xl p-3">
                <div className=" cursor-pointer items-center gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3" onClick={() => setState({ isOpenStudentInfo: !state.isOpenStudentInfo })}>
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                {state.isOpenStudentInfo ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                            </div>
                            <div className="text-xl font-bold ">Student Information</div>
                        </div>
                        <div onClick={() => handleEditLead()}>
                            <IconPencilPaper />
                        </div>
                    </div>
                    {state.isOpenStudentInfo && (
                        <>
                            <div className=" flex w-full  flex-wrap">
                                <div className={` w-full `}>
                                    <div className="  flex  flex-col gap-5 rounded-2xl p-2">
                                        <div className="space-y-3">
                                            <div className="rounded-xl bg-white p-5 shadow">
                                                <h2 className="mb-4 border-b pb-1 text-lg font-semibold text-gray-800">Basic Details</h2>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {state.isEditLead ? (
                                                        <>
                                                            <TextInput title="Student Name" value={state?.student_name} onChange={(e) => setState({ student_name: e })} />
                                                            {/* <TextInput
                                                                title="Phone Number"
                                                                value={state.contact?.phone_number}
                                                                onChange={(e) => setState({ contact: {  phone_number: e } })}
                                                            /> */}

                                                            <CustomPhoneInput
                                                                title={'Phone'}
                                                                placeholder={'Phone Number'}
                                                                value={state.phone_number}
                                                                onChange={(e) => setState({ phone_number: e, errors: { ...state.errors, phone_number: '' } })}
                                                                error={state.errors?.phone_number}
                                                                required
                                                            />
                                                            <TextInput title="Email" value={state.email} onChange={(e) => setState({ email: e })} required />
                                                            <TextInput title="Alternate Email" value={state.alternate_email} onChange={(e) => setState({ alternate_email: e })} />
                                                            <TextInput title="Address" value={state.address} onChange={(e) => setState({ address: e })} />
                                                            <TextInput title="Pincode" value={state.pincode} onChange={(e) => setState({ pincode: e })} />
                                                            <TextInput title="Preferred Location" value={state.preferred_location} onChange={(e) => setState({ preferred_location: e })} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TextWithValue value={state.contact?.student_name} label="Student Name" />
                                                            <TextWithValue value={state.contact?.phone_number} label="Phone Number" />
                                                            <TextWithValue value={state.contact?.alternate_email} label="Alternate Email" />
                                                            <TextWithValue value={state.contact?.address} label="Address" />
                                                            <TextWithValue value={state.contact?.pincode} label="Pincode" />
                                                            <TextWithValue value={state.contact?.preferred_location} label="Preferred Location" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CARD 2: Parent Details */}
                                            <div className="rounded-xl bg-white p-5 shadow">
                                                <h2 className="mb-4 border-b pb-1 text-lg font-semibold text-gray-800">Parent Details</h2>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {state.isEditLead ? (
                                                        <>
                                                            <TextInput title="Parent Name" value={state.parent_name} onChange={(e) => setState({ parent_name: e })} />
                                                            <TextInput title="Parent Designation" value={state.parent_designation} onChange={(e) => setState({ parent_designation: e })} />
                                                            <TextInput title="Siblings Count" value={state.siblings_count} onChange={(e) => setState({ siblings_count: e })} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TextWithValue value={state.contact?.parent_name} label="Parent Name" />
                                                            <TextWithValue value={state.contact?.parent_designation} label="Parent Designation" />
                                                            <TextWithValue value={state.contact?.siblings_count} label="Siblings Count" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CARD 3: Education Details */}
                                            <div className="rounded-xl bg-white p-5 shadow">
                                                <h2 className="mb-4 border-b pb-1 text-lg font-semibold text-gray-800">Education Details</h2>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {state.isEditLead ? (
                                                        <>
                                                            <TextInput title="School Name" value={state.school_name} onChange={(e) => setState({ school_name: e })} />
                                                            <TextInput title="Board Name" value={state.board_name} onChange={(e) => setState({ board_name: e })} />
                                                            <TextInput
                                                                title="Education Qualification"
                                                                value={state.education_qualification}
                                                                onChange={(e) => setState({ education_qualification: e })}
                                                            />
                                                            <NumberInput title="Graduation Year" value={state.graduation_year} onChange={(e) => setState({ graduation_year: e })} />
                                                            <TextInput title="Tenth Marks" value={state.tenth_marks} onChange={(e) => setState({ tenth_marks: e })} />
                                                            <TextInput title="Twelth Marks" value={state.twelfth_marks} onChange={(e) => setState({ twelfth_marks: e })} />
                                                            <TextInput title="UG Marks" value={state.ug_marks} onChange={(e) => setState({ ug_marks: e })} />
                                                            <TextInput title="Score in Subjects" value={state.score_in_subjects} onChange={(e) => setState({ score_in_subjects: e })} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TextWithValue value={state.contact?.school_name} label="School Name" />
                                                            <TextWithValue value={state.contact?.board_name} label="Board Name" />
                                                            <TextWithValue value={state.contact?.education_qualification?.qualification} label="Education Qualification" />
                                                            <TextWithValue value={state.contact?.graduation_year} label="Graduation Year" />
                                                            <TextWithValue value={state.contact?.tenth_marks} label="Tenth Marks" />
                                                            <TextWithValue value={state.contact?.twelfth_marks} label="Twelth Marks" />
                                                            <TextWithValue value={state.contact?.ug_marks} label="UG Marks" />
                                                            <TextWithValue value={state.contact?.score_in_subjects} label="Score in Subjects" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="rounded-xl bg-white p-5 shadow">
                                                <h2 className="mb-4 border-b pb-1 text-lg font-semibold text-gray-800">Scores</h2>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {state.isEditLead ? (
                                                        <>
                                                            <TextInput title="Entrance Exam Score" value={state.entrance_exam_score} onChange={(e) => setState({ entrance_exam_score: e })} />
                                                            <CustomSelect
                                                                title="Interview Rating"
                                                                value={state.interview_rating}
                                                                onChange={(e) => setState({ interview_rating: e })}
                                                                placeholder={'Interview Rating'}
                                                                error={state.errors?.interview_rating}
                                                                options={[
                                                                    { value: 1, label: '1' },
                                                                    { value: 2, label: '2' },
                                                                    { value: 3, label: '3' },
                                                                    { value: 4, label: '4' },
                                                                    { value: 5, label: '5' },
                                                                ]}
                                                            />

                                                            <CustomSelect
                                                                title="Internal Rating"
                                                                value={state.internal_rating}
                                                                onChange={(e) => setState({ internal_rating: e })}
                                                                placeholder={'Internal Rating'}
                                                                error={state.errors?.internal_rating}
                                                                options={[
                                                                    { value: 1, label: '1' },
                                                                    { value: 2, label: '2' },
                                                                    { value: 3, label: '3' },
                                                                    { value: 4, label: '4' },
                                                                    { value: 5, label: '5' },
                                                                ]}
                                                            />
                                                        </>
                                                    ) : (
                                                        (state.contact?.entrance_exam_score || state.contact?.interview_rating || state.contact?.internal_rating || state.isEditLead) && (
                                                            <>
                                                                <TextWithValue value={state.contact?.entrance_exam_score} label="Entrance Exam Score" />
                                                                <TextWithValue value={state.contact?.interview_rating} label="Interview Rating" />
                                                                <TextWithValue value={state.contact?.internal_rating} label="Internal Rating" />
                                                            </>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* CARD 5: Location Details */}
                                            <div className="rounded-xl bg-white p-5 shadow">
                                                <h2 className="mb-4 border-b pb-1 text-lg font-semibold text-gray-800">Location Details</h2>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {state.isEditLead ? (
                                                        <>
                                                            <CustomSelect
                                                                title="Country"
                                                                value={state.country}
                                                                onChange={(e) => {
                                                                    if (e) {
                                                                        stateList(e);
                                                                    }
                                                                    setState({ country: e, state: '' });
                                                                }}
                                                                placeholder={'Country'}
                                                                options={state.countryList}
                                                                error={state.errors?.country}
                                                            />
                                                            <CustomSelect
                                                                title="State"
                                                                value={state.state}
                                                                onChange={(e) => {
                                                                    if (e) {
                                                                        cityList(e);
                                                                    }
                                                                    setState({ state: e, city: '' });
                                                                }}
                                                                placeholder={'State'}
                                                                options={state.stateList}
                                                                error={state.errors?.state}
                                                            />
                                                            <CustomSelect
                                                                title="City"
                                                                value={state.city}
                                                                onChange={(e) => setState({ city: e })}
                                                                placeholder={'City'}
                                                                options={state.cityList}
                                                                error={state.errors?.city}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TextWithValue value={state.contact?.country?.country_name} label="Country" />
                                                            <TextWithValue value={state.contact?.state?.state_name} label="State" />
                                                            <TextWithValue value={state.contact?.city?.city_name} label="City" />
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* CARD 6: Remarks */}
                                            <div className="rounded-xl bg-white p-5 shadow">
                                                <h2 className="mb-4 border-b pb-1 text-lg font-semibold text-gray-800">Remarks</h2>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                    {state.isEditLead ? (
                                                        <TextArea title="Personal Remarks" value={state.personal_remarks} onChange={(e) => setState({ personal_remarks: e })} />
                                                    ) : (
                                                        <TextWithValue value={state.contact?.personal_remarks} label="Personal Remarks" />
                                                    )}
                                                </div>
                                            </div>

                                            {state.isEditLead && (
                                                <div className="mt-4 flex justify-end gap-3">
                                                    <button type="button" className="btn btn-primary" onClick={() => updateContact()}>
                                                        {state.createContactLoad ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
                                                    </button>
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isEditLead: false })}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="panel mt-2 rounded-2xl p-3">
                <div className=" cursor-pointer items-center gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3" onClick={() => setState({ isOpenLeadInfo: !state.isOpenLeadInfo })}>
                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                {state.isOpenLeadInfo ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                            </div>
                            <div className="text-xl font-bold ">Lead Status Information</div>
                        </div>
                        <div onClick={() => updateLeadData()}>
                            <IconPencilPaper />
                        </div>
                    </div>

                    {state.isOpenLeadInfo && (
                        <>
                            <div className="mt-1 flex w-full  flex-wrap">
                                <div className={`mt-1  w-full `}>
                                    <div className=" panel flex  flex-col gap-5 rounded-2xl p-3">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                            {state.isEditLead1 ? (
                                                <>
                                                    {/* <CustomSelect
                                                        title="Assigned To"
                                                        value={state.assign_to}
                                                        onChange={(e) => setState({ assign_to: e })}
                                                        placeholder={'Assigned To'}
                                                        options={state.usersList}
                                                        error={state.errors?.assigned_to}
                                                        loadMore={() => state.userHasNext && usersListLoadMore()}
                                                    /> */}

                                                    <CustomSelect
                                                        value={state.assignRole}
                                                        onChange={(e) => {
                                                            usersList(e);
                                                        }}
                                                        placeholder={'Choose Role'}
                                                        title={'Choose Role'}
                                                        options={[
                                                            { value: 'admin', label: 'Admin' },
                                                            { value: 'staff', label: 'Staff' },
                                                        ]}
                                                        error={state.errors?.assignRole}
                                                    />
                                                    <CustomSelect
                                                        title="Assign To"
                                                        value={state.assign_to}
                                                        onChange={(e) => setState({ assign_to: e })}
                                                        placeholder={'Assign To'}
                                                        options={state.usersList}
                                                        error={state.errors?.assign_to}
                                                        isMulti={false}
                                                        loadMore={() => state.userHasNext && usersListLoadMore()}
                                                        loading={state.userloadMore || state.userLoading}
                                                    />
                                                    <CustomSelect
                                                        title="Lead Status"
                                                        value={state.lead_status}
                                                        onChange={(e) => setState({ lead_status: e })}
                                                        placeholder={'Lead Status'}
                                                        options={state.leadStatusList}
                                                        error={state.errors?.status}
                                                        loadMore={() => state.leadStatusHasNext && leadStatusLoadMore()}
                                                    />
                                                    <CustomSelect
                                                        title="Lead Source Category "
                                                        value={state.lead_source_category}
                                                        onChange={(e) => setState({ lead_source_category: e })}
                                                        placeholder={'Lead Source Category '}
                                                        options={state.sourceList}
                                                        error={state.errors?.lead_source_category}
                                                        loadMore={() => state.sourceHasNext && sourceLoadMore()}
                                                    />

                                                    {/* <TextInput title="Lead Source Category" value={state.lead_source_name} onChange={(e) => setState({ lead_source_name: e })} /> */}
                                                    <TextInput title="Preferred Location" value={state.preferred_location} onChange={(e) => setState({ preferred_location: e })} />
                                                    <CustomeDatePicker
                                                        error={state.errors?.best_time_to_contact}
                                                        value={state.best_time_to_contact}
                                                        placeholder="Best Time to Contact"
                                                        title="Best Time to Contact"
                                                        onChange={(e) => setState({ best_time_to_contact: e })}
                                                    />
                                                    <TextArea title="Source Details" value={state.source_details} onChange={(e) => setState({ source_details: e })} />
                                                    <TextArea title="Remark" value={state.remark} onChange={(e) => setState({ remark: e })} />
                                                </>
                                            ) : (
                                                <>
                                                    <TextWithValue value={state.detail?.stage?.stage} label="lead_status" />
                                                    <TextWithValue value={state.detail?.lead_source_category?.name} label="lead_source" />
                                                    <TextWithValue value={state.detail?.preferred_location} label="preferred_location" />
                                                    <TextWithValue
                                                        value={state.detail?.best_time_to_contact ? moment(state.detail?.best_time_to_contact).format('DD-MM-YYYY HH:mm A') : null}
                                                        label="best_time_to_contact"
                                                    />
                                                    <TextWithValue value={state.detail?.source_details} label="source_details" />
                                                    <TextWithValue value={state.detail?.remark} label="remark" />
                                                </>
                                            )}
                                        </div>
                                        {state.isEditLead1 && (
                                            <div className="mt-4 flex justify-end gap-3">
                                                <button type="button" className="btn btn-primary" onClick={() => updateLead()}>
                                                    {state.updateLoadLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
                                                </button>
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isEditLead: false })}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <>
                <>
                    <div className=" panel  col-span-12 mt-2 flex flex-col gap-5 rounded-2xl p-3 md:col-span-12">
                        <div className="flex justify-between">
                            <div className="flex w-full justify-between">
                                <div className="flex cursor-pointer items-center gap-3" onClick={() => setState({ isOpenOppo: !state.isOpenOppo })}>
                                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                        {state.isOpenOppo ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                                    </div>
                                    <div className="text-xl font-bold ">Courses</div>

                                    <div className=" flex h-5 w-6 items-center justify-center rounded-sm  bg-primary font-bold text-white" style={{ fontSize: '18px' }}>
                                        {state.opportunityList?.length}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary p-1"
                                    onClick={() => {
                                        setState({ isOpenCourse: true });
                                    }}
                                >
                                    <IconPlus />
                                </button>
                            </div>
                        </div>
                        {state.opportunityList?.length > 0 && state.isOpenOppo && (
                            <div className=" overflow-y-scroll">
                                <DataTable
                                    className="table-responsive"
                                    records={state.opportunityList}
                                    columns={[
                                        {
                                            accessor: 'college_name',

                                            title: 'College Name',
                                        },
                                        {
                                            accessor: 'course_name',
                                            title: 'Course Name',
                                        },
                                        {
                                            accessor: 'actions',
                                            title: 'Actions',
                                            render: (row: any) => (
                                                <>
                                                    <div className="mx-auto flex w-max items-center gap-4">
                                                        {/* <button
                                                            type="button"
                                                            className="flex hover:text-danger"
                                                            onClick={() => {
                                                                router.push(`/view_opportunity?id=${row.id}`);
                                                            }}
                                                        >
                                                            <IconEye />
                                                        </button> */}
                                                        <button className="flex hover:text-info" onClick={() => editOppData(row)}>
                                                            <IconEdit className="h-4.5 w-4.5" />
                                                        </button>

                                                        <button className="flex text-danger hover:text-info" onClick={() => deleteOpp(row?.id)}>
                                                            <IconTrash className="h-4.5 w-4.5" />
                                                        </button>
                                                    </div>
                                                </>
                                            ),
                                        },
                                    ]}
                                    highlightOnHover
                                    totalRecords={state.opportunityList?.length}
                                    recordsPerPage={state.pageSize}
                                    minHeight={200}
                                    page={null}
                                    onPageChange={(p) => {}}
                                    withBorder={true}
                                    selectedRecords={state.selectedRecords}
                                    onSelectedRecordsChange={(val) => {
                                        setState({ selectedRecords: val });
                                    }}
                                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                />
                            </div>
                        )}
                    </div>
                </>

                <div className="panel col-span-12 mt-2 flex flex-col  rounded-2xl p-3 md:col-span-12">
                    <div className="flex justify-between">
                        <div className="log-history flex w-full flex-wrap justify-between">
                            <div className="flex cursor-pointer items-center gap-3 " onClick={() => setState({ isOpenLog: !state.isOpenLog })}>
                                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                                    {state.isOpenLog ? <img src={'/assets/images/arrowDown.svg'} height={10} /> : <img src={'/assets/images/arrowUp.png'} height={10} />}
                                </div>
                                <div className="text-xl font-bold ">Log History</div>

                                <div className=" flex h-5 w-6 items-center justify-center rounded-sm  bg-primary font-bold text-white" style={{ fontSize: '18px' }}>
                                    {state.logList?.length}
                                </div>
                            </div>
                            <div className="flex-end mt-2 flex cursor-pointer flex-wrap items-center gap-3" onClick={() => setState({ isOpenLog: true })}>
                                {checkboxOptions.map((option) => (
                                    <CheckboxInput
                                        key={option.value}
                                        checked={state.logtype === option?.value}
                                        onChange={() =>
                                            setState({
                                                logtype: state.logtype === option.value ? null : option?.value,
                                            })
                                        }
                                        label={option?.label}
                                    />
                                ))}

                                <button
                                    type="button"
                                    className="btn btn-primary log-btn p-1"
                                    onClick={() => {
                                        dispatch(leadId(id));
                                        setState({ isLogOpen: true });
                                    }}
                                >
                                    <IconPlus />
                                </button>
                            </div>
                        </div>
                    </div>
                    {state.isOpenLog && (
                        <div className="max-h-[600px] overflow-y-scroll">
                            <LogCard data={state.logList} onPress={(item) => router.push(`/opportunity?id=${item.id}`)} onDelete={(item) => deleteOpp(item.id)} editIcon={false} />
                        </div>
                    )}
                </div>
            </>

            <SideMenu
                title={state.logId ? 'Update Log' : 'Create Log'}
                open={state.isLogOpen}
                cancelOnClick={() => clearLogData()}
                // submitOnClick={() => console.log("submit") }
                submitOnClick={() => createAndUpdateLog()}
                // submitOnClick={() => (state.contactId ? updateContact() : createContact())}
                submitLoading={state.oppLoading}
                close={() => clearLogData()}
                renderComponent={() => (
                    <div className="flex flex-col gap-3">
                        <CustomSelect
                            title="Log Type"
                            value={state.log_type}
                            onChange={(e) => {
                                setState({ log_type: e });
                            }}
                            placeholder={'Log Type'}
                            options={[
                                { label: 'Call', value: 'Call' },
                                { label: 'Meeting', value: 'Meeting' },
                                { label: 'Email', value: 'Email' },
                                // { label: 'Others', value: 'Others' },
                            ]}
                            error={state.errors?.log_type}
                            required
                        />

                        <CustomeDatePicker value={state.follow_up_date_time} title="Follow Up" onChange={(e) => setState({ follow_up_date_time: e })} />
                        {state.follow_up_date_time && (
                            <>
                                <CustomeDatePicker
                                    value={state.task_date_time}
                                    placeholder="Task Date"
                                    title="Task Date"
                                    onChange={(e) => setState({ task_date_time: e })}
                                    error={state.errors?.task_date_time}
                                    required
                                />
                                <CustomSelect
                                    title="Task Type"
                                    value={state.task_type}
                                    onChange={(e) => setState({ task_type: e })}
                                    placeholder={'Task Type'}
                                    options={TASK_TYPE}
                                    error={state.errors?.task_type}
                                    required
                                />

                                <CustomSelect
                                    value={state.logAssignRole}
                                    onChange={(e) => {
                                        usersList(e, 'task');
                                    }}
                                    placeholder={'Choose Role'}
                                    title={'Choose Role'}
                                    options={[
                                        { value: 'admin', label: 'Admin' },
                                        { value: 'staff', label: 'Staff' },
                                    ]}
                                    error={state.errors?.logAssignRole}
                                    required
                                />
                                <CustomSelect
                                    title="Assign To"
                                    value={state.log_assigned_to}
                                    onChange={(e) => setState({ log_assigned_to: e })}
                                    placeholder={'Assign To'}
                                    options={state.usersList}
                                    error={state.errors?.log_assigned_to}
                                    required
                                    isMulti={true}
                                    loadMore={() => state.userHasNext && usersListLoadMore()}
                                    loading={state.loading || state.leadStatusloadMore}
                                />
                            </>
                        )}

                        <TextArea height="150px" value={state.details} onChange={(e) => setState({ details: e })} placeholder={'Details'} title={'Details'} required error={state.errors?.details} />
                    </div>
                )}
            />

            <Modal
                open={state.isOpenCourse}
                height={'auto'}
                addHeader={state.oppId ? 'Update Course' : 'Add Course'}
                close={() => setState({ isOpenCourse: false, college: null, course: null, oppId: null })}
                renderComponent={() => (
                    <div className="flex flex-col gap-5 p-5">
                        <CustomSelect
                            title="College"
                            value={state.college}
                            onChange={(e) => setState({ college: e })}
                            placeholder={'Select College'}
                            options={state.collegeList}
                            loadMore={() => state.collegeHasNext && collegeLoadMore()}
                            error={state.errors?.college}
                        />

                        <CustomSelect
                            title="Course"
                            value={state.course}
                            onChange={(e) => setState({ course: e })}
                            placeholder={'Select Course'}
                            options={state.courseList}
                            loadMore={() => state.courseHasNext && courseLoadMore()}
                            error={state.errors?.course}
                        />
                        <div className="mt-6 flex items-center justify-end">
                            <button type="button" className="btn btn-outline-danger" onClick={() => setState({ isOpenCourse: false, college: null, course: null, oppId: null })}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                onClick={() => {
                                    if (state.oppId) {
                                        updateCourse();
                                    } else {
                                        addCourse();
                                    }
                                }}
                            >
                                {state.courseLoading ? <IconLoader className=" h-4  w-4 animate-spin" /> : state.oppId ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                )}
            />
        </div>
    );
}
