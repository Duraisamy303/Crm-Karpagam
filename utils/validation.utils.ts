import country from '@/pages/countries';
import * as Yup from 'yup';

export const loginValidation = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Enter a valid email address'),
    password: Yup.string().required('Password is required'),
});

export const createLeadValidation = Yup.object().shape({
    name: Yup.string().required('Lead Name is required'),
    // lead_owner: Yup.string().required('Lead Manager is required'),
    address: Yup.string().required('Address is required'),
    // company_website: Yup.string().required('Website is required'),
    // status: Yup.string().required('Status is required'),
    lead_type: Yup.string().required('Lead Type is required'),
    // focus_segment: Yup.string().required('Company Segment is required'),
    // market_segment: Yup.string().required('Market Segment is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    // vertical: Yup.string().required('Vertical is required'),
    // assigned_to: Yup.string().required('Assign To is required'),
    // contact_name: Yup.string().required('Name is required'),
    // email_id: Yup.string().required('Email is required'),
    // designation: Yup.string().required('Designation is required'),
    // department: Yup.string().required('Department is required'),
    // phone_number: Yup.string().required('Phone Number is required'),
    // lead_source: Yup.string().required('Source is required'),
    // contact_status: Yup.string().required('Contact Status is required'),
    // remark: Yup.string().required('Remark is required'),
    opportunity_name: Yup.string().required('Opportunity Name is required'),
});
export const createLeadValidations = Yup.object().shape({
    name: Yup.string().required('Lead Name is required'),
    // lead_owner: Yup.string().required('Lead Manager is required'),
    address: Yup.string().required('Address is required'),
    // company_website: Yup.string().required('Website is required'),
    // status: Yup.string().required('Status is required'),
    lead_type: Yup.string().required('Lead Type is required'),
    // focus_segment: Yup.string().required('Company Segment is required'),
    // market_segment: Yup.string().required('Market Segment is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    city: Yup.string().required('City is required'),
    // vertical: Yup.string().required('Vertical is required'),
    // assigned_to: Yup.string().required('Assign To is required'),
    // contact_name: Yup.string().required('Name is required'),
    // email_id: Yup.string().required('Email is required'),
    // designation: Yup.string().required('Designation is required'),
    // department: Yup.string().required('Department is required'),
    // phone_number: Yup.string().required('Phone Number is required'),
    // lead_source: Yup.string().required('Source is required'),
    // contact_status: Yup.string().required('Contact Status is required'),
    // remark: Yup.string().required('Remark is required'),
    // opportunity_name: Yup.string().required('Opportunity Name is required'),
});

export const updateLeadValidation = Yup.object().shape({
    name: Yup.string().required('Lead Name is required'),
    // lead_owner: Yup.string().required('Lead Manager is required'),
    // company_email: Yup.string().email('Invalid email').required('Email is required'),
    company_website: Yup.string().required('Website is required'),
    // company_number: Yup.string().required('Number is required'),
    department: Yup.string().required('Department is required'),
    // status: Yup.string().required('Status is required'),

    lead_type: Yup.string().required('Lead Type is required'),
    // created_by: Yup.string().required('Created By is required'),
    // annual_revenue: Yup.number().nullable().required('Annual Revenue is required').typeError('Annual Revenue must be a number'),
    // tags: Yup.array().min(1, 'At least one tag is required'),
    focus_segment: Yup.string().required('Focus Segment is required'),
    market_segment: Yup.string().required('Market Segment is required'),
    country: Yup.string().required('Country is required'),
    state: Yup.string().required('State is required'),
    vertical: Yup.string().required('Vertical is required'),
    assigned_to: Yup.string().required('Assign To is required'),
    lead_source: Yup.string().required('Lead Source is required'),
    lead_source_from: Yup.string().required('Lead Source From is required'),
    remark: Yup.string().required('Remark is required'),
    primary_contact: Yup.object().shape({
        phone_number: Yup.string()
            .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits') // Example validation for phone number
            .required('Phone number is required'),
        email_id: Yup.string()
            .email('Invalid email address') // Validate email format
            .required('Email ID is required'),
    }),
});

