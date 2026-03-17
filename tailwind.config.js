/** @type {import("tailwindcss").Config} */
const sharedTailwindConfig = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1868db",
          light: "#e8f1ff",
          dark: "#0f3f83"
        }
      }
    }
  },
  plugins: []
};

module.exports = sharedTailwindConfig;
