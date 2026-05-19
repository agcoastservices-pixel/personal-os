import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WHOOP-style dark palette
        background: '#0a0a0c',
        surface:    '#101013',
        'surface-2':'#16161a',
        'surface-3':'#1e1e23',
        border:     'rgba(255,255,255,0.07)',
        'border-mid':'rgba(255,255,255,0.11)',
        // Status
        'w-green':  '#00c896',
        'w-amber':  '#f5a623',
        'w-red':    '#ff4757',
        'w-blue':   '#3d91ff',
        'w-purple': '#9b7cf8',
        primary:    '#3d91ff',
        accent:     '#9b7cf8',
      },
      fontSize: {
        'metric-xl': ['56px', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.02em' }],
        'metric-lg': ['40px', { lineHeight: '1', fontWeight: '800', letterSpacing: '-0.02em' }],
        'metric-md': ['28px', { lineHeight: '1', fontWeight: '700', letterSpacing: '-0.01em' }],
        'label':     ['10px', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.1em' }],
      },
      animation: {
        'fade-in':   'fadeIn 0.25s ease-out',
        'slide-up':  'slideUp 0.25s ease-out',
        'glow-green':'glowGreen 2.5s ease-in-out infinite alternate',
        'glow-blue': 'glowBlue 2.5s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { transform: 'translateY(6px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        glowGreen: { '0%': { boxShadow: '0 0 8px rgba(0,200,150,0.2)' }, '100%': { boxShadow: '0 0 20px rgba(0,200,150,0.45)' } },
        glowBlue:  { '0%': { boxShadow: '0 0 8px rgba(61,145,255,0.2)' }, '100%': { boxShadow: '0 0 20px rgba(61,145,255,0.45)' } },
      },
    },
  },
  plugins: [],
}

export default config
