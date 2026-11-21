import instance from '@/utils/axios.utils';

const user = {
    userList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/users/?exclude_admin=true&page=${page}`;
            if (body?.group) {
                url += `&group=${encodeURIComponent(body.group)}`;
            }

            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
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

    includeAdminuserList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/users/?page=${page}`;
            if (body?.group) {
                url += `&group=${encodeURIComponent(body.group)}`;
            }

            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }

            if (body?.exclude_admin == 'Yes') {
                url += `&exclude_admin=${encodeURIComponent(true)}`;
            }

             if (body?.show_admins_only == 'Yes') {
                url += `&show_admins_only=${encodeURIComponent(true)}`;
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

    updateUser: (data: any, id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/users/${id}/`;
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

    addUser: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = 'auth/users/';
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

    getUserId: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/users/${id}/`;
            instance()
                .post(url)
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

    deleteUser: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `auth/users/${id}/`;
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

    uploadFile: (file: any) => {
        let promise = new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            let url = '/hdd/upload_file';
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data; charset=utf-8;',
                },
            };
            instance()
                .post(url, formData, config)
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

export default user;
