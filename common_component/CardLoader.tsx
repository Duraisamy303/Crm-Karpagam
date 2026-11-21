import React from 'react';

export default function CardLoader() {
    return (
        <div className="mx-auto my-20 flex justify-center">
            <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 opacity-60 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 opacity-60 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 opacity-60"></div>
            </div>
        </div>
    );
}
