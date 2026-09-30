export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111412',
        panel: '#181c19',
        line: '#292e2a',
        acid: '#d2f36b',
        mist: '#a6b0aa',
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
