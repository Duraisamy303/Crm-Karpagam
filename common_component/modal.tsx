import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import IconX from '@/components/Icon/IconX';

interface ModalProps {
    open?: boolean;
    show?: boolean;
    close?: () => void;
    setShow?: (val: boolean) => void;
    renderComponent?: () => React.ReactNode;
    children?: React.ReactNode;
    edit?: boolean;
    addHeader?: string | React.ReactNode;
    updateHeader?: string | React.ReactNode;
    title?: string | React.ReactNode;
    subTitle?: string;
    isFullWidth?: boolean;
    maxWidth?: string;
    height?: string | number;
}

export default function Modal(props: ModalProps) {
    const { edit, addHeader, updateHeader, title, subTitle, isFullWidth, maxWidth, height } = props;
    const isOpen = props.open !== undefined ? props.open : Boolean(props.show);
    const handleClose = () => {
        if (props.close) props.close();
        if (props.setShow) props.setShow(false);
    };
    const headerContent = edit ? updateHeader : addHeader || title;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={handleClose} className="relative z-50">
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
                            <Dialog.Panel
                                className={`panel w-full ${isFullWidth ? '' : (maxWidth || 'max-w-lg')} overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark`}
                                style={{ height: height || 'auto' }}
                            >
                                <button type="button" onClick={handleClose} className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600">
                                    <IconX className="h-5 w-5" />
                                </button>
                                {headerContent && (
                                    <div className="bg-[#fbfbfb] py-2 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">{headerContent}</div>
                                )}
                                {subTitle && <div className="bg-[#fbfbfb] text-sm font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">{subTitle}</div>}
                                <div className="p-5">
                                    {props.renderComponent ? props.renderComponent() : props.children}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
