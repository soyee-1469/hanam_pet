/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Color System v2.0 — 다정한 동화
        primary: {
          DEFAULT: '#FA6F37',
          pressed: '#E85F2A',
          light: '#FFE4D6',
        },
        secondary: {
          DEFAULT: '#FBAE38',
          pressed: '#E89A28',
          light: '#FFF0D4',
        },
        accent: {
          DEFAULT: '#BB7E3F',
          soft: '#F3E4D0',
        },
        sage: {
          DEFAULT: '#A9B69A',
          soft: '#E8EEE4',
        },
        background: '#FFF9F3',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#FFF3E6',
        },
        creamy: '#FDDEAC',
        ink: {
          DEFAULT: '#5C3D2E',
          soft: '#8B6B55',
          disabled: '#C4A990',
        },
        border: {
          DEFAULT: '#F0E2D2',
          divider: '#F7EEE4',
        },
        success: '#A9B69A',
        warning: '#FBAE38',
        error: '#E57A72',
        // alias
        beige: {
          50: '#FFFFFF',
          100: '#FFF9F3',
          200: '#F0E2D2',
          300: '#FFF3E6',
        },
        coral: {
          DEFAULT: '#FA6F37',
          soft: '#FFE4D6',
          deep: '#E85F2A',
        },
        yellow: {
          soft: '#FFF0D4',
          energy: '#FA6F37',
          mission: '#FDDEAC',
        },
        cocoa: {
          DEFAULT: '#5C3D2E',
          soft: '#8B6B55',
          faint: '#C4A990',
          mute: '#C4A990',
        },
        done: {
          border: '#F0E2D2',
          fill: '#F3E8DC',
        },
      },
    },
  },
  plugins: [],
}
