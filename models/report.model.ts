import instance from '@/utils/axios.utils';

const report = {
    adminCardData: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/target-analytics/analytics/`;
            let hasParams = false;

            if (body?.user_id) {
                url += `?user_id=${encodeURIComponent(body?.user_id)}`;
                hasParams = true;
            }

            if (body?.team == "Yes") {
                url += `${hasParams ? '&' : '?'}team=${encodeURIComponent(true)}`;
                hasParams = true;
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

    funnelCount: (data) => {
        let promise = new Promise((resolve, reject) => {
            let url = `countdetails/`;
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

    reportLead: (data) => {
        let promise = new Promise((resolve, reject) => {
            let url = `report_lead/`;
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

    reportStage: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `report_stage/`;
            instance()
                .post(url)
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

    reportOpportunity: (data) => {
        let promise = new Promise((resolve, reject) => {
            let url = `opportunity/chart/`;
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

    targetTeamCard: (body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `leads/annual-target-analytics/annual-analytics/?year_type=${body?.year_type}`;

            if (body?.user_id) {
                url += `&user_id=${encodeURIComponent(body?.user_id)}`;
            }

            if (body?.summary == 'Yes') {
                url += `&summary=${encodeURIComponent(true)}`;
            }

            if (body?.summary == 'No') {
                url += `&summary=${encodeURIComponent(false)}`;
            }

            if (body?.period) {
                url += `&period=${encodeURIComponent(body?.period)}`;
            }

            if( body?.team == "Yes"){
                url += `&team=${encodeURIComponent(true)}`;
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

export default report;
