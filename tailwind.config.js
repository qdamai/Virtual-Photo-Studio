/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        background: "var(--background)",
        card: "var(--card-bg)",
        text: "var(--app-text)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        handwritten: ["Pacifico", "cursive"],
        display: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        'pattern-dots': 'radial-gradient(circle, currentColor 1px, transparent 1px)',
        'pattern-grid': 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
