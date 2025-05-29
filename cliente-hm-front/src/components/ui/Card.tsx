import React, { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  footer,
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx('card', className)} {...props}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-xl font-medium text-neutral-900">{title}</h2>}
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-6 pt-4 border-t border-neutral-200">{footer}</div>
      )}
    </div>
  );
};

export default Card;