/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#dfe9ff',
          200: '#c1d3ff',
          300: '#95b3ff',
          400: '#6288ff',
          500: '#3d5eff',
          600: '#2540f0',
          700: '#1f33c4', // main brand indigo
          800: '#1f2f9c',
          900: '#1e2c7c',
          950: '#141a4a',
        },
        accent: {
          400: '#22d3c9',
          500: '#0fb8ae', // teal accent for highlights/success-adjacent CTAs
          600: '#0b968e',
        },
        surface: '#ffffff',
        bg: '#f6f7fb',
        ink: {
          900: '#0f1430',
          700: '#3a4266',
          500: '#6b7290',
          300: '#a7acc4',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 20, 48, 0.04), 0 8px 24px -8px rgba(15, 20, 48, 0.12)',
        'card-hover': '0 4px 8px rgba(15, 20, 48, 0.06), 0 16px 32px -12px rgba(15, 20, 48, 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
