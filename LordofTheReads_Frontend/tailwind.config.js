/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1E2B38',
          light: '#2D3F50',
          dark: '#15202C',
        },
        gold: {
          DEFAULT: '#E1B529',
          light: '#F0CB5C',
          dark: '#C99A1E',
        },
        beige: {
          DEFAULT: '#F5F0E6',
          light: '#FAF7F1',
          dark: '#EAE2D3',
        },
        gray: {
          DEFAULT: '#A7A7A7',
          light: '#C4C4C4',
          dark: '#8A8A8A',
        },
      },
      backgroundColor: {
        primary: '#1E2B38',    // navy
        secondary: '#E1B529',  // gold
        light: '#F5F0E6',      // beige
        white: '#FFFFFF',
      },
      textColor: {
        primary: '#1E2B38',    // navy
        secondary: '#E1B529',  // gold
        muted: '#A7A7A7',      // gray
        light: '#F5F0E6',      // beige
        white: '#FFFFFF',
      },
      borderColor: {
        primary: '#1E2B38',    // navy
        secondary: '#E1B529',  // gold
        muted: '#A7A7A7',      // gray
        light: '#F5F0E6',      // beige
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
