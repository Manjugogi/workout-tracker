import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHistoryStore } from '../store/historyStore';

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

    const durationInterval = useRef<NodeJS.Timeout | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setPermissionStatus(status);
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to track runs.');
            }
        })();

        return () => stopRun();
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
                        // Simple noise filter: ignore jumps > 50m/sec (impossible speed)
                        if (dist < 50) {
                            setDistance(d => d + dist);
                        }
                    }
                    return [...prev, newLoc];
                });
            }
        );
    };

    const { addLog } = useHistoryStore();

    const stopRun = () => {
        setIsRunning(false);
        if (durationInterval.current) clearInterval(durationInterval.current);
        if (locationSubscription.current) locationSubscription.current.remove();

        if (duration > 2) { // Only save if longer than 2 seconds
            addLog({
                type: 'Run',
                name: 'Outdoor Run',
                duration: duration,
                distance: distance
            });
            Alert.alert('Run Saved', `You ran ${(distance / 1000).toFixed(2)}km in ${formatTime(duration)}`);
        }
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
            { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }
        ]}>
            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>DISTANCE (km)</Text>
                    <Text style={styles.statValue}>{(distance / 1000).toFixed(2)}</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>DURATION</Text>
                    <Text style={styles.statValue}>{formatTime(duration)}</Text>
                </View>

                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>AVG PACE (/km)</Text>
                    <Text style={styles.statValue}>{getPace()}</Text>
                </View>
            </View>

            <Pressable
                style={[styles.button, isRunning ? styles.stopBtn : styles.startBtn]}
                onPress={isRunning ? stopRun : startRun}
            >
                <Text style={styles.btnText}>{isRunning ? 'STOP RUN' : 'START RUN'}</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        padding: Spacing.l,
    },
    statsContainer: {
        gap: Spacing.xl,
        marginBottom: Spacing.xl * 2,
    },
    statBox: {
        alignItems: 'center',
    },
    statLabel: {
        ...Typography.caption,
        fontSize: 14,
        marginBottom: Spacing.xs,
        letterSpacing: 2,
    },
    statValue: {
        ...Typography.h1,
        fontSize: 64,
        color: Colors.primary,
        fontWeight: '800', // Extra bold
    },
    button: {
        paddingVertical: Spacing.l,
        borderRadius: 16,
        alignItems: 'center',
    },
    startBtn: {
        backgroundColor: Colors.primary,
    },
    stopBtn: {
        backgroundColor: Colors.secondary,
    },
    btnText: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.background,
        letterSpacing: 1,
    },
});
