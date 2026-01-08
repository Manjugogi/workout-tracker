import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useHistoryStore, WorkoutLog } from '../store/historyStore';
import { Colors, Spacing, Typography } from '../theme/theme';
import { format, parseISO } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { CustomHeader } from '../components/CustomHeader';

export const HistoryScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { logs, clearHistory, fetchLogs, deleteLog } = useHistoryStore();

    useEffect(() => {
        fetchLogs();
    }, []);

    const confirmClear = () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to delete all workout history?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: clearHistory },
            ]
        );
    };

    const handleItemPress = (item: WorkoutLog) => {
        navigation.navigate('WorkoutDetail', { logId: item.id });
    };

    const renderItem = ({ item }: { item: WorkoutLog }) => {
        const isRun = item.type === 'Run';
        const date = item.date ? (typeof item.date === 'string' ? parseISO(item.date) : new Date(item.date)) : new Date();

        // Handle legacy data where duration was used instead of duration_seconds
        const durationSeconds = item.duration_seconds || (item as any).duration || 0;
        const distanceMeters = item.distance_meters || (item as any).distance || 0;

        return (
            <Pressable
                style={styles.card}
                onPress={() => handleItemPress(item)}
            >
                <View style={[styles.cardAccent, { backgroundColor: isRun ? Colors.primary : Colors.secondary }]} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <View>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardDate}>{format(date, 'EEEE, MMM d • HH:mm')}</Text>
                        </View>
                        <View style={styles.typeTag}>
                            <Text style={styles.typeTagText}>{item.type.toUpperCase()}</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>
                                {Math.floor(durationSeconds / 60)}<Text style={styles.statUnit}>m</Text> {durationSeconds % 60}<Text style={styles.statUnit}>s</Text>
                            </Text>
                            <Text style={styles.statLabel}>DURATION</Text>
                        </View>

                        {isRun && distanceMeters > 0 && (
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {(distanceMeters / 1000).toFixed(2)}<Text style={styles.statUnit}>km</Text>
                                </Text>
                                <Text style={styles.statLabel}>DISTANCE</Text>
                            </View>
                        )}

                        {item.calories_burned !== undefined && (
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>
                                    {Math.round(item.calories_burned)}<Text style={styles.statUnit}>kcal</Text>
                                </Text>
                                <Text style={styles.statLabel}>BURNED</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader title="Log History" />

            {logs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No history yet.</Text>
                    <Text style={styles.emptySubText}>Complete a workout or run to see it here.</Text>
                </View>
            ) : (
                <>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerSubtitle}>{logs.length} ACTIVITIES</Text>
                        <Pressable onPress={confirmClear}>
                            <Text style={styles.clearText}>CLEAR ALL</Text>
                        </Pressable>
                    </View>
                    <FlatList
                        data={logs}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 20 }]}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingBottom: Spacing.s,
    },
    headerSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    clearText: {
        color: Colors.error,
        fontWeight: 'bold',
        fontSize: 12,
    },
    listContent: {
        padding: Spacing.m,
        gap: Spacing.m,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        ...Typography.h3,
        marginBottom: Spacing.s,
    },
    emptySubText: {
        ...Typography.body,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        overflow: 'hidden',
        flexDirection: 'row',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    cardAccent: {
        width: 6,
    },
    cardContent: {
        flex: 1,
        padding: Spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.m,
    },
    cardTitle: {
        ...Typography.h3,
        fontSize: 18,
        color: Colors.text,
        marginBottom: 2,
    },
    cardDate: {
        ...Typography.caption,
        color: Colors.textSecondary,
        fontSize: 12,
    },
    typeTag: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: Spacing.xl,
    },
    statItem: {
        alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '900',
        color: Colors.text,
    },
    statUnit: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: 'normal',
    },
    statLabel: {
        fontSize: 9,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        marginTop: 2,
        letterSpacing: 1,
    }
});
