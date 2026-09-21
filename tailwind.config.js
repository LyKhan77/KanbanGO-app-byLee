/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#c86d51',
          deep: '#8c4c36',
          light: '#faede9',
          border: '#f2cfc4'
        },
        sage: {
          DEFAULT: '#556b56',
          deep: '#3a5c3a',
          light: '#eef4ee',
          border: '#c9dcc9'
        },
        boho: {
          linen: '#fdfbf7',
          sand: '#f4ede2',
          card: '#ffffff',
          canvas: '#e0d2bf',
          espresso: '#3b322a',
          walnut: '#5a4c3f',
          clay: '#8c7b6c'
        }
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
