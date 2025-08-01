/**
 * Enhanced Button Component
 * Modern, accessible button with multiple variants and states
 */

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      rounded = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-medium',
      'transition-all',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-offset-transparent',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:pointer-events-none'
    ];

    const variantClasses = {
      primary: [
        'bg-gradient-to-r',
        'from-blue-600',
        'to-purple-600',
        'text-white',
        'hover:from-blue-700',
        'hover:to-purple-700',
        'focus:ring-blue-500',
        'shadow-lg',
        'hover:shadow-xl'
      ],
      secondary: [
        'bg-white/10',
        'backdrop-blur-xl',
        'text-white',
        'border',
        'border-white/20',
        'hover:bg-white/20',
        'focus:ring-white/50',
        'shadow-lg',
        'hover:shadow-xl'
      ],
      outline: [
        'border-2',
        'border-current',
        'text-blue-600',
        'hover:bg-blue-600',
        'hover:text-white',
        'focus:ring-blue-500',
        'bg-transparent'
      ],
      ghost: [
        'text-gray-700',
        'hover:bg-gray-100',
        'focus:ring-gray-500',
        'bg-transparent'
      ],
      destructive: [
        'bg-gradient-to-r',
        'from-red-600',
        'to-red-700',
        'text-white',
        'hover:from-red-700',
        'hover:to-red-800',
        'focus:ring-red-500',
        'shadow-lg',
        'hover:shadow-xl'
      ],
      success: [
        'bg-gradient-to-r',
        'from-green-600',
        'to-emerald-600',
        'text-white',
        'hover:from-green-700',
        'hover:to-emerald-700',
        'focus:ring-green-500',
        'shadow-lg',
        'hover:shadow-xl'
      ]
    };

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm', 'gap-1.5'],
      md: ['px-4', 'py-2', 'text-sm', 'gap-2'],
      lg: ['px-6', 'py-3', 'text-base', 'gap-2'],
      xl: ['px-8', 'py-4', 'text-lg', 'gap-3']
    };

    const roundedClasses = rounded ? 'rounded-full' : 'rounded-lg';
    const widthClasses = fullWidth ? 'w-full' : '';

    const allClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[size],
      roundedClasses,
      widthClasses,
      className
    ].join(' ');

    return (
      <button
        ref={ref}
        className={allClasses}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} />
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
