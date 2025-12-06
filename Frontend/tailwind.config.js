/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette inspired by reference dark purple theme
        brand: {
          50: '#f5f4ff',
          100: '#e6e5ff',
          200: '#c7c5ff',
          300: '#a6a2ff',
          400: '#8580ff',
          500: '#5d5afe', // primary accent
          600: '#4944d6',
          700: '#3935a8',
          800: '#2a2779',
          900: '#1b1a4c',
          950: '#121234',
        },
        surface: {
          50: '#f8f9ff',
          100: '#eef0fa',
          200: '#d9dce8',
          300: '#b5b9cc',
          400: '#868ca7',
          500: '#5d637f',
          600: '#3f445c',
          700: '#2c3043',
          800: '#1d2030', // card background
          900: '#141624', // deep surface
          950: '#0d0f18', // app background
        },
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0d0f18 0%, #141624 50%, #1d2030 100%)',
        'gradient-hero': 'radial-gradient(circle at 50% 0%, rgba(93,90,254,0.35) 0%, rgba(13,15,24,0.2) 40%, rgba(13,15,24,1) 70%), linear-gradient(180deg, #0d0f18 0%, #141624 100%)',
        'gradient-accent': 'linear-gradient(135deg, #5d5afe 0%, #8580ff 50%, #a6a2ff 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(93,90,254,0.12) 0%, rgba(24,26,47,0.9) 60%)',
      },
      boxShadow: {
        'glow': '0 0 24px -6px rgba(93,90,254,0.55)',
        'glow-sm': '0 0 12px -4px rgba(93,90,254,0.4)',
        'card': '0 4px 24px -4px rgba(0,0,0,0.55)',
        'inner': 'inset 0 0 0 1px rgba(93,90,254,0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(93,90,254,0.4)' },
          '50%': { boxShadow: '0 0 0 6px rgba(93,90,254,0)' },
        },
      },
      borderRadius: {
        'xl2': '1.25rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}