/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme colors (inspired by mobile app)
        light: {
          primary: '#F9F4EC', // PrimaryLight
          secondary: '#5B715F', // SecondaryLight
          tertiary: '#E3E8E4', // TertiaryLight
          text: '#3A2E2C', // TextLight
          textSecondary: '#3A2E2C', // TextLight
          background: '#F9F4EC', // PrimaryLight
          surface: '#E3E8E4', // TertiaryLight
          border: '#F3E9D8', // LineLight
          buttonText: '#FFFFFF', // ButtonTextLight
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Dark theme colors (inspired by mobile app)
        dark: {
          primary: '#2C2221', // PrimaryDark
          secondary: '#FD9BD9', // SecondaryDark
          tertiary: '#FECDEC', // TertiaryDark
          text: '#FEFCFA', // TextDark
          textSecondary: '#FEFCFA', // SecondaryTextDark
          background: '#2C2221', // PrimaryDark
          surface: '#493837', // LineDark
          border: '#493837', // LineDark
          buttonText: '#320120', // ButtonTextDark
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Common colors that work in both themes
        common: {
          white: '#ffffff',
          black: '#000000',
          transparent: 'transparent',
        }
      },
      fontFamily: {
        'sans': ['system-ui', 'sans-serif'],
        'mono': ['ui-monospace', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
