import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F6F2',
        charcoal: '#161616',
        'charcoal-800': '#2A2A2A',
        'charcoal-700': '#383838',
        'charcoal-200': '#D0D0D0',
        'charcoal-100': '#EBEBEB',
        'charcoal-50': '#F7F7F7',
        brass: {
          DEFAULT: '#C49A3C',
          light: '#F5EDD6',
          dark:  '#A07E2A',
        },
        'warm-gray': '#6B6B6B',
        'border-warm': '#E8E4DE',
        forest: {
          DEFAULT: '#2E705A',
          light: '#EBF5F0',
        },
        'soft-red': {
          DEFAULT: '#C05252',
          light: '#FEF2F2',
        },
      },
      fontFamily: {
        display: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        elevated:   '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
