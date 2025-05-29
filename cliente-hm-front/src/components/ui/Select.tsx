import React, { forwardRef, SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    options, 
    helperText, 
    error, 
    className, 
    fullWidth = true, 
    id, 
    ...props 
  }, ref) => {
    const selectId = id || Math.random().toString(36).substring(2, 9);

    const selectClasses = clsx(
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
          <label htmlFor={selectId} className="form-label">
            {label}
          </label>
        )}
        
        <select id={selectId} className={selectClasses} ref={ref} {...props}>
          <option value="" disabled>
            Selecione uma opção
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
        )}
        
        {error && (
          <p className="form-error" id={`${selectId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;