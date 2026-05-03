/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        dark: {
          bg: '#0a0a0f',
          card: '#12121a',
          cardHover: '#1c1c28',
          border: '#2a2a35'
        },
        primary: '#7c3aed',
        secondary: '#ec4899',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M0 0h40v40H0V0zm39 39V1H1v38h38z\" fill=\"%231a1a24\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"/%3E%3C/svg%3E')",
      },
      boxShadow: {
        'glow-primary': '0 0 30px -5px rgba(124, 58, 237, 0.4)',
        'glow-secondary': '0 0 30px -5px rgba(236, 72, 153, 0.4)',
      }
    },
  },
  plugins: [],
}
