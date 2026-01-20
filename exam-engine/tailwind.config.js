/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        exam: '0 2px 10px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};

