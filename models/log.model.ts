import instance from '@/utils/axios.utils';

const log = {
    list: (page) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/logs/?page=${page}&page_size=10`;
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

    listByLeadId: (id, log_type = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/logs/?college_lead=${id}`;

            if (log_type == 'include_opportunity') {
                url += `&moduletype=${encodeURIComponent(true)}`;
            } else {
                if (log_type) {
                    url += `&log_type=${encodeURIComponent(log_type)}`;
                }
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

    logStage: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `log_stages/`;
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

    create: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/logs/`;
            instance()
                .post(url, data)
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

    update: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/logs/${id}/`;

            instance()
                .put(url, data)
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

    delete: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/logs/${id}/`;

            instance()
                .put(url)
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

    details: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `contactdetails/${id}/`;
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

    dropdowns: (type) => {
        let promise = new Promise((resolve, reject) => {
            let url = `contact-dropdown/?type=${type}`;
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
};

export default log;
