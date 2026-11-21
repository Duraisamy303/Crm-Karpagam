import { useState } from 'react';
import Swal from 'sweetalert2';
import XLSX from 'sheetjs-style';
import * as FileSaver from 'file-saver';
import moment from 'moment';

const NumberPattern = /^\d{10}$/;

const PassWordPattern = '"^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})';

const letters = '^[A-Za-z _]*[A-Za-z][A-Za-z _]{2,}$';

const RegExNum = /^[0-9]*$/;

const Mail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/;

export const getBaseURL = () => {
    let baseURL = 'https://api.hellaviews.com';
    if (process.env.REACT_APP_NODE_ENV === 'development') {
        baseURL = 'http://localhost:8001';
    } else if (process.env.REACT_APP_NODE_ENV === 'stage') {
        baseURL = 'https://stage.hellaviews.com';
    }
    return baseURL;
};

export const useSetState = (initialState: any) => {
    const [state, setState] = useState(initialState);

    const newSetState = (newState: any) => {
        setState((prevState: any) => ({ ...prevState, ...newState }));
    };
    return [state, newSetState];
};

export const viewPhoneNumber = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
};

export const validateEmail = (email: string) => {
    return Mail.test(email);
};

export const validateString = (string: string) => {
    if (string.match(letters)) {
        return true;
    }
    return false;
};

export const convertUrlToFile = async (url, filename) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
};

export const isUrlFound = (url: any) => {
    if (/^https:\/\//.test(url)) {
        return true;
    } else if (/^file:\/\//.test(url)) {
        return true;
    } else {
        return false;
    }
};

export const getFileData = (file: any) => {
    const filePathArray = file.path.split('/');
    const fileName = filePathArray.pop();
    return { name: fileName, uri: file.path, type: file.mime };
};

