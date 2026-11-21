import instance from '@/utils/axios.utils';
import initialMastersData from '@/data/mastersSampleData.json';

let store = [...(initialMastersData.qualifications || [])];

const qualifications = {
    list: (pageOrParams?: any, maybeBody?: any) => {
        return new Promise((resolve) => {
            let page = 1;
            let body: any = {};
            if (typeof pageOrParams === 'number') {
                page = pageOrParams;
                body = maybeBody || {};
            } else if (typeof pageOrParams === 'object') {
                body = pageOrParams || {};
                page = Number(body.page) || 1;
            }

            const pageSize = Number(body.page_size || body.limit) || 10;
            const query = new URLSearchParams();
            query.append('page', String(page));
            query.append('page_size', String(pageSize));
            if (body.search) query.append('search', body.search);
            if (body.category && !body.category.startsWith('All')) query.append('category', body.category);
            if (body.stream_type && !body.stream_type.startsWith('All')) query.append('stream_type', body.stream_type);
            if (body.target_level && !body.target_level.startsWith('All')) query.append('target_level', body.target_level);
            if (body.status && !body.status.startsWith('All')) query.append('status', body.status);

            const url = `crm/qualifications/?${query.toString()}`;

            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch(() => {
                    let result = [...store];
                    if (body.search && String(body.search).trim()) {
                        const q = String(body.search).toLowerCase().trim();
                        result = result.filter((item) =>
                            item.name?.toLowerCase().includes(q) ||
                            item.stream_type?.toLowerCase().includes(q) ||
                            item.target_level?.toLowerCase().includes(q)
                        );
                    }
                    if (body.category && !body.category.startsWith('All')) {
                        result = result.filter((item: any) => item.stream_type === body.category || item.target_level === body.category);
                    }
                    if (body.stream_type && !body.stream_type.startsWith('All')) {
                        result = result.filter((item) => item.stream_type === body.stream_type);
                    }
                    if (body.target_level && !body.target_level.startsWith('All')) {
                        result = result.filter((item) => item.target_level === body.target_level);
                    }
                    if (body.status && !body.status.startsWith('All')) {
                        result = result.filter((item) => item.status === body.status);
                    }
                    const total = result.length;
                    const startIndex = (page - 1) * pageSize;
                    const paginated = result.slice(startIndex, startIndex + pageSize);

                    resolve({
                        status: 200,
                        data: paginated,
                        results: paginated,
                        total_records: total,
                        count: total,
                        page,
                        page_size: pageSize,
                        total_pages: Math.ceil(total / pageSize) || 1,
                    });
                });
        });
    },

    create: (data: any) => {
        return new Promise((resolve) => {
            instance()
                .post('crm/qualifications/', data)
                .then((res) => resolve(res.data))
                .catch(() => {
                    const newId = data.id || `QUAL-${Math.floor(100 + Math.random() * 900)}`;
                    const created = { id: newId, status: 'Active', students_registered: 0, ...data };
                    store = [created, ...store];
                    resolve({ status: 201, message: 'Created successfully', data: created });
                });
        });
    },

    add: (data: any) => qualifications.create(data),

    update: (id: any, data: any) => {
        return new Promise((resolve) => {
            instance()
                .patch(`crm/qualifications/${id}/`, data)
                .then((res) => resolve(res.data))
                .catch(() => {
                    store = store.map((item) => (String(item.id) === String(id) ? { ...item, ...data } : item));
                    resolve({ status: 200, message: 'Updated successfully', data });
                });
        });
    },

    delete: (id: any) => {
        return new Promise((resolve) => {
            instance()
                .delete(`crm/qualifications/${id}/`)
                .then((res) => resolve(res.data))
                .catch(() => {
                    store = store.filter((item) => String(item.id) !== String(id));
                    resolve({ status: 200, message: 'Deleted successfully' });
                });
        });
    },

    detail: (id: any) => {
        return new Promise((resolve, reject) => {
            instance()
                .get(`crm/qualifications/${id}/`)
                .then((res) => resolve(res.data))
                .catch(() => {
                    const found = store.find((item) => String(item.id) === String(id));
                    if (found) resolve({ status: 200, data: found });
                    else reject(new Error('Record not found'));
                });
        });
    },

    get: (id: any) => qualifications.detail(id),

    active_deactive: (id: any, status?: string) => {
        return new Promise((resolve) => {
            const current = store.find((item) => String(item.id) === String(id));
            const nextStatus = status || (current?.status === 'Active' ? 'Inactive' : 'Active');
            instance()
                .patch(`crm/qualifications/${id}/status/`, { status: nextStatus })
                .then((res) => resolve(res.data))
                .catch(() => {
                    store = store.map((item) =>
                        String(item.id) === String(id) ? { ...item, status: nextStatus } : item
                    );
                    resolve({ status: 200, message: `Status updated to ${nextStatus}`, status_value: nextStatus });
                });
        });
    },
};

export default qualifications;
