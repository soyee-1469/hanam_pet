/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Color System v3.0 — 웜톤 힐링 팔레트
        primary: {
          DEFAULT: '#F47B4B',
          pressed: '#E06A3C',
          light: '#F7C4A3',
        },
        secondary: {
          DEFAULT: '#F5A23A',
          pressed: '#E08E28',
          light: '#FCE8C0',
        },
        accent: {
          DEFAULT: '#F4C85B',
          soft: '#FBECC4',
        },
        taupe: '#B79A8A',
        sage: {
          DEFAULT: '#B79A8A',
          soft: '#E9DCCF',
        },
        background: '#F8F4EF',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5EDE6',
        },
        creamy: '#F4C85B',
        peach: '#F7C4A3',
        sand: '#E9DCCF',
        beige: {
          DEFAULT: '#D9C7BA',
          50: '#FFFFFF',
          100: '#F8F4EF',
          200: '#E9DCCF',
          300: '#F5EDE6',
        },
        ink: {
          DEFAULT: '#5B3927',
          soft: '#8E6F5C',
          disabled: '#B79A8A',
        },
        border: {
          DEFAULT: '#E9DCCF',
          divider: '#F1E9E0',
        },
        success: '#A9B69A',
        warning: '#F5A23A',
        error: '#E57A72',
        coral: {
          DEFAULT: '#F47B4B',
          soft: '#F7C4A3',
          deep: '#E06A3C',
        },
        yellow: {
          soft: '#FCE8C0',
          energy: '#F47B4B',
          mission: '#F4C85B',
        },
        cocoa: {
          DEFAULT: '#5B3927',
          soft: '#8E6F5C',
          faint: '#B79A8A',
          mute: '#B79A8A',
        },
        done: {
          border: '#E9DCCF',
          fill: '#E9DCCF',
        },
      },
    },
  },
  plugins: [],
}
