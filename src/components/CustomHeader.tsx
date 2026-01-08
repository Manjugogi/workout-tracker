import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomBackButton } from './CustomBackButton';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    title: string;
    showBack?: boolean;
}

export const CustomHeader = ({ title, showBack = true }: Props) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                {showBack && (
                    <View style={styles.left}>
                        <CustomBackButton />
                    </View>
                )}
                <View style={styles.center}>
                    <Text style={styles.title} numberOfLines={1}>{title.toUpperCase()}</Text>
                </View>
                <View style={styles.right} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: Colors.background,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.m,
    },
    left: {
        position: 'absolute',
        left: Spacing.m,
        zIndex: 10,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 50,
    },
    right: {
        position: 'absolute',
        right: Spacing.m,
        zIndex: 10,
    },
    title: {
        ...Typography.h3,
        color: Colors.text,
        letterSpacing: 2,
        fontWeight: '900',
        textAlign: 'center',
    },
});
