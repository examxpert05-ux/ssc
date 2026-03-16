import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Timer({ duration, onTimeout, onTick, isPaused = false }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
        if (isPaused) return;

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
    }, [timeLeft, onTimeout, onTick, isPaused]);

    const progress = (timeLeft / duration) * 100;
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');

    // Color thresholds
    let barColor = 'bg-green-500';
    let textColor = 'text-green-400';
    if (progress < 60) { barColor = 'bg-yellow-400'; textColor = 'text-yellow-400'; }
    if (progress < 30) { barColor = 'bg-red-500'; textColor = 'text-red-400'; }

    return (
        <div className="flex items-center gap-3 min-w-[140px]">
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full ${barColor}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'linear' }}
                />
            </div>
            <span className={`font-mono text-lg font-bold tabular-nums ${textColor}`}>
                {mins}:{secs}
            </span>
        </div>
    );
}
