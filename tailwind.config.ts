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
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
      },
      fontSize: {
        'display': ['50px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h1': ['50px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['20px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'h3': ['20px', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
        'h4': ['16px', { lineHeight: '1.5' }],
        'body-lg': ['16px', { lineHeight: '1.5' }],
        'body': ['16px', { lineHeight: '1.5' }],
        'small': ['14px', { lineHeight: '1.5' }],
        'caption': ['12px', { lineHeight: '1.5' }],
      },
      colors: {
        background: {
          DEFAULT: '#FAFAFC',
          sidebar: '#FFFFFF',
          card: '#FFFFFF',
        },
        text: {
          primary: '#141414',
          secondary: '#666666',
        },
        border: {
          DEFAULT: '#ECECEC',
        },
        primary: {
          DEFAULT: '#4F6BFF',
        },
        success: {
          DEFAULT: '#0ABE52',
        },
        danger: {
          DEFAULT: '#DE3B34',
        },
        warning: {
          DEFAULT: '#EE8248',
        },
        purple: {
          DEFAULT: '#B57AF1',
        },
        hover: {
          DEFAULT: '#F5F7FF',
        },
      },
      borderRadius: {
        card: "18px",
        button: "14px",
        input: "14px",
        badge: "999px",
      },
      spacing: {
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        32: "32px",
        40: "40px",
        48: "48px",
        64: "64px",
      },
      boxShadow: {
        subtle: "0 2px 12px rgba(0,0,0,0.04)",
      }
    },
  },
  plugins: [],
};
export default config;
