/**
 * Metabolic Equivalent of Task (MET) values for different workout categories.
 * MET * 3.5 * weight_kg / 200 = calories per minute
 */
export const MET_VALUES: Record<string, number> = {
    'Run': 9.8,        // Average running 8km/h
    'Cardio': 8.0,
    'Strength': 5.0,
    'Pilates': 3.0,
    'Powerlifting': 6.0,
    'CrossFit': 8.0,
    'Calisthenics': 5.0,
    'Yoga': 2.5,
    'HIIT': 8.0,
    'Boxing': 7.0,
    'Default': 5.0
};

export const calculateCalories = (category: string, durationSeconds: number, weightKg: number = 70) => {
    const met = MET_VALUES[category] || MET_VALUES['Default'];
    const durationMinutes = durationSeconds / 60;

    // Formula: (MET * 3.5 * weight) / 200 = calories / min
    const caloriesPerMinute = (met * 3.5 * weightKg) / 200;

    return Math.round(caloriesPerMinute * durationMinutes);
};
