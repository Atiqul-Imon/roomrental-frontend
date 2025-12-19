/**
 * Enhanced Input Component
 * Phase 2: User Experience - Forms & Input
 * 
 * Provides floating labels, better validation, and improved UX
 */

'use client';

import { InputHTMLAttributes, useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label, BodySmall } from './Typography';
import { Tooltip } from './Tooltip';

interface EnhancedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  success?: boolean;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
  floatingLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function EnhancedInput({
  label,
  error,
  helperText,
  success,
  icon,
  showPasswordToggle,
  floatingLabel = false,
  size = 'md',
  fullWidth = true,
  className,
  type = 'text',
  value,
  ...props
}: EnhancedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputType, setInputType] = useState(type);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (type === 'password' && showPasswordToggle) {
      setInputType(showPassword ? 'text' : 'password');
    } else {
      setInputType(type);
    }
  }, [type, showPassword, showPasswordToggle]);

  const hasValue = value !== undefined && value !== null && value !== '';
  const isFloatingActive = floatingLabel && (isFocused || hasValue);

  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-5 text-lg',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('relative', fullWidth && 'w-full')}>
      {/* Label */}
      {label && !floatingLabel && (
        <div className="flex items-center gap-2 mb-2">
          <label htmlFor={props.id} className="font-ui text-sm font-medium leading-tight text-grey-700">
            {label}
          </label>
          {props.required && (
            <span className="text-error-500 text-xs">*</span>
          )}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icon (Left) */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-grey-400 pointer-events-none">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={inputType}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'w-full bg-white border-2 rounded-xl',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            sizeClasses[size],
            icon && 'pl-11',
            (showPasswordToggle || error || success) && 'pr-11',
            floatingLabel && 'pt-6',
            error
              ? 'border-error-300 focus:border-error-500 focus:ring-error-200'
              : success
              ? 'border-success-300 focus:border-success-500 focus:ring-success-200'
              : 'border-grey-300 focus:border-primary-500 focus:ring-primary-200',
            className
          )}
          {...props}
        />

        {/* Floating Label */}
        {floatingLabel && label && (
          <label
            htmlFor={props.id}
            className={cn(
              'absolute left-4 transition-all duration-200 pointer-events-none',
              isFloatingActive
                ? 'top-2 text-xs text-primary-600 font-medium'
                : 'top-1/2 -translate-y-1/2 text-grey-500',
              size === 'sm' && isFloatingActive && 'top-1.5',
              size === 'lg' && isFloatingActive && 'top-2.5',
              icon && 'left-11'
            )}
            onClick={() => inputRef.current?.focus()}
          >
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        {/* Status Icons (Right) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {error && (
            <Tooltip content={error} position="top">
              <AlertCircle className="w-5 h-5 text-error-500" />
            </Tooltip>
          )}
          {success && !error && (
            <CheckCircle className="w-5 h-5 text-success-500" />
          )}
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-grey-400 hover:text-grey-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="mt-2">
          {error ? (
            <BodySmall className="text-error-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </BodySmall>
          ) : (
            <BodySmall className="text-grey-500">{helperText}</BodySmall>
          )}
        </div>
      )}
    </div>
  );
}

