/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'calm': '#4f8fba',
        'happy': '#e2c458',
        'angry': '#e25858',
        'sad': '#7b69b8',
        'excited': '#e27e58',
        'neutral': '#a0aec0',
      },
    },
  },
  plugins: [],
} 