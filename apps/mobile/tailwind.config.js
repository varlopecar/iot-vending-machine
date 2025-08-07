/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          primary: '#F9F4EC', // PrimaryLight
          secondary: '#5B715F', // SecondaryLight
          tertiary: '#E3E8E4', // TertiaryLight
          text: '#3A2E2C', // TextLight
          textSecondary: '#3A2E2C', // TextLight
          background: '#F9F4EC', // PrimaryLight
          surface: '#E3E8E4', // TertiaryLight
          border: '#F3E9D8', // LineLight
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Dark theme colors
        dark: {
          primary: '#2C2221', // PrimaryDark
          secondary: '#FD9BD9', // SecondaryDark
          tertiary: '#FECDEC', // TertiaryDark
          text: '#FAE4D1', // TextDark
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
        'sans': ['System', 'sans-serif'],
        'mono': ['SpaceMono-Regular', 'monospace'],
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
      },
    },
  },
  plugins: [],
} 