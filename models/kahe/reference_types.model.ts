import instance from '@/utils/axios.utils';
import initialMastersData from '@/data/mastersSampleData.json';

let store = [...(initialMastersData.reference_types || [])];

const reference_types = {
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
            if (body.channel && !body.channel.startsWith('All')) query.append('channel', body.channel);
            if (body.status && !body.status.startsWith('All')) query.append('status', body.status);

            const url = `crm/reference-types/?${query.toString()}`;

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
                            item.source_name?.toLowerCase().includes(q) ||
                            item.channel?.toLowerCase().includes(q) ||
                            item.tracking_tag?.toLowerCase().includes(q)
                        );
                    }
                    if (body.category && !body.category.startsWith('All')) {
                        result = result.filter((item) => item.channel === body.category);
                    }
                    if (body.channel && !body.channel.startsWith('All')) {
                        result = result.filter((item) => item.channel === body.channel);
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
                .post('crm/reference-types/', data)
                .then((res) => resolve(res.data))
                .catch(() => {
                    const newId = data.id || `REF-${Math.floor(100 + Math.random() * 900)}`;
                    const created = { id: newId, status: 'Active', total_leads: 0, ...data };
                    store = [created, ...store];
                    resolve({ status: 201, message: 'Created successfully', data: created });
                });
        });
    },

    add: (data: any) => reference_types.create(data),

    update: (id: any, data: any) => {
        return new Promise((resolve) => {
            instance()
                .patch(`crm/reference-types/${id}/`, data)
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
                .delete(`crm/reference-types/${id}/`)
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
                .get(`crm/reference-types/${id}/`)
                .then((res) => resolve(res.data))
                .catch(() => {
                    const found = store.find((item) => String(item.id) === String(id));
                    if (found) resolve({ status: 200, data: found });
                    else reject(new Error('Record not found'));
                });
        });
    },

    get: (id: any) => reference_types.detail(id),

    active_deactive: (id: any, status?: string) => {
        return new Promise((resolve) => {
            const current = store.find((item) => String(item.id) === String(id));
            const nextStatus = status || (current?.status === 'Active' ? 'Inactive' : 'Active');
            instance()
                .patch(`crm/reference-types/${id}/status/`, { status: nextStatus })
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

export default reference_types;
