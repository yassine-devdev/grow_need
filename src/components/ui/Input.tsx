/**
 * Enhanced Input Component
 * Modern input with glassmorphic design and validation states
 */

import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'error' | 'success' | 'warning';
  label?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      variant = 'default',
      inputSize = 'md',
      state = 'default',
      label,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      fullWidth = false,
      type = 'text',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);

    React.useEffect(() => {
      if (showPasswordToggle && type === 'password') {
        setInputType(showPassword ? 'text' : 'password');
      } else {
        setInputType(type);
      }
    }, [showPassword, type, showPasswordToggle]);

    const baseClasses = [
      'transition-all',
      'duration-200',
      'ease-in-out',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-offset-transparent',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    ];

    const variantClasses = {
      default: [
        'bg-white/10',
        'backdrop-blur-xl',
        'border',
        'border-white/20',
        'text-white',
        'placeholder-white/50',
        'focus:border-white/40',
        'focus:bg-white/15'
      ],
      filled: [
        'bg-gray-100',
        'border',
        'border-gray-300',
        'text-gray-900',
        'placeholder-gray-500',
        'focus:border-blue-500',
        'focus:bg-white'
      ],
      outlined: [
        'bg-transparent',
        'border-2',
        'border-gray-300',
        'text-gray-900',
        'placeholder-gray-500',
        'focus:border-blue-500'
      ]
    };

    const sizeClasses = {
      sm: ['px-3', 'py-1.5', 'text-sm'],
      md: ['px-4', 'py-2', 'text-sm'],
      lg: ['px-4', 'py-3', 'text-base']
    };

    const stateClasses = {
      default: ['focus:ring-blue-500'],
      error: [
        'border-red-500',
        'focus:border-red-500',
        'focus:ring-red-500',
        'text-red-900',
        'placeholder-red-400'
      ],
      success: [
        'border-green-500',
        'focus:border-green-500',
        'focus:ring-green-500'
      ],
      warning: [
        'border-yellow-500',
        'focus:border-yellow-500',
        'focus:ring-yellow-500'
      ]
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    const inputClasses = [
      ...baseClasses,
      ...variantClasses[variant],
      ...sizeClasses[inputSize],
      ...stateClasses[state],
      'rounded-lg',
      widthClasses,
      leftIcon ? 'pl-10' : '',
      (rightIcon || showPasswordToggle) ? 'pr-10' : '',
      className
    ].join(' ');

    const getStateIcon = () => {
      switch (state) {
        case 'error':
          return <AlertCircle className="text-red-500" size={16} />;
        case 'success':
          return <CheckCircle className="text-green-500" size={16} />;
        case 'warning':
          return <AlertCircle className="text-yellow-500" size={16} />;
        default:
          return null;
      }
    };

    const getHelperTextColor = () => {
      switch (state) {
        case 'error':
          return 'text-red-500';
        case 'success':
          return 'text-green-500';
        case 'warning':
          return 'text-yellow-500';
        default:
          return 'text-white/70';
      }
    };

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-white mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />
          
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                className="text-white/50 hover:text-white/70 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}
            {!showPasswordToggle && (rightIcon || getStateIcon())}
          </div>
        </div>
        
        {helperText && (
          <p className={`mt-1 text-xs ${getHelperTextColor()}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
