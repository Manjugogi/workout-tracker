import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type ActivityType = 'Protocol' | 'Run';

export interface WorkoutLog {
    id: string;
    type: ActivityType;
    date: number; // timestamp
    name: string; // Protocol Name or "Outdoor Run"
    duration: number; // seconds
    distance?: number; // meters (for runs)
    caloriesBuffer?: number; // Placeholder
}

interface HistoryState {
    logs: WorkoutLog[];
    addLog: (log: Omit<WorkoutLog, 'id' | 'date'>) => void;
    clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
    persist(
        (set) => ({
            logs: [],
            addLog: (log) =>
                set((state) => ({
                    logs: [
                        { ...log, id: uuidv4(), date: Date.now() },
                        ...state.logs,
                    ],
                })),
            clearHistory: () => set({ logs: [] }),
        }),
        {
            name: 'workout-history',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
