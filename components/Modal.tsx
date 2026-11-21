import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import IconX from './Icon/IconX';

export default function Modal(props: any) {
    const { open, close, renderComponent, edit, addHeader, updateHeader, subTitle, isFullWidth } = props;
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" open={open} onClose={() => close()} className="relative z-50">
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-[black]/60" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className={`panel w-full ${isFullWidth ? '' : 'max-w-lg'} overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark `}>
                                <button type="button" onClick={() => close()} className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 dark:hover:text-gray-600 ltr:right-4 rtl:left-4">
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-2 text-lg font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">{edit ? updateHeader : addHeader}</div>
                                {subTitle && <div className="bg-[#fbfbfb]  text-sm font-medium dark:bg-[#121c2c] ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5">{subTitle}</div>}
                                {renderComponent()}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