export const createOppValidation = Yup.object().shape({
    // lead: Yup.string().required('Lead is required'),
    opp_name: Yup.string().required('Name is required'),
    // lead_manager: Yup.string().required('Lead Manager is required'),
    stage: Yup.string().required('Stage is required'),
    // opp_value: Yup.string().required('Opportunity Value is required')?.nullable(),
    // opp_value_per_year: Yup.string().required('Recurring Value Per Year is required')?.nullable(),
    // currency_type: Yup.string().required('Currency Type is required'),
    opp_closing_date: Yup.string().required('Closing Date is required')?.nullable(),
    opp_percentage: Yup.string().required('Probability In Percentage is required'),
    opportunity_status: Yup.string().required('Status is required'),
    // contact_name: Yup.string().required('Contact Name is required'),
    // email_id: Yup.string().email('Invalid email').required('Email is required').nullable(),
    // designation: Yup.string().required('Designation is required')?.nullable(),
    // department: Yup.string().required('Department is required'),
    // phone_number: Yup.string().required('Phone Number is required'),
    // lead_source: Yup.string().required('Source is required'),
    // contact_status: Yup.string().required('Contact Status is required'),
    remark: Yup.string().required('Remark is required')?.nullable(),
    // file: Yup.mixed().required('File is required')
    // .test('fileSize', 'File size is too large', (value) => {
    //     return value && value.size <= 2000000;  // 2MB
    // }).test('fileType', 'Unsupported file type', (value) => {
    //     return value && ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(value.type);
    // }),
});

export const createOppsValidation = Yup.object().shape({
    opp_name: Yup.string().required('Name is required'),
    owner: Yup.string().required('Owner is required'),
    opp_stage: Yup.string().required('Stage is required'),
    opportunity_value: Yup.string().required('Opportunity Value is required'),
    recurring_value_per_year: Yup.string().required('Recurring Value Per Year is required'),
    currency_type: Yup.string().required('Currency Type is required'),
    closing_date: Yup.string().required('Closing Date is required'),
    probability_in_percentage: Yup.string().required('Probability In Percentage is required'),
});

export const createNote = Yup.object().shape({
    note: Yup.string().required('Notes is required'),
});

export const updateLog = Yup.object().shape({
    logStage: Yup.string().required('Log Stage is required'),
});

export const createLog = Yup.object().shape({
    logStage: Yup.string().required('Log Stage is required'),
    focus_segment: Yup.string().required('Focus Segment is required'),
});

export const createContact = Yup.object().shape({
    student_name: Yup.string().required('Student name is required'),
    email: Yup.string().required('Email is required').email('Must be a valid email'),
    phone_number: Yup.string()
        .nullable()
        .required('Phone number is required')
        .matches(/^[+]?[0-9]{10,15}$/, 'Please enter a valid phone number'),
    status:Yup.string().required('Status is required')

    // address: Yup.string().required('Address is required'),
    // city: Yup.string().required('City is required'),
});

export const createNewContact = Yup.object().shape({
    // status: Yup.string().required('Contact status is required'),
    // lead_source: Yup.string().required('Lead source is required'),
    // source_from: Yup.string().required('Source Details is required'),
    // department: Yup.string().required('Department is required'),
    // designation: Yup.string().required('Designation is required'),
    // phone_number: Yup.string()
    //     .required('Phone number is required')
    //     .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    // email_id: Yup.string().required('Email is required').email('Must be a valid email'),
    // name: Yup.string().required('Contact name is required'),
    lead: Yup.string().when('moveToLead', {
        is: true, // Condition: Check if `is_archive` is true
        then: Yup.string().required('Lead is required'),
        otherwise: Yup.string().nullable(), // Make it optional when condition is not met
    }),
    // remark: Yup.string().required('Remark is required'),
    company_name: Yup.string().required('Company name is required'),
});

export const createNewContacts = Yup.object().shape({
    status: Yup.string().required('Contact status is required'),
    lead_source: Yup.string().required('Lead source is required'),
    source_from: Yup.string().required('Source Details is required'),
    department: Yup.string().required('Department is required'),
    designation: Yup.string().required('Designation is required'),
    phone_number: Yup.string()
        .required('Phone number is required')
        .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    email_id: Yup.string().required('Email is required').email('Must be a valid email'),
    name: Yup.string().required('Contact name is required'),
    lead: Yup.string().when('moveToLead', {
        is: true, // Condition: Check if `is_archive` is true
        then: Yup.string().required('Lead is required'),
        otherwise: Yup.string().nullable(), // Make it optional when condition is not met
    }),
    remark: Yup.string().required('Remark is required'),
    // company_name: Yup.string().required('Company name is required'),
});

