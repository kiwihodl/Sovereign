/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        white: "#f8f8ff"
      },
      screens: {
        'max-mob': {'max': '475px'},
        'max-tab': {'max': '768px'},
        'max-lap': {'max': '1440px'},
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontFamily: {
        'blinker': ['Blinker', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '2.5rem' }],
        'h2': ['1.5rem', { lineHeight: '2rem' }],
        'h3': ['1.25rem', { lineHeight: '1.75rem' }],
      },
    },
  },
  plugins: [],
}
