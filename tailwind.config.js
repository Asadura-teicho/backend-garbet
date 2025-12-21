/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#f9d406",
        "background-light": "#f8f8f5",
        "background-dark": "#1A1A2E",
        "component-dark": "#1F2937",
        "surface": "#2C2C34",
        "surface-dark": "#1A1A1A",
        "text-primary": "#E0E0E0",
        "text-secondary": "#b9b29d",
        "text-main": "#FFFFFF",
        "primary-text": "#F0F0F0",
        "secondary-text": "#A0A0A0",
        "text-light": "#E0E0E0",
        "text-dark": "#A0A0A0",
        "accent-teal": "#00F5D4",
        "accent-blue": "#007BFF",
        "teal": "#00FFFF",
        "blue": "#4A90E2",
        "border-color": "#3A3A3A",
        "border-dark": "#2A2A2A",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"],
        "heading": ["Poppins", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.75rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "full": "9999px"
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0,0,0,0.2)',
        'glow-primary': '0 0 15px 0 rgba(249, 212, 6, 0.3)',
        'glow-primary-lg': '0 0 25px 0 rgba(249, 212, 6, 0.4)',
        'glow-cyan': '0 0 20px rgba(13, 204, 242, 0.5)',
        'glow-cyan-lg': '0 0 30px rgba(13, 204, 242, 0.7)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-bottom': 'slideInBottom 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bounce-smooth': 'bounceSmooth 0.6s ease-in-out',
        'shimmer': 'shimmer 1.5s infinite',
        'card-entrance': 'cardEntrance 0.5s ease-out',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}

