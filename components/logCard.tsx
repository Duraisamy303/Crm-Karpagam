import React from 'react';
import moment from 'moment';
import ReadMore from '@/common_component/readMore';
import IconEdit from './Icon/IconEdit';
import { capitalizeFLetter, formatDate, getFileNameFromUrl } from '@/utils/functions.utils';
import Tippy from '@tippyjs/react';

const Timeline = (props: any) => {
    const { data, onEdit, onDelete, editIcon } = props;
    console.log('✌️data --->', data);

    return (
        <div className="w-full ">
            <div className="mb-5">
                <div className="mx-auto max-w-[900px]">
                    {data?.map((item) => (
                        <div className="flex">
                            <p className="mr-2 min-w-[100px] max-w-[100px] py-2.5 text-base font-semibold text-[#3b3f5c] dark:text-white-light">{moment(item?.created_on).format('DD-MM-YYYY')}</p>
                            <div className="relative before:absolute before:left-1/2 before:top-[15px] before:h-2.5 before:w-2.5 before:-translate-x-1/2 before:rounded-full before:border-2 before:border-primary after:absolute after:-bottom-[15px] after:left-1/2 after:top-[25px] after:h-auto after:w-0 after:-translate-x-1/2 after:rounded-full after:border-l-2 after:border-primary"></div>
                            <div className="self-center p-2.5 ltr:ml-2.5 rtl:ml-2.5 rtl:ltr:mr-2.5">
                                <div className="flex items-center">
                                    <div className={`${item?.details || item?.new_value?.remark ? 'w-1/2 pr-2' : 'w-full pr-0'}`}>
                                        <div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-4  shadow-lg">
                                            <h3 className="text-lg font-semibold text-blue-700">{item.log_type}</h3>
                                            {/* <p className="text-sm">
                                                <strong>Contact:</strong> {item?.contact?.name}
                                            </p> */}

                                            {item?.follow_up_date_time && (
                                                <p className="text-sm">
                                                    <strong>Follow-up Date:</strong> {moment(item?.follow_up_date_time).format('MMMM DD, YYYY')}
                                                </p>
                                            )}
                                            {item?.opportunity && (
                                                <p className="text-sm">
                                                    <strong>Opportunity:</strong> {item?.opportunity?.name}
                                                </p>
                                            )}
                                            <p className="text-sm">
                                                <strong>Created By:</strong> {capitalizeFLetter(item?.created_by?.first_name)}
                                            </p>

                                             <p className="text-sm">
                                                <strong>Created on:</strong> {moment(item?.created_at).format('DD-MM-YYYY')}
                                            </p>
                                            

                                            {item?.old_value && item?.new_value && (
                                                <div className="space-y-1 text-sm">
                                                    {Object.keys(item.old_value).map((key) => {
                                                        const oldVal = item.old_value[key];
                                                        const newVal = item.new_value[key];

                                                        // Format Key
                                                        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

                                                        const formatValue = (val) => {
                                                            if (val === null || val === undefined) return '---';

                                                            // If value is object → try to pick readable property
                                                            if (typeof val === 'object') {
                                                                return val.name || val.stage || val.label || val.title || val.description || val.first_name || JSON.stringify(val);
                                                            }

                                                            return val; // primitive value
                                                        };

                                                        return (
                                                            <p key={key}>
                                                                <strong>{formattedKey}:</strong> {formatValue(oldVal)} <strong>→</strong> {formatValue(newVal)}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {item?.new_value?.updated_by_name && (
                                                <p className="text-sm">
                                                    <strong>Changed by: </strong>
                                                    {capitalizeFLetter(item?.new_value?.updated_by_name)}
                                                </p>
                                            )}

                                            {item?.new_value?.updated_at && (
                                                <p className="text-sm">
                                                    <strong>Updated at: </strong>
                                                    {formatDate(item?.new_value?.updated_at)}
                                                </p>
                                            )}
                                            {/* {item?.log_stage && (
                                                <p className="text-sm">
                                                    <strong>Stage:</strong> {item?.log_stage?.stage}
                                                </p>
                                            )} */}
                                            {item?.file_url && (
                                                <p className=" flex text-sm">
                                                    <strong>File:</strong>
                                                    <div className="cursor-pointer text-primary underline" onClick={() => window.open(item?.file_url, '_blank')}>
                                                        {' '}
                                                        {getFileNameFromUrl(item?.file_url)}
                                                    </div>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {item?.details && (
                                        <div className="w-1/2">
                                            <div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-4  shadow-lg">
                                                {item?.details && (
                                                    <Tippy content={item?.details} placement="top" className="rounded bg-black p-1 text-white">
                                                        <p className=" flex text-sm">
                                                            <strong>Details:&nbsp; </strong>

                                                            <ReadMore children={item?.details} />
                                                        </p>
                                                    </Tippy>
                                                )}

                                                {editIcon && (
                                                    <div className="mt-2 flex justify-end">
                                                        <button className="flex items-center text-blue-500 hover:text-blue-700" onClick={() => onEdit(item)}>
                                                            <IconEdit className="mr-1 h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {item?.new_value?.remark && (
                                        <div className="w-1/2">
                                            <div className="mt-4 w-full rounded-lg border border-gray-200 bg-white p-4  shadow-lg">
                                                {item?.new_value?.remark && (
                                                    <Tippy content={item?.detail || item?.new_value?.remark} placement="top" className="rounded bg-black p-1 text-white">
                                                        <p className=" flex text-sm">
                                                            <strong>Details:</strong>

                                                            <ReadMore children={item?.new_value?.remark || item?.details} />
                                                        </p>
                                                    </Tippy>
                                                )}

                                                {editIcon && (
                                                    <div className="mt-2 flex justify-end">
                                                        <button className="flex items-center text-blue-500 hover:text-blue-700" onClick={() => onEdit(item)}>
                                                            <IconEdit className="mr-1 h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Timeline;
