import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useRouter } from 'next/router';
import { Dropdown, Failure, Success, capitalizeFLetter, useSetState } from '@/utils/functions.utils';
import TextInput from '@/components/TextInput';
import NumberInput from '@/components/NumberInput';
import CustomSelect from '@/components/Select';
import Models from '@/imports/models.import';
import CustomeDatePicker from '@/common_component/datePicker';
import TextArea from '@/components/TextArea';
import moment from 'moment';
import { Save, X, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Validation } from '@/utils/imports.utils';
import CustomPhoneInput from '@/components/PhoneInput';
import {
    BOARD_RESULT_OPTIONS,
    DEGREE_TYPE_OPTIONS,
    INTEREST_LEVEL_OPTIONS,
    REFERENCE_TYPE_OPTIONS,
    ROLE,
    TWELFTH_GROUP_OPTIONS,
} from '@/utils/constant.utils';
import Head from 'next/head';

const EditContact = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        dispatch(setPageTitle('Edit Contact'));
    }, [dispatch]);

    const [state, setState] = useSetState({
        pageLoading: true,
        submitLoad: false,
        notFound: false,
        errors: null,

        // ── Personal ──────────────────────────────────────────────────────────
        student_name: '',
        email: '',
        alternate_email: '',
        phone_number: null,
        secondary_phone_number: null,
        parent_mobile: '',
        father_name: '',
        mother_name: '',
        dob: null,
        status: null,
        address: '',
        country: null,
        state: null,
        city: null,
        pincode: '',
        achieved: false,

        // ── Family ────────────────────────────────────────────────────────────
        parent_name: '',
        parent_designation: '',
        annual_income: '',
        siblings_count: '',

        // ── Academic Qualification ────────────────────────────────────────────
        education_qualification: null, // Current Qualification
        // 12th Schooling
        twelfth_school_name: '',
        twelfth_group: null,
        twelfth_board_result: null,
        twelfth_marks: '',
        // 10th Schooling
        tenth_school_name: '',
        tenth_board_result: null,
        tenth_marks: '',
        // Other academic fields
        school_name: '',
        board_name: '',
        graduation_year: '',
        ug_marks: '',
        entrance_exam_score: '',
        score_in_subjects: '',

        // ── Admission Preference ──────────────────────────────────────────────
        preferred_institution: null,
        degree_type: null,
        course_specialization: null,
        student_interest_level: null,

        // ── Reference ─────────────────────────────────────────────────────────
        reference_type: null,

        // ── Internal Assessment ───────────────────────────────────────────────
        interview_rating: null,
        internal_rating: null,
        remark: '',
        personal_remarks: '',

        // ── Additional Fields ─────────────────────────────────────────────────
        preferred_location: '',
        best_time_to_contact: null,
        source_details: '',
        relation_to_student: '',
        lead_source_category: null,

        // ── Assignment ────────────────────────────────────────────────────────
        contact_assign_role: null,
        contact_assigned_to: null,

        // ── Dropdown lists ────────────────────────────────────────────────────
        contactStatusList: [],
        countryList: [],
        stateList: [],
        cityList: [],
        qualificationList: [],
        collegeList: [],
        courseList: [],
        leadStatusList: [],
        sourceList: [],
        usersList: [],

        // ── Pagination flags ──────────────────────────────────────────────────
        contactStatusPage: 1,
        contactStatusHasNext: false,
        qualificationPage: 1,
        qualificationHasNext: false,
        collegePage: 1,
        collegeHasNext: false,
        coursePage: 1,
        courseHasNext: false,
        leadStatusPage: 1,
        leadStatusHasNext: false,
        sourcePage: 1,
        sourceHasNext: false,
        userPage: 1,
        userHasNext: false,
        countryPage: 1,
        countryHasNext: false,
        statePage: 1,
        stateHasNext: false,
        cityPage: 1,
        cityHasNext: false,

        // ── Loading flags ─────────────────────────────────────────────────────
        stateLoading: false,
        userloading: false,
        leadStatusloadMore: false,
    });

    // ── Fetch Master Dropdowns on mount ────────────────────────────────────────
    useEffect(() => {
        sourceList();
        countryList();
        collegeList();
        courseList();
        leadStatusList();
        contactStatusList();
        qualificationList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch Contact Details when router query is ready ──────────────────────
    useEffect(() => {
        if (router.isReady) {
            if (id) {
                getContactDetails(id);
            } else {
                setState({ pageLoading: false, notFound: true });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, id]);

    // =========================================================================
    // GET CONTACT DETAILS API FUNCTION
    // =========================================================================
    const getContactDetails = async (contactId: any) => {
        try {
            setState({ pageLoading: true, notFound: false });
            const res: any = await Models.contact.details(contactId);
            console.log('getContactDetails response --->', res);

            if (!res) {
                setState({ pageLoading: false, notFound: true });
                Failure('Contact not found');
                return;
            }

            // Determine role if assigned_to has groups or assigned_role string
            let assignedRole: any = null;
            if (res?.assigned_role) {
                const roleLower = String(res.assigned_role).toLowerCase();
                assignedRole = roleLower.includes('admin')
                    ? { value: 'admin', label: 'Admin' }
                    : { value: 'staff', label: 'Staff' };
            } else if (res?.assigned_to?.groups?.length > 0) {
                assignedRole =
                    res.assigned_to.groups[0] == 2
                        ? { value: 'staff', label: 'Staff' }
                        : { value: 'admin', label: 'Admin' };
            }

            // Determine assigned_to option
            let assignedTo: any = null;
            if (res?.assigned_to) {
                if (typeof res.assigned_to === 'object' && res.assigned_to.id) {
                    const name =
                        `${capitalizeFLetter(res.assigned_to.first_name || '')} ${capitalizeFLetter(
                            res.assigned_to.last_name || ''
                        )}`.trim() ||
                        res.assigned_to.username ||
                        'Assigned User';
                    assignedTo = { value: res.assigned_to.id, label: name };
                } else if (typeof res.assigned_to === 'string') {
                    assignedTo = { value: res.assigned_to, label: res.assigned_to };
                }
            }

            // Status option
            let statusOpt: any = null;
            if (res?.status) {
                if (typeof res.status === 'object' && res.status.id) {
                    statusOpt = { value: res.status.id, label: res.status.status };
                } else {
                    statusOpt = { value: res.status, label: String(res.status) };
                }
            }

            // Country option
            let countryOpt: any = null;
            if (res?.country) {
                if (typeof res.country === 'object' && res.country.id) {
                    countryOpt = { value: res.country.id, label: res.country.country_name };
                } else {
                    countryOpt = { value: res.country, label: String(res.country) };
                }
            }

            // State option
            let stateOpt: any = null;
            if (res?.state) {
                if (typeof res.state === 'object' && res.state.id) {
                    stateOpt = { value: res.state.id, label: res.state.state_name };
                } else {
                    stateOpt = { value: res.state, label: String(res.state) };
                }
            }

            // City option
            let cityOpt: any = null;
            if (res?.city) {
                if (typeof res.city === 'object' && res.city.id) {
                    cityOpt = { value: res.city.id, label: res.city.city_name };
                } else {
                    cityOpt = { value: res.city, label: String(res.city) };
                }
            }

            // Education qualification option
            let qualificationOpt: any = null;
            if (res?.education_qualification) {
                if (typeof res.education_qualification === 'object' && res.education_qualification.id) {
                    qualificationOpt = {
                        value: res.education_qualification.id,
                        label: res.education_qualification.qualification,
                    };
                } else {
                    qualificationOpt = {
                        value: res.education_qualification,
                        label: String(res.education_qualification),
                    };
                }
            } else if (res?.qualification) {
                qualificationOpt = { value: res.qualification, label: String(res.qualification) };
            }

            // Preferred institution / college option
            let institutionOpt: any = null;
            if (res?.preferred_institution) {
                if (typeof res.preferred_institution === 'object' && res.preferred_institution.id) {
                    institutionOpt = {
                        value: res.preferred_institution.id,
                        label: res.preferred_institution.name,
                    };
                } else {
                    institutionOpt = {
                        value: res.preferred_institution,
                        label: String(res.institution || res.preferred_institution),
                    };
                }
            } else if (res?.institution) {
                institutionOpt = { value: res.institution, label: String(res.institution) };
            }

            // Course specialization option
            let courseOpt: any = null;
            if (res?.course_specialization) {
                if (typeof res.course_specialization === 'object' && res.course_specialization.id) {
                    courseOpt = {
                        value: res.course_specialization.id,
                        label: res.course_specialization.name,
                    };
                } else {
                    courseOpt = {
                        value: res.course_specialization,
                        label: String(res.target_course || res.course_specialization),
                    };
                }
            } else if (res?.target_course) {
                courseOpt = { value: res.target_course, label: String(res.target_course) };
            }

            // Twelfth group option
            let twelfthGroupOpt: any = null;
            if (res?.twelfth_group) {
                twelfthGroupOpt =
                    TWELFTH_GROUP_OPTIONS.find((o) => o.value === res.twelfth_group) || {
                        value: res.twelfth_group,
                        label: String(res.twelfth_group),
                    };
            }

            // Twelfth board result option
            let twelfthBoardResultOpt: any = null;
            if (res?.twelfth_board_result) {
                twelfthBoardResultOpt =
                    BOARD_RESULT_OPTIONS.find((o) => o.value === res.twelfth_board_result) || {
                        value: res.twelfth_board_result,
                        label: String(res.twelfth_board_result),
                    };
            }

            // Tenth board result option
            let tenthBoardResultOpt: any = null;
            if (res?.tenth_board_result) {
                tenthBoardResultOpt =
                    BOARD_RESULT_OPTIONS.find((o) => o.value === res.tenth_board_result) || {
                        value: res.tenth_board_result,
                        label: String(res.tenth_board_result),
                    };
            }

            // Degree type option
            let degreeTypeOpt: any = null;
            if (res?.degree_type) {
                degreeTypeOpt =
                    DEGREE_TYPE_OPTIONS.find((o) => o.value === res.degree_type) || {
                        value: res.degree_type,
                        label: String(res.degree_type),
                    };
            }

            // Student interest level option
            let interestLevelOpt: any = null;
            if (res?.student_interest_level) {
                interestLevelOpt =
                    INTEREST_LEVEL_OPTIONS.find((o) => o.value === res.student_interest_level) || {
                        value: res.student_interest_level,
                        label: String(res.student_interest_level),
                    };
            }

            // Reference type option
            let referenceTypeOpt: any = null;
            if (res?.reference_type) {
                referenceTypeOpt =
                    REFERENCE_TYPE_OPTIONS.find((o) => o.value === res.reference_type) || {
                        value: res.reference_type,
                        label: String(res.reference_type),
                    };
            }

            // Interview & internal rating options
            const interviewRatingOpt =
                res?.interview_rating != null && res?.interview_rating !== ''
                    ? { value: Number(res.interview_rating), label: String(res.interview_rating) }
                    : null;
            const internalRatingOpt =
                res?.internal_rating != null && res?.internal_rating !== ''
                    ? { value: Number(res.internal_rating), label: String(res.internal_rating) }
                    : null;

            // Date of birth parsing
            let dobValue: any = null;
            if (res?.dob) {
                dobValue = moment(res.dob).isValid() ? moment(res.dob).toDate() : null;
            }

            setState({
                pageLoading: false,
                notFound: false,
                student_name: res?.student_name || '',
                phone_number: res?.phone_number || '',
                secondary_phone_number: res?.secondary_phone_number || res?.parent_phone || '',
                parent_mobile: res?.parent_mobile || res?.secondary_phone_number || res?.parent_phone || '',
                father_name: res?.father_name || '',
                mother_name: res?.mother_name || '',
                dob: dobValue,
                email: res?.email || '',
                alternate_email: res?.alternate_email || '',
                status: statusOpt,
                address: res?.address || res?.area || '',
                country: countryOpt,
                state: stateOpt,
                city: cityOpt,
                pincode: res?.pincode ? String(res.pincode) : '',
                achieved: Boolean(res?.achieved ?? res?.is_archive),

                parent_name: res?.parent_name || '',
                parent_designation: res?.parent_designation || '',
                annual_income: res?.annual_income ? String(res.annual_income) : '',
                siblings_count: res?.siblings_count ? String(res.siblings_count) : '',

                education_qualification: qualificationOpt,
                twelfth_school_name: res?.twelfth_school_name || res?.school_name || '',
                twelfth_group: twelfthGroupOpt,
                twelfth_board_result: twelfthBoardResultOpt,
                twelfth_marks: res?.twelfth_marks ? String(res.twelfth_marks) : '',
                tenth_school_name: res?.tenth_school_name || '',
                tenth_board_result: tenthBoardResultOpt,
                tenth_marks: res?.tenth_marks ? String(res.tenth_marks) : '',
                graduation_year: res?.graduation_year ? String(res.graduation_year) : '',
                board_name: res?.board_name || '',
                school_name: res?.school_name || '',
                ug_marks: res?.ug_marks ? String(res.ug_marks) : '',
                entrance_exam_score: res?.entrance_exam_score ? String(res.entrance_exam_score) : '',
                score_in_subjects: res?.score_in_subjects ? String(res.score_in_subjects) : '',

                preferred_institution: institutionOpt,
                degree_type: degreeTypeOpt,
                course_specialization: courseOpt,
                student_interest_level: interestLevelOpt,

                reference_type: referenceTypeOpt,

                interview_rating: interviewRatingOpt,
                internal_rating: internalRatingOpt,
                remark: res?.remark || '',
                personal_remarks: res?.personal_remarks || '',

                preferred_location: res?.preferred_location || '',
                best_time_to_contact: res?.best_time_to_contact || null,
                source_details: res?.source_details || '',
                relation_to_student: res?.relation_to_student || '',

                contact_assign_role: assignedRole,
                contact_assigned_to: assignedTo,
            });

            // Cascade fetch state, city, and user list without overriding values
            if (countryOpt?.value) {
                stateListFn(countryOpt, true);
            }
            if (stateOpt?.value) {
                cityListFn(stateOpt);
            }
            if (assignedRole) {
                usersList(assignedRole, 'initial');
            }
        } catch (error) {
            setState({ pageLoading: false, notFound: true });
            console.error('getContactDetails error:', error);
            Failure('Failed to load contact details.');
        }
    };

    // =========================================================================
    // DROPDOWN FETCH FUNCTIONS
    // =========================================================================

    const sourceList = async () => {
        try {
            const res: any = await Models.master.lead_cat_List(1);
            setState({ sourceList: Dropdown(res.results, 'name'), sourcePage: 1, sourceHasNext: !!res?.next });
        } catch (e) {
            console.error(e);
        }
    };
    const sourceLoadMore = async () => {
        try {
            const res: any = await Models.master.lead_cat_List(state.sourcePage + 1);
            setState({
                sourceList: [...state.sourceList, ...Dropdown(res.results, 'name')],
                sourcePage: state.sourcePage + 1,
                sourceHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const collegeList = async () => {
        try {
            const res: any = await Models.master.college_list(1);
            setState({ collegeList: Dropdown(res.results, 'name'), collegePage: 1, collegeHasNext: !!res?.next });
        } catch (e) {
            console.error(e);
        }
    };
    const collegeLoadMore = async () => {
        try {
            const res: any = await Models.master.college_list(state.collegePage + 1);
            setState({
                collegeList: [...state.collegeList, ...Dropdown(res.results, 'name')],
                collegePage: state.collegePage + 1,
                collegeHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const courseList = async () => {
        try {
            const res: any = await Models.master.course_list(1);
            setState({ courseList: Dropdown(res.results, 'name'), coursePage: 1, courseHasNext: !!res?.next });
        } catch (e) {
            console.error(e);
        }
    };
    const courseLoadMore = async () => {
        try {
            const res: any = await Models.master.course_list(state.coursePage + 1);
            setState({
                courseList: [...state.courseList, ...Dropdown(res.results, 'name')],
                coursePage: state.coursePage + 1,
                courseHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const qualificationList = async () => {
        try {
            const res: any = await Models.master.lead_education_qua(1);
            setState({
                qualificationList: Dropdown(res.results, 'qualification'),
                qualificationPage: 1,
                qualificationHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };
    const qualificationLoadMore = async () => {
        try {
            const res: any = await Models.master.lead_education_qua(state.qualificationPage + 1);
            setState({
                qualificationList: [...state.qualificationList, ...Dropdown(res.results, 'qualification')],
                qualificationPage: state.qualificationPage + 1,
                qualificationHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const leadStatusList = async () => {
        try {
            const res: any = await Models.master.lead_status_list(1);
            setState({ leadStatusList: Dropdown(res.results, 'stage'), leadStatusPage: 1, leadStatusHasNext: !!res?.next });
        } catch (e) {
            console.error(e);
        }
    };

    const contactStatusList = async () => {
        try {
            const res: any = await Models.master.contact_status_list(1);
            setState({
                contactStatusList: Dropdown(res.results, 'status'),
                contactStatusPage: 1,
                contactStatusHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };
    const contactStatusLoadMore = async () => {
        try {
            const res: any = await Models.master.contact_status_list(state.contactStatusPage + 1);
            setState({
                contactStatusList: [...state.contactStatusList, ...Dropdown(res.results, 'status')],
                contactStatusPage: state.contactStatusPage + 1,
                contactStatusHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const countryList = async () => {
        try {
            const res: any = await Models.master.country_list(1);
            setState({ countryList: Dropdown(res?.results, 'country_name'), countryPage: 1, countryHasNext: !!res?.next });
        } catch (e) {
            console.error(e);
        }
    };
    const countryLoadMore = async () => {
        try {
            const res: any = await Models.master.country_list(state.countryPage + 1);
            setState({
                countryList: [...state.countryList, ...Dropdown(res?.results, 'country_name')],
                countryPage: state.countryPage + 1,
                countryHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const stateListFn = async (country: any, preserveCity = false) => {
        try {
            setState({
                stateLoading: true,
                statePage: 1,
                stateHasNext: false,
                ...(preserveCity ? {} : { cityList: [], city: null }),
            });
            const res: any = await Models.master.state_list(country?.value);
            setState({
                stateList: Dropdown(res.results, 'state_name'),
                stateLoading: false,
                statePage: 1,
                stateHasNext: !!res?.next,
            });
        } catch (e) {
            setState({ stateLoading: false });
            console.error(e);
        }
    };
    const stateLoadMore = async (country: any) => {
        try {
            const res: any = await Models.master.state_list(country?.value);
            setState({
                stateList: [...state.stateList, ...Dropdown(res.results, 'state_name')],
                statePage: state.statePage + 1,
                stateHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const cityListFn = async (stateVal: any) => {
        try {
            setState({ cityList: [], cityPage: 1, cityHasNext: false });
            const res: any = await Models.master.city_list(stateVal?.value);
            setState({ cityList: Dropdown(res?.results, 'city_name'), cityPage: 1, cityHasNext: !!res?.next });
        } catch (e) {
            console.error(e);
        }
    };
    const cityLoadMore = async (stateVal: any) => {
        try {
            const res: any = await Models.master.city_list(stateVal?.value);
            setState({
                cityList: [...state.cityList, ...Dropdown(res?.results, 'city_name')],
                cityPage: state.cityPage + 1,
                cityHasNext: !!res?.next,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const usersList = async (e: any, type = '') => {
        try {
            if (type !== 'initial') {
                if (type === 'contact') setState({ contact_assign_role: e, contact_assigned_to: null });
                else setState({ assignRole: e, assigned_to: null });
            }
            setState({ userloading: true });
            const body: any = e?.label === ROLE.ADMIN ? { show_admins_only: 'Yes' } : { exclude_admin: 'Yes' };
            const res: any = await Models.user.includeAdminuserList(1, body);
            const list = res?.results?.map((i: any) => ({
                label: `${capitalizeFLetter(i?.first_name)} ${capitalizeFLetter(i?.last_name)}`,
                value: i?.id,
            }));
            setState({ usersList: list, userloading: false, userPage: 1, userHasNext: !!res?.next });
        } catch (e) {
            setState({ userloading: false });
            console.error(e);
        }
    };
    const usersListLoadMore = async () => {
        try {
            setState({ leadStatusloadMore: true });
            const role = state.contact_assign_role;
            const body: any = role?.label === ROLE.ADMIN ? { show_admins_only: 'Yes' } : { exclude_admin: 'Yes' };
            const res: any = await Models.user.includeAdminuserList(state.userPage + 1, body);
            const list = res?.results?.map((i: any) => ({
                label: `${capitalizeFLetter(i?.first_name)} ${capitalizeFLetter(i?.last_name)}`,
                value: i?.id,
            }));
            setState({
                usersList: [...state.usersList, ...list],
                leadStatusloadMore: false,
                userPage: state.userPage + 1,
                userHasNext: !!res?.next,
            });
        } catch (e) {
            setState({ leadStatusloadMore: false });
            console.error(e);
        }
    };

    // =========================================================================
    // SUBMIT / UPDATE CONTACT
    // =========================================================================
    const handleSubmit = async () => {
        if (!id) {
            Failure('Invalid Contact ID');
            return;
        }

        const payload = {
            phone_number: state.phone_number,
            lead_source_category: state.lead_source_category?.value,
            remark: state.remark?.trim(),
            is_archive: !!state.achieved,
            student_name: state.student_name?.trim(),
            email: state.email?.trim(),
            alternate_email: state.alternate_email?.trim(),
            secondary_phone_number: state.secondary_phone_number,
            parent_mobile: state.parent_mobile || state.secondary_phone_number || undefined,
            father_name: state.father_name?.trim() || undefined,
            mother_name: state.mother_name?.trim() || undefined,
            dob: state.dob ? moment(state.dob).format('YYYY-MM-DD') : null,
            parent_name: state.parent_name?.trim(),
            parent_designation: state.parent_designation?.trim(),
            siblings_count: state.siblings_count ? Number(state.siblings_count) : null,
            annual_income: state.annual_income ? Number(state.annual_income) : null,
            address: state.address?.trim(),
            city: state.city?.value,
            pincode: state.pincode ? String(state.pincode).trim() : undefined,
            education_qualification: state.education_qualification?.value,
            twelfth_school_name: state.twelfth_school_name?.trim() || undefined,
            twelfth_group: state.twelfth_group?.value || undefined,
            twelfth_board_result: state.twelfth_board_result?.value || undefined,
            twelfth_marks: state.twelfth_marks ? Number(state.twelfth_marks) : null,
            tenth_school_name: state.tenth_school_name?.trim() || undefined,
            tenth_board_result: state.tenth_board_result?.value || undefined,
            tenth_marks: state.tenth_marks ? Number(state.tenth_marks) : null,
            graduation_year: state.graduation_year ? Number(state.graduation_year) : null,
            board_name: state.board_name?.trim(),
            school_name: state.school_name?.trim(),
            ug_marks: state.ug_marks ? Number(state.ug_marks) : null,
            entrance_exam_score: state.entrance_exam_score ? Number(state.entrance_exam_score) : null,
            score_in_subjects: state.score_in_subjects,
            preferred_institution: state.preferred_institution?.value || undefined,
            degree_type: state.degree_type?.value || undefined,
            course_specialization: state.course_specialization?.value || undefined,
            student_interest_level: state.student_interest_level?.value || undefined,
            reference_type: state.reference_type?.value || undefined,
            preferred_location: state.preferred_location?.trim(),
            best_time_to_contact: state.best_time_to_contact
                ? moment(state.best_time_to_contact).format('YYYY-MM-DD HH:mm:ss')
                : null,
            interview_rating: state.interview_rating?.value ?? null,
            internal_rating: state.internal_rating?.value ?? null,
            personal_remarks: state.personal_remarks?.trim(),
            source_details: state.source_details,
            relation_to_student: state.relation_to_student,
            status: state.status?.value,
            state: state.state?.value ?? null,
            country: state.country?.value ?? null,
            achieved: state.achieved,
            assigned_to: state?.contact_assigned_to?.value,
        };

        try {
            setState({ submitLoad: true });
            await Validation.createContact.validate(payload, { abortEarly: false });
            await Models.contact.update(payload, id);
            Success('Contact updated successfully');
            router.push(state.achieved ? '/my_archive_contact' : '/contacts/all_contacts');
        } catch (error: any) {
            if (error?.inner) {
                const errs: any = {};
                error.inner.forEach((e: any) => {
                    errs[e.path] = e?.message;
                });
                setState({ errors: errs });
            } else {
                if (error?.email?.length > 0) Failure(error?.email[0]);
                else if (error?.phone_number?.length > 0) Failure(error?.phone_number[0]);
                else Failure(typeof error === 'string' ? error : error?.message || 'Failed to update contact');
            }
        } finally {
            setState({ submitLoad: false });
        }
    };

    // ── UI helpers ────────────────────────────────────────────────────────────
    const SectionHeader = ({ label }: { label: string }) => (
        <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 pb-4 dark:border-gray-800">
            <span className="h-5 w-0.5 rounded-full bg-[#39854a]" />
            <span className="text-sm font-bold text-gray-800 dark:text-white">{label}</span>
        </div>
    );

    const SubSectionHeader = ({ label }: { label: string }) => (
        <div className="col-span-full mt-2 flex items-center gap-2 border-b border-dashed border-gray-200 pb-2 dark:border-gray-700">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    );

    const SubmitButton = () => (
        <button
            type="button"
            onClick={handleSubmit}
            disabled={state.submitLoad || state.pageLoading}
            className="btn-action-solid inline-flex items-center gap-2 disabled:opacity-60"
        >
            {state.submitLoad ? (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            ) : (
                <Save className="h-4 w-4" />
            )}
            Update Contact
        </button>
    );

    // =========================================================================
    // LOADING / NOT FOUND RENDER STATES
    // =========================================================================
    if (state.pageLoading) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
                <Head>
                    <title>Loading Contact... - KAHE CRM</title>
                </Head>
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#39854a] shadow-sm dark:bg-emerald-950/40">
                        <Loader2 className="h-7 w-7 animate-spin" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Fetching Contact Details</h2>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Loading information for contact #{id}...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (state.notFound) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
                <Head>
                    <title>Contact Not Found - KAHE CRM</title>
                </Head>
                <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-[#0e1726]">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/40">
                        <AlertCircle className="h-7 w-7" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Contact Not Found</h2>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {id ? `We could not find a contact record matching ID "${id}".` : 'No contact ID was specified in the URL query.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push('/contacts/all_contacts')}
                        className="btn-action-solid mt-6 inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Contacts
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================================
    // MAIN FORM RENDER
    // =========================================================================
    return (
        <div className="min-h-screen space-y-5 bg-[#f7faf8] p-4 sm:p-6">
            <Head>
                <title>{state.student_name ? `Edit Contact: ${state.student_name} - KAHE CRM` : 'Edit Contact - KAHE CRM'}</title>
            </Head>

            {/* PAGE HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="page-title text-2xl font-black tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                            Edit Contact
                        </h1>
                        {state.student_name && (
                            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-[#39854a] dark:bg-emerald-950/50 dark:text-emerald-300">
                                {state.student_name}
                            </span>
                        )}
                        {id && (
                            <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-800">
                                ID: {id}
                            </span>
                        )}
                    </div>
                    <p className="page-subtitle mt-1 text-xs font-normal text-gray-500 dark:text-gray-400 sm:text-sm">
                        Academic Year 2026–27 · Karpagam Group
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <X className="h-4 w-4" /> Cancel
                    </button>
                    <SubmitButton />
                </div>
            </div>

            {/* ── ASSIGNMENT ──────────────────────────────────────────────────── */}
            <div className="overview-panel">
                <div className="mb-4 flex items-center gap-2.5">
                    <span className="h-5 w-0.5 rounded-full bg-[#39854a]" />
                    <span className="text-sm font-bold text-gray-800 dark:text-white">Assignment</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <CustomSelect
                        title="Choose Role"
                        value={state.contact_assign_role}
                        onChange={(e) => usersList(e, 'contact')}
                        placeholder="Choose Role"
                        options={[
                            { value: 'admin', label: 'Admin' },
                            { value: 'staff', label: 'Staff' },
                        ]}
                        error={state.errors?.contact_assign_role}
                    />
                    <CustomSelect
                        title="Assign To"
                        value={state.contact_assigned_to}
                        onChange={(e) => setState({ contact_assigned_to: e })}
                        placeholder="Assign To"
                        options={state.usersList}
                        error={state.errors?.assigned_to}
                        isMulti={false}
                        loadMore={() => state.userHasNext && usersListLoadMore()}
                        loading={state.userloading || state.leadStatusloadMore}
                    />
                </div>
            </div>

            {/* ── PERSONAL INFORMATION ────────────────────────────────────────── */}
            <div className="overview-panel">
                <SectionHeader label="Personal Information" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <TextInput
                        title="Student Name"
                        required
                        value={state.student_name}
                        onChange={(e) => setState({ student_name: e, errors: { ...state.errors, student_name: '' } })}
                        placeholder="e.g. K. Vignesh"
                        error={state.errors?.student_name}
                    />
                    <CustomPhoneInput
                        title="Student Mobile"
                        required
                        placeholder="+91 98421 00000"
                        value={state.phone_number}
                        onChange={(e) => setState({ phone_number: e, errors: { ...state.errors, phone_number: '' } })}
                        error={state.errors?.phone_number}
                    />
                    <CustomeDatePicker
                        title="Date of Birth"
                        placeholder="DD/MM/YYYY"
                        value={state.dob}
                        onChange={(e: any) => setState({ dob: e })}
                        error={state.errors?.dob}
                    />
                    <TextInput
                        title="Email"
                        value={state.email}
                        onChange={(e) => setState({ email: e, errors: { ...state.errors, email: '' } })}
                        placeholder="student@email.com"
                        error={state.errors?.email}
                    />
                    <TextInput
                        title="Alternate Email"
                        value={state.alternate_email}
                        onChange={(e) => setState({ alternate_email: e })}
                        placeholder="Alternate Email"
                        error={state.errors?.alternate_email}
                    />
                    <CustomSelect
                        title="Contact Status"
                        required
                        value={state.status}
                        onChange={(e) => setState({ status: e, errors: { ...state.errors, status: null } })}
                        placeholder="Contact Status"
                        options={state.contactStatusList}
                        error={state.errors?.status}
                        loadMore={() => state.contactStatusHasNext && contactStatusLoadMore()}
                    />
                    <TextInput
                        title="Address"
                        value={state.address}
                        onChange={(e) => setState({ address: e })}
                        placeholder="Address"
                        error={state.errors?.address}
                    />
                    <CustomSelect
                        title="Country"
                        value={state.country}
                        onChange={(e) => {
                            if (e) stateListFn(e);
                            setState({ country: e, state: null, city: null });
                        }}
                        placeholder="Country"
                        options={state.countryList}
                        error={state.errors?.country}
                        loadMore={() => state.countryHasNext && countryLoadMore()}
                    />
                    <CustomSelect
                        title="State"
                        value={state.state}
                        onChange={(e) => {
                            if (e) cityListFn(e);
                            setState({ state: e, city: null });
                        }}
                        placeholder="State"
                        options={state.stateList}
                        loading={state.stateLoading}
                        error={state.errors?.state}
                        loadMore={() => state.stateHasNext && stateLoadMore(state.country)}
                    />
                    <CustomSelect
                        title="City"
                        value={state.city}
                        onChange={(e) => setState({ city: e })}
                        placeholder="City"
                        options={state.cityList}
                        error={state.errors?.city}
                        loadMore={() => state.cityHasNext && cityLoadMore(state.state)}
                    />
                    <NumberInput
                        title="Pincode"
                        value={state.pincode}
                        onChange={(e) => setState({ pincode: e })}
                        placeholder="Pincode"
                        error={state.errors?.pincode}
                    />
                </div>
            </div>

            {/* ── FAMILY DETAILS ───────────────────────────────────────────────── */}
            <div className="overview-panel">
                <SectionHeader label="Family Details" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <TextInput
                        title="Father's Name"
                        value={state.father_name}
                        onChange={(e) => setState({ father_name: e })}
                        placeholder="Father's Name"
                        error={state.errors?.father_name}
                    />
                    <TextInput
                        title="Mother's Name"
                        value={state.mother_name}
                        onChange={(e) => setState({ mother_name: e })}
                        placeholder="Mother's Name"
                        error={state.errors?.mother_name}
                    />
                    <CustomPhoneInput
                        title="Parent / Guardian Mobile"
                        placeholder="+91 98421 00001"
                        value={state.secondary_phone_number}
                        onChange={(e) => setState({ secondary_phone_number: e })}
                        error={state.errors?.secondary_phone_number}
                    />
                    <TextInput
                        title="Parent Designation"
                        value={state.parent_designation}
                        onChange={(e) => setState({ parent_designation: e })}
                        placeholder="Parent Designation"
                        error={state.errors?.parent_designation}
                    />
                    <NumberInput
                        title="Annual Income"
                        value={state.annual_income}
                        onChange={(e) => setState({ annual_income: e })}
                        placeholder="Annual Income"
                        error={state.errors?.annual_income}
                    />
                    <NumberInput
                        title="Siblings Count"
                        value={state.siblings_count}
                        onChange={(e) => setState({ siblings_count: e })}
                        placeholder="Siblings Count"
                        error={state.errors?.siblings_count}
                    />
                </div>
            </div>

            {/* ── ACADEMIC QUALIFICATION ───────────────────────────────────────── */}
            <div className="overview-panel">
                <SectionHeader label="Academic Qualification" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Current Qualification */}
                    <CustomSelect
                        title="Current Qualification"
                        value={state.education_qualification}
                        onChange={(e) => setState({ education_qualification: e })}
                        placeholder="Select Qualification"
                        options={state.qualificationList}
                        error={state.errors?.education_qualification}
                        loadMore={() => state.qualificationHasNext && qualificationLoadMore()}
                    />

                    {/* 12th Schooling */}
                    <SubSectionHeader label="12th Schooling" />
                    <TextInput
                        title="School Name (12th)"
                        value={state.twelfth_school_name}
                        onChange={(e) => setState({ twelfth_school_name: e })}
                        placeholder="School Name"
                        error={state.errors?.twelfth_school_name}
                    />
                    <CustomSelect
                        title="12th Group / Major"
                        value={state.twelfth_group}
                        onChange={(e) => setState({ twelfth_group: e })}
                        placeholder="Select Group"
                        options={TWELFTH_GROUP_OPTIONS}
                        error={state.errors?.twelfth_group}
                    />
                    <CustomSelect
                        title="Board Result (12th)"
                        value={state.twelfth_board_result}
                        onChange={(e) => setState({ twelfth_board_result: e })}
                        placeholder="Board Result"
                        options={BOARD_RESULT_OPTIONS}
                        error={state.errors?.twelfth_board_result}
                    />
                    <NumberInput
                        title="12th Marks / %"
                        value={state.twelfth_marks}
                        onChange={(e) => setState({ twelfth_marks: e })}
                        placeholder="e.g. 87.5"
                        error={state.errors?.twelfth_marks}
                    />

                    {/* 10th Schooling */}
                    <SubSectionHeader label="10th Schooling" />
                    <TextInput
                        title="School Name (10th)"
                        value={state.tenth_school_name}
                        onChange={(e) => setState({ tenth_school_name: e })}
                        placeholder="School Name"
                        error={state.errors?.tenth_school_name}
                    />
                    <CustomSelect
                        title="Board Result (10th)"
                        value={state.tenth_board_result}
                        onChange={(e) => setState({ tenth_board_result: e })}
                        placeholder="Board Result"
                        options={BOARD_RESULT_OPTIONS}
                        error={state.errors?.tenth_board_result}
                    />
                    <NumberInput
                        title="10th Marks / %"
                        value={state.tenth_marks}
                        onChange={(e) => setState({ tenth_marks: e })}
                        placeholder="e.g. 90.0"
                        error={state.errors?.tenth_marks}
                    />

                    {/* Other Academic Details */}
                    <SubSectionHeader label="Other Academic Details" />
                    <NumberInput
                        title="Graduation Year"
                        value={state.graduation_year}
                        onChange={(e) => setState({ graduation_year: e })}
                        placeholder="Graduation Year"
                        error={state.errors?.graduation_year}
                    />
                    <NumberInput
                        title="UG Marks"
                        value={state.ug_marks}
                        onChange={(e) => setState({ ug_marks: e })}
                        placeholder="UG Marks"
                        error={state.errors?.ug_marks}
                    />
                    <NumberInput
                        title="Entrance Exam Score"
                        value={state.entrance_exam_score}
                        onChange={(e) => setState({ entrance_exam_score: e })}
                        placeholder="Entrance Exam Score"
                        error={state.errors?.entrance_exam_score}
                    />
                    <NumberInput
                        title="Score in Subjects"
                        value={state.score_in_subjects}
                        onChange={(e) => setState({ score_in_subjects: e })}
                        placeholder="Score in Subjects"
                        error={state.errors?.score_in_subjects}
                    />
                </div>
            </div>

            {/* ── ADMISSION PREFERENCE ─────────────────────────────────────────── */}
            <div className="overview-panel">
                <SectionHeader label="Admission Preference" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CustomSelect
                        title="Preferred Institution"
                        value={state.preferred_institution}
                        onChange={(e) => setState({ preferred_institution: e })}
                        placeholder="Select Institution"
                        options={state.collegeList}
                        error={state.errors?.preferred_institution}
                        loadMore={() => state.collegeHasNext && collegeLoadMore()}
                    />
                    <CustomSelect
                        title="Degree Type"
                        value={state.degree_type}
                        onChange={(e) => setState({ degree_type: e })}
                        placeholder="Select Degree Type"
                        options={DEGREE_TYPE_OPTIONS}
                        error={state.errors?.degree_type}
                    />
                    <CustomSelect
                        title="Course & Specialization"
                        value={state.course_specialization}
                        onChange={(e) => setState({ course_specialization: e })}
                        placeholder="Select Course"
                        options={state.courseList}
                        error={state.errors?.course_specialization}
                        loadMore={() => state.courseHasNext && courseLoadMore()}
                    />
                    <CustomSelect
                        title="Student Interest Level"
                        value={state.student_interest_level}
                        onChange={(e) => setState({ student_interest_level: e })}
                        placeholder="Interest Level"
                        options={INTEREST_LEVEL_OPTIONS}
                        error={state.errors?.student_interest_level}
                    />
                </div>
            </div>

            {/* ── REFERENCE DETAILS ────────────────────────────────────────────── */}
            <div className="overview-panel">
                <SectionHeader label="Reference Details" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CustomSelect
                        title="Reference Type"
                        value={state.reference_type}
                        onChange={(e) => setState({ reference_type: e })}
                        placeholder="Select Reference Type"
                        options={REFERENCE_TYPE_OPTIONS}
                        error={state.errors?.reference_type}
                    />
                </div>
            </div>

            {/* ── INTERNAL ASSESSMENT ──────────────────────────────────────────── */}
            <div className="overview-panel">
                <SectionHeader label="Internal Assessment & Remarks" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <CustomSelect
                        title="Interview Rating"
                        value={state.interview_rating}
                        onChange={(e) => setState({ interview_rating: e })}
                        placeholder="Interview Rating"
                        error={state.errors?.interview_rating}
                        options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
                    />
                    <CustomSelect
                        title="Internal Rating"
                        value={state.internal_rating}
                        onChange={(e) => setState({ internal_rating: e })}
                        placeholder="Internal Rating"
                        error={state.errors?.internal_rating}
                        options={[1, 2, 3, 4, 5].map((n) => ({ value: n, label: String(n) }))}
                    />
                    <TextArea
                        title="Remark"
                        value={state.remark}
                        onChange={(e) => setState({ remark: e })}
                        placeholder="Remark"
                        error={state.errors?.remark}
                        rows={3}
                    />
                    <TextArea
                        title="Personal Remark"
                        value={state.personal_remarks}
                        onChange={(e) => setState({ personal_remarks: e })}
                        placeholder="Personal Remark"
                        error={state.errors?.personal_remarks}
                        rows={3}
                    />
                </div>
            </div>

            {/* ── FOOTER ───────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-4 dark:border-gray-800">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    <X className="h-4 w-4" /> Cancel
                </button>
                <SubmitButton />
            </div>
        </div>
    );
};

export default EditContact;
