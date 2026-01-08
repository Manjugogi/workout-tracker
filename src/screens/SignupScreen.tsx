import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useAuthStore } from '../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignupScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const signup = useAuthStore((state) => state.signup);

    const handleSignup = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (!EMAIL_REGEX.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            setError(''); // Clear previous errors
            await signup(email, password);
        } catch (err: any) {
            setError(err.message || 'Signup failed. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={Typography.h1}>Join Us</Text>
                    <Text style={styles.subtitle}>Start your fitness journey today</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={Colors.textSecondary}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Create a password"
                            placeholderTextColor={Colors.textSecondary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor={Colors.textSecondary}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity style={styles.button} onPress={handleSignup}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkTextBold}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    header: {
        marginBottom: Spacing.xl * 2,
    },
    subtitle: {
        ...Typography.body,
        color: Colors.textSecondary,
        marginTop: Spacing.s,
    },
    form: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: Spacing.l,
    },
    label: {
        ...Typography.caption,
        color: Colors.primary,
        marginBottom: Spacing.s,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: Spacing.m,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
        fontSize: 16,
    },
    errorText: {
        color: Colors.error,
        marginBottom: Spacing.m,
        textAlign: 'center',
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: Spacing.m,
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    buttonText: {
        color: Colors.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: Spacing.l,
        alignItems: 'center',
    },
    linkText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    linkTextBold: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
});
