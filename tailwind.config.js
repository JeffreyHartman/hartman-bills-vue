/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' or 'class' or 'false'
  content: [],
  theme: {
    extend: {
      colors: {
        'alice-blue': '#F0F8FF',
      }
    },
  },
  plugins: [],
}

