import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { capitalizeFLetter } from '@/utils/functions.utils';
import { Loader } from '@mantine/core';
import CardLoader from '@/common_component/CardLoader';

const MonthlyUserTargetSlider = ({ data = [], title = '', onClose, selectedUserCardDate, loading = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCards, setVisibleCards] = useState(1);
    const sliderRef = useRef(null);

    const findSelectedIndex = () => {
        return data.findIndex((month) => `${month.start} - ${month.end}` === selectedUserCardDate);
    };

    useEffect(() => {
        const selectedIndex = findSelectedIndex();
        if (selectedIndex !== -1) {
            setCurrentIndex(selectedIndex);
        } else {
            setCurrentIndex(0);
        }
    }, [data, selectedUserCardDate]);

    useEffect(() => {
        const updateVisibleCards = () => {
            const width = window.innerWidth;
            if (width >= 1280) {
                // xl
                setVisibleCards(4);
            } else if (width >= 1024) {
                // lg
                setVisibleCards(4);
            } else if (width >= 768) {
                // md
                setVisibleCards(3);
            } else {
                setVisibleCards(1);
            }
        };

        updateVisibleCards();
        window.addEventListener('resize', updateVisibleCards);
        return () => window.removeEventListener('resize', updateVisibleCards);
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev >= data.length - visibleCards ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? data.length - visibleCards : prev - 1));
    };

    const goToSlide = (index) => {
        setCurrentIndex(Math.min(index, data.length - visibleCards));
    };

    if (!data.length) {
        return (
            <div className="w-full rounded-lg bg-white p-4">
                <div className="animate-pulse">
                    <div className="mb-3 h-5 w-1/4 rounded bg-gray-200"></div>
                    <div className="h-20 rounded bg-gray-200"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full rounded-none border border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50 lg:rounded-lg lg:p-2">
            {/* Header with Close Icon - Improved UI */}
            <div className="mb-4 flex flex-col items-start justify-between gap-2 px-4 pt-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-800 md:text-xl">{capitalizeFLetter(title)} Targets</h2>
                    {/* Month Labels in Header */}
                    {/* <div className="flex overflow-x-auto py-1 gap-1 hide-scrollbar">
            {data.map((month, index) => (
              <button
                key={index}
                onClick={() => goToSlide(Math.min(index, data.length - visibleCards))}
                className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-md transition-all duration-200 whitespace-nowrap border ${
                  index >= currentIndex && index < currentIndex + visibleCards
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-xs'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-gray-200'
                }`}
              >
                {month.label.split(' ')[0]}
              </button>
            ))}
          </div> */}
                </div>

                {/* Close Icon - Improved UI */}
                {onClose && (
                    <button onClick={onClose} className="group flex-shrink-0 rounded-lg border border-red-200 bg-red-100 p-2 transition-all  duration-200">
                        <X className="h-4 w-4 scale-110 text-gray-600 text-red-600 transition-all" />
                    </button>
                )}
            </div>
            {loading ? (
                <CardLoader />
            ) : (
                <>
                    {/* Slider Container */}
                    <div className="relative w-full px-2">
                        {/* Left Arrow - Positioned at card edge */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 z-20 -translate-y-1/2 transform rounded-full border border-gray-300 bg-white p-2 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50 hover:shadow-2xl md:left-0"
                        >
                            <ChevronLeft className="h-4 w-4 text-gray-700 md:h-5 md:w-5" />
                        </button>

                        {/* Right Arrow - Positioned at card edge */}
                        <button
                            onClick={nextSlide}
                            className="absolute -right-2 top-1/2 z-20 -translate-y-1/2 transform rounded-full border border-gray-300 bg-white p-2 shadow-xl transition-all duration-200 hover:scale-110 hover:bg-gray-50 hover:shadow-2xl"
                        >
                            <ChevronRight className="h-4 w-4 text-gray-700 md:h-5 md:w-5" />
                        </button>

                        {/* Cards Container */}
                        <div ref={sliderRef} className="w-full overflow-hidden">
                            <div
                                className="flex gap-2 px-3 transition-transform duration-300 ease-in-out  "
                                style={{
                                    transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                                }}
                            >
                                {data.map((month, index) => {
                                    const isUserSelected = `${month.start} - ${month.end}` == selectedUserCardDate;

                                    // console.log("isUserSelected", isUserSelected);

                                    return (
                                        <div key={index} className="flex-shrink-0" style={{ width: `${100 / visibleCards}%` }}>
                                            {/* Card with New Color Scheme */}
                                            <div
                                                className={`group h-full rounded-xl border border-gray-200  p-4 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-lg  ${
                                                    isUserSelected ? ' border-indigo-400 bg-indigo-100 shadow-lg' : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg'
                                                } `}
                                            >
                                                {/* Month Header */}
                                                <div className="mb-3 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-indigo-700 md:text-base">{month.label}</h3>
                                                        {/* {month?.start && (
                        <p className="text-xs text-gray-500 mt-0.5 hidden sm:block truncate">
                          {new Date(month.start).getDate()} - {new Date(month.end).getDate()} {new Date(month.start).toLocaleString('default', { month: 'short' })}
                        </p>
                      )} */}
                                                    </div>
                                                    {/* <div className="text-right ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        month.percentage >= 80 
                          ? 'bg-green-100 text-green-800' 
                          : month.percentage >= 50 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {month.percentage}%
                      </span>
                    </div> */}
                                                </div>

                                                {/* Target & Achieved */}
                                                <div className="mb-4 grid grid-cols-2 gap-3 md:gap-4">
                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-medium text-gray-600">Target</label>
                                                        <div className="truncate text-base font-bold text-gray-900 md:text-lg">₹{(month.target || 0).toLocaleString('en-IN')}</div>
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="block text-xs font-medium text-gray-600">Achieved</label>
                                                        <div className={`truncate text-base font-bold md:text-lg ${month.achieved > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                                                            ₹{(month.achieved || 0).toLocaleString('en-IN')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mt-auto">
                                                    <div className="mb-2 flex justify-between text-xs text-gray-600">
                                                        <span className="truncate">Progress</span>
                                                        <span className="whitespace-nowrap">{month.percentage}% Complete</span>
                                                    </div>
                                                    <div className="h-2 w-full rounded-full bg-gray-200">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                                                                month.percentage >= 80
                                                                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                    : month.percentage >= 50
                                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                                                    : 'bg-gradient-to-r from-red-500 to-pink-500'
                                                            }`}
                                                            style={{ width: `${Math.min(month.percentage, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Dot Indicators */}
                    <div className="mt-5 flex justify-center space-x-2 pb-2">
                        {Array.from({ length: Math.ceil(data.length / visibleCards) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index * visibleCards)}
                                className={`rounded-full transition-all duration-200 ${
                                    Math.floor(currentIndex / visibleCards) === index ? 'h-2 w-5 bg-indigo-600 md:w-6' : 'h-2 w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MonthlyUserTargetSlider;
