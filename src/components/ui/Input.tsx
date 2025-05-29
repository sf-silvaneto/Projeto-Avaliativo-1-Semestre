import React, { forwardRef, InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    helperText, 
    error, 
    className, 
    fullWidth = true, 
    leftAddon, 
    rightAddon, 
    id, 
    ...props 
  }, ref) => {
    const inputId = id || Math.random().toString(36).substring(2, 9);

    const inputClasses = clsx(
      'form-input',
      {
        'border-error-500 focus:ring-error-500': error,
        'pl-10': leftAddon,
        'pr-10': rightAddon,
        'w-full': fullWidth,
      },
      className
    );

    return (
      <div className={clsx('form-control', { 'w-full': fullWidth })}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              {leftAddon}
            </div>
          )}
          
          <input id={inputId} className={inputClasses} ref={ref} {...props} />
          
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
              {rightAddon}
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
        
        {error && (
          <p className="form-error" id={`${inputId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;