export const createContactWithLead = Yup.object().shape({
    // student_name: Yup.string().required('Student name is required'),
    // student_email: Yup.string().required('Email is required').email('Must be a valid email'),
    // phone_number: Yup.string()
    //     .nullable()
    //     .required('Phone number is required')
    //     .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    // address: Yup.string().required('Address is required'),
    // city: Yup.string().required('City is required'),
    colleges_interested: Yup.string().required('Colleges interested is required'),
    courses_interested: Yup.string().required('Courses interested is required'),
    stage: Yup.string().required('Lead status is required'),
    // assigned_to: Yup.string().required('Assigned to is required'),
    lead_source_category: Yup.string().required('Lead source category is required'),
    // preferred_location: Yup.string().required('Preferred location is required'),
});

export const createNewContactWithOpp = Yup.object().shape({
    status: Yup.string().required('Contact status is required'),
    lead_source: Yup.string().required('Lead source is required'),
    source_from: Yup.string().required('Source Details is required'),
    department: Yup.string().required('Department is required'),
    designation: Yup.string().required('Designation is required'),
    phone_number: Yup.string()
        .required('Phone number is required')
        .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    email_id: Yup.string().required('Email is required').email('Must be a valid email'),
    name: Yup.string().required('Contact name is required'),
    // company_name: Yup.string().required('Company name is required'),
    lead: Yup.string().when('moveToLead', {
        is: true, // Condition: Check if `is_archive` is true
        then: Yup.string().required('Lead is required'),
        otherwise: Yup.string().nullable(), // Make it optional when condition is not met
    }),
    opp_name: Yup.string().required('Name is required'),
    opp_value: Yup.string().required('Opportunity value is required'),
    closing_date: Yup.string().required('Closing Date is required'),
    opp_value_per_year: Yup.string().required('Opportunity Value Per Year is required'),
    opp_percentage: Yup.string().required('Opportunity Percentage is required'),
    stage: Yup.string().required('Stage is required'),
    opportunity_status: Yup.string().required('Status is required'),
    remark: Yup.string().required('Remark is required'),
});

export const createTask = Yup.object().shape({
    lead: Yup.string().required('Lead is required'),
    task_type: Yup.string().required('Task Type is required'),
    task_date_time: Yup.string().required('Task date is required'),
    remark: Yup.string().required('Remark is required'),
    // assigned_to: Yup.array()
    //     .of(
    //         Yup.object().shape({
    //             value: Yup.number().required('Value is required'),
    //             label: Yup.string().required('Label is required'),
    //         })
    //     )
    //     .nullable() // Allow null values
    //     .min(1, 'At least one assigned member is required')
    //     .required('Assigned to is required'),
});

export const createTask1 = Yup.object().shape({
    lead: Yup.string().required('Lead is required'),
    contact: Yup.string().required('Contact is required'),
    tasktype: Yup.string().required('Task Type is required'),
    assigned_to: Yup.array()
        .of(
            Yup.object().shape({
                value: Yup.number().required('Value is required'),
                label: Yup.string().required('Label is required'),
            })
        )
        .nullable() // Allow null values
        .min(1, 'At least one assigned member is required')
        .required('Assigned to is required'),
});

export const assignTask = Yup.object().shape({
    assigned_to: Yup.string().required('Select assigned user'),
});

export const createLeadLog = Yup.object().shape({
    log_type: Yup.string().required('Select log type'),
    // logStage: Yup.string().required('Select log stage type'),
    details: Yup.string().required('Details is required'),
    // focus_segment: Yup.string().required('Select focus segment'),
    // primary_contact: Yup.string().required('Select primary contact'),
});
export const createLeadsLog = Yup.object().shape({
    task_type: Yup.string().required('Select task type'),
    log_type: Yup.string().required('Select log type'),
    details: Yup.string().required('Details is required'),
    assigned_to: Yup.array()
        .of(Yup.string().required('Each Assign user must be a valid user')) // Ensure each element is a valid string
        .min(1, 'At least one assign user is required') // Ensure at least one BDE user is selected
        .required('Assign user is Required'),
    logAssignRole: Yup.string().required('Role is required'),
    // focus_segment: Yup.string().required('Select focus segment'),
    // primary_contact: Yup.string().required('Select primary contact'),
});

