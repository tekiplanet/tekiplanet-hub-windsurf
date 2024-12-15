export const lightTheme = {
  background: 'bg-background',
  text: 'text-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  card: 'bg-card text-card-foreground shadow-sm',
  border: 'border-border'
};

export const darkTheme = {
  background: 'bg-background',
  text: 'text-foreground',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  card: 'bg-card text-card-foreground shadow-md',
  border: 'border-border'
};

export type Theme = typeof lightTheme;
export type ThemeKey = keyof Theme;
