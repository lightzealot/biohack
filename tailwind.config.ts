import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      'roboto': ['Roboto', 'sans-serif'],
      'sans': ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
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
        // Paleta de colores oscuros con degradados
        slate: {
          50: "#0f0f23",
          100: "#1a1a2e",
          200: "#16213e",
          300: "#1a2332",
          400: "#2c3e50",
          500: "#34495e",
          600: "#415a77",
          700: "#4e6b8a",
          800: "#5b7c9c",
          900: "#6889b0",
        },
        charcoal: {
          50: "#0d1117",
          100: "#161b22",
          200: "#21262d",
          300: "#30363d",
          400: "#484f58",
          500: "#6e7681",
          600: "#8b949e",
          700: "#b1bac4",
          800: "#c9d1d9",
          900: "#f0f6fc",
        },
        midnight: {
          50: "#0a0a0f",
          100: "#1a1a2e",
          200: "#16213e",
          300: "#0f3460",
          400: "#533483",
          500: "#16537e",
          600: "#1e6091",
          700: "#2e86ab",
          800: "#a23b72",
          900: "#f18f01",
        },
        gradient: {
          from: "#0f0f23",
          via: "#1a1a2e", 
          to: "#16213e",
        },
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-midnight': 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)',
        'gradient-charcoal': 'linear-gradient(135deg, #0d1117 0%, #161b22 25%, #21262d 50%, #30363d 100%)',
        'gradient-radial': 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f23 70%)',
        'gradient-cosmic': 'linear-gradient(135deg, #0f0f23 0%, #533483 25%, #16537e 50%, #2e86ab 75%, #a23b72 100%)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
