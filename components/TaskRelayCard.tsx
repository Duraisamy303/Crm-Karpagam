import React from 'react';
import moment from 'moment';
import ReadMore from '@/common_component/readMore';
import IconEdit from './Icon/IconEdit';
import { capitalizeFLetter, getFileNameFromUrl } from '@/utils/functions.utils';
import Tippy from '@tippyjs/react';

const TaskReplayCard = (props: any) => {
    const { data, onEdit, onDelete, editIcon } = props;

    return (
        <div className=" ">
            <div className="mb-5">
                <div className="mx-auto ">
                    {data?.map((item) => (
                        <div className="flex">
                            <p className="mr-2  py-2.5 text-base font-semibold text-[#3b3f5c] dark:text-white-light">{moment(item?.created_on).format('DD-MM-YYYY')}</p>
                            <div className="relative before:absolute before:left-1/2 before:top-[15px] before:h-2.5 before:w-2.5 before:-translate-x-1/2 before:rounded-full before:border-2 before:border-primary after:absolute after:-bottom-[15px] after:left-1/2 after:top-[25px] after:h-auto after:w-0 after:-translate-x-1/2 after:rounded-full after:border-l-2 after:border-primary"></div>
                            <div className="self-center p-2.5 ltr:ml-2.5 rtl:ml-2.5 rtl:ltr:mr-2.5">
                                <div className="flex items-center">
                                    <div className={`${item?.details ? 'w-1/2 pr-2' : 'w-full pr-0'}`}>
                                        <div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-4  shadow-lg">
                                            <p className="text-sm">
                                                <strong>Created By:</strong> {`${capitalizeFLetter(item?.created_by?.first_name)} ${capitalizeFLetter(item?.created_by?.last_name)}`}
                                            </p>
                                            {item?.message && (
                                                <p className=" flex text-sm">
                                                    <strong>Message:</strong>
                                                    <ReadMore children={capitalizeFLetter(item?.message)} />
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TaskReplayCard;
