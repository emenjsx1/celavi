import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // 🎨 Dark Premium Palette (Cé La Vi)
        // Primary Colors (Gold)
        'gold': '#d4af37', // Gold Standard - main accents, text
        'gold-bright': '#f4d03f', // Gold Bright - hover states
        'gold-dark': '#b8941f', // Gold Dark - darker accents
        
        // Dark Backgrounds
        'black-main': '#0a0a0a', // Main background
        'black-pure': '#000000', // Deepest blacks
        'dark-gray': '#1a1a1a', // Cards, sections
        'border': '#333333', // Border color
        
        // Text & Functional
        'white': '#ffffff', // Primary text
        'gray-light': '#cccccc', // Light gray
        'gray-medium': '#999999', // Medium gray
        'dark-red': '#8b0000', // Alerts, delete buttons
        
        // Aliases para compatibilidade
        'dark-bg': '#0a0a0a',
        'dark-surface': '#1a1a1a',
        'dark-border': '#333333',
        'gold-primary': '#d4af37',
        'gold-light': '#f4d03f',
        'text-light': '#ffffff',
        'text-muted': '#999999',
        'bg-main': '#0a0a0a',
        'bg-card': '#1a1a1a',
      },
    },
  },
  plugins: [],
}
export default config


