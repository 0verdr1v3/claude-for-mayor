/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        claude: {
          cream: '#FAF9F5',
          beige: '#E8E4DB',
          sand: '#D4CFC4',
          terracotta: '#DA7756',
          rust: '#C15A3B',
          purple: '#7C3AED',
          violet: '#8B5CF6',
          lavender: '#A78BFA',
          slate: '#1E1B2E',
          charcoal: '#0F0D15',
          teal: '#14B8A6',
          cyan: '#22D3D8'
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
          '0%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.6)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'claude-gradient': 'linear-gradient(135deg, #7C3AED 0%, #14B8A6 50%, #DA7756 100%)'
      }
    },
  },
  plugins: [],
}
