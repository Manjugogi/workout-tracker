import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Vibration } from 'react-native';
import { useProtocolStore, Protocol, Exercise } from '../store/protocolStore';
import { useHistoryStore } from '../store/historyStore';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// No separate import needed if it's already at the top or added to react-native imports

type WorkoutStep = 'PREPARE' | 'WORK' | 'REST' | 'FINISHED';

export const ActiveWorkoutScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { protocolId } = route.params;
    const { protocols } = useProtocolStore();

    const protocol = protocols.find(p => p.id === protocolId);

    // State for workout flow
    const [currentUrnIndex, setCurrentUrnIndex] = useState(0);
    // We flatten the workout into steps: [Exercise1, Rest1, Exercise2, Rest2...]
    // But easier to just track current Exercise Index and a specific "Mode" (Work or Rest)

    const [step, setStep] = useState<WorkoutStep>('PREPARE');
    const [currentDuration, setCurrentDuration] = useState(5); // 5s prepare
    const [currentSet, setCurrentSet] = useState(1);

    useEffect(() => {
        if (!protocol) {
            Alert.alert('Error', 'Protocol not found');
            navigation.goBack();
        }
    }, [protocol, navigation]);

    const currentExercise = protocol?.exercises[currentUrnIndex];

    const handleStepComplete = () => {
        Vibration.vibrate();

        if (step === 'PREPARE') {
            setStep('WORK');
            // Priority: time duration > reps (manual completion)
            if (currentExercise?.duration) {
                setCurrentDuration(currentExercise.duration);
            } else {
                setCurrentDuration(0); // Manual mode
            }
        } else if (step === 'WORK') {
            const totalSets = currentExercise?.sets || 1;

            if ((currentExercise?.rest ?? 0) > 0) {
                setStep('REST');
                setCurrentDuration(currentExercise!.rest!);
            } else {
                if (currentSet < totalSets) {
                    setCurrentSet(prev => prev + 1);
                    setStep('WORK'); // Loop back to work immediately
                    if (currentExercise?.duration) {
                        setCurrentDuration(currentExercise.duration);
                    } else {
                        setCurrentDuration(0);
                    }
                } else {
                    advanceExercise();
                }
            }
        } else if (step === 'REST') {
            const totalSets = currentExercise?.sets || 1;
            if (currentSet < totalSets) {
                setCurrentSet(prev => prev + 1);
                setStep('WORK');
                if (currentExercise?.duration) {
                    setCurrentDuration(currentExercise.duration);
                } else {
                    setCurrentDuration(0);
                }
            } else {
                advanceExercise();
            }
        }
    };

    const advanceExercise = () => {
        if (currentUrnIndex < (protocol?.exercises.length ?? 0) - 1) {
            setCurrentUrnIndex(prev => prev + 1);
            setCurrentSet(1);
            setStep('WORK');
            const nextEx = protocol?.exercises[currentUrnIndex + 1];
            if (nextEx?.duration) {
                setCurrentDuration(nextEx.duration);
            } else {
                setCurrentDuration(0);
            }
        } else {
            setStep('FINISHED');
        }
    };

    const { timeLeft, isPaused, togglePause, skip } = useWorkoutTimer(currentDuration, handleStepComplete);

    if (!protocol) return null;

    const startTime = React.useRef(Date.now());

    // ... existing code ...

    const { addLog } = useHistoryStore();

    const handleFinish = () => {
        if (protocol) {
            const actualDuration = Math.floor((Date.now() - startTime.current) / 1000);
            addLog({
                type: 'Protocol',
                name: protocol.name,
                duration: actualDuration,
            });
        }
        navigation.goBack();
    };

    if (step === 'FINISHED') {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={[Typography.h1, { color: Colors.success }]}>Workout Complete!</Text>
                <Text style={Typography.body}>Great job crushing {protocol.name}</Text>
                <Pressable style={styles.button} onPress={handleFinish}>
                    <Text style={styles.buttonText}>Finish</Text>
                </Pressable>
            </View>
        );
    }

    const isTimerMode = currentDuration > 0;

    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }
        ]}>
            {/* Header Info */}
            <View style={styles.header}>
                <Text style={styles.stepLabel}>
                    {step === 'PREPARE' ? 'GET READY' : step === 'REST' ? 'REST' : `EXERCISE ${currentUrnIndex + 1}/${protocol.exercises.length}`}
                </Text>
                <Text style={styles.setText}>Set {currentSet} / {currentExercise?.sets || 1}</Text>
            </View>

            {/* Main Timer Display */}
            <View style={styles.timerContainer}>
                <View style={[styles.timerCircle, step === 'REST' ? styles.restBorder : styles.workBorder]}>
                    {isTimerMode ? (
                        <Text style={styles.timerText}>{timeLeft}s</Text>
                    ) : (
                        <Text style={styles.repText}>{(currentExercise?.reps || 0) > 0 ? `${currentExercise?.reps} REPS` : 'NO REPS'}</Text>
                    )}
                    <Text style={styles.subText}>{step === 'REST' ? 'Next:' : ''} {step === 'REST' ? protocol.exercises[currentUrnIndex + 1]?.name : currentExercise?.name}</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {isTimerMode && (
                    <Pressable style={styles.controlBtn} onPress={togglePause}>
                        <Text style={styles.controlBtnText}>{isPaused ? 'RESUME' : 'PAUSE'}</Text>
                    </Pressable>
                )}

                <Pressable style={[styles.controlBtn, styles.primaryBtn]} onPress={handleStepComplete}>
                    <Text style={[styles.controlBtnText, styles.primaryBtnText]}>
                        {step === 'PREPARE' ? 'START NOW' : 'NEXT / DONE'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.l,
        justifyContent: 'space-between',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.l,
    },
    header: {
        alignItems: 'center',
    },
    stepLabel: {
        ...Typography.h2,
        color: Colors.textSecondary,
        letterSpacing: 2,
    },
    timerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerCircle: {
        width: 250,
        height: 250,
        borderRadius: 125,
        borderWidth: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.m,
    },
    workBorder: {
        borderColor: Colors.primary,
    },
    restBorder: {
        borderColor: Colors.secondary,
    },
    timerText: {
        fontSize: 80,
        fontWeight: 'bold',
        color: Colors.text,
    },
    repText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.text,
    },
    setText: {
        fontSize: 24,
        fontWeight: '600',
        color: Colors.primary,
        marginTop: Spacing.s,
    },
    subText: {
        ...Typography.h3,
        textAlign: 'center',
        marginTop: Spacing.s,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.l,
    },
    controlBtn: {
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.l,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    controlBtnText: {
        color: Colors.text,
        fontWeight: '600',
    },
    primaryBtn: {
        backgroundColor: Colors.surface,
        borderColor: Colors.primary,
    },
    primaryBtnText: {
        color: Colors.primary,
    },
    button: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.m,
        borderRadius: 24,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.background,
    }
});
