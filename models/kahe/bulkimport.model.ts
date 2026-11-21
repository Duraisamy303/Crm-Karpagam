import instance from '@/utils/axios.utils';

const bulkimport = {
    import: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `import_contacts/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    validate: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `validate_import/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    reimport: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `reimport_contacts/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    send_for_review: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `send_for_review/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    get_matching_student: (id: any, params: any = {}) => {
        let promise = new Promise((resolve, reject) => {
            let url = id ? `get_matching_student/${id}/` : `get_matching_student/`;
            instance()
                .get(url, { params })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    get_existing_student: (id: any, params: any = {}) => {
        let promise = new Promise((resolve, reject) => {
            let url = id ? `get_existing_student/${id}/` : `get_existing_student/`;
            instance()
                .get(url, { params })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    review_list: (params: any = {}) => {
        let promise = new Promise((resolve, reject) => {
            let url = `review_list/`;
            instance()
                .get(url, { params })
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    approve_new_student: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `approve_new_student/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    link_sibling: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `link_sibling/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    confirm_duplicate: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `confirm_duplicate/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    reject_import: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `reject_import/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },

    keep_pending: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `keep_pending/`;
            instance()
                .post(url, data)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    reject(error);
                });
        });
        return promise;
    },
};

export default bulkimport;
