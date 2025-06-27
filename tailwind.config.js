/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        blue: {
          50: '#f0f4fa',
          100: '#dbe5f1',
          200: '#bccee6',
          300: '#90aed6',
          400: '#6089c3',
          500: '#4070b4',
          600: '#345998',
          700: '#2d487c',
          800: '#2a3e68',
          900: '#1E3A8A',
          950: '#192338',
        },
        amber: {
          50: '#fff9eb',
          100: '#ffefc7',
          200: '#ffe08a',
          300: '#ffca4d',
          400: '#ffb41c',
          500: '#F59E0B',
          600: '#e68000',
          700: '#bf5900',
          800: '#994600',
          900: '#7c3900',
          950: '#461e00',
        },
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};