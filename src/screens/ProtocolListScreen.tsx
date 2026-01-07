import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useProtocolStore, Protocol } from '../store/protocolStore';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ProtocolListScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { protocols, deleteProtocol } = useProtocolStore();

    const renderItem = ({ item }: { item: Protocol }) => (
        <Pressable
            style={styles.card}
            onPress={() => navigation.navigate('ActiveWorkout', { protocolId: item.id, name: item.name })}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                </View>
                <Pressable
                    style={styles.editButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        navigation.navigate('ProtocolCreator', { protocolId: item.id });
                    }}
                >
                    <Text style={styles.editButtonText}>EDIT</Text>
                </Pressable>
            </View>
            <Text style={styles.exerciseCount}>{item.exercises.length} Exercises</Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            {protocols.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No protocols yet.</Text>
                    <Text style={styles.emptySubText}>Create your first workout routine to get started.</Text>
                </View>
            ) : (
                <FlatList
                    data={protocols}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <Pressable
                style={[styles.fab, { bottom: Spacing.xl + insets.bottom, right: Spacing.xl + insets.right }]}
                onPress={() => navigation.navigate('ProtocolCreator')}
            >
                <Text style={styles.fabText}>+</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        borderLeftColor: Colors.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    cardTitle: {
        ...Typography.h3,
    },
    cardCategory: {
        ...Typography.caption,
        color: Colors.primary,
        textTransform: 'uppercase',
        fontWeight: '700',
    },
    exerciseCount: {
        ...Typography.body,
        color: Colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        // Bottom and right are now handled dynamically in the component
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    fabText: {
        fontSize: 32,
        color: Colors.background,
        fontWeight: 'bold',
        marginTop: -4, // Optical alignment
    },
    editButton: {
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 8,
        justifyContent: 'center',
    },
    editButtonText: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: 'bold',
    },
});
