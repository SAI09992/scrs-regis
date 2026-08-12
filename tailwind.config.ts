import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        cyber: {
          bg: "#050A0F",
          "bg-elevated": "#0A0F14",
          surface: "#0F1720",
          "surface-elevated": "#141F2C",
          "surface-highlight": "#1B2A3D",
          border: "#1E2D40",
          "border-bright": "#00E5FF33",
          primary: "#00E5FF",
          "primary-dark": "#0099AA",
          secondary: "#2293EE",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
          text: "#E2E8F0",
          "text-muted": "#94A3B8",
          "text-dim": "#64748B",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "cyber-glow": "0 0 25px -5px rgba(0, 229, 255, 0.4)",
        "cyber-glow-sm": "0 0 12px -2px rgba(0, 229, 255, 0.35)",
        "cyber-glow-emerald": "0 0 20px -3px rgba(16, 185, 129, 0.35)",
        "cyber-glow-danger": "0 0 20px -3px rgba(239, 68, 68, 0.35)",
        "cyber-card": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 8px rgba(0, 229, 255, 0.8))" },
          "50%": { opacity: "0.6", filter: "drop-shadow(0 0 2px rgba(0, 229, 255, 0.3))" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2.5s infinite ease-in-out",
        "radar-sweep": "radar-sweep 8s linear infinite",
        "scanline": "scanline 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
