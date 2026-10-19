/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: 'rgba(2, 23, 54, 1)',
        'login-field': 'rgba(240, 240, 240, 1)',
        'login-error': 'rgba(220, 38, 38, 1)',
        // Texto claro sobre o fundo navy (sidebar).
        'on-navy': 'rgba(240, 240, 240, 1)',
        // Mesmos nomes e valores do finup-mobile (src/theme/colors.ts), em kebab-case.
        background: '#ffffff',
        error: '#ef4444',
        icon: '#334155',
        'surface-light': '#f5f5f5',
        // Grafico de linha do dashboard (Figma: card "Crescimento do usuário", nó 191-2583).
        'chart-line': '#7086fd',
        'chart-surface': '#f3f5f9',
        'chart-value': '#022a4d',
      },
      fontFamily: {
        // Tela de login (Figma, frame 191-2349).
        'dm-sans': ['"DM Sans"', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
