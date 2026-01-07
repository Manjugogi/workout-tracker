import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme/theme';

export const PlaceholderScreen = ({ route }: any) => {
    const name = route?.params?.name || 'Screen';

    return (
        <View style={styles.container}>
            <Text style={Typography.h2}>{name}</Text>
            <Text style={Typography.body}>Coming Soon</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
