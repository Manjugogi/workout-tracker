const ADJECTIVES = [
    'Steel', 'Dawn', 'Midnight', 'Savage', 'Crushing',
    'Ultimate', 'Hyper', 'Elite', 'Rogue', 'Titan',
    'Shadow', 'Golden', 'Fierce', 'Primal', 'Infinite'
];

const NOUNS = [
    'Crusher', 'Sprint', 'Engine', 'Session', 'Grind',
    'Forge', 'Burn', 'Quest', 'Protocol', 'Surge',
    'Legacy', 'Impact', 'Storm', 'Zenith', 'Warrior'
];

export const generateWorkoutName = (type: string) => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

    if (type === 'Run') {
        const runNouns = ['Sprint', 'Trail', 'Dash', 'Pace', 'Circuit'];
        const rNoun = runNouns[Math.floor(Math.random() * runNouns.length)];
        return `${adj} ${rNoun}`;
    }

    return `${adj} ${noun}`;
};
