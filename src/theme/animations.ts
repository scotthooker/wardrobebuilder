/**
 * Animation Presets
 * Reusable animation configurations
 */

export const animations = {
  fadeIn: {
    animation: 'fadeIn 0.5s ease-out',
    keyframes: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
  },
  fadeInUp: {
    animation: 'fadeInUp 0.6s ease-out',
    keyframes: {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  fadeInDown: {
    animation: 'fadeInDown 0.5s ease-out',
    keyframes: {
      '0%': { opacity: 0, transform: 'translateY(-20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
  },
  slideInRight: {
    animation: 'slideInRight 0.4s ease-out',
    keyframes: {
      '0%': { opacity: 0, transform: 'translateX(-30px)' },
      '100%': { opacity: 1, transform: 'translateX(0)' },
    },
  },
  slideInLeft: {
    animation: 'slideInLeft 0.4s ease-out',
    keyframes: {
      '0%': { opacity: 0, transform: 'translateX(30px)' },
      '100%': { opacity: 1, transform: 'translateX(0)' },
    },
  },
  scaleIn: {
    animation: 'scaleIn 0.3s ease-out',
    keyframes: {
      '0%': { opacity: 0, transform: 'scale(0.9)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
  },
  pulseSubtle: {
    animation: 'pulseSubtle 2s ease-in-out infinite',
    keyframes: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.8 },
    },
  },
  shimmer: {
    animation: 'shimmer 2s linear infinite',
    keyframes: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
  },
  float: {
    animation: 'float 3s ease-in-out infinite',
    keyframes: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
  },
  glow: {
    animation: 'glow 2s ease-in-out infinite',
    keyframes: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
      '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)' },
    },
  },
} as const

export type Animations = typeof animations
