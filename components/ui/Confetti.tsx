import React, { useEffect, useState } from 'react';

const ConfettiPiece: React.FC<{ initialX: number; initialY: number; delay: number }> = ({ initialX, initialY, delay }) => {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 8 + 4; // 4px to 12px
    const rotation = Math.random() * 360;
    const duration = Math.random() * 2 + 3; // 3s to 5s

    const style: React.CSSProperties = {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        top: `${initialY}%`,
        left: `${initialX}%`,
        opacity: 0,
        transform: `rotate(${rotation}deg)`,
        animation: `fall ${duration}s linear ${delay}s forwards`,
    };

    return <div style={style}></div>;
};


const Confetti: React.FC<{ count?: number }> = ({ count = 100 }) => {
    const [pieces, setPieces] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const newPieces = Array.from({ length: count }).map((_, i) => (
            <ConfettiPiece
                key={i}
                initialX={Math.random() * 100}
                initialY={-10 - Math.random() * 20} // Start above the screen
                delay={Math.random() * 2} // Stagger the start
            />
        ));
        setPieces(newPieces);
    }, [count]);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
            <style>{`
                @keyframes fall {
                    0% {
                        opacity: 1;
                        transform: translateY(0vh) rotate(0deg);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(110vh) rotate(720deg);
                    }
                }
            `}</style>
            {pieces}
        </div>
    );
};

export default Confetti;
