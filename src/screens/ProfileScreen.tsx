import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, Image } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { CustomHeader } from '../components/CustomHeader';
import { useProfileStore } from '../store/profileStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

export const ProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const { profile, age, fetchProfile, updateProfile } = useProfileStore();

    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [city, setCity] = useState('');
    const [area, setArea] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const [hasSynced, setHasSynced] = useState(false);

    useEffect(() => {
        if (profile && !hasSynced) {
            console.log('Initial sync of profile to state. Avatar:', profile.avatar_url);
            setName(profile.name || '');
            setDob(profile.date_of_birth ? profile.date_of_birth.split('T')[0] : '');
            setHeight(profile.height_cm ? profile.height_cm.toString() : '');
            setWeight(profile.weight_kg ? profile.weight_kg.toString() : '');
            setCity(profile.city || '');
            setArea(profile.area || '');
            setAvatarUrl(profile.avatar_url || '');
            setHasSynced(true);
        }
    }, [profile, hasSynced]);

    useEffect(() => {
        console.log('DEBUG: Local avatarUrl state changed to:', avatarUrl);
    }, [avatarUrl]);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setUploading(true);
            try {
                const uploadedUrl = await useProfileStore.getState().uploadAvatar(result.assets[0].uri);
                setAvatarUrl(uploadedUrl);
            } catch (err: any) {
                Alert.alert('Upload Error', err.message);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        setLoading(true);
        console.log('handleSave triggered. Current avatarUrl state:', avatarUrl);
        try {
            await updateProfile({
                name,
                date_of_birth: dob,
                height_cm: parseFloat(height),
                weight_kg: parseFloat(weight),
                city,
                area,
                avatar_url: avatarUrl
            });
            Alert.alert('Success', 'Profile updated successfully');
        } catch (err: any) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access location was denied');
            return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
        });

        if (address) {
            setCity(address.city || '');
            setArea(address.district || address.name || '');
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Profile" />
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.xl }]}>

                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <Pressable style={styles.avatarPlaceholder} onPress={pickImage} disabled={uploading}>
                        {avatarUrl ? (
                            <Image
                                source={{ uri: `https://workout-tracker-l00l.onrender.com${avatarUrl}` }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarInitial}>{name?.[0]?.toUpperCase() || '?'}</Text>
                        )}
                        {uploading && (
                            <View style={styles.uploadingOverlay}>
                                <Text style={styles.uploadingText}>...</Text>
                            </View>
                        )}
                    </Pressable>
                    <Pressable style={styles.changePicBtn} onPress={pickImage} disabled={uploading}>
                        <Text style={styles.changePicText}>{uploading ? 'UPLOADING...' : 'CHANGE PHOTO'}</Text>
                    </Pressable>
                </View>

                {/* Display Age */}
                {age !== null && (
                    <View style={styles.ageBadge}>
                        <Text style={styles.ageText}>{age} YEARS OLD</Text>
                    </View>
                )}

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>FULL NAME</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="John Doe"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>DATE OF BIRTH (YYYY-MM-DD)</Text>
                        <TextInput
                            style={styles.input}
                            value={dob}
                            onChangeText={setDob}
                            placeholder="1995-05-20"
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>HEIGHT (CM)</Text>
                            <TextInput
                                style={styles.input}
                                value={height}
                                onChangeText={setHeight}
                                placeholder="180"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>WEIGHT (KG)</Text>
                            <TextInput
                                style={styles.input}
                                value={weight}
                                onChangeText={setWeight}
                                placeholder="75"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>
                    </View>

                    <View style={styles.locationSection}>
                        <View style={styles.locationHeader}>
                            <Text style={styles.label}>LOCATION</Text>
                            <Pressable onPress={fetchLocation}>
                                <Text style={styles.gpsText}>GET GPS</Text>
                            </Pressable>
                        </View>
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={area}
                                onChangeText={setArea}
                                placeholder="Area/District"
                                placeholderTextColor={Colors.textSecondary}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={city}
                                onChangeText={setCity}
                                placeholder="City"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>
                    </View>

                    <Pressable
                        style={[styles.saveButton, (loading || uploading) && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={loading || uploading}
                    >
                        <Text style={styles.saveButtonText}>
                            {loading ? 'SAVING...' : uploading ? 'UPLOADING PHOTO...' : 'SAVE CHANGES'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
        marginBottom: Spacing.m,
    },
    avatarInitial: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadingText: {
        color: Colors.text,
        fontWeight: 'bold',
    },
    changePicBtn: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.m,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    changePicText: {
        color: Colors.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    ageBadge: {
        backgroundColor: 'rgba(212, 255, 0, 0.1)',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.xs,
        borderRadius: 12,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(212, 255, 0, 0.2)',
    },
    ageText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    form: {
        width: '100%',
        gap: Spacing.m,
    },
    inputGroup: {
        gap: Spacing.xs,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: Colors.textSecondary,
        letterSpacing: 1,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: Spacing.m,
        color: Colors.text,
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    locationSection: {
        marginTop: Spacing.s,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    gpsText: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: Spacing.l,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    saveButtonText: {
        color: Colors.background,
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    },
});
