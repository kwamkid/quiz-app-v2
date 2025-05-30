/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        thai: ["IBM Plex Sans Thai", "Noto Sans Thai", "sans-serif"],
      },
      animation: {
        shake: "shake 0.5s ease-in-out",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
