/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          300: '#93adf7',
          500: '#3b5bdb',
          600: '#3451c7',
          700: '#2c44b0',
          900: '#1a2b6d',
        },
      },
    },
  },
  plugins: [],
};
