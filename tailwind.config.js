module.exports = {
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#570df8',
          'primary-focus': '#4506cb',
          'primary-content': '#ffffff',

          'secondary': '#f000b8',
          'secondary-focus': '#bd0091',
          'secondary-content': '#ffffff',

          'accent': '#37cdbe',
          'accent-focus': '#2ba69a',
          'accent-content': '#ffffff',

          'neutral': '#3b424e',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',

          'base-100': '#ffffff',
          'base-200': '#f9fafb',
          'base-300': '#ced3d9',
          'base-content': '#1e2734',

          'info': '#1c92f2',
          'success': '#009485',
          'warning': '#ff9900',
          'error': '#ff5724',

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
          'primary-content': '#ffffff',
          'neutral-content': '#ffffff',
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
