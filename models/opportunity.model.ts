import instance from '@/utils/axios.utils';

const opportunity = {
    list: (id) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/opportunities/`;
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
            let url = `crm/opportunities/`;

            instance()
                .post(url, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Explicitly setting Content-Type for multipart form data
                    },
                })
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
            let url = `crm/opportunities/${id}/`;

            instance()
                .patch(url, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data', // Explicitly setting Content-Type for multipart form data
                    },
                })
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
            let url = `crm/opportunities/${id}/`;

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

    details: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/opportunities/${id}/`;
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


    listByLeadId: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/opportunities/?college_lead=${id}`;
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

export default opportunity;
