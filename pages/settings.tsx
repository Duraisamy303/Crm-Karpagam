import { PrivateRouter } from '@/utils/imports.utils';
import React from 'react';

const Settings = () => {
    return (
        <div className="panel mb-5 flex items-center justify-between gap-5">
            <div className="flex items-center gap-5">
                <h5 className="text-lg font-semibold dark:text-white-light">Settings</h5>
            </div>
            <div className="flex gap-5">
                <button type="button" className="btn btn-primary  w-full md:mb-0 md:w-auto" onClick={() => window.open('/apps/product/add', '_blank')}>
                    + Create
                </button>
            </div>
        </div>
    );
};

export default PrivateRouter(Settings);
