import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }
        ]}>
            <Text style={Typography.h1}>Workout Tracker</Text>

            <View style={styles.menu}>
                <Pressable
                    style={styles.card}
                    onPress={() => navigation.navigate('Protocols')}
                >
                    <Text style={styles.cardTitle}>My Protocols</Text>
                    <Text style={styles.cardDesc}>Create and manage workout routines</Text>
                </Pressable>

                <Pressable
                    style={styles.card}
                    onPress={() => navigation.navigate('RunTracker')}
                >
                    <Text style={styles.cardTitle}>Run Tracker</Text>
                    <Text style={styles.cardDesc}>GPS stats for running & walking</Text>
                </Pressable>

                <Pressable
                    style={styles.card}
                    onPress={() => navigation.navigate('History')}
                >
                    <Text style={styles.cardTitle}>History</Text>
                    <Text style={styles.cardDesc}>View past workouts</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.m,
        justifyContent: 'center',
    },
    menu: {
        marginTop: Spacing.xl,
        gap: Spacing.m,
    },
    card: {
        backgroundColor: Colors.surface,
        padding: Spacing.l,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    cardTitle: {
        ...Typography.h3,
        marginBottom: Spacing.xs,
    },
    cardDesc: {
        ...Typography.caption,
    },
});
