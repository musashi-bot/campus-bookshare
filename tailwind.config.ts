import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1F2A44",
          light: "#2C3B5E",
          dark: "#141C2E",
        },
        paper: {
          DEFAULT: "#FAF6EE",
          warm: "#F5EFE0",
          card: "#FFFFFF",
          border: "#E7DFD1",
        },
        amber: {
          DEFAULT: "#E9A23B",
          hover: "#D6902B",
          light: "#FDF5E8",
        },
        teal: {
          DEFAULT: "#2A9D8F",
          hover: "#238276",
          light: "#E8F5F3",
        },
        terracotta: {
          DEFAULT: "#D96C4A",
          hover: "#C45B3A",
          light: "#FAECE8",
        },
        charcoal: {
          DEFAULT: "#2B2B2B",
          muted: "#666666",
          subtle: "#8A8A8A",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Outfit", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(31, 42, 68, 0.06)",
        "soft-lg": "0 10px 30px -4px rgba(31, 42, 68, 0.1)",
        "card-hover": "0 12px 24px -6px rgba(31, 42, 68, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
