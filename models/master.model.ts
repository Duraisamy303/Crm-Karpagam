import instance from '@/utils/axios.utils';

const master = {
    college_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/colleges?page=${page}&page_size=10`;
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

    create_college: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/colleges/`;
            instance()
                .post(url, body)
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

    update_college: (body, id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/colleges/${id}/`;
            instance()
                .patch(url, body)
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

    delete_college: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/colleges/${id}/`;

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

    course_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/courses/?page=${page}&page_size=10`;
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

    create_course: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/courses/`;
            instance()
                .post(url, body)
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

    update_course: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/courses/${id}/`;

            instance()
                .patch(url, data)
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

    delete_course: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/courses/${id}/`;
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

    lead_cat_List: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/lead-source-categories/?page=${page}&page_size=50`;
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

    create_lead_cat: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/lead-source-categories/`;
            instance()
                .post(url, body)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response?.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    update_lead_cat: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/lead-source-categories/${id}/`;

            instance()
                .patch(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    if (error.response) {
                        reject(error.response.data?.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    delete_lead_cat: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/lead-source-categories/${id}/`;
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

    lead_education_qua: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/education-qualifications/?page=${page}&page_size=10`;
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

    create_education_qua: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/education-qualifications/`;
            instance()
                .post(url, body)
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

    update_education_qua: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/education-qualifications/${id}/`;

            instance()
                .patch(url, data)
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

    delete_education_qua: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/education-qualifications/${id}/`;
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

    //------- contact status start
    lead_status_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/status/?is_active=true&page=${page}&page_size=10`;
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

    create_lead_status: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/status/`;
            instance()
                .post(url, body)
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

    update_lead_status: (id, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/status/${id}/`;

            instance()
                .patch(url, body)
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

    delete_lead_status: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/status/${id}/`;
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

    contact_status_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/contact-status/?page=${page}&page_size=10`;
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

    create_contact_status: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/contact-status/`;
            instance()
                .post(url, body)
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

    update_contact_status: (id, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/contact-status/${id}/`;

            instance()
                .patch(url, body)
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

    delete_contact_status: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/contact-status/${id}/`;
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

    country_list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/countries/?page=${page}&page_size=10`;
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

    create_country: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/countries/`;
            instance()
                .post(url, body)
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

    update_country: (id, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/countries/${id}/`;

            instance()
                .patch(url, body)
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

    delete_country: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/countries/${id}/`;

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

    state_list: (countryId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/states/?country=${countryId}`;
            instance()
                .get(url)
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

    master_state_list: (countryId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/states/`;
            instance()
                .get(url)
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

    create_state: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/states/`;
            instance()
                .post(url, body)
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

    update_state: (id, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/states/${id}/`;

            instance()
                .patch(url, body)
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

    delete_state: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/states/${id}/`;

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

    city_list: (stateId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/cities/?state=${stateId}`;
            instance()
                .get(url)
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

    master_city_list: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/cities/`;
            instance()
                .get(url)
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

    create_city: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/cities/`;
            instance()
                .post(url, body)
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

    update_city: (id, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/cities/${id}/`;
            instance()
                .patch(url, body)
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

    delete_city: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/cities/${id}/`;

            instance()
                .delete(url)
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

    //------- contact status start
};
export default master;
