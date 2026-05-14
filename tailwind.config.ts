import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        sea: "#0f766e",
        sun: "#f59e0b",
        coral: "#ef4444",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
