import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import crmConfigSlice from './crmConfigSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    crmConfig:crmConfigSlice,
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
