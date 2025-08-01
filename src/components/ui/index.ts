/**
 * Modern UI Component Library Index
 * Exports all enhanced UI components for the GROW YouR NEED application
 */

// Core UI Components
export { default as Button } from './Button';
export type { ButtonProps } from './Button';

export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
export type { CardProps } from './Card';

export { default as Input } from './Input';
export type { InputProps } from './Input';

export { default as Modal, ModalHeader, ModalBody, ModalFooter } from './Modal';
export type { ModalProps } from './Modal';

export { default as ToastProvider, useToast, useToastHelpers } from './Toast';
export type { Toast } from './Toast';

// Existing Components (re-export for consistency)
export { default as GlassmorphicContainer } from './GlassmorphicContainer';
export { default as StatCard } from './StatCard';

// Component Variants and Types (removed duplicates)

// Utility Types
export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ComponentWithVariants<T extends string> extends ComponentBaseProps {
  variant?: T;
}

export interface ComponentWithSizes<T extends string> extends ComponentBaseProps {
  size?: T;
}

export interface ComponentWithStates<T extends string> extends ComponentBaseProps {
  state?: T;
}

// Common Variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type CardRounded = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type InputVariant = 'default' | 'filled' | 'outlined';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputState = 'default' | 'error' | 'success' | 'warning';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Theme Configuration
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Default Theme
export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

// Component Factory Functions (removed JSX to fix TypeScript compilation)
// These can be re-implemented as needed in individual components

// Pre-configured Component Variants (removed to fix compilation issues)
// These can be created as needed in individual components

// Utility Functions
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const mergeProps = <T extends Record<string, any>>(
  defaultProps: T,
  userProps: Partial<T>
): T => {
  return { ...defaultProps, ...userProps };
};

// Animation Utilities
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideIn: 'animate-in slide-in-from-right duration-200',
  slideOut: 'animate-out slide-out-to-right duration-200',
  zoomIn: 'animate-in zoom-in-95 duration-200',
  zoomOut: 'animate-out zoom-out-95 duration-200',
  scaleIn: 'animate-in scale-in-95 duration-200',
  scaleOut: 'animate-out scale-out-95 duration-200'
};

// Responsive Utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Accessibility Utilities
export const a11y = {
  srOnly: 'sr-only',
  focusVisible: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
  skipLink: 'absolute -top-full left-0 z-50 bg-white p-2 text-black focus:top-0'
};

// Component Status
export const componentStatus = {
  stable: ['Button', 'Card', 'Input', 'Modal', 'Toast', 'GlassmorphicContainer', 'StatCard'],
  beta: [],
  experimental: [],
  deprecated: []
} as const;
