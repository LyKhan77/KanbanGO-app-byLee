/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        terracotta: {
          DEFAULT: '#c26d5c',
          dark: '#b05d4d',
          light: '#d4897a'
        },
        sage: {
          DEFAULT: '#78866b',
          dark: '#657359',
          light: '#8f9c84'
        },
        'boho-sand': '#f3ede4',
        'boho-linen': '#fdfbf7',
        'boho-canvas': '#e4ded5',
        'boho-walnut': '#5c4d43',
        'boho-espresso': '#2e2620'
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['"Inter"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}
