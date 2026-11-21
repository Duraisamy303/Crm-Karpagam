import IconMenu from '@/components/Icon/IconMenu';
import Link from 'next/link';
import React, { useState } from 'react';
import SideMenu from './sideMenu';

export default function Test() {
    const [open, setOpen] = useState(false);
    return (
        <div className="flex justify-end shadow-sm">
            <div className="relative flex h-[100vh] w-[70px] items-center bg-white px-5 py-2.5 dark:bg-black">
                <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
                    <Link href="/" className="main-logo flex shrink-0 items-center">
                        <img className="inline w-8 ltr:-ml-1 rtl:-mr-1" src="/assets/images/kahe-logo.png" alt="logo" />
                    </Link>
                </div>

                <div className="absolute right-5 flex flex-col items-center space-y-2">
                    <button
                        type="button"
                        className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary"
                        onClick={() => setOpen(true)}
                    >
                        <IconMenu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
