import ReadMore from '@/common_component/readMore';
import { capitalizeFLetter } from '@/utils/functions.utils';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import LogCard from '@/components/logCard';
import TaskReplayCard from './TaskRelayCard';

const TaskCard = (props: any) => {
    const { task, btn = true, conversationList, closed } = props;
    console.log('✌️conversationList --->', conversationList);
    console.log('✌️task --->', task);
    const router = useRouter();

    return (
        <div className="mb-1 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            <div className=" flex items-center justify-between">
                {task?.created_by?.first_name && (
                    <div>
                        <span className="font-semibold">Created By :</span> {`${capitalizeFLetter(task?.created_by?.first_name)} ${capitalizeFLetter(task?.created_by?.last_name)}`}
                    </div>
                )}

                <div>
                    <span className="font-medium">Date :</span> {moment(task?.created_on).format('DD-MM-YYYY')}
                </div>
            </div>
            {task?.assigned_to?.length > 0 && (
                <div>
                    <span className="font-semibold">Assigned To :</span> {task?.assigned_to?.map((item) => 
  `${capitalizeFLetter(item?.first_name)} ${capitalizeFLetter(item?.last_name)}`
)?.join(", ")}
                </div>
            )}
            <div className="flex items-center justify-between ">
                {task?.task_type && (
                    <div className=" flex items-center gap-2">
                        <h4 className="font-semibold">Task Type :</h4>

                        <span className={`rounded-xl px-2 py-1 text-sm font-semibold ${task?.tasktype?.label === 'Manual' ? 'bg-orange-300 text-white' : 'bg-purple-300 text-purple-600'}`}>
                            <span className="font-semibold">{task?.task_type}</span>
                        </span>
                    </div>
                )}

                {btn && (
                    <div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                                closed?.();
                                router.push('/assigned_task');
                            }}
                        >
                            {'View All Task'}
                        </button>
                    </div>
                )}
            </div>
            {task?.contact?.student_name && (
                <div>
                    <span className="font-semibold">Student Name :</span> {task?.contact?.student_name}
                </div>
            )}
            {task?.remark && (
                <div className="mb-2">
                    <h4 className=" font-semibold ">Remark:</h4>
                    <ReadMore charLimit={120}>{task?.remark}</ReadMore>
                </div>
            )}

            {conversationList?.length > 0 && (
                <>
                    <h4 className="font-semibold">Conversations:</h4>

                    <div className="max-h-[600px] overflow-y-auto">
                        <TaskReplayCard data={conversationList} />
                    </div>
                </>
            )}
        </div>
    );
};

export default TaskCard;
