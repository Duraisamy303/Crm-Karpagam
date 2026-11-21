import { FC } from 'react';

interface IconMobileProps {
    className?: string;
    fill?: boolean;
}

const IconMobile: FC<IconMobileProps> = ({ className, fill = false }) => {
    return (
        <>
            {!fill ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    className={className}
                >
                    <path
                        d="M16 2H8C6.89543 2 6 2.89543 6 4V20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20V4C18 2.89543 17.1046 2 16 2Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                    />
                    <circle cx="12" cy="19" r="1" fill="currentColor" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    className={className}
                >
                    <path
                        d="M16 2H8C6.89543 2 6 2.89543 6 4V20C6 21.1046 6.89543 22 8 22H16C17.1046 22 18 21.1046 18 20V4C18 2.89543 17.1046 2 16 2Z"
                        fill="currentColor"
                    />
                    <circle cx="12" cy="19" r="1" fill="white" />
                </svg>
            )}
        </>
    );
};

export default IconMobile;
``
