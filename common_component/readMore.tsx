import React, { useState } from 'react';

const ReadMore = ({ children, charLimit = 100, readMoreText = 'read more', readLessText = 'read less' }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleReadMore = () => {
        setIsExpanded(!isExpanded);
    };

    const isLongText = children?.length > charLimit;
    const displayText = isExpanded ? children : children?.substring(0, charLimit);

    return (
        <div>
            <p>
                {displayText}
                {!isExpanded && isLongText ? '...' : ''}{' '}
                {isLongText && (
                    <button onClick={toggleReadMore} className="text-primary">
                        {isExpanded ? readLessText : readMoreText}
                    </button>
                )}
            </p>
        </div>
    );
};

export default ReadMore;
