
export type WorkoutCategory =
    | 'Strength'
    | 'Cardio'
    | 'Functional'
    | 'Yoga'
    | 'Mobility'
    | 'Sports'
    | 'Recovery'
    | 'Pilates'
    | 'Powerlifting'
    | 'CrossFit'
    | 'Calisthenics';

export const CATEGORIES: WorkoutCategory[] = [
    'Strength',
    'Cardio',
    'Functional',
    'Yoga',
    'Mobility',
    'Sports',
    'Recovery',
    'Pilates',
    'Powerlifting',
    'CrossFit',
    'Calisthenics',
];

export type WorkoutType =
    | 'Upper Body' | 'Lower Body' | 'Core' | 'Full Body'
    | 'Indoor' | 'Outdoor'
    | 'HIIT' | 'Flexibility' | 'Balance' | 'Mindfulness'
    | 'Sport' | 'Breathwork';

export type TrackingMetric =
    | 'sets'
    | 'reps'
    | 'weight_kg'
    | 'distance_km'
    | 'duration_minutes'
    | 'calories'
    | 'intensity';

export interface ExerciseDefinition {
    id: string; // unique slug e.g. 'bench_press'
    name: string;
    category: WorkoutCategory;
    workout_type: WorkoutType;
    supported_metrics: TrackingMetric[];
}

