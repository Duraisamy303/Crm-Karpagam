import auth from '@/models/auth.model';
import contact from '@/models/contact.model';
import lead from '@/models/lead.model';
import opportunity from '@/models/opportunity.model';
import master from '@/models/master.model';
import masters from '@/models/masters.model';
import test from '@/models/test.model';
import user from '@/models/user.model';
import task from '@/models/task.model';
import report from '@/models/report.model';
import log from '@/models/log.model';
import notication from '@/models/notification.model';
import bulkimport from '@/models/kahe/bulkimport.model';
import city from '@/models/kahe/city.model';
import tellecaller from '@/models/kahe/tellecaller.model';
import admission_stage from '@/models/kahe/admission_stage.model';
import institutions from '@/models/kahe/institutions.model';
import courses from '@/models/kahe/courses.model';
import academic_years from '@/models/kahe/academic_years.model';
import whatsapp_templates from '@/models/kahe/whatsapp_templates.model';
import qualifications from '@/models/kahe/qualifications.model';
import call_outcomes from '@/models/kahe/call_outcomes.model';
import reference_types from '@/models/kahe/reference_types.model';

export const Models = {
    auth,
    test,
    user,
    contact,
    lead,
    opportunity,
    master,
    masters,
    task,
    report,
    log,
    notication,
    notification: notication,

    // kahe
    bulkimport,
    city,
    tellecaller,

    // kahe masters
    admission_stage,
    institutions,
    courses,
    academic_years,
    whatsapp_templates,
    qualifications,
    call_outcomes,
    reference_types,
};

export const Model = Models;

export default Models;
