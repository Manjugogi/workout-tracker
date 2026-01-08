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
import { ProfileScreen } from '../screens/ProfileScreen';
import { WorkoutDetailScreen } from '../screens/WorkoutDetailScreen';
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
            headerShown: false
        }}
    >
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
);

const MainNavigator = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false
        }}
    >
        <Stack.Screen
            name="Home"
            component={HomeScreen}
        />
        <Stack.Screen
            name="Protocols"
            component={ProtocolListScreen}
        />
        <Stack.Screen
            name="ProtocolCreator"
            component={ProtocolCreatorScreen}
        />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
        <Stack.Screen name="RunTracker" component={RunTrackerScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
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
