import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    path: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    separator?: string;
    className?: string;
}

const Breadcrumb = (props: BreadcrumbProps) => {
    const { items, separator = '>', className } = props;
    return (
        <nav className={`breadcrumb ${className} p-2`} aria-label="breadcrumb ">
            <ol className="flex space-x-2">
                {items.map((item, index) => (
                    <li key={index} className="breadcrumb-item text-primary font-semibold text-md">
                        {index !== 0 && <span className="mx-1">{`${separator} `}</span>}
                        {index < items.length - 1 ? (
                            <Link href={item.path} className="text-blue-600 hover:underline ">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-500 ">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
