import { FC } from 'react';

interface IconLogProps {
    className?: string;
}

const IconLog: FC<IconLogProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />

            <line x1="7" y1="8" x2="17" y2="8"></line>
            <line x1="7" y1="12" x2="17" y2="12"></line>
            <line x1="7" y1="16" x2="13" y2="16"></line>
        </svg>
    );
};

export default IconLog;
