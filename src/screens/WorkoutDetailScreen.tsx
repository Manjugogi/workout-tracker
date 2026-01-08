import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Colors, Spacing, Typography } from '../theme/theme';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomBackButton } from '../components/CustomBackButton';

const API_URL = 'https://workout-tracker-l00l.onrender.com/api';

export const WorkoutDetailScreen = ({ route }: any) => {
    const { logId } = route.params;
    const insets = useSafeAreaInsets();
    const token = useAuthStore(state => state.token);
    const [log, setLog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(`${API_URL}/history/${logId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLog(data);
                }
            } catch (err) {
                console.error('Fetch detail error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [logId, token]);

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!log) {
        return (
            <View style={[styles.container, styles.center]}>
                <CustomBackButton />
                <Text style={[Typography.h3, { marginTop: Spacing.xl }]}>Workout not found</Text>
                <Text style={[Typography.body, { textAlign: 'center', opacity: 0.7, padding: Spacing.l }]}>
                    This might be a legacy workout from before the latest update. Detailed breakdown is only available for new sessions.
                </Text>
            </View>
        );
    }

    const date = log.created_at ? parseISO(log.created_at) : new Date();

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + Spacing.m }]}>
                <CustomBackButton />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>{log.name.toUpperCase()}</Text>
                    <Text style={styles.headerDate}>{format(date, 'EEEE, MMM d, yyyy • HH:mm')}</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Visual Stats Row */}
                <View style={styles.statsDashboard}>
                    <View style={styles.dashItem}>
                        <Text style={styles.dashValue}>{Math.round(log.calories_burned || 0)}</Text>
                        <Text style={styles.dashLabel}>KCAL BURNED</Text>
                    </View>
                    <View style={styles.dashDivider} />
                    <View style={styles.dashItem}>
                        <Text style={styles.dashValue}>{Math.floor(log.duration_seconds / 60)}m</Text>
                        <Text style={styles.dashLabel}>DURATION</Text>
                    </View>
                    {log.type === 'Run' && log.distance_meters > 0 && (
                        <>
                            <View style={styles.dashDivider} />
                            <View style={styles.dashItem}>
                                <Text style={styles.dashValue}>{(log.distance_meters / 1000).toFixed(2)}</Text>
                                <Text style={styles.dashLabel}>KM DISTANCE</Text>
                            </View>
                        </>
                    )}
                </View>

                {/* Exercises List */}
                {log.exercises && log.exercises.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>EXERCISE BREAKDOWN</Text>
                        {log.exercises.map((ex: any, index: number) => (
                            <View key={ex.id || index} style={styles.exerciseCard}>
                                <View style={styles.exOrder}>
                                    <Text style={styles.exOrderText}>{index + 1}</Text>
                                </View>
                                <View style={styles.exContent}>
                                    <Text style={styles.exName}>{ex.name}</Text>
                                    <View style={styles.exDetails}>
                                        {ex.sets > 0 && <Text style={styles.exDetailItem}>{ex.sets} Sets</Text>}
                                        {ex.reps > 0 && <Text style={styles.exDetailItem}>{ex.reps} Reps</Text>}
                                        {ex.weight_kg > 0 && <Text style={styles.exDetailItem}>{ex.weight_kg}kg</Text>}
                                        {ex.duration_seconds > 0 && (
                                            <Text style={styles.exDetailItem}>
                                                {Math.floor(ex.duration_seconds / 60)}m {ex.duration_seconds % 60}s
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
        backgroundColor: Colors.surface,
        paddingBottom: Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerInfo: {
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.h3,
        color: Colors.primary,
        letterSpacing: 1,
    },
    headerDate: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: 'bold',
    },
    content: {
        padding: Spacing.m,
    },
    statsDashboard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 24,
        padding: Spacing.xl,
        marginVertical: Spacing.m,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 255, 0, 0.1)',
    },
    dashItem: {
        flex: 1,
        alignItems: 'center',
    },
    dashValue: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
    },
    dashLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 1,
        marginTop: 4,
    },
    dashDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    section: {
        marginTop: Spacing.l,
    },
    sectionTitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginBottom: Spacing.m,
        paddingLeft: 4,
    },
    exerciseCard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: Spacing.m,
        marginBottom: Spacing.s,
        alignItems: 'center',
    },
    exOrder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(212, 255, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    exOrderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    exContent: {
        flex: 1,
    },
    exName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    exDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    exDetailItem: {
        fontSize: 12,
        color: Colors.textSecondary,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    }
});