export const CreateLeadStatus = Yup.object().shape({
    name: Yup.string().required('Name is Required'),
});

export const CreateContactStatus = Yup.object().shape({
    status: Yup.string().required('Name is Required'),
});

export const Createdepartments = Yup.object().shape({
    department: Yup.string().required('Name is Required'),
});

export const CreateQualification = Yup.object().shape({
    qualification: Yup.string().required('Qualification is Required'),
});

export const CreateCollege = Yup.object().shape({
    name: Yup.string().required('College name is required'),
    location: Yup.string().required('Location is required'),
    phone: Yup.string().required('Phone number is required'),

    website: Yup.string().url('Please enter a valid URL').required('Website is required'),
   
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
});

export const CreateCountries = Yup.object().shape({
    country_name: Yup.string().required('Country is Required'),
});

export const CreateCity = Yup.object().shape({
    city_name: Yup.string().required('City is Required'),
    state: Yup.string().required('State is Required'),
});
export const Createsources = Yup.object().shape({
    source: Yup.string().required('Name is Required'),
});
export const Createsalutation = Yup.object().shape({
    salutation: Yup.string().required('Value is Required'),
});

export const Createleadsourcefrom = Yup.object().shape({
    source_from: Yup.string().required('Value is Required'),
});

export const CreateStates = Yup.object().shape({
    state_name: Yup.string().required('State name is Required'),
    country: Yup.string().required('Country is Required'),
});

export const Createverticals = Yup.object().shape({
    vertical: Yup.string().required('Name is Required'),
});

export const Createfocussegment = Yup.object().shape({
    vertical: Yup.string().required('Verical is Required'),
    focus_segment: Yup.string().required('Name is Required'),
});

export const Createmarketsegmant = Yup.object().shape({
    market_segment: Yup.string().required('Value is Required'),
});

export const Createtags = Yup.object().shape({
    tag: Yup.string().required('Name is Required'),
});

export const Createstages = Yup.object().shape({
    stage: Yup.string().required('Name is Required'),
    // probability: Yup.number().required('Value is Required'),
});

export const Createlogstage = Yup.object().shape({
    stage: Yup.string().required('Value is Required'),
});

export const Createbdmteam = Yup.object().shape({
    bdm_user: Yup.string().required('BDM user is Required'), // Single string for BDM user
    bde_user: Yup.array()
        .of(Yup.string().required('Each BDE user must be a valid user')) // Ensure each element is a valid string
        .min(1, 'At least one BDE user is required') // Ensure at least one BDE user is selected
        .required('BDE user is Required'), // Ensure that the array is not empty
});

export const CreateLeadSourceCategory = Yup.object().shape({
    name: Yup.string().required('Name is Required'),
    // probability: Yup.number().required('Value is Required'),
});

export const CreateTarget = Yup.object().shape({
    user: Yup.string().required('User is Required'),
    // month: Yup.string().required('Month / Year is Required'),
    // role: Yup.string().required('Role is Required'),
    target_amount: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .required('Target amount is required')
        .min(1, 'Target amount must be greater than 0')
        .nullable(),
});

export const createUser = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().required('Email is required').email('Invalid email format'),
    password: Yup.string().required('Password is required').min(8, 'Min 8 Character'),
    phone_number: Yup.string().required('Phone Number is required'),
});

export const updateUser = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string().required('Email is required').email('Invalid email format'),
    phone_number: Yup.string().required('Phone Number is required'),
});

export const CreateProgramme = Yup.object().shape({
    college: Yup.string().required('College is required'),
    name: Yup.string().required('Programme name is required'),
    course_code: Yup.string().required('Course code is required'),
    duration_in_months: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .required('Duration is required')
        .positive('Duration must be greater than 0')
        .integer('Duration must be a whole number')
        .nullable(),
    fee_amount: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .required('Fees is required')
        .positive('Fees must be greater than 0')
        .nullable(),
});

// =============================================================================
// KAHE MASTERS VALIDATIONS
// =============================================================================

// 1. Admission Stage Validation
export const admissionStageValidation = Yup.object().shape({
    name: Yup.string().trim().required('Please enter admission stage name'),
    code: Yup.string().trim().required('Please enter stage code (e.g. DOC_VERIF)'),
    category: Yup.string().required('Please select a desk / phase'),
    sequence: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .typeError('Sequence must be a positive number')
        .min(1, 'Sequence must be a positive number')
        .required('Sequence must be a positive number'),
});
export const admission_stage = admissionStageValidation;