export const getFileSize = (file: File) => {
    if (!file) return { bytes: 0, formatted: '0 KB' };

    const bytes = file.size;
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const formatted = mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`;

    return { bytes, formatted, mb };
};

export const checkLength = (length: any) => {
    if (length < 10) {
        return '000' + (length + 1).toString();
    } else if (length < 100) {
        return '00' + (length + 1).toString();
    } else if (length < 1000) {
        return '0' + (length + 1).toString();
    } else return length;
};

export const truncateText = (text, maxLength = 10) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export const capitalizeFLetter = (string = '') => {
    if (string?.length > 0) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    return string;
};

export const Success = (message: string) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        showCloseButton: true,
        customClass: {
            container: 'kahe-swal-toast-container',
            popup: 'kahe-toast-popup kahe-toast-success',
            title: 'kahe-toast-title',
            closeButton: 'kahe-toast-close',
            timerProgressBar: 'kahe-toast-progress-success',
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });

    toast.fire({
        icon: 'success',
        title: message,
    });
};

export const Failure = (message: string) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        showCloseButton: true,
        customClass: {
            container: 'kahe-swal-toast-container',
            popup: 'kahe-toast-popup kahe-toast-error',
            title: 'kahe-toast-title',
            closeButton: 'kahe-toast-close',
            timerProgressBar: 'kahe-toast-progress-error',
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });

    toast.fire({
        icon: 'error',
        title: message,
    });
};

export const downloadExlcel = (excelData: any, fileName: any) => {
    const filetype = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=utf-8';
    const fileExtension = '.csv';
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'csv', type: 'array' });
    const data = new Blob([excelBuffer], { type: filetype });
    FileSaver.saveAs(data, fileName + fileExtension);
};

export const objIsEmpty = (obj: object) => {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) return false;
    }
    return true;
};

export const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    let month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    let day = now.getDate().toString().padStart(2, '0');
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const Dropdown = (arr: any, label: string) => {
    const array = arr?.map((item) => ({ value: item?.id, label: capitalizeFLetter(item[label]) }));
    return array;
};

export const formatDateTimeLocal = (dateString: any) => {
    const date: any = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
    const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
};

export const getFileNameFromUrl = (url) => {
    const urlObject = new URL(url);
    const pathname = urlObject.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return filename;
};
export const isValidImageUrl = (url) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some((ext) => url?.toLowerCase().endsWith(ext));
};

export const uniqueState = (arr) => {
    const uniqueChoices = arr?.reduce((acc, current) => {
        if (!acc.some((item) => item?.raw === current?.raw)) {
            acc.push(current);
        }
        return acc;
    }, []);
    return uniqueChoices;
};

export const getKey = (imageUrl) => {
    const key = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
    return key;
};

export const getMonthNumber = (dateString) => {
    const date = new Date(dateString);

    const monthNumber = date.getMonth() + 1;
    return monthNumber;
};

export const getImageSizeIntoKB = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl, { method: 'HEAD' });
        const contentLength: any = response.headers.get('Content-Length');

        if (contentLength) {
            const sizeInKB = contentLength / 1024;
            return sizeInKB.toFixed(2);
        } else {
            console.log('Unable to retrieve content length.');
            return null;
        }
    } catch (error) {
        console.error('Error fetching the image:', error);
        return null;
    }
};

export const formatDate = (dateString) => {
    const date: any = new Date(dateString);
    if (isNaN(date)) {
        console.error('Invalid date format:', dateString);
        return 'Invalid Date';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

export const chartData = (rawData) => {
    return Object?.entries(rawData)?.map(([date, count]) => {
        return {
            title: date, // x-axis label
            monthCount: count, // y-axis value
        };
    });
};

export const generateColors = (numColors: number): string[] => {
    const colors = [];
    const hueStep = 360 / numColors;

    for (let i = 0; i < numColors; i++) {
        const hue = Math.round(i * hueStep);
        colors.push(`hsl(${hue}, 100%, 50%)`);
    }

    return colors;
};

export const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            options.push(timeString);
        }
    }
    options.push('24:00');
};

export const formatTime = (time) => {
    const formattedTime = `${time.slice(0, 5)}`;
    const dropdownFormat = { value: formattedTime, label: formattedTime };
    return dropdownFormat;
};

export const isValidUrl = (url) => {
    const regex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
    return regex.test(url);
};

export const addCommasToNumber = (value) => {
    let values = null;
    if (typeof value === 'number') {
        values = value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    } else {
        values = value;
    }
    return values;
};

export const roundOff = (price: any) => {
    let roundedPrice = '';
    if (price) {
        const roundedValue = Math.ceil(price);

        roundedPrice = roundedValue.toLocaleString('en-IN', {
            minimumFractionDigits: roundedValue % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
        });
    } else {
        roundedPrice = price;
    }
    return roundedPrice;
};

export const isEmptyObject = (obj: any) => {
    return Object.values(obj).every((value) => value === '');
};

export const showDeleteAlert = (onConfirm, onCancel, title) => {
    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
            confirmButton: 'btn confirm-btn', // Add a custom class for the confirm button
            cancelButton: 'btn cancel-btn', // Add a custom class for the cancel button
            popup: 'sweet-alerts',
        },
        buttonsStyling: false,
    });

    swalWithBootstrapButtons
        .fire({
            title: title ? title : 'Are you sure to cancel order?',
            // text: "You won't be able to Delete this!",
            icon: 'warning',
            showCancelButton: true,
            // confirmButtonText: 'Yes, delete it!',
            // cancelButtonText: 'No, cancel!',
            reverseButtons: true,
            padding: '2em',
        })
        .then((result) => {
            if (result.isConfirmed) {
                onConfirm();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                onCancel();
            }
        });
};

export const convertToFormData = (body) => {
    const formData = new FormData();

    for (const key in body) {
        if (body[key] instanceof File || body[key] instanceof Blob) {
            formData.append(key, body[key]);
        } else if (Array.isArray(body[key])) {
            body[key].forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
            });
        } else if (body[key] !== null && body[key] !== undefined) {
            formData.append(key, body[key]);
        }
    }
    return formData;
};

export const handleSort = (column: string, sortColumn, sortOrder, data) => {
    const newSortOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    const sortedData = [...data].sort((a, b) => {
        if (a[column] < b[column]) return newSortOrder === 'asc' ? -1 : 1;
        if (a[column] > b[column]) return newSortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    const body = {
        sortColumn,
        sortOrder: newSortOrder,
        sortedData,
    };
    return body;
};

export const allValuesAreZero = (arr) => {
    return arr?.every((value) => value === 0);
};

export const sortData = (data, sortBy, sortOrder) => {
    return [...data].sort((a, b) => {
        const valueA = a[sortBy]?.toString()?.toLowerCase?.() || a[sortBy];
        const valueB = b[sortBy]?.toString()?.toLowerCase?.() || b[sortBy];
        if (sortOrder === 'asc') {
            return valueA > valueB ? 1 : -1;
        }
        return valueA < valueB ? 1 : -1;
    });
};

export const getDateRange = (rangeType) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    let startDate, endDate;

    if (rangeType === 'thisMonth') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
    } else if (rangeType === 'lastMonth') {
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (rangeType === 'last7Days') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        endDate = today;
    } else if (rangeType === 'Year') {
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
    } else {
        throw new Error("Invalid rangeType. Use 'thisMonth', 'lastMonth', 'last7Days', or 'lastYear'.");
    }

    const start = moment(startDate).format('YYYY-MM-DD');
    const end = moment(endDate).format('YYYY-MM-DD');

    return { start, end };
};

export const filterByDates = (filter: any) => {
    let startDate: any, endDate: any;

    if (filter == 'Last 7 Days') {
        const { start, end } = getDateRange('last7Days');
        (startDate = start), (endDate = end);
    }

    if (filter == 'This Month') {
        const { start, end } = getDateRange('thisMonth');
        (startDate = start), (endDate = end);
    }

    if (filter == 'Last Month') {
        const { start, end } = getDateRange('lastMonth');
        (startDate = start), (endDate = end);
    }
    if (filter == 'Year') {
        const { start, end } = getDateRange('Year');
        (startDate = start), (endDate = end);
    }

    // if (filter == 'Custome') {
    //     (startDate = moment(fromDate).format('YYYY-MM-DD')), (endDate = moment(toDate).format('YYYY-MM-DD'));
    // }
    return { startDate, endDate };
};

export const pageCounts = (currentPage, totalRecords) => {
    let result = `${currentPage}-${totalRecords ? Math.min(currentPage * 10, totalRecords) : 0} of ${totalRecords ? totalRecords : 0}`;

    return result;
};

export const getDate = (taskDateTime) => {
    const dateObj = new Date(taskDateTime);
    // const formattedDate = dateObj.toISOString().split('T')[0];
    const formattedDate = moment(taskDateTime).utc().format('DD-MM-YYYY HH:mm a');
    return formattedDate;
};

export const formatINR = (value: number) => {
    if (isNaN(value)) return '';
    return value.toLocaleString('en-IN');
};

export const getMonthName = (monthNumber) => {
    return new Date(2000, monthNumber - 1, 1).toLocaleString('default', { month: 'long' });
};

export const formatIndianRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const convertToDateValue = (monthName: string, year: string): string => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = monthNames.findIndex((month) => month.toLowerCase() === monthName.toLowerCase());

    if (monthIndex !== -1) {
        const monthNumber = String(monthIndex + 1).padStart(2, '0');
        return `${year}-${monthNumber}`;
    }
    return '';
};

export const getColorScheme = (type: string) => {
    switch (type) {
        case 'prevMonth':
            return {
                border: 'border-l-blue-500',
                iconBg: 'bg-blue-100 dark:bg-blue-900',
            };
        case 'currentMonth':
            return {
                border: 'border-l-green-500',
                iconBg: 'bg-green-100 dark:bg-green-900',
            };
        case 'PhysicalYear':
            return {
                border: 'border-l-purple-500',
                iconBg: 'bg-purple-100 dark:bg-purple-900',
            };
        case 'financialYear':
            return {
                border: 'border-l-orange-500',
                iconBg: 'bg-orange-100 dark:bg-orange-900',
            };
        default:
            return {
                border: 'border-l-gray-500',
                iconBg: 'bg-gray-100 dark:bg-gray-900',
            };
    }
};

export const getColorTargetScheme = (type: string) => {
    switch (type) {
        case 'Monthly':
            return {
                border: 'border-l-blue-500',
                iconBg: 'bg-blue-100 dark:bg-blue-900',
            };
        case 'Quarterly':
            return {
                border: 'border-l-green-500',
                iconBg: 'bg-green-100 dark:bg-green-900',
            };
        case 'Half':
            return {
                border: 'border-l-purple-500',
                iconBg: 'bg-purple-100 dark:bg-purple-900',
            };
        case 'Annual':
            return {
                border: 'border-l-orange-500',
                iconBg: 'bg-orange-100 dark:bg-orange-900',
            };
        default:
            return {
                border: 'border-l-gray-500',
                iconBg: 'bg-gray-100 dark:bg-gray-900',
            };
    }
};

export const formatMonthYear = (dateStr: string, shortMonth = false) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', { month: shortMonth ? 'long' : 'short', year: 'numeric' });
};

export const sortedResults = (results) => {
    return results.sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year;
        }
        return a.month - b.month;
    });
};



export const getBadgeColor = (task) => {
    switch (task?.toLowerCase()) {
        case 'call': return 'bg-blue-100 text-blue-800';
        case 'follow up': return 'bg-green-100 text-green-800';
        case 'to do': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};


export const leadStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'follow-up': return 'bg-blue-100 text-blue-800';
        case 'interested': return 'bg-green-100 text-green-800';
        case 'in progress': return 'bg-yellow-100 text-yellow-800';
        case 'call': return 'bg-purple-100 text-purple-800';
        case 'appointments': return 'bg-indigo-100 text-indigo-800';
        case 'converted': return 'bg-emerald-100 text-emerald-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export const leadSourceColor = (source) => {
    const lowerSource = source?.toLowerCase()?.trim();
    switch (lowerSource) {
        case 'campaign': return 'bg-purple-100 text-purple-800';
        case 'email': return 'bg-blue-100 text-blue-800';
        case 'call': return 'bg-green-100 text-green-800';
        case 'referral': return 'bg-yellow-100 text-yellow-800';
        case 'google ads': return 'bg-red-100 text-red-800';
        case 'social media': return 'bg-pink-100 text-pink-800';
        case 'website': return 'bg-indigo-100 text-indigo-800';
        case 'walk in': return 'bg-orange-100 text-orange-800';
        case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
