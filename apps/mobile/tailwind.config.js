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
          primary: '#0a7ea4',
          secondary: '#687076',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#11181C',
          textSecondary: '#687076',
          border: '#e1e5e9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
        // Dark theme colors
        dark: {
          primary: '#ffffff',
          secondary: '#9BA1A6',
          background: '#151718',
          surface: '#1a1b1e',
          text: '#ECEDEE',
          textSecondary: '#9BA1A6',
          border: '#2a2b2e',
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