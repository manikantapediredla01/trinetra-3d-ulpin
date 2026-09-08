/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TRINETRA Design System
        white: "#FFFFFF",
        background: "#F6F8FB",
        navy: {
          DEFAULT: "#12355B",
          50: "#E8EEF5",
          100: "#C5D3E8",
          200: "#9FB8D8",
          300: "#7A9DC8",
          400: "#4F7DB3",
          500: "#1769AA",
          600: "#145A93",
          700: "#12355B",
          800: "#0D2643",
          900: "#08172B",
        },
        govblue: {
          DEFAULT: "#1769AA",
          light: "#EEF4FB",
          mid: "#4F89C5",
        },
        teal: {
          DEFAULT: "#008C95",
          light: "#E0F5F6",
          mid: "#33A8B0",
        },
        verified: {
          DEFAULT: "#2E7D32",
          light: "#E8F5E9",
          mid: "#4CAF50",
        },
        warning: {
          DEFAULT: "#C98A00",
          light: "#FFF8E1",
          mid: "#F9A825",
        },
        critical: {
          DEFAULT: "#C62828",
          light: "#FFEBEE",
          mid: "#EF5350",
        },
        dark: "#17202A",
        muted: "#667085",
        border: "#E4E7EC",
        surface: "#F6F8FB",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: "0 1px 3px rgba(18,53,91,0.08), 0 1px 2px rgba(18,53,91,0.06)",
        "card-hover": "0 4px 12px rgba(18,53,91,0.12), 0 2px 4px rgba(18,53,91,0.08)",
        panel: "0 4px 24px rgba(18,53,91,0.10)",
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
}
