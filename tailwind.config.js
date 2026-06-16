/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#fff8f2',
          dim: '#e1d9d0',
          bright: '#fff8f2',
          'container-lowest': '#ffffff',
          'container-low': '#fbf2e9',
          container: '#f5ede3',
          'container-high': '#efe7dd',
          'container-highest': '#e9e1d8',
        },
        'on-surface': '#1e1b16',
        'on-surface-variant': '#4d4540',
        outline: '#7e756f',
        'outline-variant': '#cfc4bd',
        primary: {
          DEFAULT: '#181512',
          container: '#2d2926',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#96908b',
        secondary: {
          DEFAULT: '#615e57',
          container: '#e8e2d9',
        },
        'on-secondary': '#ffffff',
        'on-secondary-container': '#67645d',
        background: '#fff8f2',
        'on-background': '#1e1b16',
      },
      fontFamily: {
        manrope: ['Manrope-Regular', 'sans-serif'],
        'manrope-medium': ['Manrope-Medium', 'sans-serif'],
        'manrope-semibold': ['Manrope-SemiBold', 'sans-serif'],
        'jetbrains-mono': ['JetBrainsMono-Medium', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
};
