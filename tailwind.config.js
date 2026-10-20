/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        race: {
          orange: {
            DEFAULT: '#FF5500',
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#FF5500',
            600: '#EA4A00',
            700: '#C23800',
            800: '#9A2D00',
            900: '#7C2400',
            glow: '#FF6A00',
          },
          cyan: {
            DEFAULT: '#00E5FF',
            light: '#38BDF8',
            dark: '#0284C7',
            50: '#F0F9FF',
            100: '#E0F2FE',
            500: '#00A3FF',
            glow: '#00F0FF',
          },
          lime: {
            DEFAULT: '#CCFF00',
            glow: '#D4FF1A',
          },
          gold: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
          },
          dark: {
            DEFAULT: '#070C15',
            pure: '#04070D',
            surface: '#0B1220',
            card: '#10192C',
            cardHover: '#142038',
            border: '#1E293B',
            borderGlow: 'rgba(255, 85, 0, 0.25)',
          },
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2.5s ease-in-out infinite alternate',
        'glow-cyan': 'glowCyan 2.5s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(255, 85, 0, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(255, 85, 0, 0.55)' },
        },
        glowCyan: {
          '0%': { boxShadow: '0 0 15px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(0, 229, 255, 0.55)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
