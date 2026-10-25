/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#000000',
        darkCard: '#09090b',
        darkBorder: '#1c1c21',
      }
    },
  },
  plugins: [],
}
