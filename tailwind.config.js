/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'terminal': ['"VT323"', 'monospace'],
        'mono': ['"IBM Plex Mono"', 'monospace']
      },
      colors: {
        'crt-bg': '#1a1a2e',
        'crt-text': '#dff9fb',
        'crt-amber': '#f3eba2',
        'crt-green': '#00ff41',
        'crt-cyan': '#00ffff',
        'crt-magenta': '#ff00ff',
        'crt-blue': '#4a48ff',
        'terminal-dark': '#0f0f23',
        'terminal-light': '#16213e'
      },
      animation: {
        'blink': 'blink 1s infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'flicker': 'flicker 0.15s infinite linear',
        'scanline': 'scanline 2s linear infinite'
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        glitch: {
          '0%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
          '100%': { transform: 'translate(0)' }
        },
        flicker: {
          '0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100%': { opacity: '0.99' },
          '20%, 21.999%, 63%, 63.999%, 65%, 69.999%': { opacity: '0.4' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' }
        }
      }
    },
  },
  plugins: [],
}
