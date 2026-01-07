export const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceLight: '#2C2C2C',
  
  primary: '#CCFF00', // Neon Lime
  primaryDark: '#99CC00',
  
  secondary: '#FF3366', // Neon Pink/Red for alerts or stop
  
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  
  border: '#333333',
  
  success: '#00FF99',
  warning: '#FFCC00',
  error: '#FF3366',
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '700', color: Colors.text },
  h2: { fontSize: 24, fontWeight: '600', color: Colors.text },
  h3: { fontSize: 20, fontWeight: '600', color: Colors.text },
  body: { fontSize: 16, color: Colors.text },
  caption: { fontSize: 14, color: Colors.textSecondary },
} as const;
