
import React, { HTMLAttributes } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success';
}

const variantClasses = {
  default: 'bg-slate-100 text-slate-900',
  destructive: 'bg-red-100 border-red-400 text-red-800',
  success: 'bg-green-100 border-green-400 text-green-800',
};

export const Alert: React.FC<AlertProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:text-foreground [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:translate-y-[-3px] [&:has(svg)]:pl-11 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
};

export const AlertTitle: React.FC<HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props} />
);

export const AlertDescription: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />
);
   