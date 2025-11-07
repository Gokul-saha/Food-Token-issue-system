
import React, { LabelHTMLAttributes } from 'react';

export const Label: React.FC<LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => {
  return <label className={`block text-sm font-medium text-slate-700 mb-2 ${className}`} {...props} />;
};
   