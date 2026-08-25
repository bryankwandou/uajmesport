import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      /* Colours resolve through CSS custom properties so a single token swap
         drives both themes. Nothing here is a fixed hex. */
      colors: {
        ink: {
          950: "var(--bg)",
          900: "var(--surface-2)",
          800: "var(--surface)",
          700: "var(--border)",
        },
        crimson: { glow: "var(--crimson)" },
        ember: { glow: "var(--ember)" },
        tx: {
          DEFAULT: "var(--text)",
          muted: "var(--muted)",
          faint: "var(--faint)",
        },
        line: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
        },
      },
      transitionTimingFunction: {
        crisp: "cubic-bezier(0.2, 0.7, 0.3, 1)",
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
