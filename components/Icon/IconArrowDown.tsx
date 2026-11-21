import { FC } from 'react';

interface IconArrowDownProps {
    className?: string;
}

const IconArrowDown: FC<IconArrowDownProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M7 14.5L12 19.5L17 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path opacity="0.5" d="M12 19.5L12 9.5C12 7.83333 13 4.5 17 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default IconArrowDown;
