import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bgDark: "var(--bg-dark)",
        ivory: "var(--ivory)",
        sand: "var(--sand)",
        brass: "var(--brass)",
        brassLight: "var(--brass-light)",
        ink: "var(--ink)",
        inkSoft: "var(--ink-soft)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [],
};

export default config;
