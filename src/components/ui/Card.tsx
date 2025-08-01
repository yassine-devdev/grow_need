/**
 * Enhanced Card Component
 * Modern card with glassmorphic design and multiple variants
 */

import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      padding = 'md',
      rounded = 'lg',
      shadow = 'md',
      hover = false,
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'transition-all',
      'duration-200',
      'ease-in-out'
    ];

    const variantClasses = {
      default: [
        'bg-white/10',
        'backdrop-blur-xl',
        'border',
        'border-white/20'
      ],
      elevated: [
        'bg-white',
        'border',
        'border-gray-200'
      ],
      outlined: [
        'bg-transparent',
        'border-2',
        'border-gray-300'
      ],
      filled: [
        'bg-gray-100',
        'border',
        'border-gray-200'
      ],
      glass: [
        'bg-white/5',
        'backdrop-blur-2xl',
        'border',
        'border-white/10',
        'shadow-2xl'
      ]
    };

    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    };

    const roundedClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    };

    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    };

    const hoverClasses = hover ? [
      'hover:shadow-xl',
      'hover:scale-[1.02]',
      'hover:bg-white/15'
    ] : [];

    const interactiveClasses = interactive ? [
      'cursor-pointer',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-blue-500',
      'focus:ring-offset-2',
      'focus:ring-offset-transparent'
    ] : [];

    const allClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      paddingClasses[padding],
      roundedClasses[rounded],
      shadowClasses[shadow],
      ...hoverClasses,
      ...interactiveClasses,
      className
    ].join(' ');

    return (
      <div
        ref={ref}
        className={allClasses}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 pb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', children, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', children, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-white/70 ${className}`}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center pt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;
