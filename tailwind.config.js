/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Color System v3.1 — 힐링 중심 (브라운·크림 베이스)
        primary: {
          DEFAULT: '#FF8F7A',
          pressed: '#F07864',
          light: '#FFD0C6',
        },
        secondary: {
          DEFAULT: '#FF8F7A',
          pressed: '#F07864',
          light: '#FCE8C0',
        },
        accent: {
          DEFAULT: '#F4C85B',
          soft: '#FBECC4',
        },
        selected: '#8A5B44',
        taupe: '#B79A8A',
        sage: {
          DEFAULT: '#A9B69A',
          soft: '#E8EEE4',
        },
        background: '#F8F4EF',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5EDE6',
        },
        creamy: '#F6EFE5',
        peach: '#FFD0C6',
        sand: '#E9DCCF',
        beige: {
          DEFAULT: '#D9C7BA',
          50: '#FFFFFF',
          100: '#F8F4EF',
          200: '#E9DCCF',
          300: '#F5EDE6',
        },
        ink: {
          DEFAULT: '#7A5B45',
          soft: '#8E6F5C',
          disabled: '#B79A8A',
        },
        border: {
          DEFAULT: '#E9DCCF',
          divider: '#F1E9E0',
        },
        success: '#A9B69A',
        warning: '#FF8F7A',
        error: '#E57A72',
        coral: {
          DEFAULT: '#FF8F7A',
          soft: '#FFD0C6',
          deep: '#F07864',
        },
        yellow: {
          soft: '#FCE8C0',
          energy: '#FF8F7A',
          mission: '#F4C85B',
        },
        cocoa: {
          DEFAULT: '#7A5B45',
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
