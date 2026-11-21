import instance from '@/utils/axios.utils';

const task = {
    list: (body: any, page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/tasks/?page=${page}&page_size=10`;

            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }

            if (body?.my_tasks == 'Yes') {
                url += `&my_tasks=${encodeURIComponent(true)}`;
            }
            if (body?.assigned_tasks) {
                url += `&assigned_tasks=${encodeURIComponent(true)}`;
            }

            if (body?.exclude_all_tasks) {
                url += `&exclude_all_tasks=${encodeURIComponent(true)}`;
            }

            if (body?.team == 'Yes') {
                url += `&teams=${encodeURIComponent(true)}`;
            }

            if (body?.userId) {
                url += `&user_id=${encodeURIComponent(body?.userId)}`;
            }

            if (body?.task_date_time_after) {
                url += `&task_date_time_after=${encodeURIComponent(body.task_date_time_after)}`;
            }
            if (body?.task_date_time_before) {
                url += `&task_date_time_before=${encodeURIComponent(body.task_date_time_before)}`;
            }
            if (body?.exclude_user) {
                url += `&exclude_user=${encodeURIComponent(body?.exclude_user)}`;
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

    calendarTask: (body, myTask) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/calander_task/?`;

            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }

            if (body?.my_tasks == 'Yes') {
                url += `&my_tasks=${encodeURIComponent(true)}`;
            }
            if (body?.assigned_tasks) {
                url += `&assigned_tasks=${encodeURIComponent(true)}`;
            }

            if (body?.exclude_all_tasks) {
                url += `&exclude_all_tasks=${encodeURIComponent(true)}`;
            }

            if (body?.team == 'Yes') {
                url += `&teams=${encodeURIComponent(true)}`;
            }

            if (body?.userId) {
                url += `&user_id=${encodeURIComponent(body?.userId)}`;
            }

            if (body?.task_date_time_after) {
                url += `&task_date_time_after=${encodeURIComponent(body.task_date_time_after)}`;
            }
            if (body?.task_date_time_before) {
                url += `&task_date_time_before=${encodeURIComponent(body.task_date_time_before)}`;
            }

            if (body?.exclude_user) {
                url += `&exclude_user=${encodeURIComponent(body?.exclude_user)}`;
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



    assignlist: (body: any, page: any, userId: any = null) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/task/?page=${page}&page_size=10`;

            if (!userId && body.team) {
                if (body.team) {
                    url += `&team=${encodeURIComponent(body.team)}`;
                }
            }

            if (body?.contact) {
                url += `&contact=${encodeURIComponent(body.contact)}`;
            }

            // if (body?.assigned_by_me) {
            //     url += `&assigned_by_me=${encodeURIComponent(true)}`;
            // }
            // if (body?.assigned_to_me) {
            //     url += `&assigned_to_me=${encodeURIComponent(true)}`;
            // }

            // if (body?.assigned_to_me) {
            //     url += `&assigned_to_me=${encodeURIComponent(body.assigned_to_me)}`;
            // }

            if (body.bdm) {
                url += `&assigned_to=${encodeURIComponent(body.bdm)}`;
            } else if (body.bde) {
                url += `&assigned_to=${encodeURIComponent(body.bde)}`;
            } else if (body.dm) {
                url += `&assigned_to=${encodeURIComponent(body.dm)}`;
            } else if (body.tm) {
                url += `&assigned_to=${encodeURIComponent(body.tm)}`;
            } else if (body.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            } else if (userId) {
                url += `&assigned_to_me=${encodeURIComponent(true)}`;
            }

            if (body?.from_date_to_date_after) {
                url += `&from_date=${encodeURIComponent(body.from_date_to_date_after)}`;
            }
            if (body?.from_date_to_date_before) {
                url += `&to_date=${encodeURIComponent(body.from_date_to_date_before)}`;
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

    listFilterByDuration: (data, userId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `task/${userId}/`;
            instance()
                .post(url, data)
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
            let url = `crm/tasks/`;
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

    update: (data: any, taskId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/tasks/${taskId}/`;
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

    details: (taskId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/tasks/${taskId}/`;

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

    assignTo: (data: any, taskId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `task/${taskId}/assign/`;
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

    assigned_to: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/get_task_assinged_to/`;
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

    all_user: (body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/users/`;

            if (body.group) {
                url += `?group=${encodeURIComponent(body.group)}`;
            }
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

    reply_task_list: (body: any, page: any, taskId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/task/?page=${page}&page_size=10&has_reply=true&task=${taskId}`;
            if (body?.contact) {
                url += `&contact=${encodeURIComponent(body.contact)}`;
            }

            if (body?.assigned_by_me) {
                url += `&assigned_by_me=${encodeURIComponent(true)}`;
            }
            if (body?.assigned_to_me) {
                url += `&assigned_to_me=${encodeURIComponent(true)}`;
            }

            if (body?.from_date_to_date_after) {
                url += `&from_date=${encodeURIComponent(body.from_date_to_date_after)}`;
            }
            if (body?.from_date_to_date_before) {
                url += `&to_date=${encodeURIComponent(body.from_date_to_date_before)}`;
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

    get_reply_task_messages: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/task-conversations/?task=${id}`;
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

    reply_task: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/task-conversations/`;
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

    deleteCalenderTask: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/tasks/${id}/`;
            instance()
                .delete(url, id)
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

    deleteTask: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/tasks/${id}/`;
            instance()
                .delete(url, id)
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

    TaskListData: (body: any, page = 1, userId) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/task/?page=${page}&page_size=10`;

            if (!userId && body?.team) {
                if (body?.team) {
                    url += `&team=${encodeURIComponent(body.team)}`;
                }
            }

            if (body?.contact) {
                url += `&contact=${encodeURIComponent(body.contact)}`;
            }

            if (body?.assigned_by_me) {
                url += `&assigned_by_me=${encodeURIComponent(true)}`;
            }
            if (body?.assigned_to_me) {
                url += `&assigned_to_me=${encodeURIComponent(true)}`;
            }

            if (body?.created_by) {
                url += `&created_by=${encodeURIComponent(body.created_by)}`;
            }

            if (body?.bdm) {
                url += `&created_by=${encodeURIComponent(body.bdm)}`;
            } else if (body?.bde) {
                url += `&created_by=${encodeURIComponent(body.bde)}`;
            } else if (body?.dm) {
                url += `&created_by=${encodeURIComponent(body.dm)}`;
            } else if (body?.tm) {
                url += `&created_by=${encodeURIComponent(body.tm)}`;
            } else if (body?.assigned_to) {
                url += `&assigned_to=${encodeURIComponent(body.assigned_to)}`;
            } else if (userId) {
                url += `&created_by=${encodeURIComponent(userId)}`;
            }

            if (body?.from_date_to_date_after) {
                url += `&from_date=${encodeURIComponent(body.from_date_to_date_after)}`;
            }
            if (body?.from_date_to_date_before) {
                url += `&to_date=${encodeURIComponent(body.from_date_to_date_before)}`;
            }
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

export default task;
