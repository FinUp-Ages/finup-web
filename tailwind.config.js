/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'rgba(2, 23, 54, 1)',
        'login-field': 'rgba(240, 240, 240, 1)',
        'login-error': 'rgba(220, 38, 38, 1)',
        'login-success': 'rgba(22, 163, 74, 1)',
      },
      fontFamily: {
        destaque: ['"Trebuchet MS"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
