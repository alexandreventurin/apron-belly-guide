/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'sage-green': '#7A9E7E',
        'dusty-rose': '#C9857A',
        'neutral-muted': '#EBE7E0',
        'background': '#FAF7F2',
        'on-surface': '#2D2A26',
        'on-surface-variant': '#494551',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      fontSize: {
        'h1': ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.75', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.65', fontWeight: '400' }],
      },
      boxShadow: {
        'card': '0 20px 25px -5px rgba(45,42,38,0.04)',
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      typography: ({ theme }) => ({
        stone: {
          css: {
            '--tw-prose-body': theme('colors.on-surface'),
            '--tw-prose-headings': theme('colors.on-surface'),
            '--tw-prose-links': theme('colors.sage-green'),
            '--tw-prose-bold': theme('colors.on-surface'),
            '--tw-prose-counters': theme('colors.on-surface-variant'),
            '--tw-prose-bullets': theme('colors.sage-green'),
            '--tw-prose-hr': theme('colors.neutral-muted'),
            '--tw-prose-quotes': theme('colors.on-surface-variant'),
            '--tw-prose-quote-borders': theme('colors.sage-green'),
            '--tw-prose-th-borders': theme('colors.neutral-muted'),
            '--tw-prose-td-borders': theme('colors.neutral-muted'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
