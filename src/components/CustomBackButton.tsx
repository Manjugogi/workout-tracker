import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing } from '../theme/theme';

export const CustomBackButton = ({ style }: { style?: any }) => {
    const navigation = useNavigation();

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                style
            ]}
            onPress={() => navigation.goBack()}
        >
            <Text style={styles.chevron}>‹</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.7,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        transform: [{ scale: 0.96 }],
    },
    chevron: {
        color: Colors.primary,
        fontSize: 32,
        fontWeight: '300',
        marginTop: -4,
        marginLeft: -1,
    },
});
