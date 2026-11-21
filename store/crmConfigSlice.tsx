import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    leadId: '',
    oppId: '',
    leadIndex: '',
    contactIndex: '',
};

const crmConfigSlice = createSlice({
    name: 'crm',
    initialState: initialState,
    reducers: {
        leadId(state, { payload }) {
            state.leadId = payload;
        },
        oppId(state, { payload }) {
            state.oppId = payload;
        },
        leadIndex(state, { payload }) {
            state.leadIndex = payload;
        },
        contactIndex(state, { payload }) {
            state.contactIndex = payload;
        },
        resetAll(state) {
            state.leadId = '';
            state.oppId = '';
            state.leadIndex = '';
            state.contactIndex = '';
        },
    },
});

export const { leadId, oppId, leadIndex, contactIndex, resetAll } = crmConfigSlice.actions;

export default crmConfigSlice.reducer;
