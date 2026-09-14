/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        subtle: '#f4f4f5', // zinc-100
        muted: '#71717a',  // zinc-500
        card: '#fafafa',   // zinc-50
        border: '#e4e4e7', // zinc-200
        primary: '#18181b',// zinc-900
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      }
    },
  },
  plugins: [],
}
