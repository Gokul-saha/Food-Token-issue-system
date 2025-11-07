
import React, { ButtonHTMLAttributes } from 'react';

interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  size?: 'sm' | 'md';
}

export const NavButton: React.FC<NavButtonProps> = ({ isActive, children, className, size = 'md', ...props }) => {
    const baseClasses = "w-full text-center font-semibold transition-colors duration-200 rounded-md flex items-center justify-center";
    
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2"
    };

    const activeClasses = 'bg-indigo-600 text-white shadow';
    const inactiveClasses = 'bg-transparent text-slate-600 hover:bg-indigo-50';

    return (
        <button
            className={`${baseClasses} ${sizeClasses[size]} ${isActive ? activeClasses : inactiveClasses} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
   