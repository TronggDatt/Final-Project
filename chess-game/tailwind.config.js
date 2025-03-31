/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "board-pattern": "url('../assets/tables/table.png')",
      },
    },
  },
  plugins: [],

  darkMode: "class", // Kích hoạt chế độ dark mode theo class
  theme: {
    extend: {},
  },
  plugins: [],
  
};

