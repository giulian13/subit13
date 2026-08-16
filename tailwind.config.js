/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kid: {
          bg: '#F8FAFC',
          yellow: '#FCD34D',
          yellowDark: '#F59E0B',
          pink: '#F472B6',
          pinkDark: '#DB2777',
          blue: '#60A5FA',
          blueDark: '#2563EB',
          green: '#4ADE80',
          greenDark: '#16A34A',
          purple: '#C084FC',
          purpleDark: '#9333EA',
          orange: '#FB923C',
          orangeDark: '#EA580C',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'bouncy': '0 8px 0 0 rgba(0, 0, 0, 0.15)',
        'bouncy-active': '0 2px 0 0 rgba(0, 0, 0, 0.15)',
        'card-kid': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
