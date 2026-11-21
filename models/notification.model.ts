import instance from '@/utils/axios.utils';

const notication = {
    list: (page, body) => {
        let promise = new Promise((resolve, reject) => {
            let url = `crm/notifications/?page=${page}&page_size=10`;
            if (body.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }
            if (body.type) {
                url += `&type=${encodeURIComponent(body.type)}`;
            }

            if (body.from_date) {
                url += `&created_at_after=${encodeURIComponent(body.from_date)}`;
            }

            if (body.end_date) {
                url += `&created_at_before=${encodeURIComponent(body.end_date)}`;
            }
            instance()
                .get(url, body)
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

export default notication;
