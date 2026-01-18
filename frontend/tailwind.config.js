/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        mayor: {
          orange: '#FF7800',
          amber: '#FF9500',
          gold: '#FFB800',
          flame: '#FF5C00',
          rust: '#E65100',
          dark: '#0A0A0A',
          charcoal: '#111111',
          slate: '#1A1A1A',
          gray: '#2A2A2A'
        }
      },
      fontFamily: {
        'display': ['Sora', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'gradient': 'gradient 8s ease infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(255, 120, 0, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(255, 120, 0, 0.6)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      }
    },
  },
  plugins: [],
}
