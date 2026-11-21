import { FC } from 'react';

interface IconQuickEditProps {
    className?: string;
}

const IconQuickEdit: FC<IconQuickEditProps> = ({ className }) => {
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
                d="M12.9393 3.93934C13.5251 3.35355 14.4749 3.35355 15.0607 3.93934L17.0607 5.93934C17.6464 6.52513 17.6464 7.47487 17.0607 8.06066L8.56066 16.5607C8.3471 16.7742 8.08148 16.9393 7.7887 17.0394L5.2887 17.9144C4.79785 18.0843 4.30215 17.5886 4.47211 17.0978L5.3471 14.5978C5.4472 14.305 5.61226 14.0394 5.82579 13.8258L14.9393 4.93934C14.9393 4.93934 12.9393 3.93934 12.9393 3.93934Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M4 20H20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default IconQuickEdit;
