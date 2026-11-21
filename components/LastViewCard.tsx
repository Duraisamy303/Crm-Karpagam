import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    const containerRef = useRef(null);

    useEffect(() => {
        const lastViewedCard = localStorage.getItem('lastViewedCard');
        if (lastViewedCard && containerRef.current) {
            const card = document.getElementById(lastViewedCard);
            card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    const handleCardClick = (id) => {
        localStorage.setItem('lastViewedCard', id);
        router.push(`/details/${id}`);
    };

    return (
        <div ref={containerRef} style={{ height: '100vh', overflowY: 'scroll', padding: '20px' }}>
            <h1>Home Page</h1>
            {Array.from({ length: 20 }, (_, index) => (
                <div
                    key={index}
                    id={`card-${index}`}
                    style={{
                        padding: '20px',
                        margin: '10px',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                    }}
                    onClick={() => handleCardClick(`card-${index}`)}
                >
                    Card {index + 1}
                </div>
            ))}
        </div>
    );
}
