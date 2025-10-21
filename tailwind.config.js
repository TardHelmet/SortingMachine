/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        red: '#FF0000',
        green: '#00FF00'
      },
      fontSize: {
        item: '3rem',
        ui: '1.5rem',
        desc: '1rem'
      }
    }
  },
  plugins: []
};
