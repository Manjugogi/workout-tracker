import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';

export const HomeScreen = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    return (
        <View style={styles.container}>
            {/* Minimal Top Header */}
            <View style={[styles.topHeader, { paddingTop: insets.top + Spacing.m }]}>
                <Pressable
                    style={styles.userBadge}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.userInitial}>{user?.email?.[0]?.toUpperCase() || 'U'}</Text>
                </Pressable>
                <Pressable onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutBtnText}>LOGOUT</Text>
                </Pressable>
            </View>

            <View style={styles.heroSection}>
                <Text style={styles.greeting}>READY FOR</Text>
                <Text style={styles.brandTitle}>YOUR GAINS?</Text>
                <View style={styles.accentLine} />
            </View>

            <View style={styles.menuGrid}>
                <Pressable
                    style={[styles.menuCard, styles.primaryCard]}
                    onPress={() => navigation.navigate('Protocols')}
                >
                    <View style={styles.cardIconCircle}>
                        <Text style={styles.cardIconText}>💪</Text>
                    </View>
                    <Text style={styles.cardTitle}>ROUTINES</Text>
                    <Text style={styles.cardSubtitle}>Manage Workouts</Text>
                </Pressable>

                <View style={styles.row}>
                    <Pressable
                        style={[styles.menuCard, styles.halfCard, styles.secondaryCard]}
                        onPress={() => navigation.navigate('RunTracker')}
                    >
                        <Text style={styles.cardIconTextSmall}>🏃</Text>
                        <Text style={styles.cardTitleSmall}>RUNS</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.menuCard, styles.halfCard, styles.tertiaryCard]}
                        onPress={() => navigation.navigate('History')}
                    >
                        <Text style={styles.cardIconTextSmall}>📊</Text>
                        <Text style={styles.cardTitleSmall}>HISTORY</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>LOGGED IN AS: {user?.email}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
    },
    topHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    userBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    userInitial: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    logoutBtn: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.m,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
    },
    logoutBtnText: {
        color: Colors.error,
        fontWeight: 'bold',
        fontSize: 10,
        letterSpacing: 1,
    },
    heroSection: {
        marginTop: Spacing.l,
        marginBottom: Spacing.xl * 1.5,
    },
    greeting: {
        ...Typography.h2,
        color: Colors.textSecondary,
        letterSpacing: 4,
        fontSize: 20,
    },
    brandTitle: {
        ...Typography.h1,
        fontSize: 48,
        color: Colors.primary,
        fontWeight: '900',
        lineHeight: 52,
    },
    accentLine: {
        width: 60,
        height: 6,
        backgroundColor: Colors.primary,
        marginTop: Spacing.s,
        borderRadius: 3,
    },
    menuGrid: {
        gap: Spacing.m,
        justifyContent: 'center',
    },
    menuCard: {
        borderRadius: 24,
        padding: Spacing.xl,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    primaryCard: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    secondaryCard: {
        backgroundColor: Colors.primary,
    },
    tertiaryCard: {
        backgroundColor: Colors.secondary,
    },
    halfCard: {
        flex: 1,
        padding: Spacing.l,
        height: 140,
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    cardIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    cardIconText: {
        fontSize: 32,
    },
    cardIconTextSmall: {
        fontSize: 28,
        marginBottom: Spacing.s,
    },
    cardTitle: {
        ...Typography.h2,
        color: Colors.text,
        fontSize: 24,
        letterSpacing: 2,
    },
    cardTitleSmall: {
        ...Typography.caption,
        color: Colors.background,
        fontWeight: '900',
        fontSize: 14,
        letterSpacing: 1,
    },
    cardSubtitle: {
        ...Typography.caption,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: Spacing.xl,
    },
    footerText: {
        fontSize: 10,
        color: Colors.textSecondary,
        opacity: 0.5,
        letterSpacing: 1,
    },
});
