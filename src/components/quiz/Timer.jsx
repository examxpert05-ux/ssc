import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Timer({ duration, onTimeout, onTick }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeout();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const next = prev - 1;
                if (onTick) onTick(next);
                return next;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeout, onTick]);

    const progress = (timeLeft / duration) * 100;

    // Color logic
    let color = 'bg-green-500';
    if (progress < 60) color = 'bg-yellow-500';
    if (progress < 30) color = 'bg-red-500';

    return (
        <div className="w-full flex items-center gap-3">
            <div className="h-2 flex-grow bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div
                    className={`h-full ${color} shadow-[0_0_10px_currentColor]`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                />
            </div>
            <div className="font-mono text-sm md:text-xl font-bold tabular-nums text-slate-200 min-w-[60px] text-right">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
        </div>
    );
}
