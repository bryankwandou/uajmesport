import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070406",
          900: "#0D0709",
          800: "#160B10",
          700: "#231017",
        },
        crimson: { glow: "#FF2D55" },
        ember: { glow: "#FF7A18" },
        volt: { glow: "#00E5FF" },
      },
      fontFamily: {
        display: ["var(--font-orbit)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        pulseglow: {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        pulseglow: "pulseglow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
