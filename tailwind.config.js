module.exports = {
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }
      navbar: { min: '1024px', max: '1100px' },
      nbar100: { min: '1100px', max: '1210px' },

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }

      '3xl': '1816px',
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          primary: '#2a6eff',
          'primary-focus': '#a5b4fc',
          'primary-content': '#ffffff',

          secondary: '#f000b8',
          'secondary-focus': '#bd0091',
          'secondary-content': '#ffffff',

          accent: '#37cdbe',
          'accent-focus': '#2ba69a',
          'accent-content': '#ffffff',

          neutral: '#3b424e',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',

          'base-100': '#ffffff',
          'base-200': '#f9fafb',
          'base-300': '#ced3d9',
          'base-content': '#1e2734',

          '--custom': '#b2baff',

          info: '#a5b4fc',
          success: '#bbf7d0',
          warning: '#fef3c7',
          error: '#ff5724',

          '--rounded-box': '1rem',
          '--rounded-btn': '0.5rem',
          '--rounded-badge': '1.9rem',

          '--animation-btn': '0.25s',
          '--animation-input': '0.2s',

          '--btn-text-case': 'normalcase',
          '--navbar-padding': '0.5rem',
          '--border-btn': '1px',
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dracula]'],
          primary: '#6366f1',
          'primary-content': '#ffffff',
          'primary-focus': '#6366f1',

          'neutral-content': '#ffffff',
          warning: '#f59e0b',
          success: '#16a34a',

          '--custom': '#b2baff',
          '--btn-text-case': 'normalcase',
        },
      },
    ],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
