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
          bg: '#FCFBF7',
          dark: '#101D2C',
          orange: '#F97316',
          orangeHover: '#FF8D3E',
          orangeTitle: '#E5640E',
          muted: '#5D6672',
          darkMuted: '#BBC3CE',
          orangeContrast: '#FF872E',
          focus: '#007CA0',
          borderLight: 'rgba(22, 35, 53, 0.14)',
          borderDark: 'rgba(255, 255, 255, 0.17)',
        }
      },
      fontFamily: {
        condensed: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
        sans: ['"Outfit"', 'Arial', 'sans-serif'],
        display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
      },
      borderRadius: {
        'btn': '2px',
        'card': '4px',
      },
      maxWidth: {
        'race': '1280px',
      }
    },
  },
  plugins: [],
}
