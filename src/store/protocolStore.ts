import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';

export type ExerciseType = 'Strength' | 'Cardio' | 'Flexibility' | 'HIIT';
export type ProtocolCategory = string;

export interface Exercise {
    id: string;
    name: string;
    type: ExerciseType;
    duration?: number;
    reps?: number;
    sets?: number;
    rest?: number;
    weight?: number;
    distance?: number;
}

export interface Protocol {
    id: string;
    name: string;
    category: ProtocolCategory;
    exercises: Exercise[];
    createdAt: string;
}

interface ProtocolState {
    protocols: Protocol[];
    fetchProtocols: () => Promise<void>;
    addProtocol: (protocol: Omit<Protocol, 'id' | 'createdAt'>) => Promise<void>;
    updateProtocol: (id: string, protocol: Omit<Protocol, 'id' | 'createdAt'>) => Promise<void>;
    deleteProtocol: (id: string) => Promise<void>;
}

const API_URL = 'http://192.168.29.215:5000/api';

export const useProtocolStore = create<ProtocolState>()(
    persist(
        (set, get) => ({
            protocols: [],
            fetchProtocols: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                const response = await fetch(`${API_URL}/protocols`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    set({ protocols: data });
                }
            },
            addProtocol: async (protocol) => {
                const token = useAuthStore.getState().token;
                if (!token) throw new Error('Not authenticated');

                const response = await fetch(`${API_URL}/protocols`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(protocol),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to add protocol');
                }

                await get().fetchProtocols();
            },
            updateProtocol: async (id, protocol) => {
                const token = useAuthStore.getState().token;
                if (!token) throw new Error('Not authenticated');

                const response = await fetch(`${API_URL}/protocols/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(protocol),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update protocol');
                }

                await get().fetchProtocols();
            },
            deleteProtocol: async (id) => {
                const token = useAuthStore.getState().token;
                if (!token) throw new Error('Not authenticated');

                const response = await fetch(`${API_URL}/protocols/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to delete protocol');
                }

                set((state) => ({
                    protocols: state.protocols.filter((p) => p.id !== id),
                }));
            },
        }),
        {
            name: 'protocol-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
