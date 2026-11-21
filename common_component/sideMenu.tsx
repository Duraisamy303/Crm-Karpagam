import IconLoader from '@/components/Icon/IconLoader';
import IconX from '@/components/Icon/IconX';
import { useEffect } from 'react';

interface SidebarProps {
    open: boolean;
    close: () => void;
    title: string;
    renderComponent: () => JSX.Element;
    width?: number;
    cancelOnClick?: any;
    submitOnClick?: any;
    submitTitle?: string;
    canceTitle?: string;
    submitLoading?: boolean;
    btn?: boolean;
}

export default function SideMenu(props: SidebarProps) {
    const { open, close, title, renderComponent, width = 450, cancelOnClick, submitOnClick, submitTitle, canceTitle, submitLoading, btn } = props; 

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    return (
        <div>
            <div className={`${open ? '!block' : 'hidden'} fixed inset-0 z-[51] bg-[black]/60 px-4 transition-[display]`} onClick={() => close()}></div>

            <nav
                className={`${
                    open ? 'ltr:!right-0 rtl:!left-0' : ''
                } fixed bottom-0 top-0 z-[51] w-full bg-white p-4 shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-[right] duration-300 dark:bg-black`}
                style={{ maxWidth: `${width}px`, right: open ? 0 : `-${width}px` }}
            >
                <div className="relative flex items-center justify-between pb-5">
                    <h4 className="text-lg font-bold dark:text-white">{title}</h4>
                    <div className="flex items-center gap-3">
                        {!btn && (
                            <div className="flex items-center gap-3">
                                <button type="button" className="btn btn-outline-danger border" onClick={cancelOnClick}>
                                    {canceTitle ? canceTitle : 'Cancel'}
                                </button>
                                <button type="button" className="btn btn-primary" onClick={submitOnClick}>
                                    {submitLoading ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : submitTitle ? submitTitle : 'Submit'}
                                </button>
                            </div>
                        )}

                        <button type="button" className=" btn-outline-danger rounded-md border hover:opacity-100 dark:text-white" onClick={() => close()}>
                            <IconX className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="perfect-scrollbar h-[calc(100vh-80px)] overflow-y-auto">{renderComponent()}</div>
            </nav>
        </div>
    );
}
