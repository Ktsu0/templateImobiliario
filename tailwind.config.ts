import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDark: "rgb(var(--bg-dark-rgb) / <alpha-value>)",
        ivory: "rgb(var(--ivory-rgb) / <alpha-value>)",
        sand: "rgb(var(--sand-rgb) / <alpha-value>)",
        brass: "rgb(var(--brass-rgb) / <alpha-value>)",
        brassLight: "rgb(var(--brass-light-rgb) / <alpha-value>)",
        ink: "rgb(var(--ink-rgb) / <alpha-value>)",
        inkSoft: "rgb(var(--ink-soft-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
