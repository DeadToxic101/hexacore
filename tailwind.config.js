/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/renderer/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        hex: {
          bg: '#05060a',
          panel: '#0a0e17',
          panel2: '#0e1320',
          border: '#1b2233',
          neon: '#00e5ff',
          neon2: '#0091ff',
          accent: '#7c3aed',
          danger: '#ff2d55',
          ok: '#00ffa3',
          text: '#dbe6f5',
          muted: '#6b7a90'
        }
      },
      boxShadow: {
        neon: '0 0 8px rgba(0,229,255,0.6), 0 0 24px rgba(0,145,255,0.35)',
        'neon-soft': '0 0 12px rgba(0,229,255,0.25)'
      },
      fontFamily: { display: ['Orbitron', 'system-ui', 'sans-serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
      keyframes: {
        rgb: { '0%,100%': { filter: 'hue-rotate(0deg)' }, '50%': { filter: 'hue-rotate(180deg)' } },
        pulseGlow: { '0%,100%': { opacity: '0.6' }, '50%': { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(-12px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } }
      },
      animation: {
        rgb: 'rgb 6s linear infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        slideIn: 'slideIn 0.25s ease-out'
      }
    }
  },
  plugins: []
}
