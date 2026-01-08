import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Pressable, Alert, Modal, FlatList } from 'react-native';
import { useProtocolStore, Exercise, ProtocolCategory } from '../store/protocolStore';
import { Colors, Spacing, Typography } from '../theme/theme';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIES, MASTER_EXERCISE_LIST, ExerciseDefinition } from '../data/exerciseCatalog';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomHeader } from '../components/CustomHeader';

export const ProtocolCreatorScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const { addProtocol, updateProtocol, protocols } = useProtocolStore();
    const protocolId = route.params?.protocolId;

    const [name, setName] = useState('');
    const [category, setCategory] = useState<string>(CATEGORIES[0]);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

    // Exercise Selection Modal State
    const [isExerciseModalVisible, setIsExerciseModalVisible] = useState(false);
    const [availableExercises, setAvailableExercises] = useState<ExerciseDefinition[]>([]);
    const [selectedExerciseDef, setSelectedExerciseDef] = useState<ExerciseDefinition | null>(null);

    useEffect(() => {
        if (protocolId) {
            const existing = protocols.find(p => p.id === protocolId);
            if (existing) {
                setName(existing.name);
                setCategory(existing.category);
                setExercises(existing.exercises);
                navigation.setOptions({ title: 'Edit Routine' });
            }
        }
    }, [protocolId, protocols, navigation]);

    // Update available exercises when category changes
    useEffect(() => {
        const filtered = MASTER_EXERCISE_LIST.filter(e => e.category === category);
        setAvailableExercises(filtered);
    }, [category]);

    // Temporary state for new exercise input
    const [exoName, setExoName] = useState('');
    const [exoReps, setExoReps] = useState('');
    const [exoDuration, setExoDuration] = useState('');
    const [exoRest, setExoRest] = useState('30');
    const [exoSets, setExoSets] = useState('1');
    const [exoWeight, setExoWeight] = useState('');
    const [exoDistance, setExoDistance] = useState('');

    const startEditing = (ex: Exercise) => {
        setExoName(ex.name);
        setExoReps(ex.reps ? ex.reps.toString() : '');
        setExoDuration(ex.duration ? (ex.duration / 60).toString() : '');
        setExoRest(ex.rest?.toString() || '30');
        setExoSets(ex.sets?.toString() || '1');
        setExoWeight(ex.weight ? ex.weight.toString() : '');
        setExoDistance(ex.distance ? ex.distance.toString() : '');
        setEditingExerciseId(ex.id);

        // Try to find matching def to set visibility logic
        const match = MASTER_EXERCISE_LIST.find(def => def.name === ex.name);
        setSelectedExerciseDef(match || null);
    };

    const selectExercise = (def: ExerciseDefinition) => {
        setExoName(def.name);
        setSelectedExerciseDef(def);
        setIsExerciseModalVisible(false);
        // Reset fields potentially
        setExoReps('');
        setExoDuration('');
        setExoWeight('');
        setExoDistance('');
    };

    const addOrUpdateExercise = () => {
        if (!exoName) {
            Alert.alert('Validation Check', 'Please enter an exercise name');
            return;
        }

        const exerciseData = {
            name: exoName,
            type: 'Strength' as const,
            reps: exoReps ? parseInt(exoReps) : undefined,
            duration: exoDuration ? parseFloat(exoDuration) * 60 : undefined,
            rest: parseInt(exoRest) || 30,
            sets: parseInt(exoSets) || 1,
            weight: exoWeight ? parseFloat(exoWeight) : undefined,
            distance: exoDistance ? parseFloat(exoDistance) : undefined,
        };

        if (editingExerciseId) {
            setExercises(exercises.map(ex => ex.id === editingExerciseId ? { ...ex, ...exerciseData } : ex));
            setEditingExerciseId(null);
        } else {
            const newExercise: Exercise = {
                id: uuidv4(),
                ...exerciseData
            };
            setExercises([...exercises, newExercise]);
        }

        setExoName('');
        setExoReps('');
        setExoDuration('');
        setExoRest('30');
        setExoSets('1');
        setExoWeight('');
        setExoDistance('');
    };

    const handleSave = () => {
        if (!name) {
            Alert.alert('Missing Info', 'Please give your routine a name');
            return;
        }

        if (exoName) {
            Alert.alert(
                'Unsaved Exercise',
                'You have typed in an exercise but haven\'t added/updated it yet. Please tap "Add/Update Exercise" or clear the fields.'
            );
            return;
        }

        if (exercises.length === 0) {
            Alert.alert('Empty Routine', 'Please add at least one exercise');
            return;
        }

        if (protocolId) {
            updateProtocol(protocolId, {
                name,
                category,
                exercises,
            })
                .then(() => navigation.goBack())
                .catch(err => {
                    Alert.alert('Update Failed', err.message);
                });
        } else {
            addProtocol({
                name,
                category,
                exercises,
            })
                .then(() => navigation.goBack())
                .catch(err => {
                    Alert.alert('Save Failed', err.message);
                });
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader title={protocolId ? 'Edit Routine' : 'New Routine'} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.section}>
                    <Text style={styles.label}>Routine Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g. Morning Cardio"
                        placeholderTextColor={Colors.textSecondary}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.chipContainer}>
                        {CATEGORIES.map((cat: string) => (
                            <Pressable
                                key={cat}
                                style={[styles.chip, category === cat && styles.chipActive]}
                                onPress={() => setCategory(cat)}
                            >
                                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Add Exercise</Text>

                    <Pressable
                        style={styles.exerciseSelector}
                        onPress={() => setIsExerciseModalVisible(true)}
                    >
                        <Text style={[styles.exerciseSelectorText, !exoName && { color: Colors.textSecondary }]}>
                            {exoName || "Select Exercise"}
                        </Text>
                        <Text style={{ color: Colors.primary }}>▼</Text>
                    </Pressable>

                    <View style={styles.row}>
                        {(!selectedExerciseDef || selectedExerciseDef.supported_metrics.includes('reps')) && (
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                value={exoReps}
                                onChangeText={setExoReps}
                                placeholder="Reps"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        )}
                        {(!selectedExerciseDef || selectedExerciseDef.supported_metrics.includes('duration_minutes')) && (
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                value={exoDuration}
                                onChangeText={setExoDuration}
                                placeholder="Duration (min)"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        )}
                        {(!selectedExerciseDef || selectedExerciseDef.supported_metrics.includes('sets')) && (
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                value={exoSets}
                                onChangeText={setExoSets}
                                placeholder="Sets"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        )}
                    </View>

                    <View style={styles.row}>
                        {(!selectedExerciseDef || selectedExerciseDef.supported_metrics.includes('weight_kg')) && (
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                value={exoWeight}
                                onChangeText={setExoWeight}
                                placeholder="Weight (kg)"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        )}
                        {(!selectedExerciseDef || selectedExerciseDef.supported_metrics.includes('distance_km')) && (
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                value={exoDistance}
                                onChangeText={setExoDistance}
                                placeholder="Dist (km)"
                                keyboardType="numeric"
                                placeholderTextColor={Colors.textSecondary}
                            />
                        )}
                    </View>

                    <TextInput
                        style={styles.input}
                        value={exoRest}
                        onChangeText={setExoRest}
                        placeholder="Rest (sec)"
                        keyboardType="numeric"
                        placeholderTextColor={Colors.textSecondary}
                    />
                    <Pressable style={styles.addButton} onPress={addOrUpdateExercise}>
                        <Text style={styles.addButtonText}>{editingExerciseId ? 'Update Exercise' : 'Add Exercise'}</Text>
                    </Pressable>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Exercises List ({exercises.length})</Text>
                    {exercises.map((ex, index) => (
                        <View key={ex.id} style={[styles.exerciseItem, editingExerciseId === ex.id && styles.exerciseItemEditing]}>
                            <View style={styles.exerciseInfo}>
                                <Text style={styles.exerciseIndex}>{index + 1}.</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.exerciseTitle}>{ex.name}</Text>
                                    <Text style={styles.exerciseDetail}>
                                        {ex.sets || 1} sets
                                        {ex.reps ? ` • ${ex.reps} reps` : ''}
                                        {ex.weight ? ` • ${ex.weight}kg` : ''}
                                        {ex.distance ? ` • ${ex.distance}km` : ''}
                                        {ex.duration ? ` • ${ex.duration / 60}m` : ''}
                                        {` • ${ex.rest}s rest`}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.exerciseActions}>
                                <View style={styles.moveButtons}>
                                    <Pressable
                                        onPress={() => {
                                            if (index === 0) return;
                                            const newExs = [...exercises];
                                            [newExs[index - 1], newExs[index]] = [newExs[index], newExs[index - 1]];
                                            setExercises(newExs);
                                        }}
                                        style={[styles.actionBtn, index === 0 && styles.disabledBtn]}
                                    >
                                        <Text style={styles.actionBtnText}>↑</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => {
                                            if (index === exercises.length - 1) return;
                                            const newExs = [...exercises];
                                            [newExs[index + 1], newExs[index]] = [newExs[index], newExs[index + 1]];
                                            setExercises(newExs);
                                        }}
                                        style={[styles.actionBtn, index === exercises.length - 1 && styles.disabledBtn]}
                                    >
                                        <Text style={styles.actionBtnText}>↓</Text>
                                    </Pressable>
                                </View>
                                <Pressable
                                    onPress={() => startEditing(ex)}
                                    style={[styles.actionBtn, styles.editExoBtn]}
                                >
                                    <Text style={[styles.actionBtnText, styles.editExoBtnText]}>✎</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => {
                                        setExercises(exercises.filter((_, i) => i !== index));
                                    }}
                                    style={[styles.actionBtn, styles.deleteBtn]}
                                >
                                    <Text style={[styles.actionBtnText, styles.deleteBtnText]}>X</Text>
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(Spacing.m, insets.bottom) }]}>
                <Pressable style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>{protocolId ? 'Update Routine' : 'Save Routine'}</Text>
                </Pressable>
            </View>

            <Modal
                visible={isExerciseModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsExerciseModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select {category} Exercise</Text>
                            <Pressable onPress={() => setIsExerciseModalVisible(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </Pressable>
                        </View>
                        <FlatList
                            data={availableExercises}
                            keyExtractor={(item) => item.name}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.modalItem}
                                    onPress={() => selectExercise(item)}
                                >
                                    <Text style={styles.modalItemText}>{item.name}</Text>
                                    <Text style={styles.modalItemSub}>{item.workout_type}</Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No exercises found for this category.</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        padding: Spacing.m,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    label: {
        ...Typography.h3,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: Spacing.s,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: Colors.surface,
        color: Colors.text,
        padding: Spacing.m,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.m,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    halfInput: {
        flex: 1,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.s,
    },
    chip: {
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    chipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    chipText: {
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    chipTextActive: {
        color: Colors.background, // Contrast against primary
    },
    addButton: {
        backgroundColor: Colors.surfaceLight,
        padding: Spacing.m,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    addButtonText: {
        color: Colors.primary,
        fontWeight: 'bold',
    },
    exerciseItem: {
        backgroundColor: Colors.surface,
        padding: Spacing.m,
        borderRadius: 8,
        marginBottom: Spacing.s,
    },
    exerciseInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    exerciseActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: Spacing.m,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        paddingTop: Spacing.s,
    },
    moveButtons: {
        flexDirection: 'row',
        gap: Spacing.s,
    },
    actionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actionBtnText: {
        fontWeight: 'bold',
        color: Colors.text,
    },
    disabledBtn: {
        opacity: 0.3,
    },
    deleteBtn: {
        backgroundColor: Colors.error + '20', // 20% opacity
        borderColor: Colors.error,
    },
    deleteBtnText: {
        color: Colors.error,
    },
    editExoBtn: {
        backgroundColor: Colors.primary + '20',
        borderColor: Colors.primary,
    },
    editExoBtnText: {
        color: Colors.primary,
    },
    exerciseItemEditing: {
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    exerciseIndex: {
        ...Typography.h3,
        color: Colors.textSecondary,
        marginRight: Spacing.m,
        width: 30,
    },
    exerciseTitle: {
        ...Typography.body,
        fontWeight: 'bold',
    },
    exerciseDetail: {
        ...Typography.caption,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.m,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: Spacing.m,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: Colors.background,
        fontSize: 18,
        fontWeight: 'bold',
    },
    exerciseSelector: {
        backgroundColor: Colors.surface,
        padding: Spacing.m,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseSelectorText: {
        fontSize: 16,
        color: Colors.text,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '70%',
        padding: Spacing.m,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
        paddingBottom: Spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    closeText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    modalItem: {
        paddingVertical: Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalItemText: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    modalItemSub: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    emptyText: {
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.l,
    },
});
