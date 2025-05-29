import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    label, 
    helperText, 
    error, 
    className, 
    fullWidth = true, 
    id, 
    rows = 4, 
    ...props 
  }, ref) => {
    const textareaId = id || Math.random().toString(36).substring(2, 9);

    const textareaClasses = clsx(
      'form-input',
      {
        'border-error-500 focus:ring-error-500': error,
        'w-full': fullWidth,
      },
      className
    );

    return (
      <div className={clsx('form-control', { 'w-full': fullWidth })}>
        {label && (
          <label htmlFor={textareaId} className="form-label">
            {label}
          </label>
        )}
        
        <textarea 
          id={textareaId} 
          className={textareaClasses} 
          ref={ref} 
          rows={rows} 
          {...props} 
        />
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
        
        {error && (
          <p className="form-error" id={`${textareaId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;