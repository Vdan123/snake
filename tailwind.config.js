/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'game-bg': '#f8fafc',
        'snake-green': '#22c55e',
      }
    },
  },
  plugins: [],
} 