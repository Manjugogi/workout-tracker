import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProtocolListScreen } from '../screens/ProtocolListScreen';
import { ProtocolCreatorScreen } from '../screens/ProtocolCreatorScreen';
import { ActiveWorkoutScreen } from '../screens/ActiveWorkoutScreen';
import { RunTrackerScreen } from '../screens/RunTrackerScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { PlaceholderScreen } from '../screens/PlaceholderScreen';
import { Colors } from '../theme/theme';

const Stack = createNativeStackNavigator();

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

export const AppNavigator = () => {
    return (
        <NavigationContainer theme={CustomTheme}>
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
        </NavigationContainer>
    );
};
