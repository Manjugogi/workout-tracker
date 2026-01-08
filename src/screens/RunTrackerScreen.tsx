import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import * as Location from 'expo-location';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistoryStore } from '../store/historyStore';
import { generateWorkoutName } from '../utils/nameGenerator';
import { calculateCalories } from '../utils/calorieCalculator';
import { useProfileStore } from '../store/profileStore';

import { CustomBackButton } from '../components/CustomBackButton';

// Haversine formula for distance in meters
const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export const RunTrackerScreen = () => {
    const insets = useSafeAreaInsets();
    const [isRunning, setIsRunning] = useState(false);
    const [distance, setDistance] = useState(0); // in meters
    const [duration, setDuration] = useState(0); // in seconds
    const [locations, setLocations] = useState<Location.LocationObject[]>([]);
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
    const [runName, setRunName] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [liveCalories, setLiveCalories] = useState(0);

    const durationInterval = useRef<NodeJS.Timeout | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        const init = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to track runs.');
            }
        };
        init();

        return () => {
            stopRun();
        };
    }, []);

    const startRun = async () => {
        if (permissionStatus !== 'granted') {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            setPermissionStatus(status);
        }

        setIsRunning(true);
        setDistance(0);
        setDuration(0);
        setLocations([]);

        // Start Timer
        durationInterval.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        // Start GPS
        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 1000,
                distanceInterval: 5,
            },
            (newLoc) => {
                setLocations((prev) => {
                    if (prev.length > 0) {
                        const lastLoc = prev[prev.length - 1];
                        const dist = getDistanceFromLatLonInM(
                            lastLoc.coords.latitude, lastLoc.coords.longitude,
                            newLoc.coords.latitude, newLoc.coords.longitude
                        );
                        if (dist < 50) {
                            setDistance(d => d + dist);
                        }
                    }
                    return [...prev, newLoc];
                });
            }
        );
    };

    // Live Calorie Update
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                const userWeight = useProfileStore.getState().profile?.weight_kg || 70;
                const cal = calculateCalories('Run', duration, userWeight);
                setLiveCalories(cal);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, duration]);

    const { addLog } = useHistoryStore();

    const stopRun = async () => {
        setIsRunning(false);
        if (durationInterval.current) clearInterval(durationInterval.current);
        if (locationSubscription.current) locationSubscription.current.remove();

        if (duration > 5) {
            setRunName(generateWorkoutName('Run'));
            setIsFinished(true);
        } else {
            // If too short, just reset
            setDistance(0);
            setDuration(0);
        }
    };

    const saveRun = async () => {
        const userWeight = useProfileStore.getState().profile?.weight_kg || 70;
        const calories = calculateCalories('Run', duration, userWeight);

        await addLog({
            type: 'Run',
            name: runName || 'Outdoor Run',
            duration_seconds: duration,
            distance_meters: distance,
            calories_burned: calories
        });

        setIsFinished(false);
        setDistance(0);
        setDuration(0);
        Alert.alert('Success', 'Run saved to history!');
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        const h = Math.floor(m / 60);
        const mm = m % 60;
        return h > 0 ? `${h}:${mm.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
    };

    const getPace = () => {
        if (distance === 0) return '0:00';
        const k = distance / 1000;
        const m = duration / 60;
        const paceVal = m / k; // min per km
        const pMin = Math.floor(paceVal);
        const pSec = Math.floor((paceVal - pMin) * 60);
        return `${pMin}:${pSec.toString().padStart(2, '0')}`;
    };

    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top + Spacing.m, paddingBottom: insets.bottom + Spacing.m }
        ]}>
            {/* Header */}
            <View style={styles.header}>
                <CustomBackButton />
                <Text style={styles.headerTitle}>RUN TRACKER</Text>
                <View style={{ width: 60 }} />
            </View>

            {/* Main Stats Display */}
            <View style={styles.mainDashboard}>
                <View style={styles.centerCircle}>
                    <Text style={styles.distanceText}>{(distance / 1000).toFixed(2)}</Text>
                    <Text style={styles.distanceLabel}>KILOMETERS</Text>
                </View>

                {/* Sub Stats arranged around */}
                <View style={[styles.subStatBox, styles.statTopLeft]}>
                    <Text style={styles.subStatLabel}>PACE</Text>
                    <Text style={styles.subStatValue}>{getPace()}</Text>
                    <Text style={styles.subStatUnit}>/KM</Text>
                </View>

                <View style={[styles.subStatBox, styles.statBottomRight]}>
                    <Text style={styles.subStatLabel}>TIME</Text>
                    <Text style={styles.subStatValue}>{formatTime(duration)}</Text>
                </View>

                <View style={[styles.subStatBox, styles.statBottomLeft]}>
                    <Text style={styles.subStatLabel}>BURN</Text>
                    <Text style={styles.subStatValue}>{liveCalories}</Text>
                    <Text style={styles.subStatUnit}>KCAL</Text>
                </View>
            </View>

            {/* Live Location Feedback (Mock Visual) */}
            <View style={styles.locationContainer}>
                <View style={styles.pulseContainer}>
                    <View style={styles.pulseDot} />
                    {isRunning && <View style={styles.pulseRing} />}
                </View>
                <Text style={styles.locationStatus}>
                    {isRunning ? 'TRACKING LIVE GPS...' : 'GPS READY'}
                </Text>
            </View>

            {/* Action Button */}
            <View style={styles.footer}>
                <Pressable
                    style={[styles.actionButton, isRunning ? styles.stopBtn : styles.startBtn]}
                    onPress={isRunning ? stopRun : startRun}
                >
                    <Text style={styles.actionButtonText}>
                        {isRunning ? 'FINISH RUN' : 'START RUN'}
                    </Text>
                </Pressable>
            </View>

            {/* Finish Summary Modal/Overlay */}
            {isFinished && (
                <View style={styles.finishOverlay}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>RUN COMPLETE!</Text>

                        <View style={styles.nameEditRow}>
                            <TextInput
                                style={styles.runNameInput}
                                value={runName}
                                onChangeText={setRunName}
                                placeholder="Name your run..."
                                placeholderTextColor={Colors.textSecondary}
                            />
                        </View>

                        <View style={styles.summaryStatsRow}>
                            <View style={styles.summaryStatItem}>
                                <Text style={styles.summaryStatLabel}>DISTANCE</Text>
                                <Text style={styles.summaryStatValue}>{(distance / 1000).toFixed(2)}</Text>
                                <Text style={styles.summaryStatUnit}>KM</Text>
                            </View>
                            <View style={styles.summaryStatItem}>
                                <Text style={styles.summaryStatLabel}>CALORIES</Text>
                                <Text style={styles.summaryStatValue}>{calculateCalories('Run', duration, useProfileStore.getState().profile?.weight_kg || 70)}</Text>
                                <Text style={styles.summaryStatUnit}>KCAL</Text>
                            </View>
                        </View>

                        <Pressable style={styles.saveRunBtn} onPress={saveRun}>
                            <Text style={styles.saveRunBtnText}>SAVE RUN</Text>
                        </Pressable>

                        <Pressable style={styles.discardBtn} onPress={() => setIsFinished(false)}>
                            <Text style={styles.discardBtnText}>DISCARD</Text>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.l,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    headerTitle: {
        ...Typography.h2,
        color: Colors.text,
        letterSpacing: 2,
    },
    mainDashboard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerCircle: {
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 30,
        elevation: 15,
    },
    distanceText: {
        fontSize: 100,
        fontWeight: '900',
        color: Colors.primary,
        fontFamily: 'System', // Bold numerals
    },
    distanceLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 4,
        marginTop: -10,
    },
    subStatBox: {
        position: 'absolute',
        backgroundColor: Colors.surface,
        padding: Spacing.m,
        borderRadius: 20,
        minWidth: 100,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    statTopLeft: {
        top: '15%',
        left: 0,
    },
    statBottomRight: {
        bottom: '15%',
        right: 0,
    },
    statBottomLeft: {
        bottom: '15%',
        left: 0,
    },
    subStatLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    subStatValue: {
        fontSize: 24,
        color: Colors.text,
        fontWeight: 'bold',
    },
    subStatUnit: {
        fontSize: 10,
        color: Colors.textSecondary,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.s,
        marginBottom: Spacing.xl,
    },
    pulseContainer: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.success,
    },
    pulseRing: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Colors.success,
        opacity: 0.5,
    },
    locationStatus: {
        ...Typography.caption,
        color: Colors.textSecondary,
        opacity: 0.8,
    },
    footer: {
        marginBottom: Spacing.l,
    },
    actionButton: {
        paddingVertical: Spacing.l,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: Colors.background,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    startBtn: {
        backgroundColor: Colors.primary,
    },
    stopBtn: {
        backgroundColor: Colors.secondary,
    },
    actionButtonText: {
        fontSize: 20,
        fontWeight: '900',
        color: Colors.background,
        letterSpacing: 2,
    },
    finishOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        padding: Spacing.l,
    },
    summaryCard: {
        width: '100%',
        backgroundColor: Colors.surface,
        borderRadius: 32,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 255, 0, 0.2)',
    },
    summaryTitle: {
        ...Typography.h2,
        color: Colors.text,
        marginBottom: Spacing.l,
        letterSpacing: 2,
    },
    nameEditRow: {
        width: '100%',
        marginBottom: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 255, 0, 0.2)',
        paddingBottom: Spacing.s,
    },
    runNameInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
    },
    summaryStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: Spacing.xl,
    },
    summaryStatItem: {
        alignItems: 'center',
    },
    summaryStatLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
        marginBottom: 4,
    },
    summaryStatValue: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
    },
    summaryStatUnit: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
    saveRunBtn: {
        backgroundColor: Colors.primary,
        width: '100%',
        paddingVertical: Spacing.l,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    saveRunBtnText: {
        color: Colors.background,
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 1,
    },
    discardBtn: {
        paddingVertical: Spacing.m,
    },
    discardBtnText: {
        color: Colors.error,
        fontWeight: 'bold',
        fontSize: 14,
    },
});
