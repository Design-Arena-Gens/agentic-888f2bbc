import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#def2ff',
          200: '#b6e6ff',
          300: '#7fd6ff',
          400: '#3cc0ff',
          500: '#0aa9ff',
          600: '#0088db',
          700: '#006caf',
          800: '#065b8e',
          900: '#0a4a73'
        }
      }
    },
  },
  plugins: [],
} satisfies Config

