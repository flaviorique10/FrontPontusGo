/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pontus: {
          DEFAULT: '#F26522', // Laranja vibrante principal
          light: '#F89060',   // Laranja mais claro para efeitos
          dark: '#D15014',    // Laranja escuro para hover
        }
      }
    },
  },
  plugins: [],
}