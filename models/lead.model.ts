import instance from '@/utils/axios.utils';

const lead = {
    list: (body = null, page, userId = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/college-leads/?page=${page}&page_size=10`;

            if (body?.userId) {
                url += `&user_id=${encodeURIComponent(body?.userId)}`;
            }

            if (body?.exclude_all_leads == 'Yes') {
                url += `&exclude_all_leads=${encodeURIComponent(true)}`;
            }

            
            if (body?.my_leads == 'Yes') {
                url += `&my_leads=${encodeURIComponent(true)}`;
            }

            if (body?.assigned_leads == 'Yes') {
                url += `&assigned_leads=${encodeURIComponent(true)}`;
            }

            if (body?.team == 'Yes') {
                url += `&teams=${encodeURIComponent(true)}`;
            }
            if (body?.search) {
                url += `&search=${encodeURIComponent(body?.search)}`;
            }
            if (body?.status) {
                url += `&stage=${encodeURIComponent(body?.status)}`;
            }
            if (body?.from_date) {
                url += `&created_at_after=${encodeURIComponent(body?.from_date)}`;
            }
            if (body?.end_date) {
                url += `&created_at_before=${encodeURIComponent(body?.end_date)}`;
            }

            if (body?.lead_source) {
                url += `&lead_source=${encodeURIComponent(body?.lead_source)}`;
            }

            if (body?.lead_source_category) {
                url += `&lead_source_category=${encodeURIComponent(body?.lead_source_category)}`;
            }
            if(body.ordering){
                url += `&ordering=${encodeURIComponent(body.ordering)}`;
            }

            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    filter: (body: any, page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/college-leads/?page=${page}&page_size=10`;

            if (body.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }
            if (body.lead_source) {
                url += `&lead_source=${encodeURIComponent(body.lead_source)}`;
            }
            if (body.opportunity) {
                url += `&opportunity=${encodeURIComponent(body.opportunity)}`;
            }
            if (body.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            }
            if (body.status) {
                url += `&lead_status=${encodeURIComponent(body.status)}`;
            }
            if (body.from_date) {
                url += `&from_date=${encodeURIComponent(body.from_date)}`;
            }
            if (body.end_date) {
                url += `&to_date=${encodeURIComponent(body.end_date)}`;
            }

            if (body.bdm) {
                url += `&bdm=${encodeURIComponent(body.bdm)}`;
            }
            if (body.bde) {
                url += `&bde=${encodeURIComponent(body.bde)}`;
            }
            if (body.dm) {
                url += `&created_by=${encodeURIComponent(body.dm)}`;
            }
            if (body.tm) {
                url += `&created_by=${encodeURIComponent(body.tm)}`;
            }
            if (body.filterCard1) {
            }
            if (body.filterCard2) {
            }
            instance()
                .get(url, body)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    create: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/college-leads/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response.data.company_name) {
                        reject(error.response.data.company_name[0]);
                    } else if (error.response.data.email_id) {
                        reject(error.response.data.email_id[0]);
                    } else if (error.response.data.phone_number) {
                        reject(error.response.data.phone_number[0]);
                    } else if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    update: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/college-leads/${id}/`;

            instance()
                .patch(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response.data.company_name) {
                        reject(error.response.data.company_name[0]);
                    } else if (error.response) {
                        reject(error.response.data.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    details: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/college-leads/${id}/`;

            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    delete: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/college-leads/${id}/`;

            instance()
                .delete(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    dashbaord: (body = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/dashboard/`;

            const hasParams = body?.userId || body?.team == 'Yes';
            let firstParam = true;

            if (body?.userId) {
                url += `?user_id=${encodeURIComponent(body?.userId)}`;
                firstParam = false;
            }
         
            if (body?.team == 'Yes') {
                url += `${firstParam ? '?' : '&'}team=${encodeURIComponent(true)}`;
            }

            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },


    cart_count: (body = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/lead-counts/`;

            let firstParam = true;

            if (body?.userId) {
                url += `?user_id=${encodeURIComponent(body?.userId)}`;
                firstParam = false;
            }
            if (body?.my_leads == 'Yes') {
                url += `${firstParam ? '?' : '&'}my_leads=${encodeURIComponent(true)}`;
                firstParam = false;
            }

            if (body?.assigned_leads == 'Yes') {
                url += `${firstParam ? '?' : '&'}assigned_leads=${encodeURIComponent(true)}`;
                firstParam = false;
            }

            if (body?.team == 'Yes') {
                url += `${firstParam ? '?' : '&'}teams=${encodeURIComponent(true)}`;
                firstParam = false;
            }
            if (body?.search) {
                url += `${firstParam ? '?' : '&'}search=${encodeURIComponent(body?.search)}`;
                firstParam = false;
            }
            if (body?.status) {
                url += `${firstParam ? '?' : '&'}stage=${encodeURIComponent(body?.status)}`;
                firstParam = false;
            }
            if (body?.from_date) {
                url += `${firstParam ? '?' : '&'}created_at_after=${encodeURIComponent(body?.from_date)}`;
                firstParam = false;
            }
            if (body?.end_date) {
                url += `${firstParam ? '?' : '&'}created_at_before=${encodeURIComponent(body?.end_date)}`;
                firstParam = false;
            }

            if (body?.lead_source) {
                url += `${firstParam ? '?' : '&'}lead_source=${encodeURIComponent(body?.lead_source)}`;
                firstParam = false;
            }

            if (body?.lead_source_category) {
                url += `${firstParam ? '?' : '&'}lead_source_category=${encodeURIComponent(body?.lead_source_category)}`;
                firstParam = false;
            }
            if (body?.exclude_all_leads == 'Yes') {
                url += `&exclude_all_leads=${encodeURIComponent(true)}`;
            }


            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.message);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

   
};

export default lead;
