/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta de cores: Roxa, Branca, Preta, Verde e Cadenciadas
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Cores funcionais
        accent: 'var(--accent)',
        'accent-strong': 'var(--accent-strong)',
        'accent-soft': 'var(--accent-soft)',
        success: 'var(--success)',
        'success-strong': 'var(--success-strong)',
        'success-soft': 'var(--success-soft)',
        // Superfícies
        surface: {
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          muted: 'var(--surface-muted)',
          accent: 'var(--surface-accent)',
          dark: 'var(--surface-dark)',
        },
        // Textos
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
          accent: 'var(--text-accent)',
        },
        // Bordas
        border: {
          soft: 'var(--border-soft)',
          strong: 'var(--border-strong)',
          accent: 'var(--border-accent)',
        },
      },
      boxShadow: {
        'purple': 'var(--shadow-purple)',
        'green': 'var(--shadow-green)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-accent': 'var(--gradient-accent)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
    },
  },
  plugins: [],
}