export const MASTER_EXERCISE_LIST: ExerciseDefinition[] = [
    // --- Strength ---
    { id: 'bench_press', name: 'Bench Press', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'incline_bench_press', name: 'Incline Bench Press', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'chest_fly', name: 'Chest Fly', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'shoulder_press', name: 'Shoulder Press', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'lateral_raises', name: 'Lateral Raises', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'bicep_curls', name: 'Bicep Curls', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'tricep_extensions', name: 'Tricep Extensions', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'pull_ups', name: 'Pull Ups', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg', 'duration_minutes'] },
    { id: 'push_ups', name: 'Push Ups', category: 'Strength', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'duration_minutes'] },
    { id: 'squats', name: 'Squats', category: 'Strength', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'deadlift', name: 'Deadlift', category: 'Strength', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'lunges', name: 'Lunges', category: 'Strength', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'leg_press', name: 'Leg Press', category: 'Strength', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'calf_raises', name: 'Calf Raises', category: 'Strength', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'plank', name: 'Plank', category: 'Strength', workout_type: 'Core', supported_metrics: ['sets', 'duration_minutes'] },
    { id: 'russian_twists', name: 'Russian Twists', category: 'Strength', workout_type: 'Core', supported_metrics: ['sets', 'reps', 'weight_kg'] },

    // --- Cardio / Endurance ---
    { id: 'running', name: 'Running', category: 'Cardio', workout_type: 'Outdoor', supported_metrics: ['distance_km', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'walking', name: 'Walking', category: 'Cardio', workout_type: 'Outdoor', supported_metrics: ['distance_km', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'cycling', name: 'Cycling', category: 'Cardio', workout_type: 'Outdoor', supported_metrics: ['distance_km', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'treadmill_run', name: 'Treadmill Run', category: 'Cardio', workout_type: 'Indoor', supported_metrics: ['distance_km', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'elliptical', name: 'Elliptical', category: 'Cardio', workout_type: 'Indoor', supported_metrics: ['distance_km', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'rowing_machine', name: 'Rowing Machine', category: 'Cardio', workout_type: 'Indoor', supported_metrics: ['distance_km', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'sprint_intervals', name: 'Sprint Intervals', category: 'Cardio', workout_type: 'HIIT', supported_metrics: ['sets', 'duration_minutes', 'intensity'] },

    // --- Functional / HIIT ---
    { id: 'burpees', name: 'Burpees', category: 'Functional', workout_type: 'HIIT', supported_metrics: ['sets', 'reps', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'mountain_climbers', name: 'Mountain Climbers', category: 'Functional', workout_type: 'HIIT', supported_metrics: ['sets', 'duration_minutes', 'calories', 'intensity'] },
    { id: 'kettlebell_swings', name: 'Kettlebell Swings', category: 'Functional', workout_type: 'HIIT', supported_metrics: ['sets', 'reps', 'weight_kg', 'calories'] },
    { id: 'jump_squats', name: 'Jump Squats', category: 'Functional', workout_type: 'HIIT', supported_metrics: ['sets', 'reps', 'duration_minutes', 'intensity'] },
    { id: 'high_knees', name: 'High Knees', category: 'Functional', workout_type: 'HIIT', supported_metrics: ['sets', 'duration_minutes', 'intensity'] },
    { id: 'battle_ropes', name: 'Battle Ropes', category: 'Functional', workout_type: 'HIIT', supported_metrics: ['sets', 'duration_minutes', 'intensity'] },

    // --- Yoga ---
    { id: 'surya_namaskar', name: 'Surya Namaskar', category: 'Yoga', workout_type: 'Flexibility', supported_metrics: ['sets', 'reps', 'duration_minutes'] },
    { id: 'downward_dog', name: 'Downward Dog', category: 'Yoga', workout_type: 'Flexibility', supported_metrics: ['duration_minutes'] },
    { id: 'warrior_pose', name: 'Warrior Pose', category: 'Yoga', workout_type: 'Flexibility', supported_metrics: ['duration_minutes'] },
    { id: 'tree_pose', name: 'Tree Pose', category: 'Yoga', workout_type: 'Balance', supported_metrics: ['duration_minutes'] },
    { id: 'cobra_pose', name: 'Cobra Pose', category: 'Yoga', workout_type: 'Flexibility', supported_metrics: ['duration_minutes'] },

    // --- Mobility ---
    { id: 'hip_opener', name: 'Hip Opener Stretch', category: 'Mobility', workout_type: 'Flexibility', supported_metrics: ['duration_minutes'] },
    { id: 'hamstring_stretch', name: 'Hamstring Stretch', category: 'Mobility', workout_type: 'Flexibility', supported_metrics: ['duration_minutes'] },
    { id: 'shoulder_mobility', name: 'Shoulder Mobility', category: 'Mobility', workout_type: 'Flexibility', supported_metrics: ['duration_minutes'] },
    { id: 'spine_mobility', name: 'Spine Mobility', category: 'Mobility', workout_type: 'Flexibility', supported_metrics: ['duration_minutes'] },

    // --- Sports ---
    { id: 'football', name: 'Football', category: 'Sports', workout_type: 'Sport', supported_metrics: ['duration_minutes', 'calories', 'intensity'] },
    { id: 'badminton', name: 'Badminton', category: 'Sports', workout_type: 'Sport', supported_metrics: ['duration_minutes', 'calories', 'intensity'] },
    { id: 'basketball', name: 'Basketball', category: 'Sports', workout_type: 'Sport', supported_metrics: ['duration_minutes', 'calories', 'intensity'] },
    { id: 'swimming', name: 'Swimming', category: 'Sports', workout_type: 'Sport', supported_metrics: ['duration_minutes', 'distance_km', 'calories', 'intensity'] },
    { id: 'tennis', name: 'Tennis', category: 'Sports', workout_type: 'Sport', supported_metrics: ['duration_minutes', 'calories', 'intensity'] },

    // --- Recovery ---
    { id: 'meditation', name: 'Meditation', category: 'Recovery', workout_type: 'Mindfulness', supported_metrics: ['duration_minutes'] },
    { id: 'pranayama', name: 'Pranayama', category: 'Recovery', workout_type: 'Breathwork', supported_metrics: ['duration_minutes'] },
    { id: 'breathing_exercises', name: 'Breathing Exercises', category: 'Recovery', workout_type: 'Breathwork', supported_metrics: ['duration_minutes'] },

    // --- Pilates ---
    { id: 'pilates_hundred', name: 'The Hundred', category: 'Pilates', workout_type: 'Core', supported_metrics: ['sets', 'reps', 'duration_minutes'] },
    { id: 'pilates_roll_up', name: 'Roll Up', category: 'Pilates', workout_type: 'Core', supported_metrics: ['sets', 'reps'] },
    { id: 'pilates_leg_circles', name: 'Leg Circles', category: 'Pilates', workout_type: 'Flexibility', supported_metrics: ['sets', 'reps'] },
    { id: 'pilates_criss_cross', name: 'Criss Cross', category: 'Pilates', workout_type: 'Core', supported_metrics: ['sets', 'reps'] },
    { id: 'pilates_swan', name: 'Swan Dive', category: 'Pilates', workout_type: 'Flexibility', supported_metrics: ['sets', 'reps'] },

    // --- Powerlifting ---
    { id: 'comp_squat', name: 'Competition Squat', category: 'Powerlifting', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'comp_bench', name: 'Competition Bench Press', category: 'Powerlifting', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'comp_deadlift', name: 'Competition Deadlift', category: 'Powerlifting', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'low_bar_squat', name: 'Low Bar Squat', category: 'Powerlifting', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'sumo_deadlift', name: 'Sumo Deadlift', category: 'Powerlifting', workout_type: 'Lower Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },

    // --- CrossFit ---
    { id: 'wall_balls', name: 'Wall Balls', category: 'CrossFit', workout_type: 'Full Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'thrusters', name: 'Thrusters', category: 'CrossFit', workout_type: 'Full Body', supported_metrics: ['sets', 'reps', 'weight_kg'] },
    { id: 'box_jumps', name: 'Box Jumps', category: 'CrossFit', workout_type: 'HIIT', supported_metrics: ['sets', 'reps'] },
    { id: 'double_unders', name: 'Double Unders', category: 'CrossFit', workout_type: 'HIIT', supported_metrics: ['sets', 'reps'] },
    { id: 'toes_to_bar', name: 'Toes to Bar', category: 'CrossFit', workout_type: 'Core', supported_metrics: ['sets', 'reps'] },

    // --- Calisthenics ---
    { id: 'muscle_up', name: 'Muscle Up', category: 'Calisthenics', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps'] },
    { id: 'l_sit', name: 'L-Sit', category: 'Calisthenics', workout_type: 'Core', supported_metrics: ['sets', 'duration_minutes'] },
    { id: 'handstand_pushup', name: 'Handstand Pushup', category: 'Calisthenics', workout_type: 'Upper Body', supported_metrics: ['sets', 'reps'] },
    { id: 'front_lever', name: 'Front Lever', category: 'Calisthenics', workout_type: 'Core', supported_metrics: ['sets', 'duration_minutes'] },
    { id: 'back_lever', name: 'Back Lever', category: 'Calisthenics', workout_type: 'Core', supported_metrics: ['sets', 'duration_minutes'] },
];