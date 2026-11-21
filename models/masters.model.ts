import instance from '@/utils/axios.utils';
import initialMastersData from '@/data/mastersSampleData.json';
import initialStaffData from '@/data/crmStaffSampleData.json';

// In-memory persistent sample store (allows live frontend interactions like add, update, delete, status toggle)
const sampleStore: Record<string, any[]> = {
    admission_stage: [...(initialMastersData.admission_stages || [])],
    institutions: [...(initialMastersData.institutions || [])],
    courses: [...(initialMastersData.courses || [])],
    academic_years: [...(initialMastersData.academic_years || [])],
    whatsapp_templates: [...(initialMastersData.whatsapp_templates || [])],
    qualifications: [...(initialMastersData.qualifications || [])],
    call_outcomes: [...(initialMastersData.call_outcomes || [])],
    reference_types: [...(initialMastersData.reference_types || [])],
    crm_users: [...(initialStaffData || [])],
};

// Generic sample filter helper
const filterSampleRecords = (records: any[], params: any = {}) => {
    let result = [...records];

    // Search query
    if (params?.search && String(params.search).trim()) {
        const query = String(params.search).toLowerCase().trim();
        result = result.filter((item) => {
            return Object.values(item).some((val) => {
                if (typeof val === 'string' || typeof val === 'number') {
                    return String(val).toLowerCase().includes(query);
                }
                return false;
            });
        });
    }

    // Category / Desk / Stream filter
    if (params?.category && String(params.category).trim() && !String(params.category).startsWith('All')) {
        const cat = String(params.category).toLowerCase().trim();
        result = result.filter((item) => {
            const itemCat = String(
                item.category ||
                item.type ||
                item.level ||
                item.target_level ||
                item.sentiment ||
                item.channel ||
                ''
            ).toLowerCase().trim();
            return itemCat === cat;
        });
    }

    // Role filter (specifically for CRM staff)
    if (params?.role && String(params.role).trim() && !String(params.role).startsWith('All')) {
        const role = String(params.role).toLowerCase().trim();
        result = result.filter((item) => String(item.role || '').toLowerCase().trim() === role);
    }

    // Status filter
    if (params?.status && String(params.status).trim() && !String(params.status).startsWith('All')) {
        const status = String(params.status).toLowerCase().trim();
        result = result.filter((item) => String(item.status || '').toLowerCase().trim() === status);
    }

    const total = result.length;
    const page = Number(params?.page) || 1;
    const pageSize = Number(params?.page_size) || 10;
    const startIndex = (page - 1) * pageSize;
    const paginated = result.slice(startIndex, startIndex + pageSize);

    return {
        data: paginated,
        total_records: total,
        count: total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize) || 1,
    };
};

// Master API Generator for each master entity
const createMasterApi = (entityKey: string, endpoint: string) => {
    return {
        /**
         * 1. LIST API: GET endpoint with query parameters (search, category, status, page, page_size)
         */
        list: (params: any = {}) => {
            return new Promise((resolve) => {
                const query = new URLSearchParams();
                if (params && typeof params === 'object') {
                    Object.keys(params).forEach((key) => {
                        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                            query.append(key, String(params[key]));
                        }
                    });
                }
                const queryString = query.toString();
                const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

                instance()
                    .get(url)
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch(() => {
                        // Sample fallback ensuring zero crashes if backend endpoint is unavailable
                        const sampleRes = filterSampleRecords(sampleStore[entityKey] || [], params);
                        resolve({
                            status: 200,
                            message: 'Success (Sample API Response)',
                            ...sampleRes,
                        });
                    });
            });
        },

        /**
         * 2. ADD / CREATE API: POST new record
         */
        add: (data: any) => {
            return new Promise((resolve) => {
                const url = endpoint;
                instance()
                    .post(url, data)
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch(() => {
                        // Sample fallback: insert at front of store
                        const newId = data.id || `${entityKey.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
                        const created = { id: newId, status: 'Active', ...data };
                        sampleStore[entityKey] = [created, ...(sampleStore[entityKey] || [])];
                        resolve({
                            status: 201,
                            message: 'Record created successfully (Sample API)',
                            data: created,
                        });
                    });
            });
        },

        /**
         * 3. UPDATE API: PATCH / PUT record by ID
         */
        update: (id: string | number, data: any) => {
            return new Promise((resolve) => {
                const url = `${endpoint}${id}/`;
                instance()
                    .patch(url, data)
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch(() => {
                        // Sample fallback: update item in store
                        sampleStore[entityKey] = (sampleStore[entityKey] || []).map((item) =>
                            String(item.id) === String(id) ? { ...item, ...data } : item
                        );
                        resolve({
                            status: 200,
                            message: 'Record updated successfully (Sample API)',
                            data,
                        });
                    });
            });
        },

        /**
         * 4. ACTIVE / DEACTIVE API: Toggle status of record
         */
        active_deactive: (id: string | number, status?: string) => {
            return new Promise((resolve) => {
                const current = (sampleStore[entityKey] || []).find((item) => String(item.id) === String(id));
                const nextStatus = status || (current?.status === 'Active' ? 'Inactive' : 'Active');
                const url = `${endpoint}${id}/status/`;

                instance()
                    .patch(url, { status: nextStatus })
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch(() => {
                        sampleStore[entityKey] = (sampleStore[entityKey] || []).map((item) =>
                            String(item.id) === String(id) ? { ...item, status: nextStatus } : item
                        );
                        resolve({
                            status: 200,
                            message: `Record ${nextStatus === 'Active' ? 'activated' : 'deactivated'} successfully (Sample API)`,
                            status_value: nextStatus,
                        });
                    });
            });
        },

        /**
         * 5. DELETE API: Remove record by ID
         */
        delete: (id: string | number) => {
            return new Promise((resolve) => {
                const url = `${endpoint}${id}/`;
                instance()
                    .delete(url)
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch(() => {
                        sampleStore[entityKey] = (sampleStore[entityKey] || []).filter(
                            (item) => String(item.id) !== String(id)
                        );
                        resolve({
                            status: 200,
                            message: 'Record deleted successfully (Sample API)',
                        });
                    });
            });
        },

        /**
         * 6. GET API: Retrieve single record details by ID
         */
        get: (id: string | number) => {
            return new Promise((resolve, reject) => {
                const url = `${endpoint}${id}/`;
                instance()
                    .get(url)
                    .then((res) => {
                        resolve(res.data);
                    })
                    .catch(() => {
                        const item = (sampleStore[entityKey] || []).find((rec) => String(rec.id) === String(id));
                        if (item) {
                            resolve({
                                status: 200,
                                data: item,
                            });
                        } else {
                            reject(new Error('Record not found'));
                        }
                    });
            });
        },
    };
};

const masters = {
    admission_stage: createMasterApi('admission_stage', 'crm/admission-stages/'),
    institutions: createMasterApi('institutions', 'crm/institutions/'),
    courses: createMasterApi('courses', 'crm/courses/'),
    academic_years: createMasterApi('academic_years', 'crm/academic-years/'),
    whatsapp_templates: createMasterApi('whatsapp_templates', 'crm/whatsapp-templates/'),
    qualifications: createMasterApi('qualifications', 'crm/qualifications/'),
    call_outcomes: createMasterApi('call_outcomes', 'crm/call-outcomes/'),
    reference_types: createMasterApi('reference_types', 'crm/reference-types/'),
    crm_users: createMasterApi('crm_users', 'crm/staff-users/'),
};

export default masters;
