import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, Alert } from 'react-native';
import { useHistoryStore, WorkoutLog } from '../store/historyStore';
import { Colors, Spacing, Typography } from '../theme/theme';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HistoryScreen = () => {
    const insets = useSafeAreaInsets();
    const { logs, clearHistory } = useHistoryStore();

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

    const renderItem = ({ item }: { item: WorkoutLog }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDate}>{format(item.date, 'MMM d, yyyy')}</Text>
            </View>
            <View style={styles.statsRow}>
                <Text style={styles.stat}>{Math.floor(item.duration / 60)}m {item.duration % 60}s</Text>
                {item.type === 'Run' && (item.distance ?? 0) > 0 && (
                    <Text style={styles.stat}>{(item.distance! / 1000).toFixed(2)} km</Text>
                )}
            </View>
            <Text style={styles.typeBadge}>{item.type}</Text>
        </View>
    );

    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }
        ]}>
            {logs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No history yet.</Text>
                    <Text style={styles.emptySubText}>Complete a workout or run to see it here.</Text>
                </View>
            ) : (
                <>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerTitle}>Recent Activity</Text>
                        <Pressable onPress={confirmClear}>
                            <Text style={styles.clearText}>Clear All</Text>
                        </Pressable>
                    </View>
                    <FlatList
                        data={logs}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
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
        padding: Spacing.m,
    },
    headerTitle: {
        ...Typography.h2,
    },
    clearText: {
        color: Colors.error,
        fontWeight: 'bold',
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
        padding: Spacing.m,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.secondary, // Different color for logs? or logic based
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    cardTitle: {
        ...Typography.h3,
        fontSize: 18,
    },
    cardDate: {
        ...Typography.caption,
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.l,
        marginTop: Spacing.s,
    },
    stat: {
        ...Typography.body,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    typeBadge: {
        position: 'absolute',
        bottom: Spacing.m,
        right: Spacing.m,
        ...Typography.caption,
        color: Colors.textSecondary,
        opacity: 0.5,
        textTransform: 'uppercase',
    }
});
