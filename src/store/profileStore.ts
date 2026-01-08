import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';
import { differenceInYears, parseISO } from 'date-fns';

export interface UserProfile {
    user_id: string;
    name: string;
    date_of_birth: string; // ISO format
    height_cm: number;
    weight_kg: number;
    city: string;
    area: string;
    avatar_url: string;
    updated_at: string;
}

interface ProfileState {
    profile: UserProfile | null;
    age: number | null;
    fetchProfile: () => Promise<void>;
    updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
    uploadAvatar: (uri: string) => Promise<string>;
}

const API_URL = 'http://192.168.29.215:5000/api';

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profile: null,
            age: null,
            fetchProfile: async () => {
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    const response = await fetch(`${API_URL}/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const age = data?.date_of_birth
                            ? differenceInYears(new Date(), parseISO(data.date_of_birth))
                            : null;
                        set({ profile: data, age });
                    } else {
                        const text = await response.text();
                        console.error('Fetch profile failed:', text);
                    }
                } catch (err) {
                    console.error('Fetch profile error:', err);
                }
            },
            updateProfile: async (profileData) => {
                const token = useAuthStore.getState().token;
                if (!token) throw new Error('Not authenticated');

                const response = await fetch(`${API_URL}/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(profileData),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to update profile');
                }

                const updatedProfile = await response.json();
                const age = updatedProfile.date_of_birth
                    ? differenceInYears(new Date(), parseISO(updatedProfile.date_of_birth))
                    : null;
                set({ profile: updatedProfile, age });
            },
            uploadAvatar: async (uri) => {
                const token = useAuthStore.getState().token;
                if (!token) throw new Error('Not authenticated');

                const formData = new FormData();
                const filename = uri.split('/').pop() || 'avatar.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;

                formData.append('avatar', {
                    uri,
                    name: filename,
                    type,
                } as any);

                const response = await fetch(`${API_URL}/upload/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Upload failed');
                }

                const { avatarUrl } = await response.json();
                // We don't automatically update the profile record here, 
                // we return the URL so the screen can save it with other changes.
                return avatarUrl;
            },
        }),
        {
            name: 'profile-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
