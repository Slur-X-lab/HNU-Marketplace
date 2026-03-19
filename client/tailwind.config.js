/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ab41',
          light: '#00c94e',
          dark: '#007d30',
        },
        accent: {
          DEFAULT: '#00ab41',
          light: '#00c94e',
          dark: '#007d30',
        },
        surface: '#f0faf4',
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
