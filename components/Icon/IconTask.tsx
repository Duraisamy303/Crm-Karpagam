import { FC } from 'react';

interface IconTaskProps {
    className?: string;
}

const IconTask: FC<IconTaskProps> = ({ className }) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Outer box */}
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            {/* Checkmark */}
            <path
                d="M8 12L11 15L16 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default IconTask;
