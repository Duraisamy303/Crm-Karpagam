import Tippy from '@tippyjs/react';
import React from 'react';
interface tooltipbtnProps {
    tipTitle: string;
    icon: any;
    onClick: any;
    position?: any;
}

export default function TooltipButton(props: tooltipbtnProps) {
    const { tipTitle, icon, onClick, position } = props;
    return (
        <Tippy content={tipTitle} placement={position ? position : 'top'} className="rounded-lg bg-black p-1 text-sm text-white">
            <button type="button" className="btn btn-primary " onClick={onClick}>
                {icon}
            </button>
        </Tippy>
    );
}
