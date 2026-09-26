/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        gov: {
          blue: "#2563eb",
          dark: "#212121",
          green: "#0f766e",
          amber: "#d97706",
          red: "#b91c1c",
        },
        coal: {
          orange: "#ff6f00",
          charcoal: "#212121",
          canvas: "#f5f7fa",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "Noto Sans Devanagari", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 12px 0 rgb(17 24 39 / 0.08)",
        "card-hover":
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
