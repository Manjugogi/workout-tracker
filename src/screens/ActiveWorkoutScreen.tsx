import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Vibration, TextInput } from 'react-native';
import { useProtocolStore, Protocol, Exercise } from '../store/protocolStore';
import { useHistoryStore } from '../store/historyStore';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
import { Colors, Spacing, Typography } from '../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomBackButton } from '../components/CustomBackButton';
import { generateWorkoutName } from '../utils/nameGenerator';
import { calculateCalories } from '../utils/calorieCalculator';
import { useProfileStore } from '../store/profileStore';

type WorkoutStep = 'PREPARE' | 'WORK' | 'REST' | 'FINISHED';

export const ActiveWorkoutScreen = ({ route, navigation }: any) => {
    const insets = useSafeAreaInsets();
    const { protocolId } = route.params;
    const { protocols } = useProtocolStore();

    const protocol = protocols.find(p => p.id === protocolId);
    const [currentUrnIndex, setCurrentUrnIndex] = useState(0);
    const [step, setStep] = useState<WorkoutStep>('PREPARE');
    const [currentDuration, setCurrentDuration] = useState(5);
    const [currentSet, setCurrentSet] = useState(1);
    const [workoutName, setWorkoutName] = useState('');
    const [isNaming, setIsNaming] = useState(false);
    const [totalWorkSeconds, setTotalWorkSeconds] = useState(0);
    const [liveCalories, setLiveCalories] = useState(0);
    const currentStepStartTime = React.useRef(Date.now());

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
            currentStepStartTime.current = Date.now();
            if (currentExercise?.duration) {
                setCurrentDuration(currentExercise.duration);
            } else {
                setCurrentDuration(0);
            }
        } else if (step === 'WORK') {
            // Calculate actual time spent in this WORK step
            const actualStepSeconds = Math.floor((Date.now() - currentStepStartTime.current) / 1000);
            setTotalWorkSeconds(prev => prev + actualStepSeconds);

            const totalSets = currentExercise?.sets || 1;

            if ((currentExercise?.rest ?? 0) > 0) {
                setStep('REST');
                setCurrentDuration(currentExercise!.rest!);
            } else {
                if (currentSet < totalSets) {
                    setCurrentSet(prev => prev + 1);
                    setStep('WORK');
                    currentStepStartTime.current = Date.now();
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
                currentStepStartTime.current = Date.now();
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
            currentStepStartTime.current = Date.now();
            const nextEx = protocol?.exercises[currentUrnIndex + 1];
            if (nextEx?.duration) {
                setCurrentDuration(nextEx.duration);
            } else {
                setCurrentDuration(0);
            }
        } else {
            setStep('FINISHED');
            setWorkoutName(generateWorkoutName('Protocol'));
        }
    };

    const { timeLeft, isPaused, togglePause, skip } = useWorkoutTimer(currentDuration, handleStepComplete);

    // Live Calorie Update
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'WORK' && !isPaused) {
            interval = setInterval(() => {
                const userWeight = useProfileStore.getState().profile?.weight_kg || 70;
                // Calculate current session calories + current step live calories
                const currentStepSeconds = Math.floor((Date.now() - currentStepStartTime.current) / 1000);
                const totalActiveSeconds = totalWorkSeconds + currentStepSeconds;
                const cal = calculateCalories(protocol?.category || 'Default', totalActiveSeconds, userWeight);
                setLiveCalories(cal);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, isPaused, totalWorkSeconds, protocol?.category]);

    if (!protocol) return null;

    const startTime = React.useRef(Date.now());
    const { addLog } = useHistoryStore();

    const handleFinish = async () => {
        if (protocol) {
            const actualDuration = Math.floor((Date.now() - startTime.current) / 1000);
            const userWeight = useProfileStore.getState().profile?.weight_kg || 70;
            // Use totalWorkSeconds for calories
            const calories = calculateCalories(protocol.category, totalWorkSeconds, userWeight);

            const exercisesLog = protocol.exercises.map(ex => ({
                name: ex.name,
                type: ex.type,
                reps: ex.reps,
                sets: ex.sets,
                weight_kg: ex.weight,
                duration_seconds: ex.duration
            }));

            await addLog({
                type: 'Protocol',
                name: workoutName || protocol.name,
                duration_seconds: actualDuration,
                calories_burned: calories,
                exercises: exercisesLog
            });
        }
        navigation.goBack();
    };

    if (step === 'FINISHED') {
        const actualDuration = Math.floor((Date.now() - startTime.current) / 1000);
        const userWeight = useProfileStore.getState().profile?.weight_kg || 70;
        const calories = calculateCalories(protocol.category, totalWorkSeconds, userWeight);

        return (
            <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
                <View style={styles.successIconContainer}>
                    <Text style={[Typography.h1, { color: Colors.success, fontSize: 80 }]}>✓</Text>
                </View>
                <Text style={[Typography.h1, { color: Colors.text, textAlign: 'center' }]}>WORKOUT COMPLETE!</Text>

                <View style={styles.summaryCard}>
                    <View style={styles.nameEditRow}>
                        <TextInput
                            style={styles.workoutNameInput}
                            value={workoutName}
                            onChangeText={setWorkoutName}
                            placeholder="Name your victory..."
                            placeholderTextColor={Colors.textSecondary}
                        />
                    </View>
                    <View style={styles.summaryStats}>
                        <View style={styles.summaryStatItem}>
                            <Text style={styles.summaryStatLabel}>CALORIES</Text>
                            <Text style={styles.summaryStatValue}>{calories}</Text>
                        </View>
                        <View style={styles.summaryStatItem}>
                            <Text style={styles.summaryStatLabel}>TIME</Text>
                            <Text style={styles.summaryStatValue}>
                                {Math.floor(actualDuration / 60)}m {actualDuration % 60}s
                            </Text>
                        </View>
                    </View>
                </View>

                <Pressable style={styles.finishBtn} onPress={handleFinish}>
                    <Text style={styles.finishBtnText}>SAVE SESSION</Text>
                </Pressable>
            </View>
        );
    }

    const isTimerMode = currentDuration > 0;

    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top + Spacing.m, paddingBottom: insets.bottom + Spacing.m }
        ]}>
            {/* Top Bar */}
            <View style={styles.topBar}>
                <CustomBackButton />
                <View style={styles.protocolInfo}>
                    <Text style={styles.protocolName}>{protocol.name.toUpperCase()}</Text>
                    <View style={styles.liveCalContainer}>
                        <Text style={styles.liveCalValue}>{liveCalories}</Text>
                        <Text style={styles.liveCalLabel}> KCAL</Text>
                    </View>
                </View>
            </View>

            {/* Exercise Header */}
            <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>
                    {step === 'REST' ? 'RESTING' : currentExercise?.name}
                </Text>
                <Text style={styles.stepIndicator}>
                    EXERCISE {currentUrnIndex + 1} OF {protocol.exercises.length}
                </Text>
            </View>

            {/* Main Interactive Area */}
            <View style={styles.mainArea}>
                {/* Distributed Details around Center */}
                <View style={[styles.detailBox, styles.topLeft]}>
                    <Text style={styles.detailLabel}>SET</Text>
                    <Text style={styles.detailValue}>{currentSet}/{currentExercise?.sets || 1}</Text>
                </View>

                <View style={[styles.detailBox, styles.topRight]}>
                    <Text style={styles.detailLabel}>NEXT</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                        {currentUrnIndex < protocol.exercises.length - 1
                            ? protocol.exercises[currentUrnIndex + 1].name
                            : 'DONE'}
                    </Text>
                </View>

                {/* Central Timer Circle */}
                <View style={styles.timerContainer}>
                    <View style={[
                        styles.timerCircle,
                        step === 'REST' ? styles.restBorder : step === 'PREPARE' ? styles.prepareBorder : styles.workBorder
                    ]}>
                        {step === 'PREPARE' && <Text style={styles.prepareLabel}>GET READY</Text>}
                        {isTimerMode ? (
                            <Text style={styles.timerText}>{timeLeft}</Text>
                        ) : (
                            <Text style={styles.repValue}>{(currentExercise?.reps || 0)}</Text>
                        )}
                        <Text style={styles.timerSubText}>{isTimerMode ? 'SECONDS' : 'REPS'}</Text>
                    </View>
                </View>

                <View style={[styles.detailBox, styles.bottomLeft]}>
                    <Text style={styles.detailLabel}>WEIGHT</Text>
                    <Text style={styles.detailValue}>{currentExercise?.weight ? `${currentExercise.weight}kg` : '-'}</Text>
                </View>

                <View style={[styles.detailBox, styles.bottomRight]}>
                    <Text style={styles.detailLabel}>TYPE</Text>
                    <Text style={styles.detailValue}>{currentExercise?.type || '-'}</Text>
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.footer}>
                <View style={styles.controlRow}>
                    {isTimerMode && (
                        <Pressable style={styles.secondaryControl} onPress={togglePause}>
                            <Text style={styles.secondaryControlText}>
                                {isPaused ? 'RESUME' : 'PAUSE'}
                            </Text>
                        </Pressable>
                    )}

                    <Pressable
                        style={[styles.mainControl, (step === 'REST' || step === 'PREPARE') && styles.restControl]}
                        onPress={handleStepComplete}
                    >
                        <Text style={styles.mainControlText}>
                            {step === 'PREPARE' ? 'START WORK' : step === 'REST' ? 'SKIP REST' : 'NEXT SET'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.l,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.l,
    },
    protocolInfo: {
        alignItems: 'flex-end',
    },
    protocolName: {
        ...Typography.caption,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    categoryName: {
        fontSize: 12,
        color: Colors.textSecondary,
        opacity: 0.6,
    },
    exerciseHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    exerciseTitle: {
        ...Typography.h1,
        color: Colors.text,
        textAlign: 'center',
        fontSize: 32,
        marginBottom: Spacing.xs,
    },
    stepIndicator: {
        ...Typography.caption,
        letterSpacing: 3,
        color: Colors.textSecondary,
    },
    mainArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerContainer: {
        width: 280,
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerCircle: {
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 12,
        borderColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    workBorder: { borderColor: Colors.primary },
    restBorder: { borderColor: Colors.secondary },
    prepareBorder: { borderColor: Colors.success },
    timerText: {
        fontSize: 100,
        fontWeight: '900',
        color: Colors.text,
        lineHeight: 110,
    },
    repValue: {
        fontSize: 80,
        fontWeight: '900',
        color: Colors.text,
    },
    timerSubText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 4,
        marginTop: -10,
    },
    prepareLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.success,
        letterSpacing: 2,
        marginBottom: -10,
    },
    detailBox: {
        position: 'absolute',
        backgroundColor: Colors.surface,
        padding: Spacing.m,
        borderRadius: 16,
        width: 100,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0 },
    bottomLeft: { bottom: 0, left: 0 },
    bottomRight: { bottom: 0, right: 0 },
    detailLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: 'bold',
    },
    footer: {
        marginTop: Spacing.xl,
    },
    controlRow: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    mainControl: {
        flex: 2,
        backgroundColor: Colors.primary,
        paddingVertical: Spacing.l,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    restControl: {
        backgroundColor: Colors.secondary,
        shadowColor: Colors.secondary,
    },
    mainControlText: {
        color: Colors.background,
        fontWeight: '900',
        fontSize: 18,
        letterSpacing: 1,
    },
    secondaryControl: {
        flex: 1,
        backgroundColor: Colors.surface,
        paddingVertical: Spacing.l,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    secondaryControlText: {
        color: Colors.text,
        fontWeight: 'bold',
        fontSize: 16,
    },
    successIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    finishBtn: {
        backgroundColor: Colors.text,
        paddingHorizontal: Spacing.xl * 2,
        paddingVertical: Spacing.l,
        borderRadius: 30,
        marginTop: Spacing.xl * 2,
    },
    finishBtnText: {
        color: Colors.background,
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 2,
    },
    summaryCard: {
        width: '100%',
        backgroundColor: Colors.surface,
        borderRadius: 24,
        padding: Spacing.l,
        marginVertical: Spacing.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    nameEditRow: {
        marginBottom: Spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(212, 255, 0, 0.2)',
        paddingBottom: Spacing.s,
    },
    workoutNameInput: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        textAlign: 'center',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryStatItem: {
        alignItems: 'center',
    },
    summaryStatLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        letterSpacing: 2,
        marginBottom: 4,
    },
    summaryStatValue: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.text,
    },
    liveCalContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        backgroundColor: 'rgba(212, 255, 0, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
    },
    liveCalValue: {
        fontSize: 16,
        fontWeight: '900',
        color: Colors.primary,
    },
    liveCalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: Colors.primary,
        opacity: 0.8,
    },
});
