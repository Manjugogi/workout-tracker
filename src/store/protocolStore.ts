import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export type ExerciseType = 'Strength' | 'Cardio' | 'Flexibility' | 'HIIT';
export type ProtocolCategory = 'Strength' | 'Cardio' | 'Functional' | 'HIIT' | 'Yoga' | 'Mobility' | 'Sports' | 'Recovery';

export interface Exercise {
    id: string;
    name: string;
    type: ExerciseType;
    duration?: number; // in seconds, for timer
    reps?: number;
    sets?: number;
    rest?: number; // rest after exercise in seconds
    weight?: number; // kg
    distance?: number; // km
}

export interface Protocol {
    id: string;
    name: string;
    category: ProtocolCategory;
    exercises: Exercise[];
    createdAt: number;
}

interface ProtocolState {
    protocols: Protocol[];
    addProtocol: (protocol: Omit<Protocol, 'id' | 'createdAt'>) => void;
    deleteProtocol: (id: string) => void;
    updateProtocol: (id: string, updates: Partial<Protocol>) => void;
}

export const useProtocolStore = create<ProtocolState>()(
    persist(
        (set) => ({
            protocols: [],
            addProtocol: (protocol) =>
                set((state) => ({
                    protocols: [
                        ...state.protocols,
                        { ...protocol, id: uuidv4(), createdAt: Date.now() },
                    ],
                })),
            deleteProtocol: (id) =>
                set((state) => ({
                    protocols: state.protocols.filter((p) => p.id !== id),
                })),
            updateProtocol: (id, updates) =>
                set((state) => ({
                    protocols: state.protocols.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),
        }),
        {
            name: 'protocol-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
