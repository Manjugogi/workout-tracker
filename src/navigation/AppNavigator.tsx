import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProtocolListScreen } from '../screens/ProtocolListScreen';
import { ProtocolCreatorScreen } from '../screens/ProtocolCreatorScreen';
import { ActiveWorkoutScreen } from '../screens/ActiveWorkoutScreen';
import { RunTrackerScreen } from '../screens/RunTrackerScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { Colors } from '../theme/theme';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const CustomTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: Colors.background,
        card: Colors.surface,
        text: Colors.text,
        border: Colors.border,
        primary: Colors.primary,
    },
};

const AuthNavigator = () => (
    <AuthStack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <AuthStack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
);

const MainNavigator = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
        <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="Protocols"
            component={ProtocolListScreen}
            options={{ title: 'My Routines' }}
        />
        <Stack.Screen
            name="ProtocolCreator"
            component={ProtocolCreatorScreen}
            options={{ title: 'New Routine' }}
        />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RunTracker" component={RunTrackerScreen} options={{ title: 'Run Tracker' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Log History' }} />
    </Stack.Navigator>
);

export const AppNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer theme={CustomTheme}>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};
