import { useState, useEffect, useRef } from 'react';
import { Vibration } from 'react-native';

export const useWorkoutTimer = (initialDuration: number, onComplete: () => void) => {
    const [timeLeft, setTimeLeft] = useState(initialDuration);
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setTimeLeft(initialDuration);
        setIsActive(true);
        setIsPaused(false);
    }, [initialDuration]);

    useEffect(() => {
        if (isActive && !isPaused && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        setIsActive(false);
                        Vibration.vibrate();
                        onComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, isPaused, timeLeft, onComplete]);

    const togglePause = () => setIsPaused(!isPaused);

    const skip = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsActive(false);
        onComplete();
    };

    return { timeLeft, isActive, isPaused, togglePause, skip };
};
