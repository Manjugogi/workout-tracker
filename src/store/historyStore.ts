import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type ActivityType = 'Protocol' | 'Run';

export interface LogExercise {
    id?: string;
    log_id?: string;
    name: string;
    type: string;
    reps?: number;
    sets?: number;
    weight_kg?: number;
    duration_seconds?: number;
}

export interface WorkoutLog {
    id: string;
    type: ActivityType;
    date: string; // ISO from DB
    name: string;
    duration_seconds: number;
    distance_meters?: number;
    calories_burned?: number;
    exercises?: LogExercise[];
}

interface HistoryState {
    logs: WorkoutLog[];
    fetchLogs: () => Promise<void>;
    addLog: (log: Omit<WorkoutLog, 'id' | 'date' | 'exercises'> & { exercises?: Omit<LogExercise, 'id' | 'log_id'>[] }) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;
    clearHistory: () => void;
}

import { useAuthStore } from './authStore';
const API_URL = 'http://192.168.29.215:5000/api';

export const useHistoryStore = create<HistoryState>()(
    persist(
        (set, get) => ({
            logs: [],
            fetchLogs: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/history`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        set({ logs: data });
                    }
                } catch (err) {
                    console.error('Fetch logs error:', err);
                }
            },
            addLog: async (log) => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/history`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify(log),
                    });

                    if (response.ok) {
                        await get().fetchLogs();
                    }
                } catch (err) {
                    console.error('Add log error:', err);
                }
            },
            deleteLog: async (id) => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/history/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (response.ok) {
                        await get().fetchLogs();
                    }
                } catch (err) {
                    console.error('Delete log error:', err);
                }
            },
            clearHistory: () => set({ logs: [] }),
        }),
        {
            name: 'workout-history',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
