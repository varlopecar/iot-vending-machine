import { useTailwindTheme } from './useTailwindTheme';

export function useGradient() {
  const { isDark } = useTailwindTheme();
  
  const gradientColors = isDark 
    ? ['#640240', '#FD9BD9', '#FECDEC']
    : ['#2D392F', '#5B715F', '#B1C4B5'];

  const textGradientColors = isDark 
    ? ['#640240', '#FD9BD9', '#FECDEC']
    : ['#2D392F', '#5B715F', '#B1C4B5'];

  return {
    gradientColors,
    textGradientColors,
    isDark
  };
}
