import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#4F46E5',
          indigoLight: '#818CF8', 
          indigoDeep: '#3730A3',
          gold: '#F59E0B',
          goldLight: '#FBBF24',
          goldDeep: '#B45309',
        },
        background: {
          primary: 'var(--bg-primary)',
          secondary: '#101018',
          card: '#141420',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'rgba(250,250,250,0.5)',
          muted: 'rgba(250,250,250,0.3)',
        },
        border: {
          default: 'rgba(79,70,229,0.15)',
          hover: 'rgba(79,70,229,0.4)',
        }
      },
      borderRadius: {
        DEFAULT: "16px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
      },
      transitionTimingFunction: {
        snappy: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
