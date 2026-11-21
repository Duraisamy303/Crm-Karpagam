import { FC } from 'react';

interface IconMenuContactsProps {
    className?: string;
}

const IconContacts: FC<IconMenuContactsProps> = ({ className }) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 12C10.896 12 10 12.896 10 14C10 15.104 10.896 16 12 16C13.104 16 14 15.104 14 14C14 12.896 13.104 12 12 12ZM12 2C9.243 2 7 4.243 7 7C7 8.657 8.08 10.305 9.473 10.748C8.904 11.326 8.5 12.163 8.5 13C8.5 14.74 10.243 16.392 13 17.202V17.5C13 18.604 12.104 19.5 11 19.5C9.896 19.5 9 18.604 9 17.5H7C7 20.261 9.739 23 13 23C16.261 23 19 20.261 19 17C19 15.57 18.339 14.305 17.392 13.471C18.213 12.562 19 10.982 19 9C19 5.686 16.314 3 13 3C11.317 3 9.793 3.855 8.753 5.178C8.077 5.82 7.646 6.733 7.398 7.68C6.868 7.542 6.295 7.5 5.707 7.5C5.371 7.5 5 7.71 5 8.2C5 9.646 7.784 11.464 12 12Z"
                fill="currentColor"
            />
        </svg>
    );
};

export default IconContacts;
