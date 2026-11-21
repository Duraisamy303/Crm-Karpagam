import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import Modal from '@/common_component/modal'; // Assuming you have a modal component
import { capitalizeFLetter } from '@/utils/functions.utils';
import moment from 'moment';

export default function CustomFullCalendar(props) {
    const { events, setEvents, selectDate } = props;

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    const handleEventClick = (info) => {
        setCurrentEvent(info.event); // Set the clicked event in the state
        setModalIsOpen(true); // Open the modal
    };

    const handleUpdateEvent = () => {
        if (currentEvent) {
            setEvents((prevEvents) => prevEvents.map((event) => (event.id === currentEvent.id ? currentEvent : event)));
        }
        setModalIsOpen(false); // Close the modal after updating
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentEvent({
            ...currentEvent,
            [name]: value,
        });
    };

    const handleDateClick = (info) => {
        setModalIsOpen(true); // Open the modal
    };

    return (
        <div className="calendar-wrapper">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                editable={true}
                dayMaxEvents={true}
                selectable={true}
                droppable={true}
                eventClick={handleEventClick}
                select={selectDate}
                events={events}
                height="600px"
                dayCellDidMount={(arg) => {
                    const date = arg.date;
                    const isFutureOrToday = date >= new Date(new Date().setHours(0, 0, 0, 0));
                  
                    if (isFutureOrToday) {
                      const btn = document.createElement("button");
                      btn.innerText = "+";
                      btn.className =
                        "ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white hover:bg-green-700";
                      btn.onclick = (e) => {
                        e.stopPropagation();
                        setCurrentEvent(null); // reset event
                        setModalIsOpen(true); // open modal
                      };
                  
                      // safer append — look inside cell frame
                      const container =
                        arg.el.querySelector(".fc-daygrid-day-top") ||
                        arg.el.querySelector(".fc-daygrid-day-frame") ||
                        arg.el;
                  
                      container.appendChild(btn);
                    }
                  }}
                  
            />

            {/* Modal for Event Details */}
            {currentEvent && (
                <Modal
                    open={modalIsOpen}
                    close={() => setModalIsOpen(false)}
                    renderComponent={() => (
                        <div className="rounded-lg bg-white p-6 shadow-lg ">
                            <h2 className="text-xl font-semibold text-gray-800">Task Details</h2>
                            <div className="space-y-3">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-700">Created By:</span>
                                    <p className="mt-1 text-gray-900">{capitalizeFLetter(currentEvent.extendedProps?.created_by?.username)}</p>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-gray-700">Description:</span>
                                    <p className="mt-1 text-gray-900">{capitalizeFLetter(currentEvent.extendedProps?.remark)}</p>
                                </div>
                                <div className="text-sm">
                                    <span className="font-medium text-gray-700">Task Date:</span>
                                    <p className="mt-1 text-gray-900">{currentEvent.start ? moment(currentEvent.start).format('MMM DD, YYYY') : ''}</p>
                                </div>
                                {/* <div className="text-sm">
                                    <span className="font-medium text-gray-700">End Date:</span>
                                    <p className="mt-1 text-gray-900">{currentEvent.end ? new Date(currentEvent.end).toLocaleString() : 'N/A'}</p>
                                </div> */}
                                <div className="text-sm">
                                    <span className="font-medium text-gray-700">Type:</span>
                                    <p className="mt-1 text-gray-900">{currentEvent.extendedProps?.task_type}</p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => setModalIsOpen(false)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                />
            )}
        </div>
    );
}