// 2. Institution Validation
export const institutionValidation = Yup.object().shape({
    name: Yup.string().trim().required('Please enter institution full name'),
    short_code: Yup.string().trim().required('Please enter institution acronym (e.g. KAHE)'),
    type: Yup.string().required('Please select institution type'),
    campus: Yup.string().trim().required('Please enter campus location / locality'),
    total_programs: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .typeError('Total programs must be a number')
        .min(1, 'Total programs must be at least 1')
        .required('Total programs must be at least 1'),
});
export const institutions = institutionValidation;

// 3. Course Validation
export const courseValidation = Yup.object().shape({
    name: Yup.string().trim().required('Please enter degree or course full name'),
    code: Yup.string().trim().required('Please enter course code (e.g. BE-CSE)'),
    degree_level: Yup.string().required('Please select degree level'),
    institution: Yup.string().required('Please select constituent college'),
    duration: Yup.string().trim().required('Please specify study duration'),
    total_intake: Yup.number()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .typeError('Total intake must be a number')
        .min(1, 'Total intake seats must be at least 1')
        .required('Total intake seats must be at least 1'),
});
export const courses = courseValidation;

// 4. Academic Year Validation
export const academicYearValidation = Yup.object().shape({
    year_name: Yup.string().trim().required('Please enter tenure label (e.g. 2026-2027)'),
    code: Yup.string().trim().required('Please enter session code (e.g. AY2026)'),
    cycle_status: Yup.string().required('Please select admission lifecycle status'),
    start_date: Yup.string().required('Please select academic year start date'),
    end_date: Yup.string().required('Please select academic year end date'),
});
export const academic_years = academicYearValidation;

// 5. WhatsApp Template Validation
export const whatsappTemplateValidation = Yup.object().shape({
    title: Yup.string().trim().required('Please enter template name'),
    code: Yup.string().trim().required('Please enter Meta template code (e.g. kahe_enq_ack)'),
    category: Yup.string().required('Please select messaging category'),
    trigger_stage: Yup.string().required('Please select trigger pipeline stage'),
    language: Yup.string().required('Please select message language'),
});
export const whatsapp_templates = whatsappTemplateValidation;

// 6. Qualification Validation
export const qualificationValidation = Yup.object().shape({
    name: Yup.string().trim().required('Please enter qualification title (e.g. 12th / HSC)'),
    stream_type: Yup.string().trim().required('Please enter stream / subject group (e.g. Science PCM)'),
    target_level: Yup.string().required('Please select qualification level'),
    min_eligibility: Yup.string().trim().required('Please enter minimum eligibility criteria'),
});
export const qualifications = qualificationValidation;

// 7. Call Outcome Validation
export const callOutcomeValidation = Yup.object().shape({
    outcome_name: Yup.string().trim().required('Please enter outcome label (e.g. Interested in Campus Visit)'),
    sentiment: Yup.string().required('Please select response sentiment'),
    suggested_next_action: Yup.string().trim().required('Please describe the mandatory next action'),
});
export const call_outcomes = callOutcomeValidation;

// 8. Reference Type Validation
export const referenceTypeValidation = Yup.object().shape({
    source_name: Yup.string().trim().required('Please enter lead source name'),
    channel: Yup.string().required('Please select acquisition channel'),
    tracking_tag: Yup.string().trim().required('Please enter UTM or tracking tag (e.g. meta_fb_2026)'),
});
export const reference_types = referenceTypeValidation;

// 9. CRM Staff & User Roles Validation
export const crmUserValidation = Yup.object().shape({
    fullName: Yup.string().trim().required('Please enter staff full name'),
    assignedRole: Yup.string().required('Please select assigned role'),
    mobileNumber: Yup.string()
        .trim()
        .required('Please enter mobile number')
        .test('valid-mobile', 'Please enter a valid 10-digit mobile number', (val) => {
            if (!val) return false;
            const clean = val.replace(/[^0-9]/g, '');
            return clean.length >= 10;
        }),
    institutionalEmail: Yup.string()
        .trim()
        .required('Please enter institutional email')
        .email('Please enter a valid email format'),
});
export const crm_users = crmUserValidation;


