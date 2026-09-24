/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0B0F17",
        panelBg: "#121824",
        borderDark: "#1E293B",
        accentBlue: "#3B82F6",
        accentEmerald: "#10B981",
        accentPurple: "#8B5CF6"
      }
    },
  },
  plugins: [],
}
