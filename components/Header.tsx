
import React from 'react';
import { LogoIcon } from './ui/Icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <LogoIcon />
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                        Food Token System
                    </h1>
                </div>
                <div className="text-sm text-slate-500">
                    Admin Portal
                </div>
            </div>
        </header>
    );
};
   