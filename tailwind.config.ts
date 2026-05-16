import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#050813",
          text: "#F9FAFB",
          accent: "#CB7BB9",
          neutral: "#F1F1F8",
          link: "#7DD3FC",
          success: "#4ADE80",
          surface: "#0c0f1d",
          border: "rgba(241, 241, 248, 0.10)",
        }
      },
      fontFamily: {
        sans: ["Roboto", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Elms Sans'", "Roboto", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        panel: "0 1px 3px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(241, 241, 248, 0.08)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(241, 241, 248, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(241, 241, 248, 0.025) 1px, transparent 1px)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